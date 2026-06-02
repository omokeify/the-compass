// Notifications drawer (slide-in panel from the right of the topbar)

const NOTIF_ICONS = {
  mention:   { icon: 'chat',     color: '#0b0b0b' },
  like:      { icon: 'arrow-up', color: '#0b0b0b', bg: '#FFEA00' },
  follow:    { icon: 'users',    color: '#3a4878', bg: '#dde2f0' },
  validated: { icon: 'check',    color: '#194d2a', bg: '#d9ecdf' },
  reply:     { icon: 'reply',    color: '#0b0b0b', bg: '#ece8e0' },
  bounty:    { icon: 'wallet',   color: '#7a1f06', bg: '#fde2dc' },
  message:   { icon: 'send',     color: '#241540', bg: '#ece5fb' },
  kp:        { icon: 'medal',    color: '#0b0b0b', bg: '#FFEA00' },
  event:     { icon: 'calendar', color: '#6b3f00', bg: '#fbedcc' },
};

const NotificationsDrawer = ({ onClose, navigate }) => {
  const [tab, setTab] = React.useState('all');
  const [items, setItems] = React.useState(NOTIFICATIONS);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const refresh = () => setItems([...NOTIFICATIONS]);
    window.addEventListener('compass_notif_refresh', refresh);
    return () => window.removeEventListener('compass_notif_refresh', refresh);
  }, []);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const visible = tab === 'unread' ? items.filter(i => i.unread) :
                  tab === 'mentions' ? items.filter(i => i.kind === 'mention') :
                  items;
  const unreadCount = items.filter(i => i.unread).length;

  const markAllRead = () => {
    setItems(arr => arr.map(i => ({ ...i, unread: false })));
    window.supabaseService?.markAllNotificationsRead();
  };

  const markOneRead = (id) => {
    setItems(arr => arr.map(i => i.id === id ? { ...i, unread: false } : i));
    window.supabaseService?.markNotificationRead(id);
  };

  const timeAgo = (ts) => {
    if (!ts) return '';
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return mins + 'm';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h';
    const days = Math.floor(hrs / 24);
    return days + 'd';
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="notif-drawer" ref={ref}>
        <header className="nd-head">
          <div>
            <h2 className="nd-title">Notifications</h2>
            <p className="nd-sub">{unreadCount > 0 ? `${unreadCount} new` : 'All caught up.'}</p>
          </div>
          <div className="nd-tools">
            {unreadCount > 0 && (
              <button className="nd-link" onClick={markAllRead}>Mark all read</button>
            )}
            <button className="btn ghost icon-only" onClick={onClose} title="Close">
              <Icon name="x" size={14} />
            </button>
          </div>
        </header>

        <div className="nd-tabs">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'mentions', label: 'Mentions' },
          ].map(t => (
            <button
              key={t.id}
              className={`nd-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.count > 0 && <span className="nd-tab-count">{t.count}</span>}
            </button>
          ))}
        </div>

        <ul className="nd-list">
          {visible.length === 0 && (
            <li className="nd-empty">Nothing here yet.</li>
          )}
          {visible.map(item => {
            const who = item.actor_handle ? userByHandle(item.actor_handle) : null;
            const meta = NOTIF_ICONS[item.kind] || NOTIF_ICONS.reply;
            return (
              <li key={item.id} className={`nd-row ${item.unread ? 'unread' : ''}`} onClick={() => markOneRead(item.id)}>
                {who
                  ? <Avatar user={who} size={36} />
                  : <span className="nd-system-icon" style={{ background: meta.bg, color: meta.color }}>
                      <Icon name={meta.icon} size={16} />
                    </span>}
                <span
                  className="nd-kind-pip"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  <Icon name={meta.icon} size={10} />
                </span>
                <div className="nd-body">
                  <div className="nd-text">
                    {who && <strong>{who.name}</strong>}
                    <span> {item.text}</span>
                    {item.target && <em> {item.target}</em>}
                  </div>
                  <div className="nd-when">{timeAgo(item.created_at)}</div>
                </div>
                {item.unread && <span className="nd-dot" />}
              </li>
            );
          })}
        </ul>

        <footer className="nd-foot">
          <button className="btn ghost sm">Notification settings</button>
        </footer>
      </aside>
    </>
  );
};

Object.assign(window, { NotificationsDrawer });
