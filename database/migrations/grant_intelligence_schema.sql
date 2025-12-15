-- =====================================================
-- CR AUDIOVIZ AI - GRANT MANAGEMENT SYSTEM
-- Complete Database Schema
-- Timestamp: Saturday, December 13, 2025 - 11:45 AM EST
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: grant_opportunities
-- Core grant tracking table
-- =====================================================
CREATE TABLE IF NOT EXISTS grant_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information
  grant_name VARCHAR(500) NOT NULL,
  grant_number VARCHAR(100),
  agency_name VARCHAR(300) NOT NULL,
  program_name VARCHAR(300),
  opportunity_number VARCHAR(100),
  
  -- Financial
  amount_available DECIMAL(15,2),
  amount_requested DECIMAL(15,2),
  amount_awarded DECIMAL(15,2),
  match_required DECIMAL(5,2), -- Percentage match required
  indirect_rate DECIMAL(5,2), -- Allowed indirect cost rate
  
  -- Dates
  application_opens DATE,
  application_deadline DATE,
  review_period_start DATE,
  review_period_end DATE,
  decision_expected DATE,
  project_start_date DATE,
  project_end_date DATE,
  
  -- Status & Pipeline
  status VARCHAR(50) DEFAULT 'researching' CHECK (status IN (
    'researching', 'preparing', 'draft', 'internal_review', 
    'submitted', 'under_review', 'approved', 'rejected', 
    'withdrawn', 'archived'
  )),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  
  -- CRAIverse Integration
  target_modules TEXT[], -- Array of module IDs this grant could fund
  
  -- AI Analysis
  match_score INTEGER DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
  win_probability INTEGER DEFAULT 0 CHECK (win_probability >= 0 AND win_probability <= 100),
  competition_level VARCHAR(20) CHECK (competition_level IN ('low', 'medium', 'high', 'extreme')),
  
  -- Tracking
  submission_date TIMESTAMP WITH TIME ZONE,
  decision_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  description TEXT,
  eligibility_requirements TEXT,
  focus_areas TEXT[],
  keywords TEXT[],
  website_url VARCHAR(500),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index for common queries
CREATE INDEX idx_grant_opportunities_status ON grant_opportunities(status);
CREATE INDEX idx_grant_opportunities_deadline ON grant_opportunities(application_deadline);
CREATE INDEX idx_grant_opportunities_agency ON grant_opportunities(agency_name);

-- =====================================================
-- TABLE 2: grant_contacts
-- Multiple contacts per grant
-- =====================================================
CREATE TABLE IF NOT EXISTS grant_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID REFERENCES grant_opportunities(id) ON DELETE CASCADE,
  
  -- Contact Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  title VARCHAR(200),
  organization VARCHAR(300),
  department VARCHAR(200),
  
  -- Communication
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  fax VARCHAR(50),
  
  -- Address
  address_line1 VARCHAR(300),
  address_line2 VARCHAR(300),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'USA',
  
  -- Preferences
  preferred_contact_method VARCHAR(50) DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'mobile', 'mail', 'in_person')),
  best_time_to_contact VARCHAR(200),
  
  -- Relationship
  contact_type VARCHAR(50) DEFAULT 'program_officer' CHECK (contact_type IN (
    'program_officer', 'grants_manager', 'technical_contact', 
    'financial_contact', 'administrative', 'executive', 'other'
  )),
  is_primary BOOLEAN DEFAULT FALSE,
  
  -- Notes
  notes TEXT,
  last_contact_date DATE,
  next_followup_date DATE,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_grant_contacts_grant ON grant_contacts(grant_id);
CREATE INDEX idx_grant_contacts_primary ON grant_contacts(grant_id, is_primary) WHERE is_primary = TRUE;

-- =====================================================
-- TABLE 3: grant_documents
-- File attachments and documents
-- =====================================================
CREATE TABLE IF NOT EXISTS grant_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID REFERENCES grant_opportunities(id) ON DELETE CASCADE,
  
  -- Document Info
  document_name VARCHAR(300) NOT NULL,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
    'application_draft', 'final_submission', 'award_letter', 
    'rejection_letter', 'budget', 'narrative', 'letter_of_support',
    'evaluation', 'report', 'correspondence', 'attachment', 'other'
  )),
  description TEXT,
  
  -- File Storage
  file_url VARCHAR(1000),
  file_path VARCHAR(500),
  file_size INTEGER,
  mime_type VARCHAR(100),
  
  -- Versioning
  version INTEGER DEFAULT 1,
  is_current BOOLEAN DEFAULT TRUE,
  
  -- Audit
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_grant_documents_grant ON grant_documents(grant_id);
CREATE INDEX idx_grant_documents_type ON grant_documents(document_type);

