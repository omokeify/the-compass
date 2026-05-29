// Feed view — vertical scroll of posts from News, Alpha, Activities + more

// Synthetic feed entries that go beyond plain TOPIC rows — they include
// snippets, optional media blocks, reactions, etc.
const FEED_ITEMS = [
  {
    id: 'f1',
    cat: 'alpha',
    author: 'degenscout',
    when: '12m',
    title: 'Monad mainnet airdrop checker is live — eligibility window closes Friday',
    body: 'Cut-off is 23:59 UTC Friday. Three signal patterns I have validated against 40+ wallets: bridge volume ≥ $250 across 2+ epochs, min 12 unique contracts interacted, and you hold a Monad testnet OAT (the gold one). If you missed testnet there is still a path via ecosystem partners — do not sleep.',
    validated: true,
    reactions: { up: 312, comments: 84, shares: 22 },
    pinned: true,
  },
  {
    id: 'f2',
    cat: 'news',
    author: 'signal_op',
    when: '38m',
    title: 'Base announces $50M ecosystem fund — accepting builders from Africa & SEA',
    body: 'Geographic mandate: Africa, SEA, LATAM. Applications open June 1. Compass will host an AMA with the Base BD team next Tuesday on the Discord stage. Slots are first-come — the BD team is moving fast on the early cohort.',
    media: { kind: 'link', host: 'base.org', title: 'Base · $50M ecosystem fund', subtitle: 'Applications open June 1 → June 28', accent: '#0052ff' },
    reactions: { up: 201, comments: 56, shares: 38 },
    hot: true,
  },
  {
    id: 'fp1',
    cat: 'news',
    author: 'compass.eth',
    when: '45m',
    title: 'Quick poll: where are you deploying next quarter?',
    body: 'Curious where the community is heading. One vote each — results steer our next round of partner AMAs.',
    media: { kind: 'poll', question: 'Which chain are you building on next?', closes: 'Closes in 2 days', options: [
      { label: 'Base', votes: 412 },
      { label: 'Solana', votes: 388 },
      { label: 'Monad', votes: 521 },
      { label: 'Still deciding', votes: 96 },
    ] },
    reactions: { up: 88, comments: 31, shares: 6 },
  },
  {
    id: 'f3',
    cat: 'activities',
    author: 'fatima.lens',
    when: '1h',
    title: 'Voice of Impact — May winners + how to nominate for June',
    body: 'Three contributors this month for going absurdly above and beyond. They each get a Voice of Impact slot, a 1k Compass grant, and first dibs on the June livestream. Nominations for June open today — names below.',
    media: { kind: 'cards', items: [
      { name: 'Tinuke A.',  role: 'Frontend dev · helped 18 builders ship',  hue: 290 },
      { name: 'Mosi',       role: 'DAO governance · ran 4 retroPGF rounds',  hue: 215 },
      { name: 'Ayodele',    role: 'First-time hunter, mentored 12 newcomers', hue: 340 },
    ]},
    reactions: { up: 96, comments: 27, shares: 14 },
  },
  {
    id: 'f4',
    cat: 'alpha',
    author: '0xforesight',
    when: '4h',
    title: '[Locked alpha] Undisclosed L2 testnet — quest set drops Tuesday',
    body: 'Validated by 2 Navigators. Full breakdown, contracts, and tier thresholds inside. Navigator tier or above to view — KP gated.',
    locked: 'Navigator',
    reactions: { up: 224, comments: 67, shares: 4 },
  },
  {
    id: 'f5',
    cat: 'news',
    author: 'compass.eth',
    when: '6h',
    title: 'GM 🧭 — Sunday daily check-in',
    body: 'What are you watching today? Drop one chart, one read, one ship — the daily check-in keeps the dial calibrated. 142 replies and counting.',
    reactions: { up: 49, comments: 142, shares: 3 },
  },
  {
    id: 'f6',
    cat: 'activities',
    author: 'iyabo_nft',
    when: '7h',
    title: 'New on-chain print series — Compass community drop',
    body: 'I have been working on a six-piece print series inspired by the eight cardinal directions of the Compass community. Mint goes live to Navigators first on June 4. Proceeds split: 70% creators, 30% community treasury.',
    media: { kind: 'gallery', items: [
      { hue: 340 }, { hue: 18 }, { hue: 50 }, { hue: 195 },
    ]},
    reactions: { up: 88, comments: 21, shares: 11 },
  },
  {
    id: 'f7',
    cat: 'news',
    author: 'kelechi.eth',
    when: '8h',
    title: 'Lagos Web3 Week — side event submission window closes Wednesday',
    body: 'Hosts get three featured slots plus cross-promo across all Compass channels. Submit your event by 23:59 WAT on Wednesday — review turnaround is 48 hours.',
    reactions: { up: 142, comments: 38, shares: 19 },
    hot: true,
  },
  {
    id: 'f8',
    cat: 'alpha',
    author: 'degenscout',
    when: '11h',
    title: 'Three Solana memecoins on the watchlist — entry criteria + risk notes',
    body: 'Not financial advice. Pattern is the same on each: paired LP locked, dev wallet ≤ 5%, telegram growing organically. I am sizing 0.5% per name max. Charts and contracts inside.',
    validated: true,
    reactions: { up: 142, comments: 41, shares: 28 },
  },
  {
    id: 'f9',
    cat: 'activities',
    author: 'mosi_dao',
    when: '1d',
    title: 'On-chain rep panel — speakers locked, agenda inside',
    body: 'June 18 panel on on-chain rep systems. Confirmed: a Gitcoin lead, the Karma GAP team, and two retroPGF veterans. We will record and publish a written recap — Compass members get the unedited version.',
    reactions: { up: 68, comments: 18, shares: 7 },
  },
];

