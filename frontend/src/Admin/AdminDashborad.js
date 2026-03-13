import React, { useEffect, useState } from "react";
import NavbarAdmin from "../Components/NavbarAdmin";

function AdminDashboard() {
    const [data, setData] = useState({
        users: [],
        hotels: []
    });

    useEffect(() => {
        fetch("http://localhost:5000/api/admin")
            .then(res => res.json())
            .then(data => setData(data));
    }, []);

    return (
        <div className="flex">
            <NavbarAdmin />

            {/* Main Content */}
            <div className="p-6 w-full mt-16">
                <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>

                {/* Statistik */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-white shadow p-4 rounded-lg">
                        <h2 className="text-xl font-semibold">Jumlah User</h2>
                        <p className="text-4xl mt-2">{data.users.length}</p>
                    </div>

                    <div className="bg-white shadow p-4 rounded-lg">
                        <h2 className="text-xl font-semibold">Jumlah Hotel</h2>
                        <p className="text-4xl mt-2">{data.hotels.length}</p>
                    </div>
                </div>

                {/* Daftar User */}
                <div className="bg-white shadow p-6 rounded-lg mb-8">
                    <h2 className="text-xl font-semibold mb-4">Daftar User</h2>
                    <ul className="list-disc ml-6">
                        {data.users.map((u, i) => (
                            <li key={i}>{u}</li>
                        ))}
                    </ul>
                </div>

                {/* Daftar Hotel */}
                <div className="bg-white shadow p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Daftar Hotel</h2>
                    <ul className="list-disc ml-6">
                        {data.hotels.map((h, i) => (
                            <li key={i}>{h}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard