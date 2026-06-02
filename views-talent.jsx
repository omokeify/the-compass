// Talent Marketplace — Fiverr-style gigs + gig detail page

// Avatar bg gradients per talent id
const TC_AVATAR_PALETTE = {
  't-aud-1': { from: '#c4b5fd', to: '#a78bfa' },
  't-eng-1': { from: '#6ee7b7', to: '#34d399' },
  't-des-1': { from: '#fda4af', to: '#fb7185' },
  't-cnt-1': { from: '#fcd34d', to: '#f59e0b' },
  't-dev-1': { from: '#86efac', to: '#4ade80' },
  't-gov-1': { from: '#93c5fd', to: '#60a5fa' },
  't-vid-1': { from: '#fdba74', to: '#fb923c' },
  't-mkt-1': { from: '#fca5a5', to: '#f87171' },
  't-rsh-1': { from: '#67e8f9', to: '#22d3ee' },
};

// View-profile button accent per talent id
const TC_BTN_COLORS = {
  't-aud-1': { bg: '#7c3aed', text: '#fff' },
  't-eng-1': { bg: '#16a34a', text: '#fff' },
  't-des-1': { bg: '#e11d48', text: '#fff' },
  't-cnt-1': { bg: '#d97706', text: '#fff' },
  't-dev-1': { bg: '#15803d', text: '#fff' },
  't-gov-1': { bg: '#2563eb', text: '#fff' },
  't-vid-1': { bg: '#ea580c', text: '#fff' },
  't-mkt-1': { bg: '#dc2626', text: '#fff' },
  't-rsh-1': { bg: '#0891b2', text: '#fff' },
};

// Coloured tag pills matching the reference image
const TAG_COLORS = {
  'Solidity':   { bg: '#ede9fe', color: '#6d28d9' },
  'DeFi':       { bg: '#dbeafe', color: '#1d4ed8' },
  'Security':   { bg: '#dcfce7', color: '#15803d' },
  'UI/UX':      { bg: '#fce7f3', color: '#be185d' },
  'Figma':      { bg: '#ede9fe', color: '#7c3aed' },
  'Web3':       { bg: '#dbeafe', color: '#1d4ed8' },
  'Content':    { bg: '#fef9c3', color: '#a16207' },
  'SEO':        { bg: '#dcfce7', color: '#166534' },
  'React':      { bg: '#e0f2fe', color: '#0369a1' },
  'TypeScript': { bg: '#dbeafe', color: '#1d4ed8' },
  'Community':  { bg: '#f0fdf4', color: '#15803d' },
  'Discord':    { bg: '#ede9fe', color: '#5b21b6' },
  'Rust':       { bg: '#fff7ed', color: '#c2410c' },
  'Growth':     { bg: '#fce7f3', color: '#be185d' },
  'Campaigns':  { bg: '#fef9c3', color: '#a16207' },
  'Farcaster':  { bg: '#ede9fe', color: '#7c3aed' },
  'Video':      { bg: '#fff7ed', color: '#c2410c' },
  'Motion':     { bg: '#fce7f3', color: '#be185d' },
  'Research':   { bg: '#e0f2fe', color: '#0369a1' },
  'Data':       { bg: '#f0fdf4', color: '#15803d' },
};

// ── Spotlight Carousel ──────────────────────────────────────
// Only talents with featured:true (set by admin/moderator) appear here
const TalentSpotlightCarousel = ({ navigate }) => {
  const spotlightList = TALENT.filter(t => t.featured);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const total = spotlightList.length;

  // Auto-advance every 4 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx(i => (i + 1) % total);
    }, 4000);
    return () => clearInterval(timer);
  }, [total]);

  const prev = () => setActiveIdx(i => (i - 1 + total) % total);
  const next = () => setActiveIdx(i => (i + 1) % total);

  if (!spotlightList.length) return null;

  return (
    <section className="tsc-wrap">
      <div className="tsc-header">
        <div className="tsc-nav">
          <button className="tsc-nav-btn" onClick={prev}><Icon name="arrow-left" size={14} /></button>
          <button className="tsc-nav-btn" onClick={next}><Icon name="arrow-right" size={14} /></button>
        </div>
      </div>

      <div className="tsc-track-wrap">
        <div
          className="tsc-track"
          style={{ transform: `translateX(-${activeIdx * 100}%)` }}
        >
          {spotlightList.map((t, i) => {
            const author = userByHandle(t.author);
            const palette = TC_AVATAR_PALETTE[t.id] || { from: '#e2e8f0', to: '#cbd5e1' };
            const btn = TC_BTN_COLORS[t.id] || { bg: '#111', text: '#fff' };
            return (
              <div key={t.id} className="tsc-slide">
                {/* Left — avatar + identity */}
                <div className="tsc-slide-left">
                  <div
                    className="tsc-avatar-ring"
                    style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
                  >
                    <Avatar user={author} size={96} />
                  </div>
                  <div className="tsc-identity">
                    {t.topRated && (
                      <span className="tsc-top-rated-badge">
                        <span className="tsc-tr-star">★</span> Top Rated
                      </span>
                    )}
                    <h3 className="tsc-name">{author.name}</h3>
                    <div className="tsc-role">{t.role || t.skill}</div>
                    <p className="tsc-bio">{t.bio}</p>
                    <div className="tsc-tags">
                      {(t.tags || []).slice(0, 3).map(tag => {
                        const tc = TAG_COLORS[tag] || { bg: '#f1f5f9', color: '#475569' };
                        return (
                          <span key={tag} className="tpc-tag" style={{ background: tc.bg, color: tc.color }}>
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right — stats + CTA */}
                <div className="tsc-slide-right">
                  <div className="tsc-stats-grid">
                    <div className="tsc-stat-block">
                      <div className="tsc-stat-val">★ {t.rating.toFixed(1)}</div>
                      <div className="tsc-stat-lbl">({t.reviews} reviews)</div>
                    </div>
                    <div className="tsc-stat-block">
                      <div className="tsc-stat-val">{t.projects}</div>
                      <div className="tsc-stat-lbl">Projects</div>
                    </div>
                    <div className="tsc-stat-block">
                      <div className="tsc-stat-val">{t.successRate}%</div>
                      <div className="tsc-stat-lbl">Success rate</div>
                    </div>
                  </div>
                  <div className="tsc-cta-row">
                    <button
                      className="tsc-view-btn"
                      style={{ background: btn.bg, color: btn.text }}
                      onClick={() => navigate({ view: 'gig', id: t.id })}
                    >
                      View profile
                    </button>
                    <button className="tsc-msg-btn" onClick={() => navigate({ view: 'messages' })}>
                      <Icon name="send" size={14} /> Message
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="tsc-dots">
        {spotlightList.map((_, i) => (
          <button
            key={i}
            className={`tsc-dot ${i === activeIdx ? 'on' : ''}`}
            onClick={() => setActiveIdx(i)}
          />
        ))}
      </div>
    </section>
  );
};

// ── Profile card (grid) ──────────────────────────────────────
const TalentProfileCard = ({ t, navigate }) => {
  const author = userByHandle(t.author);
  const palette = TC_AVATAR_PALETTE[t.id] || { from: '#e2e8f0', to: '#cbd5e1' };
  const btn = TC_BTN_COLORS[t.id] || { bg: 'var(--brand-yellow)', text: 'var(--brand-black)' };

  return (
    <article className="tpc-card" style={{ '--tpc-bg': t.cardBg || '#fafafa' }}>
      {/* Top Rated badge — only if admin/mod flagged it */}
      {t.topRated && (
        <div className="tpc-top-badge">
          <span className="tpc-star-icon">★</span> Top Rated
        </div>
      )}
      {/* Spacer when no badge so layout stays consistent */}
      {!t.topRated && <div className="tpc-badge-spacer" />}

      {/* Avatar */}
      <div className="tpc-avatar-wrap">
        <div
          className="tpc-avatar-circle"
          style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
        >
          <Avatar user={author} size={72} />
        </div>
      </div>

      {/* Info */}
      <div className="tpc-info">
        <h3 className="tpc-name">{author.name}</h3>
        <div className="tpc-role">{t.role || t.skill}</div>
        <p className="tpc-bio">{t.bio || ''}</p>
        <div className="tpc-tags">
          {(t.tags || []).slice(0, 3).map(tag => {
            const tc = TAG_COLORS[tag] || { bg: '#f1f5f9', color: '#475569' };
            return (
              <span key={tag} className="tpc-tag" style={{ background: tc.bg, color: tc.color }}>
                {tag}
              </span>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="tpc-stats">
        <div className="tpc-stat">
          <span className="tpc-stat-icon">★</span>
          <div>
            <div className="tpc-stat-val">{t.rating.toFixed(1)}</div>
            <div className="tpc-stat-lbl">({t.reviews} reviews)</div>
          </div>
        </div>
        <div className="tpc-stat-divider" />
        <div className="tpc-stat">
          <span className="tpc-stat-icon">📁</span>
          <div>
            <div className="tpc-stat-val">{t.projects || 0}</div>
            <div className="tpc-stat-lbl">Projects</div>
          </div>
        </div>
        <div className="tpc-stat-divider" />
        <div className="tpc-stat">
          <span className="tpc-stat-icon">📈</span>
          <div>
            <div className="tpc-stat-val">{t.successRate || 95}%</div>
            <div className="tpc-stat-lbl">Success rate</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="tpc-actions">
        <button
          className="tpc-view-btn"
          style={{ background: btn.bg, color: btn.text }}
          onClick={() => navigate({ view: 'gig', id: t.id })}
        >
          View profile
        </button>
        <button className="tpc-msg-btn" onClick={() => navigate({ view: 'messages' })} title="Message">
          <Icon name="send" size={14} />
        </button>
      </div>
    </article>
  );
};

// ── Talent Page ──────────────────────────────────────────────
const TalentPage = ({ navigate, currentUser }) => {
  const [skill, setSkill] = React.useState('All');
  const [sort, setSort] = React.useState('relevance');
  const [talentList, setTalentList] = React.useState([]);
  const [approvedTalents, setApprovedTalents] = React.useState([]);
  const [showApply, setShowApply] = React.useState(false);
  const [applied, setApplied] = React.useState(false);
  const [showGigEditor, setShowGigEditor] = React.useState(false);

  React.useEffect(() => {
    talentService.list(currentUser).then(setTalentList);
    talentService.getApprovedTalents().then(setApprovedTalents);
  }, [currentUser]);

  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'mod');
  const isApprovedTalent = currentUser && approvedTalents.includes(currentUser.handle);
  const canPost = isAdmin || isApprovedTalent;

  const handleApply = async () => {
    if (!currentUser) return;
    try {
      await talentService.approveTalent(currentUser.handle, { role: 'admin', handle: 'system' });
      setApprovedTalents(await talentService.getApprovedTalents());
      setApplied(true);
      setShowApply(false);
    } catch {}
  };

  const handleCreateGig = () => setShowGigEditor(true);

  const handleSaveGig = async (id, data) => {
    await talentService.create({ ...data, id, skill: 'Development', author: currentUser.handle }, currentUser);
    setTalentList(await talentService.list(currentUser));
    setShowGigEditor(false);
  };

  let list = skill === 'All' ? [...talentList] : talentList.filter(t => t.skill === skill);
  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);

  const pendingGigs = talentList.filter(t => !t.approved);

  return (
    <div className="view talent-view">
      {/* Page header */}
      <div className="tpm-header">
        <div className="tpm-header-left">
          <h1 className="tpm-title">Top talent this week <span className="tpm-sparkle">✦</span></h1>
          <p className="tpm-sub">Discover verified professionals delivering exceptional results across Web3 and beyond.</p>
        </div>
        <div className="tpm-header-right">
          {currentUser && !applied && !canPost && (
            <button className="btn ghost" onClick={() => setShowApply(true)}>
              Apply to be a talent
            </button>
          )}
          {currentUser && canPost && (
            <button className="btn primary" onClick={handleCreateGig}>
              <Icon name="plus" size={12} /> Post a gig
            </button>
          )}
        </div>
      </div>

      {/* Apply modal */}
      {showApply && (
        <div className="modal-wrap" onClick={() => setShowApply(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-head">
              <div className="modal-eyebrow"><Icon name="briefcase" size={15} /> Apply to be a talent</div>
              <button className="btn ghost icon-only" onClick={() => setShowApply(false)}><Icon name="x" size={14} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-1)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                Submit your application to become an approved talent on Compass. Admins will review and approve your profile so you can post gigs.
              </p>
            </div>
            <div className="modal-foot">
              <button className="btn ghost" onClick={() => setShowApply(false)}>Cancel</button>
              <button className="btn primary" onClick={handleApply}>Submit application</button>
            </div>
          </div>
        </div>
      )}

      {applied && (
        <div className="talent-notice">
          <Icon name="check" size={14} /> Your application has been submitted. Wait for admin approval to start posting gigs.
        </div>
      )}

      {/* Spotlight carousel — featured picks by moderators */}
      <TalentSpotlightCarousel navigate={navigate} />

      {/* Divider */}
      <div className="tpm-section-head">
        <h2 className="tpm-section-title">All Talent</h2>
        <div className="talent-filters">
          <div className="tf-pills">
            {TALENT_SKILLS.map(s => (
              <button
                key={s}
                className={`tf-pill ${skill === s ? 'active' : ''}`}
                onClick={() => setSkill(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="tf-sort">
            <span>Sort:</span>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="relevance">Relevance</option>
              <option value="rating">Top rated</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pending gigs — admin only */}
      {isAdmin && pendingGigs.length > 0 && (
        <div className="tpm-section-head" style={{ marginTop: 24 }}>
          <h2 className="tpm-section-title" style={{ color: 'var(--warn)' }}>Pending approval</h2>
        </div>
      )}
      {isAdmin && pendingGigs.length > 0 && (
        <div className="tpc-grid">
          {pendingGigs.map(t => (
            <TalentProfileCard key={t.id} t={t} navigate={navigate} />
          ))}
        </div>
      )}

      {/* Profile cards grid */}
      <div className="tpc-grid">
        {list.filter(t => t.approved).map(t => (
          <TalentProfileCard key={t.id} t={t} navigate={navigate} />
        ))}
      </div>

      {showGigEditor && (
        <GigEditorModal gig={{ title: '', bio: '', description: '', price: 0, tags: [] }} onSave={handleSaveGig} onClose={() => setShowGigEditor(false)} />
      )}
    </div>
  );
};

Object.assign(window, { TalentPage });





// ===========================================================
// Gig Detail Page
// ===========================================================

const GigDetailPage = ({ id, navigate }) => {
  const gig = TALENT.find(t => t.id === id);
  if (!gig) return <div className="view"><div className="empty">Gig not found.</div></div>;
  const author = userByHandle(gig.author);
  const [pkg, setPkg] = React.useState(() => {
    const pkgs = (window.TALENT.find(t => t.id === id) || {}).packages || [];
    return pkgs.find(p => p.id === 'standard') ? 'standard' : (pkgs[0] ? pkgs[0].id : '');
  });
  const [bookmarked, setBookmarked] = React.useState(false);
  const selected = (gig.packages || []).find(p => p.id === pkg);
  const price = selected ? Math.round(gig.price * selected.priceMul) : gig.price;

  const relatedGigs = TALENT.filter(t => t.id !== gig.id && t.skill === gig.skill);

  return (
    <div className="view gig-view">
      <button className="gig-back" onClick={() => navigate({ view: 'talent' })}>
        <Icon name="arrow-left" size={13} /> Back to Talent
      </button>

      <div className="gig-layout">
        <main className="gig-main">
          <header className="gig-head">
            <div className="gig-head-meta">
              <span className="tc-skill" style={{ background: `oklch(0.85 0.1 ${gig.bgHue} / 0.4)`, color: `oklch(0.3 0.12 ${gig.bgHue})`, position: 'static' }}>
                {gig.skill}
              </span>
              {gig.featured && <span className="tc-featured" style={{ position: 'static' }}>★ Featured</span>}
            </div>
            <h1 className="gig-title">{gig.title}</h1>
            <div className="gig-author">
              <Avatar user={author} size={40} />
              <div>
                <div className="gig-author-line">
                  <button className="gig-author-name" onClick={() => navigate({ view: 'profile', handle: author.handle })}>
                    {author.name}
                  </button>
                  <TierBadge tier={author.tier} />
                </div>
                <div className="gig-author-meta">
                  <span className="tc-star">★</span>
                  <strong>{gig.rating.toFixed(1)}</strong>
                  <span>({gig.reviews} reviews)</span>
                  <Dot />
                  <span>{author.loc}</span>
                  <Dot />
                  <span>Responds in &lt; 12 hours</span>
                </div>
              </div>
              <div className="gig-head-tools">
                <button className={`btn ghost icon-only ${bookmarked ? 'on' : ''}`} onClick={() => setBookmarked(b => !b)} title={bookmarked ? 'Saved' : 'Save'}>
                  <svg width="14" height="14" viewBox="0 0 24 24"
                    fill={bookmarked ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                </button>
                <button className="btn ghost icon-only" title="Share"><Icon name="reply" size={14} /></button>
              </div>
            </div>
          </header>

          <div className="gig-cover" style={{ background: `linear-gradient(135deg, oklch(0.72 0.16 ${gig.bgHue}), oklch(0.42 0.14 ${gig.bgHue}))` }}>
            <div className="tc-cover-grid" />
            <div className="gig-cover-tags">
              {gig.tags.map(tag => <span key={tag} className="gig-cover-tag">#{tag}</span>)}
            </div>
            <div className="gig-cover-glyph">
              <Icon name="briefcase" size={88} />
            </div>
          </div>

          <section className="gig-section">
            <h2 className="gig-h2">About this gig</h2>
            <div className="gig-prose">
              {gig.description.split('\n').map((line, i) =>
                line.trim() === ''
                  ? <div key={i} style={{ height: 10 }} />
                  : line.startsWith('•')
                    ? <p key={i} className="gig-bullet">{line}</p>
                    : <p key={i}>{line}</p>
              )}
            </div>
          </section>

          <section className="gig-section">
            <div className="gig-section-head">
              <h2 className="gig-h2">Packages</h2>
              <span className="gig-section-sub">Pick a tier — all packages include the PDF report and one walkthrough.</span>
            </div>
            <div className="pkg-tabs">
              {(gig.packages || []).map(p => (
                <button
                  key={p.id}
                  className={`pkg-tab ${pkg === p.id ? 'active' : ''}`}
                  onClick={() => setPkg(p.id)}
                >
                  <span className="pkg-tab-name">{p.name}</span>
                  <span className="pkg-tab-price">${Math.round(gig.price * p.priceMul).toLocaleString()}</span>
                  {p.popular && <span className="pkg-tab-pop">Most popular</span>}
                </button>
              ))}
            </div>
            <div className="pkg-detail">
              {selected ? (
              <>
              <p className="pkg-desc">{selected.desc}</p>
              <ul className="pkg-features">
                {selected.features.map(f => (
                  <li key={f}><Icon name="check" size={12} /> {f}</li>
                ))}
              </ul>
              <div className="pkg-meta">
                <div className="pkg-meta-cell"><div className="pkg-meta-l">Delivery</div><div className="pkg-meta-n">{selected.delivery}</div></div>
                <div className="pkg-meta-cell"><div className="pkg-meta-l">Revisions</div><div className="pkg-meta-n">{selected.revisions}</div></div>
              </div>
              </>
              ) : (
              <p style={{ color: 'var(--text-3)' }}>No packages configured.</p>
              )}
            </div>
          </section>

          <section className="gig-section">
            <div className="gig-section-head">
              <h2 className="gig-h2">Reviews</h2>
              <div className="gig-rating-summary">
                <span className="tc-star big">★</span>
                <strong>{gig.rating.toFixed(1)}</strong>
                <span>· {gig.reviews} reviews</span>
              </div>
            </div>
            <div className="gig-rating-bars">
              {(() => {
                const rl = gig.reviewList || [];
                const dist = {5:0,4:0,3:0,2:0,1:0};
                rl.forEach(r => { if (dist[r.rating] !== undefined) dist[r.rating]++; });
                const maxCount = Math.max(...Object.values(dist), 1);
                return [5,4,3,2,1].map(n => {
                  const cnt = dist[n];
                  const pct = (cnt / maxCount) * 100;
                  return (
                    <div key={n} className="grb-row">
                      <span className="grb-l">{n} ★</span>
                      <div className="grb-bar"><div className="grb-fill" style={{ width: pct + '%' }} /></div>
                      <span className="grb-c">{cnt}</span>
                    </div>
                  );
                });
              })()}
            </div>
            <div className="gig-reviews">
              {(gig.reviewList || []).map((r, i) => {
                const u = userByHandle(r.who);
                return (
                  <article key={i} className="gig-review">
                    <Avatar user={u} size={36} />
                    <div className="gr-body">
                      <div className="gr-head">
                        <span className="gr-name">{u.name}</span>
                        <span className="gr-when">{r.when}</span>
                      </div>
                      <div className="gr-stars">{'★'.repeat(r.rating)}<span className="gr-empty">{'★'.repeat(5 - r.rating)}</span></div>
                      <p className="gr-body-text">{r.body}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="gig-section">
            <h2 className="gig-h2">About the seller</h2>
            <div className="gig-seller-card">
              <Avatar user={author} size={64} />
              <div className="gsc-body">
                <div className="gsc-line">
                  <button className="gsc-name" onClick={() => navigate({ view: 'profile', handle: author.handle })}>{author.name}</button>
                  <TierBadge tier={author.tier} />
                </div>
                <div className="gsc-handle">@{author.handle} · {author.loc}</div>
                <p className="gsc-bio">{author.bio}</p>
                <div className="gsc-stats">
                  <div className="gsc-stat"><strong>{author.kp.toLocaleString()}</strong><span>KP</span></div>
                  <div className="gsc-stat"><strong>{gig.reviews}</strong><span>orders</span></div>
                  <div className="gsc-stat"><strong>98%</strong><span>on time</span></div>
                  <div className="gsc-stat"><strong>&lt;12h</strong><span>response</span></div>
                </div>
              </div>
              <div className="gsc-actions">
                <button className="btn primary" onClick={() => navigate({ view: 'messages' })}>
                  <Icon name="send" size={12} /> Message
                </button>
                <button className="btn ghost" onClick={() => navigate({ view: 'profile', handle: author.handle })}>
                  View profile
                </button>
              </div>
            </div>
          </section>

          {relatedGigs.length > 0 && (
            <section className="gig-section">
              <h2 className="gig-h2">More from this category</h2>
              <div className="talent-grid">
                {relatedGigs.slice(0,3).map(rg => {
                  const ra = userByHandle(rg.author);
                  return (
                    <article key={rg.id} className="talent-card" onClick={() => navigate({ view: 'gig', id: rg.id })}>
                      <div className="tc-cover" style={{ background: `linear-gradient(135deg, oklch(0.68 0.16 ${rg.bgHue}), oklch(0.42 0.14 ${rg.bgHue}))` }}>
                        <div className="tc-cover-grid" />
                        <div className="tc-skill">{rg.skill}</div>
                      </div>
                      <div className="tc-body">
                        <div className="tc-author">
                          <Avatar user={ra} size={28} />
                          <div>
                            <div className="tc-author-name">{ra.name}</div>
                            <div className="tc-author-meta"><TierBadge tier={ra.tier} /></div>
                          </div>
                        </div>
                        <h3 className="tc-title">{rg.title}</h3>
                        <div className="tc-foot">
                          <div className="tc-rating">
                            <span className="tc-star">★</span>
                            <span className="tc-rate">{rg.rating.toFixed(1)}</span>
                            <span className="tc-rev">({rg.reviews})</span>
                          </div>
                          <div className="tc-price">
                            <span className="tc-price-l">From</span>
                            <span className="tc-price-n">${rg.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </main>

        <aside className="gig-rail">
          {selected ? (
          <div className="gig-buy">
            <div className="buy-head">
              <span className="buy-pkg">{selected.name} package</span>
              <span className="buy-price">${price.toLocaleString()}</span>
            </div>
            <p className="buy-desc">{selected.desc}</p>
            <div className="buy-meta">
              <div className="buy-meta-row">
                <Icon name="calendar" size={13} />
                <span>{selected.delivery} delivery</span>
              </div>
              <div className="buy-meta-row">
                <Icon name="reply" size={13} />
                <span>{selected.revisions} revisions</span>
              </div>
              <div className="buy-meta-row">
                <Icon name="check" size={13} />
                <span>Compass escrow protected</span>
              </div>
            </div>
            <button className="btn primary lg buy-cta">
              Continue (${price.toLocaleString()}) <Icon name="arrow-right" size={13} />
            </button>
            <button className="btn ghost lg buy-secondary" onClick={() => navigate({ view: 'messages' })}>
              <Icon name="send" size={12} /> Contact seller first
            </button>
            <div className="buy-fineprint">
              Payment held in Compass escrow until you accept the delivery.
              7% platform fee included.
            </div>
          </div>
          ) : (
          <div className="gig-buy">
            <p style={{ color: 'var(--text-3)', padding: 16 }}>No packages configured yet.</p>
          </div>
          )}
        </aside>
      </div>
    </div>
  );
};

window.GigDetailPage = GigDetailPage;

// ===========================================================
// Talent Spotlight — bento mosaic, each tile auto-rotates through featured talent
// ===========================================================

const genSpotlightSlots = () => {
  const featured = TALENT.filter(t => t.featured);
  if (featured.length === 0) return [];
  const ids = featured.map(t => t.id);
  // Build a bento mosaic layout: big, med-a, med-b, sm-a, sm-b, sm-c
  return [
    { slot: 'big',   talents: ids.slice(0, 3) },
    { slot: 'med-a', talents: ids.slice(0, 2) },
    { slot: 'med-b', talents: ids.slice(2, 5) },
    { slot: 'sm-a',  talents: ids.slice(0, 2) },
    { slot: 'sm-b',  talents: ids.slice(2, 4) },
    { slot: 'sm-c',  talents: ids.slice(3, 6) },
  ].filter(s => s.talents.length > 0);
};

const TalentSpotlight = ({ navigate }) => {
  const [slots, setSlots] = React.useState([]);

  const [indexes, setIndexes] = React.useState([]);

  React.useEffect(() => {
    const s = genSpotlightSlots();
    setSlots(s);
    setIndexes(s.map(() => 0));
  }, []);

  React.useEffect(() => {
    const timers = slots.map((slot, i) => {
      // Stagger so they don't all flip at the same moment
      return setInterval(() => {
        setIndexes(curr => {
          const next = [...curr];
          next[i] = (next[i] + 1) % slot.talents.length;
          return next;
        });
      }, 4500 + i * 700);
    });
    return () => timers.forEach(t => clearInterval(t));
  }, []);

  return (
    <section className="spotlight">
      <div className="spotlight-head">
        <div>
          <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Spotlight</div>
          <h2 className="section-title">Top talent this week.</h2>
        </div>
        <div className="spotlight-tools">
          <button className="section-link">
            See all featured <Icon name="arrow-right" size={12} />
          </button>
        </div>
      </div>

      <div className="spotlight-grid">
        {slots.map((slot, i) => (
          <SpotlightTile
            key={slot.slot}
            slot={slot.slot}
            talents={slot.talents.map(id => TALENT.find(t => t.id === id))}
            activeIdx={indexes[i]}
            onClick={(t) => navigate({ view: 'gig', id: t.id })}
            onCycle={(dir) => {
              setIndexes(curr => {
                const next = [...curr];
                const len = slot.talents.length;
                next[i] = (next[i] + dir + len) % len;
                return next;
              });
            }}
          />
        ))}
      </div>
    </section>
  );
};

const SpotlightTile = ({ slot, talents, activeIdx, onClick, onCycle }) => {
  return (
    <div className={`spot-tile spot-${slot}`}>
      {talents.map((t, i) => {
        const author = userByHandle(t.author);
        const active = i === activeIdx;
        return (
          <div
            key={t.id}
            className={`spot-slide ${active ? 'active' : ''}`}
            style={{ background: `linear-gradient(135deg, oklch(0.72 0.16 ${t.bgHue}), oklch(0.42 0.14 ${t.bgHue}))` }}
            onClick={() => active && onClick(t)}
          >
            <div className="spot-grid-deco" />
            <div className="spot-avatar">
              <Avatar user={author} size={slot === 'big' ? 56 : 36} />
            </div>
            <div className="spot-meta">
              <div className="spot-name">{author.name}</div>
              <div className="spot-skill">{t.skill}</div>
            </div>
            <div className="spot-rate">★ {t.rating.toFixed(1)}</div>
          </div>
        );
      })}

      {/* Slide indicators */}
      {talents.length > 1 && (
        <div className="spot-dots">
          {talents.map((_, i) => (
            <button
              key={i}
              className={`spot-dot ${i === activeIdx ? 'on' : ''}`}
              onClick={(e) => { e.stopPropagation(); onCycle(i - activeIdx); }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { TalentSpotlight, SpotlightTile });
