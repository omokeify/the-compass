// Topic, Profile, Leaderboard, Events, Tag, Composer — modern light edition

// ---------- Topic Detail ----------
const TOPIC_META_KEY = 'compass_topic_meta_v1';

function loadTopicMeta() {
  try { return JSON.parse(localStorage.getItem(TOPIC_META_KEY) || '{}'); } catch { return {}; }
}

function saveTopicMeta(meta) {
  try { localStorage.setItem(TOPIC_META_KEY, JSON.stringify(meta)); } catch {}
}

const TopicPage = ({ topicId, navigate, currentUser }) => {
  const topic = TOPICS.find(t => t.id === topicId);
  if (!topic) return <div className="view"><div className="empty">Topic not found.</div></div>;
  const cat = CATEGORIES.find(c => c.id === topic.cat);
  const author = userByHandle(topic.author);
  const savedMeta = loadTopicMeta();
  const topicMeta = savedMeta[topicId] || {};
  const [reply, setReply] = React.useState('');
  const [likes, setLikes] = React.useState(topicMeta.likes !== undefined ? topicMeta.likes : topic.likes);
  const [liked, setLiked] = React.useState(topicMeta.liked || false);
  const [replies, setReplies] = React.useState(topicMeta.replies || topic.replyThread || []);

  const persistMeta = (meta) => {
    const all = loadTopicMeta();
    all[topicId] = { ...all[topicId], ...meta };
    saveTopicMeta(all);
  };

  const canView = canViewTopic(currentUser, topic);
  const canReply = canReplyTopic(currentUser, topic);
  const viewLevel = topic.locked ? parseLockLevel(topic.locked) : getCategoryAccess(topic.cat).view;
  const replyLevel = topic.locked ? parseLockLevel(topic.locked) : getCategoryAccess(topic.cat).reply;

  const submitReply = () => {
    if (!reply.trim() || !canReply) return;
    const newReply = { author: currentUser.handle, when: 'just now', body: reply.trim(), likes: 0 };
    const updated = [...replies, newReply];
    setReplies(updated);
    persistMeta({ replies: updated });
    setReply('');
  };

  const toggleLike = () => {
    const nextLiked = !liked;
    const nextLikes = nextLiked ? likes + 1 : likes - 1;
    setLiked(nextLiked);
    setLikes(nextLikes);
    persistMeta({ liked: nextLiked, likes: nextLikes });
  };

  if (!canView) {
    return (
      <div className="view topic-locked">
        <div className="locked-panel">
          <h2>Topic gated</h2>
          <p>This thread is locked behind a higher Compass level.</p>
          <p className="locked-note">Reach {requiredLevelLabel(viewLevel)} to read and reply.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view topic">
      <div className="topic-head">
        <CategoryPill cat={cat} />
        <span className="topic-flags">
          {topic.pinned && <span className="tr-flag pin"><Icon name="pin" size={10} /> pinned</span>}
          {topic.hot && <span className="tr-flag hot"><Icon name="flame" size={10} /> hot</span>}
          {topic.validated && <span className="tr-flag validated"><Icon name="check" size={10} /> validated</span>}
          {topic.locked && <span className="tr-flag lock"><Icon name="lock" size={10} /> {topic.locked}+</span>}
          {topic.type === 'blog' && <span className="tr-flag blog" style={{ background: 'var(--brand-yellow)', color: '#000' }}><Icon name="edit" size={10} /> blog</span>}
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
            <button className={`post-act ${liked ? 'on' : ''}`} onClick={toggleLike}>
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
        <Avatar user={currentUser} size={36} />
        <div className="rc-wrap">
          <textarea
            placeholder={canReply ? 'Add to the thread…' : 'Reach a higher level to reply.'}
            value={reply}
            onChange={e => setReply(e.target.value)}
            rows={3}
            disabled={!canReply}
          />
          <div className="rc-foot">
            <div className="rc-tips">
              <kbd className="kbd">B</kbd>
              <kbd className="kbd">I</kbd>
              <kbd className="kbd">@</kbd>
              <span className="rc-tip-text">Markdown supported · @ to mention</span>
            </div>
            <button className="btn primary sm" disabled={!reply.trim() || !canReply} onClick={submitReply}>
              <Icon name="send" size={11} /> Reply
            </button>
          </div>
          {!canReply && (
            <div className="locked-note">Requires {requiredLevelLabel(replyLevel)} to reply in this thread.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- Profile (dashboard layout) ----------
const PROFILE_MENU = [
  { id: 'overview',      label: 'Overview',          icon: 'home' },
  { id: 'edit',          label: 'Edit Profile',      icon: 'gear' },
  { id: 'portfolio',     label: 'My Gigs',           icon: 'briefcase' },
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

const readFollowingList = () => {
  try {
    const list = localStorage.getItem('compass_following_v1');
    return list ? JSON.parse(list) : [];
  } catch {
    return [];
  }
};

const toggleFollow = (authorHandle) => {
  try {
    const current = readFollowingList();
    let next;
    if (current.includes(authorHandle)) {
      next = current.filter(h => h !== authorHandle);
    } else {
      next = [...current, authorHandle];
    }
    localStorage.setItem('compass_following_v1', JSON.stringify(next));
    window.dispatchEvent(new Event('compass_following_changed'));
  } catch {}
};

const ProfilePage = ({ handle, navigate, tab, currentUser }) => {
  const actualHandle = handle || currentUser?.handle;
  const [u, setU] = React.useState(userByHandle(actualHandle));
  const isMe = actualHandle === currentUser?.handle;
  const [active, setActive] = React.useState(tab || 'overview');
  React.useEffect(() => { if (tab) setActive(tab); }, [tab]);
  React.useEffect(() => { fetchUserByHandle(actualHandle).then(setU); }, [actualHandle]);

  const selectTab = (nextTab) => {
    setActive(nextTab);
    if (nextTab !== 'logout') {
      navigate({ view: 'profile', handle, tab: nextTab === 'overview' ? undefined : nextTab });
    }
  };

  if (!u) {
    return (
      <div className="view">
        <div className="empty">Profile not found.</div>
      </div>
    );
  }

  if (!isMe) {
    return <PublicProfilePage u={u} activeTab={active} selectTab={selectTab} navigate={navigate} />;
  }

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
           <DashboardPanel u={u} tab={active} navigate={navigate} currentUser={currentUser} />
         </main>
      </div>
    </div>
  );
};

const PublicProfilePage = ({ u, activeTab, selectTab, navigate }) => {
  if (!u) {
    return (
      <div className="view">
        <div className="empty">Profile not found.</div>
      </div>
    );
  }

  const [availability, setAvailability] = React.useState(() => {
    try {
      const saved = localStorage.getItem(`compass_availability_${u.handle}`);
      return saved || '';
    } catch {
      return 'Open to gigs';
    }
  });

  const [following, setFollowing] = React.useState(() => {
    return readFollowingList().includes(u.handle);
  });

  React.useEffect(() => {
    const sync = () => {
      setFollowing(readFollowingList().includes(u.handle));
      const saved = localStorage.getItem(`compass_availability_${u.handle}`);
      if (saved) setAvailability(saved);
    };
    window.addEventListener('compass_following_changed', sync);
    window.addEventListener('compass_availability_changed', sync);
    return () => {
      window.removeEventListener('compass_following_changed', sync);
      window.removeEventListener('compass_availability_changed', sync);
    };
  }, [u.handle]);

  const toggleFollowProfile = () => {
    toggleFollow(u.handle);
    setFollowing(!following);
  };

  const tabs = [
    { id: 'overview',      label: 'Overview',      icon: 'home' },
    { id: 'portfolio',     label: 'Portfolio (Gigs)', icon: 'briefcase' },
    { id: 'courses',       label: 'Learning & Badges', icon: 'cap' },
    { id: 'contributions', label: 'Contributions',  icon: 'chat' }
  ];

  return (
    <div className="view public-profile">
      <div className="prof-cover-sm" style={{ '--cover-bg': `linear-gradient(120deg, oklch(0.55 0.18 ${u.hue}), oklch(0.32 0.12 ${u.hue}))` }}>
        <div className="prof-cover-grid" />
        <div className="prof-cover-tag">
          <TierBadge tier={u.tier} />
          <span>· Bearing 038°</span>
        </div>
      </div>

      <header className="public-profile-header">
        <div className="pp-header-top">
          <Avatar user={u} size={80} ring />
          <div className="pp-header-actions">
            <button className={following ? 'btn ghost' : 'btn primary'} onClick={toggleFollowProfile}>
              {following ? <><Icon name="check" size={12} /> Following</> : <><Icon name="plus" size={12} /> Follow</>}
            </button>
            <button className="btn ghost" onClick={() => navigate({ view: 'messages' })}>
              <Icon name="send" size={12} /> Message
            </button>
          </div>
        </div>

        <div className="pp-header-info">
          <div className="pp-name-row">
            <h1 className="pp-name">{u.name}</h1>
            <span className={`availability-badge status-${availability.toLowerCase().replace(/\s+/g, '-')}`}>
              <span className="pulse-dot" /> {availability}
            </span>
          </div>
          <div className="pp-handle">@{u.handle} · {u.loc}</div>
          <p className="pp-bio">{u.bio || 'Smart contract builder and Web3 developer contributing to the Compass community.'}</p>
          
          <div className="pp-meta-strip">
            <div className="pp-meta-item">
              <span className="pp-meta-val">{formatNum(u.kp)}</span>
              <span className="pp-meta-lbl">KP score</span>
            </div>
          </div>
        </div>

        <nav className="pp-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`pp-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => selectTab(t.id)}
            >
              <Icon name={t.icon} size={13} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="pp-content">
        <PublicPanel u={u} tab={activeTab} navigate={navigate} />
      </main>
    </div>
  );
};

// New component to combine courses and certificates (badges)
const PublicCoursesBadges = ({ u }) => (
  <div className="public-courses-badges" style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
    <div>
      <h2 className="dash-section-title">My Courses</h2>
      <DashCourses u={u} />
    </div>
    <div>
      <h2 className="dash-section-title">My Badges & Certificates</h2>
      <DashCertificates u={u} />
    </div>
  </div>
);

const PublicPanel = ({ u, tab, navigate }) => {
  if (tab === 'overview') {
    return (
      <div className="pp-overview-grid">
        <div className="pp-overview-main">
          <h2 className="dash-section-title">Knowledge Points (KP) Log</h2>
          <KPBreakdownPanel u={u} />
          
          <h2 className="dash-section-title" style={{ marginTop: 24 }}>Recent Activity</h2>
          <DashContributions u={u} navigate={navigate} />
        </div>
        <aside className="pp-overview-side">
          <div className="rail-card">
            <div className="rail-card-head"><span className="rail-card-title">Skills & Specialties</span></div>
            <div className="pp-specialties">
              <span className="empty" style={{ padding: 12 }}>No skills listed yet.</span>
            </div>
          </div>
          <div className="rail-card subtle">
            <div className="rail-note-title">Trust & Reputation</div>
            <div className="empty" style={{ padding: '12px 16px' }}>No reputation data yet.</div>
          </div>
        </aside>
      </div>
    );
  }
  if (tab === 'portfolio') {
    return <DashPortfolio u={u} />;
  }
  if (tab === 'courses') {
    // Combined courses and badges view
    return <PublicCoursesBadges u={u} />;
  }
  if (tab === 'contributions') {
    return <DashContributions u={u} navigate={navigate} />;
  }
  return null;
};

const KPBreakdownPanel = ({ u }) => {
  const [kpLog, setKpLog] = React.useState({ total: 0, log: [] });
  React.useEffect(() => { getKpSummary(u.handle).then(setKpLog); }, [u.handle]);
  return (
    <div className="kp-breakdown-card">
      <div className="kp-breakdown-header">
        <Icon name="medal" size={18} />
        <span>Earned Reputation Summary ({formatNum(u.kp)} Total KP)</span>
      </div>
      {kpLog.log.length === 0 ? (
        <div className="empty" style={{ padding: 24 }}>No KP earned yet — attend classes and complete quests to earn reputation.</div>
      ) : (
        <ul className="kp-breakdown-list">
          {kpLog.log.map((log, i) => (
            <li key={i} className="kp-breakdown-row">
              <div className="kpb-info">
                <span className="kpb-label">{log.className}</span>
                <span className="kpb-when">{log.when}</span>
              </div>
              <span className="kpb-points">+{log.kp} KP</span>
            </li>
          ))}
          <li className="kp-breakdown-row total">
            <div className="kpb-info"><span className="kpb-label">Total earned from classes</span></div>
            <span className="kpb-points">+{kpLog.total} KP</span>
          </li>
        </ul>
      )}
    </div>
  );
};

const DashPortfolio = ({ u, editable }) => {
  const [myGigs, setMyGigs] = React.useState([]);
  const [editing, setEditing] = React.useState(null);

  React.useEffect(() => {
    // always use fresh data so edits reflect immediately
    setMyGigs(TALENT.filter(g => g.author === u.handle));
  }, [u.handle, editing]);

  const handleSave = async (id, changes) => {
    try {
      await window.talentService.update(id, changes, u);
      setEditing(null);
      setMyGigs(TALENT.filter(g => g.author === u.handle));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className="section-head" style={{ marginBottom: 16 }}>
        <div>
          <h2 className="dash-section-title">Active Builder Gigs</h2>
          <p className="section-sub">Web3 services offered by @{u.handle} in Skill Marketplace.</p>
        </div>
      </div>
      {myGigs.length === 0 ? (
        <div className="empty">This builder hasn't listed any gigs in the marketplace yet.</div>
      ) : (
        <div className="talent-grid">
          {myGigs.map(g => (
            <article key={g.id} className="talent-card">
              <div className="tc-cover" style={{ background: `linear-gradient(135deg, oklch(0.65 0.16 ${g.bgHue}), oklch(0.42 0.14 ${g.bgHue}))` }}>
                <div className="tc-cover-grid" />
                <div className="tc-skill">{g.skill}</div>
                {editable && (
                  <div className="tc-cover-actions">
                    <button className="btn ghost xs" style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', backdropFilter: 'blur(4px)' }} onClick={() => setEditing(g)}>
                      <Icon name="gear" size={11} /> Edit
                    </button>
                  </div>
                )}
              </div>
              <div className="tc-body">
                <h3 className="tc-title">{g.title}</h3>
                <div className="tc-tags">
                  {g.tags.map(t => <span key={t} className="tc-tag">#{t}</span>)}
                </div>
                <div className="tc-foot">
                  <div className="tc-rating">
                    <span className="tc-star">★</span>
                    <span className="tc-rate">{g.rating.toFixed(1)}</span>
                    <span className="tc-rev">({g.reviews})</span>
                  </div>
                  <div className="tc-price">
                    <span className="tc-price-l">Starting from</span>
                    <span className="tc-price-n">${g.price}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <GigEditorModal gig={editing} onSave={handleSave} onClose={() => setEditing(null)} />
      )}
    </div>
  );
};

const GigEditorModal = ({ gig, onSave, onClose }) => {
  const [title, setTitle] = React.useState(gig.title);
  const [bio, setBio] = React.useState(gig.bio);
  const [description, setDesc] = React.useState(gig.description);
  const [price, setPrice] = React.useState(String(gig.price));
  const [tagsStr, setTagsStr] = React.useState((gig.tags || []).join(', '));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600, width: '90%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title">Edit gig</h3>
          <button className="btn ghost icon-only" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ fontWeight: 600, fontSize: 13 }}>Title</label>
          <input className="field" value={title} onChange={e => setTitle(e.target.value)} />

          <label style={{ fontWeight: 600, fontSize: 13 }}>Bio / tagline</label>
          <input className="field" value={bio} onChange={e => setBio(e.target.value)} />

          <label style={{ fontWeight: 600, fontSize: 13 }}>Description</label>
          <textarea className="field" rows={5} value={description} onChange={e => setDesc(e.target.value)} />

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: 13 }}>Starting price ($)</label>
              <input className="field" type="number" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ fontWeight: 600, fontSize: 13 }}>Tags (comma-separated)</label>
              <input className="field" value={tagsStr} onChange={e => setTagsStr(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(gig.id, { title, bio, description, price: Number(price), tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean) })}>
            <Icon name="check" size={12} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardPanel = ({ u, tab, navigate }) => {
  if (tab === 'overview')      return <DashOverview u={u} navigate={navigate} />;
  if (tab === 'edit')          return <DashEditProfile u={u} />;
  if (tab === 'saved')         return <SavedPage navigate={navigate} embedded />;
  if (tab === 'wallet')        return <WalletPage navigate={navigate} currentUser={currentUser} embedded />;
  if (tab === 'groups')        return <DashGroups u={u} />;
  if (tab === 'schedule')      return <DashSchedule u={u} />;
  if (tab === 'courses')       return <DashCourses u={u} />;
  if (tab === 'contributions') return <DashContributions u={u} navigate={navigate} />;
  if (tab === 'certificates')  return <DashCertificates u={u} />;
  if (tab === 'portfolio')     return <DashPortfolio u={u} editable />;
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

const DashOverview = ({ u, navigate }) => {
  return (
    <>
      <PanelHeader
        kicker="Welcome back"
        title={`Hi, ${u.name.split(' ')[0]}.`}
        sub="Here's your bearing this month — KP, validations, and what's on the horizon."
      />
      <div className="prof-cover-sm" style={{ '--cover-bg': `linear-gradient(120deg, oklch(0.55 0.18 ${u.hue}), oklch(0.32 0.12 ${u.hue}))` }}>
        <div className="prof-cover-grid" />
        <div className="prof-cover-tag">
          <TierBadge tier={u.tier} />
          <span>· Bearing 038°</span>
        </div>
      </div>
      <div className="dash-stats">
        {[['0','KP this month'], ['0','Posts'], ['0','Replies'], ['0','Followers']].map(([n,l]) => (
          <div key={l} className="ds-cell"><div className="ds-n">{n}</div><div className="ds-l">{l}</div></div>
        ))}
      </div>
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

const DashEditProfile = ({ u }) => {
  const [availability, setAvailability] = React.useState(() => {
    return localStorage.getItem(`compass_availability_${u.handle}`) || 'Mentoring';
  });

  const changeAvailability = (val) => {
    setAvailability(val);
    localStorage.setItem(`compass_availability_${u.handle}`, val);
    window.dispatchEvent(new Event('compass_availability_changed'));
  };

  return (
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

        <div style={{ margin: '18px 0', borderBottom: '1px solid var(--border)', paddingBottom: 18 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Active Availability Status</label>
          <select 
            value={availability} 
            onChange={(e) => changeAvailability(e.target.value)} 
            className="field-input" 
            style={{ width: '100%', maxWidth: '320px', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-1)', color: 'var(--text-0)', fontFamily: 'var(--sans)' }}
          >
            <option value="Open to gigs">🟢 Open to Gigs (Freelance/Contract)</option>
            <option value="Hiring">🔵 Hiring (Looking for builders)</option>
            <option value="Mentoring">🟣 Mentoring (Open to teaching)</option>
            <option value="Not available">⚪ Not Available (Busy/Offline)</option>
          </select>
          <span className="field-hint" style={{ display: 'block', marginTop: 6 }}>This badge will appear immediately on your public profile card and header.</span>
        </div>

        <div className="field-grid">
          <Field label="Full name" value={u.name} />
          <Field label="Handle" value={u.handle} hint="compass.community/@your-handle" />
          <Field label="Email" value={u.email || ''} type="email" />
          <Field label="Location" value={u.loc} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Bio" value={u.bio} textarea />
          </div>
          <Field label="X / Twitter" value={u.x || ''} />
          <Field label="Farcaster" value={u.farcaster || ''} />
        </div>
      </div>
    </>
  );
};

const DashGroups = ({ u }) => {
  const groups = [
  ];
  return (
    <>
      <PanelHeader kicker="Communities" title="My groups." sub={`You're in ${groups.length} groups.`} action={<button className="btn solid">Discover groups</button>} />
      {groups.length === 0 ? (
        <div className="empty">Not in any groups yet — discover communities to join.</div>
      ) : (
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
      )}
    </>
  );
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const DashSchedule = ({ u }) => {
  const today = new Date();
  const [month, setMonth] = React.useState(today.getMonth());
  const [year, setYear] = React.useState(today.getFullYear());
  const [events, setEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    conferenceService.list().then(list => {
      setEvents(list.filter(c => c.status === 'scheduled' || c.status === 'live'));
      setLoading(false);
    });
  }, []);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const eventMap = {};
  events.forEach(e => {
    if (e.scheduledISO) {
      const d = new Date(e.scheduledISO);
      const key = d.getDate();
      if (!eventMap[key]) eventMap[key] = [];
      eventMap[key].push(e);
    }
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: prevMonthDays - firstDay + 1 + i, other: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const hasEvents = !!eventMap[d];
    cells.push({ day: d, other: false, isToday, hasEvents, events: eventMap[d] || [] });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: (cells.length - daysInMonth - firstDay) % 7 + 1, other: true });
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const todayEvents = events.filter(e => {
    if (!e.scheduledISO) return false;
    const d = new Date(e.scheduledISO);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });

  const formatTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const upcomingEvents = [...events].sort((a, b) => {
    if (a.status === 'live') return -1;
    if (b.status === 'live') return 1;
    return new Date(a.scheduledISO) - new Date(b.scheduledISO);
  }).slice(0, 10);

  return (
    <>
      <PanelHeader kicker="What's next" title="My schedule." sub="Classes you registered for and events on your calendar." />
      {loading ? (
        <div className="empty">Loading calendar…</div>
      ) : (
        <div className="dash-card dash-calendar">
          <div className="dc-head">
            <button className="btn ghost icon-only sm" onClick={prev}><Icon name="chevron-left" size={16} /></button>
            <span className="dc-month">{MONTHS[month]} {year}</span>
            <button className="btn ghost icon-only sm" onClick={next}><Icon name="chevron-right" size={16} /></button>
          </div>
          <div className="dc-grid">
            {DAYS.map(d => <div key={d} className="dc-day-head">{d}</div>)}
            {weeks.flat().map((cell, i) => (
              <div
                key={i}
                className={`dc-day ${cell.other ? 'other' : ''} ${cell.isToday ? 'today' : ''} ${cell.hasEvents ? 'has-ev' : ''}`}
              >
                <span className="dc-day-n">{cell.day}</span>
                {cell.hasEvents && <span className="dc-day-dot" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {todayEvents.length > 0 && (
        <div className="dash-card">
          <h3 className="dash-card-title">Today</h3>
          <ul className="dc-list">
            {todayEvents.map(e => (
              <li key={e.id} className={`dc-item ${e.status}`}>
                <span className="dc-dot" style={{ background: `oklch(0.7 0.16 ${e.cover || 215})` }} />
                <div className="dc-body">
                  <div className="dc-item-title">{e.title}</div>
                  <div className="dc-item-meta">
                    {e.status === 'live' ? <span className="dc-live"><span className="space-live-pip" /> Live now</span> : formatTime(e.scheduledISO)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="dash-card">
        <h3 className="dash-card-title">Upcoming</h3>
        {upcomingEvents.length === 0 ? (
          <div className="empty-sm">No upcoming events</div>
        ) : (
          <ul className="dc-list">
            {upcomingEvents.map(e => {
              const d = e.scheduledISO ? new Date(e.scheduledISO) : null;
              return (
                <li key={e.id} className={`dc-item ${e.status}`}>
                  <div className="dc-date-block">
                    <span className="dc-date-m">{d ? MONTHS[d.getMonth()] : '—'}</span>
                    <span className="dc-date-d">{d ? d.getDate() : '—'}</span>
                  </div>
                  <div className="dc-body">
                    <div className="dc-item-title">{e.title}</div>
                    <div className="dc-item-meta">
                      {e.status === 'live' ? <span className="dc-live"><span className="space-live-pip" /> Live now</span> : d ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—'}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
};

const DashCourses = ({ u }) => {
  const [attended, setAttended] = React.useState([]);
  const [kpLog, setKpLog] = React.useState({ total: 0, log: [] });
  React.useEffect(() => {
    getAttendedClasses(u.handle).then(setAttended);
    getKpSummary(u.handle).then(setKpLog);
  }, [u.handle]);
  const classes = CONFERENCES.filter(c => attended.includes(c.id));

  return (
    <>
      <PanelHeader kicker="Learning" title="My courses." sub={`${classes.length} class${classes.length !== 1 ? 'es' : ''} completed · ${kpLog.total} KP earned.`} action={<button className="btn solid">Browse catalogue</button>} />
      {classes.length === 0 ? (
        <div className="empty">No courses attended yet — join a live class to start learning.</div>
      ) : (
        <>
          <div className="dash-card dash-kp-summary">
            <div className="dash-kp-row">
              <span>Total KP from classes</span>
              <span className="dash-kp-val">+{kpLog.total}</span>
            </div>
          </div>
          <div className="course-list">
            {classes.map(c => {
              const log = kpLog.log.find(l => l.classId === c.id);
              return (
                <article key={c.id} className="course-card">
                  <div className="course-thumb" style={{ background: `linear-gradient(135deg, oklch(0.65 0.16 ${c.cover || 215}), oklch(0.42 0.14 ${c.cover || 215}))` }} />
                  <div className="course-body">
                    <h3>{c.title}</h3>
                    <div className="course-meta">{c.durationMin} min · {log ? `+${log.kp} KP` : 'Attended'}</div>
                    <div className="course-bar"><div className="course-bar-fill" style={{ width: '100%' }} /></div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
};

const DashContributions = ({ u, navigate }) => {
  return (
    <>
      <PanelHeader kicker="Your activity" title="My contributions." sub="Every post, reply, validation and bounty submission." />
      <div className="dash-stats">
        {[['0','Posts'], ['0','Replies'], ['0','Validated alphas'], ['0','KP earned']].map(([n,l]) => (
          <div key={l} className="ds-cell"><div className="ds-n">{n}</div><div className="ds-l">{l}</div></div>
        ))}
      </div>
      <div className="empty">Nothing yet — let's change that.</div>
    </>
  );
};

const DashCertificates = ({ u }) => {
  const certs = [
  ];
  return (
    <>
      <PanelHeader kicker="Receipts" title="My certificates." action={<button className="btn solid">Verify on-chain</button>} />
      {certs.length === 0 ? (
        <div className="empty">No certificates yet — complete training courses to earn them.</div>
      ) : (
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
      )}
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
const EventsPage = ({ navigate, currentUser, registered, onRegister, onJoin, onSchedule }) => {
  const [classes, setClasses] = React.useState([]);
  const refresh = () => conferenceService.list().then(setClasses);
  React.useEffect(() => { refresh(); }, []);
  React.useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('compass_conferences_refresh', handler);
    return () => window.removeEventListener('compass_conferences_refresh', handler);
  }, [refresh]);

  const canView = canViewCategory(currentUser, 'events');
  const liveClasses = classes.filter(c => c.status === 'live');
  const upcomingClasses = classes.filter(c => c.status === 'scheduled');
  const replayClasses = classes.filter(c => c.status === 'ended');
  if (!canView) {
    return (
      <div className="view events">
        <section className="lb-hero">
          <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Calendar · 07 / 08</div>
        </section>
        <div className="category-locked-panel" style={{ marginTop: 40 }}>
          <h2>Content locked</h2>
          <p>Reach {requiredLevelLabel(getCategoryAccess('events').view)} to view events.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="view events">
      <section className="lb-hero">
        <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Calendar · 07 / 08</div>
        {canCreateEvent(currentUser) && (
        <div className="lb-tabs">
          <button className="btn primary" onClick={onSchedule}><Icon name="plus" size={12} /> Submit event</button>
          <button className="btn ghost">All hosts</button>
          <button className="btn ghost">Past events</button>
        </div>
        )}
      </section>

      <FadeUp>
        <div className="section-head" style={{ marginBottom: 16, marginTop: 8 }}>
          <div>
            <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Live classes</div>
            <h2 className="section-title" style={{ fontSize: 'clamp(24px,2.6vw,32px)' }}>Classes & masterclasses.</h2>
          </div>
        </div>
        <div className="class-grid">
          {[...liveClasses, ...upcomingClasses, ...replayClasses].map(c => (
            <ClassCard key={c.id} cls={c} currentUser={currentUser} registered={registered} onRegister={onRegister} onJoin={onJoin} />
          ))}
        </div>
      </FadeUp>
    </div>
  );
};

// ---------- Tag page ----------
const TagPage = ({ tag, navigate, currentUser }) => {
  const topics = TOPICS.filter(t => t.tags.includes(tag) && canViewTopic(currentUser, t));
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
const COMPOSER_DRAFT_KEY = 'compass_modal_draft_v1';

const Composer = ({ onClose, defaultCat, currentUser }) => {
  const [cat, setCat] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(COMPOSER_DRAFT_KEY));
      return saved?.cat || defaultCat || 'news';
    } catch {
      return defaultCat || 'news';
    }
  });

  const postableCategories = currentUser ? CATEGORIES.filter(c => canPostCategory(currentUser, c.id)) : CATEGORIES;

  React.useEffect(() => {
    if (postableCategories.length > 0 && !postableCategories.find(c => c.id === cat)) {
      setCat(postableCategories[0].id);
    }
  }, [cat, postableCategories]);

  const [title, setTitle] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(COMPOSER_DRAFT_KEY));
      return saved?.title || '';
    } catch {
      return '';
    }
  });

  const [body, setBody] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(COMPOSER_DRAFT_KEY));
      return saved?.body || '';
    } catch {
      return '';
    }
  });

  const [postType, setPostType] = React.useState('discussion');
  const blogLevel = 3;
  const userLevel = getUserLevel(currentUser);
  const canBlog = userLevel >= blogLevel;
  const blogLevelName = getLevelName(blogLevel);

  const [tags, setTags] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(COMPOSER_DRAFT_KEY));
      return saved?.tags || [];
    } catch {
      return [];
    }
  });

  const currentCat = CATEGORIES.find(c => c.id === cat);

  React.useEffect(() => {
    try {
      localStorage.setItem(COMPOSER_DRAFT_KEY, JSON.stringify({ cat, title, body, tags, postType }));
    } catch {}
  }, [cat, title, body, tags, postType]);

  const clearDraft = () => {
    setTitle('');
    setBody('');
    setTags([]);
    setPostType('discussion');
    try {
      localStorage.removeItem(COMPOSER_DRAFT_KEY);
    } catch {}
  };

  const handlePublish = async () => {
    if (!canPostCategory(currentUser, cat) && !currentUser.id) return;
    if (postType === 'blog' && !canBlog && !currentUser.id) return;
    const finalTitle = postType === 'blog' ? `[Blog] ${title}` : title;

    // If using Supabase, create a real post
    if (currentUser.id && window.supabaseService) {
      try {
        await window.supabaseService.createPost({
          title: finalTitle,
          body,
          type: postType === 'blog' ? 'Resource' : 'Signal',
          cat,
          media: null,
        });
        window.dispatchEvent(new Event('compass_feed_refresh'));
      } catch (e) {
        console.error('Failed to publish:', e);
      }
    }

    clearDraft();
    onClose();
  };

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
            {postableCategories.map(c => {
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

          <label className="cf-label">Type</label>
          <div className="cat-picker">
            <button className={`cat-opt ${postType==='discussion'?'active':''}`} onClick={() => setPostType('discussion')}>
              <span className="cat-opt-dot" style={{ background: '#888' }} />
              <span className="cat-opt-name">Discussion</span>
            </button>
            <button className={`cat-opt ${postType==='blog'?'active':''}`} onClick={() => canBlog && setPostType('blog')} style={{ opacity: canBlog ? 1 : 0.5 }}>
              <span className="cat-opt-dot" style={{ background: canBlog ? 'var(--brand-yellow)' : '#666' }} />
              <span className="cat-opt-name">Blog</span>
              {!canBlog && <span className="cat-opt-lock" style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="lock" size={10} /> {blogLevelName} · Level {blogLevel}+</span>}
            </button>
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
            {(title.trim() || body.trim()) && (
              <button className="btn ghost danger-soft-text" style={{ marginRight: 8, color: '#c4350f' }} onClick={clearDraft}>Clear</button>
            )}
            <button className="btn ghost" onClick={onClose}>Save draft</button>
            <button className="btn primary" disabled={!title.trim()} onClick={handlePublish}>
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
