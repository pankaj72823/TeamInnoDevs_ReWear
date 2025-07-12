import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./componets/Dashboard";
import LandingPage from "./componets/LandingPage";
import Navbar from "./componets/Navbar";
import Login from "./componets/Login";
import Browse from "./componets/Browse";
import AddItem from "./componets/AddItem";
import SignUp from "./componets/SignUp";
import { useUser } from "./hooks/UserContext"; // Ensure this path is correct
import { Navigate } from "react-router-dom";
import AdminDashboard from "./componets/AdminDashboard";
import { use } from "react";
import { useEffect } from "react";

function App() {
  const { user } = useUser(); // Assuming useUser is imported from UserContext
   
  return (
    <div>
      {/* define all route here */}
      <BrowserRouter>
        <Navbar />
        <div className=" pt-1">
          {/* Define your routes here */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/" element={<LandingPage />} />
            <Route
            path="/dashboard"
            element={
              user?.role === "user" ? (
                <Dashboard />
              ) : user?.role === "admin" ? (
                <Navigate to="/admin-dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              user?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
