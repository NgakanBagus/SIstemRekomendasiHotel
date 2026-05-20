import React, { useEffect, useState } from "react";
import NavbarAdmin from "../Components/NavbarAdmin";

function AdminProfil()  {
    const adminId = localStorage.getItem("user_id")
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: ""
    })

    useEffect(() => {
        fetch(`http://localhost:5000/api/profile/${adminId}`)
            .then((res) => res.json())
            .then((data) =>
                setForm({
                    username: data.username || "",
                    email: data.email || "",
                    password: ""
                })
            );
    }, [adminId]);

    const ProfilSave = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            formData.append("username", form.username);
            formData.append("email", form.email);
            formData.append("password", form.password);

            const res = await fetch(
                `http://localhost:5000/api/profile/${adminId}`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await res.json();

            if (data.success) {
                alert("Profil berhasil diupdate");
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error(error);
            alert("Gagal update profil");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <NavbarAdmin />

            <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                <div className="bg-white p-6 rounded shadow w-96">
                    <h1 className="text-2xl font-bold mb-6 text-center">
                        Profil Admin
                    </h1>

                    <form
                        onSubmit={ProfilSave}
                        className="flex flex-col gap-3"
                    >
                        <input
                            className="border p-2 rounded"
                            placeholder="Username"
                            value={form.username}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    username: e.target.value
                                })
                            }
                        />

                        <input
                            className="border p-2 rounded"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    email: e.target.value
                                })
                            }
                        />

                        <input
                            type="password"
                            className="border p-2 rounded"
                            placeholder="Password Baru"
                            value={form.password}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    password: e.target.value
                                })
                            }
                        />

                        <button
                            type="submit"
                            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                        >
                            Simpan
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminProfil
