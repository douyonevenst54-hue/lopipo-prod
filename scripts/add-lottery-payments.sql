-- Create lottery_payments table to track all Pi payments
CREATE TABLE IF NOT EXISTS lottery_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id VARCHAR(255) UNIQUE NOT NULL,
  series_id VARCHAR(255) NOT NULL REFERENCES lottery_series(id) ON DELETE CASCADE,
  ticket_count INTEGER NOT NULL CHECK (ticket_count > 0),
  amount DECIMAL(10, 4) NOT NULL CHECK (amount > 0),
  user_name VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  INDEX idx_payment_id (payment_id),
  INDEX idx_series_id (series_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- Create lottery_tickets table to track individual ticket entries
CREATE TABLE IF NOT EXISTS lottery_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id VARCHAR(255) NOT NULL REFERENCES lottery_series(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ticket_count INTEGER NOT NULL CHECK (ticket_count > 0),
  payment_id VARCHAR(255) REFERENCES lottery_payments(payment_id) ON DELETE CASCADE,
  purchased_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_series_id (series_id),
  INDEX idx_user_id (user_id),
  INDEX idx_payment_id (payment_id)
);

-- Add columns to lottery_series if they don't exist
ALTER TABLE lottery_series
ADD COLUMN IF NOT EXISTS ticket_count INTEGER DEFAULT 0;

ALTER TABLE lottery_series
ADD COLUMN IF NOT EXISTS prize_pool DECIMAL(10, 4) DEFAULT 0;

-- Create index for faster lottery series lookups
CREATE INDEX IF NOT EXISTS idx_lottery_series_status ON lottery_series(status);
CREATE INDEX IF NOT EXISTS idx_lottery_series_draw_at ON lottery_series(draw_at);
