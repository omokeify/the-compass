// Spaces — live audio rooms (Twitter Spaces / X Spaces style)

const genId = () => 'space_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

const SpacesPage = ({ navigate, currentUser, onJoinSpace }) => {
  const [tab, setTab] = React.useState('all');
  const [list, setList] = React.useState(() => [...SPACES]);
  const [showCreate, setShowCreate] = React.useState(false);

  React.useEffect(() => { spaceService.list().then(setList); }, []);

  const refresh = () => spaceService.list().then(setList);

  React.useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('compass_spaces_refresh', handler);
    return () => window.removeEventListener('compass_spaces_refresh', handler);
  }, [refresh]);

  const tabs = [
    { id: 'all',       label: 'All' },
    { id: 'live',      label: 'Live',      filter: s => s.status === 'live' },
    { id: 'scheduled', label: 'Scheduled', filter: s => s.status === 'scheduled' },
    { id: 'replays',   label: 'Replays',   filter: s => s.status === 'replay' },
  ];
  const active = tabs.find(t => t.id === tab);
  const filtered = active.filter ? list.filter(active.filter) : list;
  const liveOnes = list.filter(s => s.status === 'live');

  const handleCreated = (space) => {
    setShowCreate(false);
    refresh();
    if (space.status === 'live') {
      onJoinSpace(space);
    }
  };

  const handleJoin = async (s) => {
    await spaceService.bumpListeners(s.id, 1);
    onJoinSpace(s);
  };

  return (
    <div className="view spaces-view">
      <section className="spaces-hero">
        <div>
          <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Live audio</div>
          <h1 className="th-title">Spaces.</h1>
          <p className="th-sub">
            Drop into live audio rooms hosted by builders, researchers and partners.
            Listen, raise your hand to speak, or schedule your own.
          </p>
        </div>
        <div className="th-cta">
          <button className="btn primary lg" onClick={() => setShowCreate(true)}>
            <Icon name="mic" size={14} /> Start a space
          </button>
          <button className="btn ghost lg" onClick={() => setShowCreate(true)}>
            Schedule one
          </button>
        </div>
      </section>

      <div className="spaces-tabs">
        {tabs.map(tt => (
          <button
            key={tt.id}
            className={`tf-pill ${tab === tt.id ? 'active' : ''}`}
            onClick={() => setTab(tt.id)}
          >
            {tt.label}
            {tt.id === 'live' && liveOnes.length > 0 && <span className="space-live-pip" />}
          </button>
        ))}
      </div>

      <div className="spaces-grid">
        {filtered.map(s => <SpaceCard key={s.id} space={s} currentUser={currentUser} onJoin={() => handleJoin(s)} navigate={navigate} />)}
      </div>

      {showCreate && <CreateSpaceModal currentUser={currentUser} onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
    </div>
  );
};

const SpaceCard = ({ space, currentUser, onJoin, navigate }) => {
  const host = userByHandle(space.host);
  const cohosts = space.cohosts.map(userByHandle);
  const cat = CATEGORIES.find(c => c.id === space.topic);

  return (
    <article className={`space-card status-${space.status}`}>
      <header className="sc-head">
        {space.status === 'live'      && <span className="sc-status live"><span className="space-live-pip" /> Live</span>}
        {space.status === 'scheduled' && <span className="sc-status scheduled"><Icon name="calendar" size={11} /> Scheduled</span>}
        {space.status === 'replay'    && <span className="sc-status replay"><Icon name="play" size={11} /> Replay</span>}
        {cat && <CategoryPill cat={cat} />}
      </header>

      <h3 className="sc-title">{space.title}</h3>

      <div className="sc-hosts">
        <AvatarStack handles={[space.host, ...space.cohosts]} size={28} max={4} />
        <div className="sc-hosts-body">
          <div className="sc-host-name">{host.name}</div>
          <div className="sc-host-role">{cohosts.length > 0 ? `+ ${cohosts.length} co-host${cohosts.length > 1 ? 's' : ''}` : 'hosting'}</div>
        </div>
      </div>

      <footer className="sc-foot">
        {space.status === 'live' && (
          <>
            <div className="sc-meta">
              <span><strong>{space.listeners}</strong> listening</span>
              <Dot />
              <span><strong>{space.speakers}</strong> speakers</span>
              <Dot />
              <span>{space.started}</span>
            </div>
            <button className="btn primary sm" onClick={onJoin}>
              <Icon name="mic" size={11} /> Join
            </button>
          </>
        )}
        {space.status === 'scheduled' && (
          <>
            <div className="sc-meta">
              <Icon name="calendar" size={11} />
              <span><strong>{space.scheduled}</strong></span>
              <Dot />
              <span>{space.reminders} interested</span>
            </div>
            <RemindBtn space={space} currentUser={currentUser} />
          </>
        )}
        {space.status === 'replay' && (
          <>
            <div className="sc-meta">
              <span><strong>{space.listeners}</strong> listened</span>
              <Dot />
              <span>{space.duration}</span>
            </div>
            <button className="btn ghost sm" onClick={onJoin}>
              <Icon name="play" size={11} /> Play
            </button>
          </>
        )}
      </footer>
    </article>
  );
};


