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
| Endpoint | Purpose |
|---|---|
| `GET    /api/conversations` | List conversations |
| `GET    /api/conversations/:id` | Get messages in conversation |
| `POST   /api/conversations/:id/messages` | Send message |

## Spaces (Audio Rooms)
| Endpoint | Purpose |
|---|---|
| `GET    /api/spaces` | List spaces |
| `GET    /api/spaces/:id` | Get space |
| `POST   /api/spaces` | Create space |
| `PUT    /api/spaces/:id` | Update space (title, cohosts, status) |
| `DELETE /api/spaces/:id` | Delete / end space |
| `POST   /api/spaces/:id/listeners` | Join (bump listener count) |
| `POST   /api/spaces/:id/reminders` | Toggle reminder |

## Talent Marketplace
| Endpoint | Purpose |
|---|---|
| `GET    /api/talent` | List gigs |
| `GET    /api/talent/:id` | Get gig detail |
| `POST   /api/talent` | Create gig |
| `GET    /api/talent/reviews` | Get reviews |
| `GET    /api/talent/skills` | List skill categories |

## Conferences / Classes
| Endpoint | Purpose |
|---|---|
| `GET    /api/conferences` | List classes |
| `POST   /api/conferences` | Schedule a class |
| `POST   /api/conferences/:id/register` | Register for class |
| `POST   /api/conferences/:id/unregister` | Unregister from class |
| `PUT    /api/conferences/:id/start` | Start a class (set status to live) |
| `PUT    /api/conferences/:id/end` | End a class (set status to ended) |
| `POST   /api/conferences/:id/stage` | Add user to stage |
| `DELETE /api/conferences/:id/stage/:handle` | Remove user from stage |
| `POST   /api/conferences/:id/chat` | Add chat message |
| `PUT    /api/conferences/:id/board` | Save whiteboard strokes |

## Attendance & KP Rewards
| Endpoint | Purpose |
|---|---|
| `POST /api/attendance/:classId` | Mark user as attended (awards KP) |
| `GET  /api/users/:handle/attendance` | Get user's attended class IDs |
| `GET  /api/users/:handle/kp-log` | Get KP breakdown log |

## Replay Access
| Endpoint | Purpose |
|---|---|
| `GET /api/conferences/:id/replay` | Get replay URL (checks attendance or purchase)
| `POST /api/conferences/:id/purchase` | Purchase replay access for non-attendees |

## Members Directory
| Endpoint | Purpose |
|---|---|
| `GET /api/members` | List members (region, sector filters) |
| `GET /api/members/:handle` | Get member card detail |

## Wallet
| Endpoint | Purpose |
|---|---|
| `GET /api/wallet` | Get wallet balance & KP |
| `GET /api/wallet/transactions` | Get transaction history |

## Saved / Bookmarks
| Endpoint | Purpose |
|---|---|
| `GET    /api/saved` | Get saved items |
| `POST   /api/saved` | Save an item |
| `DELETE /api/saved/:type/:id` | Remove saved item |

## Editorial Content
| Endpoint | Purpose |
|---|---|
| `GET    /api/content` | List editorial content |
| `POST   /api/content` | Create content |
| `PUT    /api/content/:id` | Update content |

## Quests
| Endpoint | Purpose |
|---|---|
| `GET /api/quests` | List daily quests |
| `PUT /api/quests/:id/complete` | Mark quest complete |

## Leaderboard
| Endpoint | Purpose |
|---|---|
| `GET /api/leaderboard` | Get leaderboard (time filter: week/month/all) |

## Search
| Endpoint | Purpose |
|---|---|
| `GET /api/search?q=` | Global search (members, topics, talent, classes, tags) |

## Tags
| Endpoint | Purpose |
|---|---|
| `GET /api/tags` | List tags |
| `GET /api/tags/:id/topics` | Topics for a tag |

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
