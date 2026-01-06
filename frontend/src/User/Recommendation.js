import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";

function Recommendation() {
    const [pref, setPref] = useState({
        min_price: "",
        max_price: "",
        min_rating: "",
        location: "",
        facility: ""
    });

    const [results, setResults] = useState([]);
    const [locations, setLocations] = useState([])
    const [facilities, setFacilities] = useState([])

    useEffect(() => {
        axios.get("http://localhost:5000/api/options")
            .then(res => {
                setLocations(res.data.locations)
                setFacilities(res.data.facilities)
            })
    }, [])

    const submitForm = async (e) => {
        e.preventDefault();

        const payload = {
            min_price: pref.min_price ? Number(pref.min_price) : 0,
            max_price: pref.max_price ? Number(pref.max_price) : 999999,
            min_rating: pref.min_rating ? Number(pref.min_rating) : 0,
            location: pref.location,
            facility: pref.facility
        };

        const res = await axios.post(
            "http://localhost:5000/api/recommend",
            payload
        );

        setResults(res.data.results);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-4xl mx-auto pt-20 p-4">
                <h2 className="text-3xl font-bold mb-4">Rekomendasi Hotel</h2>

                <form onSubmit={submitForm} className="bg-white p-6 rounded-xl shadow mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input className="input" placeholder="Min Price"
                            onChange={(e) => setPref({ ...pref, min_price: e.target.value })} />

                        <input className="input" placeholder="Max Price"
                            onChange={(e) => setPref({ ...pref, max_price: e.target.value })} />

                        <input className="input" placeholder="Min Rating"
                            onChange={(e) => setPref({ ...pref, min_rating: e.target.value })} />

                        <select className="input" onChange={(e) => setPref({...pref, locations: e.target.value})}> 
                            <option value="">Lokasi: </option>
                            {locations.map((loc, i) => (
                                <option key={i} value={loc}>{loc}</option>
                            ))}
                        </select>

                        <select className="input" onChange={(e) => setPref({...pref, facility: e.target.value})}> 
                            <option value="">Fasilitas: </option>
                            {facilities.map((f, i) => (
                                <option key={i} value={f}>{f}</option>
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
                            <p>Lokasi: {h.location}</p>
                            <p>Rating: ⭐ {h.Rating}</p>
                            <p>Harga: Rp {h["Price after discount"]}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Recommendation;
