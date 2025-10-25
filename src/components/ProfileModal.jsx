import React from "react";
import "../App.css";

export default function ProfileModal({ user, onClose }) {
  if (!user) return null;

  const isOnline = user.isOnline; // check online status if available

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        {/* Profile Section */}
        <div className="profile-modal-header">
          <img
            src={user.avatarUrl || "https://i.stack.imgur.com/34AD2.jpg"}
            alt={user.name || user.email}
            className={`profile-modal-avatar ${isOnline ? "online" : ""}`}
          />

          <h2>{user.name || "Unnamed User"}</h2>
          <p className="profile-email">{user.email}</p>
        </div>

        {/* About Section */}
        <div className="profile-modal-body">
          <h4>About</h4>
          <p>{user.about || "Hey there! I'm using ChitChat."}</p>
        </div>
      </div>
    </div>
  );
}
