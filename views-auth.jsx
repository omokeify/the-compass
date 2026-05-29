// Professional split-screen auth — sign in / create account

const AuthPage = ({ initialMode = 'signin', onSignedIn, onSignedUp }) => {
  const [mode, setMode] = React.useState(initialMode); // signin | signup
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [name, setName] = React.useState('');
  const [handle, setHandle] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const isSignup = mode === 'signup';
  const valid = isSignup
    ? email.includes('@') && pw.length >= 6 && name.trim() && handle.trim().length >= 3
    : email.includes('@') && pw.length >= 1;

  const submit = () => {
    if (!valid || busy) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (isSignup) onSignedUp(); else onSignedIn();
    }, 850);
  };

  return (
    <div className="auth">
      {/* Brand panel */}
      <aside className="auth-brand">
        <div className="auth-brand-grid" />
        <div className="auth-brand-stars" />
        <div className="auth-brand-glow" />
        <div className="auth-brand-inner">
          <div className="auth-logo">
            <CompassLogo size={34} />
            <span>Compass</span>
          </div>

          <div className="auth-pitch">
            <h1>Find your north in Web3.</h1>
            <p>Curated alpha, validated bounties, talent and live classes — the community where African builders trade signal.</p>
          </div>

          <div className="auth-quote">
            <div className="aq-mark">“</div>
            <p>Compass is the only feed I check before the charts. The alpha is real and the people are sharper than anywhere else.</p>
            <div className="aq-by">
              <Avatar user={userByHandle('degenscout')} size={36} />
              <div>
                <div className="aq-name">Amara · Navigator</div>
                <div className="aq-role">Alpha hunter, Nairobi</div>
              </div>
            </div>
          </div>

          <div className="auth-stats">
            <div><strong>14,820</strong><span>builders</span></div>
            <div><strong>$240k+</strong><span>bounties paid</span></div>
            <div><strong>20+</strong><span>countries</span></div>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-mobile-logo">
            <CompassLogo size={30} />
            <span>Compass</span>
          </div>

          <div className="auth-tabs">
            <button className={!isSignup ? 'active' : ''} onClick={() => setMode('signin')}>Sign in</button>
            <button className={isSignup ? 'active' : ''} onClick={() => setMode('signup')}>Create account</button>
            <span className="auth-tab-ind" style={{ left: isSignup ? '50%' : '0' }} />
          </div>

          <h2 className="auth-h2">{isSignup ? 'Create your account' : 'Welcome back'}</h2>
          <p className="auth-subh">{isSignup ? 'Free forever — no wallet or card required.' : 'Sign in to pick up where you left off.'}</p>

          <div className="auth-oauth">
            <button className="auth-oauth-btn" onClick={onSignedIn}>
              <span className="aob-ic" style={{ background: '#fff' }}>
                <svg width="15" height="15" viewBox="0 0 24 24"><path d="M12 11v3h5.3c-.2 1.4-1.6 4-5.3 4-3.2 0-5.8-2.6-5.8-5.8S8.8 6.4 12 6.4c1.8 0 3 .8 3.7 1.4l2.5-2.5C16.5 4 14.4 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.7-3.7 8.7-8.8 0-.6-.1-1-.2-1.5H12z" fill="#4285F4"/></svg>
              </span>
              Google
            </button>
            <button className="auth-oauth-btn" onClick={onSignedIn}>
              <span className="aob-ic" style={{ background: '#0b0b0b' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M16.4 12.8c0-2.4 2-3.6 2.1-3.6-1.1-1.6-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9-.8 0-1.9-.9-3.2-.9-1.6.1-3.2 1-4 2.6-1.7 2.9-.5 7.3 1.2 9.7.8 1.2 1.7 2.5 3 2.4 1.2-.1 1.7-.8 3.1-.8s1.9.8 3.1.7c1.3 0 2.1-1.2 2.9-2.3.9-1.4 1.3-2.6 1.3-2.7 0 0-2.4-1-2.4-3.1zM14 7c.7-.8 1.1-2 1-3.1-.9 0-2.1.6-2.7 1.4-.6.7-1.2 1.9-1 3 1 0 2-.5 2.7-1.3z"/></svg>
              </span>
              Apple
            </button>
            <button className="auth-oauth-btn wallet" onClick={onSignedIn}>
              <span className="aob-ic" style={{ background: 'var(--brand-yellow)' }}><Icon name="wallet" size={14} /></span>
              Wallet
            </button>
          </div>

          <div className="auth-divider"><span>or with email</span></div>

          <div className="auth-fields">
            {isSignup && (
              <div className="auth-row-2">
                <label className="field">
                  <span className="field-label">Full name</span>
                  <input className="field-input" placeholder="Ada Okafor" value={name} onChange={e => setName(e.target.value)} />
                </label>
                <label className="field">
                  <span className="field-label">Handle</span>
                  <div className="field-with-prefix">
                    <span className="field-prefix">@</span>
                    <input className="field-input" placeholder="ada" value={handle} onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g,''))} />
                  </div>
                </label>
              </div>
            )}
            <label className="field">
              <span className="field-label">Email</span>
              <input className="field-input" type="email" placeholder="you@studio.dev" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <label className="field">
              <span className="field-label-row">
                <span className="field-label">Password</span>
                {!isSignup && <button className="field-forgot">Forgot?</button>}
              </span>
              <div className="field-with-prefix">
                <input className="field-input" type={showPw ? 'text' : 'password'} placeholder={isSignup ? 'At least 6 characters' : '••••••••'} value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); }} />
                <button className="field-eye" onClick={() => setShowPw(s => !s)} title={showPw ? 'Hide' : 'Show'}><Icon name="eye" size={15} /></button>
              </div>
            </label>
          </div>

          <button className="btn primary lg auth-submit" disabled={!valid || busy} onClick={submit}>
            {busy ? 'One moment…' : (isSignup ? 'Create account' : 'Sign in')}
            {!busy && <Icon name="arrow-right" size={14} />}
          </button>

          <p className="auth-switch">
            {isSignup ? 'Already have an account?' : "New to Compass?"}
            <button onClick={() => setMode(isSignup ? 'signin' : 'signup')}>{isSignup ? 'Sign in' : 'Create one free'}</button>
          </p>

          <p className="auth-fine">
            By continuing you agree to our <span className="link">Terms</span> and <span className="link">Privacy Notice</span>.
          </p>
        </div>
      </main>
    </div>
  );
};

Object.assign(window, { AuthPage });
