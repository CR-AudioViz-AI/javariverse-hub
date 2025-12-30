// /api/marketplace/vendors/route.ts
// Marketplace Vendor Management API - CR AudioViz AI
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// GET: List vendors or get single vendor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('id');
    const slug = searchParams.get('slug');
    const userId = searchParams.get('userId');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get single vendor
    if (vendorId || slug) {
      const { data, error } = await supabase
        .from('marketplace_vendors')
        .select('*')
        .eq(vendorId ? 'id' : 'store_slug', vendorId || slug)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
      }

      return NextResponse.json({ vendor: data });
    }

    // Get vendor by user ID (for dashboard)
    if (userId) {
      const { data, error } = await supabase
        .from('marketplace_vendors')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ vendor: data || null });
    }

    // List vendors
    let query = supabase
      .from('marketplace_vendors')
      .select('*')
      .eq('verification_status', 'verified')
      .eq('is_active', true)
      .order('total_sales', { ascending: false })
      .limit(limit);

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ vendors: data || [] });

  } catch (error) {
    console.error('Vendor API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create vendor profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      storeName, 
      description, 
      businessType,
      contactEmail,
      payoutMethod,
      paypalEmail 
    } = body;

    if (!userId || !storeName) {
      return NextResponse.json(
        { error: 'userId and storeName required' }, 
        { status: 400 }
      );
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Check if user already has a vendor profile
    const { data: existing } = await supabase
      .from('marketplace_vendors')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'User already has a vendor profile' }, 
        { status: 409 }
      );
    }

    // Generate unique slug
    const baseSlug = storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const { data: slugCheck } = await supabase
        .from('marketplace_vendors')
        .select('id')
        .eq('store_slug', slug)
        .single();
      
      if (!slugCheck) break;
      slug = `${baseSlug}-${counter++}`;
    }

    // Create vendor profile
    const { data: vendor, error } = await supabase
      .from('marketplace_vendors')
      .insert({
        user_id: userId,
        store_name: storeName,
        store_slug: slug,
        description: description || '',
        business_type: businessType || 'individual',
        contact_email: contactEmail,
        payout_method: payoutMethod || 'paypal',
        paypal_email: paypalEmail,
        verification_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Vendor creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      vendor,
      message: 'Vendor profile created! Pending verification.'
    });

  } catch (error) {
    console.error('Vendor API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update vendor profile
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId, userId, ...updates } = body;

    if (!vendorId && !userId) {
      return NextResponse.json(
        { error: 'vendorId or userId required' }, 
        { status: 400 }
      );
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Allowed fields for update
    const allowedFields = [
      'store_name', 'description', 'logo_url', 'banner_url',
      'contact_email', 'contact_phone', 'website_url',
      'business_type', 'business_name',
      'payout_method', 'paypal_email', 'payout_threshold_cents'
    ];

    const sanitizedUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedFields.includes(snakeKey)) {
        sanitizedUpdates[snakeKey] = value;
      }
    }

    sanitizedUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('marketplace_vendors')
      .update(sanitizedUpdates)
      .eq(vendorId ? 'id' : 'user_id', vendorId || userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, vendor: data });

  } catch (error) {
    console.error('Vendor API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
