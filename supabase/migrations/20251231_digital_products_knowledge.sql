-- Digital Products Knowledge Base
-- Using R2 CDN for asset storage

-- Table for tracking digital products (metadata only)
CREATE TABLE IF NOT EXISTS digital_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cdn_url TEXT NOT NULL, -- R2 CDN URL
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets stored in R2: https://cdn.craudiovizai.com/digital-products/
