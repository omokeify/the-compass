// Mock data for The Compass community

const CATEGORIES = [
  {
    id: 'news',
    code: '01',
    name: 'News Highlights',
    slug: 'news-highlights',
    desc: 'Curated Web3 updates, ecosystem movements, and high-signal alpha.',
    hue: 215, // blue
    icon: 'news',
    posts: 1284,
    moderators: ['compass.eth', 'signal_op'],
  },
  {
    id: 'alpha',
    code: '02',
    name: 'Alpha Corner',
    slug: 'alpha-corner',
    desc: 'Early-stage, high-potential opportunities. Validated by contributors.',
    hue: 50, // amber
    icon: 'alpha',
    posts: 743,
    moderators: ['degenscout', '0xforesight'],
    premium: true,
  },
  {
    id: 'earn',
    code: '03',
    name: 'Earning Opportunities',
    slug: 'earning',
    desc: 'Bounties, jobs, airdrops, quests. Make money in Web3.',
    hue: 145, // green
    icon: 'earn',
    posts: 2105,
  },
  {
    id: 'skills',
    code: '04',
    name: 'Skill Marketplace',
    slug: 'skills',
    desc: 'Talent infrastructure connecting builders to Web3 projects.',
    hue: 290, // purple
    icon: 'skills',
    posts: 612,
  },
  {
    id: 'activities',
    code: '05',
    name: 'Activities',
    slug: 'activities',
    desc: 'Blog ecosystem, ecosystems of the month, Voice of Impact.',
    hue: 340, // pink/magenta
    icon: 'activities',
    posts: 487,
  },
  {
    id: 'training',
    code: '06',
    name: 'Training Program',
    slug: 'training',
    desc: 'Live training & paid recorded courses. Learn-to-earn ready.',
    hue: 195, // cyan
    icon: 'training',
    posts: 358,
  },
  {
    id: 'events',
    code: '07',
    name: 'Events',
    slug: 'events',
    desc: 'Discover and promote Web3 events across Africa.',
    hue: 18, // coral
    icon: 'events',
    posts: 421,
  },
  {
    id: 'partnership',
    code: '08',
    name: 'Sponsorship & Partnership',
    slug: 'partnership',
    desc: 'B2B Web3 growth — brands × Compass community.',
    hue: 85, // gold-green
    icon: 'partnership',
    posts: 156,
  },
];

const USERS = [
  { handle: 'kelechi.eth', name: 'Kelechi Okeke', tier: 'Captain', kp: 12480, joined: '2024-03-12', bio: 'Building African Web3 infra. Compass mod.', loc: 'Lagos, NG', avatar: 'K', hue: 25 },
  { handle: 'degenscout', name: 'Amara', tier: 'Navigator', kp: 9320, joined: '2024-05-02', bio: 'Alpha hunter. On-chain since 2020.', loc: 'Nairobi, KE', avatar: 'A', hue: 50 },
  { handle: '0xforesight', name: '0xForesight', tier: 'Navigator', kp: 8104, joined: '2024-06-18', bio: 'Validating alphas. Ex-Solana DevRel.', loc: 'Cape Town, ZA', avatar: '0', hue: 145 },
  { handle: 'tinuke.builds', name: 'Tinuke A.', tier: 'Scout', kp: 6210, joined: '2024-08-04', bio: 'Frontend dev. Looking for grants.', loc: 'Lagos, NG', avatar: 'T', hue: 290 },
  { handle: 'mosi_dao', name: 'Mosi', tier: 'Scout', kp: 4920, joined: '2024-09-21', bio: 'DAO governance, retroPGF, public goods.', loc: 'Kigali, RW', avatar: 'M', hue: 215 },
  { handle: 'signal_op', name: 'Signal', tier: 'Captain', kp: 14210, joined: '2023-11-08', bio: 'News curator. 8 yrs in trading.', loc: 'Abuja, NG', avatar: 'S', hue: 195 },
  { handle: 'ayo.web3', name: 'Ayodele', tier: 'Cadet', kp: 1820, joined: '2025-02-14', bio: 'Learning solidity. First airdrop hunter.', loc: 'Accra, GH', avatar: 'A', hue: 340 },
  { handle: 'compass.eth', name: 'Compass Team', tier: 'Official', kp: 99999, joined: '2023-09-01', bio: 'Official account of The Compass.', loc: 'Everywhere', avatar: 'C', hue: 65 },
  { handle: 'nana_btc', name: 'Nana Kofi', tier: 'Scout', kp: 3550, joined: '2024-12-10', bio: 'BTC maxi w/ ETH allergies. Sometimes.', loc: 'Accra, GH', avatar: 'N', hue: 18 },
  { handle: 'fatima.lens', name: 'Fatima', tier: 'Navigator', kp: 7008, joined: '2024-04-30', bio: 'Content × culture × community.', loc: 'Casablanca, MA', avatar: 'F', hue: 85 },
  { handle: 'kweku.sol', name: 'Kweku', tier: 'Cadet', kp: 920, joined: '2025-04-02', bio: 'Solana validator side quest.', loc: 'Tema, GH', avatar: 'K', hue: 110 },
  { handle: 'iyabo_nft', name: 'Iyabo', tier: 'Scout', kp: 2840, joined: '2025-01-19', bio: 'Visual artist, on-chain since 2022.', loc: 'Ibadan, NG', avatar: 'I', hue: 305 },
];