-- =====================================================
-- TABLE 4: grant_communications
-- Contact log and communication history
-- =====================================================
CREATE TABLE IF NOT EXISTS grant_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID REFERENCES grant_opportunities(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES grant_contacts(id) ON DELETE SET NULL,
  
  -- Communication Details
  communication_type VARCHAR(50) NOT NULL CHECK (communication_type IN (
    'email_sent', 'email_received', 'phone_call', 'video_call',
    'in_person_meeting', 'letter_sent', 'letter_received', 
    'webinar', 'conference', 'site_visit', 'other'
  )),
  subject VARCHAR(500),
  summary TEXT NOT NULL,
  detailed_notes TEXT,
  
  -- Tracking
  communication_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_minutes INTEGER,
  outcome VARCHAR(200),
  
  -- Follow-up
  followup_required BOOLEAN DEFAULT FALSE,
  followup_date DATE,
  followup_notes TEXT,
  followup_completed BOOLEAN DEFAULT FALSE,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_grant_communications_grant ON grant_communications(grant_id);
CREATE INDEX idx_grant_communications_date ON grant_communications(communication_date DESC);
CREATE INDEX idx_grant_communications_followup ON grant_communications(followup_date) WHERE followup_required = TRUE AND followup_completed = FALSE;

-- =====================================================
-- TABLE 5: grant_milestones
-- Custom dates and deadlines
-- =====================================================
CREATE TABLE IF NOT EXISTS grant_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID REFERENCES grant_opportunities(id) ON DELETE CASCADE,
  
  -- Milestone Info
  milestone_name VARCHAR(300) NOT NULL,
  milestone_type VARCHAR(50) NOT NULL CHECK (milestone_type IN (
    'deadline', 'internal_review', 'submission', 'decision',
    'report_due', 'site_visit', 'kickoff', 'completion',
    'renewal', 'followup', 'custom'
  )),
  description TEXT,
  
  -- Date & Time
  due_date DATE NOT NULL,
  due_time TIME,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  
  -- Status
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'missed', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Alerts
  alert_days_before INTEGER[] DEFAULT '{30, 14, 7, 3, 1}',
  alert_sent BOOLEAN DEFAULT FALSE,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_grant_milestones_grant ON grant_milestones(grant_id);
CREATE INDEX idx_grant_milestones_due ON grant_milestones(due_date);
CREATE INDEX idx_grant_milestones_pending ON grant_milestones(due_date) WHERE status = 'pending';

-- =====================================================
-- TABLE 6: grant_applications
-- Our application drafts and submissions
-- =====================================================
CREATE TABLE IF NOT EXISTS grant_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID REFERENCES grant_opportunities(id) ON DELETE CASCADE,
  
  -- Application Info
  application_title VARCHAR(500),
  version INTEGER DEFAULT 1,
  
  -- Content Sections
  executive_summary TEXT,
  need_statement TEXT,
  project_description TEXT,
  goals_objectives TEXT,
  methodology TEXT,
  timeline TEXT,
  evaluation_plan TEXT,
  budget_narrative TEXT,
  sustainability_plan TEXT,
  organizational_capacity TEXT,
  
  -- Budget
  total_budget DECIMAL(15,2),
  requested_amount DECIMAL(15,2),
  match_amount DECIMAL(15,2),
  indirect_costs DECIMAL(15,2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
    'draft', 'internal_review', 'revision', 'final', 'submitted'
  )),
  
  -- Submission
  submitted_at TIMESTAMP WITH TIME ZONE,
  confirmation_number VARCHAR(100),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  last_edited_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_grant_applications_grant ON grant_applications(grant_id);

-- =====================================================
-- TABLE 7: grant_reports
-- Required reporting for awarded grants
-- =====================================================
CREATE TABLE IF NOT EXISTS grant_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID REFERENCES grant_opportunities(id) ON DELETE CASCADE,
  
  -- Report Info
  report_name VARCHAR(300) NOT NULL,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN (
    'quarterly_progress', 'annual_progress', 'financial', 
    'final', 'interim', 'site_visit', 'evaluation', 'custom'
  )),
  reporting_period_start DATE,
  reporting_period_end DATE,
  
  -- Due Date
  due_date DATE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,
  
  -- Content
  narrative TEXT,
  metrics JSONB,
  financials JSONB,
  
  -- Status
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'submitted', 'accepted', 'revision_requested'
  )),
  
  -- File
  document_id UUID REFERENCES grant_documents(id),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_grant_reports_grant ON grant_reports(grant_id);
