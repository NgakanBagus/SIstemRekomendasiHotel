import React, { useEffect, useState } from "react";
import NavbarAdmin from "../Components/NavbarAdmin";

function AdminManage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const userManage = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/users");
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Gagal mengambil user", err);
    } finally {
      setLoading(false);
    }
  };

  const userDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus user ini?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/users/${id}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (data.success) {
        alert("User berhasil dihapus");
        userManage(); 
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Gagal menghapus user", err);
    }
  };

  useEffect(() => {
    userManage();
  }, []);

  return (
    <div className="p-6">
      <NavbarAdmin />
      <h2 className="text-xl font-bold mb-4">Manage Users</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Username</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="text-center">
                <td className="border p-2">{u.id}</td>
                <td className="border p-2">{u.username}</td>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2">{u.role}</td>
                <td className="border p-2">
                  {u.username !== "admin" ? (
                    <button
                      onClick={() => userDelete(u.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Hapus
                    </button>
                  ) : (
                    <span className="text-gray-400">Protected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminManage;
