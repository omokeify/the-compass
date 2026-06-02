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
    moderators: ['felix'],
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
    moderators: ['amara'],
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
   { handle: 'amara',   name: 'Amara Osei',      tier: 'Wayfinder', kp: 5200, joined: '2024-03-10', bio: 'Smart contract auditor with 6 years in DeFi security.', loc: 'Nairobi, KE', avatar: 'A', hue: 260 },
   { handle: 'felix',   name: 'Felix Nwosu',     tier: 'Trailblazer',   kp: 7800, joined: '2024-02-01', bio: 'Full-stack engineer building on Solana and EVM chains.', loc: 'Lagos, NG', avatar: 'F', hue: 150 },
   { handle: 'zara',    name: 'Zara Haile',      tier: 'Navigator',    kp: 3100, joined: '2024-05-20', bio: 'Motion designer helping Web3 projects tell better stories.', loc: 'Addis Ababa, ET', avatar: 'Z', hue: 340 },
];

const LEVEL_NAMES = ['Explorer', 'Scout', 'Pathfinder', 'Navigator', 'Wayfinder', 'Trailblazer', 'Vanguard', 'Compass Elite', 'Compass Legend'];
const LEVEL_THRESHOLDS = [0, 200, 600, 1500, 3500, 7000, 12000, 20000, 35000];

const getLevelFromKp = (kp = 0) => {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i += 1) {
    if (kp >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return Math.min(level, LEVEL_NAMES.length);
};

const getLevelName = (level) => {
  const idx = Math.max(1, Math.min(level, LEVEL_NAMES.length)) - 1;
  return LEVEL_NAMES[idx];
};

const getUserLevel = (user) => user ? getLevelFromKp(user.kp) : 1;

const parseLockLevel = (value) => {
  if (value == null) return 1;
  if (typeof value === 'number') return Math.max(1, Math.min(value, LEVEL_NAMES.length));
  const str = String(value).trim();
  const found = LEVEL_NAMES.findIndex(name => name.toLowerCase() === str.toLowerCase());
  if (found !== -1) return found + 1;
  const parsed = Number(str.replace(/[^0-9]/g, ''));
  return Number.isInteger(parsed) && parsed >= 1 ? Math.min(parsed, LEVEL_NAMES.length) : 1;
};

const CATEGORY_ACCESS = {
  news:        { view: 1, post: 9, reply: 1 },
  earn:        { view: 3, post: 9, reply: 1 },
  skills:      { view: 4, post: 9, reply: 2 },
  activities:  { view: 99, post: 99, reply: 99 },
  events:      { view: 1, post: 9, reply: 1 },
  training:    { view: 3, post: 9, reply: 1 },
  alpha:       { view: 5, post: 6, reply: 6 },
  partnership: { view: 1, post: 9, reply: 9 },
};

const getCategoryAccess = (catId) => CATEGORY_ACCESS[catId] || { view: 1, post: 9, reply: 9 };

const canViewCategory = (user, catId) => {
  const access = getCategoryAccess(catId);
  return getUserLevel(user) >= access.view;
};

const canPostCategory = (user, catId) => {
  const access = getCategoryAccess(catId);
  return getUserLevel(user) >= access.post;
};

const canReplyCategory = (user, catId) => {
  const access = getCategoryAccess(catId);
  return getUserLevel(user) >= access.reply;
};

const canViewTopic = (user, topic) => {
  const req = topic.locked ? parseLockLevel(topic.locked) : getCategoryAccess(topic.cat).view;
  return getUserLevel(user) >= req;
};

const canReplyTopic = (user, topic) => {
  const topicLevel = topic.locked ? parseLockLevel(topic.locked) : 1;
  const replyReq = Math.max(topicLevel, getCategoryAccess(topic.cat).reply);
  return getUserLevel(user) >= replyReq;
};

const requiredLevelLabel = (level) => {
  const lvl = parseLockLevel(level);
  return `${getLevelName(lvl)} · Level ${lvl}`;
};

const PROFILE_CACHE = {};

const userByHandle = (h) => {
  if (!h) return USERS[0];
  return PROFILE_CACHE[h] || USERS.find(u => u.handle === h) || { handle: h, name: h, avatar: h[0].toUpperCase(), hue: 215, tier: 'Explorer', kp: 0, bio: '', loc: '' };
};

const fetchUserByHandle = async (h) => {
  const sb = window.supabaseService?.getSession()?.access_token ? window.supabaseService : null;
  if (!sb) return userByHandle(h);
  try {
    const profile = await sb.getProfileByHandle(h);
    if (!profile) return userByHandle(h);
    const user = {
      id: profile.id,
      handle: profile.handle,
      name: profile.fullname || profile.handle,
      email: profile.email,
      avatar: profile.avatar || (profile.handle ? profile.handle[0].toUpperCase() : 'U'),
      banner: profile.banner || '',
      hue: profile.hue || 215,
      bio: profile.bio || '',
      loc: profile.loc || '',
      tier: profile.tier || 'Explorer',
      kp: profile.kp || 0,
      role: profile.role || null,
    };
    PROFILE_CACHE[h] = user;
    return user;
  } catch { return userByHandle(h); }
};

const TAGS = [];

const TOPICS = [];

const TRENDING_TAGS = [];
const SUGGESTED_USERS = [];

const EVENTS_UPCOMING = [];

// Online members — long, varied avatar strip (just letter + hue)
const ONLINE_MEMBERS = [];

// ===== Notifications =====
const NOTIFICATIONS = [];

// ===== Conversations (DMs) =====
const CONVERSATIONS = [];

const MESSAGES_KEY = 'compass_messages_v1';
const MESSAGES_BY_CONVO = {};

function loadMessages() {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (raw) Object.assign(MESSAGES_BY_CONVO, JSON.parse(raw));
  } catch {}
}
function persistMessages() {
  try { localStorage.setItem(MESSAGES_KEY, JSON.stringify(MESSAGES_BY_CONVO)); } catch {}
}
loadMessages();

