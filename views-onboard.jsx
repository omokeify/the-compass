// Post-signup onboarding wizard + Daily quests widget

const OnboardingWizard = ({ onClose, onComplete, currentUser }) => {
  const [step, setStep] = React.useState(0);
  const [interests, setInterests] = React.useState(new Set(['alpha', 'earn']));
  const [follows, setFollows] = React.useState(new Set());

  const toggle = (setter, v) => setter(curr => {
    const n = new Set(curr);
    if (n.has(v)) n.delete(v); else n.add(v);
    return n;
  });

  const suggested = [...USERS].sort((a, b) => b.kp - a.kp).slice(0, 6);
  const steps = ['interests', 'follow', 'action'];
  const pct = ((step + 1) / steps.length) * 100;

  return (
    <div className="modal-wrap" onClick={(e) => e.stopPropagation()}>
      <div className="modal onboard-modal" onClick={e => e.stopPropagation()}>
        <div className="onboard-bar"><div className="onboard-bar-fill" style={{ width: pct + '%' }} /></div>

        <div className="onboard-body">
          {step === 0 && (
            <>
              <div className="onboard-step-label">Step 1 of 3</div>
              <h1 className="onboard-title">What are you here for?</h1>
              <p className="onboard-sub">Pick a few — we'll tune your feed and notifications to match.</p>
              <div className="onboard-interests">
                {CATEGORIES.map(c => {
                  const meta = CAT_META[c.id];
                  const on = interests.has(c.id);
                  return (
                    <button key={c.id} className={`onboard-int ${on ? 'on' : ''}`} onClick={() => toggle(setInterests, c.id)}>
                      <span className="oi-dot" style={{ background: meta.bg }} />
                      <span className="oi-name">{c.name}</span>
                      {on && <span className="oi-check"><Icon name="check" size={12} /></span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="onboard-step-label">Step 2 of 3</div>
              <h1 className="onboard-title">Follow a few navigators.</h1>
              <p className="onboard-sub">Their posts and alpha will show up in your feed. Follow at least 3.</p>
              <div className="onboard-follows">
                {suggested.map(u => {
                  const on = follows.has(u.handle);
                  return (
                    <div key={u.handle} className="onboard-follow">
                      <Avatar user={u} size={40} />
                      <div className="of-body">
                        <div className="of-name">{u.name}</div>
                        <div className="of-role">{u.bio}</div>
                      </div>
                      <button className={`btn ${on ? 'ghost' : 'primary'} sm`} onClick={() => toggle(setFollows, u.handle)}>
                        {on ? <><Icon name="check" size={11} /> Following</> : 'Follow'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="onboard-step-label">Step 3 of 3</div>
              <h1 className="onboard-title">You're all set, {currentUser.name.split(' ')[0]}.</h1>
              <p className="onboard-sub">Here's how to get your first Knowledge Points today.</p>
              <div className="onboard-actions">
                <div className="oa-row"><span className="oa-icon"><Icon name="compass" size={16} /></span><div><div className="oa-t">Say GM in the daily check-in</div><div className="oa-d">+10 KP · takes 10 seconds</div></div><span className="oa-kp">+10</span></div>
                <div className="oa-row"><span className="oa-icon"><Icon name="spark" size={16} /></span><div><div className="oa-t">React to today's top alpha</div><div className="oa-d">+15 KP · in Alpha Corner</div></div><span className="oa-kp">+15</span></div>
                <div className="oa-row"><span className="oa-icon"><Icon name="cap" size={16} /></span><div><div className="oa-t">Join the live ZK class</div><div className="oa-d">+40 KP · happening now</div></div><span className="oa-kp">+40</span></div>
              </div>
            </>
          )}
        </div>

        <div className="onboard-foot">
          {step > 0
            ? <button className="btn ghost" onClick={() => setStep(s => s - 1)}>Back</button>
            : <button className="btn ghost" onClick={onComplete}>Skip</button>}
          {step < 2
            ? <button className="btn primary" disabled={step === 0 && interests.size === 0} onClick={() => setStep(s => s + 1)}>
                Continue <Icon name="arrow-right" size={13} />
              </button>
            : <button className="btn primary" onClick={onComplete}>Enter the Compass <Icon name="arrow-right" size={13} /></button>}
        </div>
      </div>
    </div>
  );
};

// ---------- Daily quests widget (home) ----------
const QuestsWidget = ({ navigate }) => {
  const [quests, setQuests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    window.questService.today().then(list => { setQuests(list); setLoading(false); });
  }, []);

  const doneCount = quests.filter(q => q.done).length;
  const total = quests.length;
  const earned = quests.filter(q => q.done).reduce((s, q) => s + q.kp, 0);
  const possible = quests.reduce((s, q) => s + q.kp, 0);
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const complete = async (id) => {
    const ok = await window.questService.complete(id);
    if (ok) {
      setQuests(qs => qs.map(q => q.id === id ? { ...q, done: true } : q));
      if (typeof window.refreshUser === 'function') window.refreshUser();
    }
  };

  if (loading) return null;

  return (
    <div className="quests-widget">
      <div className="qw-left">
        <div className="qw-streak">
          <div className="qw-flame"><Icon name="flame" size={22} /></div>
          <div>
            <div className="qw-streak-n">7-day streak</div>
            <div className="qw-streak-sub">Keep it alive — come back tomorrow</div>
          </div>
        </div>
        <div className="qw-week">
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={i} className={`qw-day ${i < 5 ? 'on' : i === 5 ? 'today' : ''}`}>
              {i < 5 ? <Icon name="check" size={11} /> : d}
            </div>
          ))}
        </div>
        <div className="qw-progress-row">
          <div className="qw-progress"><div className="qw-progress-fill" style={{ width: pct + '%' }} /></div>
          <span className="qw-progress-l">{earned}/{possible} KP today</span>
        </div>
      </div>
      <div className="qw-right">
        <div className="qw-head">Today's quests <span>{doneCount}/{total}</span></div>
        <div className="qw-list">
          {quests.map(q => (
            <button key={q.id} className={`qw-quest ${q.done ? 'done' : ''}`} onClick={() => !q.done && complete(q.id)}>
              <span className="qq-check">{q.done ? <Icon name="check" size={12} /> : <Icon name={q.icon} size={13} />}</span>
              <div className="qq-body">
                <div className="qq-label">{q.label}</div>
                <div className="qq-desc">{q.desc}</div>
              </div>
              <span className="qq-kp">+{q.kp}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { OnboardingWizard, QuestsWidget });
