import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../App.css";

const BASE_URL = import.meta.env.VITE_BASE_URL || "https://chitchat-server-zp6o.onrender.com";

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // ✅ Fetch all pending friend requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/contact-requests/pending`, {
          headers: { "x-auth-token": token },
        });
        setRequests(res.data);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
        setMessage("Failed to fetch requests.");
      }
    };
    fetchRequests();
  }, [token]);

  // ✅ Handle accept / decline actions
  const handleRespond = async (requestId, response) => {
    try {
      await axios.put(
        `${BASE_URL}/api/contact-requests/${requestId}/respond`,
        { response },
        { headers: { "x-auth-token": token } }
      );

      // Update UI after responding
      setRequests((prev) =>
        prev.filter((req) => req._id !== requestId)
      );

      setMessage(`Request ${response}ed successfully!`);
    } catch (error) {
      console.error("Failed to respond:", error);
      alert("Could not accept request.");
    }
  };

  return (
    <div className="profile-page">
      <div className="auth-form profile-form">
        <h2>Pending Friend Requests</h2>

        {message && <p style={{ color: "gray" }}>{message}</p>}

        <div className="search-results">
          {requests.length === 0 ? (
            <p>No pending requests.</p>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="search-result-item">
                <div className="contact-avatar">
                  {req.fromUser?.avatarUrl ? (
                    <img
                      src={req.fromUser.avatarUrl}
                      alt={req.fromUser.name || req.fromUser.email}
                    />
                  ) : (
                    <span>
                      {(req.fromUser?.name?.[0] ||
                        req.fromUser?.email?.[0] ||
                        "U").toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="contact-info">
                  <span className="contact-name">
                    {req.fromUser?.name || req.fromUser?.email}
                  </span>
                </div>

                <div className="request-actions">
                  <button
                    className="accept-btn"
                    onClick={() => handleRespond(req._id, "accept")}
                  >
                    Accept
                  </button>
                  <button
                    className="decline-btn"
                    onClick={() => handleRespond(req._id, "decline")}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <p className="switch-link" style={{ marginTop: "20px" }}>
          <Link to="/">⬅ Back to Chat</Link>
        </p>
      </div>
    </div>
  );
}
