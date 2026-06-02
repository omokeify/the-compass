export const categories = [
  { id: 'news', code: '01', name: 'News Highlights', slug: 'news-highlights', desc: 'Curated Web3 updates, ecosystem movements, and high-signal alpha.', hue: 215, icon: 'news', posts: 1284, moderators: [] },
  { id: 'alpha', code: '02', name: 'Alpha Corner', slug: 'alpha-corner', desc: 'Early-stage, high-potential opportunities. Validated by contributors.', hue: 50, icon: 'alpha', posts: 743, moderators: [], premium: true },
  { id: 'earn', code: '03', name: 'Earning Opportunities', slug: 'earning', desc: 'Bounties, jobs, airdrops, quests. Make money in Web3.', hue: 145, icon: 'earn', posts: 2105 },
  { id: 'skills', code: '04', name: 'Skill Marketplace', slug: 'skills', desc: 'Talent infrastructure connecting builders to Web3 projects.', hue: 290, icon: 'skills', posts: 612 },
  { id: 'activities', code: '05', name: 'Activities', slug: 'activities', desc: 'Blog ecosystem, ecosystems of the month, Voice of Impact.', hue: 340, icon: 'activities', posts: 487 },
  { id: 'training', code: '06', name: 'Training Program', slug: 'training', desc: 'Live training and paid recorded courses. Learn-to-earn ready.', hue: 195, icon: 'training', posts: 358 },
  { id: 'events', code: '07', name: 'Events', slug: 'events', desc: 'Discover and promote Web3 events across Africa.', hue: 18, icon: 'events', posts: 421 },
  { id: 'partnership', code: '08', name: 'Sponsorship & Partnership', slug: 'partnership', desc: 'B2B Web3 growth for brands and the Compass community.', hue: 85, icon: 'partnership', posts: 156 },
];

export const users = [
];

export function userByHandle(handle) {
  return users.find((user) => user.handle === handle) || null;
}

export const tags = [
  'airdrops', 'solana', 'base', 'monad', 'bounty', 'rwa', 'defi', 'restaking',
  'depin', 'zk', 'optimism', 'starknet', 'memecoins', 'governance', 'farcaster',
  'lens', 'african-web3', 'beginner', 'remote-job', 'grant', 'hackathon', 'audit',
];
