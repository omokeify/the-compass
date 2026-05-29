// Main views: Home, Category, Topic — modern light edition

// ---------- HOME ----------
const HomeFeed = ({ navigate, onCompose, onSignup, onJoinClass }) => {
  const liveClass = (window.CONFERENCES || []).find(c => c.status === 'live');
  return (
    <div className="view home">
      {liveClass && (
        <button className="live-now-banner" onClick={() => onJoinClass && onJoinClass(liveClass)}>
          <span className="lnb-pip"><span className="space-live-pip" /> LIVE CLASS</span>
          <span className="lnb-title">{liveClass.title}</span>
          <span className="lnb-host">{userByHandle(liveClass.host).name} is teaching now · {liveClass.attending} watching</span>
          <span className="lnb-cta">Join <Icon name="arrow-right" size={13} /></span>
        </button>
      )}

      <AdCarousel
        banners={HOME_AD_BANNERS}
        onAction={(b) => {
          if (b.action === 'signup') onSignup();
        }}
      />

      <FadeUp>
        <QuestsWidget navigate={navigate} />
      </FadeUp>

      <FadeUp>
        <OnlineMembersStrip navigate={navigate} />
      </FadeUp>

      <FadeUp>
        <HomeFeedStream navigate={navigate} onCompose={onCompose} />
      </FadeUp>

      <FadeUp>
        <EventsSection navigate={navigate} />
      </FadeUp>

      <FadeUp>
        <ContentSection navigate={navigate} />
      </FadeUp>

      <FadeUp>
        <CategoriesSection navigate={navigate} />
      </FadeUp>

      <FadeUp>
        <DiscussionsSection navigate={navigate} />
      </FadeUp>

      <FadeUp>
        <MembersSection navigate={navigate} />
      </FadeUp>
    </div>
  );
};

