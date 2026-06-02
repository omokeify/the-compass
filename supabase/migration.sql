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
DROP POLICY IF EXISTS "Profiles are public" ON public.profiles;
CREATE POLICY "Profiles are public"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Posts: readable by all, insertable by authenticated users
DROP POLICY IF EXISTS "Posts are public" ON public.posts;
CREATE POLICY "Posts are public"
  ON public.posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authors can update own posts" ON public.posts;
CREATE POLICY "Authors can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;
CREATE POLICY "Authors can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = author_id);

-- Comments: readable by all, insertable by authenticated users
DROP POLICY IF EXISTS "Comments are public" ON public.comments;
CREATE POLICY "Comments are public"
  ON public.comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can comment" ON public.comments;
CREATE POLICY "Authenticated users can comment"
  ON public.comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authors can delete own comments" ON public.comments;
CREATE POLICY "Authors can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = author_id);

-- Reactions: readable by all, manageable by owner
DROP POLICY IF EXISTS "Reactions are public" ON public.reactions;
CREATE POLICY "Reactions are public"
  ON public.reactions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage own reactions" ON public.reactions;
CREATE POLICY "Users can manage own reactions"
  ON public.reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reactions" ON public.reactions;
CREATE POLICY "Users can delete own reactions"
  ON public.reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Follows: readable by all, manageable by follower
DROP POLICY IF EXISTS "Follows are public" ON public.follows;
CREATE POLICY "Follows are public"
  ON public.follows FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage own follows" ON public.follows;
CREATE POLICY "Users can manage own follows"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
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

-- 9. Conferences / Classes
CREATE TABLE IF NOT EXISTS public.conferences (
  id TEXT PRIMARY KEY,
  host TEXT NOT NULL,
  host_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  cat TEXT DEFAULT 'training',
  cohosts JSONB DEFAULT '[]'::jsonb,
  stage JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'scheduled',
  when_text TEXT DEFAULT '',
  scheduled_iso TIMESTAMPTZ,
  duration_min INTEGER DEFAULT 60,
  capacity INTEGER DEFAULT 150,
  registered INTEGER DEFAULT 0,
  registrants JSONB DEFAULT '[]'::jsonb,
  attendees JSONB DEFAULT '[]'::jsonb,
  recorded BOOLEAN DEFAULT true,
  publish_events BOOLEAN DEFAULT true,
  notify BOOLEAN DEFAULT true,
  cover INTEGER DEFAULT 215,
  attended INTEGER DEFAULT 0,
  chat JSONB DEFAULT '[]'::jsonb,
  board_strokes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.conferences ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.conferences ADD COLUMN IF NOT EXISTS host_id UUID;

DROP POLICY IF EXISTS "Conferences are public" ON public.conferences;
CREATE POLICY "Conferences are public"
  ON public.conferences FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create conferences" ON public.conferences;
CREATE POLICY "Authenticated users can create conferences"
  ON public.conferences FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Hosts can update own conferences" ON public.conferences;
CREATE POLICY "Hosts can update own conferences"
  ON public.conferences FOR UPDATE
  USING (auth.role() = 'authenticated' AND host_id = auth.uid());

DROP POLICY IF EXISTS "Hosts can delete own conferences" ON public.conferences;
CREATE POLICY "Hosts can delete own conferences"
  ON public.conferences FOR DELETE
  USING (auth.role() = 'authenticated' AND host_id = auth.uid());

-- 10. Spaces (live audio rooms)
CREATE TABLE IF NOT EXISTS public.spaces (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  host TEXT NOT NULL,
  cohosts JSONB DEFAULT '[]'::jsonb,
  speakers JSONB DEFAULT '[]'::jsonb,
  listeners INTEGER DEFAULT 0,
  status TEXT DEFAULT 'live',
  when_text TEXT DEFAULT '',
  scheduled_iso TIMESTAMPTZ,
  cover INTEGER DEFAULT 215,
  reminder_handles JSONB DEFAULT '[]'::jsonb,
  reminders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS host_id UUID;
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS reminder_handles JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS reminders INTEGER DEFAULT 0;

CREATE OR REPLACE FUNCTION public.set_host_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.host_id IS NULL THEN
    NEW.host_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_host_id_spaces ON public.spaces;
CREATE TRIGGER set_host_id_spaces BEFORE INSERT ON public.spaces FOR EACH ROW EXECUTE FUNCTION public.set_host_id();

DROP TRIGGER IF EXISTS set_host_id_conferences ON public.conferences;
CREATE TRIGGER set_host_id_conferences BEFORE INSERT ON public.conferences FOR EACH ROW EXECUTE FUNCTION public.set_host_id();

DROP POLICY IF EXISTS "Spaces are public" ON public.spaces;
CREATE POLICY "Spaces are public"
  ON public.spaces FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create spaces" ON public.spaces;
CREATE POLICY "Authenticated users can create spaces"
  ON public.spaces FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Hosts can update own spaces" ON public.spaces;
CREATE POLICY "Hosts can update own spaces"
  ON public.spaces FOR UPDATE
  USING (auth.role() = 'authenticated' AND host = auth.uid()::TEXT);

DROP POLICY IF EXISTS "Hosts can delete own spaces" ON public.spaces;
CREATE POLICY "Hosts can delete own spaces"
  ON public.spaces FOR DELETE
  USING (auth.role() = 'authenticated' AND host = auth.uid()::TEXT);

-- 11. Conversations / DMs
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_message TEXT DEFAULT '',
  last_when TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.conversation_participant_ids()
RETURNS SETOF UUID AS $$
  SELECT jsonb_array_elements_text(participants)::UUID;
$$ LANGUAGE sql STABLE;

DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
CREATE POLICY "Participants can view conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid()::TEXT = ANY (SELECT jsonb_array_elements_text(participants)));

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;
CREATE POLICY "Participants can update conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid()::TEXT = ANY (SELECT jsonb_array_elements_text(participants)));

DROP POLICY IF EXISTS "Participants can delete conversations" ON public.conversations;
CREATE POLICY "Participants can delete conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid()::TEXT = ANY (SELECT jsonb_array_elements_text(participants)));

-- 12. Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_handle TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND auth.uid()::TEXT = ANY (SELECT jsonb_array_elements_text(c.participants))
    )
  );

DROP POLICY IF EXISTS "Authenticated senders can insert messages" ON public.messages;
CREATE POLICY "Authenticated senders can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND sender_id = auth.uid());

DROP POLICY IF EXISTS "Senders can update own messages" ON public.messages;
CREATE POLICY "Senders can update own messages"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid());

DROP POLICY IF EXISTS "Senders can delete own messages" ON public.messages;
CREATE POLICY "Senders can delete own messages"
  ON public.messages FOR DELETE
  USING (sender_id = auth.uid());
