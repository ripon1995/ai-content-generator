import { useEffect } from 'react';
import { useSocketContext } from '../contexts/SocketContext';
import {
  ContentGenerationStartedPayload,
  ContentGenerationCompletedPayload,
  ContentGenerationFailedPayload,
} from '../types/socket.types';

interface UseSocketCallbacks {
  onGenerationStarted?: (payload: ContentGenerationStartedPayload) => void;
  onGenerationCompleted?: (payload: ContentGenerationCompletedPayload) => void;
  onGenerationFailed?: (payload: ContentGenerationFailedPayload) => void;
}

interface UseSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
}

// Custom hook to listen for content generation events
export const useSocket = (callbacks: UseSocketCallbacks = {}): UseSocketReturn => {
  const {
    isConnected,
    isConnecting,
    onContentGenerationStarted,
    onContentGenerationCompleted,
    onContentGenerationFailed,
  } = useSocketContext();

  const { onGenerationStarted, onGenerationCompleted, onGenerationFailed } = callbacks;

  useEffect(() => {
    if (!isConnected) return;

    // listen for generation started event
    if (onGenerationStarted) {
      return onContentGenerationStarted(onGenerationStarted);
    }
  }, [isConnected, onGenerationStarted, onContentGenerationStarted]);

  useEffect(() => {
    if (!isConnected) return;

    // listen for generation completed event
    if (onGenerationCompleted) {
      return onContentGenerationCompleted(onGenerationCompleted);
    }
  }, [isConnected, onGenerationCompleted, onContentGenerationCompleted]);

  useEffect(() => {
    if (!isConnected) return;

    // listen for generation failed event
    if (onGenerationFailed) {
      return onContentGenerationFailed(onGenerationFailed);
    }
  }, [isConnected, onGenerationFailed, onContentGenerationFailed]);

  return {
    isConnected,
    isConnecting,
  };
};
