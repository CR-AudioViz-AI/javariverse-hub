-- CR AudioViz AI - Collector Tables Migration
-- January 1, 2026
-- Creates tables for collector apps (Pokemon TCG, MTG, Vinyl, Comics)

-- ==============================================================================
-- COLLECTOR SETS TABLE (Universal for all collector types)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS collector_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    series TEXT,
    release_date DATE,
    total_cards INTEGER,
    image_url TEXT,
    symbol_url TEXT,
    source TEXT NOT NULL, -- 'pokemontcg', 'scryfall', 'discogs', 'comicvine'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- COLLECTOR ITEMS TABLE (Cards, Records, Comics)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS collector_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,
    set_id UUID REFERENCES collector_sets(id),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    thumbnail_url TEXT,
    rarity TEXT,
    item_type TEXT, -- 'card', 'record', 'comic', etc.
    source TEXT NOT NULL,
    price_market DECIMAL(10,2),
    price_low DECIMAL(10,2),
    price_high DECIMAL(10,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- USER COLLECTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS collector_user_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES collector_items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    condition TEXT, -- 'mint', 'near-mint', 'excellent', 'good', 'fair', 'poor'
    purchase_price DECIMAL(10,2),
    purchase_date DATE,
    notes TEXT,
    is_for_trade BOOLEAN DEFAULT FALSE,
    is_for_sale BOOLEAN DEFAULT FALSE,
    asking_price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- ==============================================================================
-- WISHLISTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS collector_wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES collector_items(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 5, -- 1-10, 10 being highest
    max_price DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- ==============================================================================
-- VINYL-SPECIFIC: Artists and Labels
-- ==============================================================================
CREATE TABLE IF NOT EXISTS vinyl_artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    real_name TEXT,
    profile TEXT,
    image_url TEXT,
    discogs_uri TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vinyl_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    profile TEXT,
    contact_info TEXT,
    image_url TEXT,
    parent_label_id UUID REFERENCES vinyl_labels(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vinyl_genres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- COMICS-SPECIFIC: Publishers and Characters
-- ==============================================================================
CREATE TABLE IF NOT EXISTS comic_publishers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    founded_year INTEGER,
    location TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comic_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    real_name TEXT,
    description TEXT,
    image_url TEXT,
    publisher_id UUID REFERENCES comic_publishers(id),
    first_appearance_date DATE,
    aliases TEXT[],
    powers TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_collector_sets_source ON collector_sets(source);
CREATE INDEX IF NOT EXISTS idx_collector_sets_name ON collector_sets(name);
CREATE INDEX IF NOT EXISTS idx_collector_items_source ON collector_items(source);
CREATE INDEX IF NOT EXISTS idx_collector_items_set_id ON collector_items(set_id);
CREATE INDEX IF NOT EXISTS idx_collector_items_name ON collector_items(name);
CREATE INDEX IF NOT EXISTS idx_collector_items_item_type ON collector_items(item_type);
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON collector_user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_item_id ON collector_user_collections(item_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON collector_wishlists(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY
-- ==============================================================================
ALTER TABLE collector_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE collector_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE collector_user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collector_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE vinyl_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE vinyl_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE vinyl_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE comic_publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE comic_characters ENABLE ROW LEVEL SECURITY;

-- Public read access for reference data
CREATE POLICY "Public read access for collector_sets" ON collector_sets FOR SELECT USING (true);
CREATE POLICY "Public read access for collector_items" ON collector_items FOR SELECT USING (true);
CREATE POLICY "Public read access for vinyl_artists" ON vinyl_artists FOR SELECT USING (true);
CREATE POLICY "Public read access for vinyl_labels" ON vinyl_labels FOR SELECT USING (true);
CREATE POLICY "Public read access for vinyl_genres" ON vinyl_genres FOR SELECT USING (true);
CREATE POLICY "Public read access for comic_publishers" ON comic_publishers FOR SELECT USING (true);
CREATE POLICY "Public read access for comic_characters" ON comic_characters FOR SELECT USING (true);

-- User-specific access for collections and wishlists
CREATE POLICY "Users can manage their collections" ON collector_user_collections 
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their wishlists" ON collector_wishlists 
    FOR ALL USING (auth.uid() = user_id);

-- Service role can insert reference data
CREATE POLICY "Service role can insert sets" ON collector_sets 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert items" ON collector_items 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert artists" ON vinyl_artists 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert labels" ON vinyl_labels 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert genres" ON vinyl_genres 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert publishers" ON comic_publishers 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert characters" ON comic_characters 
    FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- UPDATED_AT TRIGGERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

CREATE TRIGGER update_collector_sets_updated_at
    BEFORE UPDATE ON collector_sets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collector_items_updated_at
    BEFORE UPDATE ON collector_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_collections_updated_at
    BEFORE UPDATE ON collector_user_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- MIGRATION COMPLETE
-- ==============================================================================
