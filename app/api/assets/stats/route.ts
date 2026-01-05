// GET /api/assets/stats - Get asset statistics
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
  }

  try {
    // Get total count
    const { count: total, error: countError } = await supabase
      .from('universal_assets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (countError) {
      console.error('Count error:', countError);
    }

    // Get counts by type - using a simpler approach
    const { data: allAssets, error: typeError } = await supabase
      .from('universal_assets')
      .select('asset_type, category')
      .eq('status', 'active');

    // Aggregate locally
    const typeCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    
    if (allAssets) {
      for (const asset of allAssets) {
        typeCounts[asset.asset_type] = (typeCounts[asset.asset_type] || 0) + 1;
        categoryCounts[asset.category] = (categoryCounts[asset.category] || 0) + 1;
      }
    }

    const byType = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const byCategory = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Get sources
    const { data: sources } = await supabase
      .from('asset_sources_unified')
      .select('source_code, source_name, total_harvested, status')
      .order('total_harvested', { ascending: false });

    return NextResponse.json({
      success: true,
      stats: {
        total: total || allAssets?.length || 0,
        byType,
        byCategory,
        sources: sources || [],
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
