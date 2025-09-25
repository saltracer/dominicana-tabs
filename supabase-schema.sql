-- Supabase Database Schema for Ebook Reading Functionality
-- This schema supports both authenticated and unauthenticated users

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ebooks table - stores metadata about available ebooks
CREATE TABLE public.ebooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  cover_image_url TEXT,
  epub_file_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('theology', 'philosophy', 'spirituality', 'history', 'liturgy', 'dominican', 'patristic', 'medieval')),
  language TEXT DEFAULT 'English',
  is_dominican BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT TRUE, -- Whether the book is visible to unauthenticated users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User reading progress table - tracks reading progress for authenticated users
CREATE TABLE public.user_reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
  ebook_id UUID REFERENCES public.ebooks (id) ON DELETE CASCADE,
  current_position TEXT, -- CFI (Canonical Fragment Identifier) for precise location
  current_chapter INTEGER DEFAULT 1,
  total_chapters INTEGER,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  time_spent INTEGER DEFAULT 0, -- in seconds
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ebook_id)
);

-- User bookmarks table - stores bookmarks for authenticated users
CREATE TABLE public.user_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
  ebook_id UUID REFERENCES public.ebooks (id) ON DELETE CASCADE,
  position TEXT NOT NULL, -- CFI position
  chapter_title TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User annotations table - stores user annotations and highlights
CREATE TABLE public.user_annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
  ebook_id UUID REFERENCES public.ebooks (id) ON DELETE CASCADE,
  position TEXT NOT NULL, -- CFI position
  selected_text TEXT,
  annotation_type TEXT NOT NULL CHECK (annotation_type IN ('highlight', 'note', 'bookmark')),
  color TEXT, -- for highlights
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_ebooks_category ON public.ebooks(category);
CREATE INDEX idx_ebooks_is_public ON public.ebooks(is_public);
CREATE INDEX idx_ebooks_is_dominican ON public.ebooks(is_dominican);
CREATE INDEX idx_user_reading_progress_user_id ON public.user_reading_progress(user_id);
CREATE INDEX idx_user_reading_progress_ebook_id ON public.user_reading_progress(ebook_id);
CREATE INDEX idx_user_bookmarks_user_id ON public.user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_ebook_id ON public.user_bookmarks(ebook_id);
CREATE INDEX idx_user_annotations_user_id ON public.user_annotations(user_id);
CREATE INDEX idx_user_annotations_ebook_id ON public.user_annotations(ebook_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_annotations ENABLE ROW LEVEL SECURITY;

-- Ebooks policies
-- Allow everyone to read public ebooks (for unauthenticated users)
CREATE POLICY "Allow public read access to public ebooks" ON public.ebooks
  FOR SELECT USING (is_public = TRUE);

-- Allow authenticated users to read all ebooks
CREATE POLICY "Allow authenticated users to read all ebooks" ON public.ebooks
  FOR SELECT USING (auth.role() = 'authenticated');

-- User reading progress policies
-- Users can only access their own reading progress
CREATE POLICY "Users can view their own reading progress" ON public.user_reading_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading progress" ON public.user_reading_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading progress" ON public.user_reading_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading progress" ON public.user_reading_progress
  FOR DELETE USING (auth.uid() = user_id);

-- User bookmarks policies
-- Users can only access their own bookmarks
CREATE POLICY "Users can view their own bookmarks" ON public.user_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON public.user_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" ON public.user_bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON public.user_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- User annotations policies
-- Users can only access their own annotations
CREATE POLICY "Users can view their own annotations" ON public.user_annotations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own annotations" ON public.user_annotations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own annotations" ON public.user_annotations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own annotations" ON public.user_annotations
  FOR DELETE USING (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_ebooks_updated_at BEFORE UPDATE ON public.ebooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_reading_progress_updated_at BEFORE UPDATE ON public.user_reading_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_bookmarks_updated_at BEFORE UPDATE ON public.user_bookmarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_annotations_updated_at BEFORE UPDATE ON public.user_annotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO public.ebooks (title, author, description, epub_file_url, category, is_dominican, tags) VALUES
('Summa Theologica', 'St. Thomas Aquinas', 'The masterwork of St. Thomas Aquinas, a comprehensive theological treatise.', '/books/summa-theologica.epub', 'theology', TRUE, ARRAY['theology', 'philosophy', 'scholasticism', 'dominican']),
('The Divine Comedy', 'Dante Alighieri', 'Dante''s epic poem describing his journey through Hell, Purgatory, and Paradise.', '/books/divine-comedy.epub', 'spirituality', FALSE, ARRAY['poetry', 'medieval', 'spirituality', 'allegory']),
('Confessions', 'St. Augustine', 'St. Augustine''s autobiographical work and theological masterpiece.', '/books/confessions.epub', 'spirituality', FALSE, ARRAY['autobiography', 'theology', 'patristic', 'conversion']),
('The Imitation of Christ', 'Thomas à Kempis', 'A classic devotional book on Christian spirituality.', '/books/imitation-of-christ.epub', 'spirituality', FALSE, ARRAY['devotional', 'spirituality', 'meditation', 'christian']);