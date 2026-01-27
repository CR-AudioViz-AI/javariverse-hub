'use client';

import React from 'react';
import { useEngine } from '../state/EngineContext';

export const AvatarShell: React.FC = () => {
  const { state } = useEngine();

  return (
    <div className="avatar-shell">
      <div className="avatar-header">
        <h2>Javari AI</h2>
        <div className="avatar-status">
          <span className={`status-indicator status-${state.mode}`} />
          <span className="status-text">{state.mode}</span>
        </div>
      </div>

      <div className="avatar-container">
        {/* Avatar video/canvas will be mounted here in Phase 4 */}
        <div className="avatar-placeholder">
          <p>Avatar Shell Ready</p>
          <p className="text-muted">Phase 4: Avatar Integration</p>
        </div>
      </div>
    </div>
  );
};
