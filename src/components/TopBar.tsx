import React from 'react';
import { MessageSquare, BookOpen, Sparkles, Terminal } from 'lucide-react';

interface TopBarProps {
  currentView: 'landing' | 'chat';
  onNavigate: (view: 'landing' | 'chat') => void;
  onOpenDeploymentGuide: () => void;
  onNewChat?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onNavigate,
  onOpenDeploymentGuide,
  onNewChat,
}) => {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between gap-8 border-b border-slate-800/80 bg-slate-950/80 px-6 backdrop-blur-md">
      {/* Zone 1: Brand Wordmark (Single text element with emblem) */}
      <button
        type="button"
        onClick={() => onNavigate('landing')}
        className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-90 shrink-0"
        aria-label="Sohaib AI Home"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20">
          <span className="font-mono text-sm tracking-tighter">S</span>
        </div>
        <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
          Sohaib AI
        </span>
      </button>

      {/* Zone 2: 4 Clean Single-Line Text Nav Links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className={`transition-colors whitespace-nowrap hover:text-white ${
            currentView === 'landing' ? 'text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => {
            onNavigate('landing');
            setTimeout(() => {
              const el = document.getElementById('capabilities');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          }}
          className="text-slate-400 hover:text-white transition-colors whitespace-nowrap"
        >
          Capabilities
        </button>
        <button
          type="button"
          onClick={() => onNavigate('chat')}
          className={`transition-colors whitespace-nowrap hover:text-white ${
            currentView === 'chat' ? 'text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Chat Assistant
        </button>
        <button
          type="button"
          onClick={onOpenDeploymentGuide}
          className="text-slate-400 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <BookOpen className="h-3.5 w-3.5 text-amber-400" />
          <span>Deployment Guide</span>
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        {currentView === 'landing' ? (
          <button
            type="button"
            onClick={() => onNavigate('chat')}
            className="flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm transition-all hover:bg-amber-300 active:scale-95 whitespace-nowrap shrink-0"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Start Chatting</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNewChat}
            className="flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm transition-all hover:bg-amber-300 active:scale-95 whitespace-nowrap shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>New Chat</span>
          </button>
        )}
      </div>
    </header>
  );
};
