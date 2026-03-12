import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import RiderDashboard from './pages/Dashboard.jsx'; 
import DriverDashboard from './pages/DriverDashboard.jsx'; 
import ProtectedRoute from './pages/ProtectedRoute.jsx';

function App() {
  // Helper function to get role fresh every time a route changes
  // const getCurrentRole = () => {
  //   const role = localStorage.getItem('role') || "";
  //   return role.toLowerCase(); // Consistent check
  // };
  const userRole = localStorage.getItem('role')?.toUpperCase();

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Main Dashboard Route */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                {/* Dynamically check role on every render
                {getCurrentRole().includes('Driver') ? (
                  <DriverDashboard />
                ) : (
                  <RiderDashboard />
                )} */}
                {userRole === 'DRIVER' ? <DriverDashboard /> : <RiderDashboard />}
              </ProtectedRoute>
            } 
          />

          {/* Root Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;