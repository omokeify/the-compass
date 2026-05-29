// Spaces — live audio rooms (Twitter Spaces / X Spaces style)

const SPACES = [
  {
    id: 's1', status: 'live',
    title: 'Monad airdrop — the eligibility checker breakdown',
    host: 'degenscout',
    cohosts: ['0xforesight', 'kelechi.eth'],
    listeners: 482,
    speakers: 6,
    started: '38m ago',
    topic: 'alpha',
  },
  {
    id: 's2', status: 'live',
    title: 'GM coffee chat ☕ — what shipped this week',
    host: 'compass.eth',
    cohosts: ['fatima.lens'],
    listeners: 124,
    speakers: 3,
    started: '12m ago',
    topic: 'news',
  },
  {
    id: 's3', status: 'live',
    title: 'On-chain rep & retroPGF Q&A',
    host: 'mosi_dao',
    cohosts: [],
    listeners: 68,
    speakers: 4,
    started: '2h ago',
    topic: 'activities',
  },
  {
    id: 's4', status: 'scheduled',
    title: 'Base ecosystem fund — AMA with the BD team',
    host: 'signal_op',
    cohosts: ['compass.eth'],
    scheduled: 'Tue 7:00 PM WAT',
    reminders: 184,
    topic: 'news',
  },
  {
    id: 's5', status: 'scheduled',
    title: 'How African designers price for Web3 clients',
    host: 'iyabo_nft',
    cohosts: ['tinuke.builds'],
    scheduled: 'Thu 6:00 PM WAT',
    reminders: 96,
    topic: 'skills',
  },
  {
    id: 's6', status: 'replay',
    title: 'ZK in one hour — primer for non-cryptographers',
    host: 'kweku.sol',
    cohosts: [],
    listeners: 312,
    duration: '1h 04m',
    topic: 'training',
  },
  {
    id: 's7', status: 'replay',
    title: 'Voice of Impact — April winners on the mic',
    host: 'fatima.lens',
    cohosts: ['compass.eth'],
    listeners: 528,
    duration: '52m',
    topic: 'activities',
  },
];

const SpacesPage = ({ navigate, onJoinSpace, onStartSpace, onScheduleSpace }) => {
  const [tab, setTab] = React.useState('all');
  const tabs = [
    { id: 'all',       label: 'All' },
    { id: 'live',      label: 'Live',      filter: s => s.status === 'live' },
    { id: 'scheduled', label: 'Scheduled', filter: s => s.status === 'scheduled' },
    { id: 'replays',   label: 'Replays',   filter: s => s.status === 'replay' },
  ];
  const active = tabs.find(t => t.id === tab);
  const list = active.filter ? SPACES.filter(active.filter) : SPACES;

  const liveOnes = SPACES.filter(s => s.status === 'live');

  return (
    <div className="view spaces-view">
      <section className="spaces-hero">
        <div>
          <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Live audio</div>
          <h1 className="th-title">Spaces — the community in the room.</h1>
          <p className="th-sub">
            Drop into live audio rooms hosted by builders, researchers and partners.
            Listen, raise your hand to speak, or schedule your own.
          </p>
        </div>
        <div className="th-cta">
          <button className="btn primary lg" onClick={onStartSpace}>
            <Icon name="mic" size={14} /> Start a space
          </button>
          <button className="btn ghost lg" onClick={() => { setTab('scheduled'); onScheduleSpace && onScheduleSpace(); }}>
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
        {list.map(s => <SpaceCard key={s.id} space={s} onJoin={() => onJoinSpace(s)} navigate={navigate} />)}
      </div>
    </div>
  );
};

const SpaceCard = ({ space, onJoin, navigate }) => {
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
            <button className="btn ghost sm">
              <Icon name="bell" size={11} /> Remind me
            </button>
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

// ---------- Live Space Drawer ----------
const LiveSpaceDrawer = ({ space, onClose }) => {
  const [muted, setMuted] = React.useState(true);
  const [hand, setHand] = React.useState(false);
  const [minimized, setMinimized] = React.useState(false);

  // Build pretend room: host + cohosts + 4 random users as speakers + a few listeners
  const speakers = [space.host, ...space.cohosts, 'fatima.lens', 'mosi_dao', 'iyabo_nft', 'tinuke.builds'].slice(0, 6);
  const listeners = USERS.filter(u => !speakers.includes(u.handle)).slice(0, 8);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (minimized) {
    return (
      <button className="space-pip" onClick={() => setMinimized(false)}>
        <span className="space-live-pip" />
        <Avatar user={userByHandle(space.host)} size={26} />
        <span className="space-pip-title">{space.title}</span>
        <span className="space-pip-listeners"><Icon name="users" size={11} /> {space.listeners}</span>
      </button>
    );
  }

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="space-drawer">
        <header className="sp-head">
          <div className="sp-head-status">
            <span className="space-live-pip" /> LIVE
            <span className="sp-head-sub">· {space.listeners} listening</span>
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

          <section className="sp-section">
            <div className="sp-section-head">Speakers · {speakers.length}</div>
            <div className="sp-grid">
              {speakers.map((h, i) => {
                const u = userByHandle(h);
                const isHost = i === 0;
                const isCo = i > 0 && i <= space.cohosts.length;
                const isSpeaking = i === 0 || i === 2;
                return (
                  <div key={h} className={`sp-person ${isSpeaking ? 'speaking' : ''}`}>
                    <div className="sp-avatar-wrap">
                      <Avatar user={u} size={56} />
                      {isSpeaking && <span className="sp-speaking-ring" />}
                      {i % 3 === 0 && <span className="sp-mute-pill"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11a7 7 0 0 1-14 0M12 19v3"/></svg></span>}
                    </div>
                    <div className="sp-person-name">{u.name.split(' ')[0]}</div>
                    {isHost && <span className="sp-role-pill host">Host</span>}
                    {isCo && <span className="sp-role-pill co">Co-host</span>}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="sp-section">
            <div className="sp-section-head">Listeners · {space.listeners}</div>
            <div className="sp-listeners">
              {listeners.map(u => (
                <Avatar key={u.handle} user={u} size={36} />
              ))}
              <span className="sp-more">+{space.listeners - listeners.length}</span>
            </div>
          </section>
        </div>

        <footer className="sp-controls">
          <button
            className={`sp-ctrl ${muted ? '' : 'on'}`}
            onClick={() => setMuted(m => !m)}
          >
            <Icon name="mic" size={16} />
            <span>{muted ? 'Muted' : 'Speaking'}</span>
          </button>
          <button
            className={`sp-ctrl ${hand ? 'on' : ''}`}
            onClick={() => setHand(h => !h)}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>✋</span>
            <span>{hand ? 'Hand raised' : 'Raise hand'}</span>
          </button>
          <button className="sp-ctrl">
            <Icon name="reply" size={16} />
            <span>Share</span>
          </button>
          <button className="sp-ctrl leave" onClick={onClose}>
            Leave
          </button>
        </footer>
      </aside>
    </>
  );
};

Object.assign(window, { SpacesPage, SpaceCard, LiveSpaceDrawer });
