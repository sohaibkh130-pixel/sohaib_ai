/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { LandingPage } from './components/LandingPage';
import { ChatInterface } from './components/ChatInterface';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'chat'>(() => {
    // If URL has autostart or view=chat, jump straight to chat
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1' || params.get('view') === 'chat') {
        return 'chat';
      }
    }
    return 'landing';
  });

  const [initialChatPrompt, setInitialChatPrompt] = useState<string | undefined>(undefined);
  const [isDeploymentGuideOpen, setIsDeploymentGuideOpen] = useState<boolean>(false);

  const handleStartChat = (prompt?: string) => {
    if (prompt) {
      setInitialChatPrompt(prompt);
    }
    setCurrentView('chat');
  };

  const handleClearInitialPrompt = () => {
    setInitialChatPrompt(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Bar Navigation */}
      <TopBar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenDeploymentGuide={() => setIsDeploymentGuideOpen(true)}
        onNewChat={() => {
          setCurrentView('chat');
        }}
      />

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'landing' ? (
          <LandingPage
            onStartChat={handleStartChat}
            onOpenDeploymentGuide={() => setIsDeploymentGuideOpen(true)}
          />
        ) : (
          <ChatInterface
            initialPrompt={initialChatPrompt}
            onClearInitialPrompt={handleClearInitialPrompt}
            onOpenDeploymentGuide={() => setIsDeploymentGuideOpen(true)}
            onNavigateHome={() => setCurrentView('landing')}
          />
        )}
      </div>

      {/* Deployment & Custom Domain Guide Modal */}
      <DeploymentGuideModal
        isOpen={isDeploymentGuideOpen}
        onClose={() => setIsDeploymentGuideOpen(false)}
      />
    </div>
  );
}
