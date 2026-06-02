-- Compass Supabase Schema
-- Run this in your Supabase SQL Editor

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles (extends auth.users)
-- The table already exists; add missing columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS handle TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS avatar TEXT,
  ADD COLUMN IF NOT EXISTS hue INTEGER DEFAULT 215,
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS loc TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Cadet',
  ADD COLUMN IF NOT EXISTS kp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS role TEXT;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, fullname, handle, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'fullname', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'handle', 'user_' || substr(NEW.id::text, 1, 8)),
    ''
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Posts
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  type TEXT DEFAULT 'Signal',
  cat TEXT DEFAULT 'news',
  media JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Comments
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Reactions (likes, bookmarks, reposts)
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'bookmark', 'repost')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id, type)
);

-- 6. Follows
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- 7. Enable Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Profiles: public profiles are readable by anyone, only owner can update
CREATE POLICY "Profiles are public"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Posts: readable by all, insertable by authenticated users
CREATE POLICY "Posts are public"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authors can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = author_id);

-- Comments: readable by all, insertable by authenticated users
CREATE POLICY "Comments are public"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON public.comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authors can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = author_id);

-- Reactions: readable by all, manageable by owner
CREATE POLICY "Reactions are public"
  ON public.reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own reactions"
  ON public.reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON public.reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Follows: readable by all, manageable by follower
CREATE POLICY "Follows are public"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own follows"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- 8. Helper: get feed with profile data
CREATE OR REPLACE VIEW public.feed_view AS
SELECT
  p.*,
  pr.fullname AS author_name,
  pr.handle AS author_handle,
  pr.avatar AS author_avatar,
  pr.hue AS author_hue,
  pr.tier AS author_tier,
  COALESCE(l.like_count, 0) AS like_count,
  COALESCE(c.comment_count, 0) AS comment_count,
  COALESCE(r.repost_count, 0) AS repost_count
FROM public.posts p
LEFT JOIN public.profiles pr ON p.author_id = pr.id
LEFT JOIN (SELECT post_id, COUNT(*) AS like_count FROM public.reactions WHERE type = 'like' GROUP BY post_id) l ON p.id = l.post_id
LEFT JOIN (SELECT post_id, COUNT(*) AS comment_count FROM public.comments GROUP BY post_id) c ON p.id = c.post_id
LEFT JOIN (SELECT post_id, COUNT(*) AS repost_count FROM public.reactions WHERE type = 'repost' GROUP BY post_id) r ON p.id = r.post_id
ORDER BY p.created_at DESC;
