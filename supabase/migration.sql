-- Compass Supabase Schema
-- Run this in your Supabase SQL Editor

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles (extends auth.users)
-- The table already exists; add missing columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS handle TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS avatar TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS hue INTEGER DEFAULT 215,
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS loc TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Explorer',
  ADD COLUMN IF NOT EXISTS kp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS role TEXT;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, fullname, handle, email, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'fullname', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'handle', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email,
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
  tags TEXT[] DEFAULT '{}',
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

-- 8.5 Add tags column to existing posts (if not present)
ALTER TABLE IF EXISTS public.posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 8.6 Add banner column to profiles for cover images
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS banner TEXT DEFAULT '';

-- 8.6 Trending tags RPC
CREATE OR REPLACE FUNCTION public.get_trending_tags(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(tag TEXT, count BIGINT)
LANGUAGE SQL STABLE
AS $$
  SELECT unnest(tags) AS tag, COUNT(*)::BIGINT AS count
  FROM public.posts
  WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
  GROUP BY tag
  ORDER BY count DESC
  LIMIT limit_count;
$$;

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
  USING (auth.role() = 'authenticated' AND host_id = auth.uid());

DROP POLICY IF EXISTS "Hosts can delete own spaces" ON public.spaces;
CREATE POLICY "Hosts can delete own spaces"
  ON public.spaces FOR DELETE
  USING (auth.role() = 'authenticated' AND host_id = auth.uid());

-- 11. Conversations / DMs
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  participant_ids UUID[] DEFAULT '{}',
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_message TEXT DEFAULT '',
  last_when TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
CREATE POLICY "Participants can view conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = ANY (participant_ids));

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;
CREATE POLICY "Participants can update conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = ANY (participant_ids));

DROP POLICY IF EXISTS "Participants can delete conversations" ON public.conversations;
CREATE POLICY "Participants can delete conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = ANY (participant_ids));

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

-- =============================================================
-- 5. Talent gigs
-- =============================================================
CREATE TABLE IF NOT EXISTS public.talent_gigs (
  id TEXT PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  skill TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  bio TEXT DEFAULT '',
  tags JSONB DEFAULT '[]',
  rating NUMERIC DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  projects INTEGER DEFAULT 0,
  success_rate INTEGER DEFAULT 0,
  price NUMERIC DEFAULT 0,
  card_bg TEXT DEFAULT '#f5f3ff',
  bg_hue INTEGER DEFAULT 260,
  featured BOOLEAN DEFAULT false,
  top_rated BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  description TEXT DEFAULT '',
  packages JSONB DEFAULT '[]',
  review_list JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.talent_gigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved talent gigs"
  ON public.talent_gigs FOR SELECT
  USING (approved = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert own gigs"
  ON public.talent_gigs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND author_id = auth.uid());

CREATE POLICY "Authors can update own gigs, admins all"
  ON public.talent_gigs FOR UPDATE
  USING (author_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','mod')));

CREATE POLICY "Admins can delete gigs"
  ON public.talent_gigs FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','mod')));

-- =============================================================
-- 6. Quests (daily)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  quest_id TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, quest_id)
);

ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quests"
  ON public.quests FOR SELECT
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can insert own quests"
  ON public.quests FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can update own quests"
  ON public.quests FOR UPDATE
  USING (user_id = auth.uid());

-- =============================================================
-- 7. Attendance & KP log
-- =============================================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conference_id TEXT REFERENCES public.conferences(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, conference_id)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attendance"
  ON public.attendance FOR SELECT
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can insert own attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.kp_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.kp_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own kp_log"
  ON public.kp_log FOR SELECT
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can insert own kp_log"
  ON public.kp_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- =============================================================
-- 8. Notifications
-- =============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT '',
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_handle TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL DEFAULT '',
  target TEXT DEFAULT '',
  target_id TEXT DEFAULT '',
  unread BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================================
-- 8. Notifications (auto-created by DB triggers)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_handle TEXT DEFAULT '',
  text TEXT DEFAULT '',
  target TEXT DEFAULT '',
  target_id TEXT DEFAULT '',
  unread BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON public.notifications(user_id) WHERE unread = true;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Auto-create notification on follow
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  actor_handle TEXT;
BEGIN
  IF NEW.follower_id = NEW.following_id THEN RETURN NEW; END IF;
  SELECT handle INTO actor_handle FROM public.profiles WHERE id = NEW.follower_id;
  INSERT INTO public.notifications (user_id, kind, actor_id, actor_handle, text)
  VALUES (NEW.following_id, 'follow', NEW.follower_id, COALESCE(actor_handle, 'someone'), 'followed you');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_on_follow ON public.follows;
CREATE TRIGGER trg_notify_on_follow
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();

-- Auto-create notification on reaction (like)
CREATE OR REPLACE FUNCTION public.notify_on_reaction()
RETURNS TRIGGER AS $$
DECLARE
  post_author UUID;
  post_title TEXT;
  actor_handle TEXT;
BEGIN
  SELECT author_id, COALESCE(title, 'a post') INTO post_author, post_title
    FROM public.posts WHERE id = NEW.post_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  IF NEW.user_id = post_author THEN RETURN NEW; END IF;
  SELECT handle INTO actor_handle FROM public.profiles WHERE id = NEW.user_id;
  INSERT INTO public.notifications (user_id, kind, actor_id, actor_handle, text, target, target_id)
  VALUES (post_author, 'like', NEW.user_id, COALESCE(actor_handle, 'someone'), 'liked your post', post_title, NEW.post_id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_on_reaction ON public.reactions;
CREATE TRIGGER trg_notify_on_reaction
  AFTER INSERT ON public.reactions
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_reaction();

-- Auto-create notification on comment (reply)
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author UUID;
  post_title TEXT;
  actor_handle TEXT;
BEGIN
  SELECT author_id, COALESCE(title, 'a post') INTO post_author, post_title
    FROM public.posts WHERE id = NEW.post_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  IF NEW.author_id = post_author THEN RETURN NEW; END IF;
  SELECT handle INTO actor_handle FROM public.profiles WHERE id = NEW.author_id;
  INSERT INTO public.notifications (user_id, kind, actor_id, actor_handle, text, target, target_id)
  VALUES (post_author, 'reply', NEW.author_id, COALESCE(actor_handle, 'someone'), 'replied to your post', post_title, NEW.post_id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_on_comment ON public.comments;
CREATE TRIGGER trg_notify_on_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- Auto-create notification on new message
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS TRIGGER AS $$
DECLARE
  conv_participants JSONB;
  participant UUID;
  actor_handle TEXT;
BEGIN
  SELECT participants INTO conv_participants FROM public.conversations WHERE id = NEW.conversation_id;
  IF conv_participants IS NULL THEN RETURN NEW; END IF;
  SELECT handle INTO actor_handle FROM public.profiles WHERE id = NEW.sender_id;
  FOR participant IN SELECT jsonb_array_elements_text(conv_participants)::UUID
  LOOP
    IF participant != NEW.sender_id THEN
      INSERT INTO public.notifications (user_id, kind, actor_id, actor_handle, text)
      VALUES (participant, 'message', NEW.sender_id, COALESCE(actor_handle, 'someone'), 'sent you a message');
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_on_message ON public.messages;
CREATE TRIGGER trg_notify_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();

-- =============================================================
-- 9. Solved / Answer system
-- =============================================================
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS solved_comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL;

-- =============================================================
-- 10. Flags / Moderation
-- =============================================================
CREATE TABLE IF NOT EXISTS public.flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create flags" ON public.flags;
CREATE POLICY "Users can create flags"
  ON public.flags FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Mods can view all flags" ON public.flags;
CREATE POLICY "Mods can view all flags"
  ON public.flags FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'mod')));

