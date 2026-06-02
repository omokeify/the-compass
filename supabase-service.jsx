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
    if (isTokenExpired(session.access_token)) {
      ensureValidToken();
    }
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

function decodeToken(token) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

function isTokenExpired(token) {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

let _refreshInProgress = null;

async function ensureValidToken() {
  const session = getSession();
  if (!session?.access_token || !session?.refresh_token) return false;
  if (!isTokenExpired(session.access_token)) return true;
  if (_refreshInProgress) return _refreshInProgress;
  _refreshInProgress = (async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
      if (!res.ok) { clearSession(); return false; }
      const newSession = await res.json();
      setSession(newSession);
      return true;
    } catch { clearSession(); return false; }
    finally { _refreshInProgress = null; }
  })();
  return _refreshInProgress;
}

function extractHashtags(text) {
  if (!text) return [];
  const matches = text.match(/#(\w+)/g);
  if (!matches) return [];
  return [...new Set(matches.map(t => t.slice(1).toLowerCase()))];
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
      if (data.access_token) {
        setSession(data);
        return { user: data.user, session: data, needsConfirm: false };
      }
      return { user: data.user, session: null, needsConfirm: true };
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

  signInWithOAuth(provider) {
    const redirectTo = encodeURIComponent(window.location.origin + '/auth/callback');
    window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectTo}`;
  },

  handleAuthCallback() {
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) return null;
    const params = new URLSearchParams(hash.replace('#', ''));
    const session = {
      access_token: params.get('access_token'),
      refresh_token: params.get('refresh_token'),
      expires_in: params.get('expires_in'),
      provider_token: params.get('provider_token'),
      user: null,
    };
    if (session.access_token) {
      setSession(session);
      window.location.hash = '';
      return session;
    }
    return null;
  },

  // ===== Profile =====
  async getProfile(userId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      headers: { 'apikey': SUPABASE_ANON_KEY },
    });
    const data = await res.json();
    return data?.[0] || null;
  },

  async getProfileByHandle(handle) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?handle=eq.${encodeURIComponent(handle)}&select=*`, {
      headers: { 'apikey': SUPABASE_ANON_KEY },
    });
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

  async checkHandle(handle) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?handle=eq.${encodeURIComponent(handle)}&select=handle`, {
        headers: { 'apikey': SUPABASE_ANON_KEY },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.length > 0 ? data[0] : null;
    } catch { return null; }
  },

  async getTopMembers(limit = 5) {
    const url = `${SUPABASE_URL}/rest/v1/profiles?select=id,handle,fullname,avatar,hue,kp,tier&order=kp.desc&limit=${limit}`;
    const res = await fetch(url, { headers: { 'apikey': SUPABASE_ANON_KEY } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(p => ({ ...p, name: p.fullname }));
  },

  async listMembers() {
    const url = `${SUPABASE_URL}/rest/v1/profiles?select=id,handle,fullname,avatar,hue,kp,tier,role,loc,region,sectors,online,photo&order=fullname.asc`;
    const res = await fetch(url, { headers: { 'apikey': SUPABASE_ANON_KEY } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(p => ({ ...p, name: p.fullname, isMe: false }));
  },

  async getSuggestedUsers(excludeHandle) {
    const url = `${SUPABASE_URL}/rest/v1/profiles?select=id,handle,fullname,avatar,hue,kp,tier&handle=neq.${encodeURIComponent(excludeHandle || '')}&order=kp.desc&limit=5`;
    const res = await fetch(url, { headers: { 'apikey': SUPABASE_ANON_KEY } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(p => ({ ...p, name: p.fullname }));
  },

  async getTrendingTags(limit = 10) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_trending_tags`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit_count: limit }),
    });
    if (!res.ok) return [];
    return res.json();
  },

  // ===== Posts =====
  async createPost({ title, body, type, cat, media }) {
    const session = getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    const tags = extractHashtags(body || '');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        author_id: session.user.id,
        title,
        body: body || '',
        tags,
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

  async updatePost(postId, changes) {
    const session = getSession();
    // Save current version before updating
    if (changes.title !== undefined || changes.body !== undefined) {
      const current = await this.getPost(postId);
      if (current) {
        const verRes = await fetch(`${SUPABASE_URL}/rest/v1/post_versions?post_id=eq.${postId}&select=version&order=version.desc&limit=1`, { headers: authHeaders() });
        const verData = verRes.ok ? await verRes.json() : [];
        const nextVer = (verData?.[0]?.version || 0) + 1;
        await fetch(`${SUPABASE_URL}/rest/v1/post_versions`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            post_id: postId,
            title: current.title || '',
            body: current.body || '',
            edited_by: session?.user?.id,
            version: nextVer,
          }),
        });
      }
    }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(changes),
    });
    return res.ok;
  },

  async getPost(postId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}&select=*`, { headers: authHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0] || null;
  },

  async getPostVersions(postId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/post_versions?post_id=eq.${postId}&order=version.desc`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async setSolvedComment(postId, commentId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ solved_comment_id: commentId || null }),
    });
    return res.ok;
  },

  async createFlag(targetType, targetId, reason) {
    const session = getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/flags`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        user_id: session.user.id,
        target_type: targetType,
        target_id: String(targetId),
        reason,
      }),
    });
    return res.ok;
  },

  async getFlags(status = 'open') {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/flags?status=eq.${status}&order=created_at.desc`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async resolveFlag(flagId, resolved = true) {
    const session = getSession();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/flags?id=eq.${flagId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({
        status: resolved ? 'resolved' : 'dismissed',
        resolved_at: new Date().toISOString(),
        resolved_by: session?.user?.id,
      }),
    });
    return res.ok;
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
    try { return await res.json(); } catch { return []; }
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
    if (!res.ok) {
      let msg = 'Failed to create space';
      try { const e = await res.json(); msg = e.message || msg; } catch {}
      throw new Error(msg);
    }
    try { return await res.json(); } catch { return { id: space.id }; }
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

  // ===== Realtime subscriptions (WebSocket) =====
  _realtimeChannels: new Map(),

  subscribeRealtime({ type, eventName, onInsert, onUpdate, onDelete }) {
    const key = `${type}_${eventName || 'all'}`;
    if (this._realtimeChannels.has(key)) return this._realtimeChannels.get(key);

    let ws;
    let timer;
    let active = true;
    const session = getSession();
    const token = session?.access_token;
    if (!token) return null;

    try {
      ws = new WebSocket(`${SUPABASE_URL.replace('https://', 'wss://')}/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&Authorization=Bearer+${encodeURIComponent(token)}`);
    } catch {
      return null;
    }

    const unsub = () => {
      active = false;
      clearTimeout(timer);
      try { ws.close(); } catch {}
      this._realtimeChannels.delete(key);
    };

    const callbacks = {};

    ws.onopen = () => {
      const topic = `realtime:${type}`;
      ws.send(JSON.stringify({
        topic,
        event: 'phx_join',
        payload: {},
        ref: '1',
      }));

      timer = setInterval(() => {
        if (!active) return;
        try {
          ws.send(JSON.stringify({ topic, event: 'heartbeat', payload: {}, ref: String(Date.now()) }));
        } catch {}
      }, 25000);
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        const payload = data.payload || {};
        const row = payload.record || payload.new || payload.old;
        if (!row) return;

        const event = (data.event || '').toLowerCase();
        if (event === 'insert' && onInsert) onInsert(row);
        else if (event === 'update' && onUpdate) onUpdate(row);
        else if (event === 'delete' && onDelete) onDelete(row);
      } catch {}
    };

    const channel = { unsub, on: (opts) => { return channel; } };
    this._realtimeChannels.set(key, channel);
    return channel;
  },

  // ===== Messaging / DMs =====
  async listConversations() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/conversations?order=last_when.desc`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async getConversation(id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/conversations?id=eq.${id}&select=*`, { headers: authHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0] || null;
  },

  async createConversation({ participants }) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/conversations`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ id: 'convo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), participants: participants || [] }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to create conversation'); }
    return res.json();
  },

  async listMessages({ conversationId }) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/messages?conversation_id=eq.${encodeURIComponent(conversationId)}&order=created_at.asc`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async sendMessage({ conversationId, body }) {
    const session = getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        conversation_id: conversationId,
        sender_id: session.user.id,
        sender_handle: session.user.user_metadata?.handle || session.user.email || 'user',
        body,
      }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to send message'); }
    await this.updateConversationLastMessage(conversationId, body);
    return res.json();
  },

  async updateConversationLastMessage(conversationId, text) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/conversations?id=eq.${encodeURIComponent(conversationId)}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ last_message: text, last_when: new Date().toISOString() }),
    });
    return res.ok;
  },

  // ===== Talent Gigs =====
  async listTalents() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/talent_gigs?select=*&order=created_at.desc`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async getTalent(id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/talent_gigs?id=eq.${encodeURIComponent(id)}&select=*`, { headers: authHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0] || null;
  },

  async createTalent(data) {
    const session = getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/talent_gigs`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        id: data.id || 't-' + Date.now().toString(36),
        author_id: session.user.id,
        author: data.author || session.user.user_metadata?.handle || 'user',
        skill: data.skill || '',
        role: data.role || '',
        title: data.title,
        bio: data.bio || '',
        tags: data.tags || [],
        rating: data.rating || 0,
        reviews: data.reviews || 0,
        projects: data.projects || 0,
        success_rate: data.successRate || 0,
        price: data.price || 0,
        card_bg: data.cardBg || '#f5f3ff',
        bg_hue: data.bgHue || 260,
        featured: data.featured || false,
        top_rated: data.topRated || false,
        approved: data.approved !== false,
        description: data.description || '',
        packages: data.packages || [],
        review_list: data.reviewList || [],
      }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to create gig'); }
    return res.json();
  },

  async updateTalent(id, changes) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/talent_gigs?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(changes),
    });
    return res.ok;
  },

  async deleteTalent(id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/talent_gigs?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.ok;
  },

  async setTalentFeatured(id, featured) {
    return this.updateTalent(id, { featured });
  },

  // ===== Quests =====
  async getQuests(date) {
    const session = getSession();
    if (!session?.user?.id) return [];
    const dateStr = date || new Date().toISOString().slice(0, 10);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/quests?user_id=eq.${session.user.id}&date=eq.${dateStr}&select=*`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async completeQuest(questId, date) {
    const session = getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    const dateStr = date || new Date().toISOString().slice(0, 10);
    const existing = await this.getQuests(dateStr);
    const found = existing.find(q => q.quest_id === questId);
    if (found) {
      await fetch(`${SUPABASE_URL}/rest/v1/quests?id=eq.${found.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ done: true }),
      });
    } else {
      await fetch(`${SUPABASE_URL}/rest/v1/quests`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ user_id: session.user.id, date: dateStr, quest_id: questId, done: true }),
      });
    }
    return true;
  },

  async resetQuests(date) {
    const session = getSession();
    if (!session?.user?.id) return;
    const dateStr = date || new Date().toISOString().slice(0, 10);
    await fetch(`${SUPABASE_URL}/rest/v1/quests?user_id=eq.${session.user.id}&date=eq.${dateStr}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
  },

  // ===== Attendance & KP =====
  async recordAttendance(conferenceId) {
    const session = getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    const check = await fetch(`${SUPABASE_URL}/rest/v1/attendance?user_id=eq.${session.user.id}&conference_id=eq.${encodeURIComponent(conferenceId)}`, { headers: authHeaders() });
    const existing = await check.json();
    if (existing?.length > 0) return { recorded: false, kp: 0 };
    await fetch(`${SUPABASE_URL}/rest/v1/attendance`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ user_id: session.user.id, conference_id: conferenceId }),
    });
    const kpAmount = 50;
    await fetch(`${SUPABASE_URL}/rest/v1/kp_log`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ user_id: session.user.id, amount: kpAmount, source: 'attendance', source_id: conferenceId, description: 'Class attendance' }),
    });
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}&select=kp`, { headers: authHeaders() });
    const profile = await profileRes.json();
    const currentKp = profile?.[0]?.kp || 0;
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ kp: currentKp + kpAmount }),
    });
    return { recorded: true, kp: kpAmount };
  },

  async awardKp(amount, source, sourceId, description) {
    const session = getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    await fetch(`${SUPABASE_URL}/rest/v1/kp_log`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ user_id: session.user.id, amount, source, source_id: sourceId || '', description: description || '' }),
    });
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}&select=kp`, { headers: authHeaders() });
    const profile = await profileRes.json();
    const currentKp = profile?.[0]?.kp || 0;
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ kp: currentKp + amount }),
    });
  },

  async getKpSummary() {
    const session = getSession();
    if (!session?.user?.id) return { total: 0, log: [] };
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}&select=kp`, { headers: authHeaders() });
    const profile = await profileRes.json();
    const total = profile?.[0]?.kp || 0;
    const logRes = await fetch(`${SUPABASE_URL}/rest/v1/kp_log?user_id=eq.${session.user.id}&order=created_at.desc&limit=100`, { headers: authHeaders() });
    const log = logRes.ok ? await logRes.json() : [];
    return { total, log };
  },

  async getAttendedClasses() {
    const session = getSession();
    if (!session?.user?.id) return [];
    const res = await fetch(`${SUPABASE_URL}/rest/v1/attendance?user_id=eq.${session.user.id}&select=conference_id`, { headers: authHeaders() });
    if (!res.ok) return [];
    const rows = await res.json();
    return rows.map(r => r.conference_id);
  },

  // ===== Notifications =====
  async getNotifications() {
    const session = getSession();
    if (!session?.user?.id) return [];
    const res = await fetch(`${SUPABASE_URL}/rest/v1/notifications?user_id=eq.${session.user.id}&order=created_at.desc&limit=50`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async getUnreadCount() {
    const session = getSession();
    if (!session?.user?.id) return 0;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/notifications?user_id=eq.${session.user.id}&unread=eq.true&select=id&limit=100`, { headers: authHeaders() });
    if (!res.ok) return 0;
    const data = await res.json();
    return data?.length || 0;
  },

  async markNotificationRead(id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/notifications?id=eq.${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ unread: false }),
    });
    return res.ok;
  },

  async markAllNotificationsRead() {
    const session = getSession();
    if (!session?.user?.id) return;
    await fetch(`${SUPABASE_URL}/rest/v1/notifications?user_id=eq.${session.user.id}&unread=eq.true`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ unread: false }),
    });
  },

  async createNotification(userId, kind, text, actorHandle, target, targetId) {
    const session = getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    if (!userId || userId === session.user.id) return false;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        user_id: userId,
        kind,
        actor_id: session.user.id,
        actor_handle: actorHandle || session.user.user_metadata?.handle || 'user',
        text,
        target: target || '',
        target_id: targetId || '',
      }),
    });
    return res.ok;
  },

  async getUserIdByHandle(handle) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?handle=eq.${encodeURIComponent(handle)}&select=id`, { headers: authHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0]?.id || null;
  },

  // ===== Comment editing =====
  async updateComment(commentId, body) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/comments?id=eq.${commentId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ body }),
    });
    return res.ok;
  },

  // ===== Thread locking =====
  async toggleLockPost(postId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}&select=locked`, { headers: authHeaders() });
    if (!res.ok) return false;
    const data = await res.json();
    const current = data?.[0]?.locked;
    const next = current ? null : 1;
    const upd = await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ locked: next }),
    });
    return upd.ok;
  },

  // ===== User suspension =====
  async suspendUser(userId, until) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ suspended_until: until || new Date(Date.now() + 86400000 * 7).toISOString() }),
    });
    return res.ok;
  },

  async unsuspendUser(userId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ suspended_until: null }),
    });
    return res.ok;
  },

  // ===== Search =====
  async searchPosts(query) {
    const q = encodeURIComponent(query);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/feed_view?or=(title.ilike.%25${q}%25,body.ilike.%25${q}%25)&order=created_at.desc`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  // ===== Polls =====
  async createPoll(postId, question, options) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/polls`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ post_id: postId, question, options: JSON.stringify(options.map(o => ({ text: o, votes: 0 }))) }),
    });
    return res.ok ? res.json() : null;
  },

  async getPoll(pollId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/polls?id=eq.${pollId}`, { headers: authHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0] || null;
  },

  async getPollByPost(postId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/polls?post_id=eq.${postId}`, { headers: authHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0] || null;
  },

  async votePoll(pollId, optionIndex) {
    const session = getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/poll_votes`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ poll_id: pollId, user_id: session.user.id, option_index: optionIndex }),
    });
    return res.ok;
  },

  async getPollVotes(pollId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/poll_votes?poll_id=eq.${pollId}`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  // ===== Badges =====
  async awardBadge(userId, badgeId, label, icon) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/badges`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ user_id: userId, badge_id: badgeId, label: label || badgeId, icon: icon || 'medal' }),
    });
    return res.ok;
  },

  async getBadges(userId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/badges?user_id=eq.${userId}&order=awarded_at.desc`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  },
};

Object.assign(window, { supabaseService });
