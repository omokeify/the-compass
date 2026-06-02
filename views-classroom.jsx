// Schedule-a-class modal + live classroom (Google-Meet style) with Stage & Board

const ScheduleClassModal = ({ onClose, currentUser, onScheduled }) => {
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

  const submit = async () => {
    if (!canSubmit) return;
    const dt = new Date(`${date}T${time}`);
    const cls = {
      id: genConfId(),
      title: title.trim(),
      desc: desc.trim(),
      cat,
      host: currentUser.handle,
      cohosts: [],
      stage: [currentUser.handle],
      status: 'scheduled',
      when: dt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      scheduledISO: dt.toISOString(),
      durationMin: duration,
      capacity,
      registered: 0,
      registrants: [],
      attendees: [],
      recorded,
      publishEvents,
      notify,
      cover: currentUser.hue || 215,
      attended: 0,
      chat: [],
      boardStrokes: [],
    };
    await conferenceService.create(cls);
    setDone(true);
    if (onScheduled) onScheduled(cls);
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
// Whiteboard — simple canvas drawing
// =====================================================================
const TOOLS = [
  { id: 'pen', label: 'Pen', icon: '\u270E' },
  { id: 'eraser', label: 'Eraser', icon: '\u23F1' },
];
const COLORS = ['#ffffff', '#ff5c5c', '#febc2e', '#28c840', '#5c9aff', '#c85cff'];
const SIZES = [2, 4, 8, 14];

const Whiteboard = ({ cls, isHost }) => {
  const canvasRef = React.useRef(null);
  const [tool, setTool] = React.useState('pen');
  const [color, setColor] = React.useState('#ffffff');
  const [size, setSize] = React.useState(4);
  const [drawing, setDrawing] = React.useState(false);
  const [ctx, setCtx] = React.useState(null);

  React.useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const context = c.getContext('2d');
    const resize = () => {
      const parent = c.parentElement;
      c.width = parent.clientWidth;
      c.height = parent.clientHeight;
      context.fillStyle = '#1a1a1e';
      context.fillRect(0, 0, c.width, c.height);
    };
    resize();
    window.addEventListener('resize', resize);
    setCtx(context);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const getPos = (e) => {
    const c = canvasRef.current;
    const rect = c.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    return { x, y };
  };

  const startDraw = (e) => {
    if (!ctx) return;
    e.preventDefault();
    setDrawing(true);
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const draw = (e) => {
    if (!drawing || !ctx) return;
    e.preventDefault();
    const p = getPos(e);
    ctx.strokeStyle = tool === 'eraser' ? '#1a1a1e' : color;
    ctx.lineWidth = tool === 'eraser' ? size * 4 : size;
    ctx.lineCap = 'round';
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const stopDraw = (e) => {
    if (!ctx) return;
    setDrawing(false);
    ctx.closePath();
  };

  const clear = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.fillStyle = '#1a1a1e';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className="wb-wrap">
      <div className="wb-tools">
        <div className="wb-tool-group">
          {TOOLS.map(t => (
            <button key={t.id} className={`wb-tool ${tool === t.id ? 'active' : ''}`} onClick={() => setTool(t.id)} title={t.label}>
              {t.icon}
            </button>
          ))}
        </div>
        <div className="wb-tool-group">
          {COLORS.map(c => (
            <button key={c} className={`wb-color ${color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => { setTool('pen'); setColor(c); }} title={c} />
          ))}
        </div>
        <div className="wb-tool-group">
          {SIZES.map(s => (
            <button key={s} className={`wb-size ${size === s ? 'active' : ''}`} onClick={() => setSize(s)} title={`${s}px`}>
              <span style={{ width: s + 2, height: s + 2, borderRadius: '50%', background: 'white', display: 'inline-block' }} />
            </button>
          ))}
        </div>
        <button className="wb-clear" onClick={clear}>Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        className="wb-canvas"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
    </div>
  );
};

// =====================================================================
// LIVE CLASSROOM — Google-Meet style fullscreen room
// =====================================================================
const ClassroomView = ({ cls, currentUser, onLeave }) => {
  const host = userByHandle(cls.host);
  const isHost = cls.host === currentUser.handle || cls.cohosts.includes(currentUser.handle) || canHost(currentUser);
  const [mic, setMic] = React.useState(false);
  const [cam, setCam] = React.useState(false);
  const [sharing, setSharing] = React.useState(true);
  const [hand, setHand] = React.useState(false);
  const [panel, setPanel] = React.useState('chat');
  const [chat, setChat] = React.useState(cls.chat || []);
  const [draft, setDraft] = React.useState('');
  const [elapsed, setElapsed] = React.useState(0);
  const [reaction, setReaction] = React.useState(null);
  const [stageMode, setStageMode] = React.useState('spotlight');
  const [showBoard, setShowBoard] = React.useState(false);
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

  const stage = cls.stage || [cls.host];
  const audience = (cls.registrants || []).filter(h => !stage.includes(h));
  const attendees = [...new Set([...stage, ...audience])].slice(0, 20);
  const tilePeople = stage.slice(0, 7);

  const sendChat = () => {
    if (!draft.trim()) return;
    const msg = { who: currentUser.handle, body: draft.trim(), when: 'now' };
    setChat(c => [...c, msg]);
    conferenceService.addChat(cls.id, msg);
    setDraft('');
  };

  const fireReaction = (emoji) => {
    setReaction({ emoji, id: Date.now() });
    setTimeout(() => setReaction(null), 1600);
  };

  const promoteToStage = async (handle) => {
    await conferenceService.addToStage(cls.id, handle);
    if (!cls.stage) cls.stage = [];
    if (!cls.stage.includes(handle)) cls.stage.push(handle);
    setStageMode(s => s);
  };

  const removeFromStage = async (handle) => {
    await conferenceService.removeFromStage(cls.id, handle);
    if (cls.stage) cls.stage = cls.stage.filter(h => h !== handle);
    setStageMode(s => s);
  };

  const endClass = async () => {
    const allHandles = new Set([cls.host, ...(cls.registrants || [])]);
    allHandles.forEach(h => awardAttendance(h, cls.id, cls.title));
    await conferenceService.end(cls.id);
    cls.status = 'ended';
    onLeave();
  };

  return (
    <div className="classroom">
      {/* Top bar */}
      <header className="cr-top">
        <div className="cr-top-left">
          <span className="cr-live"><span className="space-live-pip" /> {cls.status === 'live' ? 'LIVE' : cls.status === 'scheduled' ? 'EARLY' : 'REPLAY'}</span>
          <div className="cr-title-wrap">
            <span className="cr-title">{cls.title}</span>
            <span className="cr-sub">{host.name} · {fmt(elapsed)} elapsed</span>
          </div>
        </div>
        <div className="cr-top-right">
          {showBoard && <button className="cr-board-toggle active" onClick={() => setShowBoard(false)}>Stage</button>}
          {!showBoard && <button className="cr-board-toggle" onClick={() => setShowBoard(true)}><span style={{fontSize:15}}>\u270E</span> Board</button>}
          {cls.recorded && <span className="cr-rec"><span className="cc-rec-dot" /> Recording</span>}
          <span className="cr-count"><Icon name="users" size={13} /> {cls.registered || 0}</span>
        </div>
      </header>

      {/* Body */}
      <div className="cr-body">
        {!showBoard ? (
          /* ======== STAGE VIEW ======== */
          <div className="cr-stage-wrap">
            <div className="cr-stage">
              {sharing ? (
                <div className="cr-screen">
                  <div className="cr-screen-chrome">
                    <span className="cr-screen-dot" /><span className="cr-screen-dot" /><span className="cr-screen-dot" />
                    <span className="cr-screen-label">{host.name} is presenting</span>
                  </div>
                  <div className="cr-slide">
                    <div className="cr-slide-kicker">{cls.cat.toUpperCase()} · LIVE SESSION</div>
                    <h2>{cls.title}</h2>
                    <p className="cr-slide-desc">{cls.desc || 'Welcome to the class! The host will begin shortly.'}</p>
                  </div>
                  {/* Host PiP */}
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

            {/* Stage controls bar */}
            {isHost && (
              <div className="cr-stage-controls">
                <span className="cr-stage-label">On stage ({stage.length})</span>
                <div className="cr-stage-mode">
                  <button className={`cr-sm-btn ${stageMode === 'spotlight' ? 'active' : ''}`} onClick={() => setStageMode('spotlight')}>Spotlight</button>
                  <button className={`cr-sm-btn ${stageMode === 'grid' ? 'active' : ''}`} onClick={() => setStageMode('grid')}>Grid</button>
                </div>
                <div className="cr-stage-hint">Click a listener to add them to stage</div>
              </div>
            )}

            {/* Filmstrip / Grid */}
            {stageMode === 'spotlight' ? (
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
                      {isHost && h !== cls.host && (
                        <button className="cr-tile-stage-rm" onClick={() => removeFromStage(h)} title="Remove from stage">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      )}
                    </div>
                  );
                })}
                <div className="cr-tile more">+{Math.max(0, attendees.length - tilePeople.length)}</div>
              </div>
            ) : (
              <div className="cr-grid">
                {tilePeople.map(h => {
                  const u = userByHandle(h);
                  return (
                    <div key={h} className={`cr-grid-tile ${h === cls.host ? 'host' : ''}`}>
                      <div className="cr-grid-avatar" style={{ background: `linear-gradient(135deg, oklch(0.6 0.16 ${u.hue}), oklch(0.35 0.12 ${u.hue}))` }}>
                        <Avatar user={u} size={48} />
                      </div>
                      <span className="cr-grid-name">{u.name.split(' ')[0]}{h === currentUser.handle ? ' (you)' : ''}</span>
                      <span className="cr-grid-label">{h === cls.host ? 'Host' : 'Speaker'}</span>
                      {isHost && h !== cls.host && (
                        <button className="cr-grid-stage-rm" onClick={() => removeFromStage(h)} title="Remove from stage">✕</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ======== BOARD VIEW ======== */
          <div className="cr-stage-wrap">
            <Whiteboard cls={cls} isHost={isHost} />
          </div>
        )}

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
                <div className="cr-people-sec">On stage · {stage.length}</div>
                {stage.map(h => {
                  const u = userByHandle(h);
                  return (
                    <div key={h} className="cr-person">
                      <Avatar user={u} size={32} />
                      <div className="cr-person-body"><div className="cr-person-name">{u.name}</div><div className="cr-person-role">{h === cls.host ? 'Host' : 'Speaker'}</div></div>
                      {isHost && h !== cls.host && (
                        <button className="cr-person-act" onClick={() => removeFromStage(h)} title="Remove from stage">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      )}
                    </div>
                  );
                })}
                {audience.length > 0 && (
                  <>
                    <div className="cr-people-sec">Listeners · {audience.length}</div>
                    {audience.map(h => {
                      const u = userByHandle(h);
                      return (
                        <div key={h} className="cr-person">
                          <Avatar user={u} size={32} />
                          <div className="cr-person-body"><div className="cr-person-name">{u.name}</div></div>
                          {isHost && (
                            <button className="cr-person-act" onClick={() => promoteToStage(h)} title="Add to stage">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
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
          {isHost && <button className="cr-end host" onClick={endClass}>End for all</button>}
          <button className="cr-end" onClick={onLeave}>Leave</button>
        </div>
      </footer>
    </div>
  );
};

Object.assign(window, { ScheduleClassModal, ClassroomView });
