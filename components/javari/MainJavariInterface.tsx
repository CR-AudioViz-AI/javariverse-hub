'use client';

/**
 * JAVARI AI - FIXED Interface Layout
 * ===================================
 * FIXES:
 * - Proper viewport height calculation (accounts for header)
 * - Chat area scrolls, input stays fixed at bottom
 * - Auto-scroll to latest message
 * - Custom JAI icon instead of generic Bot
 * - New sleek Javari AI branding
 * 
 * @version 5.0.0
 * @date January 8, 2026
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Upload, File, X, Check, AlertCircle, Loader2, Send, User, 
  FileText, Image as ImageIcon, FileSpreadsheet, ChevronLeft, ChevronRight,
  Trash2, Plus, Star, MessageSquare, FolderKanban, Clock, Search,
  Download, MoreVertical, Sparkles, Settings, Zap, Clipboard
} from 'lucide-react';

// =============================================================================
// FEATURE FLAGS
// =============================================================================
const DOCS_AUTO_CLEAR_AFTER_SEND = true;
const TEXT_DOCS_ENABLED = true;

// =============================================================================
// COLORS
// =============================================================================
const COLORS = {
  javaribg: '#0f172a',
  cyan: '#06b6d4',
  javariCyan: '#00d4ff',
  javariPurple: '#a855f7',
  javariGradientStart: '#06b6d4',
  javariGradientEnd: '#8b5cf6',
};

// =============================================================================
// CUSTOM JAI ICON COMPONENT
// =============================================================================
const JAIIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="jaiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
      <filter id="jaiGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Outer ring */}
    <circle cx="20" cy="20" r="18" stroke="url(#jaiGradient)" strokeWidth="2" fill="none" filter="url(#jaiGlow)"/>
    {/* Inner hexagon shape */}
    <path d="M20 6 L32 13 L32 27 L20 34 L8 27 L8 13 Z" stroke="url(#jaiGradient)" strokeWidth="1.5" fill="rgba(6,182,212,0.1)"/>
    {/* JAI text */}
    <text x="20" y="24" textAnchor="middle" fill="url(#jaiGradient)" fontSize="11" fontWeight="bold" fontFamily="system-ui">JAI</text>
  </svg>
);

// =============================================================================
// JAVARI LOGO COMPONENT (3D-ish, sleek)
// =============================================================================
const JavariLogo = ({ size = 40 }: { size?: number }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <linearGradient id="logoGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <filter id="logoGlow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="innerShadow">
        <feOffset dx="2" dy="2"/>
        <feGaussianBlur stdDeviation="2" result="offset-blur"/>
        <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
        <feFlood floodColor="#000" floodOpacity="0.3" result="color"/>
        <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
        <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
      </filter>
    </defs>
    
    {/* Background circle with depth */}
    <circle cx="50" cy="50" r="45" fill="#1e293b" filter="url(#innerShadow)"/>
    <circle cx="50" cy="50" r="42" fill="none" stroke="url(#logoGradient1)" strokeWidth="2" opacity="0.5"/>
    
    {/* Main J shape - stylized, 3D-ish */}
    <path 
      d="M35 25 L65 25 L65 32 L55 32 L55 60 Q55 72 43 72 L30 72 L30 62 L40 62 Q45 62 45 57 L45 32 L35 32 Z" 
      fill="url(#logoGradient1)" 
      filter="url(#logoGlow)"
    />
    
    {/* AI letters - integrated */}
    <text x="62" y="75" fill="url(#logoGradient2)" fontSize="18" fontWeight="bold" fontFamily="system-ui" filter="url(#logoGlow)">AI</text>
    
    {/* Accent dots */}
    <circle cx="75" cy="30" r="4" fill="#22d3ee" opacity="0.8"/>
    <circle cx="25" cy="70" r="3" fill="#a855f7" opacity="0.8"/>
  </svg>
);

// =============================================================================
// AI PROVIDERS
// =============================================================================
const AI_PROVIDERS = [
  { id: 'claude', name: 'Claude', icon: '🟣', color: '#a855f7', available: true },
  { id: 'gpt4', name: 'GPT-4', icon: '🟢', color: '#10b981', available: true },
  { id: 'gemini', name: 'Gemini', icon: '🔵', color: '#3b82f6', available: true },
  { id: 'llama', name: 'Llama', icon: '🟠', color: '#f97316', available: false },
  { id: 'mistral', name: 'Mistral', icon: '🔴', color: '#ef4444', available: false },
];

