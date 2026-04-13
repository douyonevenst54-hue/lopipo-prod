-- Add API request/error logging table for debugging
CREATE TABLE IF NOT EXISTS api_logs (
  id SERIAL PRIMARY KEY,
  route VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  user_id VARCHAR(255),
  status_code INTEGER,
  error_message TEXT,
  stack_trace TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  response_time_ms INTEGER
);

-- Index for quick error lookups
CREATE INDEX IF NOT EXISTS idx_api_logs_route_status ON api_logs(route, status_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_created ON api_logs(created_at DESC);

-- Update lottery_payments table if missing columns
ALTER TABLE IF EXISTS lottery_payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS lottery_payments ADD COLUMN IF NOT EXISTS reason VARCHAR(255);

-- Create view for recent errors
CREATE VIEW IF NOT EXISTS recent_errors AS
SELECT 
  route,
  method,
  status_code,
  COUNT(*) as error_count,
  MAX(created_at) as last_error,
  MAX(response_time_ms) as max_response_ms
FROM api_logs
WHERE status_code >= 400
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY route, method, status_code
ORDER BY error_count DESC;
