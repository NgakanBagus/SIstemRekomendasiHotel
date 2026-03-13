import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";

function Recommendation() {
    const [pref, setPref] = useState({
        min_price: "",
        max_price: "",
        min_rating: "",
        location: "",
        facility: "",
        room_type: ""
    });

    const [results, setResults] = useState([]);
    const [locations, setLocations] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/options")
            .then(res => {
                setLocations(res.data.locations || []);
                setFacilities(res.data.facilities || []);
                setRoomTypes(res.data.room_types || []);
            });
    }, []);

    const submitForm = async (e) => {
        e.preventDefault();

        const payload = {
            min_price: pref.min_price ? Number(pref.min_price) : 0,
            max_price: pref.max_price ? Number(pref.max_price) : 99999999,
            min_rating: pref.min_rating ? Number(pref.min_rating) : 0,
            location: pref.location,
            facility: pref.facility,
            room_type: pref.room_type
        };

        const res = await axios.post(
            "http://localhost:5000/api/recommend",
            payload
        );

        setResults(res.data.results || []);
    };

    const rupiah = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(value);

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-4xl mx-auto pt-20 p-4">
                <h2 className="text-3xl font-bold mb-4">Rekomendasi Hotel</h2>

                <form onSubmit={submitForm} className="bg-white p-6 rounded-xl shadow mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            className="input"
                            placeholder="Min Price"
                            value={pref.min_price}
                            onChange={(e) => setPref({ ...pref, min_price: e.target.value })}
                        />

                        <input
                            className="input"
                            placeholder="Max Price"
                            value={pref.max_price}
                            onChange={(e) => setPref({ ...pref, max_price: e.target.value })}
                        />

                        <input
                            className="input"
                            placeholder="Min Rating"
                            value={pref.min_rating}
                            onChange={(e) => setPref({ ...pref, min_rating: e.target.value })}
                        />

                        <select
                            className="input"
                            value={pref.location}
                            onChange={(e) => setPref({ ...pref, location: e.target.value })}
                        >
                            <option value="">Semua Lokasi</option>
                            {locations.map((loc, i) => (
                                <option key={i} value={loc}>{loc}</option>
                            ))}
                        </select>

                        <select
                            className="input"
                            value={pref.facility}
                            onChange={(e) => setPref({ ...pref, facility: e.target.value })}
                        >
                            <option value="">Semua Fasilitas</option>
                            {facilities.map((f, i) => (
                                <option key={i} value={f}>{f}</option>
                            ))}
                        </select>

                        <select
                            className="input"
                            value={pref.room_type}
                            onChange={(e) => setPref({ ...pref, room_type: e.target.value })}
                        >
                            <option value="">Semua Tipe Kamar</option>
                            {roomTypes.map((rt, i) => (
                                <option key={i} value={rt}>{rt}</option>
                            ))}
                        </select>
                    </div>

                    <button className="mt-4 bg-blue-600 text-white p-2 rounded">
                        Cari Rekomendasi
                    </button>
                </form>

                <h3 className="text-2xl font-semibold mb-3">Hasil Rekomendasi</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((h, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow">
                            <h4 className="text-lg font-bold">{h["Hotel Name"]}</h4>
                            <p><strong>Lokasi: </strong>{h.location}</p>
                            <p><strong>Tipe Kamar: </strong>{h["Room Type"] || "-"}</p>
                            <p><strong>Fasilitas: </strong>{h["Facility"] || "-"}</p>
                            <p><strong>Rating: </strong> ⭐{h.Rating}</p>

                            <div className="mt-3">
                                {h["Original price"] !== h["Price after discount"] && (
                                    <p className="text-sm text-gray-500 line-through">
                                        {rupiah(h["Original price"])}
                                    </p>
                                )}

                                <p className="text-lg font-semibold text-green-600">
                                    {rupiah(h["Price after discount"])}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Recommendation;
