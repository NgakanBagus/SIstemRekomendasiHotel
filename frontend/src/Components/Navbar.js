import React from 'react'
import {Link} from "react-router-dom"

function Navbar() {
    return(
        <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

                <Link to="/home" className="text-2xl font-bold text-blue-600">
                    ICHM Hotels
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/home" className="hover:text-blue-600 transition">
                        Home
                    </Link>

                    <Link to="/recommend" className="hover:text-blue-600 transition">
                        Rekomendasi
                    </Link>

                    <Link to="/hotels" className="hover:text-blue-600 transition">
                        Hotel
                    </Link>

                    <Link to="/profile" className="hover:text-blue-600 transition">
                        Profil
                    </Link>

                    <Link to="/login" className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                        Log Out
                    </Link>
                </div>


            </div>
        </nav>
    )
}

export default Navbar
