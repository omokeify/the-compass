// Route helpers for the prototype runtime.
// This keeps URL shape in one place while the app is migrated to real modules.

const DEFAULT_ROUTE = { view: 'home' };

function stripSlashes(path) {
  return path.replace(/^\/+|\/+$/g, '');
}

function routeFromPath(pathname = window.location.pathname) {
  const parts = stripSlashes(pathname).split('/').filter(Boolean).map(decodeURIComponent);
  const [root, a, b] = parts;

  if (!root) return DEFAULT_ROUTE;
  if (root === 'feed') return { view: 'feed' };
  if (root === 'talent') return a ? { view: 'gig', id: a } : { view: 'talent' };
  if (root === 'gigs') return a ? { view: 'gig', id: a } : { view: 'talent' };
  if (root === 'spaces') return { view: 'spaces' };
  if (root === 'content') return { view: 'content' };
  if (root === 'members') return { view: 'members' };
  if (root === 'messages') return { view: 'messages' };
  if (root === 'studio') return { view: 'studio' };
  if (root === 'leaderboard') return { view: 'leaderboard' };
  if (root === 'events') return { view: 'events' };
  if (root === 'topics' && a) return { view: 'topic', topic: a };
  if (root === 'categories' && a) return { view: 'category', cat: a };
  if (root === 'tags' && a) return { view: 'tag', tag: a };
  if (root === 'articles' && a) return { view: 'article', id: a };
  if (root === 'profile' && a) return { view: 'profile', handle: a, tab: b };

  return DEFAULT_ROUTE;
}

function routeToPath(route = DEFAULT_ROUTE) {
  const enc = (v) => encodeURIComponent(v || '');

  if (route.view === 'home') return '/';
  if (route.view === 'feed') return '/feed';
  if (route.view === 'talent') return '/talent';
  if (route.view === 'gig') return `/talent/${enc(route.id)}`;
  if (route.view === 'spaces') return '/spaces';
  if (route.view === 'content') return '/content';
  if (route.view === 'members') return '/members';
  if (route.view === 'messages') return '/messages';
  if (route.view === 'studio') return '/studio';
  if (route.view === 'leaderboard') return '/leaderboard';
  if (route.view === 'events') return '/events';
  if (route.view === 'topic') return `/topics/${enc(route.topic)}`;
  if (route.view === 'category') return `/categories/${enc(route.cat)}`;
  if (route.view === 'tag') return `/tags/${enc(route.tag)}`;
  if (route.view === 'article') return `/articles/${enc(route.id)}`;
  if (route.view === 'profile') {
    const tab = route.tab ? `/${enc(route.tab)}` : '';
    const fallbackHandle = route.handle || (window.currentUser && window.currentUser.handle) || '';
    return `/profile/${enc(fallbackHandle)}${tab}`;
  }

  return '/';
}

function sameRoute(a, b) {
  return routeToPath(a) === routeToPath(b);
}

Object.assign(window, { DEFAULT_ROUTE, routeFromPath, routeToPath, sameRoute });
