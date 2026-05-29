import { DEFAULT_ROUTE, routeFromPath, routeToPath } from '../src/app/routes.js';

const cases = [
  ['/', DEFAULT_ROUTE],
  ['/feed', { view: 'feed' }],
  ['/spaces', { view: 'spaces' }],
  ['/profile/kelechi.eth/saved', { view: 'profile', handle: 'kelechi.eth', tab: 'saved' }],
  ['/topics/t1', { view: 'topic', topic: 't1' }],
  ['/categories/alpha', { view: 'category', cat: 'alpha' }],
  ['/tags/airdrops', { view: 'tag', tag: 'airdrops' }],
  ['/articles/c1', { view: 'article', id: 'c1' }],
  ['/talent/t-aud-1', { view: 'gig', id: 't-aud-1' }],
];

for (const [path, expected] of cases) {
  const actual = routeFromPath(path);
  assertDeepEqual(actual, expected, `routeFromPath(${path})`);
  assertEqual(routeToPath(actual), path, `routeToPath(${JSON.stringify(actual)})`);
}

console.log(`Checked ${cases.length} route mappings.`);

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function assertDeepEqual(actual, expected, label) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, got ${actualJson}`);
  }
}