CREATE INDEX idx_grant_reports_due ON grant_reports(due_date) WHERE status = 'pending';

-- =====================================================
-- TABLE 8: grant_notes
-- Internal team notes and strategy
-- =====================================================
CREATE TABLE IF NOT EXISTS grant_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID REFERENCES grant_opportunities(id) ON DELETE CASCADE,
  
  -- Note Content
  note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN (
    'general', 'strategy', 'research', 'competitive_analysis',
    'lesson_learned', 'action_item', 'decision', 'risk'
  )),
  title VARCHAR(300),
  content TEXT NOT NULL,
  
  -- Priority
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  is_pinned BOOLEAN DEFAULT FALSE,
  
  -- Action Item Tracking
  is_action_item BOOLEAN DEFAULT FALSE,
  action_due_date DATE,
  action_assigned_to VARCHAR(200),
  action_completed BOOLEAN DEFAULT FALSE,
  action_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_grant_notes_grant ON grant_notes(grant_id);
CREATE INDEX idx_grant_notes_pinned ON grant_notes(grant_id) WHERE is_pinned = TRUE;
CREATE INDEX idx_grant_notes_actions ON grant_notes(action_due_date) WHERE is_action_item = TRUE AND action_completed = FALSE;

-- =====================================================
-- TABLE 9: grant_ai_analysis
-- Javari AI recommendations and analysis
-- =====================================================
CREATE TABLE IF NOT EXISTS grant_ai_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID REFERENCES grant_opportunities(id) ON DELETE CASCADE,
  
  -- Analysis Type
  analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN (
    'match_analysis', 'win_strategy', 'keyword_suggestions',
    'narrative_draft', 'competitive_intel', 'weakness_review',
    'success_factors', 'budget_review', 'compliance_check'
  )),
  
  -- Results
  analysis_title VARCHAR(300),
  analysis_content TEXT NOT NULL,
  recommendations TEXT[],
  keywords_suggested TEXT[],
  
  -- Scoring
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- AI Metadata
  ai_provider VARCHAR(50), -- OpenAI, Claude, etc.
  ai_model VARCHAR(100),
  tokens_used INTEGER,
  
  -- User Feedback
  was_helpful BOOLEAN,
  user_feedback TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  requested_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_grant_ai_analysis_grant ON grant_ai_analysis(grant_id);
CREATE INDEX idx_grant_ai_analysis_type ON grant_ai_analysis(analysis_type);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Dashboard summary view
CREATE OR REPLACE VIEW grant_dashboard_summary AS
SELECT 
  COUNT(*) AS total_opportunities,
  COUNT(*) FILTER (WHERE status = 'researching') AS researching,
  COUNT(*) FILTER (WHERE status = 'preparing') AS preparing,
  COUNT(*) FILTER (WHERE status IN ('draft', 'internal_review')) AS drafting,
  COUNT(*) FILTER (WHERE status = 'submitted') AS submitted,
  COUNT(*) FILTER (WHERE status = 'under_review') AS under_review,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved,
  COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
  COALESCE(SUM(amount_requested) FILTER (WHERE status = 'submitted'), 0) AS total_pending_amount,
  COALESCE(SUM(amount_awarded) FILTER (WHERE status = 'approved'), 0) AS total_awarded_amount,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'approved')::DECIMAL / 
    NULLIF(COUNT(*) FILTER (WHERE status IN ('approved', 'rejected')), 0) * 100, 1
  ) AS win_rate
FROM grant_opportunities;

-- Upcoming deadlines view
CREATE OR REPLACE VIEW grant_upcoming_deadlines AS
SELECT 
  g.id,
  g.grant_name,
  g.agency_name,
  g.application_deadline,
  g.amount_available,
  g.status,
  g.priority,
  (g.application_deadline - CURRENT_DATE) AS days_until_deadline
FROM grant_opportunities g
WHERE g.application_deadline >= CURRENT_DATE
  AND g.status NOT IN ('approved', 'rejected', 'withdrawn', 'archived')
ORDER BY g.application_deadline ASC;

