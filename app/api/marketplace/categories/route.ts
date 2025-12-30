// /api/marketplace/categories/route.ts
// Marketplace Categories API - CR AudioViz AI
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// GET: List categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');
    const slug = searchParams.get('slug');
    const parentId = searchParams.get('parentId');
    const withCounts = searchParams.get('withCounts') === 'true';

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get single category
    if (categoryId || slug) {
      const { data, error } = await supabase
        .from('marketplace_categories')
        .select('*')
        .eq(categoryId ? 'id' : 'slug', categoryId || slug)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      // Get product count if requested
      if (withCounts) {
        const { count } = await supabase
          .from('marketplace_products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', data.id)
          .eq('status', 'active');

        return NextResponse.json({ 
          category: { ...data, product_count: count || 0 } 
        });
      }

      return NextResponse.json({ category: data });
    }

    // List categories
    let query = supabase
      .from('marketplace_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (parentId === 'null') {
      query = query.is('parent_id', null);
    } else if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get product counts if requested
    if (withCounts && data) {
      const categoryIds = data.map(c => c.id);
      const countsPromises = categoryIds.map(async (id) => {
        const { count } = await supabase
          .from('marketplace_products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', id)
          .eq('status', 'active');
        return { id, count: count || 0 };
      });

      const counts = await Promise.all(countsPromises);
      const countMap = Object.fromEntries(counts.map(c => [c.id, c.count]));

      const categoriesWithCounts = data.map(cat => ({
        ...cat,
        product_count: countMap[cat.id] || 0
      }));

      return NextResponse.json({ categories: categoriesWithCounts });
    }

    return NextResponse.json({ categories: data || [] });

  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create category (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, parentId, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { data, error } = await supabase
      .from('marketplace_categories')
      .insert({
        name,
        slug,
        description,
        icon,
        parent_id: parentId || null,
        sort_order: sortOrder || 0
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json({ error: 'Category slug already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category: data });

  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
