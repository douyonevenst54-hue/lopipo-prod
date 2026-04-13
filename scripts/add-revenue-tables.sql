-- Add subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  subscription_type VARCHAR(50) NOT NULL DEFAULT 'pro', -- pro, premium, pro_plus
  cost_pi DECIMAL(10, 4) NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_expires ON subscriptions(user_id, expires_at);
CREATE INDEX idx_subscriptions_active ON subscriptions(expires_at DESC);

-- Add featured_polls table
CREATE TABLE IF NOT EXISTS featured_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  pin_type VARCHAR(50) NOT NULL DEFAULT 'standard', -- standard, premium, vip
  cost_pi DECIMAL(10, 4) NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_featured_polls_expires ON featured_polls(expires_at DESC);
CREATE INDEX idx_featured_polls_active ON featured_polls(poll_id, expires_at);

-- Add revenue_transactions table
CREATE TABLE IF NOT EXISTS revenue_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  transaction_type VARCHAR(50) NOT NULL, -- subscription, featured_poll, group_fee, ad_click
  amount_pi DECIMAL(10, 4) NOT NULL,
  reference_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed', -- pending, completed, failed, refunded
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_revenue_transactions_user ON revenue_transactions(user_id, created_at DESC);
CREATE INDEX idx_revenue_transactions_type ON revenue_transactions(transaction_type, created_at DESC);

-- Add platform_revenue table (aggregated)
CREATE TABLE IF NOT EXISTS platform_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revenue_date DATE NOT NULL UNIQUE,
  subscription_pi DECIMAL(12, 4) DEFAULT 0,
  featured_polls_pi DECIMAL(12, 4) DEFAULT 0,
  group_fees_pi DECIMAL(12, 4) DEFAULT 0,
  ad_revenue_pi DECIMAL(12, 4) DEFAULT 0,
  total_pi DECIMAL(12, 4) DEFAULT 0,
  total_users INT DEFAULT 0,
  active_subscriptions INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_platform_revenue_date ON platform_revenue(revenue_date DESC);