DROP POLICY IF EXISTS "Mods can update flags" ON public.flags;
CREATE POLICY "Mods can update flags"
  ON public.flags FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'mod')));

-- =============================================================
-- 11. Post revision history
-- =============================================================
CREATE TABLE IF NOT EXISTS public.post_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  edited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.post_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view post versions" ON public.post_versions;
CREATE POLICY "Anyone can view post versions"
  ON public.post_versions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert post versions" ON public.post_versions;
CREATE POLICY "Authenticated users can insert post versions"
  ON public.post_versions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_post_versions_post ON public.post_versions(post_id, version DESC);

-- =============================================================
-- 12. Additions for new features
-- =============================================================

-- Locked column on posts (null = unlocked, number = min level to reply)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS locked INT DEFAULT NULL;

-- Suspension on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ DEFAULT NULL;

-- Allow mods/admins to update any post
DROP POLICY IF EXISTS "Authors can update own posts" ON public.posts;
CREATE POLICY "Authors can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','mod')));

-- Allow mods/admins to update profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','mod')));

-- Allow mods/admins to delete any post
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;
CREATE POLICY "Authors can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','mod')));

-- Polls
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE UNIQUE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  closes TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Polls are public" ON public.polls;
CREATE POLICY "Polls are public"
  ON public.polls FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create polls" ON public.polls;
CREATE POLICY "Authenticated users can create polls"
  ON public.polls FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authors can update own polls" ON public.polls;
CREATE POLICY "Authors can update own polls"
  ON public.polls FOR UPDATE
  USING (auth.uid() = (SELECT author_id FROM public.posts WHERE id = post_id) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','mod')));

-- Poll votes
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Poll votes are public" ON public.poll_votes;
CREATE POLICY "Poll votes are public"
  ON public.poll_votes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote" ON public.poll_votes;
CREATE POLICY "Authenticated users can vote"
  ON public.poll_votes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Badges
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  label TEXT NOT NULL,
  icon TEXT DEFAULT 'medal',
  awarded_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Badges are public" ON public.badges;
CREATE POLICY "Badges are public"
  ON public.badges FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can earn badges" ON public.badges;
CREATE POLICY "Authenticated users can earn badges"
  ON public.badges FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
