import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function TopBar({ title = "" }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="topbar">
      {title && <h3 className="topbar-title">{title}</h3>}
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
