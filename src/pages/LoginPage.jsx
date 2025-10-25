import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; // Reuses styles from App.css
const BASE_URL = "https://chitchat-server-zp6o.onrender.com";


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the login credentials to the backend
      const response = await axios.post(`${BASE_URL}/api/login`, {
        email,
        password,
      });

      // Handle success: Save the token and redirect
      const { token } = response.data;
      localStorage.setItem('token', token); // Save the token to the browser's local storage
      
      alert('Login successful!');
      navigate('/'); // Redirect to the main chat page

    } catch (error) {
      // Handle error
      console.error('Login error:', error.response.data);
      alert(error.response.data.message || 'Login failed. Please try again.');
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