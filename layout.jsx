// Layout: Sidebar (narrow, expandable) + TopBar

const ChevronRight = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const Sidebar = ({ route, navigate, currentUser }) => {
  const isHost = currentUser && canCreateEvent(currentUser);
  const visibleCategories = currentUser
    ? CATEGORIES.filter((cat) => canViewCategory(currentUser, cat.id))
    : CATEGORIES;
  // Default the parent for the current view to be expanded
  const [expanded, setExpanded] = React.useState(() => ({
    discussions: route.view === 'category' || route.view === 'topic' || route.view === 'tag',
  }));
  const toggle = (k) => setExpanded((e) => ({ ...e, [k]: !e[k] }));

  const isActive = (view, extra = {}) => {
    if (route.view !== view) return false;
    for (const k in extra) if (route[k] !== extra[k]) return false;
    return true;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <button
          className={`nav-item ${isActive('home') ? 'active' : ''}`}
          onClick={() => navigate({ view: 'home' })}
        >
          <span className="ni-icon">
            <Icon name="home" size={16} />
          </span>
          <span className="ni-label">Home</span>
        </button>
        <button
          className={`nav-item ${isActive('feed') ? 'active' : ''}`}
          onClick={() => navigate({ view: 'feed' })}
        >
          <span className="ni-icon">
            <Icon name="sparkles" size={16} />
          </span>
          <span className="ni-label">Feed</span>
        </button>
        <button
          className={`nav-item ${isActive('members') ? 'active' : ''}`}
          onClick={() => navigate({ view: 'members' })}
        >
          <span className="ni-icon">
            <Icon name="users" size={16} />
          </span>
          <span className="ni-label">Members</span>
        </button>
        <button
          className={`nav-item ${isActive('spaces') ? 'active' : ''}`}
          onClick={() => navigate({ view: 'spaces' })}
        >
          <span className="ni-icon">
            <Icon name="mic" size={16} />
          </span>
          <span className="ni-label">Spaces</span>
        </button>
        <button
          className={`nav-item ${isActive('talent') ? 'active' : ''}`}
          onClick={() => navigate({ view: 'talent' })}
        >
          <span className="ni-icon">
            <Icon name="briefcase" size={16} />
          </span>
          <span className="ni-label">Talent</span>
        </button>
        <button
          className={`nav-item ${isActive('messages') ? 'active' : ''}`}
          onClick={() => navigate({ view: 'messages' })}
        >
          <span className="ni-icon">
            <Icon name="send" size={16} />
          </span>
          <span className="ni-label">Messages</span>
        </button>
        <button
          className={`nav-item ${isActive('events') ? 'active' : ''}`}
          onClick={() => navigate({ view: 'events' })}
        >
          <span className="ni-icon">
            <Icon name="calendar" size={16} />
          </span>
          <span className="ni-label">Events</span>
        </button>
        {isHost && (
          <button
            className={`nav-item ${isActive('studio') ? 'active' : ''}`}
            onClick={() => navigate({ view: 'studio' })}
          >
            <span className="ni-icon">
              <Icon name="cap" size={16} />
            </span>
            <span className="ni-label">Studio</span>
            <span className="ni-badge admin">Mod</span>
          </button>
        )}
        {isHost && (
          <button
            className={`nav-item ${isActive('content') ? 'active' : ''}`}
            onClick={() => navigate({ view: 'content' })}
          >
            <span className="ni-icon">
              <Icon name="book" size={16} />
            </span>
            <span className="ni-label">Content</span>
            <span className="ni-badge admin">Mod</span>
          </button>
        )}

        {/* Discussions (expandable parent) */}
        {visibleCategories.length > 0 && (
          <>
            <button
              className={`nav-item ${expanded.discussions ? 'open' : ''} ${route.view === 'category' || route.view === 'topic' || route.view === 'tag' ? 'active' : ''}`}
              onClick={() => toggle('discussions')}
            >
              <span className="ni-icon">
                <Icon name="chat" size={16} />
              </span>
              <span className="ni-label">Discussions</span>
              <span className="ni-chev">
                <ChevronRight size={12} />
              </span>
            </button>
            {expanded.discussions && (
              <div className="nav-sub">
                {visibleCategories.map((cat) => {
                  const meta = CAT_META[cat.id];
                  return (
                    <button
                      key={cat.id}
                      className={`nav-subitem ${route.view === 'category' && route.cat === cat.id ? 'active' : ''}`}
                      onClick={() => navigate({ view: 'category', cat: cat.id })}
                    >
                      <span className="sub-dot" style={{ background: meta.bg }} />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        <button
          className={`nav-item ${isActive('leaderboard') ? 'active' : ''}`}
          onClick={() => navigate({ view: 'leaderboard' })}
        >
          <span className="ni-icon">
            <Icon name="medal" size={16} />
          </span>
          <span className="ni-label">Leaderboard</span>
        </button>
      </div>

      <div className="sidebar-foot">
        <div className="poweredby">
          <CompassLogo size={18} />
          <span>
            Powered by <strong>Compass</strong>
          </span>
        </div>
      </div>
    </aside>
  );
};

// ---------- Profile Dropdown ----------
const PROFILE_DROPDOWN_ITEMS = [
  { id: 'edit', label: 'Edit Profile', icon: 'gear' },
  { id: 'saved', label: 'Saved', icon: 'bookmark' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  { id: 'groups', label: 'My Groups', icon: 'users' },
  { id: 'schedule', label: 'My Schedule', icon: 'calendar' },
  { id: 'courses', label: 'My Courses', icon: 'cap' },
  { id: 'contributions', label: 'My Contributions', icon: 'chat' },
  { id: 'certificates', label: 'My Certificates', icon: 'medal' },
  { id: 'rules', label: 'Contribution Rules', icon: 'book', divider: true },
  { id: 'settings', label: 'Settings', icon: 'gear' },
  { id: 'logout', label: 'Logout', icon: 'arrow-right', divider: true, danger: true },
];

const ProfileDropdown = ({ currentUser, onNavigate, onClose, onLogout }) => {
  const ref = React.useRef(null);
  const safeUser = currentUser || {};
  const displayName = safeUser.name || safeUser.fullname || safeUser.handle || 'User';
  const handleText = safeUser.handle || safeUser.email || 'user';
  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const esc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', esc);
    };
  }, [onClose]);

  const goTab = (tab) => {
    onClose();
    onNavigate({ view: 'profile', handle: handleText, tab });
  };

  return (
    <div ref={ref} className="prof-dropdown">
      <button className="pd-user" onClick={() => goTab('overview')} title="View profile">
        <Avatar user={currentUser} size={44} />
        <div className="pd-user-body">
          <div className="pd-user-name">{displayName.toLowerCase()}</div>
          <div className="pd-user-role">{safeUser.tier || 'Explorer'} @ Compass</div>
          <div className="pd-user-mail">{String(handleText).split('.')[0]}@compass.community</div>
        </div>
        <span className="pd-user-go">
          <Icon name="arrow-right" size={14} />
        </span>
      </button>
      <ul className="pd-list">
        {PROFILE_DROPDOWN_ITEMS.map((item) => (
          <li key={item.id} className={item.divider ? 'pd-divider' : ''}>
            <button
              className={`pd-item ${item.danger ? 'danger' : ''}`}
              onClick={() => {
                onClose();
                if (item.id === 'logout') return onLogout && onLogout();
                onNavigate({ view: 'profile', handle: handleText, tab: item.id });
              }}
            >
              <span className="pd-icon">
                {item.id === 'saved' ? (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                ) : (
                  <Icon name={item.icon} size={15} />
                )}
              </span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ---------- TopBar ----------
const TopBar = ({
  route,
  navigate,
  onCompose,
  currentUser,
  onOpenNotifs,
  onOpenSearch,
  onLogout,
  onToggleMenu,
}) => {
  const [notifCount, setNotifCount] = React.useState(0);
  const safeUser = currentUser || {};
  const displayName = safeUser.name || safeUser.fullname || safeUser.handle || 'User';
  React.useEffect(() => {
    setNotifCount(window.__notifUnreadCount || 0);
    const handler = () => setNotifCount(window.__notifUnreadCount || 0);
    window.addEventListener('compass_notif_refresh', handler);
    return () => window.removeEventListener('compass_notif_refresh', handler);
  }, []);
  const [query, setQuery] = React.useState('');
  const [scrolled, setScrolled] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  React.useEffect(() => {
    const sc = document.querySelector('.main-col');
    if (!sc) return;
    const onScroll = () => setScrolled(sc.scrollTop > 12);
    sc.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => sc.removeEventListener('scroll', onScroll);
  }, []);

  const crumbs = [];
  if (route.view === 'home') crumbs.push({ label: 'The Compass · Community' });
  if (route.view === 'category') {
    crumbs.push({ label: 'Home', go: () => navigate({ view: 'home' }) });
    const c = CATEGORIES.find((x) => x.id === route.cat);
    if (c) crumbs.push({ label: c.name });
  }
  if (route.view === 'topic') {
    crumbs.push({ label: 'Home', go: () => navigate({ view: 'home' }) });
    const t = TOPICS.find((x) => x.id === route.topic);
    const c = CATEGORIES.find((x) => x.id === t?.cat);
    if (c) crumbs.push({ label: c.name, go: () => navigate({ view: 'category', cat: c.id }) });
    crumbs.push({ label: t?.title || 'Topic', truncate: true });
  }
  if (route.view === 'feed') crumbs.push({ label: 'Feed' });
  if (route.view === 'talent') crumbs.push({ label: 'Talent · Marketplace' });
  if (route.view === 'gig') {
    crumbs.push({ label: 'Talent', go: () => navigate({ view: 'talent' }) });
    const g = (window.TALENT || []).find((x) => x.id === route.id);
    if (g) crumbs.push({ label: g.title, truncate: true });
  }
  if (route.view === 'members') crumbs.push({ label: 'Members' });
  if (route.view === 'spaces') crumbs.push({ label: 'Spaces' });
  if (route.view === 'messages') crumbs.push({ label: 'Messages' });
  if (route.view === 'content') crumbs.push({ label: 'Content' });
  if (route.view === 'leaderboard') crumbs.push({ label: 'Leaderboard' });
  if (route.view === 'pro') crumbs.push({ label: 'Compass Pro' });
  if (route.view === 'article') {
    crumbs.push({ label: 'Home', go: () => navigate({ view: 'home' }) });
    const a = (window.CONTENT_ITEMS || []).find((c) => c.id === route.id);
    crumbs.push({ label: a ? a.kind : 'Article' });
  }
  if (route.view === 'events') crumbs.push({ label: 'Events' });
  if (route.view === 'studio') crumbs.push({ label: 'Studio · Classes' });
  if (route.view === 'profile') {
    const u = userByHandle(route.handle);
    crumbs.push({ label: u.name });
  }
  if (route.view === 'tag') crumbs.push({ label: `#${route.tag}` });

  return (
    <header className={`topbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="topbar-left">
        <button className="mobile-hamburger" onClick={onToggleMenu} aria-label="Toggle menu">
          <Icon name="menu" size={18} />
        </button>
        <div className="brand" onClick={() => navigate({ view: 'home' })}>
          <CompassLogo size={28} />
          <span className="brand-name">Compass</span>
        </div>
      </div>
      <nav className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="crumb-sep">/</span>}
            {c.go ? (
              <button className="crumb-link" onClick={c.go}>
                {c.label}
              </button>
            ) : (
              <span className={`crumb ${c.truncate ? 'trunc' : ''}`}>{c.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
      <div className="topbar-right">
        <button className="search search-btn" onClick={onOpenSearch}>
          <Icon name="search" size={14} />
          <span className="search-ph">Search…</span>
          <kbd className="kbd">⌘K</kbd>
        </button>
        <button className="btn ghost icon-only" title="Notifications" onClick={onOpenNotifs}>
          <div className="bell-wrap">
            <Icon name="bell" size={16} />
            {notifCount > 0 && (
              <span className="notif-badge">{notifCount > 99 ? '99+' : notifCount}</span>
            )}
          </div>
        </button>
        <button className="btn primary" onClick={onCompose}>
          <Icon name="plus" size={14} /> New post
        </button>
        <div className="me-wrap">
          <button
            className={`me-chip ${profileOpen ? 'open' : ''}`}
            onClick={() => setProfileOpen((o) => !o)}
          >
            <Avatar user={currentUser} size={26} />
            <span className="me-handle">{String(displayName).split(' ')[0]}</span>
            <Icon name="arrow-down" size={11} />
          </button>
          {profileOpen && (
            <ProfileDropdown
              currentUser={currentUser}
              onNavigate={navigate}
              onClose={() => setProfileOpen(false)}
              onLogout={onLogout}
            />
          )}
        </div>
      </div>
    </header>
  );
};

Object.assign(window, { Sidebar, TopBar });
