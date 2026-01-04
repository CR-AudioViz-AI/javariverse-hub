-- ================================================================================
-- JAVARI PERSISTENT MEMORY + AUTO-THREAD ROLLOVER
-- Migration: 001_memory_system
-- Timestamp: 2026-01-04
-- ================================================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: javari_conversations
-- Core conversation tracking with rollover support
-- ============================================================================
CREATE TABLE IF NOT EXISTS javari_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    title TEXT DEFAULT 'New Conversation',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'rolled_over')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ,
    
    -- Rollover chain links
    rollover_to_conversation_id UUID REFERENCES javari_conversations(id),
    rollover_from_conversation_id UUID REFERENCES javari_conversations(id),
    
    -- Performance metrics
    message_count INTEGER DEFAULT 0,
    token_estimate INTEGER DEFAULT 0,
    latency_ms_avg INTEGER DEFAULT 0,
    content_size_bytes INTEGER DEFAULT 0,
    
    -- Memory/Capsule state
    last_summary_at TIMESTAMPTZ,
    last_capsule_version INTEGER DEFAULT 0,
    last_capsule_id UUID,
    
    -- Thread tracking
    thread_number INTEGER DEFAULT 1,
    root_conversation_id UUID REFERENCES javari_conversations(id),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON javari_conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON javari_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON javari_conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_root ON javari_conversations(root_conversation_id);

-- ============================================================================
-- TABLE: javari_messages
-- Individual messages within conversations
-- ============================================================================
CREATE TABLE IF NOT EXISTS javari_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES javari_conversations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    user_id UUID,
    
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT NOT NULL,
    content_ref_car_path TEXT,  -- For large content stored in CAR
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Performance tracking
    tokens_estimate INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    
    -- Model info
    model_provider TEXT,
    model_name TEXT,
    
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON javari_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_tenant ON javari_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON javari_messages(created_at);

