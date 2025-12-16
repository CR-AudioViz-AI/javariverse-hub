'use client';

import { useState, useEffect } from 'react';

// ============ TYPES ============
interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  source_app: string;
  user_email: string;
  user_name: string;
  auto_fix_attempted: boolean;
  auto_fix_successful: boolean | null;
  auto_fix_actions: any[];
  auto_fix_logs: string;
  auto_fix_timestamp: string;
  assigned_bot: string;
  resolution: string;
  resolution_type: string;
  resolved_by: string;
  resolved_at: string;
  created_at: string;
  updated_at: string;
}

interface Enhancement {
  id: string;
  request_number: string;
  title: string;
  description: string;
  use_case: string;
  expected_benefit: string;
  category: string;
  priority: string;
  status: string;
  source_app: string;
  user_email: string;
  user_name: string;
  ai_analysis: any;
  ai_implementation_plan: string;
  ai_estimated_effort: string;
  ai_estimated_complexity: string;
  ai_recommendations: string;
  approval_status: string;
  upvotes: number;
  downvotes: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

// ============ STATUS CONFIGURATIONS ============
const TICKET_STATUSES = [
  { key: 'open', label: 'Open', color: 'bg-blue-500', icon: '📥' },
  { key: 'auto_fixing', label: 'Auto-Fixing', color: 'bg-yellow-500', icon: '🤖' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-purple-500', icon: '🔧' },
  { key: 'awaiting_user', label: 'Awaiting User', color: 'bg-orange-500', icon: '⏳' },
  { key: 'resolved', label: 'Resolved', color: 'bg-green-500', icon: '✅' },
  { key: 'escalated', label: 'Escalated', color: 'bg-red-500', icon: '🚨' },
  { key: 'closed', label: 'Closed', color: 'bg-gray-500', icon: '📁' },
];

const ENHANCEMENT_STATUSES = [
  { key: 'submitted', label: 'Submitted', color: 'bg-blue-500', icon: '📝' },
  { key: 'under_review', label: 'Under Review', color: 'bg-yellow-500', icon: '🔍' },
  { key: 'analysis_complete', label: 'Analyzed', color: 'bg-indigo-500', icon: '🧠' },
  { key: 'approved', label: 'Approved', color: 'bg-green-500', icon: '✅' },
  { key: 'in_development', label: 'In Development', color: 'bg-purple-500', icon: '💻' },
  { key: 'testing', label: 'Testing', color: 'bg-cyan-500', icon: '🧪' },
  { key: 'deployed', label: 'Deployed', color: 'bg-emerald-500', icon: '🚀' },
  { key: 'rejected', label: 'Rejected', color: 'bg-red-500', icon: '❌' },
  { key: 'deferred', label: 'Deferred', color: 'bg-gray-500', icon: '⏸️' },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-gray-400 text-white',
};

const CATEGORY_ICONS: Record<string, string> = {
  bug: '🐛',
  error: '❌',
  question: '❓',
  account: '👤',
  billing: '💳',
  feature: '✨',
  performance: '⚡',
  security: '🔒',
  improvement: '📈',
  integration: '🔗',
  ui_ux: '🎨',
  automation: '🤖',
  api: '🔌',
  other: '📋',
};

// ============ MAIN COMPONENT ============
export default function SupportDashboard() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'enhancements'>('tickets');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [enhancements, setEnhancements] = useState<Enhancement[]>([]);
  const [selectedItem, setSelectedItem] = useState<Ticket | Enhancement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [stats, setStats] = useState<any>({});

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tickets') {
        const res = await fetch('/api/tickets');
        const data = await res.json();
        if (data.success) {
          setTickets(data.tickets || []);
          setStats(data.stats || {});
        }
      } else {
        const res = await fetch('/api/enhancements');
        const data = await res.json();
        if (data.success) {
          setEnhancements(data.enhancements || []);
          setStats(data.stats || {});
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  };

  const getStatusConfig = (status: string) => {
    const configs = activeTab === 'tickets' ? TICKET_STATUSES : ENHANCEMENT_STATUSES;
    return configs.find(s => s.key === status) || { key: status, label: status, color: 'bg-gray-500', icon: '📋' };
  };

  const getItemsByStatus = (status: string) => {
    if (activeTab === 'tickets') {
      return tickets.filter(t => t.status === status);
    } else {
      return enhancements.filter(e => e.status === status);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // ============ KANBAN CARD ============
  const KanbanCard = ({ item }: { item: Ticket | Enhancement }) => {
    const isTicket = 'ticket_number' in item;
    const number = isTicket ? (item as Ticket).ticket_number : (item as Enhancement).request_number;
    const ticket = item as Ticket;
    
    return (
      <div
        onClick={() => setSelectedItem(item)}
        className={`bg-white rounded-lg shadow-sm border-l-4 p-3 cursor-pointer hover:shadow-md transition-all ${
          selectedItem?.id === item.id ? 'ring-2 ring-indigo-500' : ''
        } ${
          item.priority === 'critical' ? 'border-l-red-600' :
          item.priority === 'high' ? 'border-l-orange-500' :
          item.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-gray-400'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-mono text-gray-500">{number}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${PRIORITY_COLORS[item.priority] || 'bg-gray-400'}`}>
            {item.priority}
          </span>
        </div>
        
        {/* Title */}
        <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">{item.title}</h4>
        
        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <span>{CATEGORY_ICONS[item.category] || '📋'}</span>
          <span className="capitalize">{item.category}</span>
          <span className="text-gray-300">•</span>
          <span>{item.source_app}</span>
        </div>
        
        {/* Bot Status (for tickets) */}
        {isTicket && ticket.assigned_bot && (
          <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${
            ticket.auto_fix_successful === true ? 'bg-green-100 text-green-700' :
            ticket.auto_fix_successful === false ? 'bg-red-100 text-red-700' :
            ticket.auto_fix_attempted ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
          }`}>
            <span>🤖</span>
            <span>
              {ticket.auto_fix_successful === true ? 'Auto-Fixed' :
               ticket.auto_fix_successful === false ? 'Fix Failed' :
               ticket.auto_fix_attempted ? 'Fixing...' : 'Bot Assigned'}
            </span>
          </div>
        )}
        
        {/* Enhancement votes */}
        {!isTicket && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-green-600">👍 {(item as Enhancement).upvotes || 0}</span>
            <span className="text-red-600">👎 {(item as Enhancement).downvotes || 0}</span>
            <span className="text-gray-500">👁️ {(item as Enhancement).view_count || 0}</span>
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-gray-400">
          <span>{item.user_name || item.user_email || 'Anonymous'}</span>
          <span>{getTimeAgo(item.created_at)}</span>
        </div>
      </div>
    );
  };

  // ============ LIST ROW ============
  const ListRow = ({ item }: { item: Ticket | Enhancement }) => {
    const isTicket = 'ticket_number' in item;
    const number = isTicket ? (item as Ticket).ticket_number : (item as Enhancement).request_number;
    const statusConfig = getStatusConfig(item.status);
    const ticket = item as Ticket;
    
    return (
      <tr
        onClick={() => setSelectedItem(item)}
        className={`cursor-pointer hover:bg-gray-50 ${selectedItem?.id === item.id ? 'bg-indigo-50' : ''}`}
      >
        <td className="px-4 py-3">
          <span className="font-mono text-sm text-gray-600">{number}</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span>{CATEGORY_ICONS[item.category] || '📋'}</span>
            <div>
              <div className="font-medium text-gray-900 line-clamp-1">{item.title}</div>
              <div className="text-xs text-gray-500">{item.source_app}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${statusConfig.color}`}>
            <span>{statusConfig.icon}</span>
            <span>{statusConfig.label}</span>
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[item.priority]}`}>
            {item.priority}
          </span>
        </td>
        <td className="px-4 py-3">
          {isTicket ? (
            <div className="flex items-center gap-1">
              {ticket.assigned_bot && (
                <span className={`text-xs px-2 py-0.5 rounded ${
                  ticket.auto_fix_successful === true ? 'bg-green-100 text-green-700' :
                  ticket.auto_fix_successful === false ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  🤖 {ticket.auto_fix_successful === true ? 'Fixed' : ticket.auto_fix_successful === false ? 'Failed' : 'Assigned'}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-600">👍{(item as Enhancement).upvotes}</span>
              <span className="text-red-600">👎{(item as Enhancement).downvotes}</span>
            </div>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {getTimeAgo(item.created_at)}
        </td>
      </tr>
    );
  };

  // ============ DETAIL PANEL ============
  const DetailPanel = () => {
    if (!selectedItem) {
      return (
        <div className="h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-5xl mb-4">{activeTab === 'tickets' ? '🎫' : '💡'}</div>
            <p>Select an item to view details</p>
          </div>
        </div>
      );
    }

    const isTicket = 'ticket_number' in selectedItem;
    const number = isTicket ? (selectedItem as Ticket).ticket_number : (selectedItem as Enhancement).request_number;
    const statusConfig = getStatusConfig(selectedItem.status);
    const ticket = selectedItem as Ticket;
    const enhancement = selectedItem as Enhancement;

    return (
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm text-gray-500">{number}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[selectedItem.priority]}`}>
                  {selectedItem.priority}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{selectedItem.title}</h2>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ✕
            </button>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-3 mt-3">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white ${statusConfig.color}`}>
              <span>{statusConfig.icon}</span>
              <span>{statusConfig.label}</span>
            </span>
            <span className="text-sm text-gray-500">
              {CATEGORY_ICONS[selectedItem.category]} {selectedItem.category}
            </span>
            <span className="text-sm text-gray-500">
              📍 {selectedItem.source_app}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Description */}
          <section>
            <h3 className="font-semibold text-gray-700 mb-2">📝 Description</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
              {selectedItem.description}
            </div>
          </section>

          {/* Bot Status (Tickets only) */}
          {isTicket && ticket.assigned_bot && (
            <section>
              <h3 className="font-semibold text-gray-700 mb-2">🤖 Javari Auto-Fix Bot</h3>
              <div className={`rounded-lg p-4 ${
                ticket.auto_fix_successful === true ? 'bg-green-50 border border-green-200' :
                ticket.auto_fix_successful === false ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">
                    {ticket.auto_fix_successful === true ? '✅' :
                     ticket.auto_fix_successful === false ? '❌' : '🔄'}
                  </span>
                  <div>
                    <div className="font-medium">
                      {ticket.auto_fix_successful === true ? 'Successfully Auto-Fixed!' :
                       ticket.auto_fix_successful === false ? 'Auto-Fix Failed - Escalated' :
                       ticket.auto_fix_attempted ? 'Auto-Fix In Progress...' : 'Bot Assigned'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Bot: {ticket.assigned_bot}
                    </div>
                  </div>
                </div>
                
                {/* Resolution */}
                {ticket.resolution && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm font-medium text-gray-700 mb-1">Resolution:</div>
                    <div className="text-sm text-gray-600">{ticket.resolution}</div>
                  </div>
                )}
                
                {/* Actions Taken */}
                {ticket.auto_fix_actions && ticket.auto_fix_actions.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm font-medium text-gray-700 mb-2">Actions Taken:</div>
                    <div className="space-y-1">
                      {ticket.auto_fix_actions.map((action: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className={action.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
                            {action.status === 'completed' ? '✓' : '○'}
                          </span>
                          <span>{action.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Logs */}
                {ticket.auto_fix_logs && (
                  <div className="mt-3 pt-3 border-t">
                    <details>
                      <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                        View Bot Logs
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto max-h-48">
                        {ticket.auto_fix_logs}
                      </pre>
                    </details>
                  </div>
                )}
                
                {ticket.auto_fix_timestamp && (
                  <div className="mt-2 text-xs text-gray-500">
                    Last action: {formatDate(ticket.auto_fix_timestamp)}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* AI Analysis (Enhancements only) */}
          {!isTicket && enhancement.ai_implementation_plan && (
            <section>
              <h3 className="font-semibold text-gray-700 mb-2">🧠 Javari AI Analysis</h3>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                {enhancement.ai_estimated_complexity && (
                  <div className="flex items-center gap-4 mb-3">
                    <div>
                      <span className="text-xs text-gray-500">Complexity</span>
                      <div className="font-medium capitalize">{enhancement.ai_estimated_complexity}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Effort</span>
                      <div className="font-medium">{enhancement.ai_estimated_effort || 'TBD'}</div>
                    </div>
                  </div>
                )}
                
                {enhancement.ai_implementation_plan && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Implementation Plan:</div>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap">
                      {enhancement.ai_implementation_plan}
                    </div>
                  </div>
                )}
                
                {enhancement.ai_recommendations && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Recommendations:</div>
                    <div className="text-sm text-gray-600">{enhancement.ai_recommendations}</div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Use Case (Enhancements only) */}
          {!isTicket && enhancement.use_case && (
            <section>
              <h3 className="font-semibold text-gray-700 mb-2">💼 Use Case</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                {enhancement.use_case}
              </div>
            </section>
          )}

          {/* Voting (Enhancements only) */}
          {!isTicket && (
            <section>
              <h3 className="font-semibold text-gray-700 mb-2">📊 Community Feedback</h3>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl">👍</div>
                  <div className="font-bold text-green-600">{enhancement.upvotes || 0}</div>
                  <div className="text-xs text-gray-500">upvotes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl">👎</div>
                  <div className="font-bold text-red-600">{enhancement.downvotes || 0}</div>
                  <div className="text-xs text-gray-500">downvotes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl">👁️</div>
                  <div className="font-bold text-gray-600">{enhancement.view_count || 0}</div>
                  <div className="text-xs text-gray-500">views</div>
                </div>
              </div>
            </section>
          )}

          {/* Metadata */}
          <section>
            <h3 className="font-semibold text-gray-700 mb-2">📋 Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Submitted by:</span>
                <div className="font-medium">{selectedItem.user_name || selectedItem.user_email || 'Anonymous'}</div>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <div className="font-medium">{selectedItem.user_email || 'N/A'}</div>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>
                <div className="font-medium">{formatDate(selectedItem.created_at)}</div>
              </div>
              <div>
                <span className="text-gray-500">Updated:</span>
                <div className="font-medium">{formatDate(selectedItem.updated_at)}</div>
              </div>
              {isTicket && ticket.resolved_at && (
                <>
                  <div>
                    <span className="text-gray-500">Resolved at:</span>
                    <div className="font-medium">{formatDate(ticket.resolved_at)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Resolved by:</span>
                    <div className="font-medium">{ticket.resolved_by || 'N/A'}</div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  };

  // ============ NEW ITEM FORM ============
  const NewItemForm = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      use_case: '',
      source_app: 'platform',
      user_email: '',
      user_name: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      
      try {
        const endpoint = activeTab === 'tickets' ? '/api/tickets' : '/api/enhancements';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        const data = await res.json();
        if (data.success) {
          setShowNewForm(false);
          fetchData();
          alert(`${activeTab === 'tickets' ? 'Ticket' : 'Enhancement'} created: ${data.ticket?.ticket_number || data.enhancement?.request_number}`);
        } else {
          alert('Error: ' + data.error);
        }
      } catch (error) {
        alert('Failed to submit');
      }
      setSubmitting(false);
    };

    const categories = activeTab === 'tickets' 
      ? ['bug', 'error', 'question', 'account', 'billing', 'feature', 'performance', 'security', 'other']
      : ['feature', 'improvement', 'integration', 'ui_ux', 'performance', 'automation', 'api', 'other'];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {activeTab === 'tickets' ? '🎫 New Ticket' : '💡 New Enhancement Request'}
            </h2>
            <button onClick={() => setShowNewForm(false)} className="p-2 hover:bg-gray-100 rounded">✕</button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder={activeTab === 'tickets' ? 'Brief description of the issue' : 'What feature would you like?'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder={activeTab === 'tickets' ? 'Detailed description of what happened...' : 'Describe the feature in detail...'}
              />
            </div>
            
            {activeTab === 'enhancements' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Use Case</label>
                <textarea
                  rows={2}
                  value={formData.use_case}
                  onChange={e => setFormData({...formData, use_case: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="How would you use this feature?"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="critical">🔴 Critical</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={formData.user_name}
                  onChange={e => setFormData({...formData, user_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                <input
                  type="email"
                  value={formData.user_email}
                  onChange={e => setFormData({...formData, user_email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source App</label>
              <select
                value={formData.source_app}
                onChange={e => setFormData({...formData, source_app: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="platform">🌐 Platform</option>
                <option value="javari">🤖 Javari AI</option>
                <option value="tools">🛠️ Tools</option>
                <option value="games">🎮 Games</option>
                <option value="billing">💳 Billing</option>
              </select>
            </div>
            
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ============ MAIN RENDER ============
  const statuses = activeTab === 'tickets' ? TICKET_STATUSES : ENHANCEMENT_STATUSES;
  const items = activeTab === 'tickets' ? tickets : enhancements;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-[1800px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
              <p className="text-gray-500 text-sm">Track tickets and enhancement requests</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="text-center px-3">
                  <div className="font-bold text-xl">{stats.total || 0}</div>
                  <div className="text-gray-500">Total</div>
                </div>
                {activeTab === 'tickets' && (
                  <>
                    <div className="text-center px-3 border-l">
                      <div className="font-bold text-xl text-green-600">{stats.autoFixed || 0}</div>
                      <div className="text-gray-500">Auto-Fixed</div>
                    </div>
                    <div className="text-center px-3 border-l">
                      <div className="font-bold text-xl text-blue-600">{stats.byStatus?.open || 0}</div>
                      <div className="text-gray-500">Open</div>
                    </div>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setShowNewForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <span>+</span>
                <span>New {activeTab === 'tickets' ? 'Ticket' : 'Enhancement'}</span>
              </button>
            </div>
          </div>
          
          {/* Tabs and View Toggle */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => { setActiveTab('tickets'); setSelectedItem(null); }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'tickets' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🎫 Tickets
              </button>
              <button
                onClick={() => { setActiveTab('enhancements'); setSelectedItem(null); }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'enhancements' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                💡 Enhancements
              </button>
            </div>
            
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'kanban' ? 'bg-white shadow' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📝 List
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading...</p>
            </div>
          </div>
        ) : viewMode === 'kanban' ? (
          /* KANBAN VIEW */
          <div className="flex gap-4 overflow-x-auto pb-4">
            {/* Kanban Columns */}
            <div className="flex gap-4 min-w-max">
              {statuses.map(status => {
                const statusItems = getItemsByStatus(status.key);
                return (
                  <div key={status.key} className="w-80 flex-shrink-0">
                    {/* Column Header */}
                    <div className={`${status.color} text-white rounded-t-lg px-4 py-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <span>{status.icon}</span>
                        <span className="font-medium">{status.label}</span>
                      </div>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                        {statusItems.length}
                      </span>
                    </div>
                    
                    {/* Column Content */}
                    <div className="bg-gray-200/50 rounded-b-lg p-2 min-h-[500px] space-y-2">
                      {statusItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          No items
                        </div>
                      ) : (
                        statusItems.map((item: any) => (
                          <KanbanCard key={item.id} item={item} />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Detail Panel (Fixed on right) */}
            {selectedItem && (
              <div className="w-[500px] flex-shrink-0 bg-white rounded-lg shadow-lg sticky top-24 h-[calc(100vh-120px)] overflow-hidden">
                <DetailPanel />
              </div>
            )}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="flex gap-4">
            {/* Table */}
            <div className={`bg-white rounded-lg shadow overflow-hidden ${selectedItem ? 'flex-1' : 'w-full'}`}>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      {activeTab === 'tickets' ? 'Bot' : 'Votes'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        No {activeTab} yet. Create one to get started!
                      </td>
                    </tr>
                  ) : (
                    items.map((item: any) => <ListRow key={item.id} item={item} />)
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Detail Panel */}
            {selectedItem && (
              <div className="w-[500px] flex-shrink-0 bg-white rounded-lg shadow-lg h-[calc(100vh-200px)] overflow-hidden">
                <DetailPanel />
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Item Form Modal */}
      {showNewForm && <NewItemForm />}
    </div>
  );
}
