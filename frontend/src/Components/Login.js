import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
    const [username, setName] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault()

        const error = {}
        if (!username) error.username = "Username diperlukan"
        if(!password) error.password = "Pass diperlukan"

        if(Object.keys(error).length > 0){
            setErrors(error)
            return
        }

        try{
            const respon = await fetch("http://localhost:5000/api/login", {
                method: "POST", 
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({username, password})
            })

            const data = await respon.json()

            if(!data.success){
                setErrors({form:data.message})
                return
            }

            localStorage.setItem("user_id", data.user.id)
            localStorage.setItem("username", data.user.username)
            localStorage.setItem("role", data.user.role)
            
            if(data.user.role === "admin"){
                navigate("/admin")
            }
            else{
                navigate("/home")
            }

        } catch (err){
            setErrors({form: "Server Error"})
        }
    
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

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
                        Login
                    </button>

                    <p className="text-center mt-4">
                        Belum punya akun?{" "}
                        <span 
                            onClick={() => navigate("/register")} 
                            className="text-blue-600 cursor-pointer"
                        >
                            Register
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
