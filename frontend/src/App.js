import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Login from './Components/Login';
import Register from './Components/Register';
import Home from './User/Home';
import Recommendation from './User/Recommendation';
import Profil from './User/Profil';
import Hotels from './User/Hotels';
import RatingForm from './User/RatingForm';
import ProtectedRoute from './Components/ProtectedRoute';
import AdminDashboard from './Admin/AdminDashborad';
import AdminHotels from './Admin/AdminHotels';
import AdminProfil from './Admin/AdminProfil';
import AdminManage from './Admin/AdminManage';

function App() {
  return (
    <Router>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* USER */}
        <Route path="/home" element={
          <ProtectedRoute role="user">
            <>
              <Navbar />
              <Home />
            </>
          </ProtectedRoute>
        } />

        <Route path="/recommend" element={
          <ProtectedRoute role="user">
            <>
              <Navbar />
              <Recommendation />
            </>
          </ProtectedRoute>
        } />

        <Route path="/hotels" element={
          <ProtectedRoute role="user">
            <>
              <Navbar />
              <Hotels />
            </>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute role="user">
            <>
              <Navbar />
              <Profil />
            </>
          </ProtectedRoute>
        } />

        <Route path="/rating" element={
          <ProtectedRoute role = "user">
            <>
              <Navbar />
              <RatingForm />
            </>
          </ProtectedRoute>
        } />

        {/* ADMIN */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route
          path="/admin/hotels"
          element={
            <ProtectedRoute role="admin">
              <AdminHotels />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute role="admin">
              <AdminProfil />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/adminmanage"
          element={
            <ProtectedRoute role="admin">
              <AdminManage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
