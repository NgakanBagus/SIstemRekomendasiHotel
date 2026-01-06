import React, { useEffect, useState } from "react";

function Profil() {
    const user_id = localStorage.getItem("user_id");

    const [data, setData] = useState({
        username: "",
        email: "",
        password: ""
    });

    const fetchProfile = async () => {
        const res = await fetch(`http://localhost:5000/api/profile/${user_id}`);
        const profileUser = await res.json();
        setData(profileUser);
    };

    const updateProfile = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("address", data.address);
        formData.append("phone", data.phone);
    
        if (data.photo) {
            formData.append("photo", data.photo);
        }
    
        await fetch(`http://localhost:5000/api/profile/${user_id}`, {
            method: "POST",
            body: formData
        });
    
        alert("Profil berhasil diperbarui");
    };
    
    useEffect(() => {
        if(!user_id){
            alert("Login ulang")
            return
        }
        fetchProfile();
    }, []);

    return (
        <div className="pt-24 max-w-lg mx-auto px-6">
            <h1 className="text-3xl font-bold mb-6">Profil Saya</h1>

            {/* Foto Profil */}
            {data.photo && (
                <img
                    src={`http://localhost:5000/static/uploads/${data.photo}`}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                    alt="Foto Profil"
                />
            )}

            <form onSubmit={updateProfile} className="space-y-4">

                <input
                    type="text"
                    placeholder="Username"
                    className="w-full border p-2 rounded"
                    value={data.username}
                    onChange={(e) => setData({ ...data, username: e.target.value })}
                />

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-2 rounded"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-2 rounded"
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                />

                <input
                    type="text"
                    placeholder="Alamat"
                    className="w-full border p-2 rounded"
                    value={data.address}
                    onChange={(e) => setData({ ...data, address: e.target.value })}
                />

                <input
                    type="text"
                    placeholder="No Telepon"
                    className="w-full border p-2 rounded"
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                />

                <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                    setData({ ...data, photo: e.target.files[0] })
                }
                />

                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-green-700">
                    Simpan Perubahan
                </button>
            </form>
        </div>
    );
}

export default Profil;
