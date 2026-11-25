import { Server } from 'socket.io';
import { env } from '../config/env.js';

export function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join:event', (eventId) => {
      if (eventId) {
        socket.join(`event:${eventId}`);
      }
    });

    socket.on('leave:event', (eventId) => {
      if (eventId) {
        socket.leave(`event:${eventId}`);
      }
    });
  });

  return io;
}