-- Calendar events view
CREATE OR REPLACE VIEW grant_calendar_events AS
SELECT 
  'deadline' AS event_type,
  g.id AS grant_id,
  g.grant_name,
  g.agency_name,
  g.application_deadline AS event_date,
  'Application Deadline' AS event_title,
  g.status,
  g.priority
FROM grant_opportunities g
WHERE g.application_deadline IS NOT NULL
UNION ALL
SELECT 
  'milestone' AS event_type,
  m.grant_id,
  g.grant_name,
  g.agency_name,
  m.due_date AS event_date,
  m.milestone_name AS event_title,
  m.status,
  NULL AS priority
FROM grant_milestones m
JOIN grant_opportunities g ON g.id = m.grant_id
WHERE m.status = 'pending'
UNION ALL
SELECT 
  'report' AS event_type,
  r.grant_id,
  g.grant_name,
  g.agency_name,
  r.due_date AS event_date,
  r.report_name AS event_title,
  r.status,
  NULL AS priority
FROM grant_reports r
JOIN grant_opportunities g ON g.id = r.grant_id
WHERE r.status = 'pending'
ORDER BY event_date ASC;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE grant_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_ai_analysis ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (only admins can access grant data)
CREATE POLICY "grant_opportunities_admin" ON grant_opportunities 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "grant_contacts_admin" ON grant_contacts 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "grant_documents_admin" ON grant_documents 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "grant_communications_admin" ON grant_communications 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "grant_milestones_admin" ON grant_milestones 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "grant_applications_admin" ON grant_applications 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "grant_reports_admin" ON grant_reports 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "grant_notes_admin" ON grant_notes 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "grant_ai_analysis_admin" ON grant_ai_analysis 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_grant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER grant_opportunities_updated
  BEFORE UPDATE ON grant_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_grant_updated_at();

CREATE TRIGGER grant_contacts_updated
  BEFORE UPDATE ON grant_contacts
  FOR EACH ROW EXECUTE FUNCTION update_grant_updated_at();

CREATE TRIGGER grant_milestones_updated
  BEFORE UPDATE ON grant_milestones
  FOR EACH ROW EXECUTE FUNCTION update_grant_updated_at();

CREATE TRIGGER grant_applications_updated
  BEFORE UPDATE ON grant_applications
  FOR EACH ROW EXECUTE FUNCTION update_grant_updated_at();

CREATE TRIGGER grant_reports_updated
  BEFORE UPDATE ON grant_reports
  FOR EACH ROW EXECUTE FUNCTION update_grant_updated_at();

CREATE TRIGGER grant_notes_updated
  BEFORE UPDATE ON grant_notes
  FOR EACH ROW EXECUTE FUNCTION update_grant_updated_at();

-- =====================================================
-- SAMPLE DATA FOR CRAIVERSE GRANTS
-- =====================================================

