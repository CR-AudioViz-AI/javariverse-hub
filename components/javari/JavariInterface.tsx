// =============================================================================
// JAVARI INTERFACE - Complete AI Assistant with Document Upload
// Features:
// - Drag/drop file upload (any file type, never reject)
// - Multi-file upload with progress
// - Document-aware chat
// - Citations in answers
// - Full provider selector
// =============================================================================

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, File, X, Check, AlertCircle, Loader2, Send, Bot, User, 
  FileText, Image, FileSpreadsheet, Paperclip, ChevronDown, Sparkles
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface UploadedDoc {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  error?: string;
}

interface Citation {
  documentId: string;
  documentName: string;
  page?: number;
  section?: string;
  snippet: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

interface Provider {
  provider_id: string;
  display_name: string;
  status: string;
  type: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function JavariInterface() {
  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm Javari, your AI assistant. You can upload documents (drag & drop or click) and I'll help you understand them, answer questions, and provide citations. What would you like to work on?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('auto');
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =============================================================================
  // LOAD PROVIDERS
  // =============================================================================
  
  useEffect(() => {
    fetch('/api/providers')
      .then(res => res.json())
      .then(data => {
        if (data.providers) {
          setProviders(data.providers);
        }
      })
      .catch(err => console.error('Failed to load providers:', err));
  }, []);

  // =============================================================================
  // SCROLL TO BOTTOM
  // =============================================================================
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // =============================================================================
  // FILE UPLOAD HANDLERS
  // =============================================================================

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    // Add to list immediately
    const newDoc: UploadedDoc = {
      id,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      status: 'uploading',
      progress: 0
    };
    setDocuments(prev => [...prev, newDoc]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setDocuments(prev => prev.map(d => 
          d.id === id && d.progress < 80 
            ? { ...d, progress: d.progress + 20 }
            : d
        ));
      }, 200);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/docs/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (result.success || result.document_id) {
        setDocuments(prev => prev.map(d => 
          d.id === id 
            ? { ...d, id: result.document_id || id, status: 'ready', progress: 100 }
            : d
        ));
        
        // Add system message
        setMessages(prev => [...prev, {
          id: `sys_${Date.now()}`,
          role: 'assistant',
          content: `📄 **${file.name}** uploaded and ready. You can now ask questions about this document.`,
          timestamp: new Date()
        }]);
      } else {
        // Even on "error", we store the file - never reject
        setDocuments(prev => prev.map(d => 
          d.id === id 
            ? { ...d, status: 'error', progress: 100, error: result.error || 'Processing issue - file saved' }
            : d
        ));
      }
    } catch (err: any) {
      setDocuments(prev => prev.map(d => 
        d.id === id 
          ? { ...d, status: 'error', progress: 100, error: err.message || 'Upload failed' }
          : d
      ));
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // =============================================================================
  // CHAT HANDLER
  // =============================================================================

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get document IDs for context
      const docIds = documents.filter(d => d.status === 'ready').map(d => d.id);

      const response = await fetch('/api/docs/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage.content,
          document_ids: docIds,
          provider: selectedProvider
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: data.answer || data.content || 'I apologize, but I could not generate a response.',
        citations: data.citations || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
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

  // =============================================================================
  // FILE ICON HELPER
  // =============================================================================

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <Image className="w-4 h-4" />;
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) 
      return <FileSpreadsheet className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Javari AI</h1>
              <p className="text-xs text-gray-400">Your intelligent assistant</p>
            </div>
          </div>
          
          {/* Provider Selector */}
          <div className="relative">
            <button
              onClick={() => setShowProviderMenu(!showProviderMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              {providers.find(p => p.provider_id === selectedProvider)?.display_name || 'Auto'}
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showProviderMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto">
                {providers.map(provider => (
                  <button
                    key={provider.provider_id}
                    onClick={() => {
                      setSelectedProvider(provider.provider_id);
                      setShowProviderMenu(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-white/5 flex items-center justify-between ${
                      selectedProvider === provider.provider_id ? 'bg-cyan-500/10 text-cyan-400' : 'text-white'
                    }`}
                  >
                    <span>{provider.display_name}</span>
                    <span className="text-xs text-gray-500">{provider.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          
          {/* Left Panel - Document Upload */}
          <div className="space-y-4">
            {/* Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                ${isDragging 
                  ? 'border-cyan-400 bg-cyan-400/10' 
                  : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-cyan-400' : 'text-gray-400'}`} />
              <p className="text-white font-medium mb-1">
                {isDragging ? 'Drop files here' : 'Drop files or click to upload'}
              </p>
              <p className="text-xs text-gray-400">
                PDF, Word, Excel, Images, Text — any file type
              </p>
            </div>

            {/* Document List */}
            {documents.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-medium text-white mb-3">Documents ({documents.length})</h3>
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center
                      ${doc.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                        doc.status === 'error' ? 'bg-red-500/20 text-red-400' :
                        'bg-cyan-500/20 text-cyan-400'}
                    `}>
                      {doc.status === 'uploading' || doc.status === 'processing' 
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : doc.status === 'ready' 
                          ? <Check className="w-4 h-4" />
                          : doc.status === 'error'
                            ? <AlertCircle className="w-4 h-4" />
                            : getFileIcon(doc.type)
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400">
                        {doc.status === 'uploading' && `Uploading... ${doc.progress}%`}
                        {doc.status === 'processing' && 'Processing...'}
                        {doc.status === 'ready' && 'Ready'}
                        {doc.status === 'error' && (doc.error || 'Error')}
                      </p>
                      {(doc.status === 'uploading' || doc.status === 'processing') && (
                        <div className="w-full h-1 bg-white/10 rounded mt-1">
                          <div 
                            className="h-full bg-cyan-500 rounded transition-all"
                            style={{ width: `${doc.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeDocument(doc.id); }}
                      className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Chat */}
          <div className="flex flex-col bg-white/5 rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${message.role === 'user' 
                      ? 'bg-purple-500/20 text-purple-400' 
                      : 'bg-cyan-500/20 text-cyan-400'}
                  `}>
                    {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`
                    max-w-[80%] p-4 rounded-xl
                    ${message.role === 'user' 
                      ? 'bg-purple-500/20 text-white' 
                      : 'bg-white/10 text-gray-100'}
                  `}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Citations */}
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-gray-400 mb-2">📚 Sources:</p>
                        {message.citations.map((citation, i) => (
                          <div key={i} className="text-xs bg-white/5 p-2 rounded mb-1">
                            <span className="text-cyan-400 font-medium">{citation.documentName}</span>
                            {citation.page && <span className="text-gray-500"> • Page {citation.page}</span>}
                            {citation.section && <span className="text-gray-500"> • {citation.section}</span>}
                            {citation.snippet && (
                              <p className="text-gray-400 mt-1 italic">"{citation.snippet}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={documents.length > 0 
                    ? "Ask about your documents..." 
                    : "Type a message or upload documents..."}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-500 transition"
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {documents.length > 0 
                  ? `${documents.filter(d => d.status === 'ready').length} document(s) ready for questions`
                  : 'Upload documents to get answers with citations'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
