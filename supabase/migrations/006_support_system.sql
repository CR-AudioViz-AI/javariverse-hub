-- Support & Success System Database Schema
-- CR AudioViz AI - Phase 0 Layer 0.11
-- Tickets, Enhancement Requests, Knowledge Base, Escalation
-- Run in Supabase SQL Editor

-- ============================================================================
-- SUPPORT TICKETS
-- ============================================================================

-- Ticket categories
CREATE TABLE IF NOT EXISTS support_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Emoji or icon name
  
  -- Routing
  default_priority TEXT DEFAULT 'medium',
  default_assignee_role TEXT, -- Role to auto-assign
  sla_hours INTEGER DEFAULT 24, -- Response SLA
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL, -- Human-readable: TKT-00001
  
  -- Requester
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  
  -- Ticket Details
  category_id UUID REFERENCES support_categories(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Classification
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  ticket_type TEXT NOT NULL DEFAULT 'support' CHECK (ticket_type IN ('support', 'bug', 'billing', 'account', 'other')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open',
    'in_progress', 
    'waiting_on_customer',
    'waiting_on_internal',
    'escalated',
    'resolved',
    'closed'
  )),
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_team TEXT,
  escalated_to UUID REFERENCES auth.users(id),
  escalation_reason TEXT,
  
  -- SLA Tracking
  sla_due_at TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  sla_breached BOOLEAN DEFAULT false,
  
  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolution_type TEXT, -- 'fixed', 'wont_fix', 'duplicate', 'user_error', 'expected_behavior'
  
  -- Satisfaction
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  satisfaction_feedback TEXT,
  
  -- Metadata
  source TEXT DEFAULT 'web', -- 'web', 'email', 'api', 'chat', 'phone'
  tags TEXT[],
  custom_fields JSONB,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket messages/replies
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  -- Author
  author_id UUID REFERENCES auth.users(id),
  author_type TEXT NOT NULL CHECK (author_type IN ('customer', 'agent', 'system', 'ai')),
  author_name TEXT,
  
  -- Content
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Internal notes not visible to customer
  
  -- Attachments
  attachments JSONB DEFAULT '[]', -- [{name, url, size, type}]
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket activity log
CREATE TABLE IF NOT EXISTS support_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  -- Activity
  action TEXT NOT NULL, -- 'created', 'assigned', 'status_changed', 'priority_changed', 'escalated', 'resolved', 'reopened'
  actor_id UUID REFERENCES auth.users(id),
  actor_type TEXT NOT NULL, -- 'customer', 'agent', 'system', 'automation'
  
  -- Details
  old_value TEXT,
  new_value TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ENHANCEMENT REQUESTS (Feature Requests)
-- ============================================================================

-- Enhancement request statuses
CREATE TYPE enhancement_status AS ENUM (
  'submitted',      -- Just submitted
  'under_review',   -- Being evaluated
  'planned',        -- Accepted, in roadmap
  'in_progress',    -- Being built
  'completed',      -- Shipped
  'declined',       -- Not accepted
  'duplicate'       -- Merged with another
);

-- Enhancement requests
CREATE TABLE IF NOT EXISTS enhancement_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL, -- Human-readable: ENH-00001
  
  -- Requester
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  
  -- Request Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  use_case TEXT, -- Why they need this
  expected_benefit TEXT, -- What they expect to gain
  
  -- Classification
  category TEXT NOT NULL, -- 'feature', 'improvement', 'integration', 'ui_ux', 'performance', 'other'
  module TEXT, -- Which module this affects (e.g., 'javari_ai', 'javari_spirits', etc.)
  
  -- Priority (internal)
  impact_score INTEGER DEFAULT 0, -- 1-10 scale
  effort_score INTEGER DEFAULT 0, -- 1-10 scale (higher = more effort)
  priority_score INTEGER GENERATED ALWAYS AS (impact_score - effort_score) STORED,
  
  -- Status
  status enhancement_status NOT NULL DEFAULT 'submitted',
  
  -- Voting (community prioritization)
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  vote_score INTEGER GENERATED ALWAYS AS (upvote_count - downvote_count) STORED,
  
  -- Internal Tracking
  assigned_to UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Roadmap
  target_release TEXT, -- Version or date
  roadmap_position INTEGER, -- Order in roadmap
  
  -- Resolution
  completed_at TIMESTAMPTZ,
  release_notes TEXT,
  duplicate_of UUID REFERENCES enhancement_requests(id),
  decline_reason TEXT,
  
  -- Metadata
  tags TEXT[],
  attachments JSONB DEFAULT '[]',
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhancement votes
CREATE TABLE IF NOT EXISTS enhancement_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enhancement_id UUID NOT NULL REFERENCES enhancement_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  vote INTEGER NOT NULL CHECK (vote IN (-1, 1)), -- -1 = downvote, 1 = upvote
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(enhancement_id, user_id)
);

