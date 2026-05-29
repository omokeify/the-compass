// Signup modal + welcome toast

const SignupModal = ({ onClose, onComplete }) => {
  const [step, setStep] = React.useState('form'); // form | success
  const [email, setEmail] = React.useState('');
  const [handle, setHandle] = React.useState('');
  const [interests, setInterests] = React.useState([]);

  const toggleInt = (i) => setInterests(curr =>
    curr.includes(i) ? curr.filter(x => x !== i) : [...curr, i]);

  const canSubmit = email.includes('@') && handle.trim().length >= 3;

  const submit = () => {
    if (!canSubmit) return;
    setStep('success');
    setTimeout(() => {
      onComplete();
    }, 1600);
  };

  return (
    <div className="modal-wrap" onClick={onClose}>
      <div className="modal signup-modal" onClick={e => e.stopPropagation()}>
        <button className="signup-close" onClick={onClose}>
          <Icon name="x" size={14} />
        </button>

        <div className="signup-grid">
          {/* Left brand panel */}
          <aside className="signup-brand">
            <div className="sb-grid" />
            <div className="sb-stars" />
            <div className="sb-inner">
              <div className="sb-logo">
                <CompassLogo size={36} />
                <span>Compass</span>
              </div>
              <div className="sb-promo">
                <h2>Find your<br/>north.</h2>
                <p>The community where 14,820 builders trade signal, alpha, bounties, and training across African Web3.</p>
                <ul>
                  <li><Icon name="check" size={11} /> Free forever — no wallet required</li>
                  <li><Icon name="check" size={11} /> Curated daily feed across 8 pillars</li>
                  <li><Icon name="check" size={11} /> KP rewards for validated contributions</li>
                </ul>
              </div>
              <div className="sb-foot">
                <AvatarStack handles={['compass.eth','degenscout','0xforesight','kelechi.eth','fatima.lens']} size={28} max={5} />
                <div>
                  <strong>Joined this week</strong>
                  <span>318 new builders.</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right form panel */}
          <div className="signup-form">
            {step === 'form' && (
              <>
                <div className="sf-eyebrow">
                  <span className="eyebrow-tick">N</span>
                  <span>Join the Compass</span>
                </div>
                <h1 className="sf-title">Create your account.</h1>
                <p className="sf-sub">It takes 20 seconds — no wallet, no phone, no card.</p>

                <button className="sf-oauth">
                  <span className="sf-oauth-icon" style={{ background: '#fff' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24">
                      <path d="M12 11v3h5.3c-.2 1.4-1.6 4-5.3 4-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8c1.8 0 3 .8 3.7 1.4l2.5-2.5C16.5 4 14.4 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.7-3.7 8.7-8.8 0-.6-.1-1-.2-1.5H12z" fill="#4285F4"/>
                    </svg>
                  </span>
                  Continue with Google
                </button>
                <button className="sf-oauth">
                  <span className="sf-oauth-icon" style={{ background: '#0b0b0b', color: '#fff' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M16.4 12.8c0-2.4 2-3.6 2.1-3.6-1.1-1.6-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9-.8 0-1.9-.9-3.2-.9-1.6.1-3.2 1-4 2.6-1.7 2.9-.5 7.3 1.2 9.7.8 1.2 1.7 2.5 3 2.4 1.2-.1 1.7-.8 3.1-.8s1.9.8 3.1.7c1.3 0 2.1-1.2 2.9-2.3.9-1.4 1.3-2.6 1.3-2.7 0 0-2.4-1-2.4-3.1zm-2.4-5.8c.7-.8 1.1-2 1-3.1-.9 0-2.1.6-2.7 1.4-.6.7-1.2 1.9-1 3 1 0 2-.5 2.7-1.3z"/>
                    </svg>
                  </span>
                  Continue with Apple
                </button>

                <div className="sf-divider"><span>or with email</span></div>

                <div className="sf-fields">
                  <label className="field">
                    <span className="field-label">Email</span>
                    <input
                      className="field-input"
                      type="email"
                      placeholder="you@studio.dev"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Handle</span>
                    <div className="field-with-prefix">
                      <span className="field-prefix">@</span>
                      <input
                        className="field-input"
                        type="text"
                        placeholder="your-handle"
                        value={handle}
                        onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                      />
                    </div>
                    <span className="field-hint">compass.community/@{handle || 'your-handle'}</span>
                  </label>
                </div>

                <div className="sf-fields">
                  <span className="field-label">What pulls you in? <span style={{ color: 'var(--text-3)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(pick a few)</span></span>
                  <div className="sf-interests">
                    {CATEGORIES.map(c => {
                      const on = interests.includes(c.id);
                      const meta = CAT_META[c.id];
                      return (
                        <button
                          key={c.id}
                          className={`sf-int ${on ? 'on' : ''}`}
                          onClick={() => toggleInt(c.id)}
                        >
                          <span className="sf-int-dot" style={{ background: meta.bg }} />
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button className="btn primary lg sf-submit" disabled={!canSubmit} onClick={submit}>
                  Create my account <Icon name="arrow-right" size={13} />
                </button>
                <p className="sf-fineprint">
                  By creating an account you agree to our <span className="link">Terms</span> and acknowledge our <span className="link">Privacy Notice</span>.
                </p>
              </>
            )}

            {step === 'success' && (
              <div className="sf-success">
                <div className="sf-success-mark">
                  <Icon name="check" size={28} />
                </div>
                <h1 className="sf-title">Welcome to the Compass, @{handle}.</h1>
                <p className="sf-sub">Taking you to your feed…</p>
                <div className="sf-loader"><span /></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { SignupModal });
