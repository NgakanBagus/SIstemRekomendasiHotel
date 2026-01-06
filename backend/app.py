from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import json
import numpy as np
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  

UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hotels.db'
app.secret_key = 'rekomendasi_hotel_secret'
db = SQLAlchemy(app)

class User(db.Model):
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
    rating = db.Column(db.Float)
    price = db.Column(db.Float)

class Rating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    hotel_id = db.Column(db.Integer)
    rating = db.Column(db.Float)

with open("model/hybrid_model.json") as f:
    model_json = json.load(f)

hybrid_sim = np.array(model_json["hybrid_sim"])
data_filtered = model_json["data_filtered"]

print("✅ Model JSON berhasil dimuat.")

with app.app_context():

    db.create_all()

    if Hotel.query.count() == 0:
        for row in data_filtered:
            db.session.add(
                Hotel(
                    name=row["Hotel Name"],
                    location=row["location"],
                    facility=row["Facility"],
                    rating=row["Rating"],
                    price=row["Price after discount"]
                )
            )
        db.session.commit()
        print("✅ Data hotel berhasil dimasukkan ke database.")

    if not User.query.filter_by(username="admin").first():
        admin = User(
            username="admin",
            email="admin@example.com",
            password="admin123",
            role="admin"
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin dibuat")

# ---------------- LOGIN ----------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(
        username=data["username"],
        password=data["password"]
    ).first()

    if not user:
        return jsonify({"success": False, "message": "Login gagal"}), 400

    return jsonify({
        "success": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role
        }
    })

# ---------------- REGISTER ----------------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"success": False, "message": "Username sudah ada"}), 400
    
    new_user = User(
        username=data["username"],
        email=data["email"],
        password=data["password"]
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
    facility = data.get("facility", "").lower()

    # Filter berdasarkan preferensi
    filtered = [] 
    for h in data_filtered: 
        if not (min_price <= h["Price after discount"] <= max_price): 
            continue 
        if h["Rating"] < min_rating: 
            continue 
        if location not in h["location"].lower(): 
            continue 
        if facility not in h["Facility"].lower(): 
            continue 
        filtered.append(h)

    return jsonify({
        "success": True,
        "results": filtered[:10]  # kirim 10 rekomendasi
    })

# ---------------- FILTER OPTIONS ----------------
@app.route("/api/options", methods=["GET"])
def dropdown():
    locations = sorted(list(set(
        h["location"] for h in data_filtered
        if h.get("location") 
    )))

    facilities = sorted(list(set(
        f.strip()
        for h in data_filtered
        for f in h["Facility"].split(",")
        if h.get("Facility")
    )))

    return jsonify({
        "locations": locations,
        "facilities": facilities
    })

# ---------------- LIST HOTEL ----------------
@app.route("/api/hotels", methods=["GET"])
def get_hotels():
    hotels = Hotel.query.all()
    result = [{
        "id": h.id,
        "name": h.name,
        "location": h.location,
        "facility": h.facility,
        "rating": h.rating,
        "price": h.price
    } for h in hotels]

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
        user.password = request.form.get("password")
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
        "password": user.password,
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

# ---------------- ADMIN ----------------
@app.route("/api/admin", methods=["GET"])
def admin():
    users = User.query.all()
    hotels = Hotel.query.all()

    return jsonify({
        "users": [u.username for u in users],
        "hotels": [h.name for h in hotels]
    })


# ============================================
# RUN SERVER
# ============================================
if __name__ == "__main__":
    app.run(debug=True)