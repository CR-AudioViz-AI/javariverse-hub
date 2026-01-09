'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Download,
  Calendar,
  Eye,
  RefreshCw,
  PieChart,
  LineChart,
  Target,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AnalyticsData {
  overview: {
    total_users: number;
    active_users_30d: number;
    total_revenue: number;
    revenue_30d: number;
    total_projects: number;
    projects_30d: number;
    avg_credits_per_user: number;
    conversion_rate: number;
  };
  growth: {
    user_growth: Array<{ date: string; count: number }>;
    revenue_growth: Array<{ date: string; amount: number }>;
    project_growth: Array<{ date: string; count: number }>;
  };
  engagement: {
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
    avg_session_duration: number;
    avg_projects_per_user: number;
    retention_rate: number;
  };
  apps: {
    usage_by_app: Array<{ app: string; count: number; percentage: number }>;
    revenue_by_app: Array<{ app: string; revenue: number; percentage: number }>;
  };
  users: {
    by_subscription: Array<{ tier: string; count: number; percentage: number }>;
    by_status: Array<{ status: string; count: number; percentage: number }>;
    by_signup_source: Array<{ source: string; count: number; percentage: number }>;
  };
  revenue: {
    by_source: Array<{ source: string; amount: number; percentage: number }>;
    by_payment_method: Array<{ method: string; amount: number; percentage: number }>;
    mrr: number;
    arr: number;
    average_transaction: number;
    lifetime_value: number;
  };
}

interface PaymentMethodStats {
  stripe: {
    amount: number;
    percentage: number;
    transactions: number;
  };
  paypal: {
    amount: number;
    percentage: number;
    transactions: number;
  };
}

