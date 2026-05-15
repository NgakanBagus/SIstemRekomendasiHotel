from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import json
import numpy as np
import os
from werkzeug.utils import secure_filename
import subprocess
from sqlalchemy.sql import func
import re
from flask_login import ( LoginManager, login_user, login_required, logout_user, current_user, UserMixin)
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False,  
)
CORS(app, supports_credentials=True)  

UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hotels.db'
app.secret_key = 'rekomendasi_hotel_secret'
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), default="user")

    address = db.Column(db.String(255))
    phone = db.Column(db.String(20))
    photo = db.Column(db.String(255))

class Hotel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150))
    location = db.Column(db.String(150))
    facility = db.Column(db.String(500))
    room_type = db.Column(db.String(500))
    rating = db.Column(db.Float)
    original_price = db.Column(db.Float)
    discount_price = db.Column(db.Float)
    image = db.Column(db.String(200))

class Rating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    hotel_id = db.Column(db.Integer)
    rating = db.Column(db.Float)

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    hotel_id = db.Column(db.Integer, db.ForeignKey("hotel.id"), nullable=True)
    satisfaction = db.Column(db.String(50))  
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.now())
    user = db.relationship("User", backref="feedbacks")
    hotel = db.relationship("Hotel", backref="feedbacks")

with open("model/hybrid_model.json") as f:
    model_json = json.load(f)

hybrid_sim = np.array(model_json["hybrid_sim"])
data_filtered = model_json["data_filtered"]

print("Model JSON berhasil dimuat")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def normaliz(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())

def hotel_image(name):
    dir_hotel = os.path.join(BASE_DIR, "static", "hotel")

    if not os.path.exists(dir_hotel):
        return "default.jpg"
    
    target = normaliz(name)

    for file in os.listdir(dir_hotel):
        fname, ext = os.path.splitext(file)
        if normaliz(fname) == target and ext.lower() in [".jpg", ".jpeg", ".png"]:
            return file
        
    return "default.jpg"

with app.app_context():

    db.create_all()

    if Hotel.query.count() == 0:
        for row in data_filtered:
            image_name = hotel_image(row["Hotel Name"])
            db.session.add(
                Hotel(
                    name=row["Hotel Name"],
                    location=row["location"],
                    room_type=row.get("Room Type", "-"),
                    facility=row["Facility"],
                    rating=row["Rating"],
                    original_price=row["Original price"],
                    discount_price=row["Price after discount"],
                    image=image_name
                )
            )
        db.session.commit()
        print("✅ Data hotel berhasil dimasukkan ke database.")

    if not User.query.filter_by(username="admin").first():
        admin = User(
            username="admin",
            email="admin@example.com",
            password=generate_password_hash("admin123"),
            role="admin"
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin dibuat")

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({
        "success": False,
        "message": "Unauthorized"
    }), 401

# ---------------- LOGIN ----------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(username=data["username"]).first()

    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"success": False, "message": "Login gagal"}), 400
    
    login_user(user)

    return jsonify({
        "success": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role
        }
    })

@app.route("/api/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True, "message": "Logout berhasil"})

# ---------------- REGISTER ----------------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"success": False, "message": "Username sudah ada"}), 400
    
    hashed_password = generate_password_hash(data["password"])
    
    new_user = User(
        username=data["username"],
        email=data["email"],
        password=hashed_password
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"success": True, "message": "Registrasi berhasil"})

# ---------------- RECOMMENDATION ----------------
@app.route("/api/recommend", methods=["POST"])
def recommend():

    data = request.json

    min_price = float(data.get("min_price", 0))
    max_price = float(data.get("max_price", 999999))
    min_rating = float(data.get("min_rating", 0))
    location = data.get("location", "").lower()
    facilities = data.get("facility", [])
    room_types = data.get("room_type", [])

    scores = []

    for i, h in enumerate(data_filtered):

        if not (min_price <= h["Price after discount"] <= max_price):
            continue

        if h["Rating"] < min_rating:
            continue

        score = 0

        if location.lower() in str(h["location"]).lower():
            score += 2

        for facility in facilities:
            if facility.lower() in str(h["Facility"]).lower():
                score += 2

        for room in room_types:
            if room.lower() in str(h["Room Type"]).lower():
                score += 1

        score += h["Rating"] / 10

        h["score"] = round(score, 3)

        scores.append((score, h))

    scores = sorted(
        scores,
        key=lambda x: (x[0], x[1]["Rating"]),
        reverse=True
    )

    results = [h for score, h in scores[:10]]

    return jsonify({
        "success": True,
        "results": results
    })

# ---------------- FILTER OPTIONS ----------------
import re

