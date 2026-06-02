// Conferences / Classes — admin Studio, schedule modal, class cards

const canHost = (user) => canCreateEvent(user);

// ---------- Class Card (shared: studio, events, dashboard) ----------
const ClassCard = ({ cls, registered, onRegister, onJoin, onManage, admin, currentUser }) => {
  const host = userByHandle(cls.host);
  const cat = CATEGORIES.find(c => c.id === cls.cat);
  const seatsLeft = cls.capacity - cls.registered;
  const pct = Math.min(100, Math.round((cls.registered / cls.capacity) * 100));
  const isReg = registered && registered.has(cls.id);
  const attended = currentUser && hasAttended(currentUser.handle, cls.id);

  return (
    <article className={`class-card status-${cls.status}`}>
      <div className="cc-cover" style={{ background: `linear-gradient(135deg, oklch(0.7 0.16 ${cls.cover}), oklch(0.4 0.14 ${cls.cover}))` }}>
        <div className="tc-cover-grid" />
        <div className="cc-cover-top">
          {cls.status === 'live'      && <span className="cc-status live"><span className="space-live-pip" /> Live now</span>}
          {cls.status === 'scheduled' && <span className="cc-status sched"><Icon name="calendar" size={11} /> {cls.when}</span>}
          {cls.status === 'ended'     && <span className="cc-status ended"><Icon name="play" size={11} /> Replay</span>}
          {cls.recorded && cls.status !== 'ended' && <span className="cc-rec"><span className="cc-rec-dot" /> REC</span>}
        </div>
        <div className="cc-cover-glyph"><Icon name="cap" size={56} /></div>
      </div>

      <div className="cc-body">
        {cat && <CategoryPill cat={cat} />}
        <h3 className="cc-title">{cls.title}</h3>
        <p className="cc-desc">{cls.desc}</p>

        <div className="cc-host">
          <AvatarStack handles={[cls.host, ...cls.cohosts]} size={24} max={3} />
          <div>
            <div className="cc-host-name">{host.name}</div>
            <div className="cc-host-role">{cls.cohosts.length ? `+ ${cls.cohosts.length} co-host` : 'hosting'} · {cls.durationMin} min</div>
          </div>
        </div>

        {/* Capacity meter */}
        <div className="cc-cap">
          <div className="cc-cap-bar"><div className="cc-cap-fill" style={{ width: pct + '%' }} /></div>
          <div className="cc-cap-meta">
            <span><strong>{cls.registered}</strong> registered</span>
            {cls.status !== 'ended'
              ? <span>{seatsLeft > 0 ? `${seatsLeft} seats left` : 'Waitlist'}</span>
              : <span>{cls.attended} attended</span>}
          </div>
        </div>

        <div className="cc-actions">
          {admin ? (
            <>
              <button className="btn ghost sm" onClick={() => onManage(cls)}>Manage</button>
              {cls.status === 'live'
                ? <button className="btn primary sm" onClick={() => onJoin(cls)}><Icon name="mic" size={11} /> Enter room</button>
                : cls.status === 'scheduled'
                  ? <button className="btn dark sm" onClick={() => onJoin(cls)}>Start early</button>
                  : <button className="btn ghost sm" onClick={() => onJoin(cls)}><Icon name="play" size={11} /> Watch</button>}
            </>
          ) : (
            <>
              {cls.status === 'live' && <button className="btn primary sm" onClick={() => onJoin(cls)}><Icon name="arrow-right" size={11} /> Join class</button>}
              {cls.status === 'scheduled' && (
                isReg
                  ? <button className="btn ghost sm registered" onClick={() => onRegister(cls)}><Icon name="check" size={11} /> Registered</button>
                  : <button className="btn primary sm" onClick={() => onRegister(cls)}>Register {seatsLeft <= 0 && '(waitlist)'}</button>
              )}
              {cls.status === 'ended' && (
                attended
                  ? <button className="btn primary sm" onClick={() => onJoin(cls)}><Icon name="play" size={11} /> Watch replay</button>
                  : <button className="btn ghost sm" disabled><Icon name="lock" size={11} /> Purchase replay</button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
};

// ---------- Studio (admin/moderator only) ----------
const StudioPage = ({ navigate, currentUser, registered, onRegister, onJoin, onSchedule }) => {
  const [tab, setTab] = React.useState('all');
  const [list, setList] = React.useState(() => [...CONFERENCES]);

  React.useEffect(() => { conferenceService.list().then(setList); }, []);

  const refresh = () => { conferenceService.list().then(setList); };

  React.useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('compass_conferences_refresh', handler);
    return () => window.removeEventListener('compass_conferences_refresh', handler);
  }, [refresh]);

  // Expose refresh so ScheduleClassModal can trigger it
  React.useEffect(() => { window.__studioRefresh = refresh; return () => { delete window.__studioRefresh; }; }, []);

  const tabs = [
    { id: 'all', label: 'All classes' },
    { id: 'live', label: 'Live', filter: c => c.status === 'live' },
    { id: 'scheduled', label: 'Scheduled', filter: c => c.status === 'scheduled' },
    { id: 'ended', label: 'Past', filter: c => c.status === 'ended' },
  ];
  const active = tabs.find(t => t.id === tab);
  const filtered = active.filter ? list.filter(active.filter) : list;

  if (!canHost(currentUser)) {
    return (
      <div className="view">
        <div className="studio-locked">
          <span className="sl-icon"><Icon name="lock" size={26} /></span>
          <h1>Studio is for moderators & admins.</h1>
          <p>Hosting live classes is limited to Trailblazer-tier and Compass Legend accounts. Earn KP and get promoted, or ping a moderator.</p>
          <button className="btn primary" onClick={() => navigate({ view: 'events' })}>Browse upcoming classes</button>
        </div>
      </div>
    );
  }

  const liveCount = list.filter(c => c.status === 'live').length;
  const totalReg = list.reduce((s, c) => s + c.registered, 0);

  return (
    <div className="view studio-view">
      <section className="studio-hero">
        <div>
          <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Studio · Moderators</div>
          <h1 className="th-title">Host a class. Teach the community live.</h1>
          <p className="th-sub">
            Schedule a live session, share your screen, and teach. Classes publish to Events,
            notify everyone who registers, and can be recorded for replay.
          </p>
        </div>
        <div className="th-cta">
          <button className="btn primary lg" onClick={onSchedule}>
            <Icon name="plus" size={14} /> Schedule a class
          </button>
        </div>
      </section>

      <div className="studio-stats">
        <div className="ss-cell"><div className="ss-n">{liveCount}</div><div className="ss-l">live now</div></div>
        <div className="ss-cell"><div className="ss-n">{list.filter(c=>c.status==='scheduled').length}</div><div className="ss-l">upcoming</div></div>
        <div className="ss-cell"><div className="ss-n">{totalReg.toLocaleString()}</div><div className="ss-l">total registered</div></div>
        <div className="ss-cell"><div className="ss-n">96%</div><div className="ss-l">avg attendance</div></div>
      </div>

      <div className="spaces-tabs">
        {tabs.map(tt => (
          <button key={tt.id} className={`tf-pill ${tab === tt.id ? 'active' : ''}`} onClick={() => setTab(tt.id)}>
            {tt.label}
            {tt.id === 'live' && liveCount > 0 && <span className="space-live-pip" />}
          </button>
        ))}
      </div>

      <div className="class-grid">
        {filtered.map(c => (
          <ClassCard key={c.id} cls={c} admin registered={registered} onRegister={onRegister} onJoin={onJoin} onManage={() => onJoin(c)} />
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { canHost, ClassCard, StudioPage });
