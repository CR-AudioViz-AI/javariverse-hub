'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Ban, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  Calendar,
  Activity,
  Mail,
  Shield,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Edit2,
  Trash2,
  UserPlus
} from 'lucide-react';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  credits: number;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  is_active: boolean;
  subscription_tier: string | null;
  subscription_expires_at: string | null;
  total_spent: number;
  referral_code: string | null;
}

interface FilterOptions {
  role: string;
  subscription: string;
  status: string;
  searchTerm: string;
}

export default function UsersDatabasePage() {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  // Filters
  const [filters, setFilters] = useState<FilterOptions>({
    role: 'all',
    subscription: 'all',
    status: 'all',
    searchTerm: ''
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalCredits: 0,
    totalRevenue: 0,
    pro: 0,
    business: 0,
    enterprise: 0
  });

  // Load users on component mount
  useEffect(() => {
    loadUsers();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('users-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('User data changed:', payload);
          loadUsers(); // Reload users on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Apply filters whenever users or filters change
  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  // Calculate statistics
  useEffect(() => {
    calculateStats();
  }, [filteredUsers]);

  // Load users from database
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Apply filters to user list
  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.email?.toLowerCase().includes(term) ||
        user.full_name?.toLowerCase().includes(term) ||
        user.id.toLowerCase().includes(term)
      );
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Subscription filter
    if (filters.subscription !== 'all') {
      filtered = filtered.filter(user => user.subscription_tier === filters.subscription);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => 
        filters.status === 'active' ? user.is_active : !user.is_active
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Calculate statistics
  const calculateStats = () => {
    const newStats = {
      total: filteredUsers.length,
      active: filteredUsers.filter(u => u.is_active).length,
      inactive: filteredUsers.filter(u => !u.is_active).length,
      totalCredits: filteredUsers.reduce((sum, u) => sum + (u.credits || 0), 0),
      totalRevenue: filteredUsers.reduce((sum, u) => sum + (u.total_spent || 0), 0),
      pro: filteredUsers.filter(u => u.subscription_tier === 'pro').length,
      business: filteredUsers.filter(u => u.subscription_tier === 'business').length,
      enterprise: filteredUsers.filter(u => u.subscription_tier === 'enterprise').length
    };
    setStats(newStats);
  };

  // Pagination calculations
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
  };

  // Handle user update
  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
      setSelectedUser(null);
      setShowEditModal(false);
      
      alert('User updated successfully!');
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Handle credit adjustment
  const handleAdjustCredits = async (userId: string, amount: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newCredits = Math.max(0, user.credits + amount);
    await handleUpdateUser(userId, { credits: newCredits });
  };

  // Handle ban/unban user
  const handleToggleBan = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    await handleUpdateUser(userId, { is_active: !user.is_active });
  };

  // Export users to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Email', 'Name', 'Role', 'Credits', 'Subscription', 'Status', 'Total Spent', 'Created', 'Last Login'];
    const rows = filteredUsers.map(user => [
      user.id,
      user.email,
      user.full_name || 'N/A',
      user.role,
      user.credits,
      user.subscription_tier || 'free',
      user.is_active ? 'Active' : 'Inactive',
      user.total_spent,
      new Date(user.created_at).toLocaleDateString(),
      user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Export users to JSON
  const exportToJSON = () => {
    const dataStr = JSON.stringify(filteredUsers, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-500 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Users Database</h1>
                <p className="text-slate-400">Manage all platform users</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-bold text-white">{stats.total}</span>
              </div>
              <p className="text-slate-400 text-sm">Total Users</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-cyan-500" />
                <span className="text-2xl font-bold text-white">{stats.active}</span>
              </div>
              <p className="text-slate-400 text-sm">Active Users</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-cyan-500" />
                <span className="text-2xl font-bold text-white">{stats.totalCredits.toLocaleString()}</span>
              </div>
              <p className="text-slate-400 text-sm">Total Credits</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-cyan-500" />
                <span className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</span>
              </div>
              <p className="text-slate-400 text-sm">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by email, name, or ID..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            {/* Subscription Filter */}
            <div>
              <select
                value={filters.subscription}
                onChange={(e) => setFilters({ ...filters, subscription: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Subscriptions</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="business">Business</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-4 mt-4">
            <button
              onClick={() => setFilters({ ...filters, status: 'all' })}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filters.status === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilters({ ...filters, status: 'active' })}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filters.status === 'active'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Active Only
            </button>
            <button
              onClick={() => setFilters({ ...filters, status: 'inactive' })}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filters.status === 'inactive'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Inactive Only
            </button>

            <div className="ml-auto flex gap-2">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-500 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={exportToJSON}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-500 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-400">
              <AlertCircle className="w-6 h-6 mr-2" />
              {error}
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <Users className="w-6 h-6 mr-2" />
              No users found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Subscription
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {currentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                              {user.full_name?.[0] || user.email[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white font-medium">{user.full_name || 'No name'}</div>
                              <div className="text-slate-400 text-sm">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'superadmin'
                              ? 'bg-red-500/20 text-red-400'
                              : user.role === 'admin'
                              ? 'bg-cyan-500/20 text-cyan-500'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            <Shield className="w-3 h-3" />
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-cyan-500" />
                            <span className="text-white font-medium">{user.credits.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            user.subscription_tier === 'enterprise'
                              ? 'bg-cyan-400/20 text-cyan-400'
                              : user.subscription_tier === 'business'
                              ? 'bg-cyan-500/20 text-cyan-500'
                              : user.subscription_tier === 'pro'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}>
                            {user.subscription_tier || 'free'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.is_active ? (
                            <span className="inline-flex items-center gap-1 text-cyan-500">
                              <CheckCircle className="w-4 h-4" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400">
                              <XCircle className="w-4 h-4" />
                              Banned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditModal(true);
                              }}
                              className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                              title="Edit user"
                            >
                              <Edit2 className="w-4 h-4 text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleToggleBan(user.id)}
                              className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                              title={user.is_active ? 'Ban user' : 'Unban user'}
                            >
                              <Ban className={`w-4 h-4 ${user.is_active ? 'text-red-400' : 'text-cyan-500'}`} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowActivityModal(true);
                              }}
                              className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                              title="View activity"
                            >
                              <Activity className="w-4 h-4 text-cyan-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50">
                  <div className="text-slate-400 text-sm">
                    Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <span className="text-white px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg max-w-2xl w-full p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit User</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* User Info */}
                <div>
                  <label className="block text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    disabled
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={selectedUser.full_name || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, full_name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Credits</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={selectedUser.credits}
                      onChange={(e) => setSelectedUser({ ...selectedUser, credits: parseInt(e.target.value) || 0 })}
                      className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleAdjustCredits(selectedUser.id, 100)}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                    >
                      +100
                    </button>
                    <button
                      onClick={() => handleAdjustCredits(selectedUser.id, -100)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      -100
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Subscription Tier</label>
                  <select
                    value={selectedUser.subscription_tier || 'free'}
                    onChange={(e) => setSelectedUser({ ...selectedUser, subscription_tier: e.target.value === 'free' ? null : e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="business">Business</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => handleUpdateUser(selectedUser.id, {
                      full_name: selectedUser.full_name,
                      role: selectedUser.role,
                      credits: selectedUser.credits,
                      subscription_tier: selectedUser.subscription_tier
                    })}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Modal */}
        {showActivityModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg max-w-4xl w-full p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">User Activity</h2>
                <button
                  onClick={() => {
                    setShowActivityModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* User Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="text-slate-400 text-sm mb-1">Total Spent</div>
                    <div className="text-white text-xl font-bold">${selectedUser.total_spent.toFixed(2)}</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="text-slate-400 text-sm mb-1">Current Credits</div>
                    <div className="text-white text-xl font-bold">{selectedUser.credits.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="text-slate-400 text-sm mb-1">Last Login</div>
                    <div className="text-white text-sm">
                      {selectedUser.last_login 
                        ? new Date(selectedUser.last_login).toLocaleDateString()
                        : 'Never'
                      }
                    </div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="text-slate-400 text-sm mb-1">Member Since</div>
                    <div className="text-white text-sm">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Activity Log Placeholder */}
                <div className="bg-slate-900/50 rounded-lg p-6 text-center">
                  <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Activity logging will be implemented in the next phase</p>
                  <p className="text-slate-500 text-sm mt-2">This will show app usage, purchases, and system interactions</p>
                </div>

                <button
                  onClick={() => {
                    setShowActivityModal(false);
                    setSelectedUser(null);
                  }}
                  className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
