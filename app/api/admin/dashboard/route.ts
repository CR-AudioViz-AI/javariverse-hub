import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Admin emails - add more as needed
const ADMIN_EMAILS = [
  'royhenderson@craudiovizai.com',
  'roy@craudiovizai.com',
  'admin@craudiovizai.com',
];

async function verifyAdmin(request: NextRequest): Promise<{ user: any; error?: NextResponse }> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
  }

  if (!ADMIN_EMAILS.includes(user.email || '')) {
    return { user: null, error: NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 }) };
  }

  return { user };
}

// GET /api/admin/dashboard
export async function GET(request: NextRequest) {
  const { user, error } = await verifyAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section') || 'overview';

  try {
    switch (section) {
      case 'overview': {
        const [users, credits, subscriptions, tickets, enhancements, recentTransactions] = await Promise.all([
          supabase.from('craiverse_profiles').select('id', { count: 'exact', head: true }),
          supabase.from('craiverse_credits').select('balance, bonus_balance'),
          supabase.from('craiverse_subscriptions').select('plan, status'),
          supabase.from('craiverse_tickets').select('status'),
          supabase.from('craiverse_enhancements').select('status'),
          supabase.from('craiverse_credit_transactions')
            .select('amount, type')
            .eq('type', 'purchase')
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        ]);

        const totalCredits = credits.data?.reduce((sum, c) => sum + (c.balance || 0) + (c.bonus_balance || 0), 0) || 0;
        const activeSubscriptions = subscriptions.data?.filter(s => s.status === 'active').length || 0;
        const openTickets = tickets.data?.filter(t => ['open', 'in_progress'].includes(t.status)).length || 0;
        const pendingEnhancements = enhancements.data?.filter(e => e.status === 'submitted').length || 0;
        const monthlyRevenue = recentTransactions.data?.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0) || 0;

        return NextResponse.json({
          overview: {
            total_users: users.count || 0,
            total_credits_circulation: totalCredits,
            active_subscriptions: activeSubscriptions,
            open_tickets: openTickets,
            pending_enhancements: pendingEnhancements,
            monthly_credit_purchases: monthlyRevenue,
            estimated_revenue_usd: (monthlyRevenue * 0.01).toFixed(2),
          },
          subscriptions: {
            free: subscriptions.data?.filter(s => s.plan === 'free').length || 0,
            starter: subscriptions.data?.filter(s => s.plan === 'starter').length || 0,
            pro: subscriptions.data?.filter(s => s.plan === 'pro').length || 0,
            enterprise: subscriptions.data?.filter(s => s.plan === 'enterprise').length || 0,
          },
          tickets: {
            open: tickets.data?.filter(t => t.status === 'open').length || 0,
            in_progress: tickets.data?.filter(t => t.status === 'in_progress').length || 0,
            resolved: tickets.data?.filter(t => t.status === 'resolved').length || 0,
            closed: tickets.data?.filter(t => t.status === 'closed').length || 0,
          },
        });
      }

      case 'users': {
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const search = searchParams.get('search');

        let query = supabase
          .from('craiverse_profiles')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (search) {
          query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`);
        }

        const { data: users, count } = await query;
        return NextResponse.json({ users, total: count, limit, offset });
      }

      case 'tickets': {
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50');

        let query = supabase
          .from('craiverse_tickets')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (status) query = query.eq('status', status);

        const { data: tickets } = await query;
        return NextResponse.json({ tickets });
      }

      case 'enhancements': {
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50');

        let query = supabase
          .from('craiverse_enhancements')
          .select('*')
          .order('upvote_count', { ascending: false })
          .limit(limit);

        if (status) query = query.eq('status', status);

        const { data: enhancements } = await query;
        return NextResponse.json({ enhancements });
      }

      case 'transactions': {
        const limit = parseInt(searchParams.get('limit') || '100');
        const type = searchParams.get('type');

        let query = supabase
          .from('craiverse_credit_transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (type) query = query.eq('type', type);

        const { data: transactions } = await query;
        return NextResponse.json({ transactions });
      }

      case 'apps': {
        const { data: apps } = await supabase
          .from('craiverse_apps')
          .select('*')
          .order('sort_order');
        return NextResponse.json({ apps });
      }

      default:
        return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/dashboard - Admin actions
export async function POST(request: NextRequest) {
  const { user, error } = await verifyAdmin(request);
  if (error) return error;

  const body = await request.json();
  const { action, ...params } = body;

  try {
    switch (action) {
      case 'adjust_credits': {
        const { user_id, amount, reason } = params;
        if (!user_id || amount === undefined) {
          return NextResponse.json({ error: 'user_id and amount required' }, { status: 400 });
        }

        const { data: current } = await supabase
          .from('craiverse_credits')
          .select('balance')
          .eq('user_id', user_id)
          .single();

        const newBalance = (current?.balance || 0) + amount;

        await supabase.from('craiverse_credits').upsert({
          user_id,
          balance: newBalance,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        await supabase.from('craiverse_credit_transactions').insert({
          user_id,
          amount,
          balance_after: newBalance,
          type: 'adjustment',
          source_app: 'admin',
          description: reason || `Admin adjustment by ${user.email}`,
        });

        await supabase.from('craiverse_notifications').insert({
          user_id,
          type: 'credits_adjusted',
          title: amount > 0 ? 'Credits Added' : 'Credits Deducted',
          message: `${Math.abs(amount)} credits have been ${amount > 0 ? 'added to' : 'deducted from'} your account.`,
          source_app: 'admin',
        });

        return NextResponse.json({ success: true, new_balance: newBalance });
      }

      case 'update_ticket': {
        const { ticket_id, status, resolution, assigned_to } = params;
        if (!ticket_id) {
          return NextResponse.json({ error: 'ticket_id required' }, { status: 400 });
        }

        const updates: any = { updated_at: new Date().toISOString() };
        if (status) updates.status = status;
        if (resolution) updates.resolution = resolution;
        if (assigned_to) updates.assigned_to = assigned_to;
        if (status === 'resolved') updates.resolved_at = new Date().toISOString();

        await supabase.from('craiverse_tickets').update(updates).eq('id', ticket_id);

        const { data: ticket } = await supabase
          .from('craiverse_tickets')
          .select('user_id, subject')
          .eq('id', ticket_id)
          .single();

        if (ticket?.user_id) {
          await supabase.from('craiverse_notifications').insert({
            user_id: ticket.user_id,
            type: 'ticket_updated',
            title: `Ticket ${status === 'resolved' ? 'Resolved' : 'Updated'}`,
            message: `Your ticket "${ticket.subject}" has been ${status || 'updated'}.`,
            action_url: `/support/tickets/${ticket_id}`,
            source_app: 'craiverse',
          });
        }

        return NextResponse.json({ success: true });
      }

      case 'respond_to_ticket': {
        const { ticket_id, message } = params;
        if (!ticket_id || !message) {
          return NextResponse.json({ error: 'ticket_id and message required' }, { status: 400 });
        }

        await supabase.from('craiverse_ticket_messages').insert({
          ticket_id,
          sender_id: user.id,
          sender_type: 'support',
          message,
        });

        await supabase.from('craiverse_tickets').update({
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        }).eq('id', ticket_id);

        const { data: ticket } = await supabase
          .from('craiverse_tickets')
          .select('user_id, subject')
          .eq('id', ticket_id)
          .single();

        if (ticket?.user_id) {
          await supabase.from('craiverse_notifications').insert({
            user_id: ticket.user_id,
            type: 'ticket_response',
            title: 'New Response to Your Ticket',
            message: `Support has responded to your ticket: "${ticket.subject}"`,
            action_url: `/support/tickets/${ticket_id}`,
            action_label: 'View Response',
            source_app: 'craiverse',
          });
        }

        return NextResponse.json({ success: true });
      }

      case 'update_enhancement': {
        const { enhancement_id, status, official_response, priority } = params;
        if (!enhancement_id) {
          return NextResponse.json({ error: 'enhancement_id required' }, { status: 400 });
        }

        const updates: any = { updated_at: new Date().toISOString() };
        if (status) updates.status = status;
        if (priority) updates.priority = priority;
        if (official_response) {
          updates.official_response = official_response;
          updates.responded_by = user.id;
          updates.responded_at = new Date().toISOString();
        }
        if (status === 'completed') updates.completed_at = new Date().toISOString();

        await supabase.from('craiverse_enhancements').update(updates).eq('id', enhancement_id);

        const { data: enhancement } = await supabase
          .from('craiverse_enhancements')
          .select('author_id, title')
          .eq('id', enhancement_id)
          .single();

        if (enhancement?.author_id) {
          await supabase.from('craiverse_notifications').insert({
            user_id: enhancement.author_id,
            type: 'enhancement_updated',
            title: `Enhancement ${status === 'completed' ? 'Completed!' : 'Updated'}`,
            message: `Your request "${enhancement.title}" is now ${status}.`,
            action_url: `/enhancements/${enhancement_id}`,
            source_app: 'craiverse',
          });
        }

        return NextResponse.json({ success: true });
      }

      case 'post_announcement': {
        const { title, message, target_audience } = params;
        if (!title || !message) {
          return NextResponse.json({ error: 'title and message required' }, { status: 400 });
        }

        // Get all users or filtered by plan
        let usersQuery = supabase.from('craiverse_profiles').select('id');
        
        if (target_audience && target_audience !== 'all') {
          const { data: subs } = await supabase
            .from('craiverse_subscriptions')
            .select('user_id')
            .eq('plan', target_audience);
          
          const userIds = subs?.map(s => s.user_id) || [];
          if (userIds.length > 0) {
            usersQuery = usersQuery.in('id', userIds);
          }
        }

        const { data: users } = await usersQuery;

        // Create notifications for all users
        const notifications = (users || []).map(u => ({
          user_id: u.id,
          type: 'announcement',
          title,
          message,
          source_app: 'craiverse',
        }));

        if (notifications.length > 0) {
          await supabase.from('craiverse_notifications').insert(notifications);
        }

        return NextResponse.json({ success: true, sent_to: notifications.length });
      }

      case 'update_app': {
        const { app_id, ...appUpdates } = params;
        if (!app_id) {
          return NextResponse.json({ error: 'app_id required' }, { status: 400 });
        }

        await supabase.from('craiverse_apps').update({
          ...appUpdates,
          updated_at: new Date().toISOString(),
        }).eq('id', app_id);

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
