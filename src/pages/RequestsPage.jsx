import React, { useEffect, useState } from "react";
import axios from "axios";
import TopBar from "../components/TopBar";
import "../App.css";
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3001";



function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/contacts/requests`, {
          headers: { "x-auth-token": token },
        });
        setRequests(res.data);
      } catch (err) {
        console.error("Failed to fetch requests:", err);
      }
    };
    fetchRequests();
  }, [token]);

  const handleAccept = async (requestId) => {
    try {
      await axios.post(
        `${BASE_URL}/api/contacts/accept/${requestId}`,
        {},
        { headers: { "x-auth-token": token } }
      );
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      console.error("Failed to accept request:", err);
      alert("Could not accept request.");
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await axios.post(
        `${BASE_URL}/api/contacts/decline/${requestId}`,
        {},
        { headers: { "x-auth-token": token } }
      );
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      console.error("Failed to decline request:", err);
      alert("Could not decline request.");
    }
  };

  return (
    <div className="requests-page">
      <TopBar title="Friend Requests" />
      <div className="auth-form">
        <h2>Pending Friend Requests</h2>
        <div className="requests-list">
          {requests.length > 0 ? (
            requests.map((req) => (
              <div key={req._id} className="request-item">
                <span>{req.sender?.name || req.sender?.email}</span>
                <div className="actions">
                  <button
                    className="accept-btn"
                    onClick={() => handleAccept(req._id)}
                  >
                    Accept
                  </button>
                  <button
                    className="decline-btn"
                    onClick={() => handleDecline(req._id)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No pending requests</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RequestsPage;
