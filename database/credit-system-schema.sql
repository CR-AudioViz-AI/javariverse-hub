-- Credit System Database Schema
-- CR AudioViz AI - Centralized Credit Management
-- Timestamp: Dec 11, 2025 10:41 PM EST

-- ============================================
-- USER CREDITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- CREDIT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'purchase', 'deduction', 'refund', 'grant', 'subscription'
  credits INTEGER NOT NULL,
  app_id VARCHAR(100),
  operation_id VARCHAR(100),
  source VARCHAR(100),
  reference_id VARCHAR(255),
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FUNCTION: Add Credits
-- ============================================
CREATE OR REPLACE FUNCTION add_user_credits(
  p_user_id UUID,
  p_credits INTEGER,
  p_source VARCHAR DEFAULT 'manual',
  p_reference_id VARCHAR DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Upsert user_credits
  INSERT INTO user_credits (user_id, balance, lifetime_earned)
  VALUES (p_user_id, p_credits, p_credits)
  ON CONFLICT (user_id) DO UPDATE SET
    balance = user_credits.balance + p_credits,
    lifetime_earned = user_credits.lifetime_earned + p_credits,
    updated_at = NOW();
  
  -- Get new balance
  SELECT balance INTO v_new_balance
  FROM user_credits
  WHERE user_id = p_user_id;
  
  -- Log transaction
  INSERT INTO credit_transactions (user_id, type, credits, source, reference_id)
  VALUES (p_user_id, 'purchase', p_credits, p_source, p_reference_id);
  
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Deduct Credits (Atomic)
-- ============================================
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Lock the row for update
  SELECT balance INTO v_current_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  -- Deduct credits
  UPDATE user_credits
  SET 
    balance = balance - p_amount,
    lifetime_spent = lifetime_spent + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;
  
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_operation_id ON credit_transactions(operation_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own credits
CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own transactions  
CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role full access credits"
  ON user_credits FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access transactions"
  ON credit_transactions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
