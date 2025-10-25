import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios
import './AuthForm.css';
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3001";


export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the email and password to the backend server
      const response = await axios.post(`${BASE_URL}/api/register`, {
        email,
        password,
      });

      // Handle success
      console.log('Registration successful:', response.data);
      alert('Registration successful! Please log in.');
      navigate('/login'); // Redirect to the login page

    } catch (error) {
      // Handle error
      console.error('Registration error:', error.response.data);
      alert(error.response.data.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Create your account</h2>
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
          <button type="submit">Sign Up</button>
        </form>
        <p className="switch-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}