const userByHandle = (h) => USERS.find(u => u.handle === h) || USERS[0];

const TAGS = [
  'airdrops', 'solana', 'base', 'monad', 'bounty', 'rwa', 'defi', 'restaking',
  'depin', 'zk', 'optimism', 'starknet', 'memecoins', 'governance', 'farcaster',
  'lens', 'african-web3', 'beginner', 'remote-job', 'grant', 'hackathon', 'audit',
];

const TOPICS = [
  {
    id: 't1',
    title: 'Monad mainnet airdrop checker is live — eligibility window closes Friday',
    cat: 'alpha',
    tags: ['airdrops', 'monad'],
    author: 'degenscout',
    created: '2026-05-25T08:14:00Z',
    lastActivity: '12m',
    replies: 84,
    views: 4210,
    likes: 312,
    pinned: true,
    hot: true,
    validated: true,
    participants: ['degenscout', '0xforesight', 'kelechi.eth', 'compass.eth', 'mosi_dao', 'fatima.lens'],
    body: `Just dropped — the Monad eligibility checker is live at checker dot monad. Cut-off is 23:59 UTC Friday. Three signal patterns I've validated against 40+ wallets:\n\n• Bridge volume ≥ $250 across 2+ epochs\n• Min 12 unique contracts interacted\n• Hold a Monad testnet OAT (the gold one, not the participation one)\n\nIf you missed testnet there's still a path via the ecosystem partners. Don't sleep.`,
    replyThread: [
      { author: '0xforesight', when: '2h', body: 'Cross-checked against my 6 wallets. The OAT signal is real — wallets without it got tier 3 max. Adding to the alpha index.', likes: 48, validated: true },
      { author: 'kelechi.eth', when: '1h', body: 'Pinning this. Heads up everyone: do NOT trust checker links from anywhere except the URL above. Two phishing copies already.', likes: 122, mod: true },
      { author: 'ayo.web3', when: '38m', body: 'First time qualifying for anything 🧭 thank you for the breakdown.', likes: 14 },
      { author: 'mosi_dao', when: '24m', body: 'How is the partner path working out for folks? Worth the gas to chase tier 1 or just take tier 3?', likes: 6 },
      { author: 'degenscout', when: '12m', body: '@mosi_dao depends on your wallet — if you already have 8+ contracts you can hit tier 2 with ~$80 in fees. Math\'s in the doc I linked.', likes: 22 },
    ],
  },
  {
    id: 't2',
    title: 'Senior Solidity engineer wanted — African remote, $90–140k, 2 retainer slots',
    cat: 'earn',
    tags: ['remote-job', 'solana', 'african-web3'],
    author: 'compass.eth',
    created: '2026-05-25T07:00:00Z',
    lastActivity: '24m',
    replies: 41,
    views: 2680,
    likes: 188,
    participants: ['compass.eth', 'tinuke.builds', 'kweku.sol', 'kelechi.eth'],
    bountySize: '$140,000',
    body: `Direct from a Compass partner (Series A, on-chain rep system). Two retainer seats. Solidity + light Rust for cross-chain bits. Async, weekly sync on Thursdays.\n\nApply via the Skill Marketplace — applications routed through the form for the standard 7% facilitation.`,
  },
  {
    id: 't3',
    title: 'Voice of Impact — May winners + how to nominate for June',
    cat: 'activities',
    tags: ['governance', 'african-web3'],
    author: 'fatima.lens',
    created: '2026-05-24T16:30:00Z',
    lastActivity: '1h',
    replies: 27,
    views: 1840,
    likes: 96,
    participants: ['fatima.lens', 'compass.eth', 'iyabo_nft'],
    body: `Three contributors this month for going absurdly above and beyond in the community...`,
  },
  {
    id: 't4',
    title: '[News] Base announces 50M ecosystem fund — accepting builders from Africa & SEA',
    cat: 'news',
    tags: ['base', 'grant'],
    author: 'signal_op',
    created: '2026-05-25T05:42:00Z',
    lastActivity: '3h',
    replies: 56,
    views: 3120,
    likes: 201,
    hot: true,
    participants: ['signal_op', 'compass.eth', 'tinuke.builds', 'mosi_dao'],
    body: 'Direct from Base — 50M ecosystem fund opens applications June 1. Geographic mandate: Africa, SEA, LATAM. Compass will host an AMA with the Base BD team next Tuesday.',
  },
  {
    id: 't5',
    title: 'Lagos Web3 Week — June 12–15 — submit side events by Wednesday',
    cat: 'events',
    tags: ['african-web3', 'hackathon'],
    author: 'kelechi.eth',
    created: '2026-05-24T11:10:00Z',
    lastActivity: '5h',
    replies: 38,
    views: 2210,
    likes: 142,
    participants: ['kelechi.eth', 'compass.eth', 'nana_btc'],
    body: 'Side event submission window closes Wednesday. Hosts get 3 featured slots + cross-promo across Compass channels.',
  },
  {
    id: 't6',
    title: 'New course: ZK Fundamentals — 6 weeks, on-chain certificate, $89',
    cat: 'training',
    tags: ['zk', 'beginner'],
    author: 'compass.eth',
    created: '2026-05-23T09:00:00Z',
    lastActivity: '7h',
    replies: 19,
    views: 1480,
    likes: 88,
    participants: ['compass.eth', 'kweku.sol', 'tinuke.builds'],
    body: 'Live cohort starts June 3. Free Telegram syllabus first; paid recordings + certificate on completion. Early bird 30% for the first 50.',
  },
  {
    id: 't7',
    title: 'Auditor available — 4 years, Spearbit + Code4rena top 50, $4k/week',
    cat: 'skills',
    tags: ['audit', 'remote-job'],
    author: 'tinuke.builds',
    created: '2026-05-24T19:20:00Z',
    lastActivity: '6h',
    replies: 23,
    views: 1320,
    likes: 71,
    participants: ['tinuke.builds', 'kelechi.eth', '0xforesight'],
    body: 'Wrapping up a Q3 engagement late June. Looking for one anchor client + spot reviews.',
  },
  {
    id: 't8',
    title: 'Brand partnership: Polygon × Compass — 6-month creator program brief',
    cat: 'partnership',
    tags: ['grant'],
    author: 'compass.eth',
    created: '2026-05-23T14:00:00Z',
    lastActivity: '9h',
    replies: 14,
    views: 980,
    likes: 62,
    participants: ['compass.eth', 'fatima.lens'],
    body: 'Polygon × Compass — 6 month creator program. 30 selected creators, monthly $400 retainer, content templates, distribution. Applications opening June 5.',
  },
  {
    id: 't9',
    title: 'Daily check-in 🧭 — Sunday May 25',
    cat: 'news',
    tags: [],
    author: 'compass.eth',
    created: '2026-05-25T06:00:00Z',
    lastActivity: '18m',
    replies: 142,
    views: 1810,
    likes: 49,
    participants: ['compass.eth', 'ayo.web3', 'nana_btc', 'iyabo_nft', 'mosi_dao'],
    body: 'GM 🧭 — what are you watching today? Drop your one chart, one read, one ship.',
  },
  {
    id: 't10',
    title: 'Bounty: write a 1500-word breakdown of Hyperliquid mechanics — $300',
    cat: 'earn',
    tags: ['bounty', 'defi'],
    author: 'signal_op',
    created: '2026-05-24T20:45:00Z',
    lastActivity: '11h',
    replies: 9,
    views: 620,
    likes: 33,
    participants: ['signal_op', 'fatima.lens'],
    body: '1500 words, our editorial guidelines apply. Top submission gets the bounty + featured publication.',
  },
  {
    id: 't11',
    title: 'Alpha: undisclosed L2 testnet — quest set drops Tuesday (tier-gated)',
    cat: 'alpha',
    tags: ['airdrops'],
    author: '0xforesight',
    created: '2026-05-25T04:00:00Z',
    lastActivity: '4h',
    replies: 67,
    views: 2810,
    likes: 224,
    locked: 'Navigator',
    participants: ['0xforesight', 'degenscout', 'kelechi.eth'],
    body: '[Locked — Navigator tier and above. Validated alpha drops here first.]',
  },
  {
    id: 't12',
    title: 'Workshop recap: Account abstraction in production (Tuesday)',
    cat: 'training',
    tags: ['beginner'],
    author: 'kweku.sol',
    created: '2026-05-22T15:00:00Z',
    lastActivity: '1d',
    replies: 11,
    views: 540,
    likes: 28,
    participants: ['kweku.sol', 'tinuke.builds'],
    body: 'Slides + recording inside. Live attendance was 312 — biggest workshop yet.',
  },
];

