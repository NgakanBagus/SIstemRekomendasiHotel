import { Navigate } from "react-router-dom";

function ProtectedRoute({children, role}) {
    const userRole = localStorage.getItem("role")

    if(!userRole){
        return <Navigate to="/login" />
    }
    
    if(role && userRole !== role){
        return <Navigate to="/home" />
    }

    return children
}

export default ProtectedRoute
