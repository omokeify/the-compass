// Talent Marketplace — Fiverr-style gigs + gig detail page

const TALENT_SAMPLE_DESC = `I'm a senior on-chain professional with 4+ years shipping production smart contracts and audited tooling. I write clean, gas-aware Solidity, deliver on time, and walk you through every line of the report.\n\nWhat you get:\n• A 25-40 page report with severity-graded findings\n• Foundry test suite covering every finding\n• A 45-min walkthrough call with screen-share\n• Two weeks of follow-up Q&A by email\n\nPrevious work: 18 audits across DeFi, NFTs, and DePIN. Findings shipped on Code4rena and Spearbit competitions. I've worked with teams shipping on Ethereum, Base, Optimism, and Solana.\n\nI ALWAYS reply in under 12 hours during weekdays. Hit message before ordering — most clients book a 20-min discovery call first.`;

const TALENT_REVIEWS = [
  { who: 'mosi_dao',    rating: 5, when: '2 weeks ago', body: 'Tinuke surfaced two critical findings our previous auditor missed. Worth every cent. We will hire her every quarter.' },
  { who: 'kelechi.eth', rating: 5, when: '1 month ago', body: 'Delivered ahead of schedule, the report was clear enough that our investors read it cover to cover.' },
  { who: 'fatima.lens', rating: 5, when: '2 months ago', body: 'Great communication, sharp eye for state-machine bugs. Onboarded the founder on how to read the report.' },
  { who: 'kweku.sol',   rating: 4, when: '3 months ago', body: 'Solid work. Would be 5 stars if we had not had timezone friction on the kickoff call.' },
];

