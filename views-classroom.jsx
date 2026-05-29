// Schedule-a-class modal + live classroom (Google-Meet style)

const ScheduleClassModal = ({ onClose, currentUser }) => {
  const [title, setTitle] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [cat, setCat] = React.useState('training');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [duration, setDuration] = React.useState(60);
  const [capacity, setCapacity] = React.useState(150);
  const [recorded, setRecorded] = React.useState(true);
  const [publishEvents, setPublishEvents] = React.useState(true);
  const [notify, setNotify] = React.useState(true);
  const [done, setDone] = React.useState(false);

  const canSubmit = title.trim() && date && time;

  const submit = () => {
    if (!canSubmit) return;
    setDone(true);
    setTimeout(onClose, 1700);
  };

  return (
    <div className="modal-wrap" onClick={onClose}>
      <div className="modal schedule-modal" onClick={e => e.stopPropagation()}>
        {!done ? (
          <>
            <div className="modal-head">
              <div className="modal-eyebrow"><Icon name="cap" size={15} /> Schedule a class</div>
              <button className="btn ghost icon-only" onClick={onClose}><Icon name="x" size={14} /></button>
            </div>
            <div className="modal-body">
              <label className="cf-label">Class title</label>
              <input className="cf-input" placeholder="e.g. ZK Fundamentals — Lesson 4" value={title} onChange={e => setTitle(e.target.value)} />

              <label className="cf-label">Description</label>
              <textarea className="cf-textarea" rows={3} placeholder="What will you teach? What should attendees bring?" value={desc} onChange={e => setDesc(e.target.value)} style={{ minHeight: 80 }} />

              <label className="cf-label">Category</label>
              <div className="cat-picker">
                {CATEGORIES.map(c => {
                  const meta = CAT_META[c.id];
                  return (
                    <button key={c.id} className={`cat-opt ${cat === c.id ? 'active' : ''}`} onClick={() => setCat(c.id)}>
                      <span className="cat-opt-dot" style={{ background: meta.bg }} />
                      <span className="cat-opt-code">{c.code}</span>
                      <span className="cat-opt-name">{c.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="sched-row-2">
                <div>
                  <label className="cf-label">Date</label>
                  <input className="cf-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <label className="cf-label">Start time</label>
                  <input className="cf-input" type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>

              <div className="sched-row-2">
                <div>
                  <label className="cf-label">Duration (min)</label>
                  <input className="cf-input" type="number" value={duration} onChange={e => setDuration(e.target.value)} min={15} step={15} />
                </div>
                <div>
                  <label className="cf-label">Capacity</label>
                  <input className="cf-input" type="number" value={capacity} onChange={e => setCapacity(e.target.value)} min={10} step={10} />
                </div>
              </div>

              <label className="cf-label">Options</label>
              <div className="sched-opts">
                <label className="sched-opt">
                  <input type="checkbox" checked={recorded} onChange={() => setRecorded(v => !v)} />
                  <span className="mv-check-box" />
                  <span>Record for replay (auto-publishes after class)</span>
                </label>
                <label className="sched-opt">
                  <input type="checkbox" checked={publishEvents} onChange={() => setPublishEvents(v => !v)} />
                  <span className="mv-check-box" />
                  <span>Publish to the Events page</span>
                </label>
                <label className="sched-opt">
                  <input type="checkbox" checked={notify} onChange={() => setNotify(v => !v)} />
                  <span className="mv-check-box" />
                  <span>Notify registrants when it goes live</span>
                </label>
              </div>
            </div>
            <div className="modal-foot">
              <span className="mf-hint">Hosting as {currentUser.name} · {currentUser.tier}</span>
              <div className="mf-right">
                <button className="btn ghost" onClick={onClose}>Cancel</button>
                <button className="btn primary" disabled={!canSubmit} onClick={submit}>
                  <Icon name="calendar" size={12} /> Schedule class
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="sf-success" style={{ minHeight: 380 }}>
            <div className="sf-success-mark"><Icon name="check" size={28} /></div>
            <h1 className="sf-title">Class scheduled.</h1>
            <p className="sf-sub">Published to Events. {notify ? 'Registrants will be notified when you go live.' : ''}</p>
            <div className="sf-loader"><span /></div>
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================================
// LIVE CLASSROOM — Google-Meet style fullscreen room
// =====================================================================
const CLASS_CHAT = [
  { who: 'kweku.sol',   body: 'This circuit example is 🔥', when: '2m' },
  { who: 'ayo.web3',    body: 'Can you re-share the constraint slide?', when: '1m' },
  { who: 'mosi_dao',    body: 'Following along in Foundry — works.', when: '1m' },
  { who: 'tinuke.builds', body: 'Question: how do we handle range checks here?', when: '40s', q: true },
];

const ClassroomView = ({ cls, currentUser, onLeave }) => {
  const host = userByHandle(cls.host);
  const isHost = cls.host === currentUser.handle || cls.cohosts.includes(currentUser.handle) || canHost(currentUser);
  const [mic, setMic] = React.useState(false);
  const [cam, setCam] = React.useState(false);
  const [sharing, setSharing] = React.useState(true); // host is presenting
  const [hand, setHand] = React.useState(false);
  const [panel, setPanel] = React.useState('chat'); // chat | people | qa | null
  const [chat, setChat] = React.useState(CLASS_CHAT);
  const [draft, setDraft] = React.useState('');
  const [elapsed, setElapsed] = React.useState(0);
  const [reaction, setReaction] = React.useState(null);
  const chatRef = React.useRef(null);

  React.useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);
  React.useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat.length, panel]);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onLeave(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onLeave]);

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // Pretend attendee tiles (de-duped so the same person never appears twice)
  const tilePeople = [...new Set([cls.host, ...cls.cohosts, 'mosi_dao', 'ayo.web3', 'tinuke.builds', 'kweku.sol', 'iyabo_nft', 'nana_btc'])].slice(0, 7);
  const peopleAll = [...new Set([cls.host, ...cls.cohosts, ...USERS.map(u => u.handle)])].slice(0, 12);

  const sendChat = () => {
    if (!draft.trim()) return;
    setChat(c => [...c, { who: currentUser.handle, body: draft.trim(), when: 'now' }]);
    setDraft('');
  };

  const fireReaction = (emoji) => {
    setReaction({ emoji, id: Date.now() });
    setTimeout(() => setReaction(null), 1600);
  };

  return (
    <div className="classroom">
      {/* Top bar */}
      <header className="cr-top">
        <div className="cr-top-left">
          <span className="cr-live"><span className="space-live-pip" /> LIVE</span>
          <div className="cr-title-wrap">
            <span className="cr-title">{cls.title}</span>
            <span className="cr-sub">{host.name} · {fmt(elapsed)} elapsed</span>
          </div>
        </div>
        <div className="cr-top-right">
          {cls.recorded && <span className="cr-rec"><span className="cc-rec-dot" /> Recording</span>}
          <span className="cr-count"><Icon name="users" size={13} /> {cls.attending || cls.registered}</span>
        </div>
      </header>

      {/* Stage + panel */}
      <div className="cr-body">
        <div className="cr-stage-wrap">
          <div className="cr-stage">
            {sharing ? (
              <div className="cr-screen">
                <div className="cr-screen-chrome">
                  <span className="cr-screen-dot" /><span className="cr-screen-dot" /><span className="cr-screen-dot" />
                  <span className="cr-screen-label">{host.name} is presenting — circuit.zok</span>
                </div>
                <div className="cr-slide">
                  <div className="cr-slide-kicker">ZK FUNDAMENTALS · LESSON 3</div>
                  <h2>Circuits & Constraints</h2>
                  <pre className="cr-code">
{`template Multiplier() {
  signal input a;
  signal input b;
  signal output c;

  c <== a * b;        // a constraint
}

component main = Multiplier();`}
                  </pre>
                  <div className="cr-slide-foot">A constraint is an equation the prover must satisfy. <strong>Every <code>&lt;==</code> adds one.</strong></div>
                </div>
                {/* presenter PiP */}
                <div className="cr-pip">
                  <Avatar user={host} size={44} />
                  <span className="cr-pip-name">{host.name.split(' ')[0]} {isHost && cls.host === currentUser.handle ? '(you)' : ''}</span>
                  <span className="cr-pip-mic on"><Icon name="mic" size={11} /></span>
                </div>
              </div>
            ) : (
              <div className="cr-speaker">
                <Avatar user={host} size={120} />
                <div className="cr-speaker-name">{host.name}</div>
              </div>
            )}
            {reaction && <div className="cr-reaction-float">{reaction.emoji}</div>}
          </div>

          {/* Filmstrip */}
          <div className="cr-strip">
            {tilePeople.map((h, i) => {
              const u = userByHandle(h);
              const camOn = i === 1;
              return (
                <div key={h} className={`cr-tile ${i === 0 ? 'host' : ''}`}>
                  {camOn
                    ? <div className="cr-tile-cam" style={{ background: `linear-gradient(135deg, oklch(0.6 0.16 ${u.hue}), oklch(0.35 0.12 ${u.hue}))` }}><Avatar user={u} size={32} /></div>
                    : <Avatar user={u} size={40} />}
                  <span className="cr-tile-name">{u.name.split(' ')[0]}{h === currentUser.handle ? ' (you)' : ''}</span>
                  {i % 2 === 0 && <span className="cr-tile-mute"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11a7 7 0 0 1-14 0M12 19v3M4 4l16 16"/></svg></span>}
                </div>
              );
            })}
            <div className="cr-tile more">+{(cls.attending || cls.registered) - tilePeople.length}</div>
          </div>
        </div>

        {/* Side panel */}
        {panel && (
          <aside className="cr-panel">
            <div className="cr-panel-tabs">
              <button className={panel === 'chat' ? 'active' : ''} onClick={() => setPanel('chat')}>Chat</button>
              <button className={panel === 'people' ? 'active' : ''} onClick={() => setPanel('people')}>People</button>
              <button className={panel === 'qa' ? 'active' : ''} onClick={() => setPanel('qa')}>Q&amp;A</button>
              <button className="cr-panel-close" onClick={() => setPanel(null)}><Icon name="x" size={13} /></button>
            </div>

            {panel === 'chat' && (
              <>
                <div className="cr-chat" ref={chatRef}>
                  {chat.filter(c => !c.q).map((c, i) => {
                    const u = userByHandle(c.who);
                    return (
                      <div key={i} className="cr-chat-row">
                        <Avatar user={u} size={26} />
                        <div>
                          <div className="cr-chat-head"><span>{u.name.split(' ')[0]}</span><span className="cr-chat-when">{c.when}</span></div>
                          <div className="cr-chat-body">{c.body}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="cr-chat-composer">
                  <input placeholder="Send a message" value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendChat(); }} />
                  <button className="btn primary icon-only sm" onClick={sendChat}><Icon name="send" size={12} /></button>
                </div>
              </>
            )}

            {panel === 'people' && (
              <div className="cr-people">
                <div className="cr-people-sec">On stage · {1 + cls.cohosts.length}</div>
                {[cls.host, ...cls.cohosts].map(h => {
                  const u = userByHandle(h);
                  return (
                    <div key={h} className="cr-person">
                      <Avatar user={u} size={32} />
                      <div className="cr-person-body"><div className="cr-person-name">{u.name}</div><div className="cr-person-role">{h === cls.host ? 'Host' : 'Co-host'}</div></div>
                      {isHost && <button className="cr-person-act"><Icon name="mic" size={13} /></button>}
                    </div>
                  );
                })}
                <div className="cr-people-sec">Attendees · {(cls.attending || cls.registered)}</div>
                {peopleAll.slice(1 + cls.cohosts.length).map(h => {
                  const u = userByHandle(h);
                  return (
                    <div key={h} className="cr-person">
                      <Avatar user={u} size={32} />
                      <div className="cr-person-body"><div className="cr-person-name">{u.name}</div></div>
                      {isHost && <button className="cr-person-act" title="Mute"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 11a7 7 0 0 1-14 0M12 19v3"/></svg></button>}
                    </div>
                  );
                })}
              </div>
            )}

            {panel === 'qa' && (
              <div className="cr-qa">
                {chat.filter(c => c.q).map((c, i) => {
                  const u = userByHandle(c.who);
                  return (
                    <div key={i} className="cr-qa-card">
                      <div className="cr-qa-head"><Avatar user={u} size={24} /><span>{u.name.split(' ')[0]}</span><span className="cr-chat-when">{c.when}</span></div>
                      <div className="cr-qa-body">{c.body}</div>
                      <div className="cr-qa-actions">
                        <button><Icon name="arrow-up" size={12} /> 8</button>
                        {isHost && <button className="answer">Answer live</button>}
                      </div>
                    </div>
                  );
                })}
                <div className="cr-qa-empty">Upvoted questions rise to the top. The host answers live.</div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Control bar */}
      <footer className="cr-controls">
        <div className="cr-controls-left">
          <span className="cr-clock">{fmt(elapsed)}</span>
        </div>
        <div className="cr-controls-center">
          <button className={`cr-ctrl ${mic ? 'on' : 'off'}`} onClick={() => setMic(m => !m)} title={mic ? 'Mute' : 'Unmute'}>
            <Icon name="mic" size={18} />
            <span>{mic ? 'Mic on' : 'Muted'}</span>
          </button>
          <button className={`cr-ctrl ${cam ? 'on' : 'off'}`} onClick={() => setCam(c => !c)} title="Camera">
            <Icon name="eye" size={18} />
            <span>{cam ? 'Cam on' : 'Cam off'}</span>
          </button>
          {isHost && (
            <button className={`cr-ctrl ${sharing ? 'active' : ''}`} onClick={() => setSharing(s => !s)} title="Present">
              <Icon name="image" size={18} />
              <span>{sharing ? 'Stop share' : 'Present'}</span>
            </button>
          )}
          {!isHost && (
            <button className={`cr-ctrl ${hand ? 'active' : ''}`} onClick={() => setHand(h => !h)} title="Raise hand">
              <span style={{ fontSize: 18, lineHeight: 1 }}>✋</span>
              <span>{hand ? 'Lowered' : 'Raise'}</span>
            </button>
          )}
          <div className="cr-react">
            <button className="cr-ctrl" title="React"><span style={{ fontSize: 18 }}>😀</span><span>React</span></button>
            <div className="cr-react-menu">
              {['👏','🔥','❤️','😂','🎉','🧭'].map(e => <button key={e} onClick={() => fireReaction(e)}>{e}</button>)}
            </div>
          </div>
          <button className={`cr-ctrl ${panel === 'chat' ? 'active' : ''}`} onClick={() => setPanel(p => p === 'chat' ? null : 'chat')} title="Chat">
            <Icon name="chat" size={18} /><span>Chat</span>
          </button>
          <button className={`cr-ctrl ${panel === 'people' ? 'active' : ''}`} onClick={() => setPanel(p => p === 'people' ? null : 'people')} title="People">
            <Icon name="users" size={18} /><span>People</span>
          </button>
        </div>
        <div className="cr-controls-right">
          {isHost && <button className="cr-end host">End for all</button>}
          <button className="cr-end" onClick={onLeave}>Leave</button>
        </div>
      </footer>
    </div>
  );
};

Object.assign(window, { ScheduleClassModal, ClassroomView });