const TRENDING_TAGS = [
  { tag: 'airdrops', count: 142 },
  { tag: 'monad', count: 98 },
  { tag: 'base', count: 71 },
  { tag: 'african-web3', count: 64 },
  { tag: 'bounty', count: 52 },
  { tag: 'remote-job', count: 41 },
];

const EVENTS_UPCOMING = [
  { title: 'Lagos Web3 Week', date: 'Jun 12–15', loc: 'Lagos, NG', kind: 'IRL' },
  { title: 'AMA: Base ecosystem fund', date: 'Tue 7pm WAT', loc: 'Discord stage', kind: 'Live' },
  { title: 'ZK Fundamentals cohort', date: 'Jun 3', loc: 'Online', kind: 'Course' },
];

// Online members — long, varied avatar strip (just letter + hue)
const ONLINE_MEMBERS = [
  { avatar: 'K', hue: 25 },   { avatar: 'A', hue: 50 },   { avatar: '0', hue: 145 },
  { avatar: 'T', hue: 290 },  { avatar: 'M', hue: 215 },  { avatar: 'S', hue: 195 },
  { avatar: 'F', hue: 85 },   { avatar: 'N', hue: 18 },   { avatar: 'I', hue: 305 },
  { avatar: 'K', hue: 110 },  { avatar: 'C', hue: 65 },   { avatar: 'A', hue: 340 },
  { avatar: 'R', hue: 240 },  { avatar: 'L', hue: 165 },  { avatar: 'B', hue: 35 },
  { avatar: 'D', hue: 125 },  { avatar: 'Z', hue: 280 },  { avatar: 'H', hue: 5 },
  { avatar: 'O', hue: 75 },   { avatar: 'P', hue: 200 },  { avatar: 'Y', hue: 330 },
  { avatar: 'W', hue: 155 },  { avatar: 'E', hue: 95 },   { avatar: 'J', hue: 250 },
];

