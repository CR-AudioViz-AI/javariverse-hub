// External Distribution Admin - Track Amazon, Apple, etc.
// Timestamp: January 1, 2026 - 4:45 PM EST

'use client'

import { useState, useEffect } from 'react'
import { 
  BookOpen, ExternalLink, Upload, CheckCircle, Clock, 
  AlertTriangle, DollarSign, TrendingUp, RefreshCw
} from 'lucide-react'

interface DistributionEntry {
  id: string
  book_slug: string
  book_title: string
  platform: 'amazon_kdp' | 'apple_books' | 'google_play' | 'kobo' | 'draft2digital' | 'gumroad'
  status: 'pending' | 'submitted' | 'live' | 'rejected'
  external_id?: string
  external_url?: string
  price: number
  royalty_rate: number
  sales_count: number
  revenue: number
  submitted_at?: string
  live_at?: string
  notes?: string
}

const PLATFORMS = {
  amazon_kdp: { name: 'Amazon KDP', icon: '📚', royalty: 0.70 },
  apple_books: { name: 'Apple Books', icon: '🍎', royalty: 0.70 },
  google_play: { name: 'Google Play', icon: '📱', royalty: 0.70 },
  kobo: { name: 'Kobo', icon: '📖', royalty: 0.70 },
  draft2digital: { name: 'Draft2Digital', icon: '✍️', royalty: 0.60 },
  gumroad: { name: 'Gumroad', icon: '🛒', royalty: 0.90 }
}

export default function DistributionAdminPage() {
  const [entries, setEntries] = useState<DistributionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    live: 0,
    pending: 0,
    totalRevenue: 0,
    totalSales: 0
  })

  useEffect(() => {
    loadDistributions()
  }, [])

  const loadDistributions = async () => {
    try {
      const res = await fetch('/api/admin/distributions')
      const data = await res.json()
      setEntries(data.entries || [])
      calculateStats(data.entries || [])
    } catch (err) {
      console.error('Failed to load distributions:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: DistributionEntry[]) => {
    setStats({
      total: data.length,
      live: data.filter(e => e.status === 'live').length,
      pending: data.filter(e => e.status === 'pending' || e.status === 'submitted').length,
      totalRevenue: data.reduce((sum, e) => sum + e.revenue, 0),
      totalSales: data.reduce((sum, e) => sum + e.sales_count, 0)
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-cyan-400/20 text-cyan-400',
      submitted: 'bg-blue-500/20 text-blue-400',
      live: 'bg-cyan-500/20 text-cyan-500',
      rejected: 'bg-red-500/20 text-red-400'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-cyan-500" />
              External Distribution
            </h1>
            <p className="text-gray-400 mt-1">Track eBook distribution across all platforms</p>
          </div>
          <button
            onClick={loadDistributions}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-500"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">Total Listed</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-cyan-500 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Live</span>
            </div>
            <p className="text-2xl font-bold text-cyan-500">{stats.live}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Pending</span>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{stats.pending}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-cyan-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Total Sales</span>
            </div>
            <p className="text-2xl font-bold text-cyan-500">{stats.totalSales.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-cyan-500 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-cyan-500">${stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Platform Summary */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {Object.entries(PLATFORMS).map(([key, platform]) => {
            const platformEntries = entries.filter(e => e.platform === key)
            const liveCount = platformEntries.filter(e => e.status === 'live').length
            const revenue = platformEntries.reduce((sum, e) => sum + e.revenue, 0)
            
            return (
              <div key={key} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="text-2xl mb-2">{platform.icon}</div>
                <h3 className="font-semibold text-sm">{platform.name}</h3>
                <p className="text-xs text-gray-400">{liveCount} live</p>
                <p className="text-sm text-cyan-500 mt-1">${revenue.toFixed(2)}</p>
              </div>
            )
          })}
        </div>

        {/* Distribution Table */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">Distribution Entries</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No distribution entries yet</p>
              <p className="text-sm mt-2">Start by submitting eBooks to external platforms</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm text-gray-400">Book</th>
                    <th className="text-left px-4 py-3 text-sm text-gray-400">Platform</th>
                    <th className="text-left px-4 py-3 text-sm text-gray-400">Status</th>
                    <th className="text-left px-4 py-3 text-sm text-gray-400">Price</th>
                    <th className="text-left px-4 py-3 text-sm text-gray-400">Sales</th>
                    <th className="text-left px-4 py-3 text-sm text-gray-400">Revenue</th>
                    <th className="text-left px-4 py-3 text-sm text-gray-400">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-t border-gray-700/50 hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <span className="font-medium">{entry.book_title}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <span>{PLATFORMS[entry.platform]?.icon}</span>
                          <span className="text-sm">{PLATFORMS[entry.platform]?.name}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(entry.status)}</td>
                      <td className="px-4 py-3">${entry.price.toFixed(2)}</td>
                      <td className="px-4 py-3">{entry.sales_count}</td>
                      <td className="px-4 py-3 text-cyan-500">${entry.revenue.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        {entry.external_url ? (
                          <a
                            href={entry.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-500 hover:text-cyan-500"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-cyan-500/20 to-red-600/20 rounded-xl p-6 border border-cyan-500/30">
            <h3 className="font-bold text-lg mb-2">📚 Amazon KDP</h3>
            <p className="text-sm text-gray-400 mb-4">Upload to the world's largest book marketplace</p>
            <a 
              href="https://kdp.amazon.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-500 text-sm"
            >
              Open KDP Dashboard <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          
          <div className="bg-gradient-to-r from-gray-600/20 to-gray-500/20 rounded-xl p-6 border border-gray-500/30">
            <h3 className="font-bold text-lg mb-2">🍎 Apple Books</h3>
            <p className="text-sm text-gray-400 mb-4">Reach millions of Apple device users</p>
            <a 
              href="https://itunesconnect.apple.com/books" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 text-sm"
            >
              Open Books Connect <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-500/20 to-cyan-500/20 rounded-xl p-6 border border-cyan-500/30">
            <h3 className="font-bold text-lg mb-2">✍️ Draft2Digital</h3>
            <p className="text-sm text-gray-400 mb-4">Distribute to multiple platforms at once</p>
            <a 
              href="https://www.draft2digital.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-500 text-sm"
            >
              Open D2D Dashboard <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
