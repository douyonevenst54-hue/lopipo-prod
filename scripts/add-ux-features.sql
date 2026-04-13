-- Add user_wallets table for tracking Pi balances
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
  daily_spins_earned DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
  referral_earned DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
  lottery_won DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_wallets_balance ON user_wallets(balance DESC);
CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);

-- Add daily_spins table for daily login streaks
CREATE TABLE IF NOT EXISTS daily_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  claimed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  streak_count INT NOT NULL DEFAULT 1,
  pi_reward DECIMAL(10, 4) NOT NULL DEFAULT 0.001,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_daily_spins_user_id_date ON daily_spins(user_id, DATE(claimed_at));
CREATE INDEX idx_daily_spins_streak ON daily_spins(streak_count DESC);

-- Add share_links table for referral tracking
CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES live_polls(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES lottery_tickets(id) ON DELETE CASCADE,
  shared_by VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shares_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_share_links_poll ON share_links(poll_id);
CREATE INDEX idx_share_links_ticket ON share_links(ticket_id);
CREATE INDEX idx_share_links_user ON share_links(shared_by);

-- Add leaderboard view for easy querying
CREATE OR REPLACE VIEW leaderboard_weekly AS
SELECT 
  u.id,
  u.username,
  COALESCE(SUM(CAST(pr.pi_amount AS NUMERIC)), 0) as pi_won,
  COUNT(DISTINCT lt.id) as total_tickets,
  ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(CAST(pr.pi_amount AS NUMERIC)), 0) DESC) as rank
FROM users u
LEFT JOIN lottery_tickets lt ON u.id = lt.user_id AND lt.created_at > NOW() - INTERVAL '7 days'
LEFT JOIN referral_rewards pr ON u.id = pr.referrer_id AND pr.created_at > NOW() - INTERVAL '7 days'
GROUP BY u.id, u.username
HAVING COUNT(DISTINCT lt.id) > 0 OR COALESCE(SUM(CAST(pr.pi_amount AS NUMERIC)), 0) > 0
ORDER BY pi_won DESC, total_tickets DESC;
