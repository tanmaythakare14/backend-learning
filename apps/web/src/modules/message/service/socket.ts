import { io, type Socket } from 'socket.io-client';
import { config } from '@/config/environment';

let socket: Socket | null = null;

/** One shared connection for the whole app — created lazily on first use. */
export function getChatSocket(): Socket {
  if (!socket) {
    socket = io(`${config.apiUrl}/chat`, { transports: ['websocket'] });
  }
  return socket;
}
