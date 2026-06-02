# Backend API Backlog

All client data is currently in-memory (empty arrays), hardcoded, or localStorage.  
Below is every backend endpoint needed to make the app functional.

## Auth
| Endpoint | Purpose |
|---|---|
| `POST /api/auth/signup` | Create account |
| `POST /api/auth/signin` | Sign in |
| `POST /api/auth/signout` | Sign out |
| `GET  /api/auth/me` | Get current user session |

## Users
| Endpoint | Purpose |
|---|---|
| `GET    /api/users` | List / search users |
| `GET    /api/users/:handle` | Get user profile |
| `PUT    /api/users/:handle` | Update profile |
| `PUT    /api/users/:handle/follow` | Follow / unfollow |
| `GET    /api/users/:handle/followers` | Get followers |
| `GET    /api/users/:handle/following` | Get following list |

## Categories & Topics
| Endpoint | Purpose |
|---|---|
| `GET       /api/categories` | List categories |
| `GET       /api/categories/:id` | Get category detail |
| `GET       /api/topics` | List topics (filters, sort, pagination) |
| `GET       /api/topics/:id` | Get topic detail |
| `POST      /api/topics` | Create topic |
| `PUT       /api/topics/:id` | Update topic |
| `GET       /api/topics/:id/replies` | Get replies |
| `POST      /api/topics/:id/replies` | Create reply |

## Feed
| Endpoint | Purpose |
|---|---|
| `GET /api/feed` | Get feed items (filters, sort, pagination) |

## Notifications
| Endpoint | Purpose |
|---|---|
| `GET /api/notifications` | List notifications |
| `PUT /api/notifications/read` | Mark all as read |

## Messages
| Endpoint | Purpose | Status |
|---|---|---|
| `GET /api/conversations` | List conversations | Supabase REST wired |
| `GET /api/conversations/:id` | Get messages in conversation | Supabase REST wired |
| `POST /api/conversations/:id/messages` | Send message | Supabase REST wired |
| `WS /realtime/conversations/:id` | Real-time message push | Client-side `subscribeRealtime` added; not yet wired in UI |

## Spaces (Audio Rooms)
| Endpoint | Purpose | Status |
|---|---|---|
| `GET /api/spaces` | List spaces | Supabase REST wired |
| `GET /api/spaces/:id` | Get space | Supabase REST wired |
| `POST /api/spaces` | Create space | Supabase REST wired |
| `PUT /api/spaces/:id` | Update space | Supabase REST wired |
| `DELETE /api/spaces/:id` | Delete / end space | Supabase REST wired |
| `POST /api/spaces/:id/listeners` | Join (bump listener count) | Supabase REST wired |
| `POST /api/spaces/:id/reminders` | Toggle reminder | Supabase REST wired |

## Conferences / Classes
| Endpoint | Purpose | Status |
|---|---|---|
| `GET /api/conferences` | List classes | Supabase REST wired |
| `POST /api/conferences` | Schedule a class | Supabase REST wired |
| `GET /api/conferences/:id` | Get class detail | Supabase REST wired |
| `POST /api/conferences/:id/register` | Register for class | Supabase REST wired |
| `POST /api/conferences/:id/unregister` | Unregister from class | Supabase REST wired |
| `PUT /api/conferences/:id/start` | Start a class (set status to live) | Supabase REST wired |
| `PUT /api/conferences/:id/end` | End a class (set status to ended) | Supabase REST wired |
| `POST /api/conferences/:id/stage` | Add user to stage | Supabase REST wired |
| `DELETE /api/conferences/:id/stage/:handle` | Remove user from stage | Supabase REST wired |
| `POST /api/conferences/:id/chat` | Add chat message | Supabase REST wired |
| `PUT /api/conferences/:id/board` | Save whiteboard strokes | Supabase REST wired |
| `GET /api/conferences/:id/replay` | Get replay URL | Supabase REST wired |
| `POST /api/conferences/:id/purchase` | Purchase replay | Supabase REST wired |

