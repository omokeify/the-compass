// Feed view — vertical scroll of posts from News, Alpha, Activities + more

// Synthetic feed entries that go beyond plain TOPIC rows — they include
// snippets, optional media blocks, reactions, etc.
const FEED_ITEMS = [
  {
    id: 'f1',
    author: 'amara',
    cat: 'alpha',
    title: 'Shared a new audit checklist for smart contract launches',
    body: 'A concise security checklist for teams shipping token launches in 2026.',
    when: '3m',
    likes: 38,
    reactions: { comments: 5, shares: 4 },
    validated: true,
    hot: true,
  },
  {
    id: 'f2',
    author: 'felix',
    cat: 'news',
    title: 'Nigeria Web3 policy update: what builders should know',
    body: 'New guidance on payments rails is rolling out next month for startups.',
    when: '12m',
    likes: 18,
    reactions: { comments: 2, shares: 1 },
    validated: false,
  },
  {
    id: 'f3',
    author: 'zara',
    cat: 'activities',
    title: 'Designing UX for creator DAOs: 5 practical patterns',
    body: 'A quick read on building onboarding flows that scale with community growth.',
    when: '1h',
    likes: 24,
    reactions: { comments: 8, shares: 2 },
    validated: true,
  },
];

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
  try {
    return JSON.parse(localStorage.getItem(FEED_DRAFT_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeFeedDraft = (draft) => {
  try {
    localStorage.setItem(FEED_DRAFT_KEY, JSON.stringify(draft));
  } catch {}
};

const ReactionRow = ({
  r,
  liked,
  reposted,
  bookmarked,
  onLike,
  onComment,
  onRepost,
  onBookmark,
  commentOpen,
}) => (
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
    <button
      className={`fr-act bookmark ${bookmarked ? 'on' : ''}`}
      onClick={onBookmark}
      title={bookmarked ? 'Saved' : 'Save'}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill={bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
    </button>
    <button className="fr-act subtle" title="Views">
      <Icon name="eye" size={13} />
    </button>
  </div>
);

const FeedMedia = ({ media, postId }) => {
  if (!media) return null;
  if (media.kind === 'link') {
    return (
      <a className="feed-link" style={{ '--ml-accent': media.accent }}>
        <div className="ml-icon">
          <Icon name="globe" size={18} />
        </div>
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
          <div
            key={i}
            className="fg-tile"
            style={{
              background: `linear-gradient(135deg, oklch(0.68 0.16 ${g.hue}), oklch(0.42 0.14 ${g.hue}))`,
            }}
          />
        ))}
      </div>
    );
  }
  if (media.kind === 'poll') {
    return <FeedPoll poll={media} postId={postId} />;
  }
  return null;
};

const FeedPoll = ({ poll, postId }) => {
  const [voted, setVoted] = React.useState(null);
  const [votes, setVotes] = React.useState([]);
  const [pollId, setPollId] = React.useState(poll.id || null);
  React.useEffect(() => {
    if (postId && supabaseService?.getPollByPost) {
      supabaseService
        .getPollByPost(postId)
        .then((p) => {
          if (p) {
            setPollId(p.id);
            supabaseService
              .getPollVotes(p.id)
              .then((v) => {
                setVotes(v || []);
                const session = supabaseService.getSession?.();
                const myVote = v?.find((vv) => vv.user_id === session?.user?.id);
                if (myVote !== undefined) setVoted(myVote.option_index);
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, [postId]);
  const tally = poll.options.map((o, i) => ({
    label: o.text || o.label,
    count: votes.filter((v) => v.option_index === i).length,
  }));
  const totalVotes = tally.reduce((s, t) => s + t.count, 0);
  return (
    <div className="feed-poll">
      <div className="fp-q">{poll.question}</div>
      <div className="fp-opts">
        {tally.map((t, i) => {
          const pct = totalVotes ? Math.round((t.count / totalVotes) * 100) : 0;
          const isPicked = voted === i;
          return (
            <button
              key={i}
              className={`fp-opt ${voted !== null ? 'revealed' : ''} ${isPicked ? 'picked' : ''}`}
              onClick={async () => {
                if (voted !== null) return;
                if (pollId && supabaseService?.votePoll) {
                  const ok = await supabaseService.votePoll(pollId, i);
                  if (ok) {
                    setVoted(i);
                    setVotes((prev) => [...prev, { option_index: i, user_id: 'me' }]);
                  }
                } else {
                  setVoted(i);
                }
              }}
              disabled={voted !== null}
            >
              {voted !== null && <span className="fp-bar" style={{ width: pct + '%' }} />}
              <span className="fp-opt-label">{t.label}</span>
              {voted !== null && (
                <span className="fp-opt-pct">
                  {pct}%{isPicked && <Icon name="check" size={11} />}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="fp-meta">
        {totalVotes.toLocaleString()} votes{poll.closes ? ` · ${poll.closes}` : ''}
      </div>
    </div>
  );
};

let mentionAutocompleteCleanup = null;

const MentionAutocomplete = ({ text, onSelect, cursorPos }) => {
  const [matches, setMatches] = React.useState([]);
  const [selected, setSelected] = React.useState(0);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const before = (text || '').slice(0, cursorPos || text?.length || 0);
    const match = before.match(/@(\w*)$/);
    if (!match) {
      setMatches([]);
      return;
    }
    const q = match[1].toLowerCase();
    const users = window.USERS || [];
    const filtered = users.filter(
      (u) => u.handle.toLowerCase().startsWith(q) || u.name.toLowerCase().startsWith(q),
    );
    setMatches(filtered.slice(0, 6));
    setSelected(0);
  }, [text, cursorPos]);

  React.useEffect(() => {
    const handler = (e) => {
      if (!matches.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, matches.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (matches[selected]) onSelect(matches[selected]);
      }
    };
    document.addEventListener('keydown', handler);
    mentionAutocompleteCleanup = () => document.removeEventListener('keydown', handler);
    return mentionAutocompleteCleanup;
  }, [matches, selected, onSelect]);

  if (!matches.length) return null;
  return (
    <div className="mention-suggest" ref={ref}>
      {matches.map((u, i) => (
        <button
          key={u.handle}
          className={`mention-suggest-item ${i === selected ? 'active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(u);
          }}
          onMouseEnter={() => setSelected(i)}
        >
          <Avatar user={u} size={20} />
          <span className="ms-name">{u.name}</span>
          <span className="ms-handle">@{u.handle}</span>
        </button>
      ))}
    </div>
  );
};

const InlineFeedComposer = ({ onCompose, currentUser }) => {
  const [draft, setDraft] = React.useState({ body: '', type: 'Signal' });
  const [postType, setPostType] = React.useState('Signal');

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('compass_feed_draft_v1');
      if (saved) setDraft(JSON.parse(saved));
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem('compass_feed_draft_v1', JSON.stringify(draft));
    } catch {}
  }, [draft]);

  return (
    <div className="feed-inline-composer">
      <div className="fic-top">
        <Avatar user={currentUser} size={38} />
        <div className="fic-body">
          <div className="fic-types">
            {Object.entries(FEED_TYPE_META).map(([type, meta]) => (
              <button
                key={type}
                className={`fic-type ${draft.type === type ? 'active' : ''}`}
                title={meta.desc}
                onClick={() => setDraft((d) => ({ ...d, type }))}
              >
                <Icon name={meta.icon} size={12} /> {type}
              </button>
            ))}
          </div>
          <div className="fic-textarea-wrap">
            <textarea
              className="fic-input"
              value={draft.body}
              placeholder={`Share a ${draft.type.toLowerCase()} with the community...`}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            />
            <MentionAutocomplete
              text={draft.body}
              cursorPos={draft.body?.length}
              onSelect={(u) => {
                const before = draft.body.replace(/@\w*$/, '@' + u.handle + ' ');
                setDraft((d) => ({ ...d, body: before }));
              }}
            />
          </div>
        </div>
      </div>
      <div className="fic-foot">
        <div className="fic-hint">
          <Icon name="sparkles" size={12} />
          Draft saves on this browser.
        </div>
        <div className="fic-actions">
          {draft.body && (
            <button className="btn ghost sm" onClick={clearDraft}>
              Clear
            </button>
          )}
          <button className="btn primary sm" onClick={onCompose}>
            <Icon name="plus" size={11} /> Open composer
          </button>
        </div>
      </div>
    </div>
  );
};

const parseMentions = (text) => {
  const mentions = text.match(/@(\w+)/g);
  if (!mentions) return [];
  return mentions.map((m) => m.slice(1));
};

const notifyMentions = async (text, actorHandle, target, targetId) => {
  const handles = parseMentions(text);
  for (const h of handles) {
    const userId = await supabaseService.getUserIdByHandle(h);
    if (userId) {
      supabaseService.createNotification(
        userId,
        'mention',
        'mentioned you',
        actorHandle,
        target,
        targetId,
      );
    }
  }
};

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
      next = current.filter((h) => h !== authorHandle);
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

const FeedCard = ({ item, navigate, currentUser }) => {
  const author = item._supabase
    ? {
        handle: item.author_handle,
        name: item.author_name,
        avatar: item.author_avatar,
        hue: item.author_hue,
        tier: item.author_tier,
      }
    : userByHandle(item.author);
  const cat = CATEGORIES.find((c) => c.id === item.cat);

  const [liked, setLiked] = React.useState(false);
  const [reposted, setReposted] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(() => isSaved('post', item.id));
  const [commentOpen, setCommentOpen] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [comments, setComments] = React.useState([]);
  const [reported, setReported] = React.useState(false);
  const [shared, setShared] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [editDraft, setEditDraft] = React.useState('');
  const [quoteText, setQuoteText] = React.useState('');
  const [showQuote, setShowQuote] = React.useState(false);
  const [solvedCommentId, setSolvedCommentId] = React.useState(item.solved_comment_id || null);
  const [showFlagForm, setShowFlagForm] = React.useState(false);
  const [flagReason, setFlagReason] = React.useState('');
  const [showVersions, setShowVersions] = React.useState(false);
  const [versions, setVersions] = React.useState([]);
  const [editingCommentId, setEditingCommentId] = React.useState(null);
  const [editingCommentText, setEditingCommentText] = React.useState('');

  // Load comments from Supabase if available
  React.useEffect(() => {
    if (item._supabase && item.id) {
      supabaseService
        .getComments(item.id)
        .then((c) => {
          if (c?.length)
            setComments(
              c.map((cm) => ({
                id: cm.id,
                author: cm.author_id?.handle || 'user',
                when: timeAgo(new Date(cm.created_at)),
                body: cm.body,
                likes: 0,
              })),
            );
        })
        .catch(() => {});
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
    const handle = currentUser?.handle || 'user';
    setComments((c) => [...c, { author: handle, when: 'just now', body: draft.trim(), likes: 0 }]);
    const body = draft.trim();
    setDraft('');
    if (item._supabase && window.supabaseService) {
      window.supabaseService
        .addComment({ postId: item.id, body })
        .then(() => {
          if (item.author_id) {
            window.supabaseService.createNotification(
              item.author_id,
              'reply',
              'replied to your post',
              currentUser?.handle,
              item.title,
              item.id,
            );
          }
          notifyMentions(body, currentUser?.handle, item.title, item.id);
        })
        .catch(() => {
          if (window.showToast) window.showToast('Failed to post comment');
        });
    }
  };

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    if (item._supabase && window.supabaseService) {
      try {
        await window.supabaseService.toggleReaction({ postId: item.id, type: 'like' });
        if (next && item.author_id) {
          window.supabaseService.createNotification(
            item.author_id,
            'like',
            'liked your post',
            currentUser?.handle,
            item.title,
            item.id,
          );
        }
      } catch {
        setLiked(!next);
        if (window.showToast) window.showToast('Failed to like');
      }
    }
  };

  const handleRepost = async () => {
    const next = !reposted;
    setReposted(next);
    if (item._supabase && window.supabaseService) {
      try {
        await window.supabaseService.toggleReaction({ postId: item.id, type: 'repost' });
        if (next && item.author_id) {
          window.supabaseService.createNotification(
            item.author_id,
            'reply',
            'reposted your post',
            currentUser?.handle,
            item.title,
            item.id,
          );
        }
      } catch {
        setReposted(!next);
        if (window.showToast) window.showToast('Failed to repost');
      }
    }
  };

  const handleBookmark = async () => {
    const now = toggleSaved({
      id: item.id,
      type: 'post',
      title: item.title,
      sub: cat ? cat.name : 'Post',
      hue: cat ? CAT_META[cat.id].bg : '#FFEA00',
    });
    setBookmarked(now);
    if (item._supabase && window.supabaseService) {
      try {
        await supabaseService.toggleReaction({ postId: item.id, type: 'bookmark' });
      } catch {}
    }
  };

  const topComment =
    comments.length > 0 ? [...comments].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0] : null;

  return (
    <article className="feed-card">
      <header className="feed-head">
        <Avatar user={author} size={40} />
        <div
          className="feed-head-body"
          onClick={() => navigate({ view: 'profile', handle: author.handle })}
          style={{ cursor: 'pointer' }}
        >
          <div className="feed-head-line">
            <span className="feed-author">{author.name}</span>
            <TierBadge tier={author.tier} />
            <span className="feed-handle">@{author.handle}</span>
            <span className="feed-type-pill">
              {item.type ||
                (item.cat === 'alpha'
                  ? 'Signal'
                  : item.cat === 'earn'
                    ? 'Bounty'
                    : item.cat === 'activities'
                      ? 'Resource'
                      : 'Update')}
            </span>
          </div>
          <div className="feed-head-meta">
            <CategoryPill cat={cat} />
            <Dot />
            <span>{item.when} ago</span>
            {item.pinned && (
              <>
                <Dot />
                <span className="tr-flag pin">
                  <Icon name="pin" size={10} /> pinned
                </span>
              </>
            )}
            {item.hot && (
              <>
                <Dot />
                <span className="tr-flag hot">
                  <Icon name="flame" size={10} /> hot
                </span>
              </>
            )}
            {item.validated && (
              <>
                <Dot />
                <span className="tr-flag validated">
                  <Icon name="check" size={10} /> validated
                </span>
              </>
            )}
          </div>
        </div>
        <div className="feed-more">
          <button
            className={`btn ${isFollowing ? 'ghost' : 'solid'} sm follow-btn`}
            onClick={async (e) => {
              e.stopPropagation();
              const next = !isFollowing;
              setIsFollowing(next);
              if (item._supabase && window.supabaseService && item.author_id) {
                try {
                  await supabaseService.toggleFollow(item.author_id);
                  if (next) {
                    supabaseService.createNotification(
                      item.author_id,
                      'follow',
                      'followed you',
                      currentUser?.handle,
                    );
                  }
                } catch {
                  setIsFollowing(!next);
                }
              } else {
                toggleFollow(author.handle);
              }
            }}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button
            className={`btn ghost icon-only ${shared ? 'active' : ''}`}
            title={shared ? 'Copied' : 'Share'}
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await navigator.clipboard.writeText(
                  window.location.origin + '/articles/' + item.id,
                );
                setShared(true);
                setTimeout(() => setShared(false), 2000);
              } catch {}
            }}
          >
            <Icon name="reply" size={14} />
          </button>
          {author?.handle === currentUser?.handle && (
            <div className="feed-menu-wrap" style={{ position: 'relative' }}>
              <button
                className="btn ghost icon-only"
                title="More"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((o) => !o);
                }}
              >
                <Icon name="menu" size={14} />
              </button>
              {menuOpen && (
                <div
                  className="feed-menu-dropdown"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    background: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    minWidth: 140,
                  }}
                >
                  {getUserLevel(currentUser) >= 3 && (
                    <button
                      className="btn ghost sm"
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(true);
                        setMenuOpen(false);
                      }}
                    >
                      <Icon name="gear" size={12} /> Edit
                    </button>
                  )}
                  <button
                    className="btn ghost sm"
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: '8px 12px',
                      color: '#d32f2f',
                    }}
                    onClick={async (e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      if (item._supabase && supabaseService) {
                        try {
                          await supabaseService.deletePost(item.id);
                          window.dispatchEvent(new Event('compass_feed_refresh'));
                        } catch {}
                      }
                    }}
                  >
                    <Icon name="x" size={12} /> Delete
                  </button>
                  <button
                    className="btn ghost sm"
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px' }}
                    onClick={async (e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      if (item._supabase && supabaseService) {
                        const v = await supabaseService.getPostVersions(item.id);
                        setVersions(v || []);
                        setShowVersions(true);
                      }
                    }}
                  >
                    <Icon name="clock" size={12} /> Edit history
                  </button>
                </div>
              )}
            </div>
          )}
          {author?.handle !== currentUser?.handle && (
            <div className="feed-menu-wrap" style={{ position: 'relative' }}>
              {(currentUser?.role === 'admin' || currentUser?.role === 'mod') && (
                <button
                  className={`btn ghost icon-only ${item.locked ? 'active' : ''}`}
                  title={item.locked ? 'Unlock thread' : 'Lock thread'}
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (item._supabase && supabaseService) {
                      await supabaseService.toggleLockPost(item.id);
                      window.dispatchEvent(new Event('compass_feed_refresh'));
                    }
                  }}
                >
                  <Icon name={item.locked ? 'lock' : 'unlock'} size={14} />
                </button>
              )}
              <button
                className={`btn ghost icon-only ${reported ? 'danger-soft' : ''}`}
                title="Flag"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFlagForm((o) => !o);
                }}
              >
                <Icon name={reported ? 'check' : 'alert'} size={14} />
              </button>
              {showFlagForm && (
                <div
                  className="feed-menu-dropdown"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    background: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    minWidth: 200,
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Report this post
                  </div>
                  <select
                    className="field-input"
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    style={{ marginBottom: 6, fontSize: 13 }}
                  >
                    <option value="">Select a reason…</option>
                    <option value="spam">Spam</option>
                    <option value="harassment">Harassment</option>
                    <option value="misinformation">Misinformation</option>
                    <option value="nsfw">Not safe for work</option>
                    <option value="other">Other</option>
                  </select>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn primary sm"
                      disabled={!flagReason}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (item._supabase && supabaseService) {
                          try {
                            await supabaseService.createFlag('post', item.id, flagReason);
                            setReported(true);
                            setShowFlagForm(false);
                            setTimeout(() => setReported(false), 3000);
                          } catch {}
                        }
                      }}
                    >
                      <Icon name="check" size={11} /> Report
                    </button>
                    <button
                      className="btn ghost sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFlagForm(false);
                        setFlagReason('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {editing ? (
        <div className="feed-edit-area">
          <input
            className="field-input"
            defaultValue={item.title}
            onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
            placeholder="Title"
            style={{ marginBottom: 8 }}
          />
          <textarea
            className="field-input"
            defaultValue={item.body}
            onChange={(e) => setEditDraft({ ...editDraft, body: e.target.value })}
            rows={3}
            placeholder="Body"
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              className="btn primary sm"
              onClick={async () => {
                if (item._supabase && supabaseService) {
                  try {
                    await supabaseService.updatePost(item.id, {
                      title: editDraft.title || item.title,
                      body: editDraft.body || item.body,
                    });
                    setEditing(false);
                    window.dispatchEvent(new Event('compass_feed_refresh'));
                  } catch {}
                }
              }}
            >
              <Icon name="check" size={11} /> Save
            </button>
            <button className="btn ghost sm" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <h2
          className="feed-title"
          onClick={() => navigate({ view: 'topic', topic: item.id })}
          style={{ cursor: 'pointer' }}
        >
          {solvedCommentId && (
            <span className="tr-flag validated" style={{ marginRight: 6 }}>
              <Icon name="check" size={10} /> Solved
            </span>
          )}
          {item.title}
        </h2>
      )}
      {!editing && <p className="feed-body">{item.body}</p>}
      {item.locked && (
        <div className="feed-locked">
          <Icon name="lock" size={13} />
          <span>
            <strong>{item.locked}+ only</strong> — unlock with KP or upgrade your tier.
          </span>
          <button className="btn solid sm">View details</button>
        </div>
      )}
      {item.cat === 'alpha' && (
        <div className={`feed-risk ${item.validated ? 'validated' : ''}`}>
          <Icon name={item.validated ? 'check' : 'lock'} size={12} />
          <span>
            {item.validated
              ? 'Validated by Navigators. Still verify contracts and links before acting.'
              : 'Alpha is tier-gated until moderators validate the supporting evidence.'}
          </span>
        </div>
      )}
      <FeedMedia media={item.media} postId={item.id} />

      <ReactionRow
        r={item.reactions}
        liked={liked}
        reposted={reposted}
        bookmarked={bookmarked}
        commentOpen={commentOpen}
        onLike={handleLike}
        onComment={() => setCommentOpen((o) => !o)}
        onRepost={() => setShowQuote((o) => !o)}
        onBookmark={handleBookmark}
      />
      {showQuote && (
        <div
          className="feed-quote-repost"
          style={{ marginTop: 8, padding: '8px 12px', background: '#f5f5f5', borderRadius: 8 }}
        >
          <textarea
            className="field-input"
            placeholder="Add your commentary..."
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            rows={2}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              className="btn primary sm"
              disabled={!quoteText.trim()}
              onClick={async () => {
                const next = !reposted;
                setReposted(next);
                if (item._supabase && window.supabaseService) {
                  try {
                    await window.supabaseService.toggleReaction({
                      postId: item.id,
                      type: 'repost',
                    });
                    if (next && item.author_id) {
                      window.supabaseService.createNotification(
                        item.author_id,
                        'reply',
                        'reposted your post: ' + quoteText,
                        currentUser?.handle,
                        item.title,
                        item.id,
                      );
                    }
                  } catch {
                    setReposted(!next);
                  }
                }
                setShowQuote(false);
                setQuoteText('');
              }}
            >
              <Icon name="reply" size={11} /> {reposted ? 'Reposted' : 'Repost'}
            </button>
            <button
              className="btn ghost sm"
              onClick={() => {
                setShowQuote(false);
                setQuoteText('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Inline Thread Previews when thread is closed */}
      {!commentOpen && item.cat === 'alpha' && item.validated && (
        <div className="feed-thread-preview validated-preview" onClick={() => setCommentOpen(true)}>
          <span className="ftp-badge validated">
            <Icon name="check" size={10} /> Validated
          </span>
          <span className="ftp-body">
            Monad mainnet alpha double-checked by 2 Navigators. Click to inspect signatures.
          </span>
          <span className="ftp-more-indicator">· {comments.length} replies</span>
        </div>
      )}

      {!commentOpen && topComment && !(item.cat === 'alpha' && item.validated) && (
        <div className="feed-thread-preview" onClick={() => setCommentOpen(true)}>
          <Avatar user={userByHandle(topComment.author)} size={20} />
          <span className="ftp-author">{userByHandle(topComment.author).name}:</span>
          <span className="ftp-body">
            "{topComment.body.length > 80 ? topComment.body.slice(0, 80) + '...' : topComment.body}"
          </span>
          <span className="ftp-more-indicator">· {comments.length} replies</span>
        </div>
      )}

      {commentOpen && (
        <div className="feed-comments">
          <div className="fc-head-row">
            <span className="fc-head-count">{comments.length} comments</span>
            <button className="btn ghost sm" onClick={() => setCommentOpen(false)}>
              Collapse thread
            </button>
          </div>
          {comments.length > 0 && (
            <ul className="fc-list">
              {comments.map((c, i) => {
                const u = userByHandle(c.author);
                const isAnswer = c.id === solvedCommentId;
                const isEditing = editingCommentId === c.id;
                return (
                  <li
                    key={i}
                    className={`fc-row ${c.mod ? 'mod' : ''} ${isAnswer ? 'answer' : ''}`}
                  >
                    <Avatar user={u} size={28} />
                    <div className="fc-row-body">
                      <div className="fc-row-head">
                        <span
                          className="fc-row-author"
                          onClick={() => navigate({ view: 'profile', handle: u.handle })}
                          style={{ cursor: 'pointer' }}
                        >
                          {u.name}
                        </span>
                        <TierBadge tier={u.tier} />
                        <span className="fc-row-when">· {c.when}</span>
                        {isAnswer && (
                          <span
                            className="tr-flag validated"
                            style={{ background: '#194d2a', color: '#fff' }}
                          >
                            <Icon name="check" size={9} /> Answer
                          </span>
                        )}
                        {c.mod && (
                          <span className="tr-flag pin">
                            <Icon name="compass" size={9} /> mod
                          </span>
                        )}
                        {c.validated && (
                          <span className="tr-flag validated">
                            <Icon name="check" size={9} /> validated
                          </span>
                        )}
                      </div>
                      {isEditing ? (
                        <div>
                          <textarea
                            className="field-input"
                            defaultValue={c.body}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            rows={2}
                            style={{ margin: '4px 0' }}
                          />
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn primary xs"
                              onClick={async () => {
                                if (item._supabase && supabaseService) {
                                  await supabaseService.updateComment(
                                    c.id,
                                    editingCommentText || c.body,
                                  );
                                  setComments((prev) =>
                                    prev.map((x) =>
                                      x.id === c.id
                                        ? { ...x, body: editingCommentText || c.body }
                                        : x,
                                    ),
                                  );
                                  setEditingCommentId(null);
                                }
                              }}
                            >
                              <Icon name="check" size={10} /> Save
                            </button>
                            <button
                              className="btn ghost xs"
                              onClick={() => setEditingCommentId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="fc-row-text">{c.body}</p>
                      )}
                      <div className="fc-row-actions">
                        <button>
                          <Icon name="arrow-up" size={11} /> {c.likes}
                        </button>
                        <button>
                          <Icon name="reply" size={11} /> Reply
                        </button>
                        {c.author === currentUser?.handle && !isEditing && (
                          <button
                            style={{ fontSize: 12 }}
                            onClick={() => {
                              setEditingCommentId(c.id);
                              setEditingCommentText(c.body);
                            }}
                          >
                            <Icon name="gear" size={11} /> Edit
                          </button>
                        )}
                        {author?.handle === currentUser?.handle && !solvedCommentId && (
                          <button
                            className="btn green-text"
                            style={{ fontSize: 12 }}
                            onClick={async () => {
                              if (item._supabase && supabaseService) {
                                try {
                                  await supabaseService.setSolvedComment(item.id, c.id);
                                  setSolvedCommentId(c.id);
                                } catch {}
                              }
                            }}
                          >
                            <Icon name="check" size={11} /> Accept as answer
                          </button>
                        )}
                        {author?.handle === currentUser?.handle && solvedCommentId === c.id && (
                          <button
                            style={{ fontSize: 12 }}
                            onClick={async () => {
                              if (item._supabase && supabaseService) {
                                try {
                                  await supabaseService.setSolvedComment(item.id, null);
                                  setSolvedCommentId(null);
                                } catch {}
                              }
                            }}
                          >
                            <Icon name="x" size={11} /> Unmark
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="fc-composer">
            <Avatar user={currentUser} size={28} />
            <input
              className="fc-input"
              placeholder="Write a comment…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitComment();
              }}
            />
            <button className="btn primary sm" disabled={!draft.trim()} onClick={submitComment}>
              <Icon name="send" size={11} />
            </button>
          </div>
        </div>
      )}

      {showVersions && versions.length > 0 && (
        <div
          className="feed-versions"
          style={{
            marginTop: 12,
            padding: 12,
            background: '#f9f9f9',
            borderRadius: 8,
            border: '1px solid #e0e0e0',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 14 }}>
              Edit history ({versions.length} version{versions.length > 1 ? 's' : ''})
            </span>
            <button className="btn ghost xs" onClick={() => setShowVersions(false)}>
              <Icon name="x" size={11} /> Close
            </button>
          </div>
          {versions.map((v, i) => (
            <div
              key={v.id}
              className="version-row"
              style={{
                padding: '6px 0',
                borderBottom: i < versions.length - 1 ? '1px solid #e0e0e0' : 'none',
              }}
            >
              <div style={{ fontSize: 12, color: '#666' }}>
                v{v.version} · {new Date(v.created_at).toLocaleString()} · by{' '}
                {v.edited_by?.slice(0, 8)}
              </div>
              <div style={{ fontSize: 13, marginTop: 2 }}>
                <span style={{ color: '#888' }}>Title: </span>
                {v.title}
              </div>
              <div style={{ fontSize: 13, color: '#444', maxHeight: 60, overflow: 'hidden' }}>
                {v.body?.slice(0, 200)}
                {v.body?.length > 200 ? '…' : ''}
              </div>
            </div>
          ))}
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

  React.useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Refresh feed when new post is published
  React.useEffect(() => {
    const handler = () => loadPosts();
    window.addEventListener('compass_feed_refresh', handler);
    return () => window.removeEventListener('compass_feed_refresh', handler);
  }, [loadPosts]);

  React.useEffect(() => {
    if (!currentUser?.id) return;
    supabaseService
      .getUserReactions(currentUser.id)
      .then((reactions) => {
        setUserReactions(reactions || []);
      })
      .catch(() => {});

    supabaseService
      .getFollowing(currentUser.id)
      .then((follows) => {
        setFollowingUsers(follows.map((f) => f.following_id));
      })
      .catch(() => {});
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
    { id: 'all', label: 'All Feed', icon: 'sparkles' },
    { id: 'following', label: 'Following', icon: 'users' },
    { id: 'alpha', label: 'Alpha Highlights', icon: 'flame' },
    { id: 'trending', label: 'Trending', icon: 'flame' },
  ];

  // Dynamic filter
  let list = [...feedItems];
  if (filter === 'alpha') {
    list = feedItems.filter((it) => it.cat === 'alpha');
  } else if (filter === 'following') {
    list = feedItems.filter((it) => followingUsers.includes(it.author_id));
  }

  // Dynamic sort
  if (sort === 'hot') {
    list.sort((a, b) => b.like_count - a.like_count || b.comment_count - a.comment_count);
  }

  // Trending: top posts by engagement across all categories
  if (filter === 'trending') {
    list = [...feedItems].sort((a, b) => {
      const aEng = (a.like_count || 0) + (a.comment_count || 0) * 3 + (a.repost_count || 0) * 5;
      const bEng = (b.like_count || 0) + (b.comment_count || 0) * 3 + (b.repost_count || 0) * 5;
      return bEng - aEng;
    });
  }

  return (
    <div className="view feed-view">
      <div className="feed-layout">
        <div className="feed-col">
          <header className="feed-page-head">
            <div>
              <div className="section-eyebrow">
                <span className="section-eyebrow-dot" /> Your feed
              </div>
            </div>
            <button className="btn primary" onClick={onCompose}>
              <Icon name="plus" size={13} /> Post
            </button>
          </header>

          <div className="feed-filters">
            {filters.map((f) => (
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

          <InlineFeedComposer onCompose={onCompose} currentUser={currentUser} />

          {/* Quick composer */}
          <div className="feed-composer feed-composer-legacy" onClick={onCompose}>
            <Avatar user={currentUser} size={36} />
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
                { id: 'validated', label: 'Validated Alpha' },
              ].map((opt) => (
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
              <div className="empty">
                Nothing here yet — change the filter or start the conversation.
              </div>
            ) : (
              list.map((item) => (
                <FeedCard key={item.id} item={item} navigate={navigate} currentUser={currentUser} />
              ))
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
                {
                  label: 'Validated alpha',
                  value: FEED_ITEMS.filter((i) => i.validated).length,
                  icon: 'check',
                },
                {
                  label: 'Open replies',
                  value: FEED_ITEMS.reduce((n, i) => n + i.reactions.comments, 0),
                  icon: 'chat',
                },
                { label: 'Saved items', value: readSaved().length, icon: 'wallet' },
              ].map((card) => (
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
              {TRENDING_TAGS.map((t) => (
                <li
                  key={t.tag}
                  className="rail-tag"
                  onClick={() => navigate({ view: 'tag', tag: t.tag })}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="rt-h">#</span>
                  {t.tag}
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
              {(window.SUGGESTED_USERS || []).slice(0, 4).map((u) => {
                const isFollowingThisUser = followingUsers.includes(u.id);
                return (
                  <li key={u.id} className="rail-user">
                    <div
                      onClick={() => navigate({ view: 'profile', handle: u.handle })}
                      style={{
                        display: 'flex',
                        gap: 10,
                        flex: 1,
                        cursor: 'pointer',
                        alignItems: 'center',
                      }}
                    >
                      <Avatar user={u} size={32} />
                      <div className="ru-body">
                        <div className="ru-name">{u.name}</div>
                        <div className="ru-handle">@{u.handle}</div>
                      </div>
                    </div>
                    <button
                      className={`btn ${isFollowingThisUser ? 'ghost' : 'solid'} sm`}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.supabaseService) {
                          try {
                            const becomingFollowing = !isFollowingThisUser;
                            await supabaseService.toggleFollow(u.id);
                            if (becomingFollowing) {
                              supabaseService.createNotification(
                                u.id,
                                'follow',
                                'followed you',
                                currentUser?.handle,
                              );
                            }
                            setFollowingUsers((prev) =>
                              isFollowingThisUser
                                ? prev.filter((id) => id !== u.id)
                                : [...prev, u.id],
                            );
                          } catch {}
                        }
                      }}
                    >
                      {isFollowingThisUser ? 'Following' : 'Follow'}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rail-card subtle">
            <div className="rail-note-title">Curated by Compass</div>
            <p className="rail-note-body">
              Your feed mixes high-signal posts from News, Alpha and Activities — re-ranked every 15
              minutes by validation, freshness, and your KP-weighted interests.
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

const SearchPage = ({ navigate, currentUser }) => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [searched, setSearched] = React.useState(false);
  const search = async (q) => {
    if (!q.trim()) return;
    setSearched(true);
    try {
      const data = await supabaseService.searchPosts(q.trim());
      setResults(data || []);
    } catch {
      setResults([]);
    }
  };
  return (
    <div className="view">
      <section className="lb-hero">
        <div className="section-eyebrow">
          <span className="section-eyebrow-dot" /> Search
        </div>
        <h1 className="section-title" style={{ fontSize: 'clamp(32px,4vw,48px)' }}>
          Search the Compass.
        </h1>
        <p className="section-sub">Find posts, alpha calls, and discussions across the network.</p>
      </section>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <input
          className="field-input"
          style={{ flex: 1 }}
          placeholder="Search posts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') search(query);
          }}
        />
        <button className="btn primary" disabled={!query.trim()} onClick={() => search(query)}>
          <Icon name="search" size={13} /> Search
        </button>
      </div>
      {searched && (
        <div style={{ marginTop: 24 }}>
          {results.length === 0 ? (
            <div className="empty">No results for "{query}"</div>
          ) : (
            <div className="feed-stream">
              {results.map((item) => (
                <FeedCard key={item.id} item={item} navigate={navigate} currentUser={currentUser} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { FeedView, FeedCard, SearchPage, FEED_ITEMS });
