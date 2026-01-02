-- Email Subscribers Table
-- Timestamp: January 2, 2026 - 6:10 PM EST
-- Tracks email marketing sequences and subscriber journeys

CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  sequence TEXT NOT NULL,
  source TEXT DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'unsubscribed', 'bounced')),
  current_email_index INTEGER DEFAULT 0,
  last_email_sent_at TIMESTAMPTZ,
  next_email_at TIMESTAMPTZ,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(email, sequence)
);

-- Email sends log
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES email_subscribers(id) ON DELETE CASCADE,
  sequence TEXT NOT NULL,
  email_index INTEGER NOT NULL,
  template TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'))
);

-- Lead magnets downloads (for sequence triggers)
CREATE TABLE IF NOT EXISTS lead_magnet_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  asset_id UUID REFERENCES assets(id),
  asset_name TEXT NOT NULL,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_sequence ON email_subscribers(sequence);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON email_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_next_email ON email_subscribers(next_email_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_sends_subscriber ON email_sends(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_downloads_email ON lead_magnet_downloads(email);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_subscribers_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscribers_updated_at ON email_subscribers;
CREATE TRIGGER subscribers_updated_at
  BEFORE UPDATE ON email_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_subscribers_timestamp();

-- RLS
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_magnet_downloads ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role access subscribers" ON email_subscribers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access sends" ON email_sends FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access downloads" ON lead_magnet_downloads FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE email_subscribers IS 'Email marketing subscribers and sequence tracking';
COMMENT ON TABLE email_sends IS 'Log of all emails sent to subscribers';
COMMENT ON TABLE lead_magnet_downloads IS 'Track lead magnet downloads for email capture';