-- Insert sample grant opportunities based on CRAIverse modules
INSERT INTO grant_opportunities (
  grant_name, agency_name, program_name, amount_available,
  application_deadline, status, priority, target_modules,
  match_score, win_probability, competition_level, description
) VALUES
-- Tier 1: First Responders ($400M+)
(
  'FEMA Building Resilient Infrastructure and Communities (BRIC)',
  'FEMA', 'BRIC Program', 1000000000,
  '2025-03-15', 'preparing', 'critical', ARRAY['first-responders'],
  85, 35, 'high',
  'Focus on community resilience and first responder mental health support technology.'
),
(
  'SAMHSA First Responder Mental Health',
  'SAMHSA', 'First Responders Initiative', 50000000,
  '2025-02-28', 'researching', 'critical', ARRAY['first-responders'],
  90, 40, 'medium',
  'Digital mental health interventions for first responders.'
),
-- Veterans ($150M+)
(
  'VA Innovation Competition',
  'Dept of Veterans Affairs', 'VHA Innovation', 50000000,
  '2025-04-15', 'preparing', 'high', ARRAY['veterans-transition'],
  88, 45, 'medium',
  'Career transition technology for veterans.'
),
-- Military Families ($50M+)
(
  'DoD Quality of Life Programs',
  'Dept of Defense', 'Family Programs', 75000000,
  '2025-05-01', 'researching', 'high', ARRAY['together-anywhere'],
  80, 30, 'high',
  'Technology to connect deployed military members with families.'
),
-- Health ($55M+)
(
  'HHS Digital Health Initiative',
  'Dept of Health & Human Services', 'Rural Health', 200000000,
  '2025-06-30', 'researching', 'medium', ARRAY['rural-health', 'mental-health-youth'],
  75, 25, 'high',
  'Telehealth and digital health solutions for underserved populations.'
),
-- Animal Rescue ($40M+)
(
  'Petco Foundation Love Grant',
  'Petco Foundation', 'Animal Welfare', 25000000,
  NULL, 'preparing', 'medium', ARRAY['animal-rescue'],
  92, 60, 'low',
  'Technology solutions for animal rescue organizations.'
),
-- Faith Communities ($75M+)
(
  'Lilly Endowment Community Fund',
  'Lilly Endowment', 'Faith-Based Initiative', 100000000,
  NULL, 'researching', 'medium', ARRAY['faith-communities'],
  70, 35, 'medium',
  'Digital tools for religious organizations.'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMPLETION
-- =====================================================
SELECT 'Grant Management Schema Created Successfully!' AS status;
-- Grant Knowledge Base Schema - LEARNING SYSTEM
-- Javari learns what gets approved and WHY
-- Timestamp: Saturday, December 13, 2025 - 1:55 PM EST

-- ============================================================
-- KNOWLEDGE BASE TABLES
-- ============================================================

-- 1. Grant patterns learned from historical data
CREATE TABLE IF NOT EXISTS grant_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_id TEXT UNIQUE NOT NULL,
    agency TEXT NOT NULL,
    agency_code TEXT,
    category TEXT,
    cfda_prefix TEXT,
    
    -- What works
    keywords TEXT[] DEFAULT '{}',
    power_phrases TEXT[] DEFAULT '{}',
    success_factors TEXT[] DEFAULT '{}',
    
    -- Statistics
    avg_amount DECIMAL(15,2) DEFAULT 0,
    min_amount DECIMAL(15,2) DEFAULT 0,
    max_amount DECIMAL(15,2) DEFAULT 0,
    total_awards_tracked INTEGER DEFAULT 0,
    
    -- Patterns
    typical_recipients TEXT[] DEFAULT '{}',
    typical_project_types TEXT[] DEFAULT '{}',
    common_partnerships TEXT[] DEFAULT '{}',
    
    -- Application insights
    application_tips TEXT[] DEFAULT '{}',
    common_mistakes TEXT[] DEFAULT '{}',
    required_sections TEXT[] DEFAULT '{}',
    
    -- Timing
    best_submission_timing TEXT,
    avg_review_time_days INTEGER,
    
    -- Learning metadata
    learned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confidence_score INTEGER DEFAULT 50,
    data_points INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Successful applications we can learn from
CREATE TABLE IF NOT EXISTS grant_success_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source info
    source TEXT NOT NULL, -- 'usa_spending', 'nih_reporter', 'nsf', etc.
    external_id TEXT NOT NULL,
    
    -- Award details
    title TEXT NOT NULL,
    agency TEXT NOT NULL,
    agency_code TEXT,
    cfda_number TEXT,
    
    -- Amounts
    award_amount DECIMAL(15,2),
    requested_amount DECIMAL(15,2),
    
    -- Recipient
    recipient_name TEXT,
    recipient_type TEXT, -- 'nonprofit', 'university', 'state', 'local_gov'
    recipient_state TEXT,
    recipient_city TEXT,
    
    -- Content analysis
    abstract_text TEXT,
    keywords_extracted TEXT[] DEFAULT '{}',
    topics_detected TEXT[] DEFAULT '{}',
    
    -- What made it successful
    success_factors_detected TEXT[] DEFAULT '{}',
    partnerships_mentioned TEXT[] DEFAULT '{}',
    innovation_aspects TEXT[] DEFAULT '{}',
    
    -- CRAIverse alignment
    matching_modules TEXT[] DEFAULT '{}',
    match_score INTEGER DEFAULT 0,
    
    -- Dates
    award_date DATE,
    project_start DATE,
    project_end DATE,
    
    -- Learning
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analysis_version INTEGER DEFAULT 1,
    
    UNIQUE(source, external_id)
);