// ===== Notifications =====
const NOTIFICATIONS = [
  { id: 'n1', kind: 'mention',  who: 'degenscout',   when: '12m', text: 'mentioned you in', target: 'Monad mainnet airdrop checker is live', unread: true },
  { id: 'n2', kind: 'like',     who: '0xforesight',  when: '38m', text: 'liked your reply on', target: 'Lagos Web3 Week side events', unread: true },
  { id: 'n3', kind: 'follow',   who: 'tinuke.builds', when: '1h', text: 'started following you', unread: true },
  { id: 'n4', kind: 'validated', who: 'compass.eth', when: '2h', text: 'validated your alpha post', target: 'Three Solana memecoins on the watchlist' },
  { id: 'n5', kind: 'reply',    who: 'mosi_dao',     when: '3h', text: 'replied to', target: 'On-chain rep systems — panel' },
  { id: 'n6', kind: 'bounty',   who: 'compass.eth',  when: '5h', text: 'opened a $300 bounty in your area', target: 'Hyperliquid mechanics breakdown' },
  { id: 'n7', kind: 'message',  who: 'fatima.lens',  when: '8h', text: 'sent you a message', target: 'Hey Kelechi — about the Voice of Impact slot…' },
  { id: 'n8', kind: 'kp',       who: null,           when: '1d', text: 'You earned', target: '+120 KP — moderator activity', unread: false },
  { id: 'n9', kind: 'follow',   who: 'iyabo_nft',    when: '1d', text: 'started following you' },
  { id: 'n10', kind: 'event',   who: null,           when: '2d', text: 'Reminder', target: 'Lagos Web3 Week is in 16 days' },
];

// ===== Conversations (DMs) =====
const CONVERSATIONS = [
  {
    id: 'dm1', with: 'fatima.lens', unread: 2, lastWhen: '4m',
    last: 'Hey — about the Voice of Impact slot for June, can we sync?',
    messages: [
      { from: 'fatima.lens', when: 'Yesterday 6:42 PM', body: 'Hey Kelechi — was hoping to chat about the Voice of Impact panel for June.' },
      { from: 'fatima.lens', when: 'Yesterday 6:43 PM', body: 'I think you would be a great anchor for the African Web3 segment.' },
      { from: 'kelechi.eth', when: 'Yesterday 9:15 PM', body: 'Love that — what is the time commitment?' },
      { from: 'fatima.lens', when: 'Today 11:02 AM', body: 'One 45-min prep call + 90 mins live. Two segments solo, one as moderator.' },
      { from: 'fatima.lens', when: 'Today 11:04 AM', body: 'I can send you the brief if you want to take a look.' },
      { from: 'kelechi.eth', when: 'Today 11:30 AM', body: 'Yes please. I am in.' },
      { from: 'fatima.lens', when: 'just now', body: 'Sending now 🧭' },
    ],
  },
  {
    id: 'dm2', with: 'degenscout', unread: 0, lastWhen: '1h',
    last: 'Cool — added you to the alpha index Telegram.',
    messages: [
      { from: 'kelechi.eth', when: '2h', body: 'Saw your Monad post — solid breakdown.' },
      { from: 'degenscout', when: '1h', body: 'Cool — added you to the alpha index Telegram.' },
    ],
  },
  {
    id: 'dm3', with: '0xforesight', unread: 0, lastWhen: '5h',
    last: 'I will validate before Tuesday and post the addendum.',
    messages: [
      { from: '0xforesight', when: 'Yesterday', body: 'Sending the L2 alpha later today — Navigator gated as usual.' },
      { from: '0xforesight', when: '5h', body: 'I will validate before Tuesday and post the addendum.' },
    ],
  },
  {
    id: 'dm4', with: 'tinuke.builds', unread: 1, lastWhen: '6h',
    last: 'Quick question about the auditor listing — open?',
    messages: [
      { from: 'tinuke.builds', when: '6h', body: 'Quick question about the auditor listing — open?' },
    ],
  },
  {
    id: 'dm5', with: 'compass.eth', unread: 0, lastWhen: '1d',
    last: 'Congrats on the Captain promo — well earned.',
    messages: [
      { from: 'compass.eth', when: '1d', body: 'Congrats on the Captain promo — well earned.' },
    ],
  },
  {
    id: 'dm6', with: 'mosi_dao', unread: 0, lastWhen: '2d',
    last: 'Are you running the retroPGF panel?',
    messages: [
      { from: 'mosi_dao', when: '2d', body: 'Are you running the retroPGF panel?' },
    ],
  },
];