const SAMPLE_COMMENTS = {
  f1: [
    { author: '0xforesight', when: '2h', body: 'Cross-checked against my six wallets — the OAT signal is real. Wallets without it got tier 3 max. Adding to the alpha index.', likes: 48, validated: true },
    { author: 'kelechi.eth', when: '1h', body: 'Pinning this. Do NOT trust checker links from anywhere except the URL above. Two phishing copies already.', likes: 122, mod: true },
    { author: 'ayo.web3',    when: '38m', body: 'First time qualifying for anything 🧭 thank you for the breakdown.', likes: 14 },
  ],
  f2: [
    { author: 'tinuke.builds', when: '20m', body: 'Just submitted via the Compass partner link. The form took six minutes — clean.', likes: 24 },
    { author: 'mosi_dao', when: '15m', body: 'AMA on Tuesday? I will be there.', likes: 11 },
  ],
  f3: [
    { author: 'iyabo_nft', when: '40m', body: 'Tinuke deserves this twice over. The amount of devs she has unblocked privately is wild.', likes: 36 },
  ],
  f4: [
    { author: 'degenscout', when: '3h', body: 'I will validate before Tuesday and post the addendum here.', likes: 18 },
  ],
  f5: [],
  f6: [],
  f7: [],
  f8: [],
  f9: [],
};

const FEED_DRAFT_KEY = 'compass_feed_draft_v1';
const FEED_TYPE_META = {
  Signal: { icon: 'sparkles', desc: 'Validated insight, alpha, or field note' },
  Question: { icon: 'chat', desc: 'Ask the community for help or perspective' },
  Bounty: { icon: 'wallet', desc: 'Share paid work or contribution requests' },
  Event: { icon: 'calendar', desc: 'Promote classes, meetups, AMAs, and spaces' },
  Resource: { icon: 'book', desc: 'Drop links, notes, docs, or recaps' },
};

const readFeedDraft = () => {
  try { return JSON.parse(localStorage.getItem(FEED_DRAFT_KEY) || '{}'); }
  catch { return {}; }
};

const writeFeedDraft = (draft) => {
  try { localStorage.setItem(FEED_DRAFT_KEY, JSON.stringify(draft)); }
  catch {}
};