-- ============================================================================
-- TABLE: javari_memory_items
-- Long-term memory storage (facts, preferences, constraints)
-- ============================================================================
CREATE TABLE IF NOT EXISTS javari_memory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    
    scope TEXT NOT NULL DEFAULT 'user' CHECK (scope IN ('user', 'tenant', 'global')),
    category TEXT NOT NULL CHECK (category IN ('profile', 'preference', 'project', 'policy', 'task', 'fact', 'constraint', 'goal', 'context')),
    
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    
    importance INTEGER DEFAULT 5 CHECK (importance >= 0 AND importance <= 10),
    source TEXT NOT NULL DEFAULT 'assistant' CHECK (source IN ('user', 'assistant', 'system', 'import')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    is_sensitive BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    version INTEGER DEFAULT 1,
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', key || ' ' || value)) STORED,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Unique constraint per scope
    UNIQUE(tenant_id, user_id, scope, category, key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_memory_tenant ON javari_memory_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_memory_user ON javari_memory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_scope ON javari_memory_items(scope);
CREATE INDEX IF NOT EXISTS idx_memory_category ON javari_memory_items(category);
CREATE INDEX IF NOT EXISTS idx_memory_pinned ON javari_memory_items(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_memory_search ON javari_memory_items USING GIN(search_vector);

-- ============================================================================
-- TABLE: javari_memory_capsules
-- Compressed conversation summaries for efficient retrieval
-- ============================================================================
CREATE TABLE IF NOT EXISTS javari_memory_capsules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    conversation_id UUID REFERENCES javari_conversations(id),
    
    capsule_text TEXT NOT NULL,
    capsule_hash TEXT NOT NULL,  -- For dedup
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    generated_by TEXT NOT NULL DEFAULT 'assistant' CHECK (generated_by IN ('assistant', 'system')),
    
    token_count INTEGER DEFAULT 0,
    car_path TEXT,  -- If stored in CAR
    
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT TRUE,
    
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_capsules_conversation ON javari_memory_capsules(conversation_id);
CREATE INDEX IF NOT EXISTS idx_capsules_tenant ON javari_memory_capsules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_capsules_current ON javari_memory_capsules(is_current) WHERE is_current = TRUE;
CREATE INDEX IF NOT EXISTS idx_capsules_hash ON javari_memory_capsules(capsule_hash);

-- ============================================================================
-- TABLE: javari_memory_events (Audit Log)
-- Complete audit trail for memory operations
-- ============================================================================
CREATE TABLE IF NOT EXISTS javari_memory_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    conversation_id UUID,
    
    event_type TEXT NOT NULL CHECK (event_type IN (
        'memory_added', 'memory_updated', 'memory_deleted', 'memory_accessed',
        'capsule_generated', 'capsule_updated',
        'rollover_triggered', 'rollover_completed', 'rollover_linked',
        'conversation_created', 'conversation_archived',
        'state_snapshot_created', 'state_snapshot_updated'
    )),
    
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    request_id TEXT,
    ip_address INET,
    user_agent TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_tenant ON javari_memory_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON javari_memory_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON javari_memory_events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_conversation ON javari_memory_events(conversation_id);

-- ============================================================================
-- TABLE: javari_state_snapshots
-- Current state tracking (no drift)
-- ============================================================================
CREATE TABLE IF NOT EXISTS javari_state_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    
    snapshot_type TEXT NOT NULL DEFAULT 'current_state' CHECK (snapshot_type IN ('current_state', 'proof_pack', 'operating_bible')),
    
    content JSONB NOT NULL,
    car_path TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_current BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_snapshots_tenant ON javari_state_snapshots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_type ON javari_state_snapshots(snapshot_type);
CREATE INDEX IF NOT EXISTS idx_snapshots_current ON javari_state_snapshots(is_current) WHERE is_current = TRUE;

-- ============================================================================
-- TABLE: javari_feature_flags
-- Tenant-level feature configuration
-- ============================================================================
CREATE TABLE IF NOT EXISTS javari_feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    flag_name TEXT NOT NULL,
    flag_value BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    UNIQUE(tenant_id, flag_name)
);

-- Insert default flags
INSERT INTO javari_feature_flags (tenant_id, flag_name, flag_value) VALUES
    ('00000000-0000-0000-0000-000000000000', 'MEMORY_ENABLED', TRUE),
    ('00000000-0000-0000-0000-000000000000', 'AUTO_THREAD_ROLLOVER_ENABLED', TRUE),
    ('00000000-0000-0000-0000-000000000000', 'MEMORY_SUMMARIZATION_ENABLED', TRUE),
    ('00000000-0000-0000-0000-000000000000', 'MEMORY_PRIVACY_MODE', FALSE)
ON CONFLICT (tenant_id, flag_name) DO NOTHING;

-- ============================================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE javari_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE javari_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE javari_memory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE javari_memory_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE javari_memory_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE javari_state_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE javari_feature_flags ENABLE ROW LEVEL SECURITY;

-- Service role bypass (for API)
CREATE POLICY "Service role full access conversations" ON javari_conversations FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access messages" ON javari_messages FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access memory" ON javari_memory_items FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access capsules" ON javari_memory_capsules FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access events" ON javari_memory_events FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access snapshots" ON javari_state_snapshots FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access flags" ON javari_feature_flags FOR ALL TO service_role USING (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to estimate tokens (rough approximation)
CREATE OR REPLACE FUNCTION estimate_tokens(text_content TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(LENGTH(text_content) / 4, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update conversation stats after message
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE javari_conversations SET
        message_count = message_count + 1,
        token_estimate = token_estimate + NEW.tokens_estimate,
        last_message_at = NEW.created_at,
        updated_at = NOW(),
        content_size_bytes = content_size_bytes + LENGTH(NEW.content)
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for message stats
DROP TRIGGER IF EXISTS trg_update_conversation_stats ON javari_messages;
CREATE TRIGGER trg_update_conversation_stats
    AFTER INSERT ON javari_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_stats();

-- Function to check rollover conditions
CREATE OR REPLACE FUNCTION should_trigger_rollover(conv_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    conv RECORD;
    recent_latency_avg INTEGER;
BEGIN
    SELECT * INTO conv FROM javari_conversations WHERE id = conv_id;
    
    IF conv IS NULL THEN RETURN FALSE; END IF;
    IF conv.status != 'active' THEN RETURN FALSE; END IF;
    
    -- Check message count threshold (120)
    IF conv.message_count > 120 THEN RETURN TRUE; END IF;
    
    -- Check token threshold (70% of 128k = ~90k)
    IF conv.token_estimate > 90000 THEN RETURN TRUE; END IF;
    
    -- Check content size (250KB)
    IF conv.content_size_bytes > 256000 THEN RETURN TRUE; END IF;
    
    -- Check recent latency (avg of last 10 messages > 2500ms)
    SELECT AVG(latency_ms) INTO recent_latency_avg
    FROM (
        SELECT latency_ms FROM javari_messages 
        WHERE conversation_id = conv_id 
        ORDER BY created_at DESC 
        LIMIT 10
    ) recent;
    
    IF recent_latency_avg > 2500 THEN RETURN TRUE; END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