// ===== Talent Marketplace =====
const TALENT = [
  {
    id: 't-aud-1', kind: 'gig',
    title: 'I will audit your Solidity contract in 5 days',
    skill: 'Smart Contract Audit',
    author: 'tinuke.builds',
    rating: 5.0, reviews: 87, delivery: '5 days', price: 1800,
    tags: ['solidity', 'audit', 'foundry'],
    bgHue: 290,
    featured: true,
  },
  {
    id: 't-eng-1', kind: 'gig',
    title: 'Senior Solidity engineer for retainer or sprint',
    skill: 'Solidity Engineering',
    author: '0xforesight',
    rating: 4.9, reviews: 64, delivery: 'Negotiable', price: 4000,
    tags: ['solidity', 'rust', 'security'],
    bgHue: 145,
  },
  {
    id: 't-des-1', kind: 'gig',
    title: 'Brand identity + design system for Web3 startups',
    skill: 'Design',
    author: 'iyabo_nft',
    rating: 4.9, reviews: 42, delivery: '10 days', price: 2400,
    tags: ['brand', 'figma', 'design-system'],
    bgHue: 340,
  },
  {
    id: 't-cnt-1', kind: 'gig',
    title: 'Long-form Web3 content & ghost-writing',
    skill: 'Content',
    author: 'fatima.lens',
    rating: 5.0, reviews: 28, delivery: '7 days', price: 950,
    tags: ['writing', 'editorial', 'lens'],
    bgHue: 85,
  },
  {
    id: 't-dev-1', kind: 'gig',
    title: 'Production-grade frontend for your dapp',
    skill: 'Frontend Engineering',
    author: 'kweku.sol',
    rating: 4.8, reviews: 35, delivery: '12 days', price: 2200,
    tags: ['next.js', 'wagmi', 'tailwind'],
    bgHue: 110,
  },
  {
    id: 't-gov-1', kind: 'gig',
    title: 'DAO governance setup — from scratch to launch',
    skill: 'Governance',
    author: 'mosi_dao',
    rating: 4.9, reviews: 19, delivery: '21 days', price: 3200,
    tags: ['governance', 'snapshot', 'retroPGF'],
    bgHue: 215,
  },
  {
    id: 't-vid-1', kind: 'gig',
    title: 'Cinematic 60-sec product video, on-chain ready',
    skill: 'Video',
    author: 'ayo.web3',
    rating: 4.7, reviews: 12, delivery: '14 days', price: 1400,
    tags: ['video', 'motion', 'after-effects'],
    bgHue: 18,
  },
  {
    id: 't-mkt-1', kind: 'gig',
    title: 'Launch a token-aware growth engine in 2 weeks',
    skill: 'Marketing',
    author: 'nana_btc',
    rating: 4.6, reviews: 21, delivery: '14 days', price: 1900,
    tags: ['growth', 'campaigns', 'farcaster'],
    bgHue: 5,
  },
  {
    id: 't-rsh-1', kind: 'gig',
    title: 'Deep ecosystem research reports (10-30 pages)',
    skill: 'Research',
    author: 'signal_op',
    rating: 5.0, reviews: 16, delivery: '10 days', price: 2700,
    tags: ['research', 'data', 'analysis'],
    bgHue: 195,
  },
];

const TALENT_SKILLS = [
  'All', 'Smart Contract Audit', 'Solidity Engineering', 'Frontend Engineering',
  'Design', 'Content', 'Marketing', 'Governance', 'Video', 'Research',
];

// (Notifications/Conversations/Talent are declared above this; CONTENT_ITEMS below.
// All globals are exported in a single Object.assign at the bottom of this file.)

// Content / editorial pieces — dark cards like Arc's "Partner Spotlight" tiles
const CONTENT_ITEMS = [
  {
    id: 'c1',
    kind: 'Partner Spotlight',
    title: 'Stablecoins are the rails — here is what African builders are shipping on them.',
    subtitle: 'A deep look at the stablecoin infrastructure layer and the builders actively shipping on top of it across emerging markets.',
    author: 'compass.eth',
    when: 'May 24',
    minutes: 6,
    bg: 'navy',
  },
  {
    id: 'c2',
    kind: 'Compass House',
    title: 'Builder feedback survey — what does the next quarter of Compass need to be?',
    author: 'fatima.lens',
    when: 'May 22',
    minutes: 3,
    bg: 'royal',
  },
  {
    id: 'c3',
    kind: 'Research',
    title: 'Scaling institutional DeFi: how three African desks are routing $40M / month.',
    author: 'signal_op',
    when: 'May 20',
    minutes: 11,
    bg: 'midnight',
  },
  {
    id: 'c4',
    kind: 'Voice of Impact',
    title: 'Three contributors who changed someone\'s on-chain trajectory this month.',
    author: 'fatima.lens',
    when: 'May 18',
    minutes: 4,
    bg: 'plum',
  },
  {
    id: 'c5',
    kind: 'Field Note',
    title: 'Nairobi → Lagos: ground report from two weeks of builder meetups.',
    author: 'degenscout',
    when: 'May 16',
    minutes: 7,
    bg: 'forest',
  },
  {
    id: 'c6',
    kind: 'Tutorial',
    title: 'Account abstraction in production — the AA primer that should\'ve existed in 2024.',
    author: 'kweku.sol',
    when: 'May 14',
    minutes: 14,
    bg: 'navy',
  },
];

// ===== Members directory (separate from USERS — includes more people + extras) =====
// Each entry has: name, handle, role, company, loc, region, sectors, online, photo, isMe
const REGIONS = [
  { id: 'na',     label: 'North America' },
  { id: 'latam',  label: 'Latin America (LATAM)' },
  { id: 'eu',     label: 'Europe' },
  { id: 'mea',    label: 'Middle East or Africa' },
  { id: 'apac',   label: 'Asia–Pacific, Australia, New Zealand (APAC)' },
];

const SECTORS = [
  'DeFi', 'Borrowing and Lending', 'RWA', 'Privacy', 'Agentic Commerce',
  'Stablecoins', 'NFTs', 'Infrastructure', 'Gaming', 'Identity',
];

