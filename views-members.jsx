const MembersPage = ({ navigate, onOpenCard }) => {
  const [members, setMembers] = React.useState([]);
  const [search, setSearch]   = React.useState('');
  const [locQuery, setLocQuery] = React.useState('');
  const [regions, setRegions] = React.useState(new Set());
  const [sectors, setSectors] = React.useState(new Set());
  const [tab, setTab]         = React.useState('all');
  const [bookmarks, setBookmarks] = React.useState(new Set());
  const [showAllSectors, setShowAllSectors] = React.useState(false);

  React.useEffect(() => {
    const sb = window.supabaseService;
    if (sb) sb.listMembers().then(setMembers).catch(() => {});
  }, []);

  const toggleSet = (setter, v) => setter(curr => {
    const n = new Set(curr);
    if (n.has(v)) n.delete(v); else n.add(v);
    return n;
  });

  const clearFilters = () => {
    setLocQuery('');
    setRegions(new Set());
    setSectors(new Set());
  };

  const filtered = members.filter(m => {
    if (tab === 'bookmarked' && !bookmarks.has(m.handle)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(m.name || '').toLowerCase().includes(q) &&
          !(m.handle || '').toLowerCase().includes(q) &&
          !(m.role || '').toLowerCase().includes(q)) return false;
    }
    if (locQuery && !(m.loc || '').toLowerCase().includes(locQuery.toLowerCase())) return false;
    if (regions.size > 0 && !regions.has(m.region)) return false;
    if (sectors.size > 0 && !(m.sectors || []).some(s => sectors.has(s))) return false;
    return true;
  });

  const visibleSectors = showAllSectors ? SECTORS : SECTORS.slice(0, 5);

  return (
    <div className="view members-view">
      <div className="mv-layout">
        <aside className="mv-filters">
          <div className="mv-search">
            <Icon name="search" size={13} />
            <input
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="mv-filter-group">
            <h3 className="mv-filter-label">Location</h3>
            <input
              className="mv-input"
              placeholder="City, state, or country"
              value={locQuery}
              onChange={e => setLocQuery(e.target.value)}
            />
          </div>

          <div className="mv-filter-group">
            <h3 className="mv-filter-label">What region are you focused on?</h3>
            {REGIONS.map(r => (
              <label key={r.id} className="mv-check">
                <input
                  type="checkbox"
                  checked={regions.has(r.id)}
                  onChange={() => toggleSet(setRegions, r.id)}
                />
                <span className="mv-check-box" />
                <span className="mv-check-label">{r.label}</span>
              </label>
            ))}
          </div>

          <div className="mv-filter-group">
            <h3 className="mv-filter-label">Which sectors of the onchain economy do you work on or support?</h3>
            {visibleSectors.map(s => (
              <label key={s} className="mv-check">
                <input
                  type="checkbox"
                  checked={sectors.has(s)}
                  onChange={() => toggleSet(setSectors, s)}
                />
                <span className="mv-check-box" />
                <span className="mv-check-label">{s}</span>
              </label>
            ))}
            <button className="mv-show-more" onClick={() => setShowAllSectors(s => !s)}>
              {showAllSectors ? 'Show less' : 'Show more'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showAllSectors ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          <div className="mv-filter-foot">
            <button className="btn ghost sm" onClick={clearFilters}>Clear</button>
          </div>
        </aside>

        <main className="mv-main">
          <header className="mv-head">
            <div className="mv-count">{filtered.length} members</div>
            <div className="mv-tabs">
              <button
                className={`mv-tab ${tab === 'all' ? 'active' : ''}`}
                onClick={() => setTab('all')}
              >
                <Icon name="check" size={12} /> All people
              </button>
              <button
                className={`mv-tab ${tab === 'bookmarked' ? 'active' : ''}`}
                onClick={() => setTab('bookmarked')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
                Bookmarked
                {bookmarks.size > 0 && <span className="mv-tab-count">{bookmarks.size}</span>}
              </button>
            </div>
          </header>

          <div className="mv-grid">
            {filtered.length === 0 && (
              <div className="empty" style={{ gridColumn: '1 / -1' }}>
                No members match these filters.
              </div>
            )}
            {filtered.map(m => {
              const bookmarked = bookmarks.has(m.handle);
              return (
                <article
                  key={m.handle}
                  className="member-tile"
                  onClick={() => onOpenCard(m.handle)}
                >
                  {m.isMe && <span className="mt-me">Me</span>}
                  <button
                    className={`mt-bookmark ${bookmarked ? 'on' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleSet(setBookmarks, m.handle); }}
                    title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24"
                      fill={bookmarked ? 'currentColor' : 'none'}
                      stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                  </button>

                  <div className="mt-avatar-wrap">
                    {m.photo ? (
                      <div className="mt-photo" style={{ background: `linear-gradient(135deg, oklch(0.7 0.16 ${m.hue}), oklch(0.42 0.14 ${m.hue}))` }}>
                        <span>{m.avatar}</span>
                      </div>
                    ) : (
                      <Avatar user={m} size={64} />
                    )}
                    {m.online && <span className="mt-online-dot" />}
                  </div>

                  <div className="mt-loc">{m.loc}</div>
                  <h3 className="mt-name">{m.name}</h3>
                  <div className="mt-role">{m.role}</div>
                </article>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

Object.assign(window, { MembersPage });
