import { useEffect, useRef, useState } from 'react';

// Simple socket hook that connects to an env-configured socket server
// - REACT_APP_SOCKET_URL can be set in .env to override the default
// - Exposes: connected, joinRoom, leaveRoom, emit, on, off
// NOTE: socket.io-client is dynamically imported so the app runs even if the dependency
// is not installed (graceful fallback to offline/localStorage mode).

const useSocket = (user) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const handlersRef = useRef(new Map());

  useEffect(() => {
    let mounted = true;
    let socket = null;
    const url = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';

    // dynamically import to avoid hard failure when dependency missing
    (async () => {
      try {
        const module = await import('socket.io-client');
        const { io } = module;
        socket = io(url, {
          autoConnect: true,
          auth: { userId: user?.id },
          transports: ['websocket', 'polling'],
        });

        if (!mounted) return;
        socketRef.current = socket;

        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
      } catch (err) {
        // Dependency missing or failed to connect: stay offline and let app use local fallback
        console.warn('Socket client not available, continuing in offline mode.', err?.message || err);
        setConnected(false);
      }
    })();

    return () => {
      mounted = false;
      if (socketRef.current) {
        try {
          socketRef.current.disconnect();
        } catch (e) { /* ignore */ }
        socketRef.current = null;
      }
    };
  }, [user?.id]);

  const joinRoom = (room) => socketRef.current?.emit('join', { room });
  const leaveRoom = (room) => socketRef.current?.emit('leave', { room });
  const emit = (event, payload) => socketRef.current?.emit?.(event, payload);
  const on = (event, cb) => {
    if (!socketRef.current) {
      // store handlers so they can be applied later when socket connects
      handlersRef.current.set(event, cb);
      return;
    }
    socketRef.current.on(event, cb);
  };
  const off = (event, cb) => socketRef.current?.off?.(event, cb);

  return { connected, joinRoom, leaveRoom, emit, on, off, socket: socketRef.current };
};

export default useSocket;