function messagesFor(id) {
  if (!MESSAGES_BY_CONVO[id]) MESSAGES_BY_CONVO[id] = [];
  return MESSAGES_BY_CONVO[id];
}

const messageService = {
  _sb() { return window.supabaseService?.getSession()?.access_token ? window.supabaseService : null; },

  async listConversations() {
    const sb = this._sb();
    if (sb) {
      const rows = await sb.listConversations();
      return (rows || []).map(c => ({...c, participants: Array.isArray(c.participants) ? c.participants : (typeof c.participants === 'string' ? JSON.parse(c.participants) : [])}));
    }
    return CONVERSATIONS.map(c => ({...c}));
  },

  async getMessages(conversationId) {
    const sb = this._sb();
    if (sb) return sb.listMessages({ conversationId });
    return messagesFor(conversationId).map(m => ({...m}));
  },

  async getConversation(conversationId) {
    const sb = this._sb();
    if (sb) return sb.getConversation(conversationId);
    return CONVERSATIONS.find(c => c.id === conversationId) || null;
  },

  async sendMessage({ conversationId, body }) {
    const sb = this._sb();
    const text = (body || '').trim();
    if (!text) return null;
    if (sb) return sb.sendMessage({ conversationId, body: text });
    const msg = { id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), from: window.currentUser?.handle || 'me', body: text, when: 'just now' };
    const msgs = messagesFor(conversationId);
    msgs.push(msg);
    persistMessages();
    const convo = CONVERSATIONS.find(c => c.id === conversationId);
    if (convo) { convo.last = text; convo.lastWhen = 'just now'; }
    return msg;
  },

  async createConversation({ participantHandles }) {
    const sb = this._sb();
    const participants = Array.isArray(participantHandles) ? participantHandles : [];
    if (sb) return sb.createConversation({ participants });
    const id = 'convo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const convo = { id, participants, last: '', lastWhen: 'just now' };
    CONVERSATIONS.push(convo);
    return convo;
  },
};

// ===== Talent Marketplace =====
const TALENT_KEY_APPROVED = 'compass_approved_talents_v1';
const TALENT = [];
const TALENT_SKILLS = [ 'All', 'Auditing', 'Engineering', 'Design', 'Content', 'Development', 'Governance', 'Video', 'Marketing', 'Research' ];

const readApprovedTalents = () => {
  try { return JSON.parse(localStorage.getItem(TALENT_KEY_APPROVED) || '[]'); }
  catch { return []; }
};

const writeApprovedTalents = (list) => {
  try { localStorage.setItem(TALENT_KEY_APPROVED, JSON.stringify(list)); }
  catch {}
};

