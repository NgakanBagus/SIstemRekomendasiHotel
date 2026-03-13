import React, { useEffect, useState, useCallback } from "react";
import {useNavigate} from "react-router-dom"

function Hotels() {
    const [hotels, setHotels] = useState([]);
    const navigate = useNavigate()
    const user_id = localStorage.getItem("user_id")
    const [search, setSearch] = useState("")
    const [keyword, setKeyword] = useState("")

    const filterHotels = keyword
      ? hotels.filter((h) =>
          h.name.toLowerCase().includes(keyword.toLowerCase()) ||
          h.location.toLowerCase().includes(keyword.toLowerCase()) ||
          h.facility?.toLowerCase().includes(keyword.toLowerCase())
        )
      : hotels;

    const fetchHotels = useCallback(async() => {
        const res = await fetch(`http://localhost:5000/api/hotels?user_id=${user_id}`);
        const data = await res.json();
        setHotels(data);
    }, [user_id]);

    useEffect(() => {
        fetchHotels();
    }, [fetchHotels]);

    const rupiah = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(value)

    return (
        <div className="pt-24 max-w-5xl mx-auto px-6">
            <h1 className="text-3xl font-bold mb-6">Daftar Hotel</h1>
            <div className="flex items-center gap-2 mb-4">
                <input
                type="text"
                placeholder="Cari hotel (nama / lokasi / fasilitas)..."
                className="border p-2 rounded w-72"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                />

                <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() =>setKeyword(search)}
                >
                Search
                </button>

                <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={() => {
                    setSearch("")
                    setKeyword("")
                }}
                >
                Reset
                </button>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filterHotels.map((hotel) => (
                    <div key={hotel.id} className="border rounded-lg p-4 shadow-sm bg-white">
                        {hotel.image && (
                            <img 
                            src={hotel.image}
                            alt={hotel.name}
                            className="w-full h-48 object-cover rounded-md mb-3"
                            onError={(e) => {
                                e.target.src = "http://localhost:5000/static/hotel/default.jpg"
                            }}>
                            </img>
                        )}
                        <h2 className="text-xl font-semibold">{hotel.name}</h2>
                        <p className="text-gray-600">{hotel.location}</p>
                        <p className="mt-2"><strong>Fasilitas:</strong> {hotel.facility}</p>
                        <p className="mt-2"><strong>Room Type:</strong> {hotel.room_type}</p>
                        <p className="mt-2">Rating: {hotel.rating ?? "Belum ada rating"}</p>
                        
                        <div className="mt-3">
                            {hotel.original_price && 
                                hotel.discount_price && 
                                    hotel.original_price !== hotel.discount_price && (
                                <p className="text-sm text-gray-500 line-through">
                                    {rupiah(hotel.original_price)}
                                </p>
                            )}

                            <p className="text-lg font-semibold text-green-600">
                                {rupiah(hotel.discount_price)}
                            </p>
                        </div>
                        
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
