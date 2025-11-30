import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getAccessToken } from '../utils/storage';
import {
  SocketEvents,
  ContentGenerationStartedPayload,
  ContentGenerationCompletedPayload,
  ContentGenerationFailedPayload,
} from '../types/socket.types';

// socket server URL from environment or default
// remove /api suffix if present since Socket.IO connects to root
const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  return apiUrl.replace(/\/api$/, '');
};

const SOCKET_URL = getSocketUrl();

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
}

interface SocketContextType extends SocketState {
  connect: () => void;
  disconnect: () => void;
  onContentGenerationStarted: (
    callback: (payload: ContentGenerationStartedPayload) => void
  ) => void;
  onContentGenerationCompleted: (
    callback: (payload: ContentGenerationCompletedPayload) => void
  ) => void;
  onContentGenerationFailed: (callback: (payload: ContentGenerationFailedPayload) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [state, setState] = useState<SocketState>({
    socket: null,
    isConnected: false,
    isConnecting: false,
  });

  const { isAuthenticated } = useAuth();

  // connect to socket.io server
  const connect = useCallback(() => {
    // don't connect if already connected or connecting
    if (state.socket || state.isConnecting) {
      return;
    }

    // don't connect if not authenticated
    if (!isAuthenticated) {
      console.warn('[Socket] Cannot connect: User not authenticated');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.warn('[Socket] Cannot connect: No access token');
      return;
    }

    console.log('[Socket] Connecting to:', SOCKET_URL);
    setState((prev) => ({ ...prev, isConnecting: true }));

    // create socket connection with JWT authentication
    const socketInstance = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // connection event handlers
    socketInstance.on(SocketEvents.CONNECTION, () => {
      console.log('[Socket] Connected successfully, Socket ID:', socketInstance.id);
      setState({
        socket: socketInstance,
        isConnected: true,
        isConnecting: false,
      });
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected successfully, Socket ID:', socketInstance.id);
      setState({
        socket: socketInstance,
        isConnected: true,
        isConnecting: false,
      });
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      setState({
        socket: null,
        isConnected: false,
        isConnecting: false,
      });
    });

    socketInstance.on(SocketEvents.DISCONNECT, (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setState({
        socket: null,
        isConnected: false,
        isConnecting: false,
      });
    });

    socketInstance.on(SocketEvents.ERROR, (error) => {
      console.error('[Socket] Error:', error);
    });

    // store socket instance immediately
    setState((prev) => ({
      ...prev,
      socket: socketInstance,
    }));
  }, [isAuthenticated, state.socket, state.isConnecting]);

  // disconnect from socket.io server
  const disconnect = useCallback(() => {
    if (state.socket) {
      console.log('[Socket] Disconnecting...');
      state.socket.disconnect();
      setState({
        socket: null,
        isConnected: false,
        isConnecting: false,
      });
    }
  }, [state.socket]);

  // auto-connect when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    // cleanup on unmount
    return () => {
      disconnect();
    };
  }, [isAuthenticated]);

  // listen for content generation started event
  const onContentGenerationStarted = useCallback(
    (callback: (payload: ContentGenerationStartedPayload) => void) => {
      if (!state.socket) {
        console.warn('[Socket] Cannot listen: Socket not connected');
        return;
      }

      state.socket.on(SocketEvents.CONTENT_GENERATION_STARTED, callback);

      // return cleanup function
      return () => {
        state.socket?.off(SocketEvents.CONTENT_GENERATION_STARTED, callback);
      };
    },
    [state.socket]
  );

  // listen for content generation completed event
  const onContentGenerationCompleted = useCallback(
    (callback: (payload: ContentGenerationCompletedPayload) => void) => {
      if (!state.socket) {
        console.warn('[Socket] Cannot listen: Socket not connected');
        return;
      }

      state.socket.on(SocketEvents.CONTENT_GENERATION_COMPLETED, callback);

      // return cleanup function
      return () => {
        state.socket?.off(SocketEvents.CONTENT_GENERATION_COMPLETED, callback);
      };
    },
    [state.socket]
  );

  // listen for content generation failed event
  const onContentGenerationFailed = useCallback(
    (callback: (payload: ContentGenerationFailedPayload) => void) => {
      if (!state.socket) {
        console.warn('[Socket] Cannot listen: Socket not connected');
        return;
      }

      state.socket.on(SocketEvents.CONTENT_GENERATION_FAILED, callback);

      // return cleanup function
      return () => {
        state.socket?.off(SocketEvents.CONTENT_GENERATION_FAILED, callback);
      };
    },
    [state.socket]
  );

  const value: SocketContextType = {
    ...state,
    connect,
    disconnect,
    onContentGenerationStarted,
    onContentGenerationCompleted,
    onContentGenerationFailed,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

// custom hook to use socket context
export const useSocketContext = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