const talentTemplate = [
  {
    id: 't-aud-1', author: 'amara', skill: 'Auditing', role: 'Smart Contract Auditor',
    title: 'I will audit your Solidity and Rust smart contracts',
    bio: 'Thorough manual + tool-assisted audits for DeFi protocols. 6 years, 50+ protocols, zero post-audit exploits.',
    tags: ['Solidity', 'DeFi', 'Security'],
    rating: 4.9, reviews: 47, projects: 120, successRate: 98,
    price: 500, cardBg: '#f5f3ff', bgHue: 260,
    featured: true, topRated: true, approved: true,
    description: `I offer comprehensive smart contract audits for DeFi protocols, NFT marketplaces, and cross-chain bridges.\n\n• Manual code review by lead auditor\n• Automated slither/mythril/echidna analysis\n• Detailed findings report with severity ratings\n• One free re-audit after fixes`,
    packages: [
      { id: 'basic',    name: 'Basic',    priceMul: 0.6, desc: 'Quick assessment for small contracts (< 500 LOC).', features: ['Manual review', 'Automated analysis', 'Summary report', '1 re-audit round'], delivery: '3 days', revisions: '1 revision', popular: false },
      { id: 'standard', name: 'Standard', priceMul: 1.0, desc: 'Full audit for production contracts (< 3000 LOC).', features: ['Manual review', 'Automated analysis', 'Detailed report with severity', 'Remediation guidance', '2 re-audit rounds'], delivery: '7 days', revisions: '2 revisions', popular: true },
      { id: 'premium',  name: 'Premium',  priceMul: 1.8, desc: 'Deep-dive with fuzzing + formal verification.', features: ['Everything in Standard', 'Fuzzing with Echidna', 'Formal verification (Certora)', 'Priority support', 'Post-deploy monitoring 30d'], delivery: '14 days', revisions: '3 revisions', popular: false },
    ],
    reviewList: [
      { who: 'felix', when: '2 weeks ago', rating: 5, body: 'Amara caught a critical reentrancy bug our team missed. Saved us from a major incident. Highly recommend.' },
      { who: 'amara', when: '1 month ago', rating: 5, body: 'Thorough and fast. The report was well-structured with clear remediation steps.' },
    ],
  },
  {
    id: 't-eng-1', author: 'felix', skill: 'Engineering', role: 'Blockchain Engineer',
    title: 'I will build your dApp from idea to mainnet',
    bio: 'Full-stack blockchain developer. Solana, EVM, Rust, TypeScript, React. I ship production dApps fast.',
    tags: ['Rust', 'React', 'TypeScript'],
    rating: 4.8, reviews: 38, projects: 85, successRate: 96,
    price: 800, cardBg: '#ecfdf5', bgHue: 150,
    featured: true, topRated: false, approved: true,
    description: `Full-cycle dApp development — from architecture design to mainnet deployment and post-launch support.\n\n• Smart contract development (Solidity / Rust)\n• Frontend with React + wagmi / rainbow kit\n• Subgraph indexing with The Graph\n• Deployment scripts + CI/CD`,
    packages: [
      { id: 'basic',    name: 'Basic',    priceMul: 0.5, desc: 'MVP with one smart contract + basic frontend.', features: ['1 smart contract (ERC-20/721)', 'Simple React frontend', 'Local deploy', 'Brief docs'], delivery: '10 days', revisions: '2 revisions', popular: false },
      { id: 'standard', name: 'Standard', priceMul: 1.0, desc: 'Production dApp with full frontend + tests.', features: ['2-3 smart contracts', 'Production React UI', 'Unit + integration tests', 'Goerli testnet deploy', 'Deployment guide'], delivery: '21 days', revisions: '3 revisions', popular: true },
      { id: 'premium',  name: 'Premium',  priceMul: 1.7, desc: 'Full mainnet launch + subgraph + monitoring.', features: ['Everything in Standard', 'The Graph subgraph', 'Mainnet deploy', 'Post-launch monitoring 2w', 'Performance optimization'], delivery: '30 days', revisions: '4 revisions', popular: false },
    ],
    reviewList: [],
  },
  {
    id: 't-des-1', author: 'zara', skill: 'Design', role: 'Motion & Brand Designer',
    title: 'I will design your Web3 brand identity and motion assets',
    bio: 'Brand identity, motion design, and UI for crypto projects. From logos to full visual systems.',
    tags: ['UI/UX', 'Figma', 'Motion'],
    rating: 5.0, reviews: 22, projects: 45, successRate: 100,
    price: 350, cardBg: '#fdf2f8', bgHue: 340,
    featured: true, topRated: true, approved: true,
    description: `Complete brand design for Web3 projects — logos, colour systems, motion sequences, and product UI.\n\n• Brand strategy & moodboards\n• Logo + full identity system\n• Motion sequences (Lottie / MP4)\n• Figma UI kit for your dApp`,
    packages: [
      { id: 'basic',    name: 'Basic',    priceMul: 0.5, desc: 'Logo + colour palette + typography guide.', features: ['3 logo concepts', 'Colour palette', 'Typography guide', 'Source files'], delivery: '5 days', revisions: '2 revisions', popular: false },
      { id: 'standard', name: 'Standard', priceMul: 1.0, desc: 'Full identity: logo, brand guide, social kit, basic motion.', features: ['Everything in Basic', 'Full brand guide PDF', 'Social media kit', '1 animated Lottie asset'], delivery: '10 days', revisions: '3 revisions', popular: true },
      { id: 'premium',  name: 'Premium',  priceMul: 1.8, desc: 'Complete brand + UI kit + multi-scene motion pack.', features: ['Everything in Standard', 'Figma UI kit (20+ screens)', '5 animated Lottie assets', 'Brand video intro (15s)'], delivery: '21 days', revisions: '4 revisions', popular: false },
    ],
    reviewList: [],
  },
  {
    id: 't-cnt-1', author: 'felix', skill: 'Content', role: 'Web3 Content Strategist',
    title: 'I will write and distribute your Web3 content strategy',
    bio: 'Content that drives adoption. I write threads, articles, and newsletters for crypto projects.',
    tags: ['Web3', 'Content', 'Growth'],
    rating: 4.7, reviews: 31, projects: 62, successRate: 94,
    price: 200, cardBg: '#fefce8', bgHue: 50,
    featured: false, topRated: false, approved: true,
    description: `End-to-end content strategy for Web3 protocols, DAOs, and NFT projects.\n\n• Twitter thread writing (10+ threads/month)\n• Long-form articles for Mirror / Medium\n• Newsletter content and automation\n• SEO-optimised blog posts`,
    packages: [
      { id: 'basic',    name: 'Basic',    priceMul: 0.5, desc: '5 Twitter threads + 1 article per week.', features: ['5 threads/week', '1 article/week', 'Content calendar', 'Basic analytics'], delivery: '7 days', revisions: '2 revisions', popular: false },
      { id: 'standard', name: 'Standard', priceMul: 1.0, desc: '10 threads + 2 articles + newsletter setup.', features: ['10 threads/week', '2 articles/week', 'Newsletter setup', 'SEO optimisation', 'Growth tips'], delivery: '7 days', revisions: '3 revisions', popular: true },
      { id: 'premium',  name: 'Premium',  priceMul: 1.7, desc: 'Full content machine + distribution + PR.', features: ['Everything in Standard', 'PR outreach (5 outlets)', 'Social media management', 'Performance report', '24/7 Slack'], delivery: '7 days', revisions: '4 revisions', popular: false },
    ],
    reviewList: [],
  },
  {
    id: 't-gov-1', author: 'amara', skill: 'Governance', role: 'DAO Governance Lead',
    title: 'I will set up and run your DAO governance system',
    bio: 'Governance design, proposal drafting, and community voting infrastructure.',
    tags: ['Community', 'Discord', 'Farcaster'],
    rating: 4.6, reviews: 18, projects: 30, successRate: 92,
    price: 600, cardBg: '#eff6ff', bgHue: 215,
    featured: false, topRated: false, approved: true,
    description: `Full governance stack for DAOs — from constitution drafting to Snapshot setup and proposal management.\n\n• Governance framework design\n• Snapshot / Tally space setup\n• Proposal drafting and management\n• Community voting coordination`,
    packages: [
      { id: 'basic',    name: 'Basic',    priceMul: 0.5, desc: 'Governance framework + Snapshot setup.', features: ['Governance framework doc', 'Snapshot space setup', 'Voting strategy config', 'Setup guide'], delivery: '5 days', revisions: '1 revision', popular: false },
      { id: 'standard', name: 'Standard', priceMul: 1.0, desc: 'Full governance + proposal management + 1 month support.', features: ['Everything in Basic', 'Proposal templates', 'Community onboarding', '1 month proposal support'], delivery: '10 days', revisions: '2 revisions', popular: true },
    ],
    reviewList: [],
  },
  {
    id: 't-vid-1', author: 'zara', skill: 'Video', role: 'Web3 Video Producer',
    title: 'I will produce your project explainer and demo videos',
    bio: 'Product demos, explainer videos, and event recaps for Web3 projects. From script to final cut.',
    tags: ['Video', 'Motion', 'Farcaster'],
    rating: 4.9, reviews: 14, projects: 28, successRate: 97,
    price: 450, cardBg: '#fff7ed', bgHue: 25,
    featured: false, topRated: true, approved: true,
    description: `Professional video production for Web3: product demos, explainer animations, and conference recaps.\n\n• Scriptwriting and storyboarding\n• Voiceover recording\n• Motion graphics and animation\n• Colour grading and sound design`,
    packages: [
      { id: 'basic',    name: 'Basic',    priceMul: 0.5, desc: '60s explainer video with stock assets.', features: ['Scriptwriting', 'Stock assets', 'Voiceover', '1 revision round'], delivery: '7 days', revisions: '1 revision', popular: false },
      { id: 'standard', name: 'Standard', priceMul: 1.0, desc: '90s custom-animated explainer with original assets.', features: ['Everything in Basic', 'Custom animation', 'Original motion assets', 'Sound design', '2 revision rounds'], delivery: '14 days', revisions: '2 revisions', popular: true },
    ],
    reviewList: [],
  },
  {
    id: 't-mkt-1', author: 'zara', skill: 'Marketing', role: 'Web3 Growth Marketer',
    title: 'I will grow your Web3 project community and reach',
    bio: 'Growth marketing for crypto — community building, partnerships, and user acquisition.',
    tags: ['Growth', 'Campaigns', 'SEO'],
    rating: 4.5, reviews: 25, projects: 55, successRate: 88,
    price: 300, cardBg: '#fef2f2', bgHue: 0,
    featured: false, topRated: false, approved: true,
    description: `Data-driven growth marketing for Web3: community growth, influencer partnerships, and campaign execution.\n\n• Community growth strategy\n• Influencer and partnership outreach\n• Ad campaign management\n• Analytics and reporting`,
    packages: [
      { id: 'basic',    name: 'Basic',    priceMul: 0.5, desc: 'Growth audit + 30-day action plan.', features: ['Growth audit', '30-day action plan', 'Competitor analysis', '1 check-in call'], delivery: '5 days', revisions: '1 revision', popular: false },
      { id: 'standard', name: 'Standard', priceMul: 1.0, desc: 'Full growth campaign (30 days).', features: ['Campaign strategy', 'Influencer outreach (10)', 'Content calendar', 'Weekly reports', 'Ad campaign setup'], delivery: '30 days', revisions: '2 revisions', popular: true },
    ],
    reviewList: [],
  },
  {
    id: 't-rsh-1', author: 'felix', skill: 'Research', role: 'Crypto Research Analyst',
    title: 'I will research and write in-depth protocol reports',
    bio: 'Deep-dive research on DeFi protocols, L1/L2 ecosystems, and tokenomics.',
    tags: ['Research', 'Data', 'DeFi'],
    rating: 4.8, reviews: 33, projects: 70, successRate: 95,
    price: 400, cardBg: '#ecfeff', bgHue: 185,
    featured: true, topRated: false, approved: true,
    description: `Institutional-grade research reports for DeFi protocols, L1/L2 ecosystems, and tokenomics analysis.\n\n• Protocol deep-dive (tech, team, tokenomics)\n• Competitive landscape analysis\n• Risk assessment and scoring\n• Investment memo quality output`,
    packages: [
      { id: 'basic',    name: 'Basic',    priceMul: 0.5, desc: 'Protocol overview report (5-10 pages).', features: ['Executive summary', 'Tech overview', 'Tokenomics analysis', 'PDF delivery'], delivery: '7 days', revisions: '1 revision', popular: false },
      { id: 'standard', name: 'Standard', priceMul: 1.0, desc: 'Full research report (20-30 pages) with competitive analysis.', features: ['Everything in Basic', 'Competitive landscape', 'Risk assessment', 'Data visualisations', 'Raw data export'], delivery: '14 days', revisions: '2 revisions', popular: true },
    ],
    reviewList: [],
  },
];

