// /api/moderation/reports/route.ts
// User Reports API - CR AudioViz AI
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// GET: List reports (admin) or user's own reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');
    const reporterId = searchParams.get('reporterId');
    const reportedUserId = searchParams.get('reportedUserId');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get single report
    if (reportId) {
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      return NextResponse.json({ report: data });
    }

    // Build query
    let query = supabase
      .from('user_reports')
      .select('*', { count: 'exact' });

    if (reporterId) {
      query = query.eq('reporter_id', reporterId);
    }

    if (reportedUserId) {
      query = query.eq('reported_user_id', reportedUserId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      reports: data || [],
      total: count || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Submit a report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reporterId,
      reporterEmail,
      reportedUserId,
      reportedContentType,
      reportedContentId,
      reportedUrl,
      reportType,
      description,
      evidenceUrls
    } = body;

    if (!reportType || !description) {
      return NextResponse.json(
        { error: 'reportType and description required' },
        { status: 400 }
      );
    }

    if (!reportedUserId && !reportedContentId && !reportedUrl) {
      return NextResponse.json(
        { error: 'Must provide reportedUserId, reportedContentId, or reportedUrl' },
        { status: 400 }
      );
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Rate limit: Max 5 reports per hour per user
    if (reporterId) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('user_reports')
        .select('*', { count: 'exact', head: true })
        .eq('reporter_id', reporterId)
        .gte('created_at', oneHourAgo);

      if ((count || 0) >= 5) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    // Create report
    const { data: report, error } = await supabase
      .from('user_reports')
      .insert({
        reporter_id: reporterId,
        reporter_email: reporterEmail,
        reported_user_id: reportedUserId,
        reported_content_type: reportedContentType,
        reported_content_id: reportedContentId,
        reported_url: reportedUrl,
        report_type: reportType,
        description,
        evidence_urls: evidenceUrls || [],
        status: 'submitted'
      })
      .select()
      .single();

    if (error) {
      console.error('Report creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map report type to flag category
    const categoryMap: Record<string, string> = {
      'spam': 'spam',
      'harassment': 'harassment',
      'inappropriate_content': 'adult_content',
      'scam_fraud': 'fraud',
      'impersonation': 'impersonation',
      'copyright': 'copyright',
      'other': 'other'
    };

    // Auto-create moderation queue item
    const { data: queueItem } = await supabase
      .from('moderation_queue')
      .insert({
        content_type: reportedContentType || 'user',
        content_id: reportedContentId || reportedUserId,
        content_table: reportedContentType || 'profiles',
        user_id: reportedUserId,
        reported_by: reporterId,
        flag_source: 'user_report',
        flag_reason: description,
        flag_category: categoryMap[reportType] || 'other',
        severity: 'medium',
        priority: 60, // User reports get moderate priority
        status: 'pending'
      })
      .select()
      .single();

    // Link report to queue item
    if (queueItem) {
      await supabase
        .from('user_reports')
        .update({ moderation_queue_id: queueItem.id })
        .eq('id', report.id);
    }

    return NextResponse.json({
      success: true,
      report,
      message: 'Report submitted. Our team will review it shortly.'
    });

  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update report status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reportId,
      status,
      resolution,
      resolvedBy
    } = body;

    if (!reportId) {
      return NextResponse.json({ error: 'reportId required' }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (status) {
      updates.status = status;
    }

    if (resolution) {
      updates.resolution = resolution;
    }

    if (['resolved', 'dismissed'].includes(status)) {
      updates.resolved_by = resolvedBy;
      updates.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('user_reports')
      .update(updates)
      .eq('id', reportId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, report: data });

  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
