// App: routing + tweaks + Supabase auth

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "theme": "light",
  "showSidebar": true
}/*EDITMODE-END*/;

function mapSbProfile(user, profile) {
  return {
    id: user.id,
    handle: profile?.handle || user.email?.split('@')[0] || 'user',
    name: profile?.fullname || user.user_metadata?.fullname || user.email?.split('@')[0] || 'User',
    email: user.email,
    avatar: profile?.avatar || (user.email ? user.email[0].toUpperCase() : 'U'),
    banner: profile?.banner || '',
    hue: profile?.hue || 215,
    bio: profile?.bio || '',
    loc: profile?.loc || '',
    tier: profile?.tier || 'Explorer',
    kp: profile?.kp || 0,
    role: profile?.role || null,
    suspended_until: profile?.suspended_until || null,
  };
}

function isSuspended(user) {
  if (!user?.suspended_until) return false;
  const until = new Date(user.suspended_until);
  return until > new Date();
}

function App() {
  const [route, setRoute] = React.useState(() => routeFromPath());
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);

  const cacheUser = (u) => { if (u?.handle) window.PROFILE_CACHE ? window.PROFILE_CACHE[u.handle] = u : null; };
  const setAndCacheUser = (u) => { cacheUser(u); setCurrentUser(u); };
  const [authLoading, setAuthLoading] = React.useState(true);
  const [composer, setComposer] = React.useState(null);
  const [signup, setSignup] = React.useState(false);
  const [onboard, setOnboard] = React.useState(false);
  const [palette, setPalette] = React.useState(false);
  const [notifs, setNotifs] = React.useState(false);
  const [activeSpace, setActiveSpace] = React.useState(null);
  const [memberCard, setMemberCard] = React.useState(null);
  const [scheduleClass, setScheduleClass] = React.useState(false);
  const [activeClass, setActiveClass] = React.useState(null);
  const [registered, setRegistered] = React.useState(() => new Set());
  const [toast, setToast] = React.useState(null);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [refreshTick, setRefreshTick] = React.useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  React.useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Register service worker for push notifications
  React.useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  window.sendBrowserNotification = (title, body, url) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, { body, icon: '/favicon.ico', data: { url } });
    }).catch(() => {});
  };

  window.requestNotifPermission = async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  };

  // Check for existing Supabase session or OAuth callback on mount
  React.useEffect(() => {
    (async () => {
      try {
        const callbackSession = supabaseService.handleAuthCallback();
        const session = callbackSession || supabaseService.getSession();
        if (session?.access_token) {
          const user = await supabaseService.getUser();
          if (user) {
            const profile = await supabaseService.getProfile(user.id);
            const mapped = mapSbProfile(user, profile);
            setAndCacheUser(mapped);
            setLoggedIn(true);
          }
        }
      } catch {}
      setAuthLoading(false);
    })();
  }, []);

  window.refreshUser = () => setRefreshTick(t => t + 1);

  const showToast = (message) => {
    setToast(message);
    clearTimeout(window.__toastT);
    window.__toastT = setTimeout(() => setToast(null), 3200);
  };
  window.showToast = showToast;

  const signIn = async ({ email, password, onboardNext = false } = {}) => {
    if (email && password) {
      try {
        let loginEmail = email;
        if (!email.includes('@')) {
          const profile = await supabaseService.getProfileByHandle(email);
          if (!profile?.email) { showToast('Handle not found'); return; }
          loginEmail = profile.email;
        }
        const { user } = await supabaseService.signIn({ email: loginEmail, password });
        const profile = await supabaseService.getProfile(user.id);
        setAndCacheUser(mapSbProfile(user, profile));
      } catch (e) {
        showToast(e.message || 'Sign in failed');
        return;
      }
    }
    setLoggedIn(true);
    if (onboardNext) setOnboard(true);
    navigate({ view: onboardNext ? 'feed' : 'home' });
    window.__notifRefresh?.();
  };

  const signUp = async ({ email, password, name, handle }) => {
    try {
      const result = await supabaseService.signUp({ email, password, fullname: name, handle });
      if (result.needsConfirm) {
        showToast('Check your email for a confirmation link to activate your account.');
        return;
      }
      const profile = await supabaseService.getProfile(result.user.id);
      setAndCacheUser(mapSbProfile(result.user, profile));
      setLoggedIn(true);
      setOnboard(true);
      navigate({ view: 'feed' });
      window.__notifRefresh?.();
    } catch (e) {
      showToast(e.message || 'Sign up failed');
    }
  };

  const signOut = async () => {
    try { await supabaseService.signOut(); } catch {}
    setLoggedIn(false);
    setCurrentUser(null);
    setComposer(null);
    setNotifs(false);
    setPalette(false);
    setActiveSpace(null);
    setMemberCard(null);
    navigate({ view: 'home' }, { replace: true });
  };

  const navigate = (next, options = {}) => {
    setRoute(next);
    setMobileMenuOpen(false);
    const nextPath = routeToPath(next);
    if (nextPath !== window.location.pathname) {
      const method = options.replace ? 'replaceState' : 'pushState';
      window.history[method]({ route: next }, '', nextPath);
    }
    requestAnimationFrame(() => {
      const main = document.querySelector('.main-col');
      if (main) main.scrollTo({ top: 0, behavior: 'instant' });
    });
  };

  React.useEffect(() => {
    if (route.view === 'studio' && !canHost(currentUser)) {
      navigate({ view: 'events' }, { replace: true });
    }
  }, [route.view, currentUser]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.density = t.density;
    root.dataset.theme = t.theme === 'light' ? '' : t.theme;
    root.dataset.rail = t.showSidebar ? 'on' : 'off';
  }, [t]);

  React.useEffect(() => {
    const onPopState = () => setRoute(routeFromPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const registerClass = async (cls) => {
    if (registered.has(cls.id)) {
      setRegistered(curr => { const n = new Set(curr); n.delete(cls.id); return n; });
      await conferenceService.unregister(cls.id, currentUser.handle);
      setToast(`Removed from ${cls.title}`);
    } else {
      setRegistered(curr => { const n = new Set(curr); n.add(cls.id); return n; });
      await conferenceService.register(cls.id, currentUser.handle);
      setToast(`Registered — we'll notify you when "${cls.title.split('—')[0].trim()}" goes live.`);
    }
    clearTimeout(window.__toastT);
    window.__toastT = setTimeout(() => setToast(null), 3200);
  };

  // ⌘K palette global shortcut
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette(p => !p);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  let main = null;
  if (route.view === 'home') main = <HomeFeed navigate={navigate} currentUser={currentUser} onCompose={() => setComposer({})} onSignup={() => setSignup(true)} onJoinClass={(c) => setActiveClass(c)} onJoinSpace={(s) => setActiveSpace(s)} />;
  else if (route.view === 'feed') main = <FeedView navigate={navigate} onCompose={() => setComposer({})} currentUser={currentUser} />;
  else if (route.view === 'search') main = <SearchPage navigate={navigate} currentUser={currentUser} />;
  else if (route.view === 'talent') main = <TalentPage navigate={navigate} currentUser={currentUser} />;
  else if (route.view === 'gig') main = <GigDetailPage id={route.id} navigate={navigate} />;
  else if (route.view === 'spaces') main = <SpacesPage navigate={navigate} currentUser={currentUser} onJoinSpace={(s) => setActiveSpace(s)} />;
  else if (route.view === 'members') main = <MembersPage navigate={navigate} onOpenCard={(h) => setMemberCard(h)} />;
  else if (route.view === 'studio') main = <StudioPage navigate={navigate} currentUser={currentUser} registered={registered} onRegister={registerClass} onJoin={(c) => setActiveClass(c)} onSchedule={() => setScheduleClass(true)} />;
  else if (route.view === 'messages') main = <MessagesPage navigate={navigate} currentUser={currentUser} />;
  else if (route.view === 'category') main = <CategoryPage catId={route.cat} navigate={navigate} currentUser={currentUser} showToast={showToast} onCompose={() => setComposer({ defaultCat: route.cat })} />;
  else if (route.view === 'topic') main = <TopicPage topicId={route.topic} navigate={navigate} currentUser={currentUser} />;
  else if (route.view === 'profile') main = <ProfilePage handle={route.handle} navigate={navigate} tab={route.tab} currentUser={currentUser} />;
  else if (route.view === 'leaderboard') main = <LeaderboardPage navigate={navigate} currentUser={currentUser} />;
  else if (route.view === 'events') main = <EventsPage navigate={navigate} registered={registered} onRegister={registerClass} onJoin={(c) => setActiveClass(c)} currentUser={currentUser} onSchedule={() => setScheduleClass(true)} />;
  else if (route.view === 'content') main = <ContentPage navigate={navigate} currentUser={currentUser} />;
  else if (route.view === 'tag') main = <TagPage tag={route.tag} navigate={navigate} currentUser={currentUser} />;
  else if (route.view === 'article') main = <ArticlePage id={route.id} navigate={navigate} />;

  return (
    <div className="app">
      {!loggedIn && !authLoading && (
        <AuthPage
          onSignedIn={({ email, password }) => signIn({ email, password })}
          onSignedUp={({ email, password, name, handle }) => signUp({ email, password, name, handle })}
        />
      )}
      {authLoading && <div className="view" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Loading...</p></div>}
      {loggedIn && (
      <React.Fragment>
      <TopBar route={route} navigate={navigate} onCompose={() => setComposer({})} currentUser={currentUser} onOpenNotifs={() => setNotifs(true)} onOpenSearch={() => setPalette(true)} onLogout={signOut} onToggleMenu={() => setMobileMenuOpen(m => !m)} />
      <div className="shell">
        <Sidebar route={route} navigate={navigate} currentUser={currentUser} />
        {mobileMenuOpen && (
          <div className="sidebar-overlay open" onClick={() => setMobileMenuOpen(false)}>
            <div onClick={e => e.stopPropagation()}>
              <Sidebar route={route} navigate={navigate} currentUser={currentUser} />
            </div>
          </div>
        )}
        <main className="main-col">
          {isSuspended(currentUser) && (
            <div className="suspension-banner" style={{ padding: '12px 16px', background: '#fff3e0', borderBottom: '1px solid #ffcc80', color: '#e65100', fontSize: 14, textAlign: 'center' }}>
              Your account is suspended until {new Date(currentUser.suspended_until).toLocaleDateString()}. You can read but cannot post, comment, or interact.
            </div>
          )}
          {main}
        </main>
      </div>

      {composer && <Composer onClose={() => setComposer(null)} defaultCat={composer.defaultCat} currentUser={currentUser} />}

      {notifs && <NotificationsDrawer onClose={() => setNotifs(false)} navigate={(r) => { setNotifs(false); navigate(r); }} />}

      {activeSpace && <LiveSpaceDrawer space={activeSpace} onClose={() => setActiveSpace(null)} currentUser={currentUser} />}

      {memberCard && <MemberCard handle={memberCard} onClose={() => setMemberCard(null)} navigate={navigate} />}

      {scheduleClass && <ScheduleClassModal onClose={() => setScheduleClass(false)} currentUser={currentUser} onScheduled={() => { if (window.__studioRefresh) window.__studioRefresh(); }} />}

      {activeClass && <ClassroomView cls={activeClass} currentUser={currentUser} onLeave={() => setActiveClass(null)} />}

      {toast && (
        <div className="app-toast">
          <Icon name="check" size={14} /> {toast}
        </div>
      )}

      {signup && (
        <SignupModal
          onClose={() => setSignup(false)}
          onComplete={() => {
            setSignup(false);
            signIn({ onboardNext: true });
          }}
        />
      )}

      {onboard && (
        <OnboardingWizard
          currentUser={currentUser}
          onClose={() => setOnboard(false)}
          onComplete={() => { setOnboard(false); navigate({ view: 'feed' }); }}
        />
      )}

      {palette && <CommandPalette currentUser={currentUser} onClose={() => setPalette(false)} navigate={(r) => { setPalette(false); navigate(r); }} />}

      </React.Fragment>
      )}

      {/* signup is reachable from the landing page too */}
      {!loggedIn && onboard && (
        <OnboardingWizard
          currentUser={currentUser}
          onClose={() => setOnboard(false)}
          onComplete={() => { setOnboard(false); navigate({ view: 'feed' }); }}
        />
      )}

      {loggedIn && (
      <TweaksPanel title="Tweaks">
        <TweakSection title="Theme">
          <TweakRadio
            label="Mode"
            value={t.theme}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dim', label: 'Dim' },
            ]}
            onChange={v => setTweak('theme', v)}
          />
        </TweakSection>
        <TweakSection title="Layout">
          <TweakRadio
            label="Density"
            value={t.density}
            options={[
              { value: 'compact', label: 'Compact' },
              { value: 'comfortable', label: 'Comfort' },
            ]}
            onChange={v => setTweak('density', v)}
          />
          <TweakToggle
            label="Sidebar"
            value={t.showSidebar}
            onChange={v => setTweak('showSidebar', v)}
          />
        </TweakSection>
        <TweakSection title="Jump to">
          <TweakButton label="Sign out / auth screen" onClick={signOut} />
          <TweakButton label="Home" onClick={() => navigate({ view: 'home' })} />
          <TweakButton label="Wallet" onClick={() => navigate({ view: 'profile', handle: currentUser.handle, tab: 'wallet' })} />
          <TweakButton label="Saved" onClick={() => navigate({ view: 'profile', handle: currentUser.handle, tab: 'saved' })} />
          <TweakButton label="Search (⌘K)" onClick={() => setPalette(true)} />
          <TweakButton label="Run onboarding" onClick={() => setOnboard(true)} />
        </TweakSection>
      </TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
