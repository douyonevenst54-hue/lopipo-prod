-- LoPiPo Database Schema
-- Run this script once to initialize the database

-- Users table — Pi authentication + referral tracking
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pi_username VARCHAR(255) UNIQUE NOT NULL,
  pi_uid VARCHAR(255) UNIQUE NOT NULL,
  wallet_address VARCHAR(255),
  referral_code VARCHAR(16) UNIQUE NOT NULL,
  referred_by_code VARCHAR(16),
  referred_by_id UUID REFERENCES users(id),
  referral_rewards DECIMAL(10, 4) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles — display data + stats
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  polls_created INT DEFAULT 0,
  lotteries_entered INT DEFAULT 0,
  pi_won DECIMAL(10, 4) DEFAULT 0,
  total_votes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications — user alerts
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'draw_countdown', 'draw_winner', 'poll_viral', 'referral_reward'
  title VARCHAR(255) NOT NULL,
  message TEXT,
  related_id VARCHAR(255), -- poll_id, lottery_id, etc
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Polls table — store created polls
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id VARCHAR(255) UNIQUE NOT NULL, -- shareable ID like 'abc123'
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  hashtags TEXT[], -- array of hashtag strings
  total_votes INT DEFAULT 0,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Poll options + votes
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_label VARCHAR(255) NOT NULL,
  emoji VARCHAR(10),
  votes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Poll votes tracking (per user per option)
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(poll_id, user_id) -- one vote per user per poll
);

-- Lottery series
CREATE TABLE IF NOT EXISTS lottery_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_name VARCHAR(255) NOT NULL,
  description TEXT,
  ticket_price DECIMAL(5, 2) DEFAULT 0.50,
  contribution_to_pool DECIMAL(5, 2) DEFAULT 0.45,
  total_tickets_sold INT DEFAULT 0,
  prize_pool DECIMAL(10, 4) DEFAULT 0,
  draw_time TIMESTAMP NOT NULL,
  winners TEXT[], -- array of winner names
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'drawn', 'completed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  drawn_at TIMESTAMP
);

-- Lottery tickets
CREATE TABLE IF NOT EXISTS lottery_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES lottery_series(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  holder_name VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 1,
  numbers VARCHAR(255), -- for Lotto: "123" (3 digits)
  pi_amount DECIMAL(10, 4) DEFAULT 0.50,
  is_winner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referral rewards tracking
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_amount DECIMAL(10, 4) DEFAULT 0.05,
  event_type VARCHAR(50), -- 'first_ticket_purchase', 'poll_creation'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_pi_username ON users(pi_username);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_polls_creator_id ON polls(creator_id);
CREATE INDEX idx_poll_votes_user_id ON poll_votes(user_id);
CREATE INDEX idx_lottery_tickets_user_id ON lottery_tickets(user_id);
CREATE INDEX idx_lottery_tickets_series_id ON lottery_tickets(series_id);
CREATE INDEX idx_referral_rewards_referrer ON referral_rewards(referrer_id);