// ---------- Talent listing page ----------
const TalentPage = ({ navigate }) => {
  const [skill, setSkill] = React.useState('All');
  const [sort, setSort] = React.useState('relevance');
  const [savedIds, setSavedIds] = React.useState(new Set());

  const toggleSave = (id) => setSavedIds(s => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  let list = skill === 'All' ? [...TALENT] : TALENT.filter(t => t.skill === skill);
  if (sort === 'price-asc') list.sort((a,b) => a.price - b.price);
  else if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);
  else if (sort === 'rating') list.sort((a,b) => b.rating - a.rating);

  return (
    <div className="view talent-view">
      <AdCarousel />

      <section className="talent-headline">
        <div>
          <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Talent · marketplace</div>
          <h1 className="th-title">Hire vetted builders, designers and auditors.</h1>
          <p className="th-sub">
            Browse 240+ on-chain professionals across Africa and the wider Web3 ecosystem.
            Every seller is KP-ranked, validated by community moderators, and on-time-rate transparent.
          </p>
        </div>
        <div className="th-cta">
          <button className="btn primary lg">
            <Icon name="plus" size={14} /> List your gig
          </button>
          <button className="btn ghost lg">
            How it works <Icon name="arrow-right" size={14} />
          </button>
        </div>
      </section>

      <TalentSpotlight navigate={navigate} />

      <section className="talent-filters">
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
      </section>

      <section className="talent-grid">
        {list.map(t => {
          const author = userByHandle(t.author);
          const saved = savedIds.has(t.id);
          return (
            <article
              key={t.id}
              className={`talent-card ${t.featured ? 'featured' : ''}`}
              onClick={() => navigate({ view: 'gig', id: t.id })}
            >
              <div className="tc-cover" style={{ background: `linear-gradient(135deg, oklch(0.68 0.16 ${t.bgHue}), oklch(0.42 0.14 ${t.bgHue}))` }}>
                <div className="tc-cover-grid" />
                {t.featured && <span className="tc-featured">★ Featured</span>}
                <button
                  className={`tc-save ${saved ? 'on' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleSave(t.id); }}
                  title={saved ? 'Remove from saved' : 'Save'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24"
                    fill={saved ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                </button>
                <div className="tc-skill">{t.skill}</div>
              </div>
              <div className="tc-body">
                <div className="tc-author" onClick={(e) => { e.stopPropagation(); navigate({ view: 'profile', handle: author.handle }); }}>
                  <Avatar user={author} size={28} />
                  <div>
                    <div className="tc-author-name">{author.name}</div>
                    <div className="tc-author-meta">
                      <TierBadge tier={author.tier} />
                    </div>
                  </div>
                </div>
                <h3 className="tc-title">{t.title}</h3>
                <div className="tc-tags">
                  {t.tags.map(tag => <span key={tag} className="tc-tag">{tag}</span>)}
                </div>
                <div className="tc-foot">
                  <div className="tc-rating">
                    <span className="tc-star">★</span>
                    <span className="tc-rate">{t.rating.toFixed(1)}</span>
                    <span className="tc-rev">({t.reviews})</span>
                  </div>
                  <div className="tc-price">
                    <span className="tc-price-l">From</span>
                    <span className="tc-price-n">${t.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {savedIds.size > 0 && (
        <div className="talent-saved-toast">
          <Icon name="check" size={13} />
          {savedIds.size} saved · <button className="link">view saved</button>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { TalentPage });

// ===========================================================
// Gig Detail Page
// ===========================================================
const GIG_PACKAGES = [
  { id: 'basic',    name: 'Basic',    desc: 'Quick review — 1 contract up to 250 lines, no fix verification.',                      delivery: '4 days',  revisions: '1', features: ['Up to 250 LOC', 'PDF summary', 'No re-test'], priceMul: 0.45 },
  { id: 'standard', name: 'Standard', desc: 'Full audit of a single module — recommended for most startups.',                       delivery: '7 days',  revisions: '2', features: ['Up to 1,000 LOC', 'PDF report + Foundry tests', 'Severity grading', 'One re-test pass'], priceMul: 1.00, popular: true },
  { id: 'premium',  name: 'Premium',  desc: 'Full system audit with adversarial fuzz + 2 follow-up calls + on-chain monitoring.',  delivery: '14 days', revisions: '∞', features: ['Up to 3,000 LOC', 'Adversarial fuzz suite', 'Two walkthroughs', 'Slither/Echidna setup', '14-day support'], priceMul: 2.40 },
];

const GigDetailPage = ({ id, navigate }) => {
  const gig = TALENT.find(t => t.id === id);
  if (!gig) return <div className="view"><div className="empty">Gig not found.</div></div>;
  const author = userByHandle(gig.author);
  const [pkg, setPkg] = React.useState('standard');
  const [bookmarked, setBookmarked] = React.useState(false);
  const selected = GIG_PACKAGES.find(p => p.id === pkg);
  const price = Math.round(gig.price * selected.priceMul);

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
              {TALENT_SAMPLE_DESC.split('\n').map((line, i) =>
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
              {GIG_PACKAGES.map(p => (
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
              {[5,4,3,2,1].map(n => (
                <div key={n} className="grb-row">
                  <span className="grb-l">{n} ★</span>
                  <div className="grb-bar"><div className="grb-fill" style={{ width: (n === 5 ? 82 : n === 4 ? 14 : n === 3 ? 3 : 1) + '%' }} /></div>
                  <span className="grb-c">{n === 5 ? '71' : n === 4 ? '12' : n === 3 ? '3' : '1'}</span>
                </div>
              ))}
            </div>
            <div className="gig-reviews">
              {TALENT_REVIEWS.map((r, i) => {
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
        </aside>
      </div>
    </div>
  );
};

window.GigDetailPage = GigDetailPage;

// ===========================================================
// Talent Spotlight — bento mosaic, each tile auto-rotates through featured talent
// ===========================================================
const SPOTLIGHT_SLOTS = [
  // big square — feature the top picks
  { slot: 'big',   talents: ['t-aud-1', 't-eng-1', 't-rsh-1'] },
  // small top-right
  { slot: 'sm1',   talents: ['t-des-1', 't-vid-1'] },
  // small bottom-right
  { slot: 'sm2',   talents: ['t-cnt-1', 't-mkt-1'] },
  // wide bottom-left
  { slot: 'wide',  talents: ['t-dev-1', 't-gov-1'] },
];

const TalentSpotlight = ({ navigate }) => {
  // Each tile keeps its own index, advancing independently
  const [indexes, setIndexes] = React.useState(SPOTLIGHT_SLOTS.map(() => 0));

  React.useEffect(() => {
    const timers = SPOTLIGHT_SLOTS.map((slot, i) => {
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
        {SPOTLIGHT_SLOTS.map((slot, i) => (
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