-- Enhancement comments
CREATE TABLE IF NOT EXISTS enhancement_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enhancement_id UUID NOT NULL REFERENCES enhancement_requests(id) ON DELETE CASCADE,
  
  -- Author
  user_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  is_official BOOLEAN DEFAULT false, -- Official response from team
  
  -- Content
  comment TEXT NOT NULL,
  
  -- Threading
  parent_id UUID REFERENCES enhancement_comments(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhancement activity log
CREATE TABLE IF NOT EXISTS enhancement_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enhancement_id UUID NOT NULL REFERENCES enhancement_requests(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL, -- 'created', 'status_changed', 'voted', 'commented', 'assigned', 'merged', 'completed'
  actor_id UUID REFERENCES auth.users(id),
  
  old_value TEXT,
  new_value TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- KNOWLEDGE BASE
-- ============================================================================

-- KB collections (top-level groupings)
CREATE TABLE IF NOT EXISTS kb_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  
  -- Visibility
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Organization
  sort_order INTEGER DEFAULT 0,
  parent_id UUID REFERENCES kb_collections(id),
  
  -- Stats
  article_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KB articles
CREATE TABLE IF NOT EXISTS kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Content
  excerpt TEXT, -- Short summary
  content TEXT NOT NULL, -- Markdown content
  
  -- Organization
  collection_id UUID REFERENCES kb_collections(id),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  
  -- Metadata
  author_id UUID REFERENCES auth.users(id),
  tags TEXT[],
  related_articles UUID[], -- Links to related articles
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Search
  search_vector TSVECTOR,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KB article feedback
CREATE TABLE IF NOT EXISTS kb_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  
  helpful BOOLEAN NOT NULL,
  feedback_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FAQ SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  
  -- Organization
  category TEXT,
  collection_id UUID REFERENCES kb_collections(id),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  
  -- Search
  search_vector TSVECTOR,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CANNED RESPONSES (for agents)
-- ============================================================================

CREATE TABLE IF NOT EXISTS canned_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  shortcut TEXT UNIQUE, -- e.g., "/thanks" or "/password-reset"
  
  -- Content
  content TEXT NOT NULL,
  
  -- Organization
  category TEXT,
  tags TEXT[],
  
  -- Usage
  is_active BOOLEAN DEFAULT true,
  use_count INTEGER DEFAULT 0,
  
  -- Ownership
  is_shared BOOLEAN DEFAULT true, -- Available to all agents
  created_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ESCALATION RULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS escalation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Trigger Conditions
  trigger_type TEXT NOT NULL, -- 'sla_breach', 'priority', 'keyword', 'sentiment', 'reopen_count', 'manual'
  trigger_conditions JSONB NOT NULL, -- Specific conditions
  
  -- Actions
  escalate_to_role TEXT, -- Role to escalate to
  escalate_to_user UUID REFERENCES auth.users(id), -- Specific user
  notify_channels TEXT[], -- 'email', 'slack', 'sms'
  auto_priority TEXT, -- Change priority on escalation
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher = checked first
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER SUCCESS TRACKING
-- ============================================================================

-- User health scores
CREATE TABLE IF NOT EXISTS user_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Score Components (0-100 each)
  engagement_score INTEGER DEFAULT 50,
  satisfaction_score INTEGER DEFAULT 50,
  adoption_score INTEGER DEFAULT 50,
  growth_score INTEGER DEFAULT 50,
  
  -- Overall
  health_score INTEGER GENERATED ALWAYS AS (
    (engagement_score + satisfaction_score + adoption_score + growth_score) / 4
  ) STORED,
  
  health_trend TEXT DEFAULT 'stable', -- 'improving', 'stable', 'declining', 'at_risk'
  
  -- Risk Indicators
  churn_risk DECIMAL(4,3), -- 0-1 probability
  expansion_potential DECIMAL(4,3), -- 0-1 probability
  
  -- Last Activity
  last_login_at TIMESTAMPTZ,
  last_feature_used TEXT,
  days_since_login INTEGER,
  
  -- Engagement Metrics
  sessions_last_30_days INTEGER DEFAULT 0,
  features_used_last_30_days INTEGER DEFAULT 0,
  
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Success milestones
CREATE TABLE IF NOT EXISTS success_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Trigger
  trigger_type TEXT NOT NULL, -- 'event', 'count', 'date', 'manual'
  trigger_conditions JSONB NOT NULL,
  
  -- Reward
  credit_reward INTEGER DEFAULT 0,
  badge_id TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User milestone completions
CREATE TABLE IF NOT EXISTS user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES success_milestones(id),
  
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, milestone_id)
);

