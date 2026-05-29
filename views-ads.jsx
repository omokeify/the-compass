// Ad banner carousel — used as the monetizable hero across the app

const AD_BANNERS = [
  {
    id: 'a1',
    sponsor: 'Base',
    eyebrow: 'Sponsored',
    title: 'Build on Base. Get up to $50,000 in ecosystem credits.',
    sub: 'Open to teams in Africa, SEA and LATAM. Applications close June 28.',
    cta: 'Apply for credits',
    bg: 'linear-gradient(120deg, #0052FF 0%, #2778ff 60%, #5b8fff 100%)',
    fg: '#fff',
    accent: '#FFEA00',
    deco: 'rings',
  },
  {
    id: 'a2',
    sponsor: 'Yellow Card',
    eyebrow: 'Featured Partner',
    title: 'Off-ramp stablecoins to NGN, KES, GHS in under 90 seconds.',
    sub: 'Yellow Card now supports direct USDC withdrawals across 20 African countries.',
    cta: 'Sign up free',
    bg: 'linear-gradient(120deg, #FFEA00 0%, #ffc107 100%)',
    fg: '#0b0b0b',
    accent: '#0b0b0b',
    deco: 'dots',
  },
  {
    id: 'a3',
    sponsor: 'The Compass Pro',
    eyebrow: 'Upgrade',
    title: 'Unlock Navigator-tier alpha, premium training, and reduced platform fees.',
    sub: '$19/mo — free for the first 30 days. Cancel anytime.',
    cta: 'Try Compass Pro',
    bg: 'linear-gradient(120deg, #0b0b0b 0%, #2a2a2a 100%)',
    fg: '#fff',
    accent: '#FFEA00',
    deco: 'grid',
  },
];

// Home-page-specific banners — community-led, signup-leaning
const HOME_AD_BANNERS = [
  {
    id: 'h1',
    sponsor: 'The Compass',
    eyebrow: 'Free to join',
    title: 'One compass for every African Web3 opportunity.',
    sub: 'Join 14,820 builders trading curated alpha, validated bounties, training and IRL events.',
    cta: 'Join free — 20 seconds',
    bg: 'linear-gradient(120deg, #0b0b0b 0%, #1a1a1a 60%, #2d2d2d 100%)',
    fg: '#fff',
    accent: '#FFEA00',
    deco: 'grid',
    action: 'signup',
  },
  {
    id: 'h2',
    sponsor: 'Polygon × Compass',
    eyebrow: 'Creator Program',
    title: '30 creators. 6 months. $400/mo retainer + distribution.',
    sub: 'Applications open June 5. Brief and review by the Compass content team.',
    cta: 'Apply now',
    bg: 'linear-gradient(120deg, #8247E5 0%, #b09efa 60%, #d6cdff 100%)',
    fg: '#fff',
    accent: '#FFEA00',
    deco: 'rings',
  },
  {
    id: 'h3',
    sponsor: 'Compass Academy',
    eyebrow: 'New cohort',
    title: 'ZK Fundamentals — a six-week live cohort, starts June 3.',
    sub: 'Cohort capped at 50 builders. Early-bird 30% off, ends Friday. On-chain certificate.',
    cta: 'Enroll today',
    bg: 'linear-gradient(120deg, #cfe6b8 0%, #7fb86b 100%)',
    fg: '#0b0b0b',
    accent: '#0b0b0b',
    deco: 'dots',
  },
  {
    id: 'h4',
    sponsor: 'Lagos Web3 Week',
    eyebrow: 'Event partner',
    title: 'Lagos Web3 Week · June 12–15. Submit your side event by Wednesday.',
    sub: 'Hosts get 3 featured slots, cross-promo across all Compass channels, and a partner booth.',
    cta: 'Submit event',
    bg: 'linear-gradient(120deg, #1a2444 0%, #3d2a6e 60%, #6b3aa5 100%)',
    fg: '#fff',
    accent: '#FFEA00',
    deco: 'rings',
  },
];

const AdCarousel = ({ banners = AD_BANNERS, autorotate = 7000, onAction }) => {
  const [idx, setIdx] = React.useState(0);
  const len = banners.length;

  React.useEffect(() => {
    if (!autorotate) return;
    const id = setInterval(() => setIdx(i => (i + 1) % len), autorotate);
    return () => clearInterval(id);
  }, [len, autorotate]);

  return (
    <section className="ad-hero">
      <div className="ad-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {banners.map((b) => (
          <article key={b.id} className="ad-slide" style={{ background: b.bg, color: b.fg }}>
            <div className={`ad-deco ad-deco-${b.deco}`} />
            <div className="ad-body">
              <div className="ad-eyebrow">
                <span className="ad-spon-pill" style={{ background: b.accent, color: b.fg === '#fff' ? '#0b0b0b' : '#fff' }}>{b.eyebrow}</span>
                <span>by {b.sponsor}</span>
              </div>
              <h2 className="ad-title">{b.title}</h2>
              <p className="ad-sub">{b.sub}</p>
              <div className="ad-actions">
                <button
                  className="ad-cta"
                  style={{ background: b.accent, color: b.fg === '#fff' ? '#0b0b0b' : '#fff' }}
                  onClick={() => onAction && onAction(b)}
                >
                  {b.cta} <Icon name="arrow-right" size={13} />
                </button>
                <span className="ad-tag">Ad</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="ad-controls">
        <button className="ad-nav" onClick={() => setIdx(i => (i - 1 + len) % len)} title="Prev"><Icon name="arrow-left" size={14} /></button>
        <div className="ad-dots">
          {banners.map((_, i) => (
            <button key={i} className={`ad-dot ${i === idx ? 'on' : ''}`} onClick={() => setIdx(i)} />
          ))}
        </div>
        <button className="ad-nav" onClick={() => setIdx(i => (i + 1) % len)} title="Next"><Icon name="arrow-right" size={14} /></button>
      </div>
    </section>
  );
};

Object.assign(window, { AdCarousel, AD_BANNERS, HOME_AD_BANNERS });