const talentService = {
  _key: TALENT_KEY_APPROVED,

  _sb() { return window.supabaseService?.getSession()?.access_token ? window.supabaseService : null; },

  async init() {
    const sb = this._sb();
    if (sb) {
      const list = await sb.listTalents();
      TALENT.length = 0;
      TALENT.push(...(list || []).map(t => this._normTalent(t)));
      return [...TALENT];
    }
    try {
      const raw = localStorage.getItem(this._key);
      if (raw) {
        const parsed = JSON.parse(raw);
        TALENT.length = 0;
        TALENT.push(...parsed);
        return parsed;
      }
    } catch {}
    const seed = talentTemplate.map(g => ({ ...g, packages: g.packages.map(p => ({ ...p })) }));
    TALENT.length = 0;
    TALENT.push(...seed);
    this._persist();
    return seed;
  },

  _persist() {
    try { localStorage.setItem(this._key, JSON.stringify(TALENT)); } catch {}
  },

  _normTalent(raw) {
    if (!raw) return null;
    return {
      ...raw,
      cardBg: raw.card_bg || raw.cardBg,
      bgHue: raw.bg_hue ?? raw.bgHue,
      successRate: raw.success_rate ?? raw.successRate,
      topRated: raw.top_rated ?? raw.topRated,
      reviewList: raw.review_list || raw.reviewList || [],
    };
  },

  async list(currentUser) {
    const sb = this._sb();
    if (sb) return (sb.listTalents() || []).map(t => this._normTalent(t));
    let list = [...TALENT];
    if (!this._isAdmin(currentUser)) {
      list = list.filter(t => t.approved);
    }
    return list;
  },

  async get(id) {
    const sb = this._sb();
    if (sb) {
      const gig = TALENT.find(t => t.id === id);
      if (gig) return gig;
      return this._normTalent(await sb.getTalent?.(id) || null);
    }
    return TALENT.find(t => t.id === id) || null;
  },

  _isAdmin(u) { return u && (u.role === 'admin' || u.role === 'mod'); },
  _canCreate(u) {
    if (!u) return false;
    if (this._isAdmin(u)) return true;
    return readApprovedTalents().includes(u.handle);
  },
  _canUpdate(gig, u) { return u && (this._isAdmin(u) || u.handle === gig.author); },
  _canDelete(u) { return this._isAdmin(u); },

  async create(data, currentUser) {
    if (!this._canCreate(currentUser)) {
      const approved = readApprovedTalents();
      if (approved.includes(currentUser.handle)) throw new Error('Your talent account is approved. You can post gigs.');
      throw new Error('Only approved talents, admins, and moderators can list gigs.');
    }
    const sb = this._sb();
    if (sb) return sb.createTalent(data);
    if (!data.id) data.id = 't-' + Date.now().toString(36);
    if (!data.packages) data.packages = [];
    if (!data.reviewList) data.reviewList = [];
    data.approved = true;
    TALENT.push(data);
    this._persist();
    return data;
  },

  async update(id, changes, currentUser) {
    const sb = this._sb();
    if (sb) { return sb.updateTalent(id, changes); }
    const gig = TALENT.find(t => t.id === id);
    if (!gig) throw new Error('Gig not found.');
    if (!this._canUpdate(gig, currentUser)) throw new Error('Only the talent, admins, and moderators can edit this gig.');
    Object.assign(gig, changes);
    this._persist();
    return gig;
  },

  async delete(id, currentUser) {
    const sb = this._sb();
    if (sb) { await sb.deleteTalent(id); return true; }
    const idx = TALENT.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Gig not found.');
    if (!this._canDelete(currentUser)) throw new Error('Only admins and moderators can delete gigs.');
    TALENT.splice(idx, 1);
    this._persist();
    return true;
  },

  async setFeatured(id, on, currentUser) {
    if (!this._isAdmin(currentUser)) throw new Error('Only admins and moderators can set featured status.');
    const sb = this._sb();
    if (sb) { return sb.setTalentFeatured(id, on); }
    const gig = TALENT.find(t => t.id === id);
    if (!gig) throw new Error('Gig not found.');
    gig.featured = !!on;
    this._persist();
    return gig;
  },

  async approveTalent(handle, currentUser) {
    if (!this._isAdmin(currentUser)) throw new Error('Only admins and moderators can approve talents.');
    const approved = readApprovedTalents();
    if (!approved.includes(handle)) {
      approved.push(handle);
      writeApprovedTalents(approved);
    }
    return approved;
  },

  async revokeTalent(handle, currentUser) {
    if (!this._isAdmin(currentUser)) throw new Error('Only admins and moderators can revoke talent status.');
    const approved = readApprovedTalents().filter(h => h !== handle);
    writeApprovedTalents(approved);
    return approved;
  },

  async getApprovedTalents() {
    return readApprovedTalents();
  },

  async isTalentApproved(handle) {
    return readApprovedTalents().includes(handle);
  },
};