-- ============================================================================
-- SEQUENCES FOR TICKET NUMBERS
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS enhancement_number_seq START 1;

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || LPAD(nextval('ticket_number_seq')::TEXT, 5, '0');
  NEW.sla_due_at := NOW() + (
    SELECT COALESCE(sla_hours, 24) * INTERVAL '1 hour'
    FROM support_categories
    WHERE id = NEW.category_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- Function to generate enhancement number
CREATE OR REPLACE FUNCTION generate_enhancement_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.request_number := 'ENH-' || LPAD(nextval('enhancement_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_enhancement_number
  BEFORE INSERT ON enhancement_requests
  FOR EACH ROW EXECUTE FUNCTION generate_enhancement_number();

-- ============================================================================
-- VOTE COUNT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_enhancement_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE enhancement_requests SET
      upvote_count = (SELECT COUNT(*) FROM enhancement_votes WHERE enhancement_id = NEW.enhancement_id AND vote = 1),
      downvote_count = (SELECT COUNT(*) FROM enhancement_votes WHERE enhancement_id = NEW.enhancement_id AND vote = -1),
      updated_at = NOW()
    WHERE id = NEW.enhancement_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE enhancement_requests SET
      upvote_count = (SELECT COUNT(*) FROM enhancement_votes WHERE enhancement_id = OLD.enhancement_id AND vote = 1),
      downvote_count = (SELECT COUNT(*) FROM enhancement_votes WHERE enhancement_id = OLD.enhancement_id AND vote = -1),
      updated_at = NOW()
    WHERE id = OLD.enhancement_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enhancement_vote_trigger
  AFTER INSERT OR UPDATE OR DELETE ON enhancement_votes
  FOR EACH ROW EXECUTE FUNCTION update_enhancement_vote_counts();

-- ============================================================================
-- FULL TEXT SEARCH
-- ============================================================================

-- Update search vectors
CREATE OR REPLACE FUNCTION update_kb_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kb_article_search_trigger
  BEFORE INSERT OR UPDATE ON kb_articles
  FOR EACH ROW EXECUTE FUNCTION update_kb_search_vector();

CREATE OR REPLACE FUNCTION update_faq_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.question, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.answer, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER faq_search_trigger
  BEFORE INSERT OR UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_faq_search_vector();

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority) WHERE status NOT IN ('resolved', 'closed');
CREATE INDEX IF NOT EXISTS idx_tickets_sla ON support_tickets(sla_due_at) WHERE sla_breached = false AND status NOT IN ('resolved', 'closed');

CREATE INDEX IF NOT EXISTS idx_enhancements_user ON enhancement_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_enhancements_status ON enhancement_requests(status);
CREATE INDEX IF NOT EXISTS idx_enhancements_votes ON enhancement_requests(vote_score DESC);
CREATE INDEX IF NOT EXISTS idx_enhancements_priority ON enhancement_requests(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_enhancement_votes_user ON enhancement_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_kb_articles_collection ON kb_articles(collection_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_status ON kb_articles(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_kb_articles_search ON kb_articles USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_faqs_search ON faqs USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_user_health_score ON user_health_scores(health_score);
CREATE INDEX IF NOT EXISTS idx_user_health_churn ON user_health_scores(churn_risk DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhancement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhancement_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhancement_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_feedback ENABLE ROW LEVEL SECURITY;

-- Users can see their own tickets
CREATE POLICY "Users view own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can see messages on their tickets (excluding internal)
CREATE POLICY "Users view ticket messages" ON support_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE id = ticket_id AND user_id = auth.uid()
    ) AND is_internal = false
  );

-- Anyone can view published enhancements
CREATE POLICY "Public view enhancements" ON enhancement_requests
  FOR SELECT USING (true);

CREATE POLICY "Users create enhancements" ON enhancement_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can vote once per enhancement
CREATE POLICY "Users vote on enhancements" ON enhancement_votes
  FOR ALL USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service full access tickets" ON support_tickets
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service full access messages" ON support_messages
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service full access enhancements" ON enhancement_requests
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Support categories
INSERT INTO support_categories (name, description, icon, default_priority, sla_hours) VALUES
  ('General Support', 'General questions and assistance', '💬', 'medium', 24),
  ('Technical Issue', 'Bugs, errors, and technical problems', '🔧', 'high', 8),
  ('Billing & Payments', 'Payment issues, refunds, subscriptions', '💳', 'high', 4),
  ('Account & Security', 'Account access, password, security concerns', '🔐', 'critical', 2),
  ('Feature Question', 'How to use features and capabilities', '❓', 'low', 48),
  ('Integration Help', 'API, webhooks, and integration support', '🔌', 'medium', 24),
  ('Feedback', 'General feedback and suggestions', '💡', 'low', 72)
ON CONFLICT (name) DO NOTHING;

-- Default KB collections
INSERT INTO kb_collections (name, slug, description, icon, is_featured) VALUES
  ('Getting Started', 'getting-started', 'New to Javari? Start here!', '🚀', true),
  ('Javari AI Guide', 'javari-ai', 'How to get the most from Javari AI', '🤖', true),
  ('Account & Billing', 'account-billing', 'Managing your account and payments', '👤', false),
  ('API Documentation', 'api-docs', 'Developer documentation and guides', '📚', false),
  ('Troubleshooting', 'troubleshooting', 'Common issues and solutions', '🔍', false),
  ('Best Practices', 'best-practices', 'Tips for getting the best results', '⭐', false)
ON CONFLICT (slug) DO NOTHING;

-- Default escalation rules
INSERT INTO escalation_rules (name, description, trigger_type, trigger_conditions, notify_channels, auto_priority, is_active) VALUES
  ('SLA Breach', 'Escalate when SLA is about to be breached', 'sla_breach', '{"hours_before": 2}', ARRAY['email', 'slack'], 'high', true),
  ('Critical Priority', 'Immediately escalate critical tickets', 'priority', '{"priority": "critical"}', ARRAY['email', 'slack', 'sms'], NULL, true),
  ('Multiple Reopens', 'Escalate tickets reopened 3+ times', 'reopen_count', '{"count": 3}', ARRAY['email'], 'high', true),
  ('Negative Sentiment', 'Escalate angry customer messages', 'sentiment', '{"threshold": -0.7}', ARRAY['slack'], NULL, true)
ON CONFLICT DO NOTHING;

-- Default success milestones
INSERT INTO success_milestones (name, description, trigger_type, trigger_conditions, credit_reward) VALUES
  ('First Login', 'Complete your first login', 'event', '{"event": "first_login"}', 10),
  ('Profile Complete', 'Fill out your profile', 'event', '{"event": "profile_complete"}', 25),
  ('First AI Chat', 'Have your first conversation with Javari', 'event', '{"event": "first_ai_chat"}', 50),
  ('Power User', 'Use 10 different features', 'count', '{"metric": "features_used", "count": 10}', 100),
  ('Feedback Champion', 'Submit 5 enhancement requests', 'count', '{"metric": "enhancement_requests", "count": 5}', 100),
  ('Week Streak', 'Log in 7 days in a row', 'count', '{"metric": "login_streak", "count": 7}', 75)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DONE
-- ============================================================================

COMMENT ON TABLE support_tickets IS 'Customer support tickets with SLA tracking';
COMMENT ON TABLE enhancement_requests IS 'User-submitted feature and enhancement requests with voting';
COMMENT ON TABLE kb_articles IS 'Knowledge base articles with full-text search';
COMMENT ON TABLE user_health_scores IS 'Customer success health scoring';
COMMENT ON TABLE escalation_rules IS 'Automatic ticket escalation rules';
