'use client';

import { useState, useEffect } from 'react';
import { 
  Bot, 
  Activity, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  MessageSquare,
  Settings,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface BotMetrics {
  cpu_usage: number;
  memory_usage: number;
  response_time: number;
  tasks_completed: number;
  uptime_hours: number;
}

interface BotData {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  avatar_url: string;
  last_active: string;
  total_interactions: number;
  success_rate: number;
  metrics: BotMetrics;
  version: string;
}

export default function BotsManagementPage() {
  const [bots, setBots] = useState<BotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBot, setSelectedBot] = useState<BotData | null>(null);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const supabase = createClientComponentClient();

  // Initial bot data (will be replaced with Supabase queries)
  const mockBots: BotData[] = [
    {
      id: 'javari-ai',
      name: 'Javari AI',
      description: 'Main conversational AI assistant with autonomous learning capabilities',
      status: 'active',
      avatar_url: '/avatars/javari-avatar.png',
      last_active: new Date().toISOString(),
      total_interactions: 1247,
      success_rate: 98.5,
      metrics: {
        cpu_usage: 45,
        memory_usage: 62,
        response_time: 127,
        tasks_completed: 89,
        uptime_hours: 720
      },
      version: '4.2.1'
    },
    {
      id: 'grant-assistant',
      name: 'Grant Assistant AI',
      description: 'Specialized AI for grant writing, research, and application management',
      status: 'active',
      avatar_url: '/avatars/grant-bot.png',
      last_active: new Date(Date.now() - 3600000).toISOString(),
      total_interactions: 453,
      success_rate: 96.2,
      metrics: {
        cpu_usage: 32,
        memory_usage: 48,
        response_time: 215,
        tasks_completed: 34,
        uptime_hours: 720
      },
      version: '2.1.0'
    },
    {
      id: 'content-creator',
      name: 'Content Creator AI',
      description: 'Automated content generation for social media, blogs, and marketing',
      status: 'active',
      avatar_url: '/avatars/content-bot.png',
      last_active: new Date(Date.now() - 1800000).toISOString(),
      total_interactions: 892,
      success_rate: 94.8,
      metrics: {
        cpu_usage: 28,
        memory_usage: 55,
        response_time: 185,
        tasks_completed: 67,
        uptime_hours: 720
      },
      version: '3.0.5'
    }
  ];

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual Supabase query when bots table is ready
      // const { data, error } = await supabase
      //   .from('ai_bots')
      //   .select('*')
      //   .order('name', { ascending: true });
      
      // if (error) throw error;
      // setBots(data || []);
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      setBots(mockBots);
    } catch (error) {
      console.error('Error loading bots:', error);
      setBots(mockBots); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadBots();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleBotStatus = async (botId: string) => {
    setBots(prevBots =>
      prevBots.map(bot =>
        bot.id === botId
          ? {
              ...bot,
              status: bot.status === 'active' ? 'inactive' : 'active'
            }
          : bot
      )
    );
    // TODO: Add Supabase update when ready
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-cyan-500';
      case 'inactive':
        return 'bg-slate-500';
      case 'maintenance':
        return 'bg-cyan-400';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-5 h-5 text-cyan-500" />;
      case 'inactive':
        return <XCircle className="w-5 h-5 text-slate-500" />;
      case 'maintenance':
        return <Settings className="w-5 h-5 text-cyan-400" />;
      default:
        return <XCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-slate-400 text-lg">Loading bots management...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Bot className="w-10 h-10 text-blue-500" />
              Bots Management
            </h1>
            <p className="text-slate-400 text-lg">
              Monitor and control 3 AI assistants with real-time metrics
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Active Bots</h3>
              <Activity className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-3xl font-bold text-white">
              {bots.filter(b => b.status === 'active').length}
            </p>
            <p className="text-slate-500 text-sm mt-1">of {bots.length} total</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Total Interactions</h3>
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-white">
              {bots.reduce((sum, bot) => sum + bot.total_interactions, 0).toLocaleString()}
            </p>
            <p className="text-slate-500 text-sm mt-1">across all bots</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Avg Success Rate</h3>
              <TrendingUp className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-3xl font-bold text-white">
              {(bots.reduce((sum, bot) => sum + bot.success_rate, 0) / bots.length).toFixed(1)}%
            </p>
            <p className="text-slate-500 text-sm mt-1">quality score</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Avg Response Time</h3>
              <Clock className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-3xl font-bold text-white">
              {Math.round(bots.reduce((sum, bot) => sum + bot.metrics.response_time, 0) / bots.length)}ms
            </p>
            <p className="text-slate-500 text-sm mt-1">average speed</p>
          </div>
        </div>

        {/* Bots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <div
              key={bot.id}
              className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all cursor-pointer"
              onClick={() => {
                setSelectedBot(bot);
                setShowMetricsModal(true);
              }}
            >
              {/* Bot Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                    <Bot className="w-7 h-7 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{bot.name}</h3>
                    <p className="text-slate-500 text-sm">v{bot.version}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(bot.status)}
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(bot.status)} animate-pulse`}></span>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                {bot.description}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Interactions</p>
                  <p className="text-white font-semibold">{bot.total_interactions.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Success Rate</p>
                  <p className="text-white font-semibold">{bot.success_rate}%</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Response</p>
                  <p className="text-white font-semibold">{bot.metrics.response_time}ms</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Uptime</p>
                  <p className="text-white font-semibold">{bot.metrics.uptime_hours}h</p>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBotStatus(bot.id);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    bot.status === 'active'
                      ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                      : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-500'
                  }`}
                >
                  {bot.status === 'active' ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Activate
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBot(bot);
                    setShowMetricsModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg font-medium transition-colors"
                >
                  <Activity className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Modal */}
      {showMetricsModal && selectedBot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedBot.name} Metrics</h2>
                <p className="text-slate-400 text-sm">Real-time performance monitoring</p>
              </div>
              <button
                onClick={() => {
                  setShowMetricsModal(false);
                  setSelectedBot(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* System Metrics */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-500" />
                  System Resources
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">CPU Usage</span>
                      <span className="text-white font-medium">{selectedBot.metrics.cpu_usage}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${selectedBot.metrics.cpu_usage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Memory Usage</span>
                      <span className="text-white font-medium">{selectedBot.metrics.memory_usage}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 transition-all"
                        style={{ width: `${selectedBot.metrics.memory_usage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-500" />
                  Performance Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Response Time</p>
                    <p className="text-2xl font-bold text-white">{selectedBot.metrics.response_time}ms</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Tasks Completed</p>
                    <p className="text-2xl font-bold text-white">{selectedBot.metrics.tasks_completed}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Uptime</p>
                    <p className="text-2xl font-bold text-white">{selectedBot.metrics.uptime_hours}h</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-white">{selectedBot.success_rate}%</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-white font-semibold mb-2">Description</h3>
                <p className="text-slate-400 text-sm">{selectedBot.description}</p>
              </div>

              <button
                onClick={() => {
                  setShowMetricsModal(false);
                  setSelectedBot(null);
                }}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
