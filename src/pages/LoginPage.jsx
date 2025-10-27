import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; // Reuses styles from App.css
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3001";



export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(`${BASE_URL}/api/login`, { email, password });
    
    // ✅ Always ensure we have a valid token
    const token = response.data?.token;
    if (!token) throw new Error("No token received from server");

    // Save token
    localStorage.setItem("token", token);

    alert("Login successful!");
    navigate("/"); // Redirect to main chat page
  } catch (error) {
    console.error("Login error:", error);
    alert(
      error.response?.data?.message || "Login failed. Please try again."
    );
  }
};

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Log in to your account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Log In</button>
        </form>
        <p className="switch-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}