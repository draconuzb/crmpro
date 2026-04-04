import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // Connect to the notifications namespace
    const baseUrl = window.location.origin;
    socket = io(`${baseUrl}/notifications`, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(branchId?: number) {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  if (branchId) {
    s.emit('join', { branchId });
  }
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