@app.route("/api/options", methods=["GET"])
def dropdown():

    # LOCATION
    locations = sorted({
        h["location"].strip()
        for h in data_filtered
        if h.get("location")
    })

    # FACILITIES (AUTO CLEAN)
    facilities = set()

    for h in data_filtered:
        if not h.get("Facility"):
            continue

        for f in h["Facility"].split(","):
            f = f.lower().strip()

            # hapus simbol seperti - / ()
            f = re.sub(r'[^a-z0-9\s]', '', f)

            # rapikan spasi
            f = re.sub(r'\s+', ' ', f)

            if f:
                facilities.add(f)

    facilities = sorted(facilities)

    # ROOM TYPES (AUTO CLEAN)
    room_types = set()

    for h in data_filtered:
        if not h.get("Room Type"):
            continue

        for r in h["Room Type"].split(","):
            r = r.lower().strip()

            r = re.sub(r'[^a-z0-9\s]', '', r)
            r = re.sub(r'\s+', ' ', r)

            if r:
                room_types.add(r)

    room_types = sorted(room_types)

    return jsonify({
        "locations": list(locations),
        "facilities": facilities,
        "room_types": room_types
    })

# ---------------- LIST HOTEL ----------------
@app.route("/api/hotels", methods=["GET"])
def get_hotels():
    hotels = Hotel.query.all()
    result = []

    for h in hotels:
        result.append({
            "id": h.id,
            "name": h.name,
            "location": h.location,
            "room_type": h.room_type,
            "facility": h.facility,
            "rating": h.rating,
            "original_price": h.original_price,
            "discount_price": h.discount_price,
            "image": f"http://localhost:5000/static/hotel/{h.image}" if h.image else None
        })

    return jsonify(result)

# ---------------- RATING ----------------
@app.route("/api/rating", methods=["POST"])
def rating():
    data = request.json

    user_id = data["user_id"]
    hotel_id = data["hotel_id"]
    rating = data["rating"]

    r = Rating.query.filter_by(user_id=user_id, hotel_id=hotel_id).first()
    if r:
        r.rating = rating
    else:
        new_rating = Rating(user_id=user_id, hotel_id=hotel_id, rating=rating)
        db.session.add(new_rating)

    db.session.commit()

    hotel = Hotel.query.get(hotel_id)
    all_rating = Rating.query.filter_by(hotel_id=hotel_id).all()

    if all_rating:
        avg_user_rating = sum(r.rating for r in all_rating) / len(all_rating)
        final_rating = (hotel.rating + avg_user_rating) / 2
        hotel.rating = round(final_rating, 2)

    db.session.commit()
    return jsonify({
        "success": True,
        "message": "Rating berhasil dibuat"
    })

    return jsonify({"success": True, "message": "Rating disimpan"})

# ---------------- PROFILE ----------------
@app.route("/api/profile/<int:user_id>", methods=["GET", "POST"])
def profile(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"success": False, "message": "User tidak ditemukan"}), 404

    if request.method == "POST":
        user.username = request.form.get("username")
        user.email = request.form.get("email")
        new_password = request.form.get("password")
        if new_password:
            user.password = generate_password_hash(new_password)
        user.address = request.form.get("address")
        user.phone = request.form.get("phone")

        if "photo" in request.files:
            file = request.files["photo"]
            if file.filename != "":
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                file.save(filepath)
                user.photo = filename

        db.session.commit()
        return jsonify({"success": True})

    return jsonify({
        "username": user.username,
        "email": user.email,
        "address": user.address,
        "phone": user.phone,
        "photo": user.photo
    })

@app.route("/api/eda", methods=["GET"])
def eda():
    prices = [h["Price after discount"] for h in data_filtered]
    ratings = [h["Rating"] for h in data_filtered]
    price_distribution = {
        "< 300K": 0,
        "300K - 600K": 0,
        "600K - 1JT": 0,
        "> 1JT": 0
    }

    for p in prices:
        if p < 300000:
            price_distribution["< 300K"] += 1
        elif p < 600000:
            price_distribution["300K - 600K"] += 1
        elif p < 1000000:
            price_distribution["600K - 1JT"] += 1
        else:
            price_distribution["> 1JT"] += 1

    location_count = {}
    for h in data_filtered:
        loc = h["location"]
        location_count[loc] = location_count.get(loc, 0) + 1

    top_locations = dict(
        sorted(location_count.items(), key=lambda x: x[1], reverse=True)[:10]
    )

    room_count = {}
    for h in data_filtered:
        rooms = str(h["Room Type"]).lower().split(',')
        for r in rooms:
            r = r.strip()
            room_count[r] = room_count.get(r, 0) + 1

    top_rooms = dict(
        sorted(room_count.items(), key=lambda x: x[1], reverse=True)[:10]
    )

    return jsonify({
        "price_distribution": price_distribution,
        "rating_distribution": ratings,
        "hotel_per_location": location_count,
        "top_10_locations": top_locations,
        "top_10_room_types": top_rooms
    })

@app.route("/api/feedback", methods=["POST"])
@login_required
def feedback():
    data = request.json
    new_feedback = Feedback(
        user_id=current_user.id,
        satisfaction=data["rating"],
        comment=data["comment"]
    )
    db.session.add(new_feedback)
    db.session.commit()
    return {"status": "ok"}, 200


