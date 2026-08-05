// Messages / DMs view — two-column conversation list + thread

const MessagesPage = ({ navigate, currentUser }) => {
  const [activeId, setActiveId] = React.useState(null);
  const [draft, setDraft] = React.useState('');
  const [convos, setConvos] = React.useState(CONVERSATIONS);
  const [search, setSearch] = React.useState('');
  const [msgs, setMsgs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const me = currentUser?.handle || '';
  const visibleConvos = React.useMemo(() => {
    if (!me) return convos;
    return convos.filter((c) =>
      Array.isArray(c.participants) ? c.participants.includes(me) : c.with === me,
    );
  }, [convos, me]);

  const active = visibleConvos.find((c) => c.id === activeId);

  const loadConversations = async () => {
    try {
      const list = await messageService.listConversations();
      if (Array.isArray(list)) {
        CONVERSATIONS.length = 0;
        CONVERSATIONS.push(...list);
        setConvos([...CONVERSATIONS]);
      }
    } catch {}
  };

  const loadThread = async () => {
    if (!activeId) return;
    setLoading(true);
    try {
      const list = await messageService.getMessages(activeId);
      setMsgs(Array.isArray(list) ? list : []);
    } catch {
      setMsgs([]);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadConversations();
  }, []);
  React.useEffect(() => {
    loadThread();
  }, [activeId]);
  React.useEffect(() => {
    if (!activeId && visibleConvos.length > 0) {
      setActiveId(visibleConvos[0].id);
    }
  }, [visibleConvos, activeId]);

  React.useEffect(() => {
    const handler = () => loadConversations();
    window.addEventListener('compass_conversations_refresh', handler);
    return () => window.removeEventListener('compass_conversations_refresh', handler);
  }, []);

  const otherHandle = (c) => {
    if (!c || !Array.isArray(c.participants)) return c?.with || '';
    return c.participants.find((p) => p !== me) || c.participants[0] || c.with || '';
  };

  const sendMessage = async () => {
    if (!draft.trim() || !activeId) return;
    const text = draft.trim();
    setDraft('');
    try {
      await messageService.sendMessage({ conversationId: activeId, body: text });
      loadConversations();
      loadThread();
    } catch {}
  };

  const [showUserPicker, setShowUserPicker] = React.useState(false);
  const [userSearch, setUserSearch] = React.useState('');

  const newConversation = async (targetHandle) => {
    if (!targetHandle) return;
    try {
      const existing = convos.find(
        (c) =>
          Array.isArray(c.participants) &&
          c.participants.includes(targetHandle) &&
          c.participants.includes(me),
      );
      if (existing) {
        setActiveId(existing.id);
        setShowUserPicker(false);
        setUserSearch('');
        return;
      }
      const convo = await messageService.createConversation({
        participantHandles: [me, targetHandle],
      });
      if (convo?.id) {
        if (!CONVERSATIONS.find((c) => c.id === convo.id)) CONVERSATIONS.push(convo);
        setConvos([...CONVERSATIONS]);
        setActiveId(convo.id);
      }
      setShowUserPicker(false);
      setUserSearch('');
    } catch {}
  };

  const filteredUsers = (USERS || []).filter(
    (u) =>
      u.handle !== me &&
      (!userSearch ||
        u.handle.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.name.toLowerCase().includes(userSearch.toLowerCase())),
  );

  const filtered = visibleConvos.filter((c) => {
    if (!search) return true;
    const other = otherHandle(c);
    const u = userByHandle(other);
    return (
      (u?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u?.handle || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="view messages-view">
      <div className={`msg-layout ${activeId ? 'has-active' : ''}`}>
        <aside className="msg-list-col">
          <header className="msg-list-head">
            <h1 className="msg-list-title">Messages</h1>
            <button className="btn primary sm" onClick={() => setShowUserPicker(true)}>
              <Icon name="plus" size={12} /> New
            </button>
          </header>
          {showUserPicker && (
            <div
              className="msg-user-picker"
              style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0' }}
            >
              <div className="msg-search" style={{ margin: 0 }}>
                <Icon name="search" size={13} />
                <input
                  placeholder="Find a user…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <ul className="nd-list" style={{ maxHeight: 240, overflowY: 'auto', marginTop: 4 }}>
                {filteredUsers.length === 0 && <li className="nd-empty">No users found.</li>}
                {filteredUsers.map((u) => (
                  <li
                    key={u.handle}
                    className="nd-row"
                    style={{ cursor: 'pointer' }}
                    onClick={() => newConversation(u.handle)}
                  >
                    <Avatar user={u} size={32} />
                    <div className="nd-body">
                      <div className="nd-text">
                        <strong>{u.name}</strong>
                      </div>
                      <div className="nd-when">@{u.handle}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="msg-search">
            <Icon name="search" size={13} />
            <input
              placeholder="Search messages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ul className="msg-list">
            {filtered.length === 0 && (
              <li className="empty" style={{ margin: 16 }}>
                No matches.
              </li>
            )}
            {filtered.map((c) => {
              const other = otherHandle(c);
              const u = userByHandle(other);
              return (
                <li
                  key={c.id}
                  className={`msg-row ${activeId === c.id ? 'active' : ''} ${c.unread ? 'unread' : ''}`}
                  onClick={() => setActiveId(c.id)}
                >
                  <Avatar user={u} size={40} />
                  <div className="msg-row-body">
                    <div className="msg-row-line1">
                      <span className="msg-name">{u?.name}</span>
                      <span className="msg-when">
                        {c.last_when
                          ? new Date(c.last_when).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                    <div className="msg-row-line2">
                      <span className="msg-preview">{c.last_message || ''}</span>
                      {c.unread > 0 && <span className="msg-badge">{c.unread}</span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {activeId && active ? (
          <MessageThread
            convo={active}
            msgs={msgs}
            draft={draft}
            setDraft={setDraft}
            onSend={sendMessage}
            onBack={() => setActiveId(null)}
            otherUser={userByHandle(otherHandle(active))}
            loading={loading}
            navigate={navigate}
            me={me}
          />
        ) : (
          <div className="msg-thread msg-thread-empty">
            <div className="msg-thread-empty-card">
              <Icon name="chat" size={34} />
              <h2>Choose a conversation</h2>
              <p>Tap a message on the left to open its thread and keep your chat moving.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MessageThread = ({
  convo,
  msgs,
  draft,
  setDraft,
  onSend,
  onBack,
  otherUser,
  loading,
  navigate,
  me,
}) => {
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs.length]);

  return (
    <section className="msg-thread">
      <header className="msg-thread-head">
        <Avatar user={otherUser} size={36} />
        <button
          className="msg-thread-user"
          type="button"
          onClick={() => otherUser && navigate({ view: 'profile', handle: otherUser.handle })}
        >
          <span className="msg-thread-name">{otherUser?.name}</span>
          <span className="msg-thread-status">
            <span className="msg-status-dot" /> Online
          </span>
        </button>
        <div className="msg-thread-tools">
          <button className="btn ghost icon-only" title="Back" onClick={onBack}>
            <Icon name="chevron-left" size={14} />
          </button>
          <button className="btn ghost icon-only" title="More">
            <Icon name="menu" size={14} />
          </button>
        </div>
      </header>

      <div className="msg-thread-body" ref={scrollRef}>
        {loading && (
          <div className="empty" style={{ padding: 16 }}>
            Loading...
          </div>
        )}
        {!loading && msgs.length === 0 && (
          <div className="empty" style={{ padding: 16 }}>
            No messages yet.
          </div>
        )}
        {msgs.map((m, i) => {
          const mine = m.sender_handle === me || m.sender === me;
          const prev = msgs[i - 1];
          const showHeader = !prev || prev.sender_handle !== m.sender_handle;
          return (
            <div key={m.id || i} className={`msg-bubble-row ${mine ? 'mine' : ''}`}>
              {!mine && showHeader && <Avatar user={otherUser} size={28} />}
              {!mine && !showHeader && <span className="msg-avatar-spacer" />}
              <div className="msg-bubble-wrap">
                <div className={`msg-bubble ${mine ? 'mine' : ''}`}>{m.body}</div>
                <div className="msg-bubble-when">
                  {m.created_at
                    ? new Date(m.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : m.when || ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="msg-composer">
        <button
          type="button"
          className="btn ghost icon-only msg-icon-btn"
          title="Voice note"
          onClick={() => window.showToast?.('Voice notes coming soon')}
        >
          <Icon name="mic" size={15} />
        </button>
        <button className="btn ghost icon-only msg-icon-btn" type="button" title="Add attachment">
          <Icon name="image" size={15} />
        </button>
        <input
          className="msg-input"
          placeholder={`Message ${otherUser?.name}…`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <button className="btn primary" disabled={!draft.trim()} onClick={onSend}>
          <Icon name="send" size={13} />
        </button>
      </footer>
    </section>
  );
};

Object.assign(window, { MessagesPage, MessageThread });
