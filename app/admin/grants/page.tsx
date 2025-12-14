// app/admin/grants/page.tsx
// INTERNAL Grant Management System - CR AudioViz AI
// Complete tracking for $1.289B+ in grant opportunities
// Timestamp: Saturday, December 13, 2025 - 11:50 AM EST

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, DollarSign, Calendar, FileText, CheckCircle, 
  Clock, AlertTriangle, Target, TrendingUp, Building, Users,
  Plus, Filter, Search, Download, Upload, Bell, Sparkles,
  Phone, Mail, MapPin, MessageSquare, BarChart3, PieChart,
  ChevronRight, ExternalLink, Edit, Trash2, Eye, Copy,
  AlertCircle, CheckCircle2, XCircle, HelpCircle, Briefcase
} from 'lucide-react';

// Status configuration
const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  researching: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Search, label: 'Researching' },
  preparing: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: FileText, label: 'Preparing' },
  draft: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Edit, label: 'Draft' },
  internal_review: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Eye, label: 'Internal Review' },
  submitted: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Target, label: 'Submitted' },
  under_review: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Clock, label: 'Under Review' },
  approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Approved' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
  withdrawn: { bg: 'bg-gray-100', text: 'text-gray-500', icon: Trash2, label: 'Withdrawn' },
  archived: { bg: 'bg-gray-100', text: 'text-gray-400', icon: FileText, label: 'Archived' },
};

const PRIORITY_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  medium: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  low: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' },
};

// CRAIverse module mapping
const MODULE_NAMES: Record<string, string> = {
  'first-responders': 'First Responders Haven',
  'veterans-transition': 'Veterans Transition Hub',
  'together-anywhere': 'Together Anywhere',
  'faith-communities': 'Faith Communities',
  'senior-connect': 'Senior Connect',
  'foster-care-network': 'Foster Care Network',
  'rural-health': 'Rural Health Access',
  'mental-health-youth': 'Youth Mental Health',
  'addiction-recovery': 'Recovery Together',
  'animal-rescue': 'Animal Rescue Network',
  'green-earth': 'Green Earth Initiative',
  'disaster-relief': 'Disaster Relief Hub',
  'small-business': 'Small Business Hub',
  'nonprofit-toolkit': 'Nonprofit Toolkit',
  'education-access': 'Education Access',
  'digital-literacy': 'Digital Literacy',
  'artists-collective': 'Artists Collective',
  'musicians-guild': 'Musicians Guild',
  'community-journalism': 'Community Journalism',
  'food-security': 'Food Security Network',
};

function formatCurrency(amount: number | null): string {
  if (!amount) return '$0';
  if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Rolling';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getDeadlineColor(days: number | null): string {
  if (days === null) return 'text-gray-500';
  if (days < 0) return 'text-red-600';
  if (days <= 7) return 'text-red-600 font-bold';
  if (days <= 14) return 'text-orange-600';
  if (days <= 30) return 'text-yellow-600';
  return 'text-green-600';
}

async function getGrantData(supabase: any) {
  // Get all grants
  const { data: grants, error: grantsError } = await supabase
    .from('grant_opportunities')
    .select('*')
    .order('application_deadline', { ascending: true, nullsFirst: false });

  // Get contacts count per grant
  const { data: contactCounts } = await supabase
    .from('grant_contacts')
    .select('grant_id');

  // Get communications count per grant
  const { data: commCounts } = await supabase
    .from('grant_communications')
    .select('grant_id');

  // Get documents count per grant
  const { data: docCounts } = await supabase
    .from('grant_documents')
    .select('grant_id');

  // Get upcoming milestones
  const { data: milestones } = await supabase
    .from('grant_milestones')
    .select('*, grant_opportunities(grant_name)')
    .eq('status', 'pending')
    .gte('due_date', new Date().toISOString().split('T')[0])
    .order('due_date', { ascending: true })
    .limit(10);

  // Calculate stats
  const stats = {
    total: grants?.length || 0,
    researching: grants?.filter((g: any) => g.status === 'researching').length || 0,
    preparing: grants?.filter((g: any) => ['preparing', 'draft', 'internal_review'].includes(g.status)).length || 0,
    submitted: grants?.filter((g: any) => ['submitted', 'under_review'].includes(g.status)).length || 0,
    approved: grants?.filter((g: any) => g.status === 'approved').length || 0,
    rejected: grants?.filter((g: any) => g.status === 'rejected').length || 0,
    totalRequested: grants?.reduce((sum: number, g: any) => sum + (g.amount_requested || 0), 0) || 0,
    totalAwarded: grants?.reduce((sum: number, g: any) => sum + (g.amount_awarded || 0), 0) || 0,
    totalAvailable: grants?.reduce((sum: number, g: any) => sum + (g.amount_available || 0), 0) || 0,
  };

  // Win rate calculation
  const decided = stats.approved + stats.rejected;
  stats.winRate = decided > 0 ? Math.round((stats.approved / decided) * 100) : 0;

  return { grants: grants || [], stats, milestones: milestones || [], contactCounts, commCounts, docCounts };
}

