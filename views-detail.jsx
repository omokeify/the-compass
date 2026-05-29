// Topic, Profile, Leaderboard, Events, Tag, Composer — modern light edition

// ---------- Topic Detail ----------
const TopicPage = ({ topicId, navigate }) => {
  const topic = TOPICS.find(t => t.id === topicId);
  if (!topic) return <div className="view"><div className="empty">Topic not found.</div></div>;
  const cat = CATEGORIES.find(c => c.id === topic.cat);
  const author = userByHandle(topic.author);
  const [reply, setReply] = React.useState('');
  const [likes, setLikes] = React.useState(topic.likes);
  const [liked, setLiked] = React.useState(false);
  const [replies, setReplies] = React.useState(topic.replyThread || []);

  const submitReply = () => {
    if (!reply.trim()) return;
    setReplies(r => [...r, { author: 'kelechi.eth', when: 'just now', body: reply.trim(), likes: 0 }]);
    setReply('');
  };

  return (
    <div className="view topic">
      <div className="topic-head">
        <CategoryPill cat={cat} />
        <span className="topic-flags">
          {topic.pinned && <span className="tr-flag pin"><Icon name="pin" size={10} /> pinned</span>}
          {topic.hot && <span className="tr-flag hot"><Icon name="flame" size={10} /> hot</span>}
          {topic.validated && <span className="tr-flag validated"><Icon name="check" size={10} /> validated</span>}
          {topic.locked && <span className="tr-flag lock"><Icon name="lock" size={10} /> {topic.locked}+</span>}
        </span>
        <h1 className="topic-title">{topic.title}</h1>
        <div className="topic-submeta">
          <span>by <button className="link" onClick={() => navigate({ view: 'profile', handle: author.handle })}>{author.name}</button></span>
          <Dot />
          <span>{new Date(topic.created).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          <Dot />
          <span>{topic.views.toLocaleString()} views</span>
          <Dot />
          <span>{replies.length} replies</span>
        </div>
      </div>

      <article className="post op">
        <div className="post-rail">
          <Avatar user={author} size={48} />
          <div className="post-rail-meta">
            <button className="post-author" onClick={() => navigate({ view: 'profile', handle: author.handle })}>{author.name}</button>
            <TierBadge tier={author.tier} />
            <div className="post-rail-kp">{formatNum(author.kp)} KP · {author.loc}</div>
          </div>
        </div>
        <div className="post-body">
          {topic.body.split('\n').map((line, i) =>
            line.trim() === '' ? <div key={i} style={{ height: 8 }} /> :
            <p key={i}>{line}</p>
          )}
          {topic.tags.length > 0 && (
            <div className="post-tags">
              {topic.tags.map(t => <span key={t} className="meta-tag">#{t}</span>)}
            </div>
          )}
          {topic.bountySize && (
            <div className="bounty-card">
              <div className="bc-left">
                <Icon name="gift" size={14} />
                <span>Bounty</span>
              </div>
              <div>
                <div className="bc-amt">{topic.bountySize}</div>
                <div className="bc-meta">retainer · 2 seats · via Skill Marketplace</div>
              </div>
              <button className="btn primary sm">Apply <Icon name="arrow-right" size={11} /></button>
            </div>
          )}
          <div className="post-actions">
            <button className={`post-act ${liked ? 'on' : ''}`} onClick={() => { setLiked(!liked); setLikes(l => liked ? l-1 : l+1); }}>
              <Icon name="arrow-up" size={13} />
              <span>{likes}</span>
            </button>
            <button className="post-act"><Icon name="reply" size={13} /><span>Reply</span></button>
            <button className="post-act"><Icon name="eye" size={13} /><span>Watch</span></button>
            <button className="post-act"><Icon name="tag" size={13} /><span>Tag</span></button>
          </div>
        </div>
      </article>

      <div className="reply-thread">
        <div className="thread-header">
          <span className="th-label">{replies.length} replies</span>
          <div className="th-tools">
            <button className="btn ghost sm">Oldest first</button>
            <button className="btn ghost sm">Filter <Icon name="arrow-down" size={11} /></button>
          </div>
        </div>
        {replies.map((r, i) => {
          const u = userByHandle(r.author);
          return (
            <article key={i} className={`post reply ${r.mod ? 'mod' : ''}`}>
              <div className="post-rail">
                <Avatar user={u} size={38} />
                <div className="post-rail-meta">
                  <button className="post-author" onClick={() => navigate({ view: 'profile', handle: u.handle })}>{u.name}</button>
                  <TierBadge tier={u.tier} />
                  <div className="post-rail-kp">{r.when}</div>
                </div>
              </div>
              <div className="post-body">
                {r.validated && <div className="validated-stripe"><Icon name="check" size={10} /> Validated by 2 Navigators</div>}
                {r.mod && <div className="mod-stripe"><Icon name="compass" size={10} /> Moderator note</div>}
                <p>{r.body}</p>
                <div className="post-actions">
                  <button className="post-act"><Icon name="arrow-up" size={12} /><span>{r.likes}</span></button>
                  <button className="post-act"><Icon name="reply" size={12} /><span>Reply</span></button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="reply-composer">
        <Avatar user={userByHandle('kelechi.eth')} size={36} />
        <div className="rc-wrap">
          <textarea
            placeholder="Add to the thread…"
            value={reply}
            onChange={e => setReply(e.target.value)}
            rows={3}
          />
          <div className="rc-foot">
            <div className="rc-tips">
              <kbd className="kbd">B</kbd>
              <kbd className="kbd">I</kbd>
              <kbd className="kbd">@</kbd>
              <span className="rc-tip-text">Markdown supported · @ to mention</span>
            </div>
            <button className="btn primary sm" disabled={!reply.trim()} onClick={submitReply}>
              <Icon name="send" size={11} /> Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Profile (dashboard layout) ----------
const PROFILE_MENU = [
  { id: 'overview',      label: 'Overview',          icon: 'home' },
  { id: 'edit',          label: 'Edit Profile',      icon: 'gear' },
  { id: 'saved',         label: 'Saved',             icon: 'bookmark' },
  { id: 'wallet',        label: 'Wallet',            icon: 'wallet' },
  { id: 'groups',        label: 'My Groups',         icon: 'users' },
  { id: 'schedule',      label: 'My Schedule',       icon: 'calendar' },
  { id: 'courses',       label: 'My Courses',        icon: 'cap' },
  { id: 'contributions', label: 'My Contributions',  icon: 'chat' },
  { id: 'certificates',  label: 'My Certificates',   icon: 'medal' },
  { id: 'rules',         label: 'Contribution Rules', icon: 'book' },
  { id: 'settings',      label: 'Settings',          icon: 'gear' },
  { id: 'logout',        label: 'Logout',            icon: 'arrow-right', danger: true },
];

const ProfilePage = ({ handle, navigate, tab }) => {
  const u = userByHandle(handle);
  const [active, setActive] = React.useState(tab || 'overview');
  React.useEffect(() => { if (tab) setActive(tab); }, [tab]);

  const selectTab = (nextTab) => {
    setActive(nextTab);
    if (nextTab !== 'logout') {
      navigate({ view: 'profile', handle, tab: nextTab === 'overview' ? undefined : nextTab });
    }
  };

  return (
    <div className="view profile-dash">
      <div className="dash-layout">
        <aside className="dash-menu">
          <button className="dm-user" onClick={() => selectTab('overview')} title="View profile overview">
            <Avatar user={u} size={48} />
            <div className="dm-user-body">
              <div className="dm-user-name">{u.name}</div>
              <div className="dm-user-role">{u.tier} @ Compass</div>
              <div className="dm-user-mail">{u.handle.replace('.eth','').replace('.','')}{'@compass.community'}</div>
            </div>
          </button>
          <nav className="dm-list">
            {PROFILE_MENU.map(item => (
              <button
                key={item.id}
                className={`dm-item ${active === item.id ? 'active' : ''} ${item.danger ? 'danger' : ''}`}
                onClick={() => selectTab(item.id)}
              >
                <span className="dm-icon">
                  {item.id === 'saved'
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                    : <Icon name={item.icon} size={15} />}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="dash-content">
          <DashboardPanel u={u} tab={active} navigate={navigate} />
        </main>
      </div>
    </div>
  );
};

const DashboardPanel = ({ u, tab, navigate }) => {
  if (tab === 'overview')      return <DashOverview u={u} navigate={navigate} />;
  if (tab === 'edit')          return <DashEditProfile u={u} />;
  if (tab === 'saved')         return <SavedPage navigate={navigate} embedded />;
  if (tab === 'wallet')        return <WalletPage navigate={navigate} embedded />;
  if (tab === 'groups')        return <DashGroups u={u} />;
  if (tab === 'schedule')      return <DashSchedule u={u} />;
  if (tab === 'courses')       return <DashCourses u={u} />;
  if (tab === 'contributions') return <DashContributions u={u} navigate={navigate} />;
  if (tab === 'certificates')  return <DashCertificates u={u} />;
  if (tab === 'rules')         return <DashRules />;
  if (tab === 'settings')      return <DashSettings />;
  if (tab === 'logout')        return <DashLogout />;
  return null;
};

const PanelHeader = ({ kicker, title, sub, action }) => (
  <header className="dash-panel-head">
    <div>
      {kicker && <div className="dash-kicker">{kicker}</div>}
      <h1 className="dash-title">{title}</h1>
      {sub && <p className="dash-sub">{sub}</p>}
    </div>
    {action}
  </header>
);

// ---------- Sub-panels ----------
const DashOverview = ({ u, navigate }) => {
  const posts = TOPICS.filter(t => t.author === u.handle);
  const [following, setFollowing] = React.useState(false);
  const [followers, setFollowers] = React.useState(1248);
  const toggleFollow = () => {
    setFollowing(f => !f);
    setFollowers(c => following ? c - 1 : c + 1);
  };
  return (
    <>
      <PanelHeader
        kicker="Welcome back"
        title={`Hi, ${u.name.split(' ')[0]}.`}
        sub="Here's your bearing this month — KP, validations, and what's on the horizon."
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={following ? 'btn ghost' : 'btn primary'} onClick={toggleFollow}>
              {following
                ? <><Icon name="check" size={12} /> Following</>
                : <><Icon name="plus" size={12} /> Follow</>}
            </button>
            <button className="btn ghost" onClick={() => navigate({ view: 'messages' })}>
              <Icon name="send" size={12} /> Message
            </button>
          </div>
        }
      />
      <div className="prof-cover-sm" style={{ '--cover-bg': `linear-gradient(120deg, oklch(0.55 0.18 ${u.hue}), oklch(0.32 0.12 ${u.hue}))` }}>
        <div className="prof-cover-grid" />
        <div className="prof-cover-tag">
          <TierBadge tier={u.tier} />
          <span>· Bearing 038°</span>
        </div>
      </div>
      <div className="dash-stats">
        {[['1,420','KP this month'], ['12','Posts'], ['238','Replies'], [followers.toLocaleString(),'Followers']].map(([n,l]) => (
          <div key={l} className="ds-cell"><div className="ds-n">{n}</div><div className="ds-l">{l}</div></div>
        ))}
      </div>
      <h2 className="dash-section-title">Your recent posts</h2>
      {posts.length === 0
        ? <div className="empty">No posts yet — head to Discussions to start one.</div>
        : <div className="discussion-card">
            {posts.map(t => <TopicRow key={t.id} topic={t} navigate={navigate} />)}
          </div>}
    </>
  );
};

const Field = ({ label, value, type = 'text', textarea, hint }) => (
  <label className="field">
    <span className="field-label">{label}</span>
    {textarea
      ? <textarea className="field-input" defaultValue={value} rows={4} />
      : <input className="field-input" type={type} defaultValue={value} />}
    {hint && <span className="field-hint">{hint}</span>}
  </label>
);

const DashEditProfile = ({ u }) => (
  <>
    <PanelHeader
      kicker="Account"
      title="Edit your profile."
      sub="What you change here is visible to everyone in the community."
      action={<button className="btn primary">Save changes</button>}
    />
    <div className="dash-card">
      <div className="edit-avatar-row">
        <Avatar user={u} size={80} ring />
        <div>
          <button className="btn solid sm">Upload photo</button>
          <button className="btn ghost sm" style={{ marginLeft: 8 }}>Remove</button>
          <p className="field-hint" style={{ marginTop: 8 }}>PNG or JPG. Max 2MB.</p>
        </div>
      </div>
      <div className="field-grid">
        <Field label="Full name" value={u.name} />
        <Field label="Handle" value={u.handle} hint="compass.community/@your-handle" />
        <Field label="Email" value="kelechi@compass.community" type="email" />
        <Field label="Location" value={u.loc} />
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Bio" value={u.bio} textarea />
        </div>
        <Field label="X / Twitter" value="@kelechi_eth" />
        <Field label="Farcaster" value="kelechi.eth" />
      </div>
    </div>
  </>
);

const DashGroups = ({ u }) => {
  const groups = [
    { id: 1, name: 'Lagos Builders', members: 248, hue: 25 },
    { id: 2, name: 'Solidity Auditors', members: 86, hue: 145 },
    { id: 3, name: 'ZK Cohort · 03', members: 42, hue: 195 },
    { id: 4, name: 'Voice of Impact Jury', members: 11, hue: 340 },
  ];
  return (
    <>
      <PanelHeader kicker="Communities" title="My groups." sub={`You're in ${groups.length} groups.`} action={<button className="btn solid">Discover groups</button>} />
      <div className="group-grid">
        {groups.map(g => (
          <article key={g.id} className="group-card" style={{ '--g-hue': g.hue }}>
            <div className="group-deco" />
            <div className="group-body">
              <h3>{g.name}</h3>
              <div className="group-meta">{g.members} members</div>
            </div>
            <button className="btn ghost sm">Open</button>
          </article>
        ))}
      </div>
    </>
  );
};

const DashSchedule = ({ u }) => {
  const myClasses = (window.CONFERENCES || []).filter(c => c.status !== 'ended').map(c => ({
    day: c.status === 'live' ? 'Now' : c.when.split('·')[0].trim(),
    time: c.status === 'live' ? 'Live' : (c.when.split('·')[1] || '').trim(),
    title: c.title,
    kind: c.status === 'live' ? 'Live' : 'Course',
    cls: true,
  }));
  const items = [
    ...myClasses,
    { day: 'Jun 8', time: '6:00 PM EAT', title: 'Nairobi Builders Meetup', kind: 'IRL' },
    { day: 'Jun 12', time: 'All week', title: 'Lagos Web3 Week', kind: 'IRL' },
  ];
  return (
    <>
      <PanelHeader kicker="What's next" title="My schedule." sub="Classes you registered for and events on your calendar." action={<button className="btn primary"><Icon name="plus" size={12} /> Add</button>} />
      <div className="dash-card">
        <ul className="schedule">
          {items.map((it, i) => (
            <li key={i} className="sched-row">
              <div className="sched-day">
                <span className="sched-d-1">{it.day}</span>
                <span className="sched-d-2">{it.time}</span>
              </div>
              <div className="sched-body">
                <div className="sched-title">{it.title}</div>
                <span className={`sched-kind kind-${it.kind.toLowerCase()}`}>{it.kind}</span>
              </div>
              <button className={`btn ${it.kind === 'Live' ? 'primary' : 'ghost'} sm`}>{it.kind === 'Live' ? 'Join' : 'Open'}</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

const DashCourses = ({ u }) => {
  const courses = [
    { title: 'ZK Fundamentals',                progress: 62, lessons: '12 / 24', hue: 195 },
    { title: 'Solidity for production',        progress: 100, lessons: '18 / 18', hue: 145 },
    { title: 'Account Abstraction in practice', progress: 28, lessons: '4 / 16',  hue: 290 },
  ];
  return (
    <>
      <PanelHeader kicker="Learning" title="My courses." sub="Continue where you left off." action={<button className="btn solid">Browse catalogue</button>} />
      <div className="course-list">
        {courses.map((c, i) => (
          <article key={i} className="course-card">
            <div className="course-thumb" style={{ background: `linear-gradient(135deg, oklch(0.65 0.16 ${c.hue}), oklch(0.42 0.14 ${c.hue}))` }} />
            <div className="course-body">
              <h3>{c.title}</h3>
              <div className="course-meta">{c.lessons} lessons · {c.progress}%</div>
              <div className="course-bar"><div className="course-bar-fill" style={{ width: c.progress + '%' }} /></div>
            </div>
            <button className={`btn ${c.progress === 100 ? 'ghost' : 'primary'} sm`}>
              {c.progress === 100 ? 'Certificate' : 'Continue'}
            </button>
          </article>
        ))}
      </div>
    </>
  );
};

const DashContributions = ({ u, navigate }) => {
  const posts = TOPICS.filter(t => t.author === u.handle);
  return (
    <>
      <PanelHeader kicker="Your activity" title="My contributions." sub="Every post, reply, validation and bounty submission." />
      <div className="dash-stats">
        {[['12','Posts'], ['238','Replies'], ['14','Validated alphas'], ['1,420','KP earned']].map(([n,l]) => (
          <div key={l} className="ds-cell"><div className="ds-n">{n}</div><div className="ds-l">{l}</div></div>
        ))}
      </div>
      {posts.length === 0
        ? <div className="empty">Nothing yet — let's change that.</div>
        : <div className="discussion-card">
            {posts.map(t => <TopicRow key={t.id} topic={t} navigate={navigate} />)}
          </div>}
    </>
  );
};

const DashCertificates = ({ u }) => {
  const certs = [
    { title: 'Solidity for production',         issued: 'Apr 2026', hue: 145 },
    { title: 'On-chain compliance fundamentals', issued: 'Feb 2026', hue: 290 },
    { title: 'Compass Voice of Impact · Jan',    issued: 'Jan 2026', hue: 340 },
  ];
  return (
    <>
      <PanelHeader kicker="Receipts" title="My certificates." action={<button className="btn solid">Verify on-chain</button>} />
      <div className="cert-grid">
        {certs.map((c, i) => (
          <article key={i} className="cert-card" style={{ '--c-hue': c.hue }}>
            <div className="cert-deco" />
            <Icon name="medal" size={28} />
            <h3>{c.title}</h3>
            <div className="cert-meta">Issued {c.issued}</div>
            <button className="btn ghost sm">Download PDF</button>
          </article>
        ))}
      </div>
    </>
  );
};

const DashRules = () => (
  <>
    <PanelHeader kicker="House rules" title="Contribution rules." sub="What earns KP, what gets flagged, and how validation works." />
    <div className="dash-card prose">
      <h3>1. Be additive, be specific.</h3>
      <p>Posts that bring novel signal — first-hand experience, validated data, a clear opinion — earn 5× the KP of a "thanks" reply. Generic encouragement is welcome; just don't expect KP for it.</p>
      <h3>2. Alpha must be validated.</h3>
      <p>Alpha Corner posts require evidence: links, wallet addresses, transaction hashes, screenshots. Two Navigators must sign off before the validated stripe goes on.</p>
      <h3>3. Self-promotion is fine — partnership is better.</h3>
      <p>Sharing your project? Use the Compass Partnership flow. You'll get more reach and the community gets a thoughtful intro.</p>
      <h3>4. No phishing, no rugs, no nonsense.</h3>
      <p>Linking malicious URLs or known scams is grounds for an immediate ban. The Compass moderators verify every reported link within 6 hours.</p>
    </div>
  </>
);

const DashSettings = () => (
  <>
    <PanelHeader kicker="Preferences" title="Settings." />
    <div className="dash-card">
      <div className="setting-row">
        <div><div className="setting-title">Email digests</div><div className="setting-sub">Weekly summary of the best alpha and bounties.</div></div>
        <div className="switch on"><span /></div>
      </div>
      <div className="setting-row">
        <div><div className="setting-title">Mentions & replies</div><div className="setting-sub">Push notification when someone @s you.</div></div>
        <div className="switch on"><span /></div>
      </div>
      <div className="setting-row">
        <div><div className="setting-title">Daily check-in nudge</div><div className="setting-sub">A small reminder to drop your one chart / one read.</div></div>
        <div className="switch"><span /></div>
      </div>
      <div className="setting-row">
        <div><div className="setting-title">Show me in member directory</div><div className="setting-sub">Off keeps your profile private to direct links.</div></div>
        <div className="switch on"><span /></div>
      </div>
      <div className="setting-row danger">
        <div><div className="setting-title">Delete account</div><div className="setting-sub">Permanently removes all your posts and data.</div></div>
        <button className="btn ghost sm" style={{ color: '#b13838', borderColor: '#e8c4c4' }}>Delete</button>
      </div>
    </div>
  </>
);

const DashLogout = () => (
  <>
    <PanelHeader title="Logout?" sub="You'll need to sign back in to access the community." />
    <div className="dash-card center">
      <Icon name="arrow-right" size={32} />
      <p style={{ margin: '14px 0 18px', color: 'var(--text-2)' }}>We'll keep your session warm for 30 days on this browser.</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button className="btn ghost">Stay signed in</button>
        <button className="btn primary">Yes, log out</button>
      </div>
    </div>
  </>
);

// ---------- Leaderboard ----------
const LeaderboardPage = ({ navigate }) => {
  const [tab, setTab] = React.useState('month');
  const sorted = [...USERS].sort((a,b)=>b.kp-a.kp);
  return (
    <div className="view leaderboard">
      <section className="lb-hero">
        <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Recognition</div>
        <h1 className="section-title" style={{ fontSize: 'clamp(36px, 4vw, 56px)' }}>
          The Compass leaderboard.
        </h1>
        <p className="section-sub">
          KP is earned by posting validated alpha, accepted bounties, completing courses, and helpful replies.
          The top of the dial gets a shoutout, a Voice of Impact slot, and first dibs on every alpha.
        </p>
        <div className="lb-tabs">
          {['week','month','all-time'].map(tt => (
            <button key={tt} className={`lb-tab ${tab===tt?'active':''}`} onClick={() => setTab(tt)}>{tt}</button>
          ))}
        </div>
      </section>

      <FadeUp>
        <div className="lb-podium">
          {sorted.slice(0,3).map((u, i) => (
            <div key={u.handle} className={`podium podium-${i+1}`} onClick={() => navigate({ view: 'profile', handle: u.handle })}>
              <div className="podium-rank">{String(i+1).padStart(2,'0')}</div>
              <Avatar user={u} size={64} ring />
              <div className="podium-name">{u.name}</div>
              <TierBadge tier={u.tier} />
              <div className="podium-kp">{formatNum(u.kp)} KP</div>
            </div>
          ))}
        </div>
      </FadeUp>

      <FadeUp>
        <div className="lb-table">
          <div className="lb-row lb-headrow">
            <span>Rank</span><span>Member</span><span>Tier</span><span>KP</span><span>Alphas</span><span>Streak</span>
          </div>
          {sorted.slice(3).map((u, i) => (
            <div key={u.handle} className="lb-row" onClick={() => navigate({ view: 'profile', handle: u.handle })}>
              <span className="lb-rank">{String(i+4).padStart(2,'0')}</span>
              <span className="lb-member">
                <Avatar user={u} size={30} />
                <div>
                  <div className="lb-name">{u.name}</div>
                  <div className="lb-loc">@{u.handle} · {u.loc}</div>
                </div>
              </span>
              <span><TierBadge tier={u.tier} /></span>
              <span className="lb-kp">{formatNum(u.kp)}</span>
              <span className="lb-num">{Math.floor(u.kp/1000)}</span>
              <span className="lb-streak">{Math.min(99, Math.floor(u.kp/200))}d</span>
            </div>
          ))}
        </div>
      </FadeUp>
    </div>
  );
};

// ---------- Events ----------
const EventsPage = ({ navigate, registered, onRegister, onJoin }) => {
  const liveClasses = CONFERENCES.filter(c => c.status === 'live');
  const upcomingClasses = CONFERENCES.filter(c => c.status === 'scheduled');
  const replayClasses = CONFERENCES.filter(c => c.status === 'ended');
  const events = [
    { title: 'Lagos Web3 Week', date: 'Jun 12–15', loc: 'Lagos, NG', kind: 'IRL', host: 'kelechi.eth', going: 312, from: '#1a2444', to: '#3d2a6e' },
    { title: 'AMA: Base ecosystem fund', date: 'Tue · 7pm WAT', loc: 'Discord stage', kind: 'Live', host: 'compass.eth', going: 184, from: '#0052ff', to: '#5b8fff' },
    { title: 'ZK Fundamentals — cohort start', date: 'Jun 3', loc: 'Online', kind: 'Course', host: 'compass.eth', going: 96, from: '#cfe6b8', to: '#7fb86b' },
    { title: 'Nairobi Builders Meetup', date: 'Jun 8 · 6pm EAT', loc: 'iHub, Nairobi', kind: 'IRL', host: 'degenscout', going: 78, from: '#f7705a', to: '#c4350f' },
    { title: 'On-chain rep systems — panel', date: 'Jun 18', loc: 'Online', kind: 'Live', host: 'mosi_dao', going: 142, from: '#b89ef0', to: '#6446b0' },
    { title: 'Voice of Impact: June livestream', date: 'Jun 28 · 5pm WAT', loc: 'YouTube live', kind: 'Live', host: 'fatima.lens', going: 220, from: '#f0c1c9', to: '#c4707c' },
    { title: 'Accra Hack Night', date: 'Jul 5', loc: 'Accra, GH', kind: 'IRL', host: 'nana_btc', going: 64, from: '#efb742', to: '#a87900' },
    { title: 'AA workshop — production', date: 'Jul 9', loc: 'Online', kind: 'Live', host: 'kweku.sol', going: 88, from: '#7da19a', to: '#3d6058' },
  ];
  return (
    <div className="view events">
      <section className="lb-hero">
        <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Calendar · 07 / 08</div>
        <h1 className="section-title" style={{ fontSize: 'clamp(36px, 4vw, 56px)' }}>Events worth showing up for.</h1>
        <p className="section-sub">
          IRL meetups, AMAs, live cohorts and panels — from Lagos to Nairobi, on-chain and on-stage.
        </p>
        <div className="lb-tabs">
          <button className="btn primary"><Icon name="plus" size={12} /> Submit event</button>
          <button className="btn ghost">All hosts</button>
          <button className="btn ghost">Past events</button>
        </div>
      </section>

      {/* Live + upcoming classes (hosted in Studio) */}
      <FadeUp>
        <div className="section-head" style={{ marginBottom: 16, marginTop: 8 }}>
          <div>
            <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Live classes</div>
            <h2 className="section-title" style={{ fontSize: 'clamp(24px,2.6vw,32px)' }}>Classes & masterclasses.</h2>
          </div>
        </div>
        <div className="class-grid">
          {[...liveClasses, ...upcomingClasses, ...replayClasses].map(c => (
            <ClassCard key={c.id} cls={c} registered={registered} onRegister={onRegister} onJoin={onJoin} />
          ))}
        </div>
      </FadeUp>

      <FadeUp>
        <div className="section-head" style={{ marginBottom: 16, marginTop: 8 }}>
          <div>
            <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Community calendar</div>
            <h2 className="section-title" style={{ fontSize: 'clamp(24px,2.6vw,32px)' }}>Meetups & gatherings.</h2>
          </div>
        </div>
        <div className="ev-grid">
          {events.map(e => (
            <article key={e.title} className="event-card" style={{ '--ev-from': e.from, '--ev-to': e.to, flex: 'unset', height: 340 }}>
              <div className="event-cover">
                <span className="event-badge">{e.kind}</span>
                <div className="event-cover-title">{e.title}</div>
              </div>
              <div className="event-card-body">
                <h3 className="event-card-title">{e.loc}</h3>
                <div className="event-card-meta">
                  <span>{e.date}</span>
                  <span className="ec-going"><Icon name="users" size={11} /> {e.going}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </FadeUp>
    </div>
  );
};

// ---------- Tag page ----------
const TagPage = ({ tag, navigate }) => {
  const topics = TOPICS.filter(t => t.tags.includes(tag));
  return (
    <div className="view tag">
      <section className="tag-hero">
        <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Tag</div>
        <h1 className="tag-title"><span className="tag-hash-big">#</span>{tag}</h1>
        <p className="tag-sub">{topics.length} topics tagged with <code>#{tag}</code> across the community.</p>
      </section>
      <div className="discussion-card">
        {topics.length === 0 ? <div className="empty">No topics with this tag yet.</div>
          : topics.map(t => <TopicRow key={t.id} topic={t} navigate={navigate} />)}
      </div>
    </div>
  );
};

// ---------- Composer Modal ----------
const Composer = ({ onClose, defaultCat }) => {
  const [cat, setCat] = React.useState(defaultCat || 'news');
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [tags, setTags] = React.useState([]);
  const currentCat = CATEGORIES.find(c => c.id === cat);

  const toggleTag = (t) => setTags(curr => curr.includes(t) ? curr.filter(x=>x!==t) : [...curr, t]);

  return (
    <div className="modal-wrap" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-eyebrow">
            <Icon name="plus" size={14} /> New topic
          </div>
          <button className="btn ghost icon-only" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <div className="modal-body">
          <label className="cf-label">Category</label>
          <div className="cat-picker">
            {CATEGORIES.map(c => {
              const meta = CAT_META[c.id];
              return (
                <button key={c.id} className={`cat-opt ${cat===c.id?'active':''}`} onClick={() => setCat(c.id)}>
                  <span className="cat-opt-dot" style={{ background: meta.bg }} />
                  <span className="cat-opt-code">{c.code}</span>
                  <span className="cat-opt-name">{c.name}</span>
                </button>
              );
            })}
          </div>

          <label className="cf-label">Title</label>
          <input className="cf-input" placeholder="A clear, scannable summary…" value={title} onChange={e=>setTitle(e.target.value)} />

          <label className="cf-label">Body</label>
          <textarea className="cf-textarea" rows={9} placeholder={`Draft your ${currentCat?.name.toLowerCase()} post. Markdown supported.\n\nFor Alpha Corner posts, include validation evidence.`} value={body} onChange={e=>setBody(e.target.value)} />

          <label className="cf-label">Tags</label>
          <div className="tag-picker">
            {TAGS.slice(0, 14).map(t => (
              <button key={t} className={`tag-pick ${tags.includes(t)?'on':''}`} onClick={() => toggleTag(t)}>#{t}</button>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <span className="mf-hint">{currentCat?.premium ? '✦ Premium category — Navigator tier and above can post here.' : 'Posting publicly to the community.'}</span>
          <div className="mf-right">
            <button className="btn ghost" onClick={onClose}>Save draft</button>
            <button className="btn primary" disabled={!title.trim()}>
              <Icon name="send" size={12} /> Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {
  TopicPage, ProfilePage, LeaderboardPage, EventsPage, TagPage, Composer, PanelHeader,
});