const MEMBERS = [
  { handle: 'kelechi.eth',  name: 'Kelechi Okeke',  role: 'Captain @ Compass',          loc: 'Lagos, Nigeria',      region: 'mea',  sectors: ['DeFi','Infrastructure','Stablecoins'], online: true,  avatar: 'K', hue: 25, isMe: true },
  { handle: 'oxwuy',        name: 'Ox Wuy',         role: 'Blockchain Builder, Onchain Contributor @ Independent Builder, Web3 Contributor', loc: 'Hanoi, Vietnam', region: 'apac', sectors: ['Infrastructure','Privacy'], online: true,  avatar: 'O', hue: 110 },
  { handle: 'lina_3_1',     name: '3.1 3.1',        role: '3.1 @ 3.1',                  loc: 'Chur, Switzerland',   region: 'eu',   sectors: ['DeFi'], online: true,  avatar: '3', hue: 200 },
  { handle: 'gina_3_2',     name: '3.2 3.2',        role: '3.2 @ 3.2',                  loc: 'Cassino, Italy',      region: 'eu',   sectors: ['Stablecoins'], online: true,  avatar: '3', hue: 340 },
  { handle: 'ravi_3_3',     name: '3.3 3.3',        role: '3.3 @ 3.3',                  loc: 'Durgauti, India',     region: 'apac', sectors: ['Infrastructure'], online: true,  avatar: '3', hue: 50 },
  { handle: 'ihsan_3_4',    name: '3.4 3.4',        role: '3.4 @ 3.4',                  loc: 'Istanbul, Turkey',    region: 'mea',  sectors: ['Identity'], online: true,  avatar: '3', hue: 18 },
  { handle: 'bemba_3_5',    name: '3.5 3.5',        role: '3.5 @ 3.5',                  loc: 'Ewo, Congo (Brazzaville)', region: 'mea', sectors: ['DeFi','RWA'], online: true,  avatar: '3', hue: 145 },
  { handle: 'aini_lu',      name: 'AINI lu',        role: 'Manager @ Hengyi Petrochemical Co., Ltd.', loc: 'Yichang Shequ, China', region: 'apac', sectors: ['RWA'], online: true,  avatar: 'A', hue: 290 },
  { handle: 'alvin_moi',    name: 'ALVIN Moi',      role: 'software developer @ moicw', loc: 'Kuala Lumpur, Malaysia', region: 'apac', sectors: ['Infrastructure','Gaming'], online: true,  avatar: 'A', hue: 250 },
  { handle: 'arra_ganesh',  name: 'ARRA GANESH',    role: 'Insurance Agent @ policybazaar.com', loc: 'Indi, India',  region: 'apac', sectors: ['RWA','Stablecoins'], online: true,  avatar: 'A', hue: 195, photo: true },
  { handle: 'aaron_m',      name: 'Aaron Mendoza',  role: 'QA @ Lazada Philippines',    loc: 'Quezon City, Philippines', region: 'apac', sectors: ['Infrastructure'], online: true,  avatar: 'A', hue: 215, photo: true },
  { handle: 'adult_photo',  name: 'Adult Photo',    role: 'Data Scientist @ panictreedinosaur', loc: 'Ōsaka, Japan', region: 'apac', sectors: ['Agentic Commerce','NFTs'], online: true,  avatar: 'A', hue: 305, photo: true },
  { handle: 'rivka_solo',   name: 'Rivka Solomon',  role: 'Founder @ Mesh Labs',        loc: 'Tel Aviv, Israel',    region: 'mea',  sectors: ['DeFi','Privacy'], online: true,  avatar: 'R', hue: 165 },
  { handle: 'sofia_ar',     name: 'Sofia Arana',    role: 'BD @ Mantle',                loc: 'Mexico City, Mexico', region: 'latam', sectors: ['DeFi','NFTs'], online: false, avatar: 'S', hue: 18, photo: true },
  { handle: 'jonas_klein',  name: 'Jonas Klein',    role: 'Protocol Eng @ Mythos',      loc: 'Berlin, Germany',     region: 'eu',   sectors: ['Gaming','NFTs'], online: true,  avatar: 'J', hue: 240 },
  { handle: 'amelie_rost',  name: 'Amélie Rost',    role: 'Design Lead @ Ledger',       loc: 'Paris, France',       region: 'eu',   sectors: ['Identity'], online: true,  avatar: 'A', hue: 340, photo: true },
  { handle: 'amaka_obi',    name: 'Amaka Obi',      role: 'Auditor @ Nethermind',       loc: 'Abuja, Nigeria',      region: 'mea',  sectors: ['DeFi','Borrowing and Lending','Privacy'], online: true,  avatar: 'A', hue: 35 },
  { handle: 'priya_nat',    name: 'Priya Nataraj',  role: 'PM @ Polygon',               loc: 'Bangalore, India',    region: 'apac', sectors: ['Stablecoins','RWA'], online: true,  avatar: 'P', hue: 290 },
  { handle: 'andre_l',      name: 'André L.',       role: 'Researcher @ Anchorage',     loc: 'Lisbon, Portugal',    region: 'eu',   sectors: ['RWA','Stablecoins'], online: false, avatar: 'A', hue: 125 },
  { handle: 'sade_o',       name: 'Sade Olaniyan',  role: 'Founder @ Trove',            loc: 'Accra, Ghana',        region: 'mea',  sectors: ['Stablecoins','Agentic Commerce'], online: true,  avatar: 'S', hue: 5, photo: true },
  { handle: 'mateo_ruz',    name: 'Mateo Ruz',      role: 'DevRel @ Lens',              loc: 'Buenos Aires, Argentina', region: 'latam', sectors: ['NFTs','Identity'], online: true,  avatar: 'M', hue: 75 },
  { handle: 'naledi_z',     name: 'Naledi Zulu',    role: 'GM @ Africa Web3 Council',   loc: 'Johannesburg, South Africa', region: 'mea', sectors: ['DeFi','Infrastructure'], online: true,  avatar: 'N', hue: 145 },
  { handle: 'lucas_par',    name: 'Lucas Parra',    role: 'CTO @ Quipu',                loc: 'Bogotá, Colombia',    region: 'latam', sectors: ['Infrastructure','Privacy'], online: false, avatar: 'L', hue: 215 },
  { handle: 'ines_de_v',    name: 'Inés de Vega',   role: 'Product @ Worldcoin',        loc: 'Madrid, Spain',       region: 'eu',   sectors: ['Identity'], online: true,  avatar: 'I', hue: 305, photo: true },
  { handle: 'jin_park',     name: 'Jin Park',       role: 'Eng @ Story Protocol',       loc: 'Seoul, South Korea',  region: 'apac', sectors: ['NFTs','Gaming'], online: false, avatar: 'J', hue: 195 },
  { handle: 'omar_b',       name: 'Omar Boutaba',   role: 'Founder @ Stax',             loc: 'Casablanca, Morocco', region: 'mea',  sectors: ['Stablecoins','DeFi'], online: true,  avatar: 'O', hue: 50 },
  { handle: 'mae_chen',     name: 'Mae Chen',       role: 'PM @ Polymarket',            loc: 'Singapore',           region: 'apac', sectors: ['DeFi','Agentic Commerce'], online: true,  avatar: 'M', hue: 165, photo: true },
  { handle: 'kofi_a',       name: 'Kofi Asante',    role: 'Solidity Eng @ Status',      loc: 'Tema, Ghana',         region: 'mea',  sectors: ['Privacy','Infrastructure'], online: true,  avatar: 'K', hue: 280 },
  { handle: 'sara_mes',     name: 'Sara Messina',   role: 'Auditor @ Trail of Bits',    loc: 'Rome, Italy',         region: 'eu',   sectors: ['DeFi','Privacy'], online: false, avatar: 'S', hue: 100 },
  { handle: 'rafael_t',     name: 'Rafael Torres',  role: 'GM @ Mercado Bitcoin',       loc: 'São Paulo, Brazil',   region: 'latam', sectors: ['Stablecoins','DeFi'], online: true,  avatar: 'R', hue: 25 },
];

