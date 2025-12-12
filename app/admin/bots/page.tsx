// app/admin/bots/page.tsx
// Admin Bot Activity Dashboard - 9 Autonomous Bots
// Timestamp: Dec 11, 2025 10:27 PM EST

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Bot, ArrowLeft, Activity, CheckCircle, AlertTriangle, Clock, Zap, Shield, Database, Mail, TrendingUp } from 'lucide-react';

const BOTS = [
  {
    id: 'pulse',
    name: 'Pulse',
    role: 'Support Auto-Resolution',
    description: 'Handles Tier 1 support tickets automatically',
    icon: Bot,
    status: 'active',
    lastRun: '2 min ago',
    tasksToday: 47,
    successRate: 94,
  },
  {
    id: 'guardian',
    name: 'Guardian',
    role: 'Security Monitor',
    description: 'Monitors for security threats and suspicious activity',
    icon: Shield,
    status: 'active',
    lastRun: '30 sec ago',
    tasksToday: 1250,
    successRate: 100,
  },
  {
    id: 'collector',
    name: 'Collector',
    role: 'Analytics Aggregator',
    description: 'Collects and processes platform analytics',
    icon: TrendingUp,
    status: 'active',
    lastRun: '5 min ago',
    tasksToday: 24,
    successRate: 100,
  },
  {
    id: 'archivist',
    name: 'Archivist',
    role: 'Backup Manager',
    description: 'Manages database backups and data archival',
    icon: Database,
    status: 'active',
    lastRun: '1 hour ago',
    tasksToday: 3,
    successRate: 100,
  },
  {
    id: 'herald',
    name: 'Herald',
    role: 'Notification Dispatcher',
    description: 'Sends emails, push notifications, and alerts',
    icon: Mail,
    status: 'active',
    lastRun: '1 min ago',
    tasksToday: 156,
    successRate: 99,
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    role: 'Uptime Monitor',
    description: 'Monitors service health and availability',
    icon: Activity,
    status: 'active',
    lastRun: '10 sec ago',
    tasksToday: 8640,
    successRate: 100,
  },
  {
    id: 'janitor',
    name: 'Janitor',
    role: 'Cleanup Service',
    description: 'Cleans temp files, expired sessions, old logs',
    icon: Clock,
    status: 'active',
    lastRun: '15 min ago',
    tasksToday: 12,
    successRate: 100,
  },
  {
    id: 'optimizer',
    name: 'Optimizer',
    role: 'Performance Tuner',
    description: 'Optimizes queries, caches, and resources',
    icon: Zap,
    status: 'idle',
    lastRun: '6 hours ago',
    tasksToday: 2,
    successRate: 100,
  },
  {
    id: 'auditor',
    name: 'Auditor',
    role: 'Compliance Checker',
    description: 'Verifies data integrity and compliance',
    icon: CheckCircle,
    status: 'active',
    lastRun: '30 min ago',
    tasksToday: 8,
    successRate: 100,
  },
];

export default async function AdminBotsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const activeBots = BOTS.filter(b => b.status === 'active').length;
  const totalTasks = BOTS.reduce((sum, b) => sum + b.tasksToday, 0);
  const avgSuccess = BOTS.reduce((sum, b) => sum + b.successRate, 0) / BOTS.length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white py-6">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-purple-200 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Bot className="w-8 h-8" />
            Bot Activity Dashboard
          </h1>
          <p className="text-purple-200">9 autonomous bots running 24/7</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Active Bots</p>
            <p className="text-3xl font-bold text-green-600">{activeBots}/9</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Tasks Today</p>
            <p className="text-3xl font-bold text-blue-600">{totalTasks.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Avg Success Rate</p>
            <p className="text-3xl font-bold text-purple-600">{avgSuccess.toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">System Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <p className="text-lg font-bold text-green-600">All Operational</p>
            </div>
          </div>
        </div>

        {/* Bot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BOTS.map((bot) => {
            const Icon = bot.icon;
            return (
              <div key={bot.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      bot.status === 'active' ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${bot.status === 'active' ? 'text-purple-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{bot.name}</h3>
                      <p className="text-sm text-gray-500">{bot.role}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    bot.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      bot.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`} />
                    {bot.status}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{bot.description}</p>
                <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{bot.tasksToday}</p>
                    <p className="text-xs text-gray-500">Tasks Today</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{bot.successRate}%</p>
                    <p className="text-xs text-gray-500">Success</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">{bot.lastRun}</p>
                    <p className="text-xs text-gray-500">Last Run</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