// ---------- Home Feed Stream — uses real FeedCard ----------
const HomeFeedStream = ({ navigate, onCompose }) => {
  const items = (window.FEED_ITEMS || []).slice(0, 4);
  return (
    <div className="section">
      <div className="section-head">
        <div>
          <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Live · the feed</div>
          <h2 className="section-title">What the community is shipping right now.</h2>
        </div>
        <div className="section-tools">
          <button className="section-link" onClick={() => navigate({ view: 'feed' })}>
            Open feed <Icon name="arrow-right" size={12} />
          </button>
        </div>
      </div>

      <div className="home-feed-layout">
        <div className="home-feed-col">
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
            {items.map(item => <FeedCard key={item.id} item={item} navigate={navigate} />)}
          </div>

          <button className="btn solid lg home-feed-more" onClick={() => navigate({ view: 'feed' })}>
            See all 9 posts in your feed <Icon name="arrow-right" size={13} />
          </button>
        </div>

        <aside className="home-feed-rail">
          <div className="rail-card">
            <div className="rail-card-head"><span className="rail-card-title">Trending</span></div>
            <ul className="rail-tags">
              {TRENDING_TAGS.slice(0, 6).map(t => (
                <li key={t.tag} className="rail-tag">
                  <span className="rt-h">#</span>{t.tag}
                  <span className="rt-c">{t.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rail-card">
            <div className="rail-card-head"><span className="rail-card-title">Who to follow</span></div>
            <ul className="rail-users">
              {[...USERS].sort((a,b)=>b.kp-a.kp).slice(0,3).map(u => (
                <li key={u.handle} className="rail-user" onClick={() => navigate({ view: 'profile', handle: u.handle })}>
                  <Avatar user={u} size={28} />
                  <div className="ru-body">
                    <div className="ru-name">{u.name}</div>
                    <div className="ru-handle">@{u.handle}</div>
                  </div>
                  <button className="btn solid sm">Follow</button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

// ---------- Online Members Strip ----------
const OnlineMembersStrip = ({ navigate }) => {
  return (
    <div className="section online-section">
      <div className="online-head">
        <div>
          <h2 className="online-title">
            Online <span className="online-count"><span className="online-dot" />{ONLINE_MEMBERS.length * 53 + 12} now</span>
          </h2>
        </div>
        <button className="btn solid" onClick={() => navigate({ view: 'leaderboard' })}>
          See more <Icon name="arrow-right" size={12} />
        </button>
      </div>
      <div className="online-strip">
        <div className="online-strip-track">
          {ONLINE_MEMBERS.map((m, i) => (
            <div key={i} className="online-av" title={`Member ${i + 1}`}>
              <Avatar user={m} size={44} />
              <span className="online-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- Content Section ----------
const CONTENT_BG = {
  navy:     { from: '#0c0f24', to: '#1e2a5a' },
  royal:    { from: '#172275', to: '#3349c4' },
  midnight: { from: '#080a18', to: '#1a1e3a' },
  plum:     { from: '#2a1456', to: '#5a2b95' },
  forest:   { from: '#0e2a1c', to: '#1f4a32' },
};

const ContentSection = ({ navigate }) => {
  const [tab, setTab] = React.useState('latest');
  return (
    <div className="section">
      <div className="section-head">
        <div>
          <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Editorial</div>
          <h2 className="section-title">Content from the community.</h2>
        </div>
        <div className="content-tools">
          <div className="content-tabs">
            <button className={`content-tab ${tab === 'latest' ? 'active' : ''}`} onClick={() => setTab('latest')}>Latest</button>
            <button className={`content-tab ${tab === 'popular' ? 'active' : ''}`} onClick={() => setTab('popular')}>Popular</button>
          </div>
          <button className="content-dd">All Tags <Icon name="arrow-down" size={11} /></button>
          <button className="content-dd">All <Icon name="arrow-down" size={11} /></button>
        </div>
      </div>
      <div className="content-grid">
        {CONTENT_ITEMS.map(item => {
          const bg = CONTENT_BG[item.bg] || CONTENT_BG.navy;
          const author = userByHandle(item.author);
          return (
            <article key={item.id} className="content-card" style={{ '--cc-from': bg.from, '--cc-to': bg.to }} onClick={() => navigate({ view: 'article', id: item.id })}>
              <div className="cc-cover">
                <div className="cc-grid" />
                <div className="cc-rings" />
                <div className="cc-kind">{`{ ${item.kind.toUpperCase()} }`}</div>
                <h3 className="cc-title">{item.title}</h3>
              </div>
              <div className="cc-body">
                <div className="cc-author">
                  <Avatar user={author} size={22} />
                  <span>{author.name}</span>
                </div>
                <div className="cc-meta">
                  <span>{item.when}</span>
                  <Dot />
                  <span>{item.minutes} min read</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Hero Card (Arc-style dark gradient + parallax) ----------
const HeroCard = ({ navigate, onCompose, onSignup }) => {
  const starsRef = useParallax(0.08);
  const codeRef = useParallax(-0.05);
  const chipA = useParallax(0.04);
  const chipB = useParallax(-0.03);

  return (
    <section className="hero-card">
      <div className="hero-bg" />
      <div className="hero-grid" />
      <div className="hero-stars" ref={starsRef} />

      {/* floating chips */}
      <div className="hero-chip" style={{ top: 28, left: 32 }} ref={chipA}>
        <span className="eyebrow-pulse-dot" /> 1,284 builders online
      </div>
      <div className="hero-chip" style={{ bottom: 32, right: 32 }} ref={chipB}>
        <Icon name="sparkles" size={12} /> 8 alphas validated this week
      </div>

      <div className="hero-inner">
        <div>
          <div className="hero-eyebrow">
            <span className="eyebrow-tag">Free</span>
            <span>Join 14,820 builders · no wallet required</span>
          </div>
          <h1 className="hero-title">
            One <em>compass.</em><br/>
            Every community-led<br/>
            opportunity.
          </h1>
          <p className="hero-sub">
            The Compass is where African builders, founders and creators trade signal —
            curated news, validated alpha, real bounties, live training, and IRL events.
            Join the network finding north together.
          </p>
          <div className="hero-actions">
            <button className="hero-cta" onClick={onSignup}>
              Join free — it takes 20 seconds <Icon name="arrow-right" size={14} />
            </button>
            <button className="hero-cta-ghost" onClick={() => navigate({ view: 'feed' })}>
              <Icon name="play" size={11} /> See the feed
            </button>
          </div>
          <div className="hero-trust">
            <AvatarStack handles={['compass.eth','degenscout','0xforesight','kelechi.eth','fatima.lens']} size={26} max={5} />
            <span><strong>4.9</strong> · 1,284 builders trust Compass for their daily edge.</span>
          </div>
        </div>

        <div className="hero-code" ref={codeRef}>
          <div><span className="hc-comment">// welcome to</span></div>
          <div><span className="hc-punct">{'{'}</span> <span className="hc-key">Compass</span> <span className="hc-punct">{'}'}</span></div>
          <div>.<span className="hc-fn">builders</span><span className="hc-punct">();</span></div>
          <div style={{ height: 14 }} />
          <div><span className="hc-key">community</span><span className="hc-punct">:</span> <span className="hc-str">"africa-first"</span><span className="hc-punct">,</span></div>
          <div><span className="hc-key">members</span><span className="hc-punct">:</span> <span className="hc-str">14,820</span><span className="hc-punct">,</span></div>
          <div><span className="hc-key">categories</span><span className="hc-punct">:</span> <span className="hc-str">8</span><span className="hc-punct">,</span></div>
          <div><span className="hc-key">bearing</span><span className="hc-punct">:</span> <span className="hc-str">"038°"</span></div>
        </div>
      </div>
    </section>
  );
};

// ---------- Events Section (horizontal scroller) ----------
const EventsSection = ({ navigate }) => {
  const events = [
    { id: 'lagos', title: 'Lagos Web3 Week', sub: 'Conferences, side events, builder house', date: 'Jun 12 – 15', going: 312, kind: 'IRL', tag: 'Now', from: '#1a2444', to: '#3d2a6e' },
    { id: 'base-ama', title: 'AMA: Base ecosystem fund', sub: 'With the Base BD team', date: 'Tue · 7pm WAT', going: 184, kind: 'Live', from: '#0052ff', to: '#5b8fff' },
    { id: 'zk', title: 'ZK Fundamentals', sub: 'Six-week live cohort begins', date: 'Jun 3', going: 96, kind: 'Course', from: '#cfe6b8', to: '#7fb86b' },
    { id: 'nairobi', title: 'Nairobi Builders Meetup', sub: 'iHub, third Sunday of the month', date: 'Jun 8', going: 78, kind: 'IRL', from: '#f7705a', to: '#c4350f' },
    { id: 'rep', title: 'On-chain rep systems', sub: 'Panel with Mosi, Kelechi & guests', date: 'Jun 18', going: 142, kind: 'Live', from: '#b89ef0', to: '#6446b0' },
    { id: 'voi', title: 'Voice of Impact', sub: 'June livestream + community awards', date: 'Jun 28', going: 220, kind: 'Live', from: '#f0c1c9', to: '#c4707c' },
  ];

  return (
    <div className="section">
      <div className="section-head">
        <div>
          <div className="section-eyebrow">
            <span className="section-eyebrow-dot" /> Happening soon
          </div>
          <h2 className="section-title">Events worth showing up for.</h2>
        </div>
        <div className="section-tools">
          <button className="section-link" onClick={() => navigate({ view: 'events' })}>
            All events <Icon name="arrow-right" size={12} />
          </button>
        </div>
      </div>
      <div className="events-row">
        {events.map(e => (
          <article key={e.id} className="event-card" style={{ '--ev-from': e.from, '--ev-to': e.to }}>
            <div className="event-cover">
              <span className={`event-badge ${e.tag === 'Now' ? 'now' : ''}`}>
                {e.tag || e.kind}
              </span>
              <div className="event-cover-title">{e.title}</div>
            </div>
            <div className="event-card-body">
              <h3 className="event-card-title">{e.sub}</h3>
              <div className="event-card-meta">
                <span>{e.date}</span>
                <span className="ec-going"><Icon name="users" size={11} /> {e.going}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

// ---------- Categories Section (Gradual-style pastel grid) ----------
const CategoriesSection = ({ navigate }) => {
  return (
    <div className="section">
      <div className="section-head">
        <div>
          <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Eight directions</div>
          <h2 className="section-title">Find your north.</h2>
          <p className="section-sub">
            Every conversation, opportunity and resource — sorted across eight pillars 
            of the Compass community.
          </p>
        </div>
      </div>
      <div className="cat-grid">
        {CATEGORIES.map((cat, i) => {
          const meta = CAT_META[cat.id];
          const decoClass = ['deco-rings', 'deco-blob', 'deco-stripes', 'deco-grid'][i % 4];
          return (
            <article
              key={cat.id}
              className={`cat-card ${meta.dark ? 'dark' : ''}`}
              onClick={() => navigate({ view: 'category', cat: cat.id })}
              style={{ '--card-bg': meta.bg, '--card-fg': meta.fg }}
            >
              <div className="cat-card-deco">
                <span className={decoClass} />
              </div>
              <div className="cat-card-num">{cat.code} / 08 — {cat.name.split(' ')[0]}</div>
              <h3 className="cat-card-title">{cat.name}</h3>
              <div className="cat-card-meta">
                <span>{formatNum(cat.posts)} posts</span>
                <Icon name="arrow-right" size={14} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Discussions Section ----------
const DiscussionsSection = ({ navigate }) => {
  const [filter, setFilter] = React.useState('latest');
  const filters = [
    { id: 'latest', label: 'Latest' },
    { id: 'top',    label: 'Top' },
    { id: 'hot',    label: 'Hot' },
    { id: 'unread', label: 'Unread' },
  ];

  let list = [...TOPICS];
  if (filter === 'top') list.sort((a, b) => b.likes - a.likes);
  else if (filter === 'hot') list = list.filter(t => t.hot || t.pinned);
  else if (filter === 'unread') list = list.slice(0, 4);
  else list.sort((a, b) => (a.pinned ? -1 : 0) - (b.pinned ? -1 : 0));

  list = list.slice(0, 8);

  return (
    <div className="section">
      <div className="section-head">
        <div>
          <div className="section-eyebrow"><span className="section-eyebrow-dot" /> The conversation</div>
          <h2 className="section-title">Discussions.</h2>
        </div>
        <div className="section-tools">
          <button className="section-link" onClick={() => navigate({ view: 'category', cat: 'news' })}>
            View all <Icon name="arrow-right" size={12} />
          </button>
        </div>
      </div>

      <div className="discussion-card">
        <div className="df-head">
          <div className="df-tabs">
            {filters.map(f => (
              <button key={f.id} className={`df-tab ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="df-head-title">{list.length} topics</div>
        </div>
        {list.map(t => <TopicRow key={t.id} topic={t} navigate={navigate} />)}
      </div>
    </div>
  );
};

// ---------- Members Section ----------
const MembersSection = ({ navigate }) => {
  const top = [...USERS].sort((a, b) => b.kp - a.kp).slice(0, 5);
  return (
    <div className="section">
      <div className="section-head">
        <div>
          <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Who's leading the way</div>
          <h2 className="section-title">Top navigators this month.</h2>
        </div>
        <div className="section-tools">
          <button className="section-link" onClick={() => navigate({ view: 'leaderboard' })}>
            Full leaderboard <Icon name="arrow-right" size={12} />
          </button>
        </div>
      </div>
      <div className="members-grid">
        {top.map((u, i) => (
          <article key={u.handle} className="member-card" onClick={() => navigate({ view: 'profile', handle: u.handle })}>
            <div className="mc-rank">{String(i + 1).padStart(2, '0')}</div>
            <Avatar user={u} size={48} />
            <div className="mc-name">{u.name}</div>
            <div className="mc-handle">@{u.handle}</div>
            <div className="mc-meta">
              <TierBadge tier={u.tier} />
            </div>
            <div className="mc-kp">{formatNum(u.kp)} KP</div>
          </article>
        ))}
      </div>
    </div>
  );
};

// ---------- Topic Row (used in feed + discussions) ----------
const TopicRow = ({ topic, navigate }) => {
  const cat = CATEGORIES.find(c => c.id === topic.cat);
  const author = userByHandle(topic.author);
  return (
    <article className="topic-row" onClick={() => navigate({ view: 'topic', topic: topic.id })}>
      <Avatar user={author} size={36} />
      <div className="tr-main">
        <div className="tr-titlebar">
          {topic.pinned && <span className="tr-flag pin"><Icon name="pin" size={10} /> pinned</span>}
          {topic.hot && <span className="tr-flag hot"><Icon name="flame" size={10} /> hot</span>}
          {topic.validated && <span className="tr-flag validated"><Icon name="check" size={10} /> validated</span>}
          {topic.locked && <span className="tr-flag lock"><Icon name="lock" size={10} /> {topic.locked}+</span>}
          <h3 className="tr-title">{topic.title}</h3>
        </div>
        <div className="tr-meta">
          <CategoryPill cat={cat} />
          {topic.tags.slice(0, 2).map(t => <span key={t} className="meta-tag">#{t}</span>)}
          <Dot />
          <span className="meta-author">by <strong>{topic.author}</strong></span>
        </div>
      </div>
      <div className="tr-stats">
        <AvatarStack handles={topic.participants} size={22} max={4} />
        <div className="tr-numbers">
          <div className="tr-stat"><span className="tr-stat-n">{formatNum(topic.replies)}</span><span className="tr-stat-l">replies</span></div>
          <div className="tr-stat hide-md"><span className="tr-stat-n">{formatNum(topic.views)}</span><span className="tr-stat-l">views</span></div>
        </div>
        <div className="tr-activity">
          <span className="tr-act-time">{topic.lastActivity}</span>
        </div>
      </div>
    </article>
  );
};

// ---------- CATEGORY PAGE ----------
const CategoryPage = ({ catId, navigate, onCompose }) => {
  const cat = CATEGORIES.find(c => c.id === catId);
  const topics = TOPICS.filter(t => t.cat === catId);
  const meta = CAT_META[catId];
  const [tab, setTab] = React.useState('latest');

  const isLight = !meta.dark;
  return (
    <div className="view category">
      <section
        className="cat-hero"
        style={{
          '--cat-hero-bg': meta.bg,
          '--cat-hero-fg': isLight ? meta.fg : '#fff',
          color: isLight ? meta.fg : '#fff',
        }}
      >
        <span className="cat-hero-deco" />
        <div>
          <div className="cat-hero-eyebrow">
            <span>{cat.code} / 08 · {cat.name}</span>
            {cat.premium && <span>· ✦ Premium</span>}
          </div>
          <h1 className="cat-hero-title">{cat.name}.</h1>
          <p className="cat-hero-desc">{cat.desc}</p>
        </div>
        <div className="cat-hero-foot">
          <div className="cat-hero-stats">
            <div className="chs"><div className="chs-n">{formatNum(cat.posts)}</div><div className="chs-l">topics</div></div>
            <div className="chs"><div className="chs-n">{formatNum(cat.posts * 7)}</div><div className="chs-l">replies</div></div>
            <div className="chs"><div className="chs-n">{cat.moderators?.length || 2}</div><div className="chs-l">moderators</div></div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className={isLight ? 'btn primary' : 'btn solid'} onClick={onCompose}>
              <Icon name="plus" size={13} /> New post
            </button>
            <button className="btn ghost" style={isLight ? {} : { borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <FadeUp>
        <div className="discussion-card">
          <div className="df-head">
            <div className="df-tabs">
              {['latest','top','validated','mine'].map(f => (
                <button key={f} className={`df-tab ${tab===f?'active':''}`} onClick={() => setTab(f)}>
                  {f[0].toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>
            <div className="df-head-title">{topics.length} topics</div>
          </div>
          {topics.length === 0
            ? <div className="empty">No topics yet — be the first to post here.</div>
            : topics.map(t => <TopicRow key={t.id} topic={t} navigate={navigate} />)}
        </div>
      </FadeUp>
    </div>
  );
};

Object.assign(window, {
  HomeFeed, HeroCard, EventsSection, CategoriesSection, DiscussionsSection,
  MembersSection, TopicRow, CategoryPage, OnlineMembersStrip, ContentSection,
  HomeFeedStream, CONTENT_BG,
});