const ReactionRow = ({ r, liked, reposted, bookmarked, onLike, onComment, onRepost, onBookmark, commentOpen }) => (
  <div className="feed-react">
    <button className={`fr-act ${liked ? 'on' : ''}`} onClick={onLike}>
      <Icon name="arrow-up" size={13} /> {formatNum(r.up + (liked ? 1 : 0))}
    </button>
    <button className={`fr-act ${commentOpen ? 'on-soft' : ''}`} onClick={onComment}>
      <Icon name="chat" size={13} /> {r.comments}
    </button>
    <button className={`fr-act ${reposted ? 'on-rep' : ''}`} onClick={onRepost}>
      <Icon name="reply" size={13} /> {reposted ? 'Reposted' : formatNum(r.shares)}
    </button>
    <button className={`fr-act bookmark ${bookmarked ? 'on' : ''}`} onClick={onBookmark} title={bookmarked ? 'Saved' : 'Save'}>
      <svg width="13" height="13" viewBox="0 0 24 24"
        fill={bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
    </button>
    <button className="fr-act subtle" title="Views"><Icon name="eye" size={13} /></button>
  </div>
);

const FeedMedia = ({ media }) => {
  if (!media) return null;
  if (media.kind === 'link') {
    return (
      <a className="feed-link" style={{ '--ml-accent': media.accent }}>
        <div className="ml-icon"><Icon name="globe" size={18} /></div>
        <div className="ml-body">
          <div className="ml-host">{media.host}</div>
          <div className="ml-title">{media.title}</div>
          <div className="ml-sub">{media.subtitle}</div>
        </div>
        <Icon name="arrow-right" size={14} />
      </a>
    );
  }
  if (media.kind === 'cards') {
    return (
      <div className="feed-cards">
        {media.items.map((c, i) => (
          <div key={i} className="fc-card" style={{ '--fc-hue': c.hue }}>
            <div className="fc-deco" />
            <div className="fc-name">{c.name}</div>
            <div className="fc-role">{c.role}</div>
          </div>
        ))}
      </div>
    );
  }
  if (media.kind === 'gallery') {
    return (
      <div className="feed-gallery">
        {media.items.map((g, i) => (
          <div key={i} className="fg-tile" style={{ background: `linear-gradient(135deg, oklch(0.68 0.16 ${g.hue}), oklch(0.42 0.14 ${g.hue}))` }} />
        ))}
      </div>
    );
  }
  if (media.kind === 'poll') {
    return <FeedPoll poll={media} />;
  }
  return null;
};

const FeedPoll = ({ poll }) => {
  const [voted, setVoted] = React.useState(null);
  const base = poll.options.map(o => o.votes);
  const totalBase = base.reduce((a, b) => a + b, 0);
  const total = totalBase + (voted !== null ? 1 : 0);
  return (
    <div className="feed-poll">
      <div className="fp-q">{poll.question}</div>
      <div className="fp-opts">
        {poll.options.map((o, i) => {
          const votes = o.votes + (voted === i ? 1 : 0);
          const pct = total ? Math.round((votes / total) * 100) : 0;
          const isPicked = voted === i;
          return (
            <button
              key={i}
              className={`fp-opt ${voted !== null ? 'revealed' : ''} ${isPicked ? 'picked' : ''}`}
              onClick={() => voted === null && setVoted(i)}
              disabled={voted !== null}
            >
              {voted !== null && <span className="fp-bar" style={{ width: pct + '%' }} />}
              <span className="fp-opt-label">{o.label}</span>
              {voted !== null && <span className="fp-opt-pct">{pct}%{isPicked && <Icon name="check" size={11} />}</span>}
            </button>
          );
        })}
      </div>
      <div className="fp-meta">{total.toLocaleString()} votes · {poll.closes}</div>
    </div>
  );
};

const InlineFeedComposer = ({ onCompose }) => {
  const [draft, setDraft] = React.useState(() => ({
    type: 'Signal',
    body: '',
    ...readFeedDraft(),
  }));

  React.useEffect(() => writeFeedDraft(draft), [draft]);

  const clearDraft = (e) => {
    e.stopPropagation();
    setDraft({ type: draft.type, body: '' });
  };

  return (
    <div className="feed-inline-composer">
      <div className="fic-top">
        <Avatar user={userByHandle('kelechi.eth')} size={38} />
        <div className="fic-body">
          <div className="fic-types">
            {Object.entries(FEED_TYPE_META).map(([type, meta]) => (
              <button
                key={type}
                className={`fic-type ${draft.type === type ? 'active' : ''}`}
                title={meta.desc}
                onClick={() => setDraft(d => ({ ...d, type }))}
              >
                <Icon name={meta.icon} size={12} /> {type}
              </button>
            ))}
          </div>
          <textarea
            className="fic-input"
            value={draft.body}
            placeholder={`Share a ${draft.type.toLowerCase()} with the community...`}
            onChange={(e) => setDraft(d => ({ ...d, body: e.target.value }))}
          />
        </div>
      </div>
      <div className="fic-foot">
        <div className="fic-hint">
          <Icon name="sparkles" size={12} />
          Draft saves on this browser.
        </div>
        <div className="fic-actions">
          {draft.body && <button className="btn ghost sm" onClick={clearDraft}>Clear</button>}
          <button className="btn primary sm" onClick={onCompose}>
            <Icon name="plus" size={11} /> Open composer
          </button>
        </div>
      </div>
    </div>
  );
};

const FeedCard = ({ item, navigate }) => {
  const author = userByHandle(item.author);
  const cat = CATEGORIES.find(c => c.id === item.cat);

  const [liked, setLiked] = React.useState(false);
  const [reposted, setReposted] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(() => isSaved('post', item.id));
  const [commentOpen, setCommentOpen] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [comments, setComments] = React.useState(SAMPLE_COMMENTS[item.id] || []);
  const [reported, setReported] = React.useState(false);
  const [shared, setShared] = React.useState(false);

  const submitComment = () => {
    if (!draft.trim()) return;
    setComments(c => [...c, { author: 'kelechi.eth', when: 'just now', body: draft.trim(), likes: 0 }]);
    setDraft('');
  };

  return (
    <article className="feed-card">
      <header className="feed-head">
        <Avatar user={author} size={40} />
        <div className="feed-head-body">
          <div className="feed-head-line">
            <span className="feed-author">{author.name}</span>
            <TierBadge tier={author.tier} />
            <span className="feed-handle">@{author.handle}</span>
            <span className="feed-type-pill">{item.type || (item.cat === 'alpha' ? 'Signal' : item.cat === 'activities' ? 'Resource' : 'Update')}</span>
          </div>
          <div className="feed-head-meta">
            <CategoryPill cat={cat} />
            <Dot />
            <span>{item.when} ago</span>
            {item.pinned && <><Dot /><span className="tr-flag pin"><Icon name="pin" size={10} /> pinned</span></>}
            {item.hot && <><Dot /><span className="tr-flag hot"><Icon name="flame" size={10} /> hot</span></>}
            {item.validated && <><Dot /><span className="tr-flag validated"><Icon name="check" size={10} /> validated</span></>}
          </div>
        </div>
        <div className="feed-more">
          <button className={`btn ghost icon-only ${shared ? 'active' : ''}`} title={shared ? 'Copied' : 'Share'} onClick={() => setShared(true)}>
            <Icon name="reply" size={14} />
          </button>
          <button className={`btn ghost icon-only ${reported ? 'danger-soft' : ''}`} title={reported ? 'Reported' : 'Report'} onClick={() => setReported(true)}>
            <Icon name={reported ? 'check' : 'menu'} size={14} />
          </button>
        </div>
      </header>

      <h2 className="feed-title">{item.title}</h2>
      <p className="feed-body">{item.body}</p>
      {item.locked && (
        <div className="feed-locked">
          <Icon name="lock" size={13} />
          <span><strong>{item.locked}+ only</strong> — unlock with KP or upgrade your tier.</span>
          <button className="btn solid sm">View details</button>
        </div>
      )}
      {item.cat === 'alpha' && (
        <div className={`feed-risk ${item.validated ? 'validated' : ''}`}>
          <Icon name={item.validated ? 'check' : 'lock'} size={12} />
          <span>{item.validated ? 'Validated by Navigators. Still verify contracts and links before acting.' : 'Alpha is tier-gated until moderators validate the supporting evidence.'}</span>
        </div>
      )}
      <FeedMedia media={item.media} />

      <ReactionRow
        r={item.reactions}
        liked={liked}
        reposted={reposted}
        bookmarked={bookmarked}
        commentOpen={commentOpen}
        onLike={() => setLiked(l => !l)}
        onComment={() => setCommentOpen(o => !o)}
        onRepost={() => setReposted(r => !r)}
        onBookmark={() => { const now = toggleSaved({ id: item.id, type: 'post', title: item.title, sub: cat ? cat.name : 'Post', hue: cat ? CAT_META[cat.id].bg : '#FFEA00' }); setBookmarked(now); }}
      />

      {commentOpen && (
        <div className="feed-comments">
          {comments.length > 0 && (
            <ul className="fc-list">
              {comments.map((c, i) => {
                const u = userByHandle(c.author);
                return (
                  <li key={i} className={`fc-row ${c.mod ? 'mod' : ''}`}>
                    <Avatar user={u} size={28} />
                    <div className="fc-row-body">
                      <div className="fc-row-head">
                        <span className="fc-row-author">{u.name}</span>
                        <TierBadge tier={u.tier} />
                        <span className="fc-row-when">· {c.when}</span>
                        {c.mod && <span className="tr-flag pin"><Icon name="compass" size={9} /> mod</span>}
                        {c.validated && <span className="tr-flag validated"><Icon name="check" size={9} /> validated</span>}
                      </div>
                      <p className="fc-row-text">{c.body}</p>
                      <div className="fc-row-actions">
                        <button><Icon name="arrow-up" size={11} /> {c.likes}</button>
                        <button><Icon name="reply" size={11} /> Reply</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="fc-composer">
            <Avatar user={userByHandle('kelechi.eth')} size={28} />
            <input
              className="fc-input"
              placeholder="Write a comment…"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitComment(); }}
            />
            <button className="btn primary sm" disabled={!draft.trim()} onClick={submitComment}>
              <Icon name="send" size={11} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

const FeedView = ({ navigate, onCompose }) => {
  const [filter, setFilter] = React.useState('all');
  const filters = [
    { id: 'all',        label: 'All',             icon: 'sparkles' },
    { id: 'news',       label: 'News Highlights', icon: 'globe' },
    { id: 'alpha',      label: 'Alpha',           icon: 'spark' },
    { id: 'activities', label: 'Activities',      icon: 'book' },
  ];

  const list = filter === 'all'
    ? FEED_ITEMS
    : FEED_ITEMS.filter(it => it.cat === filter);

  const counts = {
    all: FEED_ITEMS.length,
    news: FEED_ITEMS.filter(i => i.cat === 'news').length,
    alpha: FEED_ITEMS.filter(i => i.cat === 'alpha').length,
    activities: FEED_ITEMS.filter(i => i.cat === 'activities').length,
  };

  return (
    <div className="view feed-view">
      <div className="feed-layout">
        <div className="feed-col">
          <header className="feed-page-head">
            <div>
              <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Your feed</div>
              <h1 className="dash-title">What's happening across the Compass.</h1>
            </div>
            <button className="btn primary" onClick={onCompose}>
              <Icon name="plus" size={13} /> Post
            </button>
          </header>

          <div className="feed-filters">
            {filters.map(f => (
              <button
                key={f.id}
                className={`feed-filter ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                <Icon name={f.icon} size={13} />
                <span>{f.label}</span>
                <span className="ff-count">{counts[f.id] || 0}</span>
              </button>
            ))}
          </div>

          {/* Quick composer */}
          <div className="feed-composer" onClick={onCompose}>
            <Avatar user={userByHandle('kelechi.eth')} size={36} />
            <span className="fc-prompt">Share a signal, an alpha, or a question…</span>
            <span className="fc-tools">
              <Icon name="image" size={14} />
              <Icon name="tag" size={14} />
              <Icon name="sparkles" size={14} />
            </span>
          </div>

          <div className="feed-stream">
            {list.length === 0
              ? <div className="empty">Nothing here yet — change the filter or start the conversation.</div>
              : list.map(item => <FeedCard key={item.id} item={item} navigate={navigate} />)}
          </div>
        </div>

        <aside className="feed-rail">
          <div className="rail-card">
            <div className="rail-card-head">
              <span className="rail-card-title">Trending tags</span>
            </div>
            <ul className="rail-tags">
              {TRENDING_TAGS.map(t => (
                <li key={t.tag} className="rail-tag">
                  <span className="rt-h">#</span>{t.tag}
                  <span className="rt-c">{t.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rail-card">
            <div className="rail-card-head">
              <span className="rail-card-title">Who to follow</span>
            </div>
            <ul className="rail-users">
              {[...USERS].sort((a,b)=>b.kp-a.kp).slice(0,4).map(u => (
                <li key={u.handle} className="rail-user" onClick={() => navigate({ view: 'profile', handle: u.handle })}>
                  <Avatar user={u} size={32} />
                  <div className="ru-body">
                    <div className="ru-name">{u.name}</div>
                    <div className="ru-handle">@{u.handle}</div>
                  </div>
                  <button className="btn solid sm">Follow</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rail-card subtle">
            <div className="rail-note-title">Curated by Compass</div>
            <p className="rail-note-body">
              Your feed mixes high-signal posts from News, Alpha and Activities — re-ranked
              every 15 minutes by validation, freshness, and your KP-weighted interests.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

Object.assign(window, { FeedView, FeedCard, FEED_ITEMS });