talentService.init();

// (Notifications/Conversations/Talent are declared above this; CONTENT_ITEMS below.
// All globals are exported in a single Object.assign at the bottom of this file.)

// Content / editorial pieces — dark cards like Arc's "Partner Spotlight" tiles
const CONTENT_ITEMS = [];

// ===== Members directory (separate from USERS — includes more people + extras) =====
// Each entry has: name, handle, role, company, loc, region, sectors, online, photo, isMe
const REGIONS = [];

const SECTORS = [];

const MEMBERS = [];

// ===== Conferences / Classes (admin + moderator hosted) =====
const CAN_HOST_TIERS = ['Compass Legend', 'Trailblazer'];
const CAN_CREATE_ROLES = ['admin', 'mod'];
const canCreateEvent = (user) => user && (CAN_CREATE_ROLES.includes(user.role) || CAN_HOST_TIERS.includes(user.tier));
const genConfId = () => 'cls_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

const CONFERENCES = [];

const conferenceService = {
  _key: 'compass_conferences_v1',

  _sb() { return window.supabaseService?.getSession()?.access_token ? window.supabaseService : null; },

  async init() {
    const sb = this._sb();
    if (sb) return sb.listConferences();
    try {
      const raw = localStorage.getItem(this._key);
      if (raw) {
        const parsed = JSON.parse(raw);
        CONFERENCES.length = 0;
        CONFERENCES.push(...parsed);
      }
    } catch {}
    return CONFERENCES;
  },

  _persist() {
    try { localStorage.setItem(this._key, JSON.stringify(CONFERENCES)); } catch {}
  },

  _normConference(raw) {
    if (!raw) return null;
    const c = { ...raw };
    const jsonbFields = ['cohosts', 'stage', 'registrants', 'attendees', 'chat', 'board_strokes'];
    for (const f of jsonbFields) {
      const target = f === 'board_strokes' ? 'boardStrokes' : f;
      if (typeof c[f] === 'string') {
        try { c[target] = JSON.parse(c[f]); } catch { c[target] = []; }
      } else if (!Array.isArray(c[target])) {
        c[target] = [];
      }
    }
    if (typeof c.description === 'string' && !c.desc) c.desc = c.description;
    if (typeof c.when_text === 'string' && !c.when) c.when = c.when_text;
    c.registered = Number(c.registered) || 0;
    c.attended = Number(c.attended) || 0;
    c.capacity = Number(c.capacity) || 150;
    c.durationMin = Number(c.duration_min) || 60;
    return c;
  },

  async list() {
    const sb = this._sb();
    if (sb) return (sb.listConferences() || []).map(c => this._normConference(c));
    return [...CONFERENCES];
  },

  async get(id) {
    const sb = this._sb();
    if (sb) return this._normConference(await sb.getConference(id));
    return CONFERENCES.find(c => c.id === id) || null;
  },

  async create(cls) {
    const sb = this._sb();
    if (sb) return this._normConference(await sb.createConference(cls));
    CONFERENCES.push(cls);
    this._persist();
    return cls;
  },

  async update(id, changes) {
    const sb = this._sb();
    if (sb) { await sb.updateConference(id, changes); return this._normConference(await sb.getConference(id)); }
    const idx = CONFERENCES.findIndex(c => c.id === id);
    if (idx === -1) return null;
    Object.assign(CONFERENCES[idx], changes);
    this._persist();
    return CONFERENCES[idx];
  },

  async delete(id) {
    const sb = this._sb();
    if (sb) return sb.deleteConference(id);
    const idx = CONFERENCES.findIndex(c => c.id === id);
    if (idx === -1) return false;
    CONFERENCES.splice(idx, 1);
    this._persist();
    return true;
  },

  async start(id) {
    return this.update(id, { status: 'live' });
  },

  async end(id) {
    const sb = this._sb();
    if (sb) return this.update(id, { status: 'ended' });
    return this.update(id, { status: 'ended', attended: CONFERENCES.find(c => c.id === id)?.registered || 0 });
  },

  async register(id, handle) {
    const sb = this._sb();
    if (sb) {
      const cls = await this.get(id);
      if (!cls) return null;
      const registrants = cls.registrants || [];
      if (!registrants.includes(handle)) {
        registrants.push(handle);
        await this.update(id, { registrants, registered: (cls.registered || 0) + 1 });
      }
      return this.get(id);
    }
    const cls = CONFERENCES.find(c => c.id === id);
    if (!cls) return null;
    if (!cls.registrants) cls.registrants = [];
    if (!cls.registrants.includes(handle)) {
      cls.registrants.push(handle);
      cls.registered = (cls.registered || 0) + 1;
    }
    this._persist();
    return cls;
  },

  async unregister(id, handle) {
    const sb = this._sb();
    if (sb) {
      const cls = await this.get(id);
      if (!cls) return null;
      const registrants = (cls.registrants || []).filter(h => h !== handle);
      await this.update(id, { registrants, registered: Math.max(0, (cls.registered || 0) - 1) });
      return this.get(id);
    }
    const cls = CONFERENCES.find(c => c.id === id);
    if (!cls) return null;
    if (cls.registrants) cls.registrants = cls.registrants.filter(h => h !== handle);
    cls.registered = Math.max(0, (cls.registered || 0) - 1);
    this._persist();
    return cls;
  },

  async addToStage(id, handle) {
    const sb = this._sb();
    if (sb) {
      const cls = await this.get(id);
      if (!cls) return null;
      const stage = [...(cls.stage || [])];
      if (!stage.includes(handle)) stage.push(handle);
      return this.update(id, { stage });
    }
    const cls = CONFERENCES.find(c => c.id === id);
    if (!cls) return null;
    if (!cls.stage) cls.stage = [];
    if (!cls.stage.includes(handle)) cls.stage.push(handle);
    this._persist();
    return cls;
  },

  async removeFromStage(id, handle) {
    const sb = this._sb();
    if (sb) {
      const cls = await this.get(id);
      if (!cls) return null;
      const stage = (cls.stage || []).filter(h => h !== handle);
      return this.update(id, { stage });
    }
    const cls = CONFERENCES.find(c => c.id === id);
    if (!cls) return null;
    if (cls.stage) cls.stage = cls.stage.filter(h => h !== handle);
    this._persist();
    return cls;
  },

  async addChat(id, msg) {
    const sb = this._sb();
    if (sb) {
      const cls = await this.get(id);
      if (!cls) return null;
      const chat = [...(cls.chat || []), msg];
      return this.update(id, { chat });
    }
    const cls = CONFERENCES.find(c => c.id === id);
    if (!cls) return null;
    if (!cls.chat) cls.chat = [];
    cls.chat.push(msg);
    this._persist();
    return cls;
  },

  async saveBoard(id, strokes) {
    const sb = this._sb();
    if (sb) return this.update(id, { boardStrokes: strokes });
    return this.update(id, { boardStrokes: strokes });
  },
};

