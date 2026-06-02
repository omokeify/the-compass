// Saved hub, Wallet/earnings, Compass Pro, Bounties board

// ============================ SAVED HUB ============================
const SavedPage = ({ navigate, embedded }) => {
  const items = useSaved();
  const [filter, setFilter] = React.useState('all');
  const types = [
    { id: 'all', label: 'All' },
    { id: 'post', label: 'Posts' },
    { id: 'gig', label: 'Talent' },
    { id: 'member', label: 'Members' },
  ];
  const list = filter === 'all' ? items : items.filter(i => i.type === filter);

  const open = (i) => {
    if (i.type === 'gig') navigate({ view: 'gig', id: i.id });
    else if (i.type === 'member') navigate({ view: 'profile', handle: i.handle });
    else if (i.type === 'post') navigate({ view: 'feed' });
  };

  const TYPE_META = {
    post:   { icon: 'chat',      label: 'Post' },
    gig:    { icon: 'briefcase', label: 'Talent' },
    bounty: { icon: 'wallet',    label: 'Bounty' },
    member: { icon: 'users',     label: 'Member' },
  };

  const tabs = (
    <div className="lb-tabs" style={{ marginTop: embedded ? 12 : 18 }}>
      {types.map(tt => {
        const n = tt.id === 'all' ? items.length : items.filter(i => i.type === tt.id).length;
        return (
          <button key={tt.id} className={`tf-pill ${filter === tt.id ? 'active' : ''}`} onClick={() => setFilter(tt.id)}>
            {tt.label}{n > 0 && <span className="tf-count">{n}</span>}
          </button>
        );
      })}
    </div>
  );

  const grid = list.length === 0 ? (
    <div className="saved-empty">
      <span className="se-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
      </span>
      <h2>Nothing saved yet</h2>
      <p>Tap the bookmark icon on any post, gig, bounty or member to keep it here.</p>
      <button className="btn primary" onClick={() => navigate({ view: 'feed' })}>Browse the feed</button>
    </div>
  ) : (
    <div className="saved-grid">
      {list.map(i => {
        const meta = TYPE_META[i.type] || TYPE_META.post;
        return (
          <article key={i.type + ':' + i.id} className="saved-card" onClick={() => open(i)}>
            <div className="saved-card-top">
              <span className="saved-type" style={{ background: `oklch(0.92 0.05 ${i.hue || 65})`, color: `oklch(0.35 0.12 ${i.hue || 65})` }}>
                <Icon name={meta.icon} size={11} /> {meta.label}
              </span>
              <button className="saved-remove" title="Remove" onClick={(e) => { e.stopPropagation(); toggleSaved(i); }}>
                <Icon name="x" size={13} />
              </button>
            </div>
            <h3 className="saved-title">{i.title}</h3>
            {i.sub && <div className="saved-sub">{i.sub}</div>}
          </article>
        );
      })}
    </div>
  );

  if (embedded) {
    return (
      <>
        <PanelHeader kicker="Your library" title="Saved." sub="Everything you've bookmarked — posts, gigs, bounties and members." />
        {tabs}
        <div style={{ marginTop: 16 }}>{grid}</div>
      </>
    );
  }

  return (
    <div className="view saved-view">
      <section className="lb-hero">
        <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Your library</div>
        <h1 className="section-title" style={{ fontSize: 'clamp(32px,4vw,48px)' }}>Saved.</h1>
        <p className="section-sub">Everything you've bookmarked across the Compass — posts, gigs, bounties and members, in one place.</p>
        {tabs}
      </section>
      {grid}
    </div>
  );
};

