import { io, Socket } from 'socket.io-client';
import { CONFIG } from '../config';

let socket: Socket;

const socketService = {
  connect: (authToken: string): void => {
    if (socket && socket.connected) {
      console.log('Socket already connected.');
      return;
    }

    // Connect to the WebSocket server
    socket = io(CONFIG.API.WEBSOCKET_URL, {
      auth: {
        token: authToken,
      },
      transports: ['websocket'], // Force websocket connection
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.log('🔌 WebSocket connection error:', error.message);
    });
  },

  disconnect: (): void => {
    if (socket) {
      socket.disconnect();
    }
  },

  emit: (event: string, data: any): void => {
    if (socket) {
      socket.emit(event, data);
    }
  },

  on: (event: string, listener: (data: any) => void): void => {
    if (socket) {
      socket.on(event, listener);
    }
  },

  off: (event: string, listener?: (data: any) => void): void => {
    if (socket) {
      socket.off(event, listener);
    }
  },
};

export default socketService;