conferenceService.init();

// ===== Attendance & KP rewards =====
const ATTENDANCE_KEY = 'compass_attendance_v1';
const KP_LOG_KEY = 'compass_kp_v1';
const KP_PER_CLASS = 50;

const _sb = () => window.supabaseService?.getSession()?.access_token ? window.supabaseService : null;

const readAttendance = () => {
  try { return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || {}; } catch { return {}; }
};

const hasAttended = async (handle, classId) => {
  const sb = _sb();
  if (sb) {
    const ids = await sb.getAttendedClasses();
    return ids.includes(classId);
  }
  const att = readAttendance();
  return att[handle] && att[handle].includes(classId);
};

const readKpLog = () => {
  try { return JSON.parse(localStorage.getItem(KP_LOG_KEY)) || {}; } catch { return {}; }
};

const awardAttendance = async (handle, classId, className) => {
  const sb = _sb();
  if (sb) {
    const result = await sb.recordAttendance(classId);
    return result.kp;
  }
  const att = readAttendance();
  if (!att[handle]) att[handle] = [];
  if (att[handle].includes(classId)) return 0;
  att[handle].push(classId);
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(att));

  const kpStore = readKpLog();
  if (!kpStore[handle]) kpStore[handle] = { total: 0, log: [] };
  kpStore[handle].total += KP_PER_CLASS;
  kpStore[handle].log.push({ classId, className, kp: KP_PER_CLASS, when: new Date().toISOString().slice(0, 10) });
  localStorage.setItem(KP_LOG_KEY, JSON.stringify(kpStore));

  const user = USERS.find(u => u.handle === handle);
  if (user) user.kp = (user.kp || 0) + KP_PER_CLASS;

  return KP_PER_CLASS;
};

const getKpSummary = async (handle) => {
  const sb = _sb();
  if (sb) return sb.getKpSummary();
  const kpStore = readKpLog();
  return kpStore[handle] || { total: 0, log: [] };
};

const getAttendedClasses = async (handle) => {
  const sb = _sb();
  if (sb) return sb.getAttendedClasses();
  const att = readAttendance();
  return att[handle] || [];
};

