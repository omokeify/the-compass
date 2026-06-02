// Global ⌘K command palette / search

const PALETTE_NAV = [
  { label: 'Home',        view: 'home',        icon: 'home' },
  { label: 'Feed',        view: 'feed',        icon: 'sparkles' },
  { label: 'Members',     view: 'members',     icon: 'users' },
  { label: 'Spaces',      view: 'spaces',      icon: 'mic' },
  { label: 'Talent',      view: 'talent',      icon: 'briefcase' },
  { label: 'Messages',    view: 'messages',    icon: 'send' },
  { label: 'Events',      view: 'events',      icon: 'calendar' },
  { label: 'Leaderboard', view: 'leaderboard', icon: 'medal' },
  { label: 'Wallet',      view: 'profile',     tab: 'wallet', icon: 'wallet' },
  { label: 'Saved',       view: 'profile',     tab: 'saved',  icon: 'bookmark' },
];

const CommandPalette = ({ onClose, navigate, currentUser }) => {
  const [q, setQ] = React.useState('');
  const [sel, setSel] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const ql = q.toLowerCase().trim();

  // Build result groups
  const results = [];
  if (!ql) {
    results.push({ group: 'Go to', items: PALETTE_NAV.slice(0, 7).map(n => ({ ...n, kind: 'nav' })) });
  } else {
    const navHits = PALETTE_NAV.filter(n => n.label.toLowerCase().includes(ql)).map(n => ({ ...n, kind: 'nav' }));
    const memberHits = MEMBERS.filter(m => m.name.toLowerCase().includes(ql) || m.handle.toLowerCase().includes(ql) || m.role.toLowerCase().includes(ql))
      .slice(0, 5).map(m => ({ kind: 'member', label: m.name, sub: m.role, handle: m.handle, hue: m.hue, avatar: m.avatar }));
    const topicHits = TOPICS.filter(t => t.title.toLowerCase().includes(ql))
      .slice(0, 4).map(t => ({ kind: 'topic', label: t.title, sub: 'Discussion', id: t.id }));
    const gigHits = TALENT.filter(t => t.title.toLowerCase().includes(ql) || t.skill.toLowerCase().includes(ql))
      .slice(0, 4).map(t => ({ kind: 'gig', label: t.title, sub: t.skill, id: t.id }));
    const classHits = CONFERENCES.filter(c => c.title.toLowerCase().includes(ql))
      .slice(0, 3).map(c => ({ kind: 'class', label: c.title, sub: 'Class', status: c.status }));
    const tagHits = TAGS.filter(t => t.toLowerCase().includes(ql)).slice(0, 5).map(t => ({ kind: 'tag', label: '#' + t, tag: t }));

    if (navHits.length) results.push({ group: 'Pages', items: navHits });
    if (memberHits.length) results.push({ group: 'Members', items: memberHits });
    if (topicHits.length) results.push({ group: 'Discussions', items: topicHits });
    if (gigHits.length) results.push({ group: 'Talent', items: gigHits });
    if (classHits.length) results.push({ group: 'Classes', items: classHits });
    if (tagHits.length) results.push({ group: 'Tags', items: tagHits });
  }

  const flat = results.flatMap(r => r.items);
  const go = (item) => {
    onClose();
    if (item.kind === 'nav') navigate(item.tab ? { view: item.view, handle: currentUser?.handle || '', tab: item.tab } : { view: item.view });
    else if (item.kind === 'member') navigate({ view: 'profile', handle: item.handle });
    else if (item.kind === 'topic') navigate({ view: 'topic', topic: item.id });
    else if (item.kind === 'gig') navigate({ view: 'gig', id: item.id });
    else if (item.kind === 'class') navigate({ view: 'events' });
    else if (item.kind === 'tag') navigate({ view: 'tag', tag: item.tag });
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, flat.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (flat[sel]) go(flat[sel]); }
  };

  let idx = -1;

  return (
    <div className="palette-wrap" onClick={onClose}>
      <div className="palette" onClick={e => e.stopPropagation()}>
        <div className="palette-input">
          <Icon name="search" size={16} />
          <input
            ref={inputRef}
            placeholder="Search members, posts, gigs, classes, tags…"
            value={q}
            onChange={e => { setQ(e.target.value); setSel(0); }}
            onKeyDown={onKeyDown}
          />
          <kbd className="kbd">Esc</kbd>
        </div>
        <div className="palette-results">
          {flat.length === 0 && <div className="palette-empty">No results for "{q}"</div>}
          {results.map(r => (
            <div key={r.group} className="palette-group">
              <div className="palette-group-label">{r.group}</div>
              {r.items.map(item => {
                idx++;
                const active = idx === sel;
                const myIdx = idx;
                return (
                  <button
                    key={item.label + myIdx}
                    className={`palette-row ${active ? 'active' : ''}`}
                    onMouseEnter={() => setSel(myIdx)}
                    onClick={() => go(item)}
                  >
                    {item.kind === 'member'
                      ? <Avatar user={{ avatar: item.avatar, hue: item.hue }} size={26} />
                      : <span className="palette-icon"><Icon name={item.kind === 'tag' ? 'tag' : (item.icon || (item.kind === 'gig' ? 'briefcase' : item.kind === 'class' ? 'cap' : item.kind === 'topic' ? 'chat' : 'arrow-right'))} size={15} /></span>}
                    <span className="palette-label">{item.label}</span>
                    {item.sub && <span className="palette-sub">{item.sub}</span>}
                    {active && <span className="palette-enter"><Icon name="arrow-right" size={12} /></span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="palette-foot">
          <span><kbd className="kbd">↑↓</kbd> navigate</span>
          <span><kbd className="kbd">↵</kbd> open</span>
          <span><kbd className="kbd">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { CommandPalette });
