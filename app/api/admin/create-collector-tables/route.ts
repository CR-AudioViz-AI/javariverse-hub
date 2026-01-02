/**
 * CR AudioViz AI - Create Collector Tables API
 * ============================================
 * 
 * Creates collector tables using Supabase's built-in capabilities
 * Uses insert with upsert pattern to create tables if they don't exist
 * 
 * @version 1.0.0
 * @date January 1, 2026
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Sample data structures for each collector type
const POKEMON_SAMPLE = {
  external_id: 'sample-pokemon-set',
  name: 'Sample Pokemon Set',
  series: 'Sample Series',
  release_date: '2024-01-01',
  total_cards: 100,
  image_url: 'https://images.pokemontcg.io/base1/logo.png',
  source: 'pokemontcg',
  metadata: {}
}

const MTG_SAMPLE = {
  external_id: 'sample-mtg-set',
  name: 'Sample MTG Set',
  series: 'Sample Series',
  release_date: '2024-01-01',
  total_cards: 250,
  image_url: 'https://api.scryfall.com/images/placeholder.png',
  source: 'scryfall',
  metadata: {}
}

export async function GET() {
  const results: Record<string, any> = {}
  
  // Check each table
  const tables = ['collector_sets', 'collector_cards', 'collector_vinyl', 'collector_comics', 'user_collections']
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        results[table] = { exists: false, error: error.code, message: error.message }
      } else {
        results[table] = { exists: true, count: count || 0 }
      }
    } catch (e: any) {
      results[table] = { exists: false, error: 'exception', message: e.message }
    }
  }
  
  const allExist = Object.values(results).every((r: any) => r.exists)
  
  return NextResponse.json({
    success: true,
    allTablesExist: allExist,
    tables: results,
    action: allExist ? 'Tables ready for seeding' : 'Run POST to see creation SQL',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  // Return the SQL needed to create all tables
  const sql = `
-- ============================================
-- CR AudioViz AI - Collector Tables
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Collector Sets (Pokemon TCG, MTG sets)
CREATE TABLE IF NOT EXISTS collector_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  series VARCHAR(255),
  release_date DATE,
  total_cards INTEGER,
  image_url TEXT,
  symbol_url TEXT,
  source VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Collector Cards (individual trading cards)
CREATE TABLE IF NOT EXISTS collector_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) UNIQUE NOT NULL,
  set_external_id VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  number VARCHAR(50),
  rarity VARCHAR(100),
  card_type VARCHAR(100),
  image_url TEXT,
  image_url_large TEXT,
  market_price DECIMAL(10,2),
  source VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vinyl Records
CREATE TABLE IF NOT EXISTS collector_vinyl (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  artist VARCHAR(500),
  label VARCHAR(255),
  release_year INTEGER,
  format VARCHAR(100),
  genre VARCHAR(255),
  style VARCHAR(255),
  country VARCHAR(100),
  image_url TEXT,
  thumb_url TEXT,
  lowest_price DECIMAL(10,2),
  num_for_sale INTEGER,
  source VARCHAR(50) DEFAULT 'discogs',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Comics
CREATE TABLE IF NOT EXISTS collector_comics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  issue_number VARCHAR(50),
  volume VARCHAR(100),
  publisher VARCHAR(255),
  cover_date DATE,
  description TEXT,
  image_url TEXT,
  thumb_url TEXT,
  source VARCHAR(50) DEFAULT 'comicvine',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User Collections (links users to their items)
CREATE TABLE IF NOT EXISTS user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_type VARCHAR(50) NOT NULL,
  item_external_id VARCHAR(100) NOT NULL,
  quantity INTEGER DEFAULT 1,
  condition VARCHAR(50),
  purchase_price DECIMAL(10,2),
  purchase_date DATE,
  notes TEXT,
  for_sale BOOLEAN DEFAULT false,
  asking_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_external_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collector_sets_source ON collector_sets(source);
CREATE INDEX IF NOT EXISTS idx_collector_sets_external ON collector_sets(external_id);
CREATE INDEX IF NOT EXISTS idx_collector_cards_set ON collector_cards(set_external_id);
CREATE INDEX IF NOT EXISTS idx_collector_cards_source ON collector_cards(source);
CREATE INDEX IF NOT EXISTS idx_collector_vinyl_artist ON collector_vinyl(artist);
CREATE INDEX IF NOT EXISTS idx_collector_comics_publisher ON collector_comics(publisher);
CREATE INDEX IF NOT EXISTS idx_user_collections_user ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_item ON user_collections(item_type, item_external_id);

-- Enable RLS
ALTER TABLE collector_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE collector_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE collector_vinyl ENABLE ROW LEVEL SECURITY;
ALTER TABLE collector_comics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

-- Public read access for all collector data
CREATE POLICY "Public read collector_sets" ON collector_sets FOR SELECT USING (true);
CREATE POLICY "Public read collector_cards" ON collector_cards FOR SELECT USING (true);
CREATE POLICY "Public read collector_vinyl" ON collector_vinyl FOR SELECT USING (true);
CREATE POLICY "Public read collector_comics" ON collector_comics FOR SELECT USING (true);

-- User can manage own collections
CREATE POLICY "Users manage own collections" ON user_collections
  FOR ALL USING (auth.uid() = user_id);

-- Service role can insert/update collector data
CREATE POLICY "Service insert collector_sets" ON collector_sets FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update collector_sets" ON collector_sets FOR UPDATE USING (true);
CREATE POLICY "Service insert collector_cards" ON collector_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update collector_cards" ON collector_cards FOR UPDATE USING (true);
CREATE POLICY "Service insert collector_vinyl" ON collector_vinyl FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update collector_vinyl" ON collector_vinyl FOR UPDATE USING (true);
CREATE POLICY "Service insert collector_comics" ON collector_comics FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update collector_comics" ON collector_comics FOR UPDATE USING (true);

-- Done!
SELECT 'Collector tables created successfully!' as status;
`

  return NextResponse.json({
    success: true,
    message: 'Copy the SQL below and run it in Supabase SQL Editor',
    instructions: [
      '1. Go to: https://supabase.com/dashboard/project/kteobfyferrukqeolofj/sql',
      '2. Create a new query',
      '3. Paste the SQL below',
      '4. Click "Run"',
      '5. Call /api/admin/seed-collectors to populate with data'
    ],
    sql: sql.trim(),
    timestamp: new Date().toISOString()
  })
}