## Notifications
| Endpoint | Purpose | Status |
|---|---|---|
| `GET /api/notifications` | List notifications | LocalStorage only |
| `PUT /api/notifications/read` | Mark all as read | LocalStorage only |

## Saved / Bookmarks
| Endpoint | Purpose | Status |
|---|---|---|
| `GET /api/saved` | Get saved items | Not started |
| `POST /api/saved` | Save an item | Not started |
| `DELETE /api/saved/:type/:id` | Remove saved item | Not started |

## Attendance & KP Rewards
| Endpoint | Purpose | Status |
|---|---|---|
| `POST /api/attendance/:classId` | Mark user as attended (awards KP) | LocalStorage only |
| `GET /api/users/:handle/attendance` | Get user's attended class IDs | LocalStorage only |
| `GET /api/users/:handle/kp-log` | Get KP breakdown log | LocalStorage only |

## Wallet
| Endpoint | Purpose | Status |
|---|---|---|
| `GET /api/wallet` | Get wallet balance & KP | LocalStorage only |
| `GET /api/wallet/transactions` | Get transaction history | Not started |

## Editorial Content
| Endpoint | Purpose | Status |
|---|---|---|
| `GET /api/content` | List editorial content | Not listed in schema yet |
| `POST /api/content` | Create content | Not started |
| `PUT /api/content/:id` | Update content | Not started |

## Quests
| Endpoint | Purpose | Status |
|---|---|---|
| `GET /api/quests` | List daily quests | LocalStorage only |
| `PUT /api/quests/:id/complete` | Mark quest complete | LocalStorage only |

## Leaderboard
| Endpoint | Purpose | Status |
|---|---|---|
| `GET /api/leaderboard` | Get leaderboard (time filter: week/month/all) | Not started |

## Search
| Endpoint | Purpose | Status |
|---|---|---|
| `GET /api/search?q=` | Global search (members, topics, talent, classes, tags) | Not started |

## Tags
| Endpoint | Purpose | Status |
|---|---|---|
| `GET /api/tags` | List tags | LocalStorage |
| `GET /api/tags/:id/topics` | Topics for a tag | LocalStorage |

---

## localStorage Keys to Replace

| Key | Replaced By |
|---|---|
| `compass_session_v1` | `GET /api/auth/me` |
| `compass_spaces_v1` | `GET/POST/PUT/DELETE /api/spaces/*` |
| `compass_saved_v1` | `GET/POST/DELETE /api/saved/*` |
| `compass_following_v1` | `PUT /api/users/:handle/follow` |
| `compass_subscriptions_v1` | `PUT /api/users/:handle/subscriptions` |
| `compass_space_reminders_v1` | `POST /api/spaces/:id/reminders` |
| `compass_feed_draft_v1` | Auto-save in backend or discard |
| `compass_attendance_v1` | `POST /api/attendance/:classId`, `GET /api/users/:handle/attendance` |
| `compass_kp_v1` | `GET /api/users/:handle/kp-log` |

## Hardcoded Data to Backend

| Data | Backend Source |
|---|---|
| `CATEGORIES` | `GET /api/categories` |
| `USERS` (single testuser) | `POST /api/auth/signup/auth` |
| `LEVEL_NAMES`, `LEVEL_THRESHOLDS` | Config, can stay client-side |
| `CATEGORY_ACCESS` (level gates) | `GET /api/categories` |
| `WALLET` (hardcoded zeros) | `GET /api/wallet` |
| `PRO_PLANS`, `PRO_PERKS` | Config, can stay client-side |
| `ONLINE_MEMBERS` | WebSocket presence or `GET /api/users?online=true` |
| `BOUNTIES` | `GET /api/topics?category=earn` |
| `SAMPLE_COMMENTS` | `GET /api/topics/:id/replies` |
| `FEED_ITEMS` | `GET /api/feed` |
| Synthetic listeners (alice,bob,charlie) | Remove — real listeners join via API |
