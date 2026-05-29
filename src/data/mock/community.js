export const categories = [
  { id: 'news', code: '01', name: 'News Highlights', slug: 'news-highlights', desc: 'Curated Web3 updates, ecosystem movements, and high-signal alpha.', hue: 215, icon: 'news', posts: 1284, moderators: ['compass.eth', 'signal_op'] },
  { id: 'alpha', code: '02', name: 'Alpha Corner', slug: 'alpha-corner', desc: 'Early-stage, high-potential opportunities. Validated by contributors.', hue: 50, icon: 'alpha', posts: 743, moderators: ['degenscout', '0xforesight'], premium: true },
  { id: 'earn', code: '03', name: 'Earning Opportunities', slug: 'earning', desc: 'Bounties, jobs, airdrops, quests. Make money in Web3.', hue: 145, icon: 'earn', posts: 2105 },
  { id: 'skills', code: '04', name: 'Skill Marketplace', slug: 'skills', desc: 'Talent infrastructure connecting builders to Web3 projects.', hue: 290, icon: 'skills', posts: 612 },
  { id: 'activities', code: '05', name: 'Activities', slug: 'activities', desc: 'Blog ecosystem, ecosystems of the month, Voice of Impact.', hue: 340, icon: 'activities', posts: 487 },
  { id: 'training', code: '06', name: 'Training Program', slug: 'training', desc: 'Live training and paid recorded courses. Learn-to-earn ready.', hue: 195, icon: 'training', posts: 358 },
  { id: 'events', code: '07', name: 'Events', slug: 'events', desc: 'Discover and promote Web3 events across Africa.', hue: 18, icon: 'events', posts: 421 },
  { id: 'partnership', code: '08', name: 'Sponsorship & Partnership', slug: 'partnership', desc: 'B2B Web3 growth for brands and the Compass community.', hue: 85, icon: 'partnership', posts: 156 },
];

export const users = [
  { handle: 'kelechi.eth', name: 'Kelechi Okeke', tier: 'Captain', kp: 12480, joined: '2024-03-12', bio: 'Building African Web3 infra. Compass mod.', loc: 'Lagos, NG', avatar: 'K', hue: 25 },
  { handle: 'degenscout', name: 'Amara', tier: 'Navigator', kp: 9320, joined: '2024-05-02', bio: 'Alpha hunter. On-chain since 2020.', loc: 'Nairobi, KE', avatar: 'A', hue: 50 },
  { handle: '0xforesight', name: '0xForesight', tier: 'Navigator', kp: 8104, joined: '2024-06-18', bio: 'Validating alphas. Ex-Solana DevRel.', loc: 'Cape Town, ZA', avatar: '0', hue: 145 },
  { handle: 'tinuke.builds', name: 'Tinuke A.', tier: 'Scout', kp: 6210, joined: '2024-08-04', bio: 'Frontend dev. Looking for grants.', loc: 'Lagos, NG', avatar: 'T', hue: 290 },
  { handle: 'mosi_dao', name: 'Mosi', tier: 'Scout', kp: 4920, joined: '2024-09-21', bio: 'DAO governance, retroPGF, public goods.', loc: 'Kigali, RW', avatar: 'M', hue: 215 },
  { handle: 'signal_op', name: 'Signal', tier: 'Captain', kp: 14210, joined: '2023-11-08', bio: 'News curator. 8 yrs in trading.', loc: 'Abuja, NG', avatar: 'S', hue: 195 },
  { handle: 'ayo.web3', name: 'Ayodele', tier: 'Cadet', kp: 1820, joined: '2025-02-14', bio: 'Learning solidity. First airdrop hunter.', loc: 'Accra, GH', avatar: 'A', hue: 340 },
  { handle: 'compass.eth', name: 'Compass Team', tier: 'Official', kp: 99999, joined: '2023-09-01', bio: 'Official account of The Compass.', loc: 'Everywhere', avatar: 'C', hue: 65 },
  { handle: 'nana_btc', name: 'Nana Kofi', tier: 'Scout', kp: 3550, joined: '2024-12-10', bio: 'BTC maxi w/ ETH allergies. Sometimes.', loc: 'Accra, GH', avatar: 'N', hue: 18 },
  { handle: 'fatima.lens', name: 'Fatima', tier: 'Navigator', kp: 7008, joined: '2024-04-30', bio: 'Content x culture x community.', loc: 'Casablanca, MA', avatar: 'F', hue: 85 },
  { handle: 'kweku.sol', name: 'Kweku', tier: 'Cadet', kp: 920, joined: '2025-04-02', bio: 'Solana validator side quest.', loc: 'Tema, GH', avatar: 'K', hue: 110 },
  { handle: 'iyabo_nft', name: 'Iyabo', tier: 'Scout', kp: 2840, joined: '2025-01-19', bio: 'Visual artist, on-chain since 2022.', loc: 'Ibadan, NG', avatar: 'I', hue: 305 },
];

export function userByHandle(handle) {
  return users.find((user) => user.handle === handle) || users[0];
}

export const tags = [
  'airdrops', 'solana', 'base', 'monad', 'bounty', 'rwa', 'defi', 'restaking',
  'depin', 'zk', 'optimism', 'starknet', 'memecoins', 'governance', 'farcaster',
  'lens', 'african-web3', 'beginner', 'remote-job', 'grant', 'hackathon', 'audit',
];
