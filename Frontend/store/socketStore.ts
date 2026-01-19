import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type SocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

interface SocketState {

  status: SocketStatus;
  error: string | null;
  lastConnected: Date | null;

  setStatus: (status: SocketStatus) => void;
  setError: (error: string | null) => void;
  setConnected: () => void;
  setDisconnected: (error?: string) => void;
  reset: () => void;
}

export const useSocketStore = create<SocketState>()(
  devtools(
    (set) => ({
      status: 'idle',
      error: null,
      lastConnected: null,

      setStatus: (status) => set({ status }),
      
      setError: (error) => set({ error }),
      
      setConnected: () => set({ 
        status: 'connected', 
        error: null,
        lastConnected: new Date()
      }),
      
      setDisconnected: (error) => set({ 
        status: 'disconnected',
        error: error || 'Connection lost'
      }),
      
      reset: () => set({
        status: 'idle',
        error: null,
        lastConnected: null
      }),
    }),
    { name: 'SocketStore' }
  )
);