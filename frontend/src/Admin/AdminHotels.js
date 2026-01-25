import React, { useEffect, useState } from "react";
import NavbarAdmin from "../Components/NavbarAdmin";

function AdminHotels() {
    const [hotels, setHotels] = useState([]);
    const [form, setForm] = useState({
        name: "",
        location: "",
        facility: "",
        room_type: "",
        rating: "",
        original_price: "",
        discount_price: ""
    })

    const loadHotels = () => {
        fetch("http://localhost:5000/api/hotels")
            .then(res => res.json())
            .then(data => setHotels(data));
    };

    useEffect(() => {
        loadHotels()
    }, [])

    const addHotel = async () => {
        const res = await fetch("http://localhost:5000/api/admin/hotels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
          });
          const data = await res.json();
          alert(data.message);
          setForm({
            name: "",
            location: "",
            facility: "",
            room_type: "",
            rating: "",
            original_price: "",
            discount_price: ""
          });
          loadHotels();
    }

    const deleteHotel = async (id) => {
        if (!window.confirm("Yakin hapus hotel ini?")) return;
        const res = await fetch(`http://localhost:5000/api/admin/hotels/${id}`, {
        method: "DELETE"
        });
        const data = await res.json();
        alert(data.message);
        loadHotels();
    }

    const retrainModel = async () => {
        if (!window.confirm("Retrain model sekarang?")) return;
        const res = await fetch("http://localhost:5000/api/admin/retrain", {
        method: "POST"
        });
        const data = await res.json();
        alert(data.message || data.error);
    }

    return (
        <div className="p-6">
          <NavbarAdmin />
          <h1 className="text-2xl font-bold mb-4">Data Hotel</h1>
    
          <div className="bg-gray-100 p-4 mb-6 rounded">
            <h2 className="font-semibold mb-2">Tambah Hotel</h2>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(form).map((k) => (
                <input
                  key={k}
                  className="border p-2"
                  placeholder={k.replace("_", " ")}
                  value={form[k]}
                  onChange={e => setForm({ ...form, [k]: e.target.value })}
                />
              ))}
            </div>
            <button
              onClick={addHotel}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Tambah Hotel
            </button>
          </div>

          <button
            onClick={retrainModel}
            className="mb-4 bg-red-600 text-white px-4 py-2 rounded"
          >
            Retrain Model
          </button>
    
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Location</th>
                <th className="p-2">Rating</th>
                <th className="p-2">Real Price</th>
                <th className="p-2">Discount Price</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
    
            <tbody>
              {hotels.map((h) => (
                <tr key={h.id} className="border">
                  <td className="p-2">{h.name}</td>
                  <td className="p-2">{h.location}</td>
                  <td className="p-2">{h.rating}</td>
                  <td className="p-2">Rp {h.original_price?.toLocaleString("id-ID")}</td>
                  <td className="p-2">Rp {h.discount_price?.toLocaleString("id-ID")}</td>
                  <td className="p-2">
                    <button
                      onClick={() => deleteHotel(h.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

export default AdminHotels
