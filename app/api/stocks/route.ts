/**
 * CR AudioViz AI - Central Stocks/Market Data API
 * Stock quotes, market data, portfolio tracking
 * 
 * @author CR AudioViz AI, LLC
 * @created December 31, 2025
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// External API keys (should be in env vars)
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // quote, portfolio, watchlist, news, screener
    const symbol = searchParams.get('symbol');
    const user_id = searchParams.get('user_id');
    const symbols = searchParams.get('symbols'); // comma-separated

    switch (type) {
      case 'quote':
        if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 });
        // Try to get from cache first
        const { data: cached } = await supabase
          .from('stock_quotes')
          .select('*')
          .eq('symbol', symbol.toUpperCase())
          .gte('updated_at', new Date(Date.now() - 60000).toISOString()) // 1 min cache
          .single();

        if (cached) return NextResponse.json({ quote: cached });

        // Fetch from external API (Alpha Vantage example)
        try {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
          );
          const data = await response.json();
          const quote = data['Global Quote'];
          
          if (quote) {
            const quoteData = {
              symbol: symbol.toUpperCase(),
              price: parseFloat(quote['05. price']),
              change: parseFloat(quote['09. change']),
              change_percent: parseFloat(quote['10. change percent']?.replace('%', '')),
              volume: parseInt(quote['06. volume']),
              updated_at: new Date().toISOString()
            };
            
            // Cache it
            await supabase.from('stock_quotes').upsert(quoteData, { onConflict: 'symbol' });
            return NextResponse.json({ quote: quoteData });
          }
        } catch (e) {
          console.error('Quote fetch error:', e);
        }
        return NextResponse.json({ error: 'Quote not available' }, { status: 404 });

      case 'portfolio':
        if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });
        const { data: positions } = await supabase
          .from('portfolio_positions')
          .select('*, stock_quotes(*)')
          .eq('user_id', user_id);
        return NextResponse.json({ portfolio: positions || [] });

      case 'watchlist':
        if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });
        const { data: watchlist } = await supabase
          .from('watchlists')
          .select('symbol, stock_quotes(*)')
          .eq('user_id', user_id);
        return NextResponse.json({ watchlist: watchlist || [] });

      case 'news':
        const { data: news } = await supabase
          .from('market_news')
          .select('*')
          .eq(symbol ? 'symbol' : 'id', symbol?.toUpperCase() || 'id')
          .order('published_at', { ascending: false })
          .limit(20);
        return NextResponse.json({ news: news || [] });

      case 'screener':
        // Basic stock screener
        const min_price = searchParams.get('min_price');
        const max_price = searchParams.get('max_price');
        const sector = searchParams.get('sector');
        
        let query = supabase.from('stock_quotes').select('*');
        if (min_price) query = query.gte('price', min_price);
        if (max_price) query = query.lte('price', max_price);
        if (sector) query = query.eq('sector', sector);
        
        const { data: screened } = await query.order('volume', { ascending: false }).limit(50);
        return NextResponse.json({ results: screened || [] });

      default:
        return NextResponse.json({
          types: ['quote', 'portfolio', 'watchlist', 'news', 'screener'],
          message: 'Specify type parameter'
        });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, user_id, symbol, ...data } = body;

    if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

    switch (type) {
      case 'watchlist_add':
        if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 });
        const { error: watchError } = await supabase
          .from('watchlists')
          .upsert({ user_id, symbol: symbol.toUpperCase(), created_at: new Date().toISOString() });
        if (watchError) return NextResponse.json({ error: watchError.message }, { status: 500 });
        return NextResponse.json({ success: true });

      case 'position':
        const { data: position, error: posError } = await supabase
          .from('portfolio_positions')
          .insert({
            user_id,
            symbol: symbol.toUpperCase(),
            shares: data.shares,
            avg_cost: data.avg_cost,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        if (posError) return NextResponse.json({ error: posError.message }, { status: 500 });
        return NextResponse.json({ success: true, position });

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const user_id = searchParams.get('user_id');
    const symbol = searchParams.get('symbol');

    if (!user_id || !symbol) return NextResponse.json({ error: 'user_id and symbol required' }, { status: 400 });

    if (type === 'watchlist') {
      await supabase.from('watchlists').delete().eq('user_id', user_id).eq('symbol', symbol.toUpperCase());
    } else if (type === 'position') {
      await supabase.from('portfolio_positions').delete().eq('user_id', user_id).eq('symbol', symbol.toUpperCase());
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
