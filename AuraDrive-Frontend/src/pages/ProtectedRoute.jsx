import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Check if the JWT exists in local storage
    const token = localStorage.getItem('token');
    
    // If no token is found, redirect to the login page
    // The "replace" prop prevents the user from hitting "back" to the dashboard
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If a token exists, render the Dashboard (the children)
    return children;
};

export default ProtectedRoute;