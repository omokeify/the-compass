// Blog-style article detail page (for editorial content)

// Shared sample article body — sections used to render + build the ToC
const ARTICLE_SECTIONS = [
  {
    h: 'The Infrastructure Layer',
    p: [
      'Stablecoins have quietly become the most important layer of the on-chain economy. For developers building cross-border payment tools, remittance products, or SME finance applications, the question is no longer "should we use stablecoins?" — it\'s "which rails, which liquidity, and which compliance path?"',
      'The past 18 months have seen a meaningful shift in how builders approach this infrastructure. Rather than treating stablecoins as a speculative asset class, the most sophisticated teams now treat USDC and the growing family of regional stablecoins as programmable cash — composable with contracts, readable on-chain, and settled in near real time.',
    ],
  },
  {
    h: 'Who Is Building',
    p: [
      'Across The Compass community, we\'ve tracked a growing cluster of builders — primarily from West Africa, Southeast Asia, and Latin America — who are shipping stablecoin-native products for corridors that legacy fintech underserves.',
    ],
    quote: { body: 'The SWIFT system adds 2–3 days and 5–8% in fees to every remittance we used to do. With USDC on Base, we\'re settling the same transaction in 3 seconds for less than a cent.', by: 'Builder, Lagos cohort' },
  },
  {
    h: 'Payment Corridors',
    p: [
      'The most active corridors we\'re seeing: Nigeria → UK, Philippines → US, India → UAE, and Mexico → US. Each has its own regulatory texture, but the pattern rhymes: a stablecoin on-ramp on one side, a local off-ramp partner on the other, and a thin layer of compliance tooling in between.',
      'What\'s changed is the off-ramp density. Partners like Yellow Card and a wave of regional PSPs now make the "last mile" — getting value into a local bank account or mobile wallet — fast enough that end users never see the crypto underneath.',
    ],
  },
  {
    h: 'Key Protocols',
    p: [
      'On the settlement side, Base and Solana dominate new builds for their fees and finality. For programmable flows — escrow, streaming payroll, conditional release — teams lean on account abstraction so users sign with a passkey instead of managing a seed phrase.',
    ],
  },
  {
    h: 'What Comes Next',
    p: [
      'The next frontier is interoperability between regional stablecoins and a credible, on-chain compliance standard that satisfies both local regulators and global partners. The teams that solve the compliance UX — not just the settlement tech — will own the corridors.',
      'The Compass will keep tracking this cohort. If you\'re building here, post in the Partnership category — we\'ll feature the most interesting work.',
    ],
  },
];

const ArticlePage = ({ id, navigate }) => {
  const item = (window.CONTENT_ITEMS || []).find(c => c.id === id) || CONTENT_ITEMS[0];
  const author = userByHandle(item.author);
  const bg = (window.CONTENT_BG && window.CONTENT_BG[item.bg]) || { from: '#0c0f24', to: '#1e2a5a' };
  const [activeSec, setActiveSec] = React.useState(0);
  const secRefs = React.useRef([]);

  const scrollTo = (i) => {
    const el = secRefs.current[i];
    const scroller = document.querySelector('.main-col');
    if (el && scroller) {
      scroller.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
    }
  };

  // Track active section on scroll
  React.useEffect(() => {
    const scroller = document.querySelector('.main-col');
    if (!scroller) return;
    const onScroll = () => {
      const y = scroller.scrollTop + 120;
      let cur = 0;
      secRefs.current.forEach((el, i) => { if (el && el.offsetTop <= y) cur = i; });
      setActiveSec(cur);
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => scroller.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="view article-view">
      <button className="gig-back" onClick={() => navigate({ view: 'home' })}>
        <Icon name="arrow-left" size={13} /> Back
      </button>

      {/* Header */}
      <header className="art-head">
        <div className="art-head-main">
          <span className="art-kind" style={{ background: `oklch(0.92 0.05 250)`, color: '#1e2a5a' }}>{item.kind.toUpperCase()}</span>
          <span className="art-dates">{item.when}, 2026 · Last updated {item.when}, 2026</span>
          <h1 className="art-title">{item.title}</h1>
          {item.subtitle && <p className="art-sub">{item.subtitle}</p>}
          <div className="art-share">
            <button className="art-share-btn" title="Share on X"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h3l-7 8 8 11h-6l-5-6-5 6H2l8-9L2 2h6l4 5 6-5z"/></svg></button>
            <button className="art-share-btn" title="Share on LinkedIn"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM3 9h2v12H3zM9 9h2v2h.1c.5-.9 1.7-1.9 3.4-1.9 3.6 0 4.5 2.2 4.5 5.2V21h-2v-5.4c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21H9z"/></svg></button>
            <button className="art-share-btn" title="Email"><Icon name="send" size={14} /></button>
          </div>
        </div>
        <div className="art-hero-card" style={{ background: `linear-gradient(150deg, ${bg.from}, ${bg.to})` }}>
          <div className="ahc-grid" />
          <div className="ahc-rings" />
          <div className="ahc-kind">{`{ ${item.kind.toUpperCase()} }`}</div>
          <h2 className="ahc-title">{item.title}</h2>
        </div>
      </header>

      <div className="art-divider" />

      {/* Body + sidebar */}
      <div className="art-body-layout">
        <article className="art-content">
          {/* Byline */}
          <div className="art-byline">
            <Avatar user={author} size={36} />
            <div>
              <div className="art-byline-name">{author.name}</div>
              <div className="art-byline-meta">{author.tier} · {item.minutes} min read</div>
            </div>
          </div>

          {ARTICLE_SECTIONS.map((sec, i) => (
            <section key={i} ref={el => secRefs.current[i] = el} className="art-section">
              <h2 className="art-h2">{sec.h}</h2>
              {sec.p.map((para, j) => <p key={j} className="art-p">{para}</p>)}
              {sec.quote && (
                <blockquote className="art-quote">
                  <p>{sec.quote.body}</p>
                  <cite>— {sec.quote.by}</cite>
                </blockquote>
              )}
            </section>
          ))}

          {/* Author footer */}
          <div className="art-author-foot">
            <Avatar user={author} size={52} />
            <div className="aaf-body">
              <div className="aaf-name">{author.name} <TierBadge tier={author.tier} /></div>
              <p className="aaf-bio">{author.bio}</p>
            </div>
            <button className="btn primary sm" onClick={() => navigate({ view: 'profile', handle: author.handle })}>View profile</button>
          </div>
        </article>

        <aside className="art-rail">
          <div className="toc-card">
            <div className="toc-head"><Icon name="menu" size={13} /> Table Of Contents</div>
            {ARTICLE_SECTIONS.map((sec, i) => (
              <button key={i} className={`toc-item ${activeSec === i ? 'active' : ''}`} onClick={() => scrollTo(i)}>
                <span>{sec.h}</span>
                <Icon name="arrow-down" size={12} />
              </button>
            ))}
          </div>

          <div className="toc-promo" style={{ background: 'linear-gradient(150deg, #172275, #3349c4)' }}>
            <div className="ahc-rings" />
            <div className="tp-kind">{`{ COMPASS HOUSE }`}</div>
            <h3>Builder feedback survey — what does the next quarter of Compass need to be?</h3>
            <button className="btn solid sm" style={{ marginTop: 12 }} onClick={() => navigate({ view: 'feed' })}>Take the survey</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

Object.assign(window, { ArticlePage, ARTICLE_SECTIONS });