// ===== Quests / streak =====
const QUESTS_TEMPLATE = [
  { id: 'q_read',   icon: 'news',    label: 'Read 3 posts',        desc: 'Read three topics in any category',        kp: 10 },
  { id: 'q_reply',  icon: 'chat',    label: 'Reply to a topic',    desc: 'Contribute to a discussion thread',        kp: 5 },
  { id: 'q_profile',icon: 'users',   label: 'Visit your profile',  desc: 'Check your dashboard and KP summary',      kp: 3 },
  { id: 'q_space',  icon: 'mic',     label: 'React in a Space',    desc: 'Drop an emoji reaction in a live room',    kp: 5 },
  { id: 'q_quest',  icon: 'spark',   label: 'Complete all quests', desc: 'Finish every quest on this list',          kp: 15 },
];

const QUESTS_KEY = 'compass_quests_v1';
const QUESTS = [];

const questService = {
  _key: QUESTS_KEY,

  _sb() { return window.supabaseService?.getSession()?.access_token ? window.supabaseService : null; },

  async today() {
    const sb = this._sb();
    if (sb) {
      const dateStr = new Date().toISOString().slice(0, 10);
      const saved = await sb.getQuests(dateStr);
      if (saved?.length) {
        const list = QUESTS_TEMPLATE.map(t => {
          const found = saved.find(s => s.quest_id === t.id);
          return { ...t, done: found?.done || false };
        });
        QUESTS.length = 0;
        QUESTS.push(...list);
        return list;
      }
      const list = QUESTS_TEMPLATE.map(q => ({ ...q, done: false }));
      QUESTS.length = 0;
      QUESTS.push(...list);
      return list;
    }
    const today = new Date().toDateString();
    try {
      const raw = localStorage.getItem(this._key);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.date === today) {
          QUESTS.length = 0;
          QUESTS.push(...saved.list);
          return saved.list;
        }
      }
    } catch {}
    return this.reset();
  },

  async reset() {
    const sb = this._sb();
    if (sb) {
      const dateStr = new Date().toISOString().slice(0, 10);
      await sb.resetQuests(dateStr);
    }
    const list = QUESTS_TEMPLATE.map(q => ({ ...q, done: false }));
    QUESTS.length = 0;
    QUESTS.push(...list);
    try {
      localStorage.setItem(this._key, JSON.stringify({ date: new Date().toDateString(), list }));
    } catch {}
    return list;
  },

  async complete(id) {
    const q = QUESTS.find(x => x.id === id);
    if (!q || q.done) return false;
    q.done = true;

    if (id === 'q_quest') {
      const allDone = QUESTS.filter(x => x.id !== 'q_quest').every(x => x.done);
      if (!allDone) {
        q.done = false;
        return false;
      }
    }

    const sb = this._sb();
    if (sb) {
      const dateStr = new Date().toISOString().slice(0, 10);
      await sb.completeQuest(id, dateStr);
      await sb.awardKp(q.kp, 'quest', id, q.label);
    }

    if (window.currentUser && window.currentUser.handle) {
      const user = USERS.find(u => u.handle === window.currentUser.handle);
      if (user) user.kp = (user.kp || 0) + q.kp;
    }

    try {
      localStorage.setItem(this._key, JSON.stringify({ date: new Date().toDateString(), list: QUESTS }));
    } catch {}
    return true;
  },
};

questService.today();

// ===== Spaces — in-memory cache backed by async service =====
const SPACES = [];