-- 3. Agency intelligence
CREATE TABLE IF NOT EXISTS agency_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    agency_code TEXT PRIMARY KEY,
    agency_name TEXT NOT NULL,
    
    -- Priorities
    current_priorities TEXT[] DEFAULT '{}',
    strategic_goals TEXT[] DEFAULT '{}',
    focus_areas TEXT[] DEFAULT '{}',
    
    -- Budget info
    annual_grant_budget DECIMAL(15,2),
    fy_year INTEGER,
    budget_trend TEXT, -- 'increasing', 'stable', 'decreasing'
    
    -- Application preferences
    preferred_formats TEXT[] DEFAULT '{}',
    evaluation_criteria TEXT[] DEFAULT '{}',
    scoring_rubric JSONB,
    
    -- Contact intelligence
    key_contacts JSONB DEFAULT '[]',
    
    -- Success patterns
    avg_award_size DECIMAL(15,2),
    success_rate DECIMAL(5,2),
    typical_project_length_months INTEGER,
    
    -- Tips
    insider_tips TEXT[] DEFAULT '{}',
    common_rejection_reasons TEXT[] DEFAULT '{}',
    
    -- Metadata
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_sources TEXT[] DEFAULT '{}'
);

-- 4. Discovery runs log
CREATE TABLE IF NOT EXISTS grant_discovery_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    run_type TEXT DEFAULT 'scheduled', -- 'scheduled', 'manual', 'targeted'
    
    -- Search parameters
    modules_searched TEXT[] DEFAULT '{}',
    keywords_used TEXT[] DEFAULT '{}',
    sources_queried TEXT[] DEFAULT '{}',
    
    -- Results
    total_found INTEGER DEFAULT 0,
    new_opportunities INTEGER DEFAULT 0,
    high_match_count INTEGER DEFAULT 0,
    
    -- Source breakdown
    results_by_source JSONB DEFAULT '{}',
    
    -- Errors
    errors JSONB DEFAULT '[]',
    
    -- Duration
    duration_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AI analysis history
CREATE TABLE IF NOT EXISTS grant_ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_id UUID REFERENCES grant_opportunities(id) ON DELETE CASCADE,
    
    analysis_type TEXT NOT NULL, -- 'match', 'strategy', 'narrative', 'competitive', 'review'
    
    -- Multi-AI responses
    claude_response TEXT,
    claude_confidence INTEGER,
    
    gpt4_response TEXT,
    gpt4_confidence INTEGER,
    
    gemini_response TEXT,
    gemini_confidence INTEGER,
    
    perplexity_response TEXT,
    perplexity_confidence INTEGER,
    
    -- Consensus
    consensus_analysis TEXT,
    consensus_confidence INTEGER,
    
    -- Extracted insights
    recommendations TEXT[] DEFAULT '{}',
    keywords_suggested TEXT[] DEFAULT '{}',
    risks_identified TEXT[] DEFAULT '{}',
    next_steps TEXT[] DEFAULT '{}',
    
    -- Feedback (for learning)
    user_rating INTEGER, -- 1-5
    user_feedback TEXT,
    was_helpful BOOLEAN,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 6. Application drafts (AI-generated)
CREATE TABLE IF NOT EXISTS grant_application_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_id UUID REFERENCES grant_opportunities(id) ON DELETE CASCADE,
    
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'draft', -- 'draft', 'review', 'final', 'submitted'
    
    -- Generated sections
    executive_summary TEXT,
    need_statement TEXT,
    project_description TEXT,
    evaluation_plan TEXT,
    sustainability_plan TEXT,
    organizational_capacity TEXT,
    
    -- Structured data
    goals JSONB DEFAULT '[]',
    objectives JSONB DEFAULT '[]',
    timeline JSONB DEFAULT '[]',
    budget JSONB DEFAULT '{}',
    budget_narrative TEXT,
    logic_model JSONB DEFAULT '{}',
    key_personnel JSONB DEFAULT '[]',
    
    -- AI info
    ai_provider_used TEXT,
    generation_confidence INTEGER,
    
    -- Scoring
    predicted_score INTEGER,
    match_score INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 7. Competitor tracking
CREATE TABLE IF NOT EXISTS grant_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Organization info (from ProPublica, etc.)
    ein TEXT,
    name TEXT NOT NULL,
    city TEXT,
    state TEXT,
    
    -- Financial
    annual_revenue DECIMAL(15,2),
    total_assets DECIMAL(15,2),
    
    -- Grant history
    grants_received INTEGER DEFAULT 0,
    total_grant_funding DECIMAL(15,2) DEFAULT 0,
    agencies_funded_by TEXT[] DEFAULT '{}',
    
    -- Analysis
    focus_areas TEXT[] DEFAULT '{}',
    strengths TEXT[] DEFAULT '{}',
    weaknesses TEXT[] DEFAULT '{}',
    
    -- CRAIverse overlap
    overlapping_modules TEXT[] DEFAULT '{}',
    competition_level TEXT, -- 'high', 'medium', 'low'
    
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_knowledge_base_agency ON grant_knowledge_base(agency);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_cfda ON grant_knowledge_base(cfda_prefix);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_keywords ON grant_knowledge_base USING gin(keywords);

