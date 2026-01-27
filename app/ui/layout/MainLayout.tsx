'use client';

import React from 'react';
import './layout.css';
import { AvatarShell } from '../avatar/AvatarShell';
import { ChatShell } from '../chat/ChatShell';
import { ArtifactShell } from '../artifacts/ArtifactShell';
import { EngineProvider } from '../state/EngineContext';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <EngineProvider>
      <div className="main-layout">
        {/* Left: Avatar Column */}
        <aside className="avatar-column">
          <AvatarShell />
        </aside>

        {/* Center: Chat Column */}
        <main className="chat-column">
          <ChatShell />
        </main>

        {/* Right: Artifact Column */}
        <aside className="artifact-column">
          <ArtifactShell />
        </aside>
      </div>
    </EngineProvider>
  );
};
