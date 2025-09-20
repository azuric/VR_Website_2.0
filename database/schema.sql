-- VR League Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  discord_username TEXT,
  vr_experience_level TEXT CHECK (vr_experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  preferred_game_mode TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  tag TEXT UNIQUE NOT NULL CHECK (LENGTH(tag) <= 10),
  description TEXT,
  logo_url TEXT,
  captain_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  max_members INTEGER DEFAULT 6 CHECK (max_members > 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('captain', 'co_captain', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(team_id, user_id)
);

-- Tournaments table
CREATE TABLE tournaments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  game_mode TEXT NOT NULL DEFAULT 'population_one',
  tournament_type TEXT NOT NULL CHECK (tournament_type IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
  max_participants INTEGER NOT NULL CHECK (max_participants > 0),
  entry_fee DECIMAL(10,2) DEFAULT 0 CHECK (entry_fee >= 0),
  prize_pool DECIMAL(10,2) DEFAULT 0 CHECK (prize_pool >= 0),
  registration_start TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_end TIMESTAMP WITH TIME ZONE NOT NULL,
  tournament_start TIMESTAMP WITH TIME ZONE NOT NULL,
  tournament_end TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled')),
  rules TEXT,
  requirements TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (registration_start < registration_end),
  CHECK (registration_end <= tournament_start)
);

-- Tournament registrations table
CREATE TABLE tournament_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  registration_type TEXT NOT NULL CHECK (registration_type IN ('team', 'individual')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_id TEXT,
  payment_amount DECIMAL(10,2),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (registration_type = 'team' AND team_id IS NOT NULL AND user_id IS NULL) OR
    (registration_type = 'individual' AND user_id IS NOT NULL AND team_id IS NULL)
  ),
  UNIQUE(tournament_id, team_id),
  UNIQUE(tournament_id, user_id)
);

-- Matches table
CREATE TABLE matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL CHECK (round_number > 0),
  match_number INTEGER NOT NULL CHECK (match_number > 0),
  participant_1_id UUID,
  participant_2_id UUID,
  participant_1_type TEXT CHECK (participant_1_type IN ('team', 'user')),
  participant_2_type TEXT CHECK (participant_2_type IN ('team', 'user')),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  winner_id UUID,
  winner_type TEXT CHECK (winner_type IN ('team', 'user')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Match results table
CREATE TABLE match_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  participant_1_score INTEGER DEFAULT 0 CHECK (participant_1_score >= 0),
  participant_2_score INTEGER DEFAULT 0 CHECK (participant_2_score >= 0),
  match_data JSONB, -- Store detailed match statistics
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player statistics table
CREATE TABLE player_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  matches_played INTEGER DEFAULT 0 CHECK (matches_played >= 0),
  matches_won INTEGER DEFAULT 0 CHECK (matches_won >= 0),
  matches_lost INTEGER DEFAULT 0 CHECK (matches_lost >= 0),
  total_score INTEGER DEFAULT 0 CHECK (total_score >= 0),
  average_score DECIMAL(10,2) DEFAULT 0 CHECK (average_score >= 0),
  ranking_points INTEGER DEFAULT 1000 CHECK (ranking_points >= 0),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tournament_id),
  CHECK (matches_won + matches_lost <= matches_played)
);

-- Payments table
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES tournaments(id),
  stripe_payment_intent_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'GBP' CHECK (LENGTH(currency) = 3),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('entry_fee', 'subscription', 'prize_payout')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tournament', 'match', 'payment', 'system', 'achievement')),
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_teams_captain ON teams(captain_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_start ON tournaments(tournament_start);
CREATE INDEX idx_tournament_registrations_tournament ON tournament_registrations(tournament_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_player_stats_user ON player_stats(user_id);
CREATE INDEX idx_player_stats_tournament ON player_stats(tournament_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Teams policies
CREATE POLICY "Teams are viewable by everyone" ON teams FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create teams" ON teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Team captains can update their teams" ON teams FOR UPDATE USING (auth.uid() = captain_id);

-- Team members policies
CREATE POLICY "Team members are viewable by everyone" ON team_members FOR SELECT USING (true);
CREATE POLICY "Team captains can manage members" ON team_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM teams 
    WHERE teams.id = team_members.team_id 
    AND teams.captain_id = auth.uid()
  )
);
CREATE POLICY "Users can join/leave teams" ON team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave teams" ON team_members FOR DELETE USING (auth.uid() = user_id);

-- Tournaments policies
CREATE POLICY "Tournaments are viewable by everyone" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Admins can manage tournaments" ON tournaments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.username = 'admin' -- You can implement proper role system later
  )
);

-- Tournament registrations policies
CREATE POLICY "Users can view registrations for tournaments they're in" ON tournament_registrations FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.team_id = tournament_registrations.team_id 
    AND team_members.user_id = auth.uid()
  )
);
CREATE POLICY "Users can register for tournaments" ON tournament_registrations FOR INSERT WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM teams 
    WHERE teams.id = tournament_registrations.team_id 
    AND teams.captain_id = auth.uid()
  )
);

-- Matches policies
CREATE POLICY "Matches are viewable by everyone" ON matches FOR SELECT USING (true);

-- Match results policies
CREATE POLICY "Match results are viewable by everyone" ON match_results FOR SELECT USING (true);

-- Player stats policies
CREATE POLICY "Player stats are viewable by everyone" ON player_stats FOR SELECT USING (true);

-- Payments policies
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Functions and triggers

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Insert some sample data (optional)
INSERT INTO tournaments (name, description, game_mode, tournament_type, max_participants, entry_fee, prize_pool, registration_start, registration_end, tournament_start, status) VALUES
('Crown Championship - Season 1', 'The premier Lords of Esport tournament featuring the finest VR warriors in the UK', 'population_one', 'single_elimination', 32, 25.00, 1500.00, NOW(), NOW() + INTERVAL '7 days', NOW() + INTERVAL '14 days', 'registration_open'),
('Royal Rumble Weekly', 'Weekly battles for glory and ranking points in the Lords of Esport league', 'population_one', 'double_elimination', 16, 15.00, 800.00, NOW() + INTERVAL '7 days', NOW() + INTERVAL '14 days', NOW() + INTERVAL '21 days', 'upcoming'),
('Throne Wars - Team Battle', 'Elite team competition hosted at VRXtra Kingston facilities', 'population_one', 'single_elimination', 24, 50.00, 2000.00, NOW() + INTERVAL '14 days', NOW() + INTERVAL '21 days', NOW() + INTERVAL '28 days', 'upcoming');

