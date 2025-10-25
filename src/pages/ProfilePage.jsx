import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3001";


const ProfilePage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  const cloudName = "difmaobsr"; // your Cloudinary cloud name
  const uploadPreset = "chitchat_unsigned"; // your upload preset name

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/profile/me`, {
          headers: { "x-auth-token": token },
        });
        setUser(res.data);
        setName(res.data.name || "");
        setAbout(res.data.about || "");
        setAvatarUrl(res.data.avatarUrl || "");
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        navigate("/login");
      }
    };
    fetchUser();
  }, [token, navigate]);

  // Handle avatar upload to Cloudinary
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );
      const imageUrl = response.data.secure_url;
      setAvatarUrl(imageUrl);
    } catch (err) {
      console.error("Cloudinary upload failed:", err.response?.data || err);
      alert("Image upload failed. Please try again.");
    }
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await axios.put(
        `${BASE_URL}/api/profile/me`,
        { name, about, avatarUrl },
        { headers: { "x-auth-token": token } }
      );
      alert("Profile updated successfully!");
      setUser(res.data);
      setIsSaving(false);
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Failed to update profile.");
      setIsSaving(false);
    }
  };

  if (!user) return <div className="loading-screen">Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-heading">Your Profile</h2>

        <div className="profile-avatar-section">
          <img
            src={
              avatarUrl ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="Avatar"
            className="profile-avatar"
          />
          <label className="upload-btn">
            Change Photo
            <input type="file" onChange={handleAvatarUpload} hidden />
          </label>
        </div>

        <div className="profile-form">
          <label>Display Name</label>
          <input
            type="text"
            value={name}
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
          />

          <label>About</label>
          <textarea
            value={about}
            placeholder="Write something about yourself..."
            onChange={(e) => setAbout(e.target.value)}
          />

          <button
            className={`save-btn ${isSaving ? "saving" : ""}`}
            onClick={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>

          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back to Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