// =============================================================================
// TYPES
// =============================================================================
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: { documentId: string; documentName: string; snippet: string }[];
}

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  status: 'processing' | 'ready' | 'error';
  uploadedAt: Date;
  isVirtual?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  starred: boolean;
  messages: Message[];
  updated_at: string;
  created_at: string;
  message_count: number;
  operatorMode?: boolean;
  canonicalSpecsLoaded?: boolean;
  docManifest?: { name: string; size: number; type: string; uploadedAt: string; isVirtual?: boolean }[];
}

interface VirtualDocument {
  name: string;
  content: string;
  type: string;
  size: number;
}

// =============================================================================
// UTILITIES
// =============================================================================
function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const typeMap: Record<string, string> = {
    'md': 'text/markdown', 'txt': 'text/plain', 'json': 'application/json',
    'yaml': 'text/yaml', 'yml': 'text/yaml', 'ts': 'text/typescript',
    'tsx': 'text/typescript', 'js': 'text/javascript', 'jsx': 'text/javascript',
    'pdf': 'application/pdf', 'doc': 'application/msword', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return typeMap[ext] || 'text/plain';
}

function parseVirtualDocs(text: string): { docs: VirtualDocument[]; cleanedText: string; hasVirtualDocs: boolean } {
  if (!TEXT_DOCS_ENABLED) return { docs: [], cleanedText: text, hasVirtualDocs: false };
  
  const pattern = /^FILE\s+\d+\s*[—\-–]\s*(.+?)\n([\s\S]*?)(?=\nFILE\s+\d+\s*[—\-–]|$)/gm;
  const docs: VirtualDocument[] = [];
  let match;
  
  while ((match = pattern.exec(text)) !== null) {
    const filename = match[1].trim();
    const content = match[2].trim();
    if (content.length > 0) {
      docs.push({ name: filename, content, type: getFileType(filename), size: new Blob([content]).size });
    }
  }
  
  if (docs.length > 0) {
    let cleaned = text.replace(/FILE\s+\d+\s*[—\-–]\s*.+?\n[\s\S]*?(?=\nFILE\s+\d+\s*[—\-–]|$)/g, '').trim();
    return { docs, cleanedText: cleaned, hasVirtualDocs: true };
  }
  
  return { docs: [], cleanedText: text, hasVirtualDocs: false };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export function MainJavariInterface() {
  // State
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'assistant',
    content: `Hello! I'm Javari, your AI assistant. Upload documents and I'll help you find information with citations. You can also paste document packs directly into the chat.`,
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('claude');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStarred, setFilterStarred] = useState(false);
  const [operatorMode, setOperatorMode] = useState(false);
  const [canonicalSpecsLoaded, setCanonicalSpecsLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // File handling
  const processFile = async (file: File): Promise<Document> => {
    const doc: Document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'processing',
      uploadedAt: new Date()
    };
    
    try {
      const text = await file.text();
      doc.content = text;
      doc.status = 'ready';
    } catch (err) {
      doc.status = 'error';
    }
    
    return doc;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    for (const file of Array.from(files)) {
      const doc = await processFile(file);
      setDocuments(prev => [...prev, doc]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    for (const file of Array.from(files)) {
      const doc = await processFile(file);
      setDocuments(prev => [...prev, doc]);
    }
  };

  const removeDocument = (id: string) => setDocuments(prev => prev.filter(d => d.id !== id));

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Check for virtual docs
    const { docs: virtualDocs, cleanedText, hasVirtualDocs } = parseVirtualDocs(input);
    
    if (hasVirtualDocs && virtualDocs.length > 0) {
      const newDocs: Document[] = virtualDocs.map((vd, idx) => ({
        id: `vdoc_${Date.now()}_${idx}`,
        name: vd.name,
        size: vd.size,
        type: vd.type,
        content: vd.content,
        status: 'ready' as const,
        uploadedAt: new Date(),
        isVirtual: true
      }));
      setDocuments(prev => [...prev, ...newDocs]);
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: hasVirtualDocs ? (cleanedText || `Uploaded ${virtualDocs.length} document(s)`) : input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const readyDocs = documents.filter(d => d.status === 'ready');
      
      await new Promise(resolve => setTimeout(resolve, 800));

      let answer: string;
      if (readyDocs.length === 0 && !hasVirtualDocs) {
        answer = `Upload documents using the panel on the right, or paste document packs directly into chat. I'll search through them to answer your questions with citations.`;
      } else {
        const totalDocs = readyDocs.length + (hasVirtualDocs ? virtualDocs.length : 0);
        answer = `I've processed ${totalDocs} document(s). How can I help you analyze them?`;
      }

      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: answer,
        timestamp: new Date()
      }]);
      
      if (DOCS_AUTO_CLEAR_AFTER_SEND && hasVirtualDocs) {
        // Keep docs visible for reference
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Conversation management
  const startNewChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Starting a new conversation! How can I help you?`,
      timestamp: new Date()
    }]);
    setDocuments([]);
    setInput('');
    setCurrentConversationId(`conv_${Date.now()}`);
  };

  const toggleStarred = (id: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, starred: !c.starred } : c));
  };

  const formatDate = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const filteredConversations = conversations.filter(conv => {
    if (filterStarred && !conv.starred) return false;
    if (searchQuery && !conv.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const readyDocsCount = documents.filter(d => d.status === 'ready').length;

  // =============================================================================
  // RENDER - Fixed layout with proper height calculation
  // =============================================================================
  return (
    <div className="h-[calc(100vh-84px)] flex overflow-hidden" style={{ backgroundColor: COLORS.javaribg }}>
      
      {/* ============== LEFT SIDEBAR ============== */}
      <div 
        className={`${leftSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden border-r flex flex-col flex-shrink-0`}
        style={{ borderColor: COLORS.cyan + '30' }}
      >
        {/* Logo Section - New Javari Logo */}
        <div className="p-4 border-b flex-shrink-0" style={{ borderColor: COLORS.cyan + '30' }}>
          <div className="flex items-center gap-3">
            <JavariLogo size={44} />
            <div>
              <h1 className="text-white font-bold text-lg bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Javari AI</h1>
              <p className="text-xs text-gray-400">Intelligent Assistant</p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3 flex-shrink-0">
          <button 
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white transition-all hover:opacity-90 bg-gradient-to-r from-cyan-500 to-purple-500"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-3 pb-2 flex gap-2 flex-shrink-0">
          <button
            onClick={() => setFilterStarred(false)}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterStarred ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-400'}`}
          >
            <MessageSquare className="w-3 h-3 inline mr-1" />All
          </button>
          <button
            onClick={() => setFilterStarred(true)}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStarred ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-gray-400'}`}
          >
            <Star className="w-3 h-3 inline mr-1" />Starred
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {filterStarred ? 'No starred chats' : 'No conversations yet'}
            </div>
          ) : (
            filteredConversations.map(conv => (
              <div
                key={conv.id}
                className={`p-2.5 rounded-lg mb-1 cursor-pointer group transition-all ${currentConversationId === conv.id ? 'bg-cyan-500/20' : 'hover:bg-white/5'}`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{conv.title}</p>
                    <span className="text-xs text-gray-500">{formatDate(conv.updated_at)}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleStarred(conv.id); }} className="opacity-0 group-hover:opacity-100 p-1">
                    <Star className={`w-3 h-3 ${conv.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Settings */}
        <div className="p-3 border-t flex-shrink-0" style={{ borderColor: COLORS.cyan + '30' }}>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <Settings className="w-4 h-4" /><span className="text-sm">Settings</span>
          </button>
        </div>
      </div>

      {/* Toggle Left Sidebar */}
      <button
        onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-r-lg bg-slate-800 text-gray-400 hover:text-white transition-all"
        style={{ left: leftSidebarOpen ? '286px' : '0', marginTop: '42px' }}
      >
        {leftSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* ============== MAIN CHAT AREA ============== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Messages Area - Scrollable */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar - JAI icon for assistant */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-cyan-500/20' : 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20'}`}>
                  {msg.role === 'user' 
                    ? <User className="w-5 h-5" style={{ color: COLORS.cyan }} />
                    : <JAIIcon className="w-6 h-6" />
                  }
                </div>

                {/* Message Content */}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-cyan-500/20 text-white rounded-br-sm' : 'bg-white/5 text-gray-200 rounded-bl-sm'}`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {/* Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Sources</p>
                      {msg.citations.map((cite, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-2.5 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-3 h-3" style={{ color: COLORS.cyan }} />
                            <span className="text-xs font-medium text-cyan-400">{cite.documentName}</span>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2">{cite.snippet}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-600 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-bl-sm px-4 py-2.5">
                  <p className="text-sm text-gray-400">Thinking...</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - FIXED at bottom */}
        <div className="border-t p-3 md:p-4 flex-shrink-0 bg-slate-900/50 backdrop-blur-sm" style={{ borderColor: COLORS.cyan + '30' }}>
          <div className="max-w-3xl mx-auto space-y-2.5">
            {/* Input field */}
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your documents, or paste FILE X — blocks..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-500 text-sm"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-4 rounded-xl text-white transition-all disabled:opacity-40 bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* AI Provider Selector Buttons */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {AI_PROVIDERS.map(provider => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  disabled={!provider.available}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                    selectedProvider === provider.id ? 'ring-1 ring-offset-1 ring-offset-slate-900' : 'opacity-60 hover:opacity-100'
                  } ${!provider.available ? 'opacity-30 cursor-not-allowed' : ''}`}
                  style={{ 
                    backgroundColor: selectedProvider === provider.id ? provider.color + '25' : 'rgba(255,255,255,0.05)',
                    color: selectedProvider === provider.id ? provider.color : '#9ca3af',
                    ringColor: provider.color
                  }}
                >
                  <span>{provider.icon}</span>{provider.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============== RIGHT SIDEBAR ============== */}
      <div 
        className={`${rightSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-l flex flex-col flex-shrink-0`}
        style={{ borderColor: COLORS.cyan + '30' }}
      >
        {/* Javari Avatar Section */}
        <div className="p-4 border-b flex flex-col items-center flex-shrink-0" style={{ borderColor: COLORS.cyan + '30' }}>
          <div className="relative mb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 p-0.5">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <JavariLogo size={48} />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-slate-900 animate-pulse" />
          </div>
          <p className="text-white font-semibold text-sm">Javari AI</p>
          <p className="text-xs text-gray-400">Online • Ready</p>
          <p className="text-xs mt-1" style={{ color: COLORS.cyan }}>
            {AI_PROVIDERS.find(p => p.id === selectedProvider)?.name}
          </p>
          
          {/* Operator Mode Toggle */}
          <button
            onClick={() => setOperatorMode(!operatorMode)}
            className={`mt-2 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              operatorMode ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3" />
            Operator {operatorMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Documents Section */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-3 border-b flex-shrink-0" style={{ borderColor: COLORS.cyan + '30' }}>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: COLORS.cyan }} />
              Documents ({readyDocsCount})
            </h3>
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`m-3 border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex-shrink-0 ${isDragging ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/20 hover:border-white/40 bg-white/5'}`}
          >
            <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
            <Upload className={`w-6 h-6 mx-auto mb-1 ${isDragging ? 'text-cyan-400' : 'text-gray-400'}`} />
            <p className="text-white text-xs font-medium">Drop files here</p>
            <p className="text-xs text-gray-500">or click to browse</p>
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg group">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  doc.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                  doc.status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'
                }`}>
                  {doc.status === 'processing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                   doc.status === 'ready' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate flex items-center gap-1">
                    {doc.name}
                    {doc.isVirtual && <Clipboard className="w-2.5 h-2.5 text-cyan-400" />}
                  </p>
                  <p className="text-xs text-gray-500">{(doc.size/1024).toFixed(1)} KB</p>
                </div>
                <button onClick={() => removeDocument(doc.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded text-gray-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toggle Right Sidebar */}
      <button
        onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-l-lg bg-slate-800 text-gray-400 hover:text-white transition-all"
        style={{ right: rightSidebarOpen ? '254px' : '0', marginTop: '42px' }}
      >
        {rightSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default MainJavariInterface;
