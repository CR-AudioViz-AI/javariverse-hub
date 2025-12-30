// /hooks/useDeveloper.ts
// Developer Platform Hook - CR AudioViz AI
'use client';

import { useState, useEffect, useCallback } from 'react';

// Types
interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key_prefix: string;
  scopes: string[];
  environment: 'development' | 'staging' | 'production';
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  total_requests: number;
  last_used_at?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  secret?: string; // Only on creation
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  last_delivery_at?: string;
  last_delivery_status?: string;
  created_at: string;
  secret?: string; // Only on creation
}

interface WebhookDelivery {
  id: string;
  event_type: string;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  response_status?: number;
  response_time_ms?: number;
  error_message?: string;
  created_at: string;
}

interface UsageLog {
  id: string;
  method: string;
  endpoint: string;
  status_code: number;
  response_time_ms?: number;
  created_at: string;
}

interface UsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
}

interface WebhookEvent {
  name: string;
  description: string;
}

// Hook for API Keys
export function useApiKeys(userId: string | null) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchKeys = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const res = await fetch(`/api/developer?action=keys&userId=${userId}`);
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const createKey = async (params: {
    name: string;
    description?: string;
    scopes?: string[];
    environment?: 'development' | 'staging' | 'production';
  }): Promise<{ success: boolean; key?: ApiKey; error?: string }> => {
    try {
      const res = await fetch('/api/developer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-key',
          userId,
          ...params
        })
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };

      await fetchKeys();
      return { success: true, key: data.key };
    } catch (err) {
      return { success: false, error: 'Failed to create key' };
    }
  };

  const updateKey = async (
    keyId: string,
    updates: Partial<Pick<ApiKey, 'name' | 'description' | 'scopes' | 'is_active'>>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/developer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-key',
          userId,
          id: keyId,
          ...updates
        })
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };

      await fetchKeys();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to update key' };
    }
  };

  const revokeKey = async (keyId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(
        `/api/developer?action=revoke-key&userId=${userId}&id=${keyId}`,
        { method: 'DELETE' }
      );

      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };

      await fetchKeys();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to revoke key' };
    }
  };

  return {
    keys,
    isLoading,
    refresh: fetchKeys,
    createKey,
    updateKey,
    revokeKey
  };
}

// Hook for Webhooks
export function useWebhooks(userId: string | null) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWebhooks = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const res = await fetch(`/api/developer?action=webhooks&userId=${userId}`);
      const data = await res.json();
      setWebhooks(data.webhooks || []);
    } catch (err) {
      console.error('Failed to fetch webhooks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const createWebhook = async (params: {
    name: string;
    url: string;
    events: string[];
  }): Promise<{ success: boolean; webhook?: Webhook; error?: string }> => {
    try {
      const res = await fetch('/api/developer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-webhook',
          userId,
          ...params
        })
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };

      await fetchWebhooks();
      return { success: true, webhook: data.webhook };
    } catch (err) {
      return { success: false, error: 'Failed to create webhook' };
    }
  };

  const updateWebhook = async (
    webhookId: string,
    updates: Partial<Pick<Webhook, 'name' | 'url' | 'events' | 'is_active'>>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/developer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-webhook',
          userId,
          id: webhookId,
          ...updates
        })
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };

      await fetchWebhooks();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to update webhook' };
    }
  };

  const deleteWebhook = async (webhookId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(
        `/api/developer?action=delete-webhook&userId=${userId}&id=${webhookId}`,
        { method: 'DELETE' }
      );

      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };

      await fetchWebhooks();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to delete webhook' };
    }
  };

  const testWebhook = async (webhookId: string): Promise<{
    success: boolean;
    status?: string;
    responseStatus?: number;
    responseTime?: number;
    error?: string;
  }> => {
    try {
      const res = await fetch('/api/developer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test-webhook',
          userId,
          webhookId
        })
      });

      const data = await res.json();
      return {
        success: data.success,
        status: data.status,
        responseStatus: data.responseStatus,
        responseTime: data.responseTime,
        error: data.error
      };
    } catch (err) {
      return { success: false, error: 'Failed to test webhook' };
    }
  };

  return {
    webhooks,
    isLoading,
    refresh: fetchWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook
  };
}

// Hook for single webhook details
export function useWebhookDetails(userId: string | null, webhookId: string | null) {
  const [webhook, setWebhook] = useState<Webhook | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    if (!userId || !webhookId) return;
    
    try {
      setIsLoading(true);
      const res = await fetch(`/api/developer?action=webhooks&userId=${userId}&id=${webhookId}`);
      const data = await res.json();
      setWebhook(data.webhook);
      setDeliveries(data.deliveries || []);
    } catch (err) {
      console.error('Failed to fetch webhook details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, webhookId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { webhook, deliveries, isLoading, refresh: fetchDetails };
}

// Hook for API Usage
export function useApiUsage(userId: string | null, keyId?: string, days = 7) {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [stats, setStats] = useState<UsageStats>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    avgResponseTime: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    if (!userId && !keyId) return;
    
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ action: 'usage', days: days.toString() });
      if (keyId) params.set('keyId', keyId);
      if (userId) params.set('userId', userId);

      const res = await fetch(`/api/developer?${params}`);
      const data = await res.json();
      
      setLogs(data.logs || []);
      setStats(data.stats || {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0
      });
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, keyId, days]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return { logs, stats, isLoading, refresh: fetchUsage };
}

// Hook for API Documentation
export function useApiDocs(category?: string) {
  const [docs, setDocs] = useState<any[]>([]);
  const [grouped, setGrouped] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ action: 'docs' });
      if (category) params.set('category', category);

      const res = await fetch(`/api/developer?${params}`);
      const data = await res.json();
      
      setDocs(data.docs || []);
      setGrouped(data.grouped || {});
    } catch (err) {
      console.error('Failed to fetch docs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  return { docs, grouped, isLoading };
}

// Hook for single doc
export function useApiDoc(slug: string) {
  const [doc, setDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchDoc = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/developer?action=docs&slug=${slug}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);
        setDoc(data.doc);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setDoc(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoc();
  }, [slug]);

  return { doc, isLoading, error };
}

// Hook for available webhook events
export function useWebhookEvents() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/developer?action=events');
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, isLoading };
}

// Available scopes for reference
export const API_SCOPES = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  ADMIN: 'admin',
  WEBHOOKS: 'webhooks',
  ANALYTICS: 'analytics'
} as const;

// Rate limit tiers
export const RATE_LIMITS = {
  development: {
    perMinute: 60,
    perHour: 1000,
    perDay: 10000
  },
  staging: {
    perMinute: 120,
    perHour: 3000,
    perDay: 30000
  },
  production: {
    perMinute: 300,
    perHour: 5000,
    perDay: 50000
  }
} as const;

export default useApiKeys;
