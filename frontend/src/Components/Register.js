import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterForm() {
    const [username, setName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('')
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault()

        const error = {}
        if (!username) error.username = "Username diperlukan"
        if(!password) error.password = "Pass diperlukan"
        if(!email) error.email = "Email diperlukan"

        if(Object.keys(error).length > 0){
            setErrors(error)
            return
        }

        try{
            const respon = await fetch("http://localhost:5000/api/register", {
                method: "POST", 
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({username, email, password})
            })

            const data = await respon.json()

            if(!data.success){
                setErrors({form:data.message})
                return
            }

            navigate("/login")

        } catch (err){
            setErrors({form: "Server Error"})
        }
    
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-1">Username</label>
                        <input 
                            type="text"
                            className="w-full border px-3 py-2 rounded"
                            onChange={(e) => setName(e.target.value)}
                        />
                        {errors.username && <div className="text-red-500">{errors.username}</div>}
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1">Email</label>
                        <input 
                            type="text"
                            className="w-full border px-3 py-2 rounded"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <div className="text-red-500">{errors.email}</div>}
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1">Password</label>
                        <input 
                            type="password"
                            className="w-full border px-3 py-2 rounded"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && <div className="text-red-500">{errors.password}</div>}
                    </div>

                    {errors.form && <div className="text-red-500 mb-4">{errors.form}</div>}

                    <button className="w-full bg-blue-500 text-white py-2 rounded">
                        Register
                    </button>

                    <p className="text-center mt-4">
                        Sudah punya akun?{" "}
                        <span 
                            onClick={() => navigate("/login")} 
                            className="text-blue-600 cursor-pointer"
                        >
                            Login
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default RegisterForm;
