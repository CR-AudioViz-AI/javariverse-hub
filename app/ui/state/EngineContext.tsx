'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { aecReducer, initialAECState, AECState, AECAction } from './AECStateMachine';

interface EngineContextType {
  state: AECState;
  dispatch: React.Dispatch<AECAction>;
}

const EngineContext = createContext<EngineContextType | undefined>(undefined);

export const EngineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(aecReducer, initialAECState);

  return (
    <EngineContext.Provider value={{ state, dispatch }}>
      {children}
    </EngineContext.Provider>
  );
};

export const useEngine = () => {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error('useEngine must be used within EngineProvider');
  }
  return context;
};
