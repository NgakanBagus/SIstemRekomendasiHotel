import numpy as np
import pandas as pd
import json
import sqlite3

conn = sqlite3.connect("D:/Proposal Sistem Hotel/backend/instance/hotels.db")
df_hotels = pd.read_sql("SELECT * FROM hotel", conn)
df_ratings = pd.read_sql("SELECT * FROM rating", conn)
conn.close()

df_hotels = df_hotels.rename(columns={
    "name": "Hotel Name",
    "facility": "Facility",
    "location": "location",
    "rating": "Rating",
    "room_type": "Room Type",
    "original_price": "Original price",
    "discount_price": "Price after discount"
})

df_hotels["Hotel Name"] = df_hotels["Hotel Name"].astype(str).str.strip().str.lower()

if len(df_ratings) > 0:
    print("Pakai collaborative dari tabel rating (user-based)")
    pivot = df_ratings.pivot_table(
        index="user_id",
        columns="hotel_id",
        values="rating"
    ).fillna(0)
else:
    print("Tabel rating kosong, pakai rating dari tabel hotel")
    pivot = pd.DataFrame()

id_to_name = dict(zip(df_hotels["id"], df_hotels["Hotel Name"]))
pivot.columns = [id_to_name.get(c, c) for c in pivot.columns]

data_hotels = set(df_hotels["Hotel Name"].values)

if len(pivot) > 0:
    pivot_hotels = set(pivot.columns)
    common_hotels = sorted(pivot_hotels & data_hotels)
else:
    common_hotels = sorted(data_hotels)

data_filtered = (
    df_hotels.drop_duplicates(subset="Hotel Name")
    .set_index("Hotel Name")
    .loc[common_hotels]
    .reset_index()
)

if len(pivot) > 0:
    pivot_filtered = pivot[common_hotels]
    rating_matrix = pivot_filtered.values.astype(float)
else:
    rating_matrix = data_filtered["Rating"].values.reshape(1, -1)

if len(pivot) > 0:
    if list(data_filtered["Hotel Name"]) != list(pivot_filtered.columns):
        data_filtered = (
            data_filtered.set_index("Hotel Name")
            .loc[pivot_filtered.columns]
            .reset_index()
        )

print("Sinkronisasi hotel selesai:", len(data_filtered))

#Content Based
cols_text = ["Facility", "location", "Room Type"]
data_filtered[cols_text] = data_filtered[cols_text].fillna("")

unique_words = sorted(set(" ".join(
      [" ".join(data_filtered[c].astype(str).str.lower()) for c in cols_text]
).split()))

word_to_idx = {w: i for i, w in enumerate(unique_words)}

tf = np.zeros((len(data_filtered), len(unique_words)))
for i, row in data_filtered.iterrows():
    text = " ".join([str(row[c]).lower() for c in cols_text])
    for w in text.split():
        if w in word_to_idx:
            tf[i, word_to_idx[w]] += 1

tf = tf / np.maximum(tf.sum(axis=1, keepdims=True), 1e-9)
df_word = np.sum(tf > 0, axis=0)
idf = np.log((1 + len(data_filtered)) / (1 + df_word)) + 1
tfidf = tf * idf
tfidf = tfidf / (np.sqrt((tfidf ** 2).sum(axis=1, keepdims=True)) + 1e-9)

for c in ["Rating", "Original price", "Price after discount"]:
    minv, maxv = data_filtered[c].min(), data_filtered[c].max()
    data_filtered[c + "_norm"] = (data_filtered[c] - minv) / (maxv - minv + 1e-9)

numerics = data_filtered[[
    "Rating_norm",
    "Original price_norm",
    "Price after discount_norm"
]].values

alpha_num = 0.8
final_matrix = np.hstack((tfidf, alpha_num * numerics))

def cosine_matrix(mat):
    norm = np.sqrt((mat ** 2).sum(axis=1, keepdims=True)) + 1e-9
    mat = mat / norm
    return np.dot(mat, mat.T)

content_sim = cosine_matrix(final_matrix)
print("Content similarity selesai")

#Collaborative
user_means = np.true_divide(
    rating_matrix.sum(1),
    (rating_matrix != 0).sum(1) + 1e-9
)
rating_centered = rating_matrix - user_means[:, None]

n = rating_centered.shape[1]
collab_sim = np.zeros((n, n))
for i in range(n):
    for j in range(n):
        dot = np.dot(rating_centered[:, i], rating_centered[:, j])
        norm = (
            np.sqrt(np.dot(rating_centered[:, i], rating_centered[:, i])) *
            np.sqrt(np.dot(rating_centered[:, j], rating_centered[:, j])) + 1e-9
        )
        collab_sim[i, j] = dot / norm

collab_sim = (collab_sim - collab_sim.min()) / (
    collab_sim.max() - collab_sim.min() + 1e-9
)
print("Collaborative similarity selesai")

#hybrid
def normalize_matrix(mat):
    return (mat - mat.min()) / (mat.max() - mat.min() + 1e-9)

content_sim = normalize_matrix(content_sim)
collab_sim = normalize_matrix(collab_sim)

density = np.count_nonzero(rating_matrix) / rating_matrix.size
alpha = 0.7 if density > 0.5 else 0.4

hybrid_sim = alpha * collab_sim + (1 - alpha) * content_sim
hybrid_sim = normalize_matrix(hybrid_sim)

print(f"Hybrid ICHM selesai (alpha={alpha:.2f})")

#Simpan Model
model = {
    "hybrid_sim": hybrid_sim.tolist(),
    "content_sim": content_sim.tolist(),
    "collab_sim": collab_sim.tolist(),

    "data_filtered": data_filtered[[
        "Hotel Name",
        "location",
        "Facility",
        "Room Type",
        "Rating",
        "Original price",       
        "Price after discount"     
    ]].to_dict(orient="records"),
}
with open("model/hybrid_model.json", "w") as f:
    json.dump(model, f)

print("Model berhasil disimpan dalam format JSON")