const RemindBtn = ({ space, currentUser }) => {
  const [reminded, setReminded] = React.useState(() => {
    try {
      const set = new Set(JSON.parse(localStorage.getItem('compass_space_reminders_v1') || '[]'));
      return set.has(space.id);
    } catch { return false; }
  });

  const toggle = async () => {
    try {
      const set = new Set(JSON.parse(localStorage.getItem('compass_space_reminders_v1') || '[]'));
      const next = !reminded;
      if (next) set.add(space.id); else set.delete(space.id);
      localStorage.setItem('compass_space_reminders_v1', JSON.stringify([...set]));
      await spaceService.toggleReminder(space.id, next, currentUser?.handle || '');
      setReminded(next);
    } catch {}
  };

  return (
    <button className={`btn ${reminded ? 'primary' : 'ghost'} sm`} onClick={toggle}>
      <Icon name="bell" size={11} /> {reminded ? 'Reminder set' : 'Remind me'}
    </button>
  );
};

// ---------- Create / Schedule Space Modal ----------
const CreateSpaceModal = ({ currentUser, onClose, onCreated }) => {
  const [title, setTitle] = React.useState('');
  const [topic, setTopic] = React.useState('activities');
  const [mode, setMode] = React.useState('now'); // 'now' | 'schedule'
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');



  const handleCreate = async () => {
    if (mode === 'schedule' && (!title.trim() || !date || !time)) return;
    if (mode === 'now' && !title.trim()) return;

    const space = {
      id: genId(),
      status: mode === 'now' ? 'live' : 'scheduled',
      title: title.trim(),
      host: currentUser.handle,
      cohosts: [],
      listeners: 0,
      speakers: 1,
      started: mode === 'now' ? 'now' : null,
      scheduled: null,
      scheduledISO: null,
      topic,
      duration: null,
      reminders: 0,
    };

    if (mode === 'schedule') {
      const dt = new Date(`${date}T${time}`);
      space.scheduled = dt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      space.scheduledISO = dt.toISOString();
      space.listeners = 0;
    }

    await spaceService.create(space);
    onCreated(space);
  };

  return (
    <div className="modal-wrap" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-eyebrow">
            <Icon name="mic" size={14} /> {mode === 'now' ? 'Start a space' : 'Schedule a space'}
          </div>
          <button className="btn ghost icon-only" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <div className="modal-body">
          <label className="cf-label">Title</label>
          <input className="cf-input" placeholder="What's the space about?" value={title} onChange={e => setTitle(e.target.value)} />

          <label className="cf-label">Topic category</label>
          <div className="cat-picker" style={{ flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.filter(c => c.id !== 'alpha').map(c => (
              <button key={c.id} className={`cat-opt ${topic === c.id ? 'active' : ''}`} onClick={() => setTopic(c.id)}>
                <span className="cat-opt-dot" style={{ background: CAT_META[c.id].bg }} />
                <span className="cat-opt-code">{c.code}</span>
                <span className="cat-opt-name">{c.name}</span>
              </button>
            ))}
          </div>

          <label className="cf-label">When</label>
          <div className="cat-picker" style={{ gap: 6 }}>
            <button className={`cat-opt ${mode === 'now' ? 'active' : ''}`} onClick={() => setMode('now')}>
              <span className="cat-opt-dot" style={{ background: '#ff3b3b' }} />
              <span className="cat-opt-name">Start now</span>
            </button>
            <button className={`cat-opt ${mode === 'schedule' ? 'active' : ''}`} onClick={() => setMode('schedule')}>
              <span className="cat-opt-dot" style={{ background: 'var(--text-3)' }} />
              <span className="cat-opt-name">Schedule for later</span>
            </button>
          </div>

          {mode === 'schedule' && (
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <div style={{ flex: 1 }}>
                <label className="cf-label">Date</label>
                <input className="cf-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="cf-label">Time</label>
                <input className="cf-input" type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <span className="mf-hint">{mode === 'now' ? 'Synthetic listeners (Alice, Bob, Charlie) will join the room.' : 'Scheduled spaces appear on the Spaces page and home page.'}</span>
          <div className="mf-right">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button
              className="btn primary"
              disabled={!title.trim() || (mode === 'schedule' && (!date || !time))}
              onClick={handleCreate}
            >
              <Icon name={mode === 'now' ? 'mic' : 'calendar'} size={12} />
              {mode === 'now' ? 'Start space' : 'Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Live Space Drawer (Twitter Spaces + WhatsApp hybrid) ----------
const EMOJIS = ['❤️', '🔥', '🎉', '👏', '😂', '🚀', '💯', '✨'];

const LiveSpaceDrawer = ({ space, onClose, currentUser }) => {
  const [selfMuted, setSelfMuted] = React.useState(true);
  const [minimized, setMinimized] = React.useState(false);
  const [mutedByHost, setMutedByHost] = React.useState(new Set());
  const [raisedHands, setRaisedHands] = React.useState([]);
  const [speakers, setSpeakers] = React.useState(() => [space.host, ...(space.cohosts || [])]);
  const [emojis, setEmojis] = React.useState([]);
  const [showEndConfirm, setShowEndConfirm] = React.useState(false);
  const [micError, setMicError] = React.useState(null);
  const streamRef = React.useRef(null);

  const isHost = currentUser?.handle === space.host;
  const isCoHost = space.cohosts?.includes(currentUser?.handle);
  const canManage = isHost || isCoHost;
  const inSpeakers = speakers.includes(currentUser?.handle);
  const syntheticHandles = space.syntheticListeners || [];
  const listenerHandles = syntheticHandles.filter(h => !speakers.includes(h));

  // Acquire / release mic on mute toggle
  React.useEffect(() => {
    if (!selfMuted && !mutedByHost.has(currentUser.handle)) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => { streamRef.current = stream; setMicError(null); })
        .catch(err => { setMicError('Mic access denied'); });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    }
  }, [selfMuted, mutedByHost.has(currentUser.handle)]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const persistCohosts = async (newCohosts) => {
    await spaceService.update(space.id, { cohosts: newCohosts });
  };

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const fireEmoji = (emoji) => {
    const id = Date.now() + Math.random();
    setEmojis(prev => [...prev.slice(-12), { id, emoji, x: 10 + Math.random() * 80 }]);
    setTimeout(() => setEmojis(prev => prev.filter(e => e.id !== id)), 2000);
  };

  const toggleRaiseHand = () => {
    if (inSpeakers) return;
    if (raisedHands.includes(currentUser.handle)) {
      setRaisedHands(prev => prev.filter(h => h !== currentUser.handle));
    } else {
      setRaisedHands(prev => [...prev, currentUser.handle]);
    }
  };

  const acceptHand = (handle) => {
    setRaisedHands(prev => prev.filter(h => h !== handle));
    setSpeakers(prev => prev.includes(handle) ? prev : [...prev, handle]);
  };

  const dismissHand = (handle) => {
    setRaisedHands(prev => prev.filter(h => h !== handle));
  };

  const makeCohost = (handle) => {
    const updated = [...(space.cohosts || []), handle];
    persistCohosts(updated);
    setSpeakers(prev => prev.includes(handle) ? prev : [...prev, handle]);
    setRaisedHands(prev => prev.filter(h => h !== handle));
    setMutedByHost(prev => { const n = new Set(prev); n.delete(handle); return n; });
  };

  const removeCohost = (handle) => {
    const updated = (space.cohosts || []).filter(h => h !== handle);
    persistCohosts(updated);
  };

  const toggleHostMute = (handle) => {
    setMutedByHost(prev => {
      const next = new Set(prev);
      if (next.has(handle)) next.delete(handle); else next.add(handle);
      return next;
    });
  };

  const handleSelfMute = () => {
    if (mutedByHost.has(currentUser.handle)) return;
    setSelfMuted(m => !m);
  };

  const confirmEnd = async () => {
    await spaceService.delete(space.id);
    onClose();
  };

  if (minimized) {
    return (
      <button className="space-pip" onClick={() => setMinimized(false)}>
        <span className="space-live-pip" />
        <Avatar user={userByHandle(space.host)} size={26} />
        <span className="space-pip-title">{space.title}</span>
        <span className="space-pip-listeners"><Icon name="users" size={11} /> {speakers.length + space.listeners}</span>
      </button>
    );
  }

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="space-drawer">
        <div className="sp-emoji-rain">
          {emojis.map(e => (
            <span key={e.id} className="sp-emoji-float" style={{ left: e.x + '%' }}>{e.emoji}</span>
          ))}
        </div>

        <header className="sp-head">
          <div className="sp-head-status">
            <span className="space-live-pip" /> LIVE
            <span className="sp-head-sub">· {speakers.length + space.listeners} in the room</span>
          </div>
          <div className="sp-head-tools">
            <button className="btn ghost icon-only" onClick={() => setMinimized(true)} title="Minimize">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/></svg>
            </button>
            <button className="btn ghost icon-only" onClick={onClose} title="Leave">
              <Icon name="x" size={14} />
            </button>
          </div>
        </header>

        <div className="sp-body">
          <h2 className="sp-title">{space.title}</h2>

          {canManage && raisedHands.length > 0 && (
            <section className="sp-section">
              <div className="sp-section-head">Raised hands · {raisedHands.length}</div>
              <div className="sp-raised-list">
                {raisedHands.map(h => {
                  const u = userByHandle(h);
                  return (
                    <div key={h} className="sp-raised-row">
                      <Avatar user={u} size={28} />
                      <span className="sp-raised-name">{u.name?.split(' ')[0] || h}</span>
                      <div className="sp-raised-actions">
                        <button className="btn ghost sm" style={{ color: 'var(--brand-yellow)' }} onClick={() => acceptHand(h)} title="Invite to speak"><Icon name="mic" size={11} /></button>
                        {isHost && <button className="btn ghost sm" style={{ color: 'var(--text-3)' }} onClick={() => makeCohost(h)} title="Make co-host"><Icon name="users" size={11} /></button>}
                        <button className="btn ghost sm" style={{ color: 'var(--text-3)' }} onClick={() => dismissHand(h)} title="Dismiss"><Icon name="x" size={11} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="sp-section">
            <div className="sp-section-head">
              <span>Speaking · {speakers.length}</span>
              {canManage && speakers.length > 1 && (
                <div className="sp-section-actions" style={{ display: 'flex', gap: 4 }}>
                  <button className="btn ghost sm" style={{ fontSize: 11 }} onClick={() => setMutedByHost(new Set(speakers.filter(h => h !== space.host)))}>Mute all</button>
                  <button className="btn ghost sm" style={{ fontSize: 11 }} onClick={() => setMutedByHost(new Set())}>Unmute all</button>
                </div>
              )}
            </div>
            <div className="sp-grid">
              {speakers.slice(0, 8).map((h, i) => {
                const u = userByHandle(h);
                const isHostUser = i === 0;
                const isCo = !isHostUser && (space.cohosts || []).includes(h);
                const isSelf = currentUser?.handle === h;
                const mutedBy = mutedByHost.has(h);
                const isActuallySpeaking = !mutedBy && !(isSelf && selfMuted);
                return (
                  <div key={h} className={`sp-person ${isActuallySpeaking ? 'speaking' : ''}`}>
                    <div className="sp-avatar-wrap">
                      <Avatar user={u} size={56} />
                      {isActuallySpeaking && <span className="sp-speaking-ring" />}
                      {mutedBy && <span className="sp-mute-pill"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11a7 7 0 0 1-14 0M12 19v3"/></svg></span>}
                    </div>
                    <div className="sp-person-name">{u.name?.split(' ')[0] || h}</div>
                    {isHostUser && <span className="sp-role-pill host">Host</span>}
                    {isCo && <span className="sp-role-pill co">Co-host</span>}
                    {isSelf && !isHostUser && !isCo && <span className="sp-role-pill" style={{ background: 'var(--surface-3)', color: 'var(--text-2)' }}>You</span>}
                    {canManage && !isSelf && (
                      <button className="sp-host-mute" onClick={() => toggleHostMute(h)} title={mutedBy ? 'Unmute' : 'Mute'}>
                        <Icon name="mic" size={11} />
                      </button>
                    )}
                    {isSelf && !mutedBy && (
                      <button className={`sp-self-mute ${selfMuted ? '' : 'on'}`} onClick={handleSelfMute} title={selfMuted ? 'Unmute' : 'Mute self'}>
                        <Icon name="mic" size={12} />
                      </button>
                    )}
                    {isSelf && mutedBy && (
                      <span className="sp-muted-by-host">Muted by host</span>
                    )}
                    {isSelf && !selfMuted && streamRef.current && (
                      <span className="sp-mic-live" title="Mic active" />
                    )}
                    {isHost && isCo && (
                      <button className="sp-demote-cohost" onClick={() => removeCohost(h)} title="Remove as co-host"><Icon name="x" size={10} /></button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="sp-section">
            <div className="sp-section-head">Listeners · {space.listeners}</div>
            <div className="sp-listeners">
              {listenerHandles.map(h => (
                <div key={h} className="sp-listener-wrap">
                  <Avatar user={userByHandle(h)} size={36} />
                  {isHost && !raisedHands.includes(h) && (
                    <button className="sp-sim-raise" onClick={() => setRaisedHands(prev => [...prev, h])} title="Simulate hand raise" style={{ background: 'var(--bg-3)', fontSize: 9 }}>✋</button>
                  )}
                  {isHost && (
                    <button className="sp-invite-cohost" onClick={() => makeCohost(h)} title="Make co-host">👑</button>
                  )}
                </div>
              ))}
              <span className="sp-more">+{Math.max(0, space.listeners - listenerHandles.length)}</span>
            </div>
          </section>
        </div>

        <div className="sp-emoji-bar">
          {EMOJIS.map(e => (
            <button key={e} className="sp-emoji-btn" onClick={() => fireEmoji(e)}>{e}</button>
          ))}
        </div>

        <footer className="sp-controls">
          {isHost && (
            <button className="sp-ctrl" onClick={() => setShowEndConfirm(true)} style={{ color: '#e03a3a' }}>
              <Icon name="x" size={16} />
              <span>End</span>
            </button>
          )}
          <button
            className={`sp-ctrl ${selfMuted || mutedByHost.has(currentUser.handle) ? '' : 'on'}`}
            onClick={handleSelfMute}
            disabled={mutedByHost.has(currentUser.handle)}
          >
            <Icon name="mic" size={16} />
            <span>{micError ? 'No mic' : mutedByHost.has(currentUser.handle) ? 'Muted' : selfMuted ? 'Muted' : 'Speaking'}</span>
          </button>
          {!inSpeakers && (
            <button
              className={`sp-ctrl ${raisedHands.includes(currentUser.handle) ? 'on' : ''}`}
              onClick={toggleRaiseHand}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>✋</span>
              <span>{raisedHands.includes(currentUser.handle) ? 'Requested' : 'Raise hand'}</span>
            </button>
          )}
          <button className="sp-ctrl">
            <Icon name="reply" size={16} />
            <span>Share</span>
          </button>
          {!isHost && <button className="sp-ctrl leave" onClick={onClose}>Leave</button>}
        </footer>

        {showEndConfirm && (
          <div className="modal-wrap" onClick={() => setShowEndConfirm(false)}>
            <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
              <div className="modal-head">
                <div className="modal-eyebrow"><Icon name="x" size={14} /> End space?</div>
                <button className="btn ghost icon-only" onClick={() => setShowEndConfirm(false)}><Icon name="x" size={14} /></button>
              </div>
              <div className="modal-body" style={{ textAlign: 'center', padding: '28px 24px' }}>
                <p style={{ fontSize: 14, color: 'var(--text-1)', margin: 0 }}>End this space for everyone?<br /><span style={{ fontSize: 12, color: 'var(--text-3)' }}>This cannot be undone.</span></p>
              </div>
              <div className="modal-foot" style={{ justifyContent: 'center' }}>
                <button className="btn ghost" onClick={() => setShowEndConfirm(false)}>Cancel</button>
                <button className="btn" style={{ background: '#e03a3a', color: '#fff', border: 'none' }} onClick={confirmEnd}>End space</button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

Object.assign(window, { SpacesPage, SpaceCard, LiveSpaceDrawer, CreateSpaceModal });