CREATE INDEX IF NOT EXISTS idx_success_examples_agency ON grant_success_examples(agency);
CREATE INDEX IF NOT EXISTS idx_success_examples_cfda ON grant_success_examples(cfda_number);
CREATE INDEX IF NOT EXISTS idx_success_examples_modules ON grant_success_examples USING gin(matching_modules);
CREATE INDEX IF NOT EXISTS idx_success_examples_amount ON grant_success_examples(award_amount DESC);

CREATE INDEX IF NOT EXISTS idx_discovery_runs_date ON grant_discovery_runs(run_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_grant ON grant_ai_analyses(grant_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_type ON grant_ai_analyses(analysis_type);

CREATE INDEX IF NOT EXISTS idx_drafts_grant ON grant_application_drafts(grant_id);
CREATE INDEX IF NOT EXISTS idx_drafts_status ON grant_application_drafts(status);

-- ============================================================
-- FUNCTIONS FOR LEARNING
-- ============================================================

-- Function to update knowledge base from new success examples
CREATE OR REPLACE FUNCTION update_knowledge_from_success()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert knowledge pattern
    INSERT INTO grant_knowledge_base (
        pattern_id,
        agency,
        agency_code,
        cfda_prefix,
        keywords,
        avg_amount,
        total_awards_tracked,
        typical_recipients,
        data_points
    )
    VALUES (
        CONCAT(NEW.agency_code, '_', LEFT(NEW.cfda_number, 2)),
        NEW.agency,
        NEW.agency_code,
        LEFT(NEW.cfda_number, 2),
        NEW.keywords_extracted,
        NEW.award_amount,
        1,
        ARRAY[NEW.recipient_type],
        1
    )
    ON CONFLICT (pattern_id) DO UPDATE SET
        avg_amount = (grant_knowledge_base.avg_amount * grant_knowledge_base.data_points + NEW.award_amount) / (grant_knowledge_base.data_points + 1),
        total_awards_tracked = grant_knowledge_base.total_awards_tracked + 1,
        keywords = array_cat(grant_knowledge_base.keywords, NEW.keywords_extracted),
        typical_recipients = CASE 
            WHEN NOT (NEW.recipient_type = ANY(grant_knowledge_base.typical_recipients))
            THEN array_append(grant_knowledge_base.typical_recipients, NEW.recipient_type)
            ELSE grant_knowledge_base.typical_recipients
        END,
        data_points = grant_knowledge_base.data_points + 1,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-learn from success examples
DROP TRIGGER IF EXISTS trigger_learn_from_success ON grant_success_examples;
CREATE TRIGGER trigger_learn_from_success
    AFTER INSERT ON grant_success_examples
    FOR EACH ROW
    EXECUTE FUNCTION update_knowledge_from_success();

-- ============================================================
-- VIEWS FOR INSIGHTS
-- ============================================================

-- Best opportunities for each module
CREATE OR REPLACE VIEW best_opportunities_by_module AS
SELECT 
    unnest(target_modules) as module,
    id,
    grant_name,
    agency_name,
    amount_available,
    application_deadline,
    match_score,
    win_probability,
    status
FROM grant_opportunities
WHERE status NOT IN ('archived', 'declined', 'not_awarded')
  AND (application_deadline IS NULL OR application_deadline > NOW())
ORDER BY module, match_score DESC;

-- Knowledge summary by agency
CREATE OR REPLACE VIEW agency_knowledge_summary AS
SELECT 
    agency,
    COUNT(*) as patterns_known,
    AVG(avg_amount) as avg_grant_size,
    SUM(total_awards_tracked) as total_awards_analyzed,
    AVG(confidence_score) as avg_confidence,
    MAX(last_updated) as last_learned
FROM grant_knowledge_base
GROUP BY agency
ORDER BY total_awards_analyzed DESC;

-- Discovery effectiveness
CREATE OR REPLACE VIEW discovery_effectiveness AS
SELECT 
    DATE_TRUNC('day', run_at) as run_date,
    COUNT(*) as runs,
    SUM(total_found) as total_found,
    SUM(new_opportunities) as new_found,
    SUM(high_match_count) as high_matches,
    AVG(duration_ms) as avg_duration_ms
FROM grant_discovery_runs
GROUP BY DATE_TRUNC('day', run_at)
ORDER BY run_date DESC;

-- ============================================================
-- SEED AGENCY INTELLIGENCE
-- ============================================================

INSERT INTO agency_intelligence (agency_code, agency_name, current_priorities, focus_areas, evaluation_criteria)
VALUES 
    ('HHS', 'Department of Health and Human Services', 
     ARRAY['health equity', 'mental health', 'substance abuse', 'maternal health'],
     ARRAY['underserved populations', 'evidence-based interventions', 'telehealth'],
     ARRAY['need', 'approach', 'organizational capacity', 'evaluation', 'sustainability']),
    
    ('FEMA', 'Federal Emergency Management Agency',
     ARRAY['community resilience', 'mitigation', 'preparedness'],
     ARRAY['disaster recovery', 'hazard mitigation', 'emergency management'],
     ARRAY['risk reduction', 'cost effectiveness', 'community benefit']),
    
    ('DOJ', 'Department of Justice',
     ARRAY['public safety', 'community policing', 'victim services'],
     ARRAY['crime prevention', 'reentry', 'justice reform'],
     ARRAY['evidence-based', 'data-driven', 'partnership', 'sustainability']),
    
    ('VA', 'Department of Veterans Affairs',
     ARRAY['veteran employment', 'mental health', 'housing'],
     ARRAY['transition assistance', 'peer support', 'family services'],
     ARRAY['veteran outcomes', 'holistic services', 'partnership']),
    
    ('ED', 'Department of Education',
     ARRAY['equity', 'STEM', 'college access'],
     ARRAY['underserved students', 'technology', 'teacher quality'],
     ARRAY['student outcomes', 'innovation', 'sustainability']),
    
    ('NSF', 'National Science Foundation',
     ARRAY['research excellence', 'STEM education', 'innovation'],
     ARRAY['basic research', 'broader impacts', 'diversity'],
     ARRAY['intellectual merit', 'broader impacts']),
    
    ('NEA', 'National Endowment for the Arts',
     ARRAY['arts access', 'arts education', 'community arts'],
     ARRAY['underserved communities', 'artist support', 'cultural heritage'],
     ARRAY['artistic excellence', 'community engagement', 'access']),
    
    ('USDA', 'Department of Agriculture',
     ARRAY['rural development', 'food security', 'conservation'],
     ARRAY['rural communities', 'agriculture', 'nutrition'],
     ARRAY['rural impact', 'sustainability', 'partnership'])
ON CONFLICT (agency_code) DO NOTHING;

-- ============================================================
-- GRANT TYPE SUCCESS FACTORS
-- ============================================================

CREATE TABLE IF NOT EXISTS grant_type_success_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_type TEXT NOT NULL, -- 'research', 'service_delivery', 'capacity_building', 'infrastructure'
    
    critical_factors TEXT[] NOT NULL,
    recommended_approach TEXT,
    typical_budget_breakdown JSONB,
    required_partnerships TEXT[],
    common_metrics TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO grant_type_success_factors (grant_type, critical_factors, recommended_approach, common_metrics)
VALUES 
    ('research', 
     ARRAY['methodology', 'innovation', 'feasibility', 'team expertise', 'preliminary data'],
     'Emphasize scientific rigor, novelty, and potential for publication/dissemination',
     ARRAY['publications', 'patents', 'trainees supported', 'presentations']),
    
    ('service_delivery',
     ARRAY['target population', 'evidence base', 'implementation plan', 'evaluation', 'sustainability'],
     'Focus on community need, proven interventions, and measurable outcomes',
     ARRAY['participants served', 'services delivered', 'outcome improvements', 'cost per participant']),
    
    ('capacity_building',
     ARRAY['organizational need', 'growth plan', 'leadership', 'systems improvement', 'sustainability'],
     'Demonstrate current gaps and clear path to enhanced capacity',
     ARRAY['staff trained', 'systems implemented', 'efficiency gains', 'capacity indicators']),
    
    ('infrastructure',
     ARRAY['physical need', 'design', 'community impact', 'maintenance plan', 'match funding'],
     'Show concrete need, detailed plans, and long-term benefit',
     ARRAY['facilities improved', 'people served', 'accessibility gains', 'utilization rates'])
ON CONFLICT DO NOTHING;