export default async function AdminGrantsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Check admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
    
  if (!profile?.is_admin) redirect('/dashboard');

  const { grants, stats, milestones } = await getGrantData(supabase);

  // Group grants by status for pipeline view
  const pipeline = {
    researching: grants.filter((g: any) => g.status === 'researching'),
    preparing: grants.filter((g: any) => ['preparing', 'draft', 'internal_review'].includes(g.status)),
    submitted: grants.filter((g: any) => ['submitted', 'under_review'].includes(g.status)),
    decided: grants.filter((g: any) => ['approved', 'rejected'].includes(g.status)),
  };

  // Upcoming deadlines (next 60 days)
  const upcomingDeadlines = grants
    .filter((g: any) => {
      if (!g.application_deadline) return false;
      const days = getDaysUntil(g.application_deadline);
      return days !== null && days >= 0 && days <= 60 && !['approved', 'rejected', 'withdrawn', 'archived'].includes(g.status);
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Grant Management Center</h1>
                <p className="text-xs text-gray-500">Internal tool for CR AudioViz AI grant applications</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/grants/calendar"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </Link>
              <Link
                href="/admin/grants/ai-assistant"
                className="flex items-center gap-2 px-3 py-2 text-sm text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                AI Assistant
              </Link>
              <Link
                href="/admin/grants/new"
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Grant
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs">Total Opportunities</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">{formatCurrency(stats.totalAvailable)} available</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.researching + stats.preparing}</p>
            <p className="text-xs text-gray-500">{stats.researching} researching, {stats.preparing} preparing</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-xs">Submitted</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
            <p className="text-xs text-gray-500">{formatCurrency(stats.totalRequested)} pending</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">Awarded</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-gray-500">{formatCurrency(stats.totalAwarded)} received</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Win Rate</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.winRate}%</p>
            <p className="text-xs text-gray-500">{stats.approved} of {stats.approved + stats.rejected} decided</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">Deadlines Soon</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{upcomingDeadlines.length}</p>
            <p className="text-xs text-gray-500">Next 60 days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Grant List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search grants..."
                    className="w-full border-0 focus:ring-0 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select className="border-0 text-sm text-gray-600 focus:ring-0">
                    <option>All Statuses</option>
                    <option>Researching</option>
                    <option>Preparing</option>
                    <option>Submitted</option>
                    <option>Approved</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <select className="border-0 text-sm text-gray-600 focus:ring-0">
                    <option>All Agencies</option>
                    <option>Federal</option>
                    <option>State</option>
                    <option>Foundation</option>
                  </select>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Pipeline View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Grant Pipeline</h2>
              </div>
              
              <div className="overflow-x-auto">
                <div className="grid grid-cols-4 min-w-[800px]">
                  {/* Researching Column */}
                  <div className="border-r border-gray-100 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Researching</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {pipeline.researching.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {pipeline.researching.slice(0, 3).map((grant: any) => (
                        <Link
                          key={grant.id}
                          href={`/admin/grants/${grant.id}`}
                          className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{grant.grant_name}</p>
                          <p className="text-xs text-gray-500">{grant.agency_name}</p>
                          <p className="text-xs font-semibold text-green-600 mt-1">{formatCurrency(grant.amount_available)}</p>
                        </Link>
                      ))}
                      {pipeline.researching.length > 3 && (
                        <p className="text-xs text-center text-gray-500 py-2">
                          +{pipeline.researching.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Preparing Column */}
                  <div className="border-r border-gray-100 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-yellow-600 uppercase">Preparing</span>
                      <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">
                        {pipeline.preparing.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {pipeline.preparing.slice(0, 3).map((grant: any) => (
                        <Link
                          key={grant.id}
                          href={`/admin/grants/${grant.id}`}
                          className="block p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{grant.grant_name}</p>
                          <p className="text-xs text-gray-500">{grant.agency_name}</p>
                          {grant.application_deadline && (
                            <p className={`text-xs font-semibold mt-1 ${getDeadlineColor(getDaysUntil(grant.application_deadline))}`}>
                              Due: {formatDate(grant.application_deadline)}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Submitted Column */}
                  <div className="border-r border-gray-100 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-blue-600 uppercase">Submitted</span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        {pipeline.submitted.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {pipeline.submitted.slice(0, 3).map((grant: any) => (
                        <Link
                          key={grant.id}
                          href={`/admin/grants/${grant.id}`}
                          className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{grant.grant_name}</p>
                          <p className="text-xs text-gray-500">{grant.agency_name}</p>
                          <p className="text-xs font-semibold text-blue-600 mt-1">
                            {formatCurrency(grant.amount_requested)} requested
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Decided Column */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Decided</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {pipeline.decided.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {pipeline.decided.slice(0, 3).map((grant: any) => (
                        <Link
                          key={grant.id}
                          href={`/admin/grants/${grant.id}`}
                          className={`block p-3 rounded-lg transition-colors ${
                            grant.status === 'approved' 
                              ? 'bg-green-50 hover:bg-green-100' 
                              : 'bg-red-50 hover:bg-red-100'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {grant.status === 'approved' ? (
                              <CheckCircle2 className="w-3 h-3 text-green-600" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-600" />
                            )}
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{grant.grant_name}</p>
                          </div>
                          <p className="text-xs text-gray-500">{grant.agency_name}</p>
                          {grant.status === 'approved' && (
                            <p className="text-xs font-semibold text-green-600 mt-1">
                              {formatCurrency(grant.amount_awarded)} awarded
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Grant List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">All Grant Opportunities</h2>
                <span className="text-sm text-gray-500">{grants.length} total</span>
              </div>
              
              <div className="divide-y divide-gray-100">
                {grants.map((grant: any) => {
                  const statusConfig = STATUS_CONFIG[grant.status] || STATUS_CONFIG.researching;
                  const priorityConfig = PRIORITY_CONFIG[grant.priority] || PRIORITY_CONFIG.medium;
                  const StatusIcon = statusConfig.icon;
                  const daysUntil = getDaysUntil(grant.application_deadline);
                  
                  return (
                    <Link
                      key={grant.id}
                      href={`/admin/grants/${grant.id}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${priorityConfig.dot}`}></span>
                            <h3 className="font-medium text-gray-900 truncate">{grant.grant_name}</h3>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {grant.agency_name}
                            </span>
                            {grant.program_name && (
                              <span className="text-gray-400">• {grant.program_name}</span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                            {grant.target_modules?.map((module: string) => (
                              <span key={module} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                                {MODULE_NAMES[module] || module}
                              </span>
                            ))}
                            {grant.match_score > 0 && (
                              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                {grant.match_score}% match
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-green-600">{formatCurrency(grant.amount_available)}</p>
                          {grant.application_deadline && (
                            <p className={`text-xs ${getDeadlineColor(daysUntil)}`}>
                              {daysUntil !== null && daysUntil >= 0 
                                ? `${daysUntil} days left`
                                : daysUntil !== null && daysUntil < 0
                                ? 'Past due'
                                : formatDate(grant.application_deadline)
                              }
                            </p>
                          )}
                          {!grant.application_deadline && (
                            <p className="text-xs text-gray-500">Rolling deadline</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-red-50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h2 className="font-semibold text-red-900">Upcoming Deadlines</h2>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {upcomingDeadlines.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No upcoming deadlines
                  </div>
                ) : (
                  upcomingDeadlines.map((grant: any) => {
                    const daysUntil = getDaysUntil(grant.application_deadline);
                    return (
                      <Link
                        key={grant.id}
                        href={`/admin/grants/${grant.id}`}
                        className="block p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{grant.grant_name}</p>
                            <p className="text-xs text-gray-500">{grant.agency_name}</p>
                          </div>
                          <div className={`text-right ${getDeadlineColor(daysUntil)}`}>
                            <p className="text-sm font-bold">{daysUntil} days</p>
                            <p className="text-xs">{formatDate(grant.application_deadline)}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
              <div className="p-3 border-t border-gray-100">
                <Link
                  href="/admin/grants/calendar"
                  className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Calendar className="w-4 h-4" />
                  View Full Calendar
                </Link>
              </div>
            </div>

            {/* Upcoming Milestones */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h2 className="font-semibold text-gray-900">Milestones & Tasks</h2>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {milestones.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No pending milestones
                  </div>
                ) : (
                  milestones.slice(0, 5).map((milestone: any) => (
                    <div key={milestone.id} className="p-3">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{milestone.milestone_name}</p>
                          <p className="text-xs text-gray-500">{milestone.grant_opportunities?.grant_name}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(milestone.due_date)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Assistant Quick Access */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-sm p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" />
                <h2 className="font-semibold">Javari Grant Assistant</h2>
              </div>
              <p className="text-sm text-purple-100 mb-4">
                Get AI-powered recommendations to improve your grant applications and increase win rates.
              </p>
              <Link
                href="/admin/grants/ai-assistant"
                className="block w-full py-2 px-4 bg-white text-purple-600 text-sm font-medium rounded-lg text-center hover:bg-purple-50 transition-colors"
              >
                Open AI Assistant
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">CRAIverse Funding Target</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Total Target</span>
                    <span className="font-semibold text-gray-900">$1.289B</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min((stats.totalAwarded / 1289000000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(stats.totalAwarded)} awarded ({((stats.totalAwarded / 1289000000) * 100).toFixed(2)}%)
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pipeline Value</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(stats.totalRequested)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
