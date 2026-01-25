import React, { useEffect, useState } from 'react'
import Navbar from '../Components/Navbar'
import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

function Home() {
    const [locationData, setLocationData] = useState([])
    const [priceData, setPriceData] = useState([]);
    const [ratingData, setRatingData] = useState([]);
    const [topRooms, setTopRooms] = useState([])
    const [topLocations, setTopLocations] = useState([])

    useEffect(() => {
      fetch("http://localhost:5000/api/eda")
        .then(res => res.json())
        .then(json => {
    
          const locData = Object.entries(json.hotel_per_location).map(
            ([location, total]) => ({ location, total })
          );
    
          const priceChart = Object.entries(json.price_distribution).map(
            ([range, total]) => ({ range, total })
          );
    
          const ratingMap = {};
          json.rating_distribution.forEach(r => {
            const key = r.toFixed(1);
            ratingMap[key] = (ratingMap[key] || 0) + 1;
          });
    
          const ratingChart = Object.entries(ratingMap).map(
            ([rating, total]) => ({ rating, total })
          );

          const topLoc = Object.entries(json.top_10_locations)
          .map(([location, total]) => ({location, total}))

          const topRoom = Object.entries(json.top_10_room_types)
          .map(([room, total]) => ({room, total}))
    
          setLocationData(locData);
          setPriceData(priceChart);
          setRatingData(ratingChart);
          setTopLocations(topLoc)
          setTopRooms(topRoom)
        })
        
        .catch(err => console.error("EDA error:", err));
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
          <Navbar />
    
          <div className="max-w-5xl mx-auto pt-20 p-4">
            <h1 className="text-4xl font-bold mb-4">
              System Rekomendasi Hotel ICHM
            </h1>
    
            <p className="text-gray-600 mb-8">
              Sistem ini membantu Anda menemukan hotel terbaik sesuai preferensi harga,
              rating, lokasi, dan fasilitas menggunakan metode
              <span className="font-semibold">
                {" "}Item-Based Clustering Hybrid Method (ICHM)
              </span>
            </p>
    
            {/* Menu Utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <a
                href="/recommend"
                className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
              >
                <h2 className="text-xl font-semibold mb-2">Mulai Rekomendasi</h2>
                <p>Cari hotel yang paling sesuai dengan kebutuhan Anda</p>
              </a>
    
              <a
                href="/hotels"
                className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
              >
                <h2 className="text-xl font-semibold mb-2">Lihat Hotel</h2>
                <p>Lihat data hotel yang tersedia pada sistem rekomendasi</p>
              </a>
            </div>
    
            {/* Grafik EDA */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">
                Jumlah Hotel per Lokasi
              </h2>
    
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationData}>
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow mt-8">
              <h2 className="text-xl font-semibold mb-4">
                Distribusi Harga Hotel
              </h2>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceData}>
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow mt-8">
              <h2 className="text-xl font-semibold mb-4">
                Distribusi Rating Hotel
              </h2>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingData}>
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow mt-8">
              <h2 className="text-xl font-semibold mb-4">
                Top 10 Lokasi dengan Hotel Terbanyak
              </h2>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topLocations}>
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow mt-8">
              <h2 className="text-xl font-semibold mb-4">
                Top 10 Jenis Kamar Terpopuler
              </h2>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topRooms}>
                  <XAxis dataKey="room" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#9333ea" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    }

export default Home
