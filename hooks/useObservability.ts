// /hooks/useObservability.ts
// Observability & Monitoring Hook - CR AudioViz AI
'use client';

import { useState, useEffect, useCallback } from 'react';

// Types
interface ServiceHealth {
  service_name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  response_time_ms: number;
  status_code: number;
  last_check_at: string;
  error_message?: string;
}

interface ErrorLog {
  id: string;
  service_name: string;
  error_type: string;
  error_message: string;
  endpoint?: string;
  user_impact: string;
  created_at: string;
}

interface AlertIncident {
  id: string;
  rule_name: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved';
  triggered_at: string;
  service_name?: string;
}

interface DashboardData {
  health: {
    services: ServiceHealth[];
    healthy: number;
    total: number;
    status: 'healthy' | 'degraded';
  };
  errors: {
    recent: ErrorLog[];
    count: number;
  };
  alerts: {
    active: AlertIncident[];
    count: number;
  };
  uptime: {
    data: any[];
    average: number;
  };
}

// Hook for dashboard overview
export function useObservabilityDashboard(refreshInterval = 60000) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/observability?action=dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      const dashboardData = await res.json();
      setData(dashboardData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, isLoading, error, refresh: fetchData };
}

// Hook for service health
export function useServiceHealth(serviceName?: string) {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [overallStatus, setOverallStatus] = useState<'healthy' | 'degraded'>('healthy');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    try {
      let url = '/api/observability?action=health';
      if (serviceName) url += `&service=${serviceName}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      setServices(data.services || []);
      setOverallStatus(data.overall || 'healthy');
    } catch (err) {
      console.error('Failed to fetch health:', err);
    } finally {
      setIsLoading(false);
    }
  }, [serviceName]);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Every 30s
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return { services, overallStatus, isLoading, refresh: fetchHealth };
}

// Hook for error tracking
export function useErrorTracking(options: {
  service?: string;
  range?: string;
  limit?: number;
} = {}) {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchErrors = useCallback(async () => {
    try {
      const params = new URLSearchParams({ action: 'errors' });
      if (options.service) params.set('service', options.service);
      if (options.range) params.set('range', options.range);
      if (options.limit) params.set('limit', options.limit.toString());

      const res = await fetch(`/api/observability?${params}`);
      const data = await res.json();
      
      setErrors(data.errors || []);
      setCounts(data.counts || {});
    } catch (err) {
      console.error('Failed to fetch errors:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options.service, options.range, options.limit]);

  useEffect(() => {
    fetchErrors();
  }, [fetchErrors]);

  return { errors, counts, isLoading, refresh: fetchErrors };
}

// Hook for alerts
export function useAlerts() {
  const [incidents, setIncidents] = useState<AlertIncident[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/observability?action=alerts');
      const data = await res.json();
      
      setIncidents(data.activeIncidents || []);
      setRules(data.rules || []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acknowledgeIncident = async (incidentId: string, userId?: string) => {
    try {
      const res = await fetch('/api/observability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId,
          status: 'acknowledged',
          resolvedBy: userId
        })
      });
      
      if (res.ok) {
        await fetchAlerts();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const resolveIncident = async (incidentId: string, userId?: string, notes?: string) => {
    try {
      const res = await fetch('/api/observability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId,
          status: 'resolved',
          resolvedBy: userId,
          resolutionNotes: notes
        })
      });
      
      if (res.ok) {
        await fetchAlerts();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return { 
    incidents, 
    rules, 
    isLoading, 
    refresh: fetchAlerts,
    acknowledgeIncident,
    resolveIncident
  };
}

// Utility: Log error from client
export async function logError(
  serviceName: string,
  errorType: string,
  errorMessage: string,
  options?: {
    stackTrace?: string;
    endpoint?: string;
    userId?: string;
    requestId?: string;
    userImpact?: 'none' | 'minor' | 'major' | 'critical';
  }
): Promise<{ success: boolean; errorId?: string }> {
  try {
    const res = await fetch('/api/observability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'log-error',
        serviceName,
        errorType,
        errorMessage,
        ...options
      })
    });

    const data = await res.json();
    return { success: res.ok, errorId: data.errorId };
  } catch (err) {
    return { success: false };
  }
}

// Utility: Record metric from client
export async function recordMetric(
  metricName: string,
  value: number,
  serviceName: string,
  options?: {
    metricType?: 'gauge' | 'counter' | 'histogram';
    endpoint?: string;
    unit?: string;
    tags?: Record<string, string>;
  }
): Promise<{ success: boolean; metricId?: string }> {
  try {
    const res = await fetch('/api/observability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record-metric',
        metricName,
        value,
        serviceName,
        ...options
      })
    });

    const data = await res.json();
    return { success: res.ok, metricId: data.metricId };
  } catch (err) {
    return { success: false };
  }
}

// Utility: Run health check
export async function runHealthCheck(): Promise<{
  success: boolean;
  results?: Array<{
    service: string;
    status: string;
    responseTime: number;
  }>;
}> {
  try {
    const res = await fetch('/api/observability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'health-check' })
    });

    const data = await res.json();
    return { success: res.ok, results: data.results };
  } catch (err) {
    return { success: false };
  }
}

// Performance tracking wrapper
export function withPerformanceTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  metricName: string,
  serviceName: string
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - startTime;
      
      // Record metric asynchronously
      recordMetric(metricName, duration, serviceName, {
        metricType: 'histogram',
        unit: 'ms'
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Log error
      logError(serviceName, 'function_error', (error as Error).message, {
        stackTrace: (error as Error).stack
      });
      
      throw error;
    }
  }) as T;
}

// Error boundary helper
export function createErrorHandler(serviceName: string) {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    logError(serviceName, 'react_error', error.message, {
      stackTrace: error.stack,
      userImpact: 'major'
    });
  };
}

// Status colors for UI
export const STATUS_COLORS = {
  healthy: 'text-green-500',
  degraded: 'text-yellow-500',
  unhealthy: 'text-red-500',
  unknown: 'text-gray-500'
} as const;

export const SEVERITY_COLORS = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
} as const;

export default useObservabilityDashboard;
