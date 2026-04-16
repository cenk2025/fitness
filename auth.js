/* ═══════════════════════════════════════════════════
   V FITNESS — Auth Module
   Login · Signup · Session management · Nav state
═══════════════════════════════════════════════════ */

(function () {
  // ── Elements ────────────────────────────────────
  const authModal      = document.getElementById('auth-modal');
  const authModalClose = document.getElementById('auth-modal-close');
  const tabLogin       = document.getElementById('tab-login');
  const tabSignup      = document.getElementById('tab-signup');
  const panelLogin     = document.getElementById('panel-login');
  const panelSignup    = document.getElementById('panel-signup');
  const authSuccess    = document.getElementById('auth-success');

  const loginForm      = document.getElementById('login-form');
  const signupForm     = document.getElementById('signup-form');
  const loginSubmit    = document.getElementById('login-submit');
  const signupSubmit   = document.getElementById('signup-submit');

  const navLoggedOut   = document.getElementById('nav-logged-out');
  const navLoggedIn    = document.getElementById('nav-logged-in');
  const navLoginBtn    = document.getElementById('nav-login-btn');
  const navSignupBtn   = document.getElementById('nav-signup-btn');
  const navDashBtn     = document.getElementById('nav-dashboard-btn');
  const navUserName    = document.getElementById('nav-user-name');
  const navUserPlan    = document.getElementById('nav-user-plan');

  const pwInput        = document.getElementById('signup-password');
  const pwBar          = document.getElementById('pw-strength-bar');

  // ── Open / close modal ───────────────────────────
  function openModal(tab = 'login') {
    authModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (tab === 'login') showLoginPanel();
    else showSignupPanel();
  }

  function closeModal() {
    authModal.style.display = 'none';
    document.body.style.overflow = '';
    clearErrors();
  }

  window.openAuthModal = openModal;

  authModalClose?.addEventListener('click', closeModal);
  authModal?.addEventListener('click', e => { if (e.target === authModal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  navLoginBtn?.addEventListener('click',  () => openModal('login'));
  navSignupBtn?.addEventListener('click', () => openModal('signup'));

  // ── Tabs ─────────────────────────────────────────
  function showLoginPanel() {
    tabLogin.classList.add('active'); tabLogin.setAttribute('aria-selected','true');
    tabSignup.classList.remove('active'); tabSignup.setAttribute('aria-selected','false');
    panelLogin.style.display = '';
    panelSignup.style.display = 'none';
    authSuccess.style.display = 'none';
  }
  function showSignupPanel() {
    tabSignup.classList.add('active'); tabSignup.setAttribute('aria-selected','true');
    tabLogin.classList.remove('active'); tabLogin.setAttribute('aria-selected','false');
    panelSignup.style.display = '';
    panelLogin.style.display = 'none';
    authSuccess.style.display = 'none';
  }
  tabLogin?.addEventListener('click',  showLoginPanel);
  tabSignup?.addEventListener('click', showSignupPanel);

  // ── Password strength ────────────────────────────
  pwInput?.addEventListener('input', () => {
    const v = pwInput.value;
    let score = 0;
    if (v.length >= 8)                        score++;
    if (/[A-Z]/.test(v))                      score++;
    if (/[0-9]/.test(v))                      score++;
    if (/[^A-Za-z0-9]/.test(v))              score++;
    const pct   = score * 25;
    const color = ['#ef4444','#f97316','#fbbf24','#22c55e'][score - 1] || '#4e5869';
    pwBar.style.width     = pct + '%';
    pwBar.style.background = color;
  });

  // ── Toggle password visibility ───────────────────
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      target.type = target.type === 'password' ? 'text' : 'password';
    });
  });

  // ── Error helpers ────────────────────────────────
  function setError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }
  function clearErrors() {
    ['login-email-err','login-pw-err','login-error',
     'signup-fname-err','signup-email-err','signup-pw-err','signup-error']
      .forEach(id => setError(id, ''));
  }

  // ── Submit state helpers ─────────────────────────
  function setLoading(btn, loading) {
    const text    = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.btn-spinner');
    btn.disabled  = loading;
    if (text)    text.style.display    = loading ? 'none' : '';
    if (spinner) spinner.style.display = loading ? 'inline-block' : 'none';
  }

  // ── Login ────────────────────────────────────────
  loginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email)    return setError('login-email-err', 'Email is required.');
    if (!password) return setError('login-pw-err',   'Password is required.');

    setLoading(loginSubmit, true);
    const { error } = await db.auth.signInWithPassword({ email, password });
    setLoading(loginSubmit, false);

    if (error) {
      setError('login-error', error.message === 'Invalid login credentials'
        ? 'Incorrect email or password.'
        : error.message);
      return;
    }
    closeModal();
    // Session listener will update the nav
  });

  // ── Signup ───────────────────────────────────────
  signupForm?.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();
    const fname    = document.getElementById('signup-fname').value.trim();
    const lname    = document.getElementById('signup-lname').value.trim();
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const level    = document.getElementById('signup-level').value;
    const goal     = document.querySelector('input[name="goal"]:checked')?.value || 'strength';

    if (!fname)              return setError('signup-fname-err', 'First name is required.');
    if (!email)              return setError('signup-email-err', 'Email is required.');
    if (password.length < 8) return setError('signup-pw-err', 'Password must be at least 8 characters.');

    setLoading(signupSubmit, true);
    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: { data: { first_name: fname, last_name: lname } }
    });
    setLoading(signupSubmit, false);

    if (error) { setError('signup-error', error.message); return; }

    // Create profile
    if (data.user) {
      await upsertProfile({
        id:         data.user.id,
        first_name: fname,
        last_name:  lname,
        email:      email,
        level:      level,
        goal:       goal,
        plan:       'free',
      });
    }

    // Show success / email confirmation message
    panelSignup.style.display = 'none';
    authSuccess.style.display = '';
    document.getElementById('auth-success-title').textContent = 'Check your email!';
    document.getElementById('auth-success-msg').textContent =
      'We sent a confirmation link to ' + email + '. Click it to activate your account.';
  });

  // ── Guest login ──────────────────────────────────
  const GUEST_KEY = 'vfitness-guest';

  function isGuest() {
    return sessionStorage.getItem(GUEST_KEY) === '1';
  }

  function setGuestSession() {
    sessionStorage.setItem(GUEST_KEY, '1');
  }

  function clearGuestSession() {
    sessionStorage.removeItem(GUEST_KEY);
  }

  document.getElementById('btn-guest-login')?.addEventListener('click', () => {
    setGuestSession();
    closeModal();
    applyGuestNav();
    window.openDashboard && window.openDashboard();
  });

  function applyGuestNav() {
    navLoggedOut.style.display = 'none';
    navLoggedIn.style.display  = '';
    if (navUserName) navUserName.textContent = 'Guest';
    if (navUserPlan) navUserPlan.textContent = 'DEMO';
  }

  // ── Nav state after auth ─────────────────────────
  async function updateNavState() {
    // Guest takes priority
    if (isGuest()) { applyGuestNav(); return; }

    const session = await getSession();
    if (!session) {
      navLoggedOut.style.display = '';
      navLoggedIn.style.display  = 'none';
      return;
    }

    navLoggedOut.style.display = 'none';
    navLoggedIn.style.display  = '';

    const { data: profile } = await getProfile(session.user.id);
    if (profile) {
      const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || session.user.email;
      navUserName.textContent = name;
      navUserPlan.textContent = (profile.plan || 'free').toUpperCase();
    } else {
      navUserName.textContent = session.user.email?.split('@')[0] || '–';
    }
  }

  // ── Listen to auth changes ───────────────────────
  db.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') {
      clearGuestSession();
    }
    updateNavState();
    if (event === 'SIGNED_OUT') {
      clearGuestSession();
      const overlay = document.getElementById('dashboard-overlay');
      if (overlay) overlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  });

  // ── Dashboard button ─────────────────────────────
  navDashBtn?.addEventListener('click', () => {
    window.openDashboard && window.openDashboard();
  });

  // ── Expose for dashboard.js ───────────────────────
  window.isGuest = isGuest;

  // ── Init ─────────────────────────────────────────
  updateNavState();

})();
