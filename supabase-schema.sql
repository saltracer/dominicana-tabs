-- Supabase Database Schema for Dominicana App
-- This file contains the SQL commands to set up the database structure

-- Enable Row Level Security
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS books ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reading_progress ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('anonymous', 'user', 'friar', 'admin')),
  preferences JSONB NOT NULL DEFAULT '{}',
  subscription JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  year TEXT,
  category TEXT NOT NULL CHECK (category IN ('theology', 'philosophy', 'spirituality', 'history', 'liturgy', 'dominican', 'patristic', 'medieval')),
  language TEXT NOT NULL DEFAULT 'English',
  file_path TEXT NOT NULL,
  cover_image TEXT,
  description TEXT NOT NULL,
  is_dominican BOOLEAN NOT NULL DEFAULT FALSE,
  epub_path TEXT,
  epub_sample_path TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reading_progress table
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  current_position INTEGER NOT NULL DEFAULT 0,
  total_pages INTEGER NOT NULL DEFAULT 0,
  last_read TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_book_id ON bookmarks(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_book_id ON reading_progress(book_id);

-- Row Level Security Policies

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Books: Everyone can read books (no authentication required for basic access)
CREATE POLICY "Anyone can view books" ON books
  FOR SELECT USING (true);

-- Bookmarks: Users can only access their own bookmarks
CREATE POLICY "Users can view their own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" ON bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Reading Progress: Users can only access their own reading progress
CREATE POLICY "Users can view their own reading progress" ON reading_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading progress" ON reading_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading progress" ON reading_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading progress" ON reading_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_progress_updated_at BEFORE UPDATE ON reading_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role, preferences, subscription)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'user',
    '{
      "theme": "auto",
      "language": "en",
      "notifications": {
        "enabled": true,
        "prayerReminders": true,
        "feastDayAlerts": true,
        "dailyReadings": false,
        "communityUpdates": false
      },
      "liturgicalCalendar": {
        "showDominicanFeasts": true,
        "showUniversalFeasts": true,
        "preferredRite": "dominican",
        "timezone": "UTC"
      },
      "prayerReminders": []
    }',
    '{
      "type": "free",
      "status": "active",
      "startDate": "' || NOW()::text || '",
      "endDate": "' || (NOW() + INTERVAL '1 year')::text || '",
      "features": ["basic_prayer", "liturgical_calendar"]
    }'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Sample data for books (optional - you can add your own books)
INSERT INTO books (title, author, year, category, language, file_path, description, is_dominican, tags) VALUES
('Summa Theologica', 'St. Thomas Aquinas', '1265-1274', 'theology', 'Latin/English', '/books/summa-theologica.epub', 'The masterwork of St. Thomas Aquinas, a comprehensive theological treatise.', true, ARRAY['theology', 'philosophy', 'scholasticism', 'dominican']),
('The Divine Comedy', 'Dante Alighieri', '1308-1320', 'spirituality', 'Italian/English', '/books/divine-comedy.epub', 'Dante''s epic poem describing his journey through Hell, Purgatory, and Paradise.', false, ARRAY['poetry', 'medieval', 'spirituality', 'allegory']),
('Confessions', 'St. Augustine', '397-400', 'spirituality', 'Latin/English', '/books/confessions.epub', 'St. Augustine''s autobiographical work and theological masterpiece.', false, ARRAY['autobiography', 'theology', 'patristic', 'conversion']),
('The Imitation of Christ', 'Thomas à Kempis', '1418-1427', 'spirituality', 'Latin/English', '/books/imitation-of-christ.epub', 'A classic devotional book on Christian spirituality.', false, ARRAY['devotional', 'spirituality', 'meditation', 'christian'])
ON CONFLICT DO NOTHING;
