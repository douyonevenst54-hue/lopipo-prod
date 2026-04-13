-- Add user_id columns to existing tables to track who created polls and entered lotteries

-- Add user reference to live_polls table
ALTER TABLE live_polls
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add user reference to lottery_series table
ALTER TABLE lottery_series
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Create lottery_tickets table if not exists
CREATE TABLE IF NOT EXISTS lottery_tickets (
  id SERIAL PRIMARY KEY,
  series_id INTEGER NOT NULL REFERENCES lottery_series(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pi_username VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_series_user (series_id, user_id)
);

-- Create poll_votes table if not exists
CREATE TABLE IF NOT EXISTS poll_votes (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES live_polls(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pi_username VARCHAR(255) NOT NULL,
  option_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(poll_id, user_id),
  INDEX idx_poll_user (poll_id, user_id)
);

-- Create group_lotteries table for private group games
CREATE TABLE IF NOT EXISTS group_lotteries (
  id SERIAL PRIMARY KEY,
  group_id VARCHAR(255) NOT NULL UNIQUE,
  group_name VARCHAR(255) NOT NULL,
  created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_by_username VARCHAR(255) NOT NULL,
  prize_pool DECIMAL(10, 2) DEFAULT 0,
  draw_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_created_by (created_by_id)
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES group_lotteries(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pi_username VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id),
  INDEX idx_group_user (group_id, user_id)
);
