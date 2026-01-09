import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// GET /api/core/sectors/[sectorId]/data/[dataType]
export async function getSectorData(sectorId: string, dataType: string, query: any) {
  const { data, error } = await supabase
    .from(`sector_${sectorId}_${dataType}`)
    .select('*')
    .match(query || {})
    .limit(100);
  
  if (error) throw error;
  return data;
}

// Mortgage Rate APIs
export async function getMortgageRates() {
  const { data, error } = await supabase
    .from('mortgage_rates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) throw error;
  return data?.[0] || null;
}

export async function getMortgageRateHistory(rateType: string, days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('mortgage_rate_history')
    .select('*')
    .eq('rate_type', rateType)
    .gte('date', startDate.toISOString())
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function setMortgageAlert(userId: string, rateType: string, targetRate: number, direction: string) {
  const { data, error } = await supabase
    .from('mortgage_alerts')
    .insert({
      user_id: userId,
      rate_type: rateType,
      target_rate: targetRate,
      direction,
      active: true,
    })
    .select()
    .single();
  
  if (error) throw error;
  return { alertId: data.id };
}

// Collectors APIs
export async function getCollectorPrices(category: string, items?: string[]) {
  let query = supabase
    .from('collector_prices')
    .select('*')
    .eq('category', category);
  
  if (items && items.length > 0) {
    query = query.in('item_id', items);
  }
  
  const { data, error } = await query.limit(100);
  if (error) throw error;
  return data;
}

export async function getAuctionData(category: string, searchQuery?: string) {
  let query = supabase
    .from('collector_auctions')
    .select('*')
    .eq('category', category)
    .eq('active', true);
  
  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }
  
  const { data, error } = await query.order('end_time', { ascending: true }).limit(50);
  if (error) throw error;
  return data;
}

// Affiliate APIs
export async function getAffiliateLink(productType: string, productId: string, appId: string) {
  const { data, error } = await supabase
    .from('affiliate_links')
    .select('*')
    .eq('product_type', productType)
    .eq('product_id', productId)
    .single();
  
  if (error) throw error;
  
  // Track impression
  await supabase.from('affiliate_impressions').insert({
    affiliate_id: data.id,
    app_id: appId,
    timestamp: new Date().toISOString(),
  });
  
  return {
    url: data.affiliate_url,
    commission: data.commission_rate,
  };
}

export async function trackAffiliateClick(affiliateId: string, appId: string, userId?: string) {
  await supabase.from('affiliate_clicks').insert({
    affiliate_id: affiliateId,
    app_id: appId,
    user_id: userId,
    timestamp: new Date().toISOString(),
  });
}

export async function trackAffiliateConversion(affiliateId: string, appId: string, orderId: string, amount: number) {
  await supabase.from('affiliate_conversions').insert({
    affiliate_id: affiliateId,
    app_id: appId,
    order_id: orderId,
    amount,
    timestamp: new Date().toISOString(),
  });
}

// Scraper APIs
export async function getScraperStatus(scraperId?: string) {
  let query = supabase.from('scraper_status').select('*');
  if (scraperId) {
    query = query.eq('scraper_id', scraperId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function triggerScrape(scraperId: string, target: string, options?: any) {
  const { data, error } = await supabase
    .from('scraper_jobs')
    .insert({
      scraper_id: scraperId,
      target,
      options,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return { jobId: data.id };
}

// Javari Learning APIs
export async function feedJavariData(dataType: string, data: any, source: string) {
  await supabase.from('javari_knowledge').insert({
    data_type: dataType,
    data,
    source,
    created_at: new Date().toISOString(),
  });
}

export async function queryJavariKnowledge(question: string, context?: any) {
  // This would integrate with your AI/embedding system
  const { data, error } = await supabase
    .from('javari_knowledge')
    .select('*')
    .textSearch('data', question)
    .limit(5);
  
  if (error) throw error;
  
  return {
    answer: data?.length ? 'Based on my knowledge...' : 'I don\'t have specific information about that.',
    confidence: data?.length ? 0.8 : 0.3,
    sources: data?.map(d => d.source) || [],
  };
}

// Asset Repository APIs
export async function getAssets(assetType: string, filters?: any) {
  let query = supabase.from(`assets_${assetType}`).select('*');
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && key !== 'limit') {
        query = query.eq(key, value);
      }
    });
  }
  
  const { data, error } = await query.limit(filters?.limit || 50);
  if (error) throw error;
  return data;
}

export async function storeAsset(assetType: string, assetData: any) {
  const { data, error } = await supabase
    .from(`assets_${assetType}`)
    .insert({
      ...assetData,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return { success: true, id: data.id };
}