// ============================ WALLET ============================
const WalletPage = ({ navigate, embedded }) => {
  const w = WALLET;
  const inner = (
    <>
      <div className="wallet-cards">
        <div className="wallet-balance">
          <div className="wb-grid" />
          <div className="wb-label">Available balance</div>
          <div className="wb-amount">${w.balanceUSDC.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span>USDC</span></div>
          <div className="wb-actions">
            <button className="btn accent">Withdraw</button>
            <button className="btn solid" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>Deposit</button>
          </div>
          <div className="wb-wallet">0x7a4f…3f2 · Connected</div>
        </div>

        <div className="wallet-stats">
          <div className="ws-cell"><div className="ws-l">In escrow</div><div className="ws-n">${w.pendingEscrow.toLocaleString()}</div><div className="ws-sub">1 active order</div></div>
          <div className="ws-cell"><div className="ws-l">Earned this month</div><div className="ws-n">${w.thisMonth.toLocaleString()}</div><div className="ws-sub up">▲ 38% vs last</div></div>
          <div className="ws-cell"><div className="ws-l">Knowledge Points</div><div className="ws-n">{w.kp.toLocaleString()}</div><div className="ws-sub">Captain tier</div></div>
        </div>
      </div>

      <div className="section-head" style={{ marginTop: 36, marginBottom: 14 }}>
        <div><h2 className="section-title" style={{ fontSize: 22 }}>Activity</h2></div>
        <div className="section-tools"><button className="section-link">Export CSV <Icon name="arrow-down" size={12} /></button></div>
      </div>
      <div className="txn-list">
        {w.txns.map(tx => (
          <div key={tx.id} className="txn-row">
            <span className={`txn-icon ${tx.kind}`}><Icon name={tx.icon} size={15} /></span>
            <div className="txn-body">
              <div className="txn-label">{tx.label}</div>
              <div className="txn-sub">{tx.sub} · {tx.when}</div>
            </div>
            <div className={`txn-amount ${tx.kind === 'out' ? 'neg' : tx.kind === 'kp' ? 'kp' : 'pos'}`}>
              {tx.token === 'KP'
                ? `+${tx.amount} KP`
                : `${tx.amount < 0 ? '−' : '+'}$${Math.abs(tx.amount).toLocaleString()}`}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  if (embedded) {
    return (
      <>
        <PanelHeader kicker="Earnings · Wallet" title="Your wallet." sub="Bounty payouts, gig escrow, course sales, tips and KP — settled in the Compass wallet." />
        {inner}
      </>
    );
  }

  return (
    <div className="view wallet-view">
      <section className="lb-hero">
        <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Earnings · Wallet</div>
        <h1 className="section-title" style={{ fontSize: 'clamp(32px,4vw,48px)' }}>Your wallet.</h1>
        <p className="section-sub">Bounty payouts, gig escrow, course sales, tips and KP — all settled in the Compass wallet.</p>
      </section>
      {inner}
    </div>
  );
};

// ============================ COMPASS PRO ============================
const ProPage = ({ navigate }) => {
  const [plan, setPlan] = React.useState('yearly');
  const [done, setDone] = React.useState(false);
  return (
    <div className="view pro-view">
      <section className="pro-hero">
        <div className="pro-hero-bg" />
        <div className="pro-hero-grid" />
        <div className="pro-hero-inner">
          <div className="pro-badge-pill"><Icon name="spark" size={13} /> Compass Pro</div>
          <h1 className="pro-title">Go further, <em>faster.</em></h1>
          <p className="pro-sub">First-look alpha, half-price fees, every premium class, and a 2× KP multiplier. Free for 30 days.</p>
        </div>
      </section>

      <div className="pro-body">
        <div className="pro-perks">
          {PRO_PERKS.map(p => (
            <div key={p.title} className="pro-perk">
              <span className="pp-icon"><Icon name={p.icon} size={18} /></span>
              <div>
                <div className="pp-title">{p.title}</div>
                <div className="pp-desc">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <aside className="pro-checkout">
          <div className="pc-plans">
            {PRO_PLANS.map(pl => (
              <button key={pl.id} className={`pc-plan ${plan === pl.id ? 'active' : ''}`} onClick={() => setPlan(pl.id)}>
                {pl.best && <span className="pc-best">Best value</span>}
                <span className="pc-plan-label">{pl.label}</span>
                <span className="pc-plan-price">${pl.price}<span>{pl.per}</span></span>
                <span className="pc-plan-note">{pl.note}</span>
              </button>
            ))}
          </div>
          {!done ? (
            <button className="btn primary lg pc-cta" onClick={() => setDone(true)}>
              Start 30-day free trial <Icon name="arrow-right" size={13} />
            </button>
          ) : (
            <div className="pc-success">
              <span className="sf-success-mark" style={{ width: 48, height: 48 }}><Icon name="check" size={20} /></span>
              <div>You're on Pro. Welcome aboard 🧭</div>
            </div>
          )}
          <div className="pc-fine">Cancel anytime. We'll remind you 3 days before billing.</div>
        </aside>
      </div>
    </div>
  );
};

Object.assign(window, { SavedPage, WalletPage });
