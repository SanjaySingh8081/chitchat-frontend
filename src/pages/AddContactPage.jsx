import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AuthForm.css';
import TopBar from "../components/TopBar";

import '../App.css';
const BASE_URL = "https://chitchat-server-zp6o.onrender.com";


export default function AddContactPage() {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState('');
  const [sentRequests, setSentRequests] = useState([]); // <-- New state to track sent requests

  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage('');
    setSearchResults([]);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/users/search?email=${searchEmail}`, {
        headers: { 'x-auth-token': token }
      });
      setSearchResults(response.data);
      if (response.data.length === 0) {
        setMessage('No users found.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setMessage('Failed to search for users.');
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/api/contact-requests/send/${userId}`, {}, {
        headers: { 'x-auth-token': token }
      });
      setMessage(response.data.message);
      // Add the user's ID to the list of sent requests
      setSentRequests([...sentRequests, userId]);
    } catch (error) {
      console.error('Send request error:', error);
      setMessage(error.response.data.message || 'Failed to send request.');
    }
  };

  return (
    <div className="profile-page">
      <div className="auth-form profile-form">
        <h2>Add New Contact</h2>
        <div className="search-container">
          <form onSubmit={handleSearch}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Search by email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit">Search</button>
          </form>
        </div>

        {message && <p style={{ marginTop: '15px' }}>{message}</p>}

        <div className="search-results">
          {searchResults.map((user) => (
            <div key={user._id} className="search-result-item">
              <span>{user.email} ({user.name})</span>
              
              {/* vvv--- THIS IS THE NEW LOGIC ---vvv */}
              {sentRequests.includes(user._id) ? (
                <button disabled>Pending</button>
              ) : (
                <button onClick={() => handleSendRequest(user._id)}>Add</button>
              )}
              {/* ^^^-----------------------------^^^ */}
            </div>
          ))}
        </div>

        <p className="switch-link" style={{ marginTop: '20px' }}>
          <Link to="/">Back to Chat</Link>
        </p>
      </div>
    </div>
  );
}