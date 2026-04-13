-- Create pending_payments table for recovery and reconciliation
CREATE TABLE IF NOT EXISTS pending_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id VARCHAR(255) UNIQUE NOT NULL,
  series_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  ticket_count INT NOT NULL DEFAULT 1,
  status VARCHAR(50) DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Index on payment_id for fast lookup
CREATE INDEX IF NOT EXISTS idx_pending_payments_payment_id ON pending_payments(payment_id);

-- Index on user_id for quick recovery
CREATE INDEX IF NOT EXISTS idx_pending_payments_user_id ON pending_payments(user_id);

-- Index on status for monitoring
CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON pending_payments(status);

-- Index on created_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_pending_payments_created_at ON pending_payments(created_at DESC);

-- View for stale pending payments (older than 1 hour)
CREATE OR REPLACE VIEW stale_pending_payments AS
SELECT * FROM pending_payments
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '1 hour'
ORDER BY created_at ASC;
