import React, { useEffect, useState } from "react";
import NavbarAdmin from "../Components/NavbarAdmin";

function AdminHotels() {
    const [hotels, setHotels] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/hotels")
            .then(res => res.json())
            .then(data => setHotels(data));
    }, []);

    return (
        <div className="p-6">
            <NavbarAdmin />
            <h1 className="text-2xl font-bold mb-4">Data Hotel</h1>

            <table className="w-full border">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2">Nama</th>
                        <th className="p-2">Lokasi</th>
                        <th className="p-2">Rating</th>
                        <th className="p-2">Harga</th>
                    </tr>
                </thead>

                <tbody>
                    {hotels.map((h, i) => (
                        <tr key={i} className="border">
                            <td className="p-2">{h.name}</td>
                            <td className="p-2">{h.location}</td>
                            <td className="p-2">{h.rating}</td>
                            <td className="p-2">{h.price}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminHotels
