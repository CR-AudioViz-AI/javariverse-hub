/**
 * AEC State Machine
 * Adaptive Engagement Controller state transitions
 */

export type AECMode = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export interface AECState {
  mode: AECMode;
  activeAvatar: string | null;
  isProcessing: boolean;
  lastUpdate: number;
}

export const initialAECState: AECState = {
  mode: 'idle',
  activeAvatar: null,
  isProcessing: false,
  lastUpdate: Date.now()
};

export type AECAction =
  | { type: 'START_LISTENING' }
  | { type: 'START_THINKING' }
  | { type: 'START_SPEAKING'; avatar: string }
  | { type: 'RETURN_TO_IDLE' }
  | { type: 'SET_ERROR'; error: string };

export function aecReducer(state: AECState, action: AECAction): AECState {
  switch (action.type) {
    case 'START_LISTENING':
      return {
        ...state,
        mode: 'listening',
        isProcessing: true,
        lastUpdate: Date.now()
      };
    
    case 'START_THINKING':
      return {
        ...state,
        mode: 'thinking',
        isProcessing: true,
        lastUpdate: Date.now()
      };
    
    case 'START_SPEAKING':
      return {
        ...state,
        mode: 'speaking',
        activeAvatar: action.avatar,
        isProcessing: true,
        lastUpdate: Date.now()
      };
    
    case 'RETURN_TO_IDLE':
      return {
        ...state,
        mode: 'idle',
        activeAvatar: null,
        isProcessing: false,
        lastUpdate: Date.now()
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        mode: 'error',
        isProcessing: false,
        lastUpdate: Date.now()
      };
    
    default:
      return state;
  }
}
