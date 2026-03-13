import React, { useEffect, useState } from "react";
import NavbarAdmin from "../Components/NavbarAdmin";

function AdminManage() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [search, setSearch] = useState("")
  const [keyword, setKeyword] = useState("")
  const [feedbackSearch, setFeedbackSearch] = useState("")
  const [feedbackKey, setFeedbackKey] = useState("")

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(keyword.toLowerCase()) ||
    u.email.toLowerCase().includes(keyword.toLowerCase())
  );

  const filteredFeedbacks = feedbacks.filter((f) =>
    f.username.toLowerCase().includes(feedbackKey.toLowerCase()) ||
    f.comment.toLowerCase().includes(feedbackKey.toLowerCase())
  );
  
  const userManage = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const userDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;
    await fetch(`http://localhost:5000/api/admin/users/${id}`, {
      method: "DELETE",
    });
    userManage();
  };

  const FeedbackGet = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/feedbacks");
      const data = await res.json();
      if (data.success) setFeedbacks(data.feedbacks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    userManage();
    FeedbackGet();
  }, []);

  return (
    <div className="p-6">
      <NavbarAdmin />

      <h2 className="text-xl font-bold mb-4 mt-16">Manajemen User</h2>
      <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Cari user..."
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

      {loadingUsers ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full border border-gray-300 mb-10">
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
            {filteredUsers.map((u) => (
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

      <h2 className="text-xl font-bold mb-4">User Feedback</h2>
      <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Cari feedback..."
              className="border p-2 rounded w-72"
              value={feedbackSearch}
              onChange={(e) => setFeedbackSearch(e.target.value)}
            />

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() =>setFeedbackKey(feedbackSearch)}
            >
              Search
            </button>

            <button
              className="bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => {
                setFeedbackSearch("")
                setFeedbackKey("")
              }}
            >
              Reset
            </button>
      </div>

      {loadingFeedback ? (
        <p>Loading feedback...</p>
      ) : (
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">User</th>
              <th className="border p-2">Satisfaction</th>
              <th className="border p-2">Comment</th>
              <th className="border p-2">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  Belum ada feedback
                </td>
              </tr>
            ) : (
              filteredFeedbacks.map((f) => (
                <tr key={f.id}>
                  <td className="border p-2">{f.username}</td>
                  <td className="border p-2">{f.satisfaction}</td>
                  <td className="border p-2">{f.comment}</td>
                  <td className="border p-2">{f.created_at}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminManage;