// ===== Conferences / Classes (admin + moderator hosted) =====
const CAN_HOST_TIERS = ['Official', 'Captain'];

const CONFERENCES = [
  {
    id: 'cf1',
    title: 'ZK Fundamentals — Lesson 3: Circuits & Constraints',
    desc: 'We build a real circuit from scratch, reason about constraint systems, and wire it into a verifier. Bring a laptop — this is hands-on.',
    host: 'compass.eth',
    cohosts: ['kweku.sol'],
    cat: 'training',
    status: 'live',
    when: 'Live now',
    durationMin: 90,
    capacity: 200,
    registered: 142,
    attending: 88,
    recorded: true,
    cover: 195,
    lessonOf: 'ZK Fundamentals cohort',
  },
  {
    id: 'cf2',
    title: 'Smart-contract security clinic: reading an audit report',
    desc: 'Live walkthrough of two real audit reports. How to triage severity, reproduce findings in Foundry, and brief your investors.',
    host: 'kelechi.eth',
    cohosts: ['tinuke.builds'],
    cat: 'skills',
    status: 'scheduled',
    when: 'Tomorrow · 6:00 PM WAT',
    startsInMin: 1320,
    durationMin: 60,
    capacity: 150,
    registered: 96,
    recorded: true,
    cover: 290,
  },
  {
    id: 'cf3',
    title: 'Stablecoin rails masterclass — building an African off-ramp',
    desc: 'From KYC to settlement. The architecture, the partners, the regulatory traps. With a live Q&A.',
    host: 'compass.eth',
    cohosts: ['fatima.lens'],
    cat: 'training',
    status: 'scheduled',
    when: 'Jun 3 · 5:00 PM WAT',
    startsInMin: 8640,
    durationMin: 75,
    capacity: 300,
    registered: 214,
    recorded: true,
    cover: 145,
  },
  {
    id: 'cf4',
    title: 'Account Abstraction in production (recording)',
    desc: 'The full recorded class on shipping AA wallets — paymasters, bundlers, and the gotchas nobody warns you about.',
    host: 'kweku.sol',
    cohosts: [],
    cat: 'training',
    status: 'ended',
    when: 'May 22',
    durationMin: 64,
    capacity: 200,
    registered: 312,
    attended: 287,
    recorded: true,
    replay: true,
    cover: 290,
  },
];

// ===== Quests / streak =====
const QUESTS = [
  { id: 'q1', label: 'GM check-in', desc: 'Post in the daily check-in thread', kp: 10, done: true, icon: 'compass' },
  { id: 'q2', label: 'Engage with alpha', desc: 'Comment on a post in Alpha Corner', kp: 15, done: true, icon: 'spark' },
  { id: 'q3', label: 'Help a builder', desc: 'Reply to a question in any category', kp: 20, done: false, icon: 'chat' },
  { id: 'q4', label: 'Attend a class', desc: 'Join any live class in Events', kp: 40, done: false, icon: 'cap' },
  { id: 'q5', label: 'Share a signal', desc: 'Post original content to the feed', kp: 25, done: false, icon: 'sparkles' },
];

