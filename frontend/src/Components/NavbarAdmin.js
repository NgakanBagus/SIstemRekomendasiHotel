import React from "react";
import { Link } from "react-router-dom";

function SidebarAdmin() {
    return (
        <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

                <h2 className="text-2xl font-bold text-blue-600">Admin Panel</h2>

                <div className="flex items-center gap-6">
                     <Link to="/admin" className="hover:text-blue-600 transition">
                        Admin Home
                    </Link>

                    <Link to="/admin/hotels" className="hover:text-blue-600 transition">
                        Manage Hotels
                    </Link>

                    <Link to="/admin/profile" className="hover:text-blue-600 transition">
                        Manage Profile
                    </Link>

                    <Link to="/login" className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                        Log Out
                    </Link>

                </div>
            </div>
        </nav>
    );
}

export default SidebarAdmin;
