import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Plus,
  Share2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Globe,
  Download,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  type ChatSession,
  type Message,
  type LanguageCode,
  SUPPORTED_LANGUAGES,
} from '../types';
import {
  generateChatTitle,
  detectLanguage,
  exportSessionAsMarkdown,
  exportSessionAsJSON,
} from '../utils/chatHelpers';

interface ChatInterfaceProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onOpenDeploymentGuide: () => void;
  onNavigateHome: () => void;
}

const STORAGE_KEY = 'sohaib_ai_sessions_v1';
const ACTIVE_SESSION_KEY = 'sohaib_ai_active_id_v1';

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  initialPrompt,
  onClearInitialPrompt,
  onOpenDeploymentGuide,
  onNavigateHome,
}) => {
  // Sessions & Active Session State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load sessions from localStorage:', e);
    }
    const defaultSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    return [defaultSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (savedId) return savedId;
    } catch {}
    return sessions[0]?.id || 'session-default';
  });

  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('auto');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState<string>('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Voice Speech-To-Text state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  // Audio Text-To-Speech state
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // DOM Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active session helper
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [sessions, activeSessionId]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isLoading]);

  // Handle incoming initialPrompt from Landing Page
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  // Initialize Speech Recognition once
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = true;

      recognizer.onstart = () => {
        setIsListening(true);
      };

      recognizer.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
        }
      };

      recognizer.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognizer;
    } catch (e) {
      console.warn('Could not initialize speech recognition:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    adjustTextareaHeight();
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Speech Recognition is not supported by your current browser. You can still type in any language.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage);
        recognitionRef.current.lang = langConfig?.speechLocale || 'ar-MA';
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsListening(false);
      }
    }
  };

  // Text-To-Speech read aloud
  const handleToggleSpeak = (messageId: string, text: string, langHint?: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device.');
      return;
    }

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Strip code blocks from speech for natural audio
    const cleanSpeechText = text
      .replace(/```[\s\S]*?```/g, ' [Code Block] ')
      .replace(/[`*_#>-]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);

    // Determine voice locale
    let targetLocale = 'en-US';
    const detected = langHint || detectLanguage(cleanSpeechText);

    if (detected === 'darija' || detected === 'arabic') {
      targetLocale = 'ar-SA';
    } else if (detected === 'french') {
      targetLocale = 'fr-FR';
    }

    utterance.lang = targetLocale;
    utterance.rate = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // Create new session
  const handleCreateNewSession = () => {
    const newSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setErrorMessage(null);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  // Delete a session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length === 1) {
      // Reset only session
      const resetSession: ChatSession = {
        id: 'session-' + Date.now(),
        title: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };
      setSessions([resetSession]);
      setActiveSessionId(resetSession.id);
      return;
    }

    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    if (activeSessionId === sessionId) {
      setActiveSessionId(updated[0].id);
    }
  };

  // Rename session
  const startRenamingSession = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitleText(session.title);
  };

  const handleSaveRename = (sessionId: string) => {
    if (!editTitleText.trim()) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: editTitleText.trim() } : s))
    );
    setEditingSessionId(null);
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    const userMsgLanguage = detectLanguage(text);

    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      language: userMsgLanguage,
    };

    // Update active session with user message
    const updatedMessages = [...(currentSession?.messages || []), userMessage];
    const newTitle =
      currentSession?.messages.length === 0
        ? generateChatTitle(text)
        : currentSession?.title || 'Conversation';

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSession.id
          ? {
              ...s,
              title: newTitle,
              updatedAt: Date.now(),
              messages: updatedMessages,
            }
          : s
      )
    );

    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          preferredLanguage: selectedLanguage !== 'auto' ? selectedLanguage : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server returned ${response.status}`);
      }

      const assistantMessage: Message = {
        id: 'msg-' + Date.now() + '-assistant',
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
        language: detectLanguage(data.content),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSession.id
            ? {
                ...s,
                updatedAt: Date.now(),
                messages: [...updatedMessages, assistantMessage],
              }
            : s
        )
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(
        err.message || 'Could not communicate with Sohaib AI. Please verify your connection or try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcut in textarea: Enter to send, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy message
  const handleCopyMessage = async (msgId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(msgId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  // Export current session
  const handleExport = (format: 'markdown' | 'json') => {
    if (!currentSession) return;
    const content =
      format === 'markdown'
        ? exportSessionAsMarkdown(currentSession)
        : exportSessionAsJSON(currentSession);
    const blob = new Blob([content], {
      type: format === 'markdown' ? 'text/markdown;charset=utf-8' : 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSession.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${format === 'markdown' ? 'md' : 'json'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentPlaceholder =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.placeholder ||
    'Ask in Darija, Arabic, French, or English...';

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar for Conversation History */}
      <aside
        className={`fixed inset-y-16 left-0 z-30 flex flex-col border-r border-slate-800 bg-slate-950 transition-all duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'w-72 translate-x-0' : '-translate-x-full md:w-0 md:border-r-0 overflow-hidden'
        }`}
      >
        {/* Sidebar Header & New Chat Button */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <button
            type="button"
            onClick={handleCreateNewSession}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-semibold text-slate-950 transition-all hover:bg-amber-300 active:scale-95 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Conversation</span>
          </button>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Conversations ({sessions.length})</span>
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear all conversation history?')) {
                  localStorage.removeItem(STORAGE_KEY);
                  handleCreateNewSession();
                }
              }}
              className="text-slate-500 hover:text-red-400 transition-colors"
              title="Clear all sessions"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const isEditing = editingSessionId === session.id;

            return (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setErrorMessage(null);
                }}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 border border-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                }`}
              >
                {isEditing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveRename(session.id);
                    }}
                    className="flex-1 mr-2"
                  >
                    <input
                      type="text"
                      value={editTitleText}
                      onChange={(e) => setEditTitleText(e.target.value)}
                      onBlur={() => handleSaveRename(session.id)}
                      autoFocus
                      className="w-full bg-slate-800 text-white px-2 py-1 rounded border border-amber-500/50 outline-none text-xs"
                    />
                  </form>
                ) : (
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="truncate">{session.title}</p>
                    <p className="text-[10px] text-slate-500">
                      {session.messages.length} msgs · {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}

                {/* Session Action buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => startRenamingSession(session, e)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Rename"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="p-1 text-slate-400 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800 p-3 space-y-2 text-xs text-slate-400">
          <button
            type="button"
            onClick={onOpenDeploymentGuide}
            className="flex w-full items-center gap-2 rounded-lg p-2 hover:bg-slate-900 hover:text-white transition-colors"
          >
            <Globe className="h-4 w-4 text-amber-400" />
            <span>Custom Domain Setup</span>
          </button>
          <div className="text-[11px] text-slate-500 px-2 pt-1">
            <span>Model: Gemini 3.8 Flash</span>
          </div>
        </div>
      </aside>

      {/* Central Chat Area */}
      <main className="relative flex flex-1 flex-col overflow-hidden bg-slate-950">
        {/* Chat Studio Header */}
        <div className="flex h-14 items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-4 md:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="min-w-0">
              <h2 className="truncate text-xs md:text-sm font-semibold text-white">
                {currentSession?.title || 'New Conversation'}
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>Gemini 3.8 Flash</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400/90 font-mono">Multilingual Core</span>
              </div>
            </div>
          </div>

          {/* Action buttons on header */}
          <div className="flex items-center gap-2">
            {/* Preferred Language selector */}
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
                className="appearance-none rounded-lg border border-slate-800 bg-slate-900/90 py-1.5 pl-3 pr-7 text-xs text-slate-200 outline-none hover:border-slate-700 cursor-pointer"
                aria-label="Language Mode Selector"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-950 text-slate-200">
                    {l.nativeLabel}
                  </option>
                ))}
              </select>
              <Globe className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Export Menu */}
            {currentSession && currentSession.messages.length > 0 && (
              <button
                type="button"
                onClick={() => handleExport('markdown')}
                className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                title="Export Conversation as Markdown"
              >
                <Download className="h-3.5 w-3.5 text-amber-400" />
                <span>Export</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {(!currentSession || currentSession.messages.length === 0) ? (
            /* Empty State / Welcome Screen */
            <div className="flex h-full flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6 py-8">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-3xl shadow-xl shadow-amber-500/10">
                S
              </div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  Salam! Welcome to Sohaib AI
                </h3>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-md">
                  I can assist you in <span className="text-amber-400">Moroccan Darija</span>, <span className="text-amber-400">Arabic</span>, <span className="text-amber-400">French</span>, and <span className="text-amber-400">English</span>.
                  Ask general questions, request code, translate text, or dictate via microphone.
                </p>
              </div>

              {/* 4 Starter Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
                <button
                  type="button"
                  onClick={() => handleSendMessage('Salam Sohaib! Kifach ntelem React w TypeScript b Darija?')}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 hover:border-amber-400/50 hover:bg-slate-900 transition-all text-xs space-y-1"
                >
                  <p className="font-semibold text-white">🇲🇦 بالدارجة: تعلم البرمجة</p>
                  <p className="text-slate-400">Salam Sohaib! Kifach ntelem React w TypeScript b Darija?</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendMessage('اشرح لي بنية قواعد البيانات العلائقية vs NoSQL مع مثال عملي.')}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 hover:border-amber-400/50 hover:bg-slate-900 transition-all text-xs space-y-1"
                >
                  <p className="font-semibold text-white">🇸🇦 بالعربية: هندسة البيانات</p>
                  <p className="text-slate-400">اشرح لي بنية قواعد البيانات العلائقية vs NoSQL مع مثال عملي.</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendMessage('Peux-tu écrire une fonction en Python pour analyser un fichier CSV et tracer des graphiques ?')}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 hover:border-amber-400/50 hover:bg-slate-900 transition-all text-xs space-y-1"
                >
                  <p className="font-semibold text-white">🇫🇷 En Français: Script Python</p>
                  <p className="text-slate-400">Écrire une fonction Python pour analyser un CSV.</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendMessage('Architect an Express.js backend with JWT authentication and rate limiting.')}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 hover:border-amber-400/50 hover:bg-slate-900 transition-all text-xs space-y-1"
                >
                  <p className="font-semibold text-white">🇬🇧 In English: Backend Architecture</p>
                  <p className="text-slate-400">Architect Express.js with JWT authentication and rate limiting.</p>
                </button>
              </div>
            </div>
          ) : (
            /* Rendered Messages */
            currentSession.messages.map((message) => {
              const isUser = message.role === 'user';
              const isSpeaking = speakingMessageId === message.id;
              const isCopied = copiedMessageId === message.id;

              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-4xl mx-auto w-full`}
                >
                  <div className="flex items-start gap-3 max-w-[92%] sm:max-w-[85%]">
                    {!isUser && (
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-xs shrink-0 mt-1 shadow-md">
                        S
                      </div>
                    )}

                    <div
                      className={`rounded-2xl px-4 py-3.5 shadow-sm text-sm ${
                        isUser
                          ? 'bg-amber-400 text-slate-950 font-medium'
                          : 'bg-slate-900 border border-slate-800 text-slate-200'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      ) : (
                        <MarkdownRenderer content={message.content} />
                      )}
                    </div>
                  </div>

                  {/* Message Action Bar (for Assistant replies) */}
                  {!isUser && (
                    <div className="flex items-center gap-2 pl-11 pt-1.5 text-xs text-slate-500">
                      <button
                        type="button"
                        onClick={() => handleToggleSpeak(message.id, message.content, message.language)}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 transition-colors ${
                          isSpeaking ? 'text-amber-400 bg-amber-400/10' : 'hover:text-slate-300'
                        }`}
                        title={isSpeaking ? 'Stop speech playback' : 'Read aloud response'}
                        aria-label="Read aloud response"
                      >
                        {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                        <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyMessage(message.id, message.content)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 hover:text-slate-300 transition-colors"
                        title="Copy message"
                        aria-label="Copy message"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <span className="text-[10px] text-slate-600">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Typing / Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 max-w-4xl mx-auto w-full">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-xs shrink-0 shadow-md">
                S
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-amber-300/80">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-bounce" />
                <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-slate-400 font-sans ml-1">Sohaib AI is thinking...</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="max-w-4xl mx-auto w-full rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-200">Error processing request</p>
                  <p className="mt-0.5 text-red-300/90">{errorMessage}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const lastUserMsg = currentSession?.messages.filter((m) => m.role === 'user').slice(-1)[0];
                  if (lastUserMsg) handleSendMessage(lastUserMsg.content);
                }}
                className="rounded-lg bg-red-500/20 px-3 py-1 text-red-200 hover:bg-red-500/30 transition-colors shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-800/80 bg-slate-950/80 p-3 md:p-4 backdrop-blur-md">
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Listening Indicator Bar */}
            {isListening && (
              <div className="flex items-center justify-between rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs text-amber-300">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  <span>Listening... Speak in Moroccan Darija, Arabic, French, or English</span>
                </div>
                <button
                  type="button"
                  onClick={toggleListening}
                  className="font-medium text-amber-400 underline hover:text-amber-300"
                >
                  Done
                </button>
              </div>
            )}

            <div className="relative flex items-end gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-2 shadow-lg focus-within:border-amber-400/80 transition-colors">
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={currentPlaceholder}
                rows={1}
                aria-label="Message input"
                className="flex-1 max-h-44 resize-none bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 outline-none leading-relaxed"
              />

              {/* Controls */}
              <div className="flex items-center gap-1 shrink-0 pb-1">
                {/* Voice / Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  aria-label={isListening ? 'Stop listening' : 'Start voice speech input'}
                  className={`rounded-xl p-2 transition-all ${
                    isListening
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/30 animate-pulse'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-amber-400'
                  }`}
                  title={isListening ? 'Click to stop listening' : 'Dictate with voice (Moroccan Darija/Arabic/FR/EN)'}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isLoading}
                  aria-label="Send message"
                  className={`rounded-xl p-2 transition-all ${
                    inputText.trim() && !isLoading
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-95 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Micro Hint */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
              <span>Press <kbd className="rounded bg-slate-800 px-1 py-0.5 text-slate-400 font-mono">Enter</kbd> to send, <kbd className="rounded bg-slate-800 px-1 py-0.5 text-slate-400 font-mono">Shift+Enter</kbd> for new line</span>
              <span>Sohaib AI protects your context</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
