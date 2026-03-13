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
        discount_price: "",
        image: null
    })
    const [Statusretrain, setStatusretrain] = useState({
      loading: false,
      message: "",
      error: false,
      accuracy: null,
      mae: null
    })
    const [search, setSearch] = useState("")
    const [keyword, setKeyword] = useState("")
    const [edit, setEdit] = useState(null)
    const [editPrice, setEditPrice] = useState({
      original_price: "",
      discount_price: ""
    })

    const filterHotels = keyword
      ? hotels.filter((h) =>
          h.name.toLowerCase().includes(keyword.toLowerCase()) ||
          h.location.toLowerCase().includes(keyword.toLowerCase()) ||
          h.facility?.toLowerCase().includes(keyword.toLowerCase())
        )
      : hotels;

    const loadHotels = () => {
        fetch("http://localhost:5000/api/hotels")
            .then(res => res.json())
            .then(data => setHotels(data));
    };

    useEffect(() => {
        loadHotels()
    }, [])

    const addHotel = async () => {
      const formData = new FormData();
    
      formData.append("name", form.name);
      formData.append("location", form.location);
      formData.append("facility", form.facility);
      formData.append("room_type", form.room_type);
      formData.append("rating", form.rating);
      formData.append("original_price", form.original_price);
      formData.append("discount_price", form.discount_price);
    
      if (form.image) {
        formData.append("image", form.image);
      }
    
      const res = await fetch("http://localhost:5000/api/admin/hotels", {
        method: "POST",
        body: formData   
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
        discount_price: "",
        image: null
      });
    
      loadHotels();
    };    

    const deleteHotel = async (id) => {
        if (!window.confirm("Yakin hapus hotel ini?")) return;
        const res = await fetch(`http://localhost:5000/api/admin/hotels/${id}`, {
        method: "DELETE"
        });
        const data = await res.json();
        alert(data.message);
        loadHotels();
    }

    const priceUpdate = async (id) => {
      const res = await fetch(`http://localhost:5000/api/admin/hotels/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type" : "application/json"
        },
        body: JSON.stringify(editPrice)
      })

      const data = await res.json()
      alert(data.message)

      setEdit(null)
      loadHotels()
    }

    const retrainModel = async () => {
        if (!window.confirm("Retrain model sekarang?")) return;

        setStatusretrain({
          loading: true,
          message: "model dilatih.....",
          error: false,
        })
        try{
          const res = await fetch("http://localhost:5000/api/admin/retrain", {
          method: "POST"
        });

          const data = await res.json()

          if(data.success){
            setStatusretrain({
              loading: false,
              message:"Model berhasil retrain",
              error: false,
              accuracy: data.accuracy,
              mae: data.mae
            })
          } else{
            setStatusretrain({
              loading: false,
              message: data.error || "retrain gagal",
              error: true
            })
          }
        } catch(err){
          setStatusretrain({
            loading: false,
            message: "Gagal terhubung server",
            error: true
          })
        }
    }

    return (
        <div className="p-6">
          <NavbarAdmin />
          <div className="bg-gray-100 p-4 mb-6 rounded mt-16">
            <h2 className="font-semibold mb-2">Tambah Hotel</h2>
            <div className="grid grid-cols-3 gap-2">
              <input
                className="border p-2"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                className="border p-2"
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />

              <input
                className="border p-2"
                placeholder="Facility"
                value={form.facility}
                onChange={(e) => setForm({ ...form, facility: e.target.value })}
              />

              <input
                className="border p-2"
                placeholder="Room Type"
                value={form.room_type}
                onChange={(e) => setForm({ ...form, room_type: e.target.value })}
              />

              <input
                type="number"
                className="border p-2"
                placeholder="Rating"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
              />

              <input
                type="number"
                className="border p-2"
                placeholder="Original Price"
                value={form.original_price}
                onChange={(e) => setForm({ ...form, original_price: e.target.value })}
              />

              <input
                type="number"
                className="border p-2"
                placeholder="Discount Price"
                value={form.discount_price}
                onChange={(e) => setForm({ ...form, discount_price: e.target.value })}
              />

              <input
                type="file"
                accept="image/*"
                className="border p-2 col-span-3"
                onChange={(e) =>
                  setForm({ ...form, image: e.target.files[0] })
                }
              />
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
            className="mb-2 bg-red-600 text-white px-4 py-2 rounded"
            disabled={Statusretrain.loading}
          >
            {Statusretrain.loading ? "Retraining..." : "Retrain Model"}
          </button>
          {Statusretrain.accuracy !== null && (
            <div className="bg-blue-100 text-blue-800 p-4 rounded mb-4">
              <h3 className="font-semibold mb-1">
                Evaluasi Hybrid Recommendation System
              </h3>
              <p>Akurasi Estimasi : {Statusretrain.accuracy}</p>
              <p>MAE              : {Statusretrain.mae}</p>
            </div>
          )}

          {Statusretrain.message && (
            <div
              className={`p-3 rounded mb-4 ${
                Statusretrain.error
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {Statusretrain.message}
            </div>
          )}

          <h1 className="text-2xl font-bold mb-4">Data Hotel</h1>
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
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Location</th>
                <th className="p-2">Rating</th>
                <th className="p-2">Real Price</th>
                <th className="p-2">Discount Price</th>
                <th className="p-2">Image</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
    
            <tbody>
              {filterHotels.map((h) => (
                <tr key={h.id} className="border">
                  <td className="p-2">{h.name}</td>
                  <td className="p-2">{h.location}</td>
                  <td className="p-2">{h.rating}</td>
                  <td className="p-2">
                    {edit === h.id ? (
                      <input
                        type="number"
                        value={editPrice.original_price}
                        onChange={(e) =>
                          setEditPrice({ ...editPrice, original_price: e.target.value })
                        }
                        className="border p-1 w-28"
                      />
                    ) : (
                      `Rp ${h.original_price?.toLocaleString("id-ID")}`
                    )}
                  </td>

                  <td className="p-2">
                    {edit === h.id ? (
                      <input
                        type="number"
                        value={editPrice.discount_price}
                        onChange={(e) =>
                          setEditPrice({ ...editPrice, discount_price: e.target.value })
                        }
                        className="border p-1 w-28"
                      />
                    ) : (
                      `Rp ${h.discount_price?.toLocaleString("id-ID")}`
                    )}
                  </td>
                  <td className="p-2">
                    <img 
                            src={h.image}
                            alt={h.name}
                            className="w-full h-20 object-cover rounded-md mb-3"
                            onError={(e) => {
                                e.target.src = "http://localhost:5000/static/hotel/default.jpg"
                            }}>
                    </img>
                  </td>
                  <td className="p-2 flex gap-2">
                    {edit === h.id ? (
                      <>
                        <button
                          onClick={() => priceUpdate(h.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Simpan
                        </button>

                        <button
                          onClick={() => setEdit(null)}
                          className="bg-gray-500 text-white px-3 py-1 rounded"
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEdit(h.id);
                            setEditPrice({
                              original_price: h.original_price,
                              discount_price: h.discount_price
                            });
                          }}
                          className="bg-yellow-500 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteHotel(h.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          Hapus
                        </button>
                      </>
                    )}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

export default AdminHotels
