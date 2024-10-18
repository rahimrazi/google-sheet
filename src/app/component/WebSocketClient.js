import React, { useEffect } from 'react';
import io from 'socket.io-client';

let socket;

export function WebSocketClient({ onDataReceived }) {
  useEffect(() => {
    // Establish a connection to the Socket.IO server
    socket = io('http://localhost:3000', {
      path: '/api/socket', // Make sure this matches the server-side path
    });

    // Listen for messages from the server
    socket.on('message', (data) => {
      console.log('Received data:', data);
      if (data.sheetName && data.row && data.col && data.value) {
        onDataReceived(data); // Pass the data to the parent component
      }
    });

    // Cleanup when the component unmounts
    return () => {
      if (socket) socket.disconnect();
    };
  }, [onDataReceived]);

  return <div>Listening for updates...</div>;
}
