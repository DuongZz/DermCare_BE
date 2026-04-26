import { Server } from 'socket.io';

let io: Server | null = null;

export const setIo = (instance: Server) => {
  io = instance;
};

export const getIo = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
