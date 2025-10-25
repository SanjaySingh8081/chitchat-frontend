import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const useSocket = (token) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // ✅ use Render backend URL
    const backendUrl =
      import.meta.env.VITE_BASE_URL || "https://chitchat-server-zp6o.onrender.com";

    socketRef.current = io(backendUrl, {
      auth: { token },
      transports: ["websocket"], // ✅ direct websocket transport
      reconnection: true, // ✅ auto-reconnect
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 15000, // ✅ 15 sec before giving up
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [token]);

  return socketRef.current;
};
