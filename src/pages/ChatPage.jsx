import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '../hooks/useSocket';
import ProfileModal from '../components/ProfileModal';
import '../App.css';
const BASE_URL = "https://chitchat-server-zp6o.onrender.com";


const formatTimestamp = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null);

  const token = localStorage.getItem('token');
  const socket = useSocket(token);

  const messageListRef = useRef(null);
  const selectedUserRef = useRef(null);
  const currentUserRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
    currentUserRef.current = currentUser;
  }, [selectedUser, currentUser]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, typingUser]);

  // Fetch current user
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchCurrentUserProfile = async () => {
      try {
       const response = await axios.get(`${BASE_URL}/api/profile/me`, {
  headers: { 'x-auth-token': token },
});

        setCurrentUser(response.data);
      } catch (error) {
        console.error('Failed to fetch current user profile', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchCurrentUserProfile();
  }, [token, navigate]);

  // Fetch contacts
  useEffect(() => {
    if (!currentUser) return;
    const fetchContacts = async () => {
      try {
        const res = await axios.get('${BASE_URL}/api/contacts', {
          headers: { 'x-auth-token': token },
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Could not fetch contacts.', err);
      }
    };
    fetchContacts();
  }, [currentUser, token]);

  // Socket events (messages, typing, presence, profile updates)
  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleReceiveMessage = (data) => {
      const currentSelected = selectedUserRef.current;
      const currentSelf = currentUserRef.current;
      if (
        currentSelected &&
        currentSelf &&
        ((data.sender === currentSelf._id && data.recipient === currentSelected._id) ||
          (data.sender === currentSelected._id && data.recipient === currentSelf._id))
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };

   const handleTypingNotification = ({ senderId }) => {
  const currentSelected = selectedUserRef.current;
  const currentSelf = currentUserRef.current;

  if (!currentSelected || !currentSelf) return;

  // If selected user is typing
  if (senderId === currentSelected._id) {
    setTypingUser(currentSelected._id);
  }
  // If YOU are typing (optional, to show your typing indicator)
  else if (senderId === currentSelf._id) {
    setTypingUser(currentSelf._id);
  }

  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2000);
};

    const handleUserOnline = ({ userId }) => {
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isOnline: true } : u)));
      if (selectedUserRef.current?._id === userId)
        setSelectedUser((prev) => ({ ...prev, isOnline: true }));
    };

    const handleUserOffline = ({ userId, lastSeen }) => {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isOnline: false, lastSeen } : u))
      );
      if (selectedUserRef.current?._id === userId)
        setSelectedUser((prev) => ({ ...prev, isOnline: false, lastSeen }));
    };

    // Real-time profile updates
    const handleProfileUpdated = (updatedUser) => {
      setUsers((prev) => prev.map((u) => (u._id === updatedUser._id ? updatedUser : u)));

      if (selectedUserRef.current?._id === updatedUser._id) {
        setSelectedUser(updatedUser);
      }
      if (currentUserRef.current?._id === updatedUser._id) {
        setCurrentUser(updatedUser);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing_notification', handleTypingNotification);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('profile_updated', handleProfileUpdated);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing_notification', handleTypingNotification);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('profile_updated', handleProfileUpdated);
    };
  }, [socket, currentUser]);

  // 🗑️ Listen for message deleted events
