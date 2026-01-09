'use client'

// components/admin/ExpenseTrackerCard.tsx
// Dashboard card for expense tracking - shows summary stats and expands to full dashboard

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, AlertCircle, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ExpenseSummary {
  monthlyTotal: number
  annualTotal: number
  activeSubscriptions: number
  pendingAlerts: number
}

export default function ExpenseTrackerCard() {
  const router = useRouter()
  const [summary, setSummary] = useState<ExpenseSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      
      // Fetch subscriptions summary
      const subsRes = await fetch('/api/expenses/subscriptions?active=true')
      const subsData = await subsRes.json()
      
      // Fetch alerts count
      const alertsRes = await fetch('/api/expenses/alerts')
      const alertsData = await alertsRes.json()
      
      setSummary({
        monthlyTotal: subsData.summary?.monthlyTotal || 0,
        annualTotal: subsData.summary?.annualTotal || 0,
        activeSubscriptions: subsData.summary?.active || 0,
        pendingAlerts: alertsData.count || 0
      })
      
      setError(null)
    } catch (err) {
      console.error('Error fetching expense summary:', err)
      setError('Failed to load summary')
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = () => {
    router.push('/admin/expenses')
  }

  if (loading) {
    return (
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Bill Management
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCardClick}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Bill Management
          </CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Click to view details</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCardClick}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Bill Management
        </CardTitle>
        <CardDescription>Track subscriptions, expenses, and renewals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Monthly Total
            </div>
            <div className="text-2xl font-bold">
              ${summary?.monthlyTotal.toLocaleString()}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Active Subscriptions
            </div>
            <div className="text-2xl font-bold">
              {summary?.activeSubscriptions}
            </div>
          </div>
        </div>

        {summary && summary.pendingAlerts > 0 && (
          <div className="mt-4 p-3 bg-cyan-400 dark:bg-cyan-400 rounded-lg border border-cyan-400 dark:border-cyan-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-cyan-400 dark:text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400 dark:text-cyan-400">
                {summary.pendingAlerts} renewal{summary.pendingAlerts !== 1 ? 's' : ''} due soon
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground text-center">
          Click to view full dashboard →
        </div>
      </CardContent>
    </Card>
  )
}
