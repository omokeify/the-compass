// Feed view — vertical scroll of posts from News, Alpha, Activities + more

// Synthetic feed entries that go beyond plain TOPIC rows — they include
// snippets, optional media blocks, reactions, etc.
const FEED_ITEMS = [];

const SAMPLE_COMMENTS = {};

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
        <Avatar user={userByHandle('testuser')} size={38} />
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

const readFollowingList = () => {
  try {
    const list = localStorage.getItem('compass_following_v1');
    return list ? JSON.parse(list) : ['testuser'];
  } catch {
    return ['testuser'];
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

const normalizeFeedItem = (item) => {
  if (item.author_handle) {
    // Supabase format → mock format
    return {
      ...item,
      author: item.author_handle,
      when: item.created_at ? timeAgo(new Date(item.created_at)) : 'recent',
      reactions: {
        up: item.like_count || 0,
        comments: item.comment_count || 0,
        shares: item.repost_count || 0,
      },
      _supabase: true,
    };
  }
  return item;
};

const timeAgo = (date) => {
  const sec = Math.floor((Date.now() - date) / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const d = Math.floor(hr / 24);
  return `${d}d`;
};

const FeedCard = ({ item, navigate }) => {
  const author = item._supabase
    ? { handle: item.author_handle, name: item.author_name, avatar: item.author_avatar, hue: item.author_hue, tier: item.author_tier }
    : userByHandle(item.author);
  const cat = CATEGORIES.find(c => c.id === item.cat);

  const [liked, setLiked] = React.useState(false);
  const [reposted, setReposted] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(() => isSaved('post', item.id));
  const [commentOpen, setCommentOpen] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [comments, setComments] = React.useState([]);
  const [reported, setReported] = React.useState(false);
  const [shared, setShared] = React.useState(false);

  // Load comments from Supabase if available
  React.useEffect(() => {
    if (item._supabase && item.id) {
      supabaseService.getComments(item.id).then(c => {
        if (c?.length) setComments(c.map(cm => ({
          author: cm.author_id?.handle || 'user',
          when: timeAgo(new Date(cm.created_at)),
          body: cm.body,
          likes: 0,
        })));
      }).catch(() => {});
    }
  }, [item.id, item._supabase]);

  const [isFollowing, setIsFollowing] = React.useState(() => {
    return readFollowingList().includes(item.author);
  });

  React.useEffect(() => {
    const sync = () => {
      setIsFollowing(readFollowingList().includes(item.author));
    };
    window.addEventListener('compass_following_changed', sync);
    return () => window.removeEventListener('compass_following_changed', sync);
  }, [item.author]);

  const submitComment = () => {
    if (!draft.trim()) return;
    setComments(c => [...c, { author: 'testuser', when: 'just now', body: draft.trim(), likes: 0 }]);
    setDraft('');
    // Persist to Supabase if available
    if (item._supabase && window.supabaseService) {
      supabaseService.addComment({ postId: item.id, body: draft.trim() }).catch(() => {});
    }
  };

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    if (item._supabase && window.supabaseService) {
      try { await supabaseService.toggleReaction({ postId: item.id, type: 'like' }); } catch {}
    }
  };

  const handleRepost = async () => {
    const next = !reposted;
    setReposted(next);
    if (item._supabase && window.supabaseService) {
      try { await supabaseService.toggleReaction({ postId: item.id, type: 'repost' }); } catch {}
    }
  };

  const handleBookmark = async () => {
    const now = toggleSaved({ id: item.id, type: 'post', title: item.title, sub: cat ? cat.name : 'Post', hue: cat ? CAT_META[cat.id].bg : '#FFEA00' });
    setBookmarked(now);
    if (item._supabase && window.supabaseService) {
      try { await supabaseService.toggleReaction({ postId: item.id, type: 'bookmark' }); } catch {}
    }
  };

  const topComment = comments.length > 0
    ? [...comments].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0]
    : null;

  return (
    <article className="feed-card">
      <header className="feed-head">
        <Avatar user={author} size={40} />
        <div className="feed-head-body" onClick={() => navigate({ view: 'profile', handle: author.handle })} style={{ cursor: 'pointer' }}>
          <div className="feed-head-line">
            <span className="feed-author">{author.name}</span>
            <TierBadge tier={author.tier} />
            <span className="feed-handle">@{author.handle}</span>
            <span className="feed-type-pill">{item.type || (item.cat === 'alpha' ? 'Signal' : item.cat === 'earn' ? 'Bounty' : item.cat === 'activities' ? 'Resource' : 'Update')}</span>
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
          {author.handle !== 'testuser' && (
            <button
              className={`btn ${isFollowing ? 'ghost' : 'solid'} sm follow-btn`}
              onClick={async (e) => {
                e.stopPropagation();
                const next = !isFollowing;
                setIsFollowing(next);
                if (item._supabase && window.supabaseService && item.author_id) {
                  try { await supabaseService.toggleFollow(item.author_id); } catch { setIsFollowing(!next); }
                } else {
                  toggleFollow(author.handle);
                }
              }}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
          <button className={`btn ghost icon-only ${shared ? 'active' : ''}`} title={shared ? 'Copied' : 'Share'} onClick={() => setShared(true)}>
            <Icon name="reply" size={14} />
          </button>
          <button className={`btn ghost icon-only ${reported ? 'danger-soft' : ''}`} title={reported ? 'Reported' : 'Report'} onClick={() => setReported(true)}>
            <Icon name={reported ? 'check' : 'menu'} size={14} />
          </button>
        </div>
      </header>

      <h2 className="feed-title" onClick={() => navigate({ view: 'topic', topic: item.id })} style={{ cursor: 'pointer' }}>{item.title}</h2>
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
        onLike={handleLike}
        onComment={() => setCommentOpen(o => !o)}
        onRepost={handleRepost}
        onBookmark={handleBookmark}
      />

      {/* Inline Thread Previews when thread is closed */}
      {!commentOpen && item.cat === 'alpha' && item.validated && (
        <div className="feed-thread-preview validated-preview" onClick={() => setCommentOpen(true)}>
          <span className="ftp-badge validated"><Icon name="check" size={10} /> Validated</span>
          <span className="ftp-body">Monad mainnet alpha double-checked by 2 Navigators. Click to inspect signatures.</span>
          <span className="ftp-more-indicator">· {comments.length} replies</span>
        </div>
      )}

      {!commentOpen && topComment && !(item.cat === 'alpha' && item.validated) && (
        <div className="feed-thread-preview" onClick={() => setCommentOpen(true)}>
          <Avatar user={userByHandle(topComment.author)} size={20} />
          <span className="ftp-author">{userByHandle(topComment.author).name}:</span>
          <span className="ftp-body">"{topComment.body.length > 80 ? topComment.body.slice(0, 80) + '...' : topComment.body}"</span>
          <span className="ftp-more-indicator">· {comments.length} replies</span>
        </div>
      )}

      {commentOpen && (
        <div className="feed-comments">
          <div className="fc-head-row">
            <span className="fc-head-count">{comments.length} comments</span>
            <button className="btn ghost sm" onClick={() => setCommentOpen(false)}>Collapse thread</button>
          </div>
          {comments.length > 0 && (
            <ul className="fc-list">
              {comments.map((c, i) => {
                const u = userByHandle(c.author);
                return (
                  <li key={i} className={`fc-row ${c.mod ? 'mod' : ''}`}>
                    <Avatar user={u} size={28} />
                    <div className="fc-row-body">
                      <div className="fc-row-head">
                        <span className="fc-row-author" onClick={() => navigate({ view: 'profile', handle: u.handle })} style={{ cursor: 'pointer' }}>{u.name}</span>
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
            <Avatar user={userByHandle('testuser')} size={28} />
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

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-header">
      <div className="skeleton-avatar" />
      <div className="skeleton-meta">
        <div className="skeleton-line short" />
        <div className="skeleton-line medium" />
      </div>
    </div>
    <div className="skeleton-line long skeleton-title" />
    <div className="skeleton-body">
      <div className="skeleton-line long" />
      <div className="skeleton-line medium" />
    </div>
  </div>
);


const FeedView = ({ navigate, onCompose, currentUser }) => {
  const [filter, setFilter] = React.useState('all');
  const [sort, setSort] = React.useState('latest');
  const [loading, setLoading] = React.useState(false);
  const [feedItems, setFeedItems] = React.useState([]);
  const [followingUsers, setFollowingUsers] = React.useState([]);
  const [userReactions, setUserReactions] = React.useState([]);

  const loadPosts = React.useCallback(async () => {
    try {
      const posts = await supabaseService.getPosts({ sort });
      setFeedItems(posts.map(normalizeFeedItem));
    } catch {
      setFeedItems(FEED_ITEMS);
    }
  }, [sort]);

  React.useEffect(() => { loadPosts(); }, [loadPosts]);

  // Refresh feed when new post is published
  React.useEffect(() => {
    const handler = () => loadPosts();
    window.addEventListener('compass_feed_refresh', handler);
    return () => window.removeEventListener('compass_feed_refresh', handler);
  }, [loadPosts]);

  React.useEffect(() => {
    if (!currentUser?.id) return;
    supabaseService.getUserReactions(currentUser.id).then(reactions => {
      setUserReactions(reactions || []);
    }).catch(() => {});

    supabaseService.getFollowing(currentUser.id).then(follows => {
      setFollowingUsers(follows.map(f => f.following_id));
    }).catch(() => {});
  }, [currentUser?.id]);

  const refreshFeed = async () => {
    setLoading(true);
    try {
      const posts = await supabaseService.getPosts({ sort });
      setFeedItems(posts);
    } catch {}
    setTimeout(() => setLoading(false), 300);
  };

  const handleFilterChange = (nextFilter) => {
    setLoading(true);
    setFilter(nextFilter);
    setTimeout(() => setLoading(false), 300);
  };

  const handleSortChange = (nextSort) => {
    setLoading(true);
    setSort(nextSort);
    setTimeout(() => setLoading(false), 300);
  };

  const filters = [
    { id: 'all',        label: 'All Feed',        icon: 'sparkles' },
    { id: 'following',  label: 'Following',       icon: 'users' },
    { id: 'alpha',      label: 'Alpha Highlights', icon: 'flame' },
  ];

  // Dynamic filter
  let list = [...feedItems];
  if (filter === 'alpha') {
    list = feedItems.filter(it => it.cat === 'alpha');
  } else if (filter === 'following') {
    list = feedItems.filter(it => followingUsers.includes(it.author_id));
  }

  // Dynamic sort
  if (sort === 'hot') {
    list.sort((a, b) => (b.like_count - a.like_count) || (b.comment_count - a.comment_count));
  }

  return (
    <div className="view feed-view">
      <div className="feed-layout">
        <div className="feed-col">
          <header className="feed-page-head">
            <div>
              <div className="section-eyebrow"><span className="section-eyebrow-dot" /> Your feed</div>

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
                onClick={() => handleFilterChange(f.id)}
              >
                <Icon name={f.icon} size={13} />
                <span>{f.label}</span>
                <span className="ff-count">{feedItems.length}</span>
              </button>
            ))}
          </div>

          <InlineFeedComposer onCompose={onCompose} />

          {/* Quick composer */}
          <div className="feed-composer feed-composer-legacy" onClick={onCompose}>
            <Avatar user={userByHandle('testuser')} size={36} />
            <span className="fc-prompt">Share a signal, an alpha, or a question…</span>
            <span className="fc-tools">
              <Icon name="image" size={14} />
              <Icon name="tag" size={14} />
              <Icon name="sparkles" size={14} />
            </span>
          </div>

          {/* Sorting Toolbar */}
          <div className="feed-sorting-bar">
            <span className="fsb-label">Sort by:</span>
            <div className="fsb-options">
              {[
                { id: 'latest', label: 'Latest' },
                { id: 'hot', label: 'Trending Hot' },
                { id: 'unanswered', label: 'Unanswered' },
                { id: 'validated', label: 'Validated Alpha' }
              ].map(opt => (
                <button
                  key={opt.id}
                  className={`fsb-opt ${sort === opt.id ? 'active' : ''}`}
                  onClick={() => handleSortChange(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="feed-stream">
            {loading ? (
              <div className="skeleton-stream">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : list.length === 0 ? (
              <div className="empty">Nothing here yet — change the filter or start the conversation.</div>
            ) : (
              list.map(item => <FeedCard key={item.id} item={item} navigate={navigate} />)
            )}
          </div>
        </div>

        <aside className="feed-rail">
          <div className="rail-card today-card">
            <div className="rail-card-head">
              <span className="rail-card-title">Today</span>
            </div>
            <div className="today-grid">
              {[
                { label: 'Validated alpha', value: FEED_ITEMS.filter(i => i.validated).length, icon: 'check' },
                { label: 'Open replies', value: FEED_ITEMS.reduce((n, i) => n + i.reactions.comments, 0), icon: 'chat' },
                { label: 'Saved items', value: readSaved().length, icon: 'wallet' },
              ].map(card => (
                <div key={card.label} className="today-metric">
                  <Icon name={card.icon} size={13} />
                  <strong>{card.value.toLocaleString()}</strong>
                  <span>{card.label}</span>
                </div>
              ))}
            </div>
          </div>

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
              {[...USERS].sort((a,b)=>b.kp-a.kp).slice(0,4).map(u => {
                const isFollowingThisUser = followingUsers.includes(u.handle);
                return (
                  <li key={u.handle} className="rail-user">
                    <div onClick={() => navigate({ view: 'profile', handle: u.handle })} style={{ display: 'flex', gap: 10, flex: 1, cursor: 'pointer', alignItems: 'center' }}>
                      <Avatar user={u} size={32} />
                      <div className="ru-body">
                        <div className="ru-name">{u.name}</div>
                        <div className="ru-handle">@{u.handle}</div>
                      </div>
                    </div>
                    {u.handle !== 'testuser' && (
                      <button 
                        className={`btn ${isFollowingThisUser ? 'ghost' : 'solid'} sm`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFollow(u.handle);
                        }}
                      >
                        {isFollowingThisUser ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </li>
                );
              })}
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

      {/* Floating Action Mobile Composer Button */}
      <button className="mobile-fab-composer" onClick={onCompose} title="Create new post">
        <Icon name="plus" size={24} />
      </button>
    </div>
  );
};

Object.assign(window, { FeedView, FeedCard, FEED_ITEMS });
