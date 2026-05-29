// Messages / DMs view — two-column conversation list + thread

const MessagesPage = ({ navigate }) => {
  const [activeId, setActiveId] = React.useState(CONVERSATIONS[0].id);
  const [draft, setDraft] = React.useState('');
  const [convos, setConvos] = React.useState(CONVERSATIONS);
  const [search, setSearch] = React.useState('');

  const active = convos.find(c => c.id === activeId);

  const sendMessage = () => {
    if (!draft.trim() || !active) return;
    const text = draft.trim();
    setConvos(arr => arr.map(c =>
      c.id === activeId
        ? { ...c, messages: [...c.messages, { from: 'kelechi.eth', when: 'just now', body: text }], last: text, lastWhen: 'just now' }
        : c
    ));
    setDraft('');
  };

  const filtered = convos.filter(c => {
    if (!search) return true;
    const u = userByHandle(c.with);
    return u.name.toLowerCase().includes(search.toLowerCase()) ||
           u.handle.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="view messages-view">
      <div className="msg-layout">
        {/* Conversation list */}
        <aside className="msg-list-col">
          <header className="msg-list-head">
            <h1 className="msg-list-title">Messages</h1>
            <button className="btn primary sm"><Icon name="plus" size={12} /> New</button>
          </header>
          <div className="msg-search">
            <Icon name="search" size={13} />
            <input
              placeholder="Search messages…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ul className="msg-list">
            {filtered.length === 0 && <li className="empty" style={{ margin: 16 }}>No matches.</li>}
            {filtered.map(c => {
              const u = userByHandle(c.with);
              return (
                <li
                  key={c.id}
                  className={`msg-row ${activeId === c.id ? 'active' : ''} ${c.unread ? 'unread' : ''}`}
                  onClick={() => setActiveId(c.id)}
                >
                  <Avatar user={u} size={40} />
                  <div className="msg-row-body">
                    <div className="msg-row-line1">
                      <span className="msg-name">{u.name}</span>
                      <span className="msg-when">{c.lastWhen}</span>
                    </div>
                    <div className="msg-row-line2">
                      <span className="msg-preview">{c.last}</span>
                      {c.unread > 0 && <span className="msg-badge">{c.unread}</span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Thread */}
        {active ? <MessageThread c={active} draft={draft} setDraft={setDraft} onSend={sendMessage} navigate={navigate} />
                : <div className="msg-empty">Select a conversation.</div>}
      </div>
    </div>
  );
};

const MessageThread = ({ c, draft, setDraft, onSend, navigate }) => {
  const u = userByHandle(c.with);
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [c.messages.length]);

  return (
    <section className="msg-thread">
      <header className="msg-thread-head">
        <Avatar user={u} size={36} />
        <button className="msg-thread-user" onClick={() => navigate({ view: 'profile', handle: u.handle })}>
          <span className="msg-thread-name">{u.name}</span>
          <span className="msg-thread-status"><span className="msg-status-dot" /> Online</span>
        </button>
        <div className="msg-thread-tools">
          <button className="btn ghost icon-only" title="Call"><Icon name="mic" size={14} /></button>
          <button className="btn ghost icon-only" title="More"><Icon name="menu" size={14} /></button>
        </div>
      </header>

      <div className="msg-thread-body" ref={scrollRef}>
        {c.messages.map((m, i) => {
          const mine = m.from === 'kelechi.eth';
          const prev = c.messages[i - 1];
          const showHeader = !prev || prev.from !== m.from;
          return (
            <div key={i} className={`msg-bubble-row ${mine ? 'mine' : ''}`}>
              {!mine && showHeader && <Avatar user={u} size={28} />}
              {!mine && !showHeader && <span className="msg-avatar-spacer" />}
              <div className="msg-bubble-wrap">
                <div className={`msg-bubble ${mine ? 'mine' : ''}`}>{m.body}</div>
                <div className="msg-bubble-when">{m.when}</div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="msg-composer">
        <button className="btn ghost icon-only"><Icon name="image" size={14} /></button>
        <input
          className="msg-input"
          placeholder={`Message ${u.name}…`}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
        />
        <button className="btn primary" disabled={!draft.trim()} onClick={onSend}>
          <Icon name="send" size={13} />
        </button>
      </footer>
    </section>
  );
};

Object.assign(window, { MessagesPage, MessageThread });
