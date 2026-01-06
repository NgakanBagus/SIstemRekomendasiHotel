import React, { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom"

function Hotels() {
    const [hotels, setHotels] = useState([]);
    const navigate = useNavigate()

    const fetchHotels = async () => {
        const res = await fetch("http://localhost:5000/api/hotels");
        const data = await res.json();
        setHotels(data);
    };

    useEffect(() => {
        fetchHotels();
    }, []);

    return (
        <div className="pt-24 max-w-5xl mx-auto px-6">
            <h1 className="text-3xl font-bold mb-6">Daftar Hotel</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hotels.map((hotel) => (
                    <div key={hotel.id} className="border rounded-lg p-4 shadow-sm bg-white">
                        <h2 className="text-xl font-semibold">{hotel.name}</h2>
                        <p className="text-gray-600">{hotel.location}</p>
                        <p className="mt-2"><strong>Fasilitas:</strong> {hotel.facility}</p>
                        <p className="mt-2">⭐ Rating: {hotel.rating ?? "Belum ada rating"}</p>
                        <p className="mt-2">💰 Harga: Rp {hotel.price}</p>
                        <button
                            onClick={() =>
                                navigate("/rating", {
                                    state: { hotel_id: hotel.id }
                                })
                            }
                            className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                        >
                            {hotel.rating ? "Edit Rating" : "Beri Rating"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Hotels;
