-- Add lottery_winners table for tracking payouts
CREATE TABLE IF NOT EXISTS lottery_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES lottery_series(id) ON DELETE CASCADE,
  winner_user_id VARCHAR(255) NOT NULL,
  pi_won DECIMAL(10, 4) NOT NULL,
  drawn_at TIMESTAMP NOT NULL DEFAULT NOW(),
  payout_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  seed_hash VARCHAR(255),
  payout_tx_id VARCHAR(255),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lottery_winners_series ON lottery_winners(series_id);
CREATE INDEX idx_lottery_winners_user ON lottery_winners(winner_user_id);
CREATE INDEX idx_lottery_winners_payout ON lottery_winners(payout_status);

-- Create lottery_refunds table for auto-refunds when threshold not met
CREATE TABLE IF NOT EXISTS lottery_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES lottery_series(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 4) NOT NULL,
  reason VARCHAR(100),
  refunded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lottery_refunds_series ON lottery_refunds(series_id);
CREATE INDEX idx_lottery_refunds_user ON lottery_refunds(user_id);
