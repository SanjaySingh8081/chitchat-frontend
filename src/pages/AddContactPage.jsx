import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AuthForm.css';
import TopBar from "../components/TopBar";
import '../App.css';

// ✅ Base URL (auto switches between local & deployed)
const BASE_URL = import.meta.env.VITE_BASE_URL || "https://chitchat-server-zp6o.onrender.com";

export default function AddContactPage() {
  const [searchEmail, setSearchEmail] = useState('');          // ✅ renamed variable used correctly
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState('');
  const [sentRequests, setSentRequests] = useState([]);        // ✅ track pending requests

  // ✅ Search user by email
  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage('');
    setSearchResults([]);

    try {
      const token = localStorage.getItem('token');
      if (!searchEmail.trim()) {
        setMessage('Please enter an email to search.');
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/api/users/search?email=${encodeURIComponent(searchEmail)}`,
        {
          headers: { 'x-auth-token': token },
        }
      );

      if (response.data.length === 0) {
        setMessage('No users found.');
      } else {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Search error:', error);
      setMessage('Failed to search for users.');
    }
  };

  // ✅ Send contact request
  const handleSendRequest = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/contact-requests/send/${userId}`,
        {},
        {
          headers: { 'x-auth-token': token },
        }
      );

      setMessage(response.data.message);
      setSentRequests((prev) => [...prev, userId]); // ✅ mark as pending
    } catch (error) {
      console.error('Send request error:', error);
      setMessage(
        error.response?.data?.message || 'Failed to send contact request.'
      );
    }
  };

  return (
    <div className="profile-page">
      <TopBar /> {/* ✅ optional: include your top bar */}
      <div className="auth-form profile-form">
        <h2>Add New Contact</h2>

        {/* ✅ Search form */}
        <div className="search-container">
          <form onSubmit={handleSearch}>
            <div className="form-group">
              <input
                type="email"
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

        {/* ✅ Search Results */}
        <div className="search-results">
          {searchResults.map((user) => (
            <div key={user._id} className="search-result-item">
              <span>
                {user.email} {user.name ? `(${user.name})` : ''}
              </span>

              {sentRequests.includes(user._id) ? (
                <button disabled>Pending</button>
              ) : (
                <button onClick={() => handleSendRequest(user._id)}>
                  Add
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="switch-link" style={{ marginTop: '20px' }}>
          <Link to="/">⬅ Back to Chat</Link>
        </p>
      </div>
    </div>
  );
}
