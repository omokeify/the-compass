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
};

Object.assign(window, { supabaseService });