export default function AnalyticsReportsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [paymentStats, setPaymentStats] = useState<PaymentMethodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch from real API endpoint
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const response = await fetch(`/api/admin/analytics?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setAnalytics(result.data);
        
        // Extract payment method stats
        const paymentMethods = result.data.revenue.by_payment_method;
        const stripeData = paymentMethods.find((m: any) => m.method === 'stripe') || { amount: 0, percentage: 0 };
        const paypalData = paymentMethods.find((m: any) => m.method === 'paypal') || { amount: 0, percentage: 0 };
        
        setPaymentStats({
          stripe: {
            amount: stripeData.amount,
            percentage: stripeData.percentage,
            transactions: Math.floor(stripeData.amount / (result.data.revenue.average_transaction || 50))
          },
          paypal: {
            amount: paypalData.amount,
            percentage: paypalData.percentage,
            transactions: Math.floor(paypalData.amount / (result.data.revenue.average_transaction || 50))
          }
        });
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const exportReport = () => {
    if (!analytics) return;

    const csv = [
      ['CR AudioViz AI - Analytics Report'],
      ['Generated:', new Date().toLocaleString()],
      ['Period:', timeRange],
      [''],
      ['OVERVIEW METRICS'],
      ['Total Users', analytics.overview.total_users],
      ['Active Users (30d)', analytics.overview.active_users_30d],
      ['Total Revenue', `$${analytics.overview.total_revenue.toLocaleString()}`],
      ['Monthly Revenue', `$${analytics.overview.revenue_30d.toLocaleString()}`],
      ['Conversion Rate', `${analytics.overview.conversion_rate}%`],
      [''],
      ['REVENUE BY PAYMENT METHOD'],
      ['Stripe', `$${paymentStats?.stripe.amount.toLocaleString()}`, `${paymentStats?.stripe.percentage}%`],
      ['PayPal', `$${paymentStats?.paypal.amount.toLocaleString()}`, `${paymentStats?.paypal.percentage}%`],
      [''],
      ['KEY METRICS'],
      ['MRR', `$${analytics.revenue.mrr.toLocaleString()}`],
      ['ARR', `$${analytics.revenue.arr.toLocaleString()}`],
      ['Avg Transaction', `$${analytics.revenue.average_transaction.toLocaleString()}`],
      ['Lifetime Value', `$${analytics.revenue.lifetime_value.toLocaleString()}`],
      [''],
      ['ENGAGEMENT'],
      ['Daily Active Users', analytics.engagement.daily_active_users],
      ['Weekly Active Users', analytics.engagement.weekly_active_users],
      ['Monthly Active Users', analytics.engagement.monthly_active_users],
      ['Retention Rate', `${analytics.engagement.retention_rate}%`]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `craudiovizai-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-slate-400 text-lg">Loading real-time analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="bg-red-500/10 border border-red-500 rounded-xl p-8 max-w-md">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white text-center mb-2">Error Loading Analytics</h3>
              <p className="text-slate-400 text-center mb-4">{error}</p>
              <button
                onClick={loadAnalytics}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Retry
              </button>
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
              <BarChart3 className="w-10 h-10 text-blue-500" />
              Analytics & Reports
            </h1>
            <p className="text-slate-400 text-lg">
              Real-time platform metrics • Stripe + PayPal tracking
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportReport}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-500 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 ${
                refreshing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {range === '7d' && 'Last 7 Days'}
              {range === '30d' && 'Last 30 Days'}
              {range === '90d' && 'Last 90 Days'}
              {range === '1y' && 'Last Year'}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        {analytics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-400 text-sm font-medium">Total Revenue</h3>
                  <DollarSign className="w-5 h-5 text-cyan-500" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(analytics.overview.total_revenue)}
                </p>
                <p className="text-cyan-500 text-sm mt-1 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  All time earnings
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-400 text-sm font-medium">Monthly Revenue</h3>
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(analytics.overview.revenue_30d)}
                </p>
                <p className="text-slate-500 text-sm mt-1">last 30 days</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-400 text-sm font-medium">Total Users</h3>
                  <Users className="w-5 h-5 text-cyan-500" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {analytics.overview.total_users.toLocaleString()}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  {analytics.overview.active_users_30d} active
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-400 text-sm font-medium">Conversion Rate</h3>
                  <Target className="w-5 h-5 text-cyan-500" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {analytics.overview.conversion_rate.toFixed(1)}%
                </p>
                <p className="text-slate-500 text-sm mt-1">free to paid</p>
              </div>
            </div>

            {/* Payment Methods Breakdown - Stripe vs PayPal */}
            {paymentStats && (
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-blue-500" />
                  Payment Methods Performance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stripe */}
                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">Stripe</h3>
                          <p className="text-slate-400 text-sm">Primary processor</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-400 text-sm">Revenue</span>
                          <span className="text-white font-semibold">{formatCurrency(paymentStats.stripe.amount)}</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${paymentStats.stripe.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Transactions</span>
                        <span className="text-white font-medium">{paymentStats.stripe.transactions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Share</span>
                        <span className="text-white font-medium">{paymentStats.stripe.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* PayPal */}
                  <div className="bg-slate-900/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-cyan-500" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">PayPal</h3>
                          <p className="text-slate-400 text-sm">Alternative payment</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-400 text-sm">Revenue</span>
                          <span className="text-white font-semibold">{formatCurrency(paymentStats.paypal.amount)}</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500"
                            style={{ width: `${paymentStats.paypal.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Transactions</span>
                        <span className="text-white font-medium">{paymentStats.paypal.transactions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Share</span>
                        <span className="text-white font-medium">{paymentStats.paypal.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Growth Chart */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <LineChart className="w-6 h-6 text-cyan-500" />
                Revenue Trend
              </h2>
              <div className="space-y-2">
                {analytics.growth.revenue_growth.slice(-7).map((data, index) => {
                  const maxRevenue = Math.max(...analytics.growth.revenue_growth.map(d => d.amount));
                  const width = maxRevenue > 0 ? (data.amount / maxRevenue) * 100 : 0;
                  return (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">{new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="text-white font-medium">{formatCurrency(data.amount)}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                          style={{ width: `${width}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Apps */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-6 h-6 text-cyan-500" />
                Top Performing Apps
              </h2>
              <div className="space-y-4">
                {analytics.apps.usage_by_app.slice(0, 5).map((app, index) => (
                  <div key={app.app} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{app.app}</p>
                        <p className="text-slate-400 text-sm">
                          {app.count.toLocaleString()} uses ({app.percentage.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-500 font-semibold">
                        {formatCurrency(analytics.apps.revenue_by_app[index]?.revenue || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <p className="text-slate-400 text-sm mb-1">MRR</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(analytics.revenue.mrr)}</p>
                <p className="text-slate-500 text-xs mt-1">Monthly Recurring</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <p className="text-slate-400 text-sm mb-1">ARR</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(analytics.revenue.arr)}</p>
                <p className="text-slate-500 text-xs mt-1">Annual Recurring</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <p className="text-slate-400 text-sm mb-1">Avg Transaction</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(analytics.revenue.average_transaction)}</p>
                <p className="text-slate-500 text-xs mt-1">Per payment</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <p className="text-slate-400 text-sm mb-1">LTV</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(analytics.revenue.lifetime_value)}</p>
                <p className="text-slate-500 text-xs mt-1">Lifetime Value</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
