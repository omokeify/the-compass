// Member profile popup card (modal)

const FIELD_PILL = {
  location: { bg: '#fde2dc', fg: '#9a3412' },  // coral
  x:        { bg: '#d9ecdf', fg: '#1d4d2b' },  // green
  github:   { bg: '#dde7f4', fg: '#1e4976' },  // blue
  company:  { bg: '#e7e0fb', fg: '#4c2f8f' },  // lavender
  region:   { bg: '#fbe0ee', fg: '#9c2d6b' },  // pink
  sector:   { bg: '#eaf0db', fg: '#4a6018' },  // sage
};

const MEMBER_EXTRAS = {
  // sensible defaults built from handle when not present
};

const buildLinks = (m) => {
  const slug = m.handle.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return {
    x: `https://x.com/${slug}`,
    github: `https://github.com/${slug}`,
    company: m.role.includes('@') ? `https://${m.role.split('@')[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '')}.xyz` : `https://compass.community/@${m.handle}`,
  };
};

const REGION_LABEL = (id) => (REGIONS.find(r => r.id === id) || {}).label || '—';

const MemberCard = ({ handle, onClose, navigate }) => {
  const m = MEMBERS.find(x => x.handle === handle) || userByHandle(handle);
  const [bookmarked, setBookmarked] = React.useState(false);
  const [following, setFollowing] = React.useState(false);
  const links = buildLinks(m);
  const kp = (userByHandle(m.handle) || {}).kp || (948 + (m.handle.length * 37) % 9000);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const Pill = ({ kind, children, href }) => (
    <span className="mc-pill" style={{ background: FIELD_PILL[kind].bg, color: FIELD_PILL[kind].fg }}>
      {children}
    </span>
  );

  return (
    <div className="modal-wrap" onClick={onClose}>
      <div className="member-card-modal" onClick={e => e.stopPropagation()}>
        <div className="mcm-top">
          <button className="mcm-icon" title="Open full profile" onClick={() => { onClose(); navigate({ view: 'profile', handle: m.handle }); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M21 3l-9 9M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
            </svg>
          </button>
          <button className="mcm-icon" title="Close" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="mcm-head">
          <div className="mcm-avatar-wrap">
            {m.photo ? (
              <div className="mcm-photo" style={{ background: `linear-gradient(135deg, oklch(0.7 0.16 ${m.hue}), oklch(0.42 0.14 ${m.hue}))` }}>
                <span>{m.avatar}</span>
              </div>
            ) : (
              <Avatar user={m} size={120} />
            )}
            <span className="mcm-logo-badge"><CompassLogo size={28} /></span>
            {m.online && <span className="mcm-online-dot" />}
          </div>

          <div className="mcm-head-body">
            <div className="mcm-name-row">
              <div>
                <h2 className="mcm-name">{m.name}</h2>
                <div className="mcm-role">{m.role}</div>
              </div>
              <div className="mcm-actions">
                <button className="mcm-round" title="More"><Icon name="menu" size={15} /></button>
                <button className={`mcm-round ${bookmarked ? 'on' : ''}`} title="Bookmark" onClick={() => setBookmarked(b => !b)}>
                  <svg width="15" height="15" viewBox="0 0 24 24"
                    fill={bookmarked ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mcm-kp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M12 2l8 7-8 13L4 9z" />
              </svg>
              <span className="mcm-kp-num">{kp.toLocaleString()}</span>
              <span className="mcm-kp-help" title="Knowledge Points earned in the community">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3.5M12 17h.01" strokeLinecap="round" />
                </svg>
              </span>
            </div>

            <button className="mcm-message" onClick={() => { onClose(); navigate({ view: 'messages' }); }}>
              Message
            </button>
          </div>
        </div>

        <div className="mcm-divider" />

        <div className="mcm-fields">
          <div className="mcm-field">
            <div className="mcm-field-label">Location</div>
            <div className="mcm-field-val"><Pill kind="location">{m.loc}</Pill></div>
          </div>
          <div className="mcm-field">
            <div className="mcm-field-label">X handle</div>
            <div className="mcm-field-val"><Pill kind="x">{links.x}</Pill></div>
          </div>
          <div className="mcm-field">
            <div className="mcm-field-label">Github Link</div>
            <div className="mcm-field-val"><Pill kind="github">{links.github}</Pill></div>
          </div>
          <div className="mcm-field">
            <div className="mcm-field-label">Company URL</div>
            <div className="mcm-field-val"><Pill kind="company">{links.company}</Pill></div>
          </div>
          <div className="mcm-field">
            <div className="mcm-field-label">What region are you focused on?</div>
            <div className="mcm-field-val"><Pill kind="region">{REGION_LABEL(m.region)}</Pill></div>
          </div>
          <div className="mcm-field">
            <div className="mcm-field-label">Which sectors of the onchain economy do you work on or support?</div>
            <div className="mcm-field-val">
              {(m.sectors || []).map(s => <Pill key={s} kind="sector">{s}</Pill>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { MemberCard });
