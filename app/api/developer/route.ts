// /api/developer/route.ts
// Developer Platform API - CR AudioViz AI
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Generate secure API key
function generateApiKey(environment: string): { key: string; prefix: string; hash: string } {
  const envPrefix = environment === 'production' ? 'prod' : environment === 'staging' ? 'stg' : 'dev';
  const randomPart = crypto.randomBytes(24).toString('base64url');
  const key = `crav_${envPrefix}_${randomPart}`;
  const prefix = key.substring(0, 16);
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  return { key, prefix, hash };
}

// GET: Fetch developer resources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    switch (action) {
      // ==================== API KEYS ====================
      case 'keys': {
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        const { data, error } = await supabase
          .from('developer_api_keys')
          .select('id, name, description, key_prefix, scopes, environment, rate_limit_per_minute, rate_limit_per_day, total_requests, last_used_at, is_active, expires_at, created_at')
          .eq('user_id', userId)
          .is('revoked_at', null)
          .order('created_at', { ascending: false });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ keys: data || [] });
      }

      // ==================== WEBHOOKS ====================
      case 'webhooks': {
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        if (id) {
          const { data, error } = await supabase
            .from('webhooks')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

          if (error) {
            return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
          }

          // Get recent deliveries
          const { data: deliveries } = await supabase
            .from('webhook_deliveries')
            .select('*')
            .eq('webhook_id', id)
            .order('created_at', { ascending: false })
            .limit(20);

          return NextResponse.json({ webhook: data, deliveries: deliveries || [] });
        }

        const { data, error } = await supabase
          .from('webhooks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ webhooks: data || [] });
      }

      // ==================== USAGE LOGS ====================
      case 'usage': {
        const keyId = searchParams.get('keyId');
        const days = parseInt(searchParams.get('days') || '7');
        const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);

        if (!keyId && !userId) {
          return NextResponse.json({ error: 'keyId or userId required' }, { status: 400 });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        let query = supabase
          .from('api_usage_logs')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })
          .limit(limit);

        if (keyId) {
          query = query.eq('api_key_id', keyId);
        }

        const { data, error } = await query;

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Aggregate stats
        const stats = {
          totalRequests: data?.length || 0,
          successfulRequests: data?.filter(r => r.status_code < 400).length || 0,
          failedRequests: data?.filter(r => r.status_code >= 400).length || 0,
          avgResponseTime: data?.length 
            ? Math.round(data.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / data.length)
            : 0
        };

        return NextResponse.json({ logs: data || [], stats });
      }

      // ==================== DOCUMENTATION ====================
      case 'docs': {
        const slug = searchParams.get('slug');
        const category = searchParams.get('category');

        if (slug) {
          const { data, error } = await supabase
            .from('api_documentation')
            .select('*')
            .eq('slug', slug)
            .single();

          if (error) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
          }

          return NextResponse.json({ doc: data });
        }

        let query = supabase
          .from('api_documentation')
          .select('id, title, slug, category, subcategory, sort_order')
          .eq('status', 'published')
          .order('sort_order', { ascending: true });

        if (category) {
          query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Group by category
        const grouped: Record<string, any[]> = {};
        data?.forEach(doc => {
          if (!grouped[doc.category]) grouped[doc.category] = [];
          grouped[doc.category].push(doc);
        });

        return NextResponse.json({ docs: data, grouped });
      }

      // ==================== AVAILABLE EVENTS ====================
      case 'events': {
        const events = [
          { name: 'order.created', description: 'New order placed' },
          { name: 'order.updated', description: 'Order status changed' },
          { name: 'order.completed', description: 'Order fulfilled' },
          { name: 'order.cancelled', description: 'Order cancelled' },
          { name: 'payment.succeeded', description: 'Payment processed successfully' },
          { name: 'payment.failed', description: 'Payment failed' },
          { name: 'payment.refunded', description: 'Payment refunded' },
          { name: 'product.created', description: 'New product listed' },
          { name: 'product.updated', description: 'Product updated' },
          { name: 'product.deleted', description: 'Product removed' },
          { name: 'user.created', description: 'New user registered' },
          { name: 'user.updated', description: 'User profile updated' },
          { name: 'credit.added', description: 'Credits added to account' },
          { name: 'credit.deducted', description: 'Credits used' },
          { name: 'moderation.flagged', description: 'Content flagged for review' },
          { name: 'moderation.resolved', description: 'Moderation issue resolved' }
        ];

        return NextResponse.json({ events });
      }

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: keys, webhooks, usage, docs, events' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Developer API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create developer resources
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, ...data } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    switch (action) {
      // ==================== CREATE API KEY ====================
      case 'create-key': {
        const { name, description, scopes, environment = 'development' } = data;

        if (!name) {
          return NextResponse.json({ error: 'name required' }, { status: 400 });
        }

        // Check key limit (max 10 per user)
        const { count } = await supabase
          .from('developer_api_keys')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .is('revoked_at', null);

        if ((count || 0) >= 10) {
          return NextResponse.json({ error: 'Maximum 10 API keys allowed' }, { status: 400 });
        }

        // Generate key
        const { key, prefix, hash } = generateApiKey(environment);

        const { data: created, error } = await supabase
          .from('developer_api_keys')
          .insert({
            user_id: userId,
            name,
            description,
            key_prefix: prefix,
            key_hash: hash,
            scopes: scopes || ['read'],
            environment,
            rate_limit_per_minute: environment === 'production' ? 300 : 60,
            rate_limit_per_hour: environment === 'production' ? 5000 : 1000,
            rate_limit_per_day: environment === 'production' ? 50000 : 10000
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Return full key only once (won't be retrievable again)
        return NextResponse.json({
          success: true,
          key: {
            ...created,
            secret: key // Only returned on creation!
          },
          message: 'Save this key securely - it won\'t be shown again!'
        });
      }

      // ==================== CREATE WEBHOOK ====================
      case 'create-webhook': {
        const { name, url, events } = data;

        if (!name || !url || !events?.length) {
          return NextResponse.json({ error: 'name, url, and events required' }, { status: 400 });
        }

        // Validate URL
        try {
          new URL(url);
        } catch {
          return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }

        // Generate secret
        const secret = `whsec_${crypto.randomBytes(32).toString('base64url')}`;

        const { data: created, error } = await supabase
          .from('webhooks')
          .insert({
            user_id: userId,
            name,
            url,
            events,
            secret,
            is_active: true
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          webhook: {
            ...created,
            secret // Only shown on creation
          },
          message: 'Save the secret - use it to verify webhook signatures'
        });
      }

      // ==================== TEST WEBHOOK ====================
      case 'test-webhook': {
        const { webhookId } = data;

        if (!webhookId) {
          return NextResponse.json({ error: 'webhookId required' }, { status: 400 });
        }

        // Get webhook
        const { data: webhook, error } = await supabase
          .from('webhooks')
          .select('*')
          .eq('id', webhookId)
          .eq('user_id', userId)
          .single();

        if (error || !webhook) {
          return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
        }

        // Create test payload
        const testPayload = {
          id: `evt_test_${Date.now()}`,
          type: 'test.webhook',
          created: new Date().toISOString(),
          data: {
            message: 'This is a test webhook from CR AudioViz AI'
          }
        };

        // Generate signature
        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(testPayload))
          .digest('hex');

        // Attempt delivery
        const startTime = Date.now();
        let deliveryStatus = 'success';
        let responseStatus = 0;
        let responseBody = '';
        let errorMessage = null;

        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': `sha256=${signature}`,
              'X-Webhook-ID': testPayload.id,
              'User-Agent': 'CR-AudioViz-Webhooks/1.0',
              ...(webhook.custom_headers || {})
            },
            body: JSON.stringify(testPayload)
          });

          responseStatus = response.status;
          responseBody = await response.text().catch(() => '');

          if (!response.ok) {
            deliveryStatus = 'failed';
            errorMessage = `HTTP ${responseStatus}`;
          }
        } catch (err: any) {
          deliveryStatus = 'failed';
          errorMessage = err.message;
        }

        const responseTime = Date.now() - startTime;

        // Log delivery
        await supabase.from('webhook_deliveries').insert({
          webhook_id: webhookId,
          event_type: 'test.webhook',
          event_id: testPayload.id,
          payload: testPayload,
          request_url: webhook.url,
          response_status: responseStatus,
          response_body: responseBody.substring(0, 1000),
          response_time_ms: responseTime,
          status: deliveryStatus,
          error_message: errorMessage,
          delivered_at: new Date().toISOString()
        });

        return NextResponse.json({
          success: deliveryStatus === 'success',
          status: deliveryStatus,
          responseStatus,
          responseTime,
          error: errorMessage
        });
      }

      // ==================== LOG API USAGE ====================
      case 'log-usage': {
        const {
          apiKeyId,
          method,
          endpoint,
          statusCode,
          responseTime,
          responseSize,
          errorCode,
          errorMessage,
          ipAddress,
          userAgent
        } = data;

        if (!method || !endpoint || !statusCode) {
          return NextResponse.json({ error: 'method, endpoint, statusCode required' }, { status: 400 });
        }

        // Get key prefix
        let keyPrefix = null;
        if (apiKeyId) {
          const { data: key } = await supabase
            .from('developer_api_keys')
            .select('key_prefix')
            .eq('id', apiKeyId)
            .single();
          keyPrefix = key?.key_prefix;

          // Update key stats
          await supabase
            .from('developer_api_keys')
            .update({
              total_requests: supabase.rpc('increment', { x: 1 }),
              last_used_at: new Date().toISOString(),
              last_used_ip: ipAddress
            })
            .eq('id', apiKeyId);
        }

        const { error } = await supabase
          .from('api_usage_logs')
          .insert({
            api_key_id: apiKeyId,
            api_key_prefix: keyPrefix,
            method,
            endpoint,
            status_code: statusCode,
            response_time_ms: responseTime,
            response_size_bytes: responseSize,
            error_code: errorCode,
            error_message: errorMessage,
            ip_address: ipAddress,
            user_agent: userAgent
          });

        if (error) {
          console.error('Usage log error:', error);
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: create-key, create-webhook, test-webhook, log-usage' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Developer API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update developer resources
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, id, ...updates } = body;

    if (!userId || !id) {
      return NextResponse.json({ error: 'userId and id required' }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    switch (action) {
      case 'update-key': {
        const allowedUpdates = ['name', 'description', 'scopes', 'is_active'];
        const filtered: Record<string, any> = {};
        
        for (const key of allowedUpdates) {
          if (updates[key] !== undefined) {
            filtered[key] = updates[key];
          }
        }

        const { data, error } = await supabase
          .from('developer_api_keys')
          .update(filtered)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, key: data });
      }

      case 'update-webhook': {
        const allowedUpdates = ['name', 'url', 'events', 'is_active', 'custom_headers'];
        const filtered: Record<string, any> = { updated_at: new Date().toISOString() };
        
        for (const key of allowedUpdates) {
          if (updates[key] !== undefined) {
            filtered[key] = updates[key];
          }
        }

        const { data, error } = await supabase
          .from('webhooks')
          .update(filtered)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, webhook: data });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Developer API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Revoke/delete developer resources
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');

    if (!userId || !id) {
      return NextResponse.json({ error: 'userId and id required' }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    switch (action) {
      case 'revoke-key': {
        // Soft delete - revoke the key
        const { error } = await supabase
          .from('developer_api_keys')
          .update({
            is_active: false,
            revoked_at: new Date().toISOString(),
            revoked_by: userId
          })
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'API key revoked' });
      }

      case 'delete-webhook': {
        const { error } = await supabase
          .from('webhooks')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Webhook deleted' });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Developer API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