const spaceService = {
  _key: 'compass_spaces_v1',

  _sb() { return window.supabaseService?.getSession()?.access_token ? window.supabaseService : null; },

  async init() {
    const sb = this._sb();
    if (sb) return await sb.listSpaces();
    try {
      const raw = localStorage.getItem(this._key);
      if (raw) {
        const parsed = JSON.parse(raw);
        SPACES.length = 0;
        SPACES.push(...parsed);
      }
    } catch {}
    return SPACES;
  },

  _persist() {
    try { localStorage.setItem(this._key, JSON.stringify(SPACES)); } catch {}
  },

  _normSpace(raw) {
    if (!raw) return null;
    const s = { ...raw };
    if (typeof s.cohosts === 'string') {
      try { s.cohosts = JSON.parse(s.cohosts); } catch { s.cohosts = []; }
    } else if (!Array.isArray(s.cohosts)) {
      s.cohosts = [];
    }
    if (typeof s.speakers === 'string') {
      try { s.speakers = JSON.parse(s.speakers); } catch { s.speakers = []; }
    } else if (!Array.isArray(s.speakers)) {
      s.speakers = [];
    }
    if (typeof s.description === 'string') s.topic = s.description;
    if (typeof s.when_text === 'string') s.scheduled = s.when_text;
    s.listeners = Number(s.listeners) || 0;
    s.reminders = Number(s.reminders) || 0;
    s.startedAt = s.started_at || s.started || null;
    if (s.started_at && s.ended_at) {
      const ms = new Date(s.ended_at) - new Date(s.started_at);
      const mins = Math.floor(ms / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      s.duration = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    } else {
      s.duration = s.duration || null;
    }
    return s;
  },

  async list() {
    const sb = this._sb();
    if (sb) return (await sb.listSpaces() || []).map(s => this._normSpace(s));
    return [...SPACES];
  },

  async get(id) {
    const sb = this._sb();
    if (sb) return this._normSpace(await sb.getSpace(id));
    return SPACES.find(s => s.id === id) || null;
  },

  async create(space) {
    const sb = this._sb();
    if (sb) return this._normSpace(await sb.createSpace(space));
    SPACES.push(space);
    this._persist();
    return space;
  },

  async update(id, changes) {
    const sb = this._sb();
    if (sb) { await sb.updateSpace(id, changes); return this._normSpace(await sb.getSpace(id)); }
    const idx = SPACES.findIndex(s => s.id === id);
    if (idx === -1) return null;
    Object.assign(SPACES[idx], changes);
    this._persist();
    return SPACES[idx];
  },

  async delete(id) {
    const sb = this._sb();
    if (sb) return sb.deleteSpace(id);
    const idx = SPACES.findIndex(s => s.id === id);
    if (idx === -1) return false;
    SPACES.splice(idx, 1);
    this._persist();
    return true;
  },

  async addCohost(id, handle) {
    const sb = this._sb();
    if (sb) {
      const space = await this.get(id);
      if (!space) return null;
      const cohosts = [...(space.cohosts || [])];
      if (!cohosts.includes(handle)) cohosts.push(handle);
      return this.update(id, { cohosts });
    }
    const space = SPACES.find(s => s.id === id);
    if (!space) return null;
    if (!space.cohosts) space.cohosts = [];
    if (!space.cohosts.includes(handle)) space.cohosts.push(handle);
    this._persist();
    return space;
  },

  async removeCohost(id, handle) {
    const sb = this._sb();
    if (sb) {
      const space = await this.get(id);
      if (!space) return null;
      const cohosts = (space.cohosts || []).filter(h => h !== handle);
      return this.update(id, { cohosts });
    }
    const space = SPACES.find(s => s.id === id);
    if (!space) return null;
    if (space.cohosts) space.cohosts = space.cohosts.filter(h => h !== handle);
    this._persist();
    return space;
  },

  async bumpListeners(id, by = 1) {
    const sb = this._sb();
    if (sb) {
      const space = await this.get(id);
      if (!space) return null;
      return this.update(id, { listeners: (space.listeners || 0) + by });
    }
    const space = SPACES.find(s => s.id === id);
    if (!space) return null;
    space.listeners = (space.listeners || 0) + by;
    this._persist();
    return space;
  },

  async toggleReminder(id, on, userHandle) {
    const handle = userHandle || '';
    const sb = this._sb();
    if (sb) {
      const space = await this.get(id);
      if (!space) return null;
      const set = new Set(space.reminder_handles || []);
      if (on) set.add(handle); else set.delete(handle);
      const result = await this.update(id, { reminder_handles: [...set], reminders: set.size });
      return result;
    }
    const space = SPACES.find(s => s.id === id);
    if (!space) return null;
    space.reminders = Math.max(0, (space.reminders || 0) + (on ? 1 : -1));
    this._persist();
    return space;
  },
};

spaceService.init();

const BOUNTIES = [];

// ===== Wallet / earnings =====
const WALLET = {
  balanceUSDC: 0,
  kp: 0,
  pendingEscrow: 0,
  thisMonth: 0,
  txns: [
  ],
};

// ===== Compass Pro =====
const PRO_PLANS = [];

const PRO_PERKS = [];

Object.assign(window, {
  CATEGORIES, USERS, userByHandle, TAGS, TOPICS, TRENDING_TAGS, SUGGESTED_USERS, EVENTS_UPCOMING,
  ONLINE_MEMBERS, CONTENT_ITEMS, NOTIFICATIONS, CONVERSATIONS, TALENT, TALENT_SKILLS,
  REGIONS, SECTORS, MEMBERS, CONFERENCES, CAN_HOST_TIERS, canCreateEvent, genConfId,
  QUESTS, BOUNTIES, WALLET, PRO_PLANS, PRO_PERKS,
  SPACES, spaceService, conferenceService, messageService, questService, talentService,
  hasAttended, awardAttendance, getKpSummary, getAttendedClasses, KP_PER_CLASS,
  LEVEL_NAMES, LEVEL_THRESHOLDS, getLevelFromKp, getLevelName, getUserLevel,
  parseLockLevel, CATEGORY_ACCESS, getCategoryAccess, canViewCategory, canPostCategory, canReplyCategory,
  canViewTopic, canReplyTopic, requiredLevelLabel,
  PROFILE_CACHE, fetchUserByHandle,
});

window.__notifUnreadCount = 0;
window.__notifRefresh = async () => {
  const sb = _sb();
  if (!sb) return;
  try {
    const [notifs, count] = await Promise.all([
      sb.getNotifications(),
      sb.getUnreadCount(),
    ]);
    if (Array.isArray(notifs)) { NOTIFICATIONS.length = 0; NOTIFICATIONS.push(...notifs); }
    window.__notifUnreadCount = count;
    window.dispatchEvent(new Event('compass_notif_refresh'));
  } catch {}
};

const COMPASS_LIVE_TICK_MS = 3000;

async function refreshSocial() {
  const session = window.supabaseService?.getSession()?.access_token;
  if (!session) return;
  try {
    const handle = window.currentUser?.handle || '';
    const [spaces, conferences, notifs, suggested, trending] = await Promise.all([
      spaceService.list(),
      conferenceService.list(),
      window.__notifRefresh(),
      window.supabaseService.getSuggestedUsers(handle),
      window.supabaseService.getTrendingTags(10),
    ]);
    if (Array.isArray(spaces)) { SPACES.length = 0; SPACES.push(...spaces); window.dispatchEvent(new Event('compass_spaces_refresh')); }
    if (Array.isArray(conferences)) { CONFERENCES.length = 0; CONFERENCES.push(...conferences); window.dispatchEvent(new Event('compass_conferences_refresh')); }
    const convos = await messageService.listConversations();
    if (Array.isArray(convos)) { CONVERSATIONS.length = 0; CONVERSATIONS.push(...convos); window.dispatchEvent(new Event('compass_conversations_refresh')); }
    if (Array.isArray(suggested)) { SUGGESTED_USERS.length = 0; SUGGESTED_USERS.push(...suggested); }
    if (Array.isArray(trending)) { TRENDING_TAGS.length = 0; TRENDING_TAGS.push(...trending); }
  } catch {}
}

if (!window.__compass_poller_running) {
  window.__compass_poller_running = true;
  refreshSocial();
  setInterval(refreshSocial, COMPASS_LIVE_TICK_MS);
}
