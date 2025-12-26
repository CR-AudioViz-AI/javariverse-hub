-- CR AudioViz AI - Centralized Services Database Migration
-- Created: December 25, 2025
-- 
-- This migration adds tables for:
-- 1. Email logs and preferences
-- 2. AI predictions logging
-- 3. Cross-sell analytics

-- ============================================================
-- EMAIL SYSTEM TABLES
-- ============================================================

-- Email logs - track all sent emails
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    app_id TEXT,
    email_type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT,
    success BOOLEAN DEFAULT false,
    message_id TEXT,
    error TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by user and app
CREATE INDEX IF NOT EXISTS idx_email_logs_user ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_app ON email_logs(app_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);

-- Email preferences - user notification settings
CREATE TABLE IF NOT EXISTS email_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) UNIQUE,
    deal_alerts BOOLEAN DEFAULT true,
    price_predictions BOOLEAN DEFAULT true,
    booking_confirmations BOOLEAN DEFAULT true,
    payment_receipts BOOLEAN DEFAULT true,
    newsletters BOOLEAN DEFAULT false,
    system_notifications BOOLEAN DEFAULT true,
    frequency TEXT DEFAULT 'instant', -- instant, daily, weekly
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unsubscribe tokens for email links
CREATE TABLE IF NOT EXISTS email_unsubscribe_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- ============================================================
-- AI PREDICTIONS TABLES
-- ============================================================

-- AI predictions log - track all predictions made
CREATE TABLE IF NOT EXISTS ai_predictions_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    app_id TEXT,
    prediction_type TEXT NOT NULL,
    domain TEXT NOT NULL,
    input_data JSONB,
    result JSONB,
    success BOOLEAN DEFAULT false,
    credits_used INTEGER DEFAULT 0,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying predictions
CREATE INDEX IF NOT EXISTS idx_ai_predictions_user ON ai_predictions_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_app ON ai_predictions_log(app_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_type ON ai_predictions_log(prediction_type);

-- ============================================================
-- CROSS-SELL ANALYTICS TABLES
-- ============================================================

-- Cross-sell events - track impressions and clicks
CREATE TABLE IF NOT EXISTS cross_sell_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- impression, click
    from_app TEXT NOT NULL,
    to_product TEXT,
    products TEXT[], -- for impressions (multiple shown)
    user_id UUID REFERENCES profiles(id),
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_cross_sell_from_app ON cross_sell_events(from_app);
CREATE INDEX IF NOT EXISTS idx_cross_sell_event_type ON cross_sell_events(event_type);
CREATE INDEX IF NOT EXISTS idx_cross_sell_date ON cross_sell_events(created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_sell_events ENABLE ROW LEVEL SECURITY;

-- Policies for email_logs (users can see their own)
CREATE POLICY "Users can view own email logs" ON email_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access email_logs" ON email_logs
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Policies for email_preferences (users can manage their own)
CREATE POLICY "Users can view own preferences" ON email_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON email_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON email_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access email_preferences" ON email_preferences
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Policies for ai_predictions_log
CREATE POLICY "Users can view own predictions" ON ai_predictions_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access predictions" ON ai_predictions_log
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Policies for cross_sell_events (insert only for anon, full for service)
CREATE POLICY "Anyone can insert cross_sell events" ON cross_sell_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role full access cross_sell" ON cross_sell_events
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to generate unsubscribe token
CREATE OR REPLACE FUNCTION generate_unsubscribe_token(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_token TEXT;
BEGIN
    v_token := encode(gen_random_bytes(32), 'hex');
    
    INSERT INTO email_unsubscribe_tokens (user_id, token)
    VALUES (p_user_id, v_token)
    ON CONFLICT (user_id) DO UPDATE
    SET token = v_token, created_at = NOW(), expires_at = NOW() + INTERVAL '30 days';
    
    RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- GRANTS
-- ============================================================

GRANT ALL ON email_logs TO authenticated;
GRANT ALL ON email_logs TO service_role;
GRANT ALL ON email_preferences TO authenticated;
GRANT ALL ON email_preferences TO service_role;
GRANT ALL ON email_unsubscribe_tokens TO service_role;
GRANT ALL ON ai_predictions_log TO authenticated;
GRANT ALL ON ai_predictions_log TO service_role;
GRANT INSERT ON cross_sell_events TO anon;
GRANT INSERT ON cross_sell_events TO authenticated;
GRANT ALL ON cross_sell_events TO service_role;