useEffect(() => {
  if (!socket) return;

  const handleMessageDeleted = ({ messageId }) => {
    console.log("🧩 Message deleted event received:", messageId);

    // Fade-out first for smooth UI removal
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId ? { ...m, fading: true } : m
      )
    );

    // Remove after fade animation
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    }, 300);
  };

  socket.on("message_deleted", handleMessageDeleted);

  return () => {
    socket.off("message_deleted", handleMessageDeleted);
  };
}, [socket]);



  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    try {
      const response = await axios.get(`${BASE_URL}/api/messages/${user._id}`, {
        headers: { 'x-auth-token': token },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch message history', error);
      setMessages([]);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedUser) return;
    socket.emit('send_message', {
      recipientId: selectedUser._id,
      content: newMessage,
    });
    setNewMessage('');
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (socket && selectedUser) socket.emit('typing', { recipientId: selectedUser._id });
  };

  const handleLogout = () => {
    if (socket) socket.disconnect();
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleBack = () => {
    setSelectedUser(null);
    setMessages([]);
  };

  if (!currentUser) {
    return <div className="loading-screen">Loading...</div>;
  }

const handleDeleteMessage = async (messageId) => {
  try {
    // 1️⃣ Smooth fade-out in UI
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId ? { ...m, fadeOut: true } : m
      )
    );

    // 2️⃣ Wait for animation
    setTimeout(async () => {
      // Remove locally (UI cleanup)
      setMessages((prev) => prev.filter((m) => m._id !== messageId));

      // 3️⃣ Delete message from backend
      await axios.delete(`${BASE_URL}/api/messages/${messageId}`, {
        headers: { "x-auth-token": token },
      });

      // 4️⃣ Emit socket event for real-time sync
      if (socket && socket.connected) {
        console.log("🟡 Emitting delete_message event:", messageId);
        socket.emit("delete_message", messageId);
      } else {
        console.warn("⚠️ Socket not connected when deleting message");
      }
    }, 300);
  } catch (error) {
    console.error("❌ Failed to delete message:", error);
  }
};



  return (
    <>
      <ProfileModal user={viewingProfile} onClose={() => setViewingProfile(null)} />

      <div className={`chat-page-container ${selectedUser ? 'show-chat' : ''}`}>
        {/* ✅ Sidebar (header + contacts list) */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-profile">
              <div className="profile-avatar" onClick={() => navigate('/profile')}>
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name || 'Me'} />
                ) : (
                  (currentUser.name?.[0] || currentUser.email?.[0] || 'U').toUpperCase()
                )}
              </div>
              <h2 className="sidebar-title">Contacts</h2>
            </div>

            <div className="sidebar-actions">
              <Link to="/requests" title="Friend Requests" className="sidebar-icon">
                <i className="fas fa-user-friends" aria-hidden="true" />
              </Link>
              <Link to="/add-contact" title="Add Contact" className="sidebar-icon">
                <i className="fas fa-user-plus" aria-hidden="true" />
              </Link>
              <button className="sidebar-icon logout" onClick={handleLogout} title="Logout">
                <i className="fas fa-sign-out-alt" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="user-list">
            {users.map((user) => (
              <div
                key={user._id}
                className={`user-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
                onClick={() => handleSelectUser(user)}
              >
                <div className="contact-avatar">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name || user.email} />
                  ) : (
                    <span>{(user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}</span>
                  )}
                </div>
                <div className="contact-info">
                  <span className="contact-name">{user.name || user.email}</span>
                </div>
                {user.isOnline && <span className="online-dot" />}
              </div>
            ))}
          </div>
        </div>

     {/* ✅ Chat window */}
<div className="chat-window">
  {selectedUser ? (
    <div className="app-container">
      {/* --- Chat Header --- */}
      <div className="chat-header" onClick={() => setViewingProfile(selectedUser)}>
        <button
          className="back-button"
          onClick={(e) => {
            e.stopPropagation();
            handleBack();
          }}
        >
          &larr;
        </button>

        {/* 👇 Grouped avatar + name + status inside chat-user-info */}
        <div className="chat-user-info">
          <div className="chat-user-avatar">
            {selectedUser.avatarUrl ? (
              <img src={selectedUser.avatarUrl} alt={selectedUser.name || selectedUser.email} />
            ) : (
              <span>
                {(selectedUser.name?.[0] || selectedUser.email?.[0] || 'U').toUpperCase()}
              </span>
            )}
          </div>

          <div className="chat-user-details">
            <h3>{selectedUser.name || selectedUser.email}</h3>
            <p>
              {users.find((u) => u._id === selectedUser._id)?.isOnline
                ? 'Online'
                : selectedUser.lastSeen
                ? `Last seen ${formatDistanceToNow(new Date(selectedUser.lastSeen), {
                    addSuffix: true,
                  })}`
                : 'Offline'}
            </p>
          </div>
        </div>

        {/* Optional action icons (can be removed if not needed) */}
        <div className="chat-actions">
          <i className="fas fa-video chat-action-icon"></i>
          <i className="fas fa-info-circle chat-action-icon"></i>
        </div>
      </div>


           <div className="message-list" ref={messageListRef}>
{messages.map((msg, index) => (
  <div
    key={msg._id || index}
    className={`message ${msg.sender === currentUser._id ? 'sent' : 'received'} ${msg.fadeOut ? 'fade-out' : ''}`}
  >
    <span className="content">{msg.content}</span>
    <span className="timestamp">{formatTimestamp(msg.createdAt)}</span>
    <div className="message-actions">
      <i
        className="fas fa-trash delete-icon"
        onClick={() => handleDeleteMessage(msg._id)}
        title="Delete message"
      ></i>
    </div>
  </div>
))}



{typingUser && selectedUser && (
  <div
    className={`typing-indicator-bubble ${
      typingUser === currentUser._id ? 'sent' : 'received'
    }`}
    style={{
      animation:
        'typingFadeIn 0.25s ease-out, typingFadeOut 0.4s ease-out 1.8s forwards, typingGlowPulse 2.4s ease-in-out infinite',
    }}
  >
    <div className="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
)}




</div>


 <form className="message-input" onSubmit={handleSendMessage}>
  <textarea
  className="chat-input"
  value={newMessage}
  onChange={handleInputChange}
  placeholder={`Message ${selectedUser?.name || selectedUser?.email || ''}`}
  disabled={!selectedUser}
  rows="1"
  onInput={(e) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }}
/>
  <button
    type="submit"
    className={`send-button ${!newMessage.trim() ? 'disabled' : ''}`}
    disabled={!selectedUser || !newMessage.trim()}
    title="Send Message"
  >
    <i className="fas fa-paper-plane"></i>
  </button>
</form>
            </div>
          ) : (
            <div className="welcome-screen">
              <div className="chat-icon">💬</div>
              <h2>Welcome, {currentUser.name || currentUser.email}!</h2>
              <p>Select a contact from the list to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatPage;
