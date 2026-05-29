// App: routing + tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "theme": "light",
  "showSidebar": true
}/*EDITMODE-END*/;

const COMPASS_SESSION_KEY = 'compass_session_v1';

function readCompassSession() {
  try { return localStorage.getItem(COMPASS_SESSION_KEY) === 'active'; }
  catch { return false; }
}

function App() {
  const [route, setRoute] = React.useState(() => routeFromPath());
  const [loggedIn, setLoggedIn] = React.useState(readCompassSession);
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
  const currentUser = userByHandle('kelechi.eth');

  const showToast = (message) => {
    setToast(message);
    clearTimeout(window.__toastT);
    window.__toastT = setTimeout(() => setToast(null), 3200);
  };

  const startSpace = () => {
    setActiveSpace({
      id: 'my-space',
      status: 'live',
      title: `${currentUser.name.split(' ')[0]}'s community space`,
      host: currentUser.handle,
      cohosts: [],
      listeners: 1,
      speakers: 1,
      started: 'now',
      topic: 'activities',
    });
    showToast('Space started. You are live now.');
  };

  const scheduleSpace = () => {
    navigate({ view: 'spaces' });
    showToast('Scheduling is queued for the production calendar flow.');
  };

  const signIn = ({ onboardNext = false } = {}) => {
    try { localStorage.setItem(COMPASS_SESSION_KEY, 'active'); } catch {}
    setLoggedIn(true);
    if (onboardNext) setOnboard(true);
    navigate({ view: onboardNext ? 'feed' : 'home' });
  };

  const signOut = () => {
    try { localStorage.removeItem(COMPASS_SESSION_KEY); } catch {}
    setLoggedIn(false);
    setComposer(null);
    setNotifs(false);
    setPalette(false);
    setActiveSpace(null);
    setMemberCard(null);
    navigate({ view: 'home' }, { replace: true });
  };

  const navigate = (next, options = {}) => {
    setRoute(next);
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

  const registerClass = (cls) => {
    setRegistered(curr => {
      const n = new Set(curr);
      if (n.has(cls.id)) { n.delete(cls.id); setToast(`Removed from ${cls.title}`); }
      else { n.add(cls.id); setToast(`Registered — we'll notify you when "${cls.title.split('—')[0].trim()}" goes live.`); }
      return n;
    });
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
  if (route.view === 'home') main = <HomeFeed navigate={navigate} onCompose={() => setComposer({})} onSignup={() => setSignup(true)} onJoinClass={(c) => setActiveClass(c)} />;
  else if (route.view === 'feed') main = <FeedView navigate={navigate} onCompose={() => setComposer({})} />;
  else if (route.view === 'talent') main = <TalentPage navigate={navigate} />;
  else if (route.view === 'gig') main = <GigDetailPage id={route.id} navigate={navigate} />;
  else if (route.view === 'spaces') main = <SpacesPage navigate={navigate} onJoinSpace={(s) => setActiveSpace(s)} onStartSpace={startSpace} onScheduleSpace={scheduleSpace} />;
  else if (route.view === 'members') main = <MembersPage navigate={navigate} onOpenCard={(h) => setMemberCard(h)} />;
  else if (route.view === 'studio') main = <StudioPage navigate={navigate} currentUser={currentUser} registered={registered} onRegister={registerClass} onJoin={(c) => setActiveClass(c)} onSchedule={() => setScheduleClass(true)} />;
  else if (route.view === 'messages') main = <MessagesPage navigate={navigate} />;
  else if (route.view === 'category') main = <CategoryPage catId={route.cat} navigate={navigate} onCompose={() => setComposer({ defaultCat: route.cat })} />;
  else if (route.view === 'topic') main = <TopicPage topicId={route.topic} navigate={navigate} />;
  else if (route.view === 'profile') main = <ProfilePage handle={route.handle} navigate={navigate} tab={route.tab} />;
  else if (route.view === 'leaderboard') main = <LeaderboardPage navigate={navigate} />;
  else if (route.view === 'pro') main = <ProPage navigate={navigate} />;
  else if (route.view === 'bounties') main = <BountiesPage navigate={navigate} />;
  else if (route.view === 'events') main = <EventsPage navigate={navigate} registered={registered} onRegister={registerClass} onJoin={(c) => setActiveClass(c)} />;
  else if (route.view === 'tag') main = <TagPage tag={route.tag} navigate={navigate} />;
  else if (route.view === 'article') main = <ArticlePage id={route.id} navigate={navigate} />;

  return (
    <div className="app">
      {!loggedIn && (
        <AuthPage
          onSignedIn={() => signIn()}
          onSignedUp={() => signIn({ onboardNext: true })}
        />
      )}
      {loggedIn && (
      <React.Fragment>
      <TopBar route={route} navigate={navigate} onCompose={() => setComposer({})} currentUser={currentUser} onOpenNotifs={() => setNotifs(true)} onOpenSearch={() => setPalette(true)} onLogout={signOut} />
      <div className="shell">
        <Sidebar route={route} navigate={navigate} currentUser={currentUser} />
        <main className="main-col">
          {main}
        </main>
      </div>

      {composer && <Composer onClose={() => setComposer(null)} defaultCat={composer.defaultCat} />}

      {notifs && <NotificationsDrawer onClose={() => setNotifs(false)} navigate={(r) => { setNotifs(false); navigate(r); }} />}

      {activeSpace && <LiveSpaceDrawer space={activeSpace} onClose={() => setActiveSpace(null)} />}

      {memberCard && <MemberCard handle={memberCard} onClose={() => setMemberCard(null)} navigate={navigate} />}

      {scheduleClass && <ScheduleClassModal onClose={() => setScheduleClass(false)} currentUser={currentUser} />}

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

      {palette && <CommandPalette onClose={() => setPalette(false)} navigate={(r) => { setPalette(false); navigate(r); }} />}

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
          <TweakButton label="Bounties" onClick={() => navigate({ view: 'bounties' })} />
          <TweakButton label="Wallet" onClick={() => navigate({ view: 'profile', handle: 'kelechi.eth', tab: 'wallet' })} />
          <TweakButton label="Compass Pro" onClick={() => navigate({ view: 'pro' })} />
          <TweakButton label="Saved" onClick={() => navigate({ view: 'profile', handle: 'kelechi.eth', tab: 'saved' })} />
          <TweakButton label="Search (⌘K)" onClick={() => setPalette(true)} />
          <TweakButton label="Run onboarding" onClick={() => setOnboard(true)} />
        </TweakSection>
      </TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
