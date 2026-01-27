'use client';

import React from 'react';

export const ArtifactShell: React.FC = () => {
  return (
    <div className="artifact-shell">
      <div className="artifact-header">
        <h2>Artifacts</h2>
      </div>

      <div className="artifact-content">
        {/* Artifact renderer will be implemented in Phase 6 */}
        <div className="artifact-placeholder">
          <p>Artifact Shell Ready</p>
          <p className="text-muted">Phase 6: Artifact System</p>
        </div>
      </div>
    </div>
  );
};