# ---------------- ADMIN ----------------
@app.route("/api/admin", methods=["GET"])
def admin():
    users = User.query.all()
    hotels = Hotel.query.all()

    return jsonify({
        "users": [u.username for u in users],
        "hotels": [h.name for h in hotels]
    })

@app.route("/api/admin/users", methods=["GET"])
def admin_get_users():
    users = User.query.all()
    result = [{
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role
    } for user in users]
    return jsonify({"success": True, "users": result})

@app.route("/api/admin/users", methods=["POST"])
def adminadd_user():
    data = request.json

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"success": False, "message": "Username ada"}), 400
    
    new_user = User(
        username=data["username"],
        email=data["email"],
        password=data["password"],
        role=data.get("role", "user")  
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"success": True, "message": "User berhasil ditambahkan"})

@app.route("/api/admin/users/<int:user_id>", methods=["DELETE"])
def admindelete_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"success": False, "message": "User tidak ditemukan"}), 404

    if user.username == "admin":
        return jsonify({"success": False, "message": "Admin utama tidak boleh dihapus"}), 403

    db.session.delete(user)
    db.session.commit()

    return jsonify({"success": True, "message": "User berhasil dihapus"})

@app.route("/api/admin/hotels", methods=["POST"])
def add_hotel():
    try: 
        name = request.form.get("name")
        location = request.form.get("location")
        facility = request.form.get("facility")
        room_type = request.form.get("room_type")
        rating = request.form.get("rating")
        original_price = request.form.get("original_price")
        discount_price = request.form.get("discount_price")

        if not all([name, location, facility, rating, original_price, discount_price]):
            return jsonify({
                "success": False,
                "message": "Semua field wajib diisi!"
            }), 400
        
        try:
            rating = float(rating)
            original_price = float(original_price)
            discount_price = float(discount_price)
        except:
            return jsonify({
                "success": False,
                "message": "Format angka tidak valid!"
            }), 400

        image_file = request.files.get("image")
        filename = None

        if image_file:
            filename = secure_filename(image_file.filename)
            image_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            image_file.save(image_path)

        h = Hotel(
            name=name,
            location=location,
            room_type=room_type,
            facility=facility,
            rating=float(rating),
            original_price=float(original_price),
            discount_price=float(discount_price),
            image=filename
        )

        db.session.add(h)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Hotel berhasil ditambahkan"
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route("/api/admin/hotels/<int:id>", methods=["DELETE"])
def delete_hotel(id):
    h = Hotel.query.get(id)
    if not h:
        return jsonify({"success": False, "message": "Hotel tidak ditemukan"}), 404
    db.session.delete(h)
    db.session.commit()
    return jsonify({"success": True, "message": "Hotel dihapus"})

@app.route("/api/admin/hotels/<int:id>", methods=["PUT"])
def update_hotel_price(id):
    data = request.json
    hotel = Hotel.query.get(id)
    if not hotel:
        return jsonify({"message": "Hotel tidak ditemukan"}), 404
    
    hotel.original_price = data.get("original_price")
    hotel.discount_price = data.get("discount_price")

    db.session.commit()
    return jsonify({"message": "Hotel diupdate"})

def load_model():
    global MODEL, hybrid_sim, data_filtered, evaluation

    with open("model/hybrid_model.json", "r") as f:
        MODEL = json.load(f)

    hybrid_sim = np.array(MODEL["hybrid_sim"])
    data_filtered = MODEL["data_filtered"]
    evaluation = MODEL.get("evaluation", {})

    print("Model berhasil dimuat")
    if evaluation:
        print(f"Akurasi: {evaluation.get('accuracy')}, MAE: {evaluation.get('mae')}")


load_model()

@app.route("/api/admin/retrain", methods=["POST"])
def retrain():
    try:
        subprocess.run(["python", "retrainmodel.py"], check=True)
        load_model()
        evaluation = MODEL.get("evaluation", {})
        return jsonify({"success": True, 
                        "message": "Model diretrain & dimuat ulang", 
                        "accuracy":evaluation.get("accuracy"),
                        "mae": evaluation.get("mae")
                    })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route("/api/admin/feedbacks", methods=["GET"])
def get_all_feedbacks():
    feedbacks = (
        db.session.query(
            Feedback.id,
            Feedback.satisfaction,
            Feedback.comment,
            Feedback.created_at,
            User.username
        )
        .outerjoin(User, Feedback.user_id == User.id)  
        .order_by(Feedback.created_at.desc())
        .all()
    )

    result = []
    for f in feedbacks:
        result.append({
            "id": f.id,
            "username": f.username,
            "satisfaction": f.satisfaction,
            "comment": f.comment,
            "created_at": f.created_at.strftime("%Y-%m-%d %H:%M")
        })

    return jsonify({
        "success": True,
        "feedbacks": result
    })

if __name__ == "__main__":
    app.run(debug=True)