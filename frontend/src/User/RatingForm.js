import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function RatingForm() {
    const location = useLocation();
    const navigate = useNavigate();

    const hotel_id = location.state?.hotel_id;
    const user_id = localStorage.getItem("user_id");

    const [rating, setRating] = useState("");
    const [message, setMessage] = useState("");

    if (!hotel_id) {
        return (
            <div className="pt-24 text-center text-red-600">
                Hotel tidak dipilih
            </div>
        );
    }

    const submitRating = async (e) => {
        e.preventDefault();

        const res = await fetch("http://127.0.0.1:5000/api/rating", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: Number(user_id),
                hotel_id: Number(hotel_id),
                rating: Number(rating)
            })
        });

        const data = await res.json();
        setMessage(data.message);

        // Kembali ke daftar hotel
        setTimeout(() => {
            navigate("/hotels");
        }, 1500);
    };

    return (
        <div className="pt-24 max-w-lg mx-auto px-6">
            <h1 className="text-3xl font-bold mb-6">
                Tambah / Edit Rating
            </h1>

            <form onSubmit={submitRating} className="space-y-4">
                <input
                    type="number"
                    placeholder="Rating (1-5)"
                    className="w-full border p-2 rounded"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    min="1"
                    max="5"
                    required
                />

                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Simpan Rating
                </button>
            </form>

            {message && (
                <p className="mt-4 p-3 bg-green-100 text-green-700 rounded">
                    {message}
                </p>
            )}
        </div>
    );
}

export default RatingForm;