// ===== Bounties board =====
const BOUNTIES = [
  { id: 'b1', title: 'Write a 1,500-word breakdown of Hyperliquid mechanics', org: 'Compass Editorial', orgHue: 65, reward: 300, token: 'USDC', tags: ['writing','defi'], deadline: '5 days left', applicants: 9, difficulty: 'Intermediate', status: 'open' },
  { id: 'b2', title: 'Audit a 400-line staking contract before mainnet', org: 'Mesh Labs', orgHue: 165, reward: 2500, token: 'USDC', tags: ['audit','solidity'], deadline: '8 days left', applicants: 4, difficulty: 'Expert', status: 'open', featured: true },
  { id: 'b3', title: 'Design a 6-screen mobile onboarding flow', org: 'Trove', orgHue: 5, reward: 1200, token: 'USDC', tags: ['design','figma'], deadline: '12 days left', applicants: 14, difficulty: 'Intermediate', status: 'open' },
  { id: 'b4', title: 'Build a Farcaster frame for our quest system', org: 'Quipu', orgHue: 215, reward: 800, token: 'USDC', tags: ['frontend','farcaster'], deadline: '3 days left', applicants: 7, difficulty: 'Intermediate', status: 'open' },
  { id: 'b5', title: 'Translate docs to French + Swahili', org: 'Africa Web3 Council', orgHue: 145, reward: 450, token: 'USDC', tags: ['translation'], deadline: '6 days left', applicants: 11, difficulty: 'Beginner', status: 'open' },
  { id: 'b6', title: 'Record a 10-min explainer on account abstraction', org: 'Compass Academy', orgHue: 195, reward: 600, token: 'USDC', tags: ['video','education'], deadline: 'Closed', applicants: 22, difficulty: 'Intermediate', status: 'awarded', winner: 'kweku.sol' },
];

// ===== Wallet / earnings =====
const WALLET = {
  balanceUSDC: 4280.50,
  kp: 12480,
  pendingEscrow: 1800,
  thisMonth: 1420,
  txns: [
    { id: 'w1', kind: 'in',  label: 'Bounty payout — Hyperliquid breakdown', sub: 'Compass Editorial', amount: 300, token: 'USDC', when: 'May 26', icon: 'wallet' },
    { id: 'w2', kind: 'in',  label: 'Gig delivery accepted — audit', sub: 'Mesh Labs', amount: 1800, token: 'USDC', when: 'May 24', icon: 'briefcase' },
    { id: 'w3', kind: 'kp',  label: 'KP reward — moderator activity', sub: '+120 KP', amount: 120, token: 'KP', when: 'May 24', icon: 'medal' },
    { id: 'w4', kind: 'out', label: 'Tipped @degenscout for Monad alpha', sub: 'Tip', amount: -25, token: 'USDC', when: 'May 23', icon: 'spark' },
    { id: 'w5', kind: 'in',  label: 'Course sale — Solidity for production', sub: '3 enrollments', amount: 267, token: 'USDC', when: 'May 22', icon: 'cap' },
    { id: 'w6', kind: 'kp',  label: 'KP reward — validated alpha', sub: '+80 KP', amount: 80, token: 'KP', when: 'May 21', icon: 'check' },
    { id: 'w7', kind: 'out', label: 'Withdrawal to wallet 0x7a…3f2', sub: 'Yellow Card off-ramp', amount: -500, token: 'USDC', when: 'May 20', icon: 'arrow-up' },
  ],
};

// ===== Compass Pro =====
const PRO_PLANS = [
  { id: 'monthly', label: 'Monthly', price: 19, per: '/mo', note: 'Billed monthly' },
  { id: 'yearly',  label: 'Yearly',  price: 14, per: '/mo', note: 'Billed $168/yr — save 26%', best: true },
];
const PRO_PERKS = [
  { icon: 'spark',   title: 'Navigator-tier alpha', desc: 'Unlock tier-gated Alpha Corner posts and validated drops first.' },
  { icon: 'wallet',  title: 'Reduced platform fees', desc: '3% talent + bounty fees instead of 7%. Pays for itself fast.' },
  { icon: 'cap',     title: 'All premium classes', desc: 'Every paid class and recorded cohort, included.' },
  { icon: 'mic',     title: 'Pro-only Spaces', desc: 'Private rooms with partners, founders and the Compass team.' },
  { icon: 'medal',   title: '2× KP multiplier', desc: 'Climb the leaderboard twice as fast on every action.' },
  { icon: 'sparkles', title: 'Pro badge', desc: 'A gold Pro mark on your profile and posts.' },
];

Object.assign(window, {
  CATEGORIES, USERS, userByHandle, TAGS, TOPICS, TRENDING_TAGS, EVENTS_UPCOMING,
  ONLINE_MEMBERS, CONTENT_ITEMS, NOTIFICATIONS, CONVERSATIONS, TALENT, TALENT_SKILLS,
  REGIONS, SECTORS, MEMBERS, CONFERENCES, CAN_HOST_TIERS,
  QUESTS, BOUNTIES, WALLET, PRO_PLANS, PRO_PERKS,
});
