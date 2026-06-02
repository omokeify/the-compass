// Supabase client — direct REST calls, no SDK dependency
const SUPABASE_URL = 'https://eshcfbocdobjgcwcktik.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzaGNmYm9jZG9iamdjd2NrdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MTgwODIsImV4cCI6MjA5MDQ5NDA4Mn0.ZIaUQQq-c6CXsScxe5Lne4z6s7fEG_cCVO10hsu51z4';

const SESSION_KEY = 'compass_sb_session';

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setSession(session) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch {}
}

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

function authHeaders() {
  const session = getSession();
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

const supabaseService = {
  // ===== Auth =====
  async signUp({ email, password, fullname, handle }) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        email,
        password,
        data: { fullname, handle },
      }),
    });
    const data = await res.json();
    if (res.ok) {
      // Auto-create profile row is handled by the DB trigger
      if (data.access_token) setSession(data);
      return { user: data.user, session: data };
    }
    throw new Error(data.msg || data.error_description || 'Signup failed');
  },

  async signIn({ email, password }) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setSession(data);
      return { user: data.user, session: data };
    }
    throw new Error(data.msg || data.error_description || 'Sign in failed');
  },

  async signOut() {
    const session = getSession();
    if (session?.access_token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: authHeaders(),
      });
    }
    clearSession();
  },

  async getUser() {
    const session = getSession();
    if (!session?.access_token) return null;
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: authHeaders(),
    });
    if (!res.ok) { clearSession(); return null; }
    const user = await res.json();
    return user;
  },

  getSession,

  // ===== Profile =====
  async getProfile(userId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, {
      headers: authHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0] || null;
  },

  async updateProfile(userId, updates) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    return res.ok;
  },

  // ===== Posts =====
  async createPost({ title, body, type, cat, media }) {
    const session = getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        author_id: session.user.id,
        title,
        body: body || '',
        type: type || 'Signal',
        cat: cat || 'news',
        media: media || null,
      }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to create post'); }
    return res.json();
  },

  async getPosts({ authorId, cat, type, following, sort } = {}) {
    let url = `${SUPABASE_URL}/rest/v1/feed_view?select=*`;

    const params = [];
    if (authorId) params.push(`author_id=eq.${authorId}`);
    if (cat) params.push(`cat=eq.${cat}`);
    if (type) params.push(`type=eq.${type}`);
    if (sort === 'hot') {
      params.push('order=like_count.desc');
    } else {
      params.push('order=created_at.desc');
    }

    if (params.length) url += '&' + params.join('&');

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async deletePost(postId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.ok;
  },

  // ===== Comments =====
  async addComment({ postId, body }) {
    const session = getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        post_id: postId,
        author_id: session.user.id,
        body,
      }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to add comment'); }
    return res.json();
  },

  async getComments(postId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/comments?post_id=eq.${postId}&order=created_at.asc&select=*,author_id(id,fullname,handle,avatar,hue,tier)`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  // ===== Reactions =====
  async toggleReaction({ postId, type }) {
    const session = getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    // Check if reaction exists
    const check = await fetch(`${SUPABASE_URL}/rest/v1/reactions?user_id=eq.${session.user.id}&post_id=eq.${postId}&type=eq.${type}`, {
      headers: authHeaders(),
    });
    const existing = await check.json();
    if (existing?.length > 0) {
      // Remove reaction
      const res = await fetch(`${SUPABASE_URL}/rest/v1/reactions?id=eq.${existing[0].id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      return { active: false };
    } else {
      // Add reaction
      const res = await fetch(`${SUPABASE_URL}/rest/v1/reactions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          user_id: session.user.id,
          post_id: postId,
          type,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to react'); }
      return { active: true };
    }
  },

  async getUserReactions(userId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reactions?user_id=eq.${userId}&select=post_id,type`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  // ===== Follows =====
  async toggleFollow(targetUserId) {
    const session = getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    const check = await fetch(`${SUPABASE_URL}/rest/v1/follows?follower_id=eq.${session.user.id}&following_id=eq.${targetUserId}`, {
      headers: authHeaders(),
    });
    const existing = await check.json();
    if (existing?.length > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/follows?id=eq.${existing[0].id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      return { active: false };
    } else {
      await fetch(`${SUPABASE_URL}/rest/v1/follows`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          follower_id: session.user.id,
          following_id: targetUserId,
        }),
      });
      return { active: true };
    }
  },

  async getFollowing(userId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/follows?follower_id=eq.${userId}&select=following_id`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async getFollowers(userId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/follows?following_id=eq.${userId}&select=follower_id`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  // ===== Conferences =====
  async listConferences() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/conferences?order=created_at.desc`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async getConference(id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/conferences?id=eq.${id}&select=*`, { headers: authHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0] || null;
  },

  async createConference(cls) {
    const session = getSession();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/conferences`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        id: cls.id,
        host_id: session?.user?.id || null,
        host: cls.host,
        title: cls.title,
        description: cls.desc || '',
        cat: cls.cat || 'training',
        cohosts: JSON.stringify(cls.cohosts || []),
        stage: JSON.stringify(cls.stage || []),
        status: cls.status || 'scheduled',
        when_text: cls.when || '',
        scheduled_iso: cls.scheduledISO || null,
        duration_min: cls.durationMin || 60,
        capacity: cls.capacity || 150,
        registered: cls.registered || 0,
        registrants: JSON.stringify(cls.registrants || []),
        attendees: JSON.stringify(cls.attendees || []),
        recorded: cls.recorded ?? true,
        publish_events: cls.publishEvents ?? true,
        notify: cls.notify ?? true,
        cover: cls.cover || 215,
        attended: cls.attended || 0,
        chat: JSON.stringify(cls.chat || []),
        board_strokes: JSON.stringify(cls.boardStrokes || []),
      }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to create conference'); }
    return res.json();
  },

  async updateConference(id, changes) {
    const body = {};
    if (changes.status !== undefined) body.status = changes.status;
    if (changes.registered !== undefined) body.registered = changes.registered;
    if (changes.registrants !== undefined) body.registrants = JSON.stringify(changes.registrants);
    if (changes.attendees !== undefined) body.attendees = JSON.stringify(changes.attendees);
    if (changes.attended !== undefined) body.attended = changes.attended;
    if (changes.stage !== undefined) body.stage = JSON.stringify(changes.stage);
    if (changes.chat !== undefined) body.chat = JSON.stringify(changes.chat);
    if (changes.board_strokes !== undefined) body.board_strokes = JSON.stringify(changes.board_strokes);
    if (changes.cohosts !== undefined) body.cohosts = JSON.stringify(changes.cohosts);
    if (changes.title !== undefined) body.title = changes.title;
    if (changes.description !== undefined) body.description = changes.description;
    if (changes.cat !== undefined) body.cat = changes.cat;
    if (changes.when !== undefined) body.when_text = changes.when;
    if (changes.cover !== undefined) body.cover = changes.cover;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/conferences?id=eq.${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    return res.ok;
  },

  async deleteConference(id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/conferences?id=eq.${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.ok;
  },

  // ===== Spaces =====
  async listSpaces() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/spaces?order=created_at.desc`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async getSpace(id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/spaces?id=eq.${id}&select=*`, { headers: authHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0] || null;
  },

  async createSpace(space) {
    const session = getSession();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/spaces`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        id: space.id,
        host_id: session?.user?.id || null,
        host: space.host,
        title: space.title,
        description: space.topic || space.desc || '',
        cohosts: JSON.stringify(Array.isArray(space.cohosts) ? space.cohosts : []),
        speakers: JSON.stringify(
          typeof space.speakers === 'number'
            ? Array.from({ length: space.speakers }, () => space.host)
            : Array.isArray(space.speakers) ? space.speakers : []
        ),
        listeners: Number(space.listeners) || 0,
        status: space.status || 'live',
        when_text: space.scheduled || space.when || '',
        scheduled_iso: space.scheduledISO || null,
        cover: space.cover || 215,
      }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to create space'); }
    return res.json();
  },

  async updateSpace(id, changes) {
    const body = {};
    if (changes.status !== undefined) body.status = changes.status;
    if (changes.listeners !== undefined) body.listeners = Number(changes.listeners);
    if (changes.cohosts !== undefined) body.cohosts = JSON.stringify(changes.cohosts);
    if (changes.speakers !== undefined) body.speakers = JSON.stringify(changes.speakers);
    if (changes.title !== undefined) body.title = changes.title;
    if (changes.description !== undefined) body.description = changes.description;
    if (changes.when_text !== undefined) body.when_text = changes.when_text;
    if (changes.scheduled_iso !== undefined) body.scheduled_iso = changes.scheduled_iso;
    if (changes.reminder_handles !== undefined) body.reminder_handles = JSON.stringify(changes.reminder_handles);
    if (changes.reminders !== undefined) body.reminders = Number(changes.reminders);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/spaces?id=eq.${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    return res.ok;
  },

  async deleteSpace(id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/spaces?id=eq.${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.ok;
  },
};

Object.assign(window, { supabaseService });
