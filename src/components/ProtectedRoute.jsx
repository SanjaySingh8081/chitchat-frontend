import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token is found, redirect to the login page
    return <Navigate to="/login" />;
  }

  // If a token is found, render the child component (e.g., ChatPage)
  return children;
};

export default ProtectedRoute;