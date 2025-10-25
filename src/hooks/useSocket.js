// src/hooks/useSocket.js
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export function useSocket(token) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;

    // Create the socket connection
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
      auth: { token }
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected with ID:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Cleanup function to disconnect the socket when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, [token]); // This effect depends only on the token

  return socket;
}