import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, user }     = useAuth();
  const socketRef           = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    const sock = socketRef.current;
    sock.on('connect',    () => { setConnected(true); console.log('Socket connected'); });
    sock.on('disconnect', () => { setConnected(false); console.log('Socket disconnected'); });
    sock.on('connect_error', (err) => console.warn('Socket error:', err.message));

    // Join personal room
    sock.emit('join:user_room', { userId: user.id, role: user.role });

    return () => {
      sock.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [token, user]);

  const emit = (event, data) => socketRef.current?.emit(event, data);
  const on   = (event, cb)   => { socketRef.current?.on(event, cb); return () => socketRef.current?.off(event, cb); };
  const off  = (event, cb)   => socketRef.current?.off(event, cb);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
