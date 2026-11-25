import { useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket(eventId, handlers = {}) {
  useEffect(() => {
    if (!eventId) return undefined;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      socket.emit('join:event', eventId);
    });

    Object.entries(handlers).forEach(([eventName, handler]) => {
      if (typeof handler === 'function') {
        socket.on(eventName, handler);
      }
    });

    return () => {
      socket.emit('leave:event', eventId);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);
}

