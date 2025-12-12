'use client';

// components/JavariWidget.tsx
// JAVARI AI Widget - Connected to Real AI v4.1
// NEVER SAY NO Edition
// Timestamp: 2025-12-11 5:15 PM EST

import React, { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  MessageSquare,
  Send,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  TrendingUp,
  Lightbulb,
  Bot,
  Zap,
  Brain,
  Globe,
} from 'lucide-react';

// Brand colors
const COLORS = {
  navy: '#002B5B',
  red: '#FD201D',
  cyan: '#00BCD4',
};

// Provider configuration for UI
const PROVIDER_CONFIG = {
  claude: { name: 'Claude', color: 'bg-orange-500', icon: Brain },
  openai: { name: 'GPT-4', color: 'bg-green-500', icon: Sparkles },
  gemini: { name: 'Gemini', color: 'bg-blue-500', icon: Zap },
  mistral: { name: 'Mistral', color: 'bg-purple-500', icon: Globe },
  perplexity: { name: 'Perplexity', color: 'bg-cyan-500', icon: Globe },
} as const;

type ProviderName = keyof typeof PROVIDER_CONFIG;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'good' | 'bad';
  provider?: ProviderName;
  latency?: number;
}

interface JavariWidgetProps {
  sourceApp?: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  enableTickets?: boolean;
  enableEnhancements?: boolean;
  context?: string;
  apiEndpoint?: string; // Allow custom API endpoint
}

// Javari API URL - defaults to production
const JAVARI_API = process.env.NEXT_PUBLIC_JAVARI_API_URL || 'https://javariai.com/api/chat';

export default function JavariWidget({
  sourceApp = 'website',
  position = 'bottom-right',
  primaryColor = COLORS.navy,
  enableTickets = true,
  enableEnhancements = true,
  context,
  apiEndpoint = JAVARI_API,
}: JavariWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<ProviderName | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Save conversation for learning
  const saveConversation = async (role: 'user' | 'assistant', content: string, provider?: string) => {
    try {
      await supabase.from('javari_conversations').insert({
        source_app: sourceApp,
        role,
        content,
        provider,
        context,
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  // Log activity for analytics
  const logActivity = async (activityType: string, description: string) => {
    try {
      await supabase.from('javari_activity_log').insert({
        activity_type: activityType,
        description,
        source_app: sourceApp,
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Call the real Javari API
  const callJavariAPI = async (userMessage: string): Promise<{ content: string; provider?: ProviderName; latency?: number }> => {
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          context: context ? `Source: ${sourceApp}. Context: ${context}` : `Source: ${sourceApp}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        content: data.content || "Let me help you with that! What specifically would you like to know?",
        provider: data.provider as ProviderName,
        latency: data.latency,
      };
    } catch (error) {
      console.error('Javari API error:', error);
      // Fallback response - NEVER SAY NO
      return {
        content: "I'm reconnecting right now! In the meantime, feel free to explore our tools at craudiovizai.com or try asking again in a moment. I'm here to help! 🚀",
        provider: undefined,
        latency: undefined,
      };
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    // Save user message
    await saveConversation('user', input);
    await logActivity('chat', `User: ${input.substring(0, 100)}...`);

    try {
      // Call real Javari API
      const response = await callJavariAPI(input);
      
      setCurrentProvider(response.provider || null);

      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        provider: response.provider,
        latency: response.latency,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant response
      await saveConversation('assistant', response.content, response.provider);

    } catch (error) {
      console.error('Error getting response:', error);
      
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: "I'm working on reconnecting! Try again in just a moment - I'm here to help! 🔄",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setCurrentProvider(null);
    }
  };

  const handleFeedback = async (messageId: string, feedback: 'good' | 'bad') => {
    setMessages(prev => 
      prev.map(m => m.id === messageId ? { ...m, feedback } : m)
    );
    
    await logActivity('feedback', `User rated response as ${feedback}`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick suggestions
  const suggestions = [
    { icon: <Sparkles className="w-4 h-4" />, text: 'What can you build?', full: 'What kind of apps and tools can you build for me?' },
    { icon: <TrendingUp className="w-4 h-4" />, text: 'Stock analysis', full: 'Can you help me analyze a stock?' },
    { icon: <HelpCircle className="w-4 h-4" />, text: 'How do credits work?', full: 'How does the credit system work?' },
    { icon: <Lightbulb className="w-4 h-4" />, text: 'Suggest a feature', full: 'I have a feature suggestion' },
  ];

  // Provider badge component
  const ProviderBadge = ({ provider, latency }: { provider?: ProviderName; latency?: number }) => {
    if (!provider) return null;
    const config = PROVIDER_CONFIG[provider];
    if (!config) return null;
    const Icon = config.icon;
    
    return (
      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
        <span className={`w-1.5 h-1.5 rounded-full ${config.color}`} />
        <Icon className="w-3 h-3" />
        <span>{config.name}</span>
        {latency && <span>• {latency}ms</span>}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${position === 'bottom-right' ? 'right-4' : 'left-4'} bottom-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110`}
        style={{ backgroundColor: primaryColor }}
      >
        <MessageSquare className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </span>
      </button>
    );
  }

  return (
    <Card
      className={`fixed ${position === 'bottom-right' ? 'right-4' : 'left-4'} bottom-4 z-50 shadow-2xl transition-all duration-300 ${
        isExpanded ? 'w-[500px] h-[600px]' : 'w-[380px] h-[500px]'
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 rounded-t-lg text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="w-8 h-8" />
            <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Javari AI</h3>
            <p className="text-xs opacity-80">Always finds a way to help</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 h-[calc(100%-140px)] bg-gray-50">
        {messages.length === 0 && showSuggestions && (
          <div className="space-y-3">
            <div className="text-center py-4">
              <Bot className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">
                Hi! I'm Javari, your AI assistant that NEVER says no. 
                What can I build or help you with today?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(s.full)}
                  className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 text-left text-sm hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-blue-500">{s.icon}</span>
                  <span className="text-gray-700">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block max-w-[85%] p-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-white border border-gray-200 rounded-bl-md shadow-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {message.role === 'assistant' && (
                <>
                  <ProviderBadge provider={message.provider} latency={message.latency} />
                  
                  {/* Feedback buttons */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Helpful?</span>
                    <button
                      onClick={() => handleFeedback(message.id, 'good')}
                      className={`p-1 rounded transition-colors ${
                        message.feedback === 'good' 
                          ? 'text-green-500 bg-green-50' 
                          : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, 'bad')}
                      className={`p-1 rounded transition-colors ${
                        message.feedback === 'bad' 
                          ? 'text-red-500 bg-red-50' 
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="flex items-center gap-2 bg-white p-3 rounded-2xl rounded-bl-md shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {currentProvider 
                  ? `${PROVIDER_CONFIG[currentProvider]?.name || 'Javari'} is thinking...`
                  : 'Javari is working on it...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{ backgroundColor: primaryColor }}
            className="text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-center text-gray-400 mt-2">
          Powered by Javari AI • NEVER says no
        </p>
      </div>
    </Card>
  );
}
