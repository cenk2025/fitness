/* ═══════════════════════════════════════════════════
   V FITNESS — Dashboard Module
   Overview · Programs · Workouts · Nutrition
   Progress · Body Stats · Settings
═══════════════════════════════════════════════════ */

(function () {

  const overlay     = document.getElementById('dashboard-overlay');
  const sidebar     = document.getElementById('db-sidebar');
  const menuToggle  = document.getElementById('db-menu-toggle');
  const closeBtn    = document.getElementById('db-close-btn');
  const closeMobile = document.getElementById('db-close-mobile');
  const logoutBtns  = [document.getElementById('db-logout-btn'), document.getElementById('settings-logout-btn')];
  const navItems    = document.querySelectorAll('.db-nav-item');
  const topbarTitle = document.getElementById('db-topbar-title');

  let currentUser    = null;
  let currentProfile = null;
  let allWorkoutLogs = [];
  let allMeasurements = [];
  let allPBs         = [];

  // ── Guest demo data ───────────────────────────────
  const GUEST_PROFILE = {
    id: 'guest', first_name: 'Guest', last_name: 'User',
    email: 'guest@vfitness.app', level: 'intermediate',
    goal: 'strength', plan: 'demo', calorie_goal: 2350,
  };

  const GUEST_LOGS = [
    { id:'g1', exercise_name:'Bench Press',   category:'chest',  sets:4, reps:10, weight_kg:80,  duration_minutes:45, logged_at: daysAgo(0) },
    { id:'g2', exercise_name:'Back Squat',     category:'legs',   sets:5, reps:5,  weight_kg:100, duration_minutes:55, logged_at: daysAgo(1) },
    { id:'g3', exercise_name:'Deadlift',       category:'back',   sets:4, reps:6,  weight_kg:120, duration_minutes:60, logged_at: daysAgo(2) },
    { id:'g4', exercise_name:'Overhead Press', category:'shoulders', sets:4, reps:8, weight_kg:60, duration_minutes:40, logged_at: daysAgo(4) },
    { id:'g5', exercise_name:'Plank Circuit',  category:'core',   sets:3, reps:null, weight_kg:null, duration_minutes:20, logged_at: daysAgo(5) },
    { id:'g6', exercise_name:'Tabata Blast',   category:'hiit',   sets:8, reps:null, weight_kg:null, duration_minutes:25, logged_at: daysAgo(6) },
  ];

  const GUEST_MEASUREMENTS = [
    { id:'m1', weight_kg:78.5, height_cm:180, body_fat_pct:16.2, muscle_mass_kg:62.1, chest_cm:102, waist_cm:84, hips_cm:97, arms_cm:38, measured_at: daysAgo(0)  },
    { id:'m2', weight_kg:79.2, height_cm:180, body_fat_pct:16.8, muscle_mass_kg:61.8, chest_cm:101, waist_cm:85, hips_cm:97, arms_cm:37, measured_at: daysAgo(7)  },
    { id:'m3', weight_kg:80.1, height_cm:180, body_fat_pct:17.5, muscle_mass_kg:61.2, chest_cm:100, waist_cm:86, hips_cm:98, arms_cm:37, measured_at: daysAgo(14) },
    { id:'m4', weight_kg:81.0, height_cm:180, body_fat_pct:18.0, muscle_mass_kg:60.5, chest_cm:100, waist_cm:88, hips_cm:98, arms_cm:36, measured_at: daysAgo(30) },
  ];

  const GUEST_PBS = [
    { id:'p1', exercise_name:'Squat',    weight_kg:120, reps:1, achieved_at: daysAgo(3)  },
    { id:'p2', exercise_name:'Bench',    weight_kg:95,  reps:1, achieved_at: daysAgo(7)  },
    { id:'p3', exercise_name:'Deadlift', weight_kg:140, reps:1, achieved_at: daysAgo(10) },
    { id:'p4', exercise_name:'OHP',      weight_kg:70,  reps:1, achieved_at: daysAgo(14) },
  ];

  const GUEST_MEALS = [
    { id:'n1', meal_type:'breakfast', description:'Oats + Protein Shake + Berries', calories:480, protein_g:42, carbs_g:58, fat_g:8,  log_date: today() },
    { id:'n2', meal_type:'lunch',     description:'Chicken + Brown Rice + Broccoli', calories:650, protein_g:55, carbs_g:72, fat_g:12, log_date: today() },
    { id:'n3', meal_type:'snack',     description:'Greek Yogurt + Almonds',          calories:280, protein_g:18, carbs_g:22, fat_g:14, log_date: today() },
  ];

  const GUEST_PROGRAMS = [
    { id:'gpr1', status:'active', current_week:3, started_at: daysAgo(14),
      programs: { name:'Power Foundation', category:'strength', duration_weeks:12, sessions_per_week:4 } },
  ];

  function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }
  function today() { return new Date().toISOString().slice(0, 10); }

  // ── Open / Close ─────────────────────────────────
  async function openDashboard() {
    const guest = window.isGuest && window.isGuest();
    if (!guest) {
      let session;
      try { session = await getSession(); } catch (e) { session = null; }
      if (!session) { window.openAuthModal('login'); return; }
      currentUser = session.user;
    } else {
      currentUser = { id: 'guest', email: 'guest@vfitness.app' };
    }

    // Show overlay first — loadAll errors must not hide it
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    try {
      await loadAll();
    } catch (err) {
      console.error('[Dashboard] loadAll failed:', err);
    }
    switchPanel('overview');
  }
  window.openDashboard = openDashboard;

  function closeDashboard() {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    sidebar.classList.remove('open');
  }
  window.closeDashboard = closeDashboard;

  closeBtn?.addEventListener('click',    closeDashboard);
  closeMobile?.addEventListener('click', closeDashboard);
  menuToggle?.addEventListener('click',  () => sidebar.classList.toggle('open'));
  logoutBtns.forEach(btn => btn?.addEventListener('click', async () => {
    if (window.isGuest && window.isGuest()) {
      sessionStorage.removeItem('vfitness-guest');
      closeDashboard();
      // restore nav
      document.getElementById('nav-logged-out').style.display = '';
      document.getElementById('nav-logged-in').style.display  = 'none';
    } else {
      await db.auth.signOut();
      closeDashboard();
    }
  }));

  // ── Panel switching ───────────────────────────────
  const panelTitles = {
    overview: 'Overview', programs: 'My Programs', workouts: 'Workouts',
    nutrition: 'Nutrition', progress: 'Progress', body: 'Body Stats', settings: 'Settings'
  };

  function switchPanel(name) {
    document.querySelectorAll('.db-panel').forEach(p => p.style.display = 'none');
    const target = document.getElementById('panel-' + name);
    if (target) target.style.display = '';

    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.panel === name);
    });

    if (topbarTitle) topbarTitle.textContent = panelTitles[name] || name;
    sidebar.classList.remove('open');
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => switchPanel(item.dataset.panel));
  });

  document.querySelectorAll('[data-switch-panel]').forEach(btn => {
    btn.addEventListener('click', () => switchPanel(btn.dataset.switchPanel));
  });

  // ── Load all data ─────────────────────────────────
  async function loadAll() {
    if (!currentUser) return;

    const isGuestMode = window.isGuest && window.isGuest();

    if (isGuestMode) {
      // Use demo data — no Supabase calls
      currentProfile   = GUEST_PROFILE;
      allWorkoutLogs   = GUEST_LOGS;
      allMeasurements  = GUEST_MEASUREMENTS;
      allPBs           = GUEST_PBS;

      const safe = (fn, name) => { try { fn(); } catch(e) { console.error('[render] ' + name, e); } };
      safe(() => renderProfile(GUEST_PROFILE, currentUser), 'renderProfile');
      safe(() => renderOverview(7),            'renderOverview');
      safe(() => renderPrograms(GUEST_PROGRAMS), 'renderPrograms');
      safe(() => renderWorkoutsList(),          'renderWorkoutsList');
      safe(() => renderProgress(),              'renderProgress');
      safe(() => renderBodyStats(),             'renderBodyStats');
      safe(() => renderNutrition(GUEST_MEALS),  'renderNutrition');
      safe(() => renderSettings(),              'renderSettings');
      safe(() => showGuestBanner(),             'showGuestBanner');
      return;
    }

    const uid = currentUser.id;

    // Profile
    const { data: profile } = await getProfile(uid);
    currentProfile = profile;
    renderProfile(profile, currentUser);

    // Workout logs
    const { data: logs } = await getWorkoutLogs(uid, 50);
    allWorkoutLogs = logs || [];

    // Measurements
    const { data: measurements } = await getMeasurements(uid);
    allMeasurements = measurements || [];

    // Personal bests
    const { data: pbs } = await getPersonalBests(uid);
    allPBs = pbs || [];

    // Streak
    const streak = await getStreak(uid);

    renderOverview(streak);
    renderWorkoutsList();
    renderProgress();
    renderBodyStats();
    renderSettings();

    // Programs
    const { data: userPrograms } = await getUserPrograms(uid);
    renderPrograms(userPrograms || []);

    // Today's nutrition
    const todayDate = new Date().toISOString().slice(0, 10);
    const { data: nutrition } = await getNutritionLogs(uid, todayDate);
    renderNutrition(nutrition || []);
  }

  // ── Programs ─────────────────────────────────────
  const PROGRAM_COLORS = {
    strength: '#F97316', cardio: '#22C55E', body_composition: '#8B5CF6', mobility: '#06B6D4'
  };

  function renderPrograms(userPrograms) {
    const container = document.getElementById('programs-list');
    if (!container) return;

    if (!userPrograms || !userPrograms.length) {
      container.innerHTML = `
        <div class="db-empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4e5869" stroke-width="1.5" aria-hidden="true"><path d="M4 4h16v2H4zm0 7h16v2H4zm0 7h16v2H4z"/></svg>
          <p>No active programs yet.</p>
          <button class="btn btn-primary" onclick="window.closeDashboard();setTimeout(()=>document.getElementById('programs')?.scrollIntoView({behavior:'smooth'}),300)">Browse Programs</button>
        </div>`;
      return;
    }

    container.innerHTML = userPrograms.map(up => {
      const p = up.programs || {};
      const totalWeeks  = p.duration_weeks || 12;
      const currentWeek = up.current_week || 1;
      const progress    = Math.min(100, Math.round((currentWeek / totalWeeks) * 100));
      const color       = PROGRAM_COLORS[p.category] || '#F97316';
      const startDate   = new Date(up.started_at).toLocaleDateString(undefined, { month:'short', day:'numeric' });
      const safeName    = escHtml(p.name || 'Program');

      return `
        <div class="db-card program-active-card" style="border-left: 3px solid ${color}">
          <div class="pac-header">
            <div>
              <div class="pac-tag" style="color:${color}">${escHtml((p.category || 'program').replace('_',' '))}</div>
              <h3 class="pac-name">${safeName}</h3>
            </div>
            <span class="pac-status ${up.status}">${up.status}</span>
          </div>
          <div class="pac-progress">
            <div class="pac-progress-label">
              <span>Week ${currentWeek}${p.duration_weeks ? ' of ' + p.duration_weeks : ''}</span>
              <span style="color:${color}">${progress}%</span>
            </div>
            <div class="pac-bar-bg"><div class="pac-bar-fill" style="width:${progress}%;background:${color}"></div></div>
          </div>
          <div class="pac-meta">
            ${p.sessions_per_week ? `<span>${p.sessions_per_week}x / week</span>` : ''}
            <span>Started ${startDate}</span>
            <button class="pac-btn-schedule" onclick="window.openProgramDetail('${escHtml(p.name || '')}')">View Schedule</button>
            ${up.status === 'active' ? `<button class="pac-btn-complete" data-program-user-id="${up.id}" onclick="window.completeWeek('${up.id}')">Complete Week ${currentWeek}</button>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  // ── Enroll in program ─────────────────────────────
  window.enrollProgram = async function(programName) {
    const isGuestMode = window.isGuest && window.isGuest();

    if (!isGuestMode) {
      const session = await getSession().catch(() => null);
      if (!session) {
        window.setPendingAction && window.setPendingAction(() => window.enrollProgram(programName));
        window.openAuthModal('signup');
        return;
      }
    }

    // Open dashboard only if not already open
    if (overlay.style.display !== 'flex') {
      await openDashboard();
    } else if (!currentUser) {
      await openDashboard();
    }
    switchPanel('programs');

    if (isGuestMode) return;

    // Enroll in real DB
    try {
      const { data: prog } = await db.from('programs').select('id').eq('name', programName).single();
      if (!prog) { console.warn('[enrollProgram] Program not found:', programName); return; }

      await db.from('user_programs').upsert({
        user_id:      currentUser.id,
        program_id:   prog.id,
        started_at:   new Date().toISOString(),
        status:       'active',
        current_week: 1
      }, { onConflict: 'user_id,program_id' });

      const { data: userPrograms } = await getUserPrograms(currentUser.id);
      renderPrograms(userPrograms || []);

      // Show success toast
      showToast(`Enrolled in ${programName}!`);
    } catch (e) { console.error('[enrollProgram]', e); }
  };

  // ── Complete a program week ───────────────────────
  window.completeWeek = async function(userProgramId) {
    if (window.isGuest && window.isGuest()) return;
    try {
      // Increment current_week
      const { data: up } = await db.from('user_programs').select('current_week, programs(duration_weeks)').eq('id', userProgramId).single();
      if (!up) return;
      const nextWeek = (up.current_week || 1) + 1;
      const maxWeeks = up.programs?.duration_weeks;
      const isComplete = maxWeeks && nextWeek > maxWeeks;
      await db.from('user_programs').update({
        current_week: isComplete ? maxWeeks : nextWeek,
        status: isComplete ? 'completed' : 'active',
        ...(isComplete ? { completed_at: new Date().toISOString() } : {})
      }).eq('id', userProgramId);

      const { data: userPrograms } = await getUserPrograms(currentUser.id);
      renderPrograms(userPrograms || []);
    } catch (e) { console.error('[completeWeek]', e); }
  };

  // ── Quick-add workout from landing page ───────────
  window.quickAddWorkout = async function(name, category, sets, reps, duration) {
    const isGuestMode = window.isGuest && window.isGuest();

    if (!isGuestMode) {
      const session = await getSession().catch(() => null);
      if (!session) {
        window.setPendingAction && window.setPendingAction(
          () => window.quickAddWorkout(name, category, sets, reps, duration)
        );
        window.openAuthModal('login');
        return;
      }
    }

    if (overlay.style.display !== 'flex') {
      await openDashboard();
    } else if (!currentUser) {
      await openDashboard();
    }
    switchPanel('workouts');

    // Pre-fill the log form
    const logForm = document.getElementById('log-workout-form');
    if (logForm) logForm.style.display = '';
    const ex     = document.getElementById('log-exercise');
    const cat    = document.getElementById('log-category');
    const setsEl = document.getElementById('log-sets');
    const repsEl = document.getElementById('log-reps');
    const durEl  = document.getElementById('log-duration');
    if (ex)              ex.value    = name     || '';
    if (cat)             cat.value   = category || 'strength';
    if (setsEl && sets)  setsEl.value = sets;
    if (repsEl && reps)  repsEl.value = reps;
    if (durEl && duration) durEl.value = duration;
    if (ex) { ex.focus(); ex.select(); }
  };

  // ── Guest banner ──────────────────────────────────
  function showGuestBanner() {
    if (document.getElementById('guest-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'guest-banner';
    banner.style.cssText = `
      position:sticky; top:0; z-index:30;
      background:linear-gradient(135deg,rgba(249,115,22,0.15),rgba(251,191,36,0.08));
      border-bottom:1px solid rgba(249,115,22,0.3);
      padding:0.6rem 1.5rem;
      display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;
    `;
    banner.innerHTML = `
      <span style="font-size:0.85rem;color:#eef1f8">
        <strong style="color:#F97316">Demo Mode</strong> — This is sample data.
        Create a free account to save your real progress.
      </span>
      <button onclick="window.openAuthModal('signup')" style="
        padding:0.4rem 1.25rem; background:#F97316; color:#000;
        border:none; border-radius:999px; font-family:'Barlow Condensed',sans-serif;
        font-weight:800; font-size:0.8rem; text-transform:uppercase;
        letter-spacing:0.05em; cursor:pointer;
      ">Create Free Account</button>
    `;
    const main = document.getElementById('db-main');
    main.prepend(banner);
  }

  // ── Profile ───────────────────────────────────────
  function renderProfile(profile, user) {
    if (!profile) return;
    const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
               || user?.email?.split('@')[0] || '–';

    const el = s => document.getElementById(s);
    if (el('db-profile-name'))   el('db-profile-name').textContent   = name;
    if (el('db-plan-pill'))      el('db-plan-pill').textContent       = (profile.plan || 'FREE').toUpperCase();
    if (el('db-profile-level'))  el('db-profile-level').textContent   = profile.level || 'beginner';

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    ['db-avatar-lg','db-avatar-xl','nav-avatar'].forEach(id => {
      const av = document.getElementById(id);
      if (av) {
        av.textContent = initials;
        av.style.display      = 'flex';
        av.style.alignItems   = 'center';
        av.style.justifyContent = 'center';
        av.style.fontFamily   = 'var(--font-display)';
        av.style.fontWeight   = '800';
        av.style.fontSize     = id === 'db-avatar-xl' ? '1.5rem' : '0.9rem';
        av.style.color        = '#000';
      }
    });
  }

  // ── Overview ──────────────────────────────────────
  function renderOverview(streak) {
    const s = id => document.getElementById(id);
    if (s('ov-streak'))          s('ov-streak').textContent         = streak;
    if (s('ov-total-workouts'))  s('ov-total-workouts').textContent = allWorkoutLogs.length;

    // This week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0,0,0,0);
    const thisWeek = allWorkoutLogs.filter(w => new Date(w.logged_at) >= weekStart);
    if (s('ov-this-week')) s('ov-this-week').textContent = thisWeek.length;

    // Total hours
    const totalMins = allWorkoutLogs.reduce((acc, w) => acc + (w.duration_minutes || 0), 0);
    if (s('ov-hours')) s('ov-hours').textContent = Math.round(totalMins / 60) + 'h';

    // Greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const firstName = currentProfile?.first_name || currentUser?.email?.split('@')[0] || '';
    if (s('db-greeting')) s('db-greeting').textContent = `${greeting}, ${firstName}!`;

    // Date
    if (s('db-today-date')) {
      s('db-today-date').textContent = new Date().toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
    }

    renderWeeklyChart(thisWeek);
    renderRecentWorkouts('recent-workouts-list', 5);
  }

  function renderWeeklyChart(thisWeekLogs) {
    const container = document.getElementById('weekly-bars');
    const daysEl    = document.getElementById('weekly-days');
    if (!container || !daysEl) return;

    const days  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = new Date().getDay();

    // Build a set of day-indices that had workouts this week
    const trainedDays = new Set();
    thisWeekLogs.forEach(w => {
      const d = new Date(w.logged_at).getDay();
      trainedDays.add(d);
    });

    container.innerHTML = '';
    daysEl.innerHTML    = '';

    days.forEach((dayName, idx) => {
      const bar = document.createElement('div');
      bar.className = 'weekly-bar';
      const isToday   = idx === today;
      const isTrained = trainedDays.has(idx);
      const isFuture  = idx > today;

      bar.classList.add(isToday ? 'today' : isTrained ? 'trained' : 'rest');
      const height = isFuture ? 8 : isTrained || isToday ? Math.max(30, Math.random() * 70 + 30) : 8;
      bar.style.height = height + 'px';
      bar.setAttribute('aria-label', `${dayName}: ${isTrained ? 'Trained' : isToday ? 'Today' : 'Rest'}`);
      container.appendChild(bar);

      const label = document.createElement('div');
      label.className = 'weekly-day' + (isToday ? ' today-label' : '');
      label.textContent = dayName;
      daysEl.appendChild(label);
    });
  }

  // ── Workout list ──────────────────────────────────
  function renderRecentWorkouts(containerId, limit) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const logs = limit ? allWorkoutLogs.slice(0, limit) : allWorkoutLogs;
    if (!logs.length) {
      container.innerHTML = '<div class="db-empty-state">No workouts logged yet. Start your first session!</div>';
      return;
    }

    container.innerHTML = logs.map(w => {
      const date  = new Date(w.logged_at).toLocaleDateString(undefined, { month:'short', day:'numeric' });
      const meta  = [
        w.sets       ? `${w.sets} sets` : '',
        w.reps       ? `${w.reps} reps` : '',
        w.weight_kg  ? `${w.weight_kg} kg` : '',
        w.duration_minutes ? `${w.duration_minutes} min` : ''
      ].filter(Boolean).join(' · ');

      return `
        <div class="workout-log-item">
          <div class="wli-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M6 4v6a6 6 0 0012 0V4"/><line x1="6" y1="20" x2="18" y2="20"/>
            </svg>
          </div>
          <div class="wli-info">
            <div class="wli-name">${escHtml(w.exercise_name || w.workouts?.name || 'Workout')}</div>
            <div class="wli-meta">${escHtml(meta || w.category || '–')}</div>
          </div>
          <div class="wli-date">${date}</div>
        </div>
      `;
    }).join('');
  }

  function renderWorkoutsList() {
    renderRecentWorkouts('all-workouts-list', 0);
  }

  // ── Log workout ───────────────────────────────────
  const logWorkoutBtn  = document.getElementById('log-workout-btn');
  const logWorkoutForm = document.getElementById('log-workout-form');
  const logCancelBtn   = document.getElementById('log-cancel-btn');
  const logSubmitBtn   = document.getElementById('log-submit-btn');

  logWorkoutBtn?.addEventListener('click', () => {
    logWorkoutForm.style.display = logWorkoutForm.style.display === 'none' ? '' : 'none';
  });
  logCancelBtn?.addEventListener('click', () => { logWorkoutForm.style.display = 'none'; });
  logSubmitBtn?.addEventListener('click', async () => {
    const exercise = document.getElementById('log-exercise').value.trim();
    if (!exercise) { document.getElementById('log-error').textContent = 'Exercise name required.'; return; }

    const log = {
      user_id:          currentUser.id,
      exercise_name:    exercise,
      category:         document.getElementById('log-category').value,
      sets:             parseInt(document.getElementById('log-sets').value) || null,
      reps:             parseInt(document.getElementById('log-reps').value) || null,
      weight_kg:        parseFloat(document.getElementById('log-weight').value) || null,
      duration_minutes: parseInt(document.getElementById('log-duration').value) || null,
      notes:            document.getElementById('log-notes').value.trim() || null,
    };

    logSubmitBtn.disabled = true;
    const { error } = await logWorkout(log);
    logSubmitBtn.disabled = false;

    if (error) { document.getElementById('log-error').textContent = error.message; return; }

    document.getElementById('log-exercise').value   = '';
    document.getElementById('log-sets').value       = '';
    document.getElementById('log-reps').value       = '';
    document.getElementById('log-weight').value     = '';
    document.getElementById('log-duration').value   = '';
    document.getElementById('log-notes').value      = '';
    document.getElementById('log-error').textContent = '';
    logWorkoutForm.style.display = 'none';

    // Reload logs + refresh overview stats
    const { data: logs } = await getWorkoutLogs(currentUser.id, 50);
    allWorkoutLogs = logs || [];
    renderWorkoutsList();

    const streak = await getStreak(currentUser.id);
    renderOverview(streak);

    showToast('Workout logged!');
  });

  // ── Nutrition ─────────────────────────────────────
  function renderNutrition(meals) {
    const today = new Date().toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
    const el = document.getElementById('nutrition-date');
    if (el) el.textContent = today;

    const totalKcal    = meals.reduce((a, m) => a + (m.calories || 0), 0);
    const totalProtein = meals.reduce((a, m) => a + (m.protein_g || 0), 0);
    const totalCarbs   = meals.reduce((a, m) => a + (m.carbs_g || 0), 0);
    const totalFat     = meals.reduce((a, m) => a + (m.fat_g || 0), 0);
    const kcalGoal     = currentProfile?.calorie_goal || 2350;

    const s = id => document.getElementById(id);
    if (s('db-kcal-today')) s('db-kcal-today').textContent = totalKcal;
    if (s('db-kcal-goal'))  s('db-kcal-goal').textContent  = '/ ' + kcalGoal;
    if (s('db-protein'))    s('db-protein').textContent     = totalProtein + 'g';
    if (s('db-carbs'))      s('db-carbs').textContent       = totalCarbs + 'g';
    if (s('db-fat'))        s('db-fat').textContent         = totalFat + 'g';

    const pct = g => Math.min(100, Math.round((g / (kcalGoal * 0.3 / 4)) * 100));
    if (s('db-protein-bar')) s('db-protein-bar').style.width = Math.min(100, Math.round(totalProtein / 180 * 100)) + '%';
    if (s('db-carbs-bar'))   s('db-carbs-bar').style.width   = Math.min(100, Math.round(totalCarbs  / 250 * 100)) + '%';
    if (s('db-fat-bar'))     s('db-fat-bar').style.width     = Math.min(100, Math.round(totalFat    / 72  * 100)) + '%';

    const list = s('meals-list');
    if (list) {
      if (!meals.length) {
        list.innerHTML = '<div class="db-empty-state">No meals logged today.</div>';
      } else {
        list.innerHTML = meals.map(m => `
          <div class="meal-log-item">
            <div class="mli-type">${escHtml(m.meal_type || '–')}</div>
            <div class="mli-name">${escHtml(m.description || '–')}</div>
            <div class="mli-kcal">${m.calories || 0} kcal</div>
          </div>
        `).join('');
      }
    }
  }

  // Nutrition form submit
  document.getElementById('nutrition-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const entry = {
      user_id:     currentUser.id,
      log_date:    new Date().toISOString().slice(0, 10),
      meal_type:   document.getElementById('meal-type').value,
      description: document.getElementById('meal-name').value.trim(),
      calories:    parseInt(document.getElementById('meal-kcal').value) || 0,
      protein_g:   parseFloat(document.getElementById('meal-protein').value) || 0,
      carbs_g:     parseFloat(document.getElementById('meal-carbs').value) || 0,
      fat_g:       parseFloat(document.getElementById('meal-fat').value) || 0,
    };

    const { error } = await db.from('nutrition_logs').insert(entry);
    if (error) return;

    e.target.reset();
    const todayStr = new Date().toISOString().slice(0, 10);
    const { data: nutrition } = await getNutritionLogs(currentUser.id, todayStr);
    renderNutrition(nutrition || []);
    showToast('Meal logged!');
  });

  // ── Progress ──────────────────────────────────────
  function renderProgress() {
    const s = id => document.getElementById(id);

    // Personal bests top cards
    const squat = allPBs.find(p => /squat/i.test(p.exercise_name));
    const bench = allPBs.find(p => /bench/i.test(p.exercise_name));
    const dl    = allPBs.find(p => /deadlift/i.test(p.exercise_name));

    if (s('pr-best-squat')) s('pr-best-squat').textContent = squat ? squat.weight_kg + ' kg' : '–';
    if (s('pr-best-bench')) s('pr-best-bench').textContent = bench ? bench.weight_kg + ' kg' : '–';
    if (s('pr-best-dl'))    s('pr-best-dl').textContent    = dl    ? dl.weight_kg    + ' kg' : '–';

    // Weight trend chart from measurements
    renderWeightChart();
    renderPBsTable();
  }

  function renderWeightChart() {
    const svg = document.getElementById('weight-chart-svg');
    if (!svg) return;

    const weightData = allMeasurements
      .filter(m => m.weight_kg)
      .reverse()
      .slice(-10);

    if (weightData.length < 2) {
      svg.querySelector('#weight-chart-empty')?.setAttribute('display', 'block');
      return;
    }

    svg.querySelector('#weight-chart-empty')?.setAttribute('display', 'none');

    const W = 600, H = 160, pad = 40;
    const vals  = weightData.map(m => m.weight_kg);
    const min   = Math.min(...vals) - 2;
    const max   = Math.max(...vals) + 2;
    const xStep = (W - pad * 2) / (vals.length - 1);
    const yScale = v => H - pad - ((v - min) / (max - min)) * (H - pad * 2);

    const points = vals.map((v, i) => `${pad + i * xStep},${yScale(v)}`).join(' ');
    const areaPts = `${pad},${H - pad} ` + points + ` ${pad + (vals.length - 1) * xStep},${H - pad}`;

    svg.innerHTML = `
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#F97316" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#F97316" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${H-pad}" stroke="#1e2535" stroke-width="1"/>
      <line x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}" stroke="#1e2535" stroke-width="1"/>
      <polygon points="${areaPts}" fill="url(#wg)"/>
      <polyline points="${points}" fill="none" stroke="#F97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${vals.map((v, i) => `
        <circle cx="${pad + i * xStep}" cy="${yScale(v)}" r="4" fill="#F97316"/>
        <text x="${pad + i * xStep}" y="${H - pad + 18}" fill="#4e5869" font-size="10" text-anchor="middle">
          ${new Date(weightData[i].measured_at).toLocaleDateString(undefined,{month:'short',day:'numeric'})}
        </text>
        <text x="${pad - 5}" y="${yScale(v) + 4}" fill="#4e5869" font-size="10" text-anchor="end">${v}</text>
      `).join('')}
    `;
  }

  function renderPBsTable() {
    const wrap = document.getElementById('pbs-table-wrap');
    if (!wrap) return;
    if (!allPBs.length) {
      wrap.innerHTML = '<div class="db-empty-state">No personal bests recorded yet.</div>';
      return;
    }
    wrap.innerHTML = `
      <table class="db-table">
        <thead>
          <tr><th>Exercise</th><th>Weight (kg)</th><th>Reps</th><th>Date</th></tr>
        </thead>
        <tbody>
          ${allPBs.map(pb => `
            <tr>
              <td>${escHtml(pb.exercise_name)}</td>
              <td>${pb.weight_kg ?? '–'}</td>
              <td>${pb.reps ?? '–'}</td>
              <td>${new Date(pb.achieved_at).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // Add PR form
  const addPRBtn    = document.getElementById('add-pr-btn');
  const addPRForm   = document.getElementById('add-pr-form');
  const prSaveBtn   = document.getElementById('pr-save-btn');
  const prCancelBtn = document.getElementById('pr-cancel-btn');

  addPRBtn?.addEventListener('click', () => { addPRForm.style.display = addPRForm.style.display === 'none' ? '' : 'none'; });
  prCancelBtn?.addEventListener('click', () => { addPRForm.style.display = 'none'; });
  prSaveBtn?.addEventListener('click', async () => {
    const exercise = document.getElementById('pr-exercise').value.trim();
    const weight   = parseFloat(document.getElementById('pr-weight').value) || null;
    const reps     = parseInt(document.getElementById('pr-reps').value) || null;
    if (!exercise) return;

    await upsertPersonalBest({
      user_id:       currentUser.id,
      exercise_name: exercise,
      weight_kg:     weight,
      reps:          reps,
      achieved_at:   new Date().toISOString(),
    });
    document.getElementById('pr-exercise').value = '';
    document.getElementById('pr-weight').value   = '';
    document.getElementById('pr-reps').value     = '';
    addPRForm.style.display = 'none';

    const { data: pbs } = await getPersonalBests(currentUser.id);
    allPBs = pbs || [];
    renderProgress();
    showToast('Personal best saved!');
  });

  // ── Body Stats ────────────────────────────────────
  function renderBodyStats() {
    const latest = allMeasurements[0];
    const s = id => document.getElementById(id);
    if (!latest) return;

    if (s('body-weight')) s('body-weight').textContent = (latest.weight_kg || '–') + ' kg';
    if (s('body-fat'))    s('body-fat').textContent    = (latest.body_fat_pct || '–') + (latest.body_fat_pct ? '%' : '');
    if (s('body-muscle')) s('body-muscle').textContent = (latest.muscle_mass_kg || '–') + (latest.muscle_mass_kg ? ' kg' : '');

    if (latest.weight_kg && latest.height_cm) {
      const bmi = (latest.weight_kg / ((latest.height_cm / 100) ** 2)).toFixed(1);
      if (s('body-bmi')) s('body-bmi').textContent = bmi;
    }

    renderMeasurementsTable();
  }

  function renderMeasurementsTable() {
    const wrap = document.getElementById('measurements-table-wrap');
    if (!wrap) return;
    if (!allMeasurements.length) {
      wrap.innerHTML = '<div class="db-empty-state">No measurements recorded yet.</div>';
      return;
    }
    wrap.innerHTML = `
      <table class="db-table">
        <thead>
          <tr><th>Date</th><th>Weight</th><th>Body Fat</th><th>Muscle</th><th>Chest</th><th>Waist</th><th>Hips</th></tr>
        </thead>
        <tbody>
          ${allMeasurements.map(m => `
            <tr>
              <td>${new Date(m.measured_at).toLocaleDateString()}</td>
              <td>${m.weight_kg ? m.weight_kg + ' kg' : '–'}</td>
              <td>${m.body_fat_pct ? m.body_fat_pct + '%' : '–'}</td>
              <td>${m.muscle_mass_kg ? m.muscle_mass_kg + ' kg' : '–'}</td>
              <td>${m.chest_cm || '–'}</td>
              <td>${m.waist_cm || '–'}</td>
              <td>${m.hips_cm || '–'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // Add measurement
  const addMeasurementBtn    = document.getElementById('add-measurement-btn');
  const measurementFormCard  = document.getElementById('measurement-form-card');
  const measurementSaveBtn   = document.getElementById('measurement-save-btn');
  const measurementCancelBtn = document.getElementById('measurement-cancel-btn');

  addMeasurementBtn?.addEventListener('click', () => {
    measurementFormCard.style.display = measurementFormCard.style.display === 'none' ? '' : 'none';
  });
  measurementCancelBtn?.addEventListener('click', () => { measurementFormCard.style.display = 'none'; });
  measurementSaveBtn?.addEventListener('click', async () => {
    const m = {
      user_id:         currentUser.id,
      weight_kg:       parseFloat(document.getElementById('m-weight').value)  || null,
      height_cm:       parseFloat(document.getElementById('m-height').value)  || null,
      body_fat_pct:    parseFloat(document.getElementById('m-bodyfat').value) || null,
      muscle_mass_kg:  parseFloat(document.getElementById('m-muscle').value)  || null,
      chest_cm:        parseFloat(document.getElementById('m-chest').value)   || null,
      waist_cm:        parseFloat(document.getElementById('m-waist').value)   || null,
      hips_cm:         parseFloat(document.getElementById('m-hips').value)    || null,
      arms_cm:         parseFloat(document.getElementById('m-arms').value)    || null,
      measured_at:     new Date().toISOString(),
    };
    const { error } = await addMeasurement(m);
    if (error) { document.getElementById('measurement-error').textContent = error.message; return; }

    document.getElementById('measurement-error').textContent = '';
    measurementFormCard.style.display = 'none';
    const { data: ms } = await getMeasurements(currentUser.id);
    allMeasurements = ms || [];
    renderBodyStats();
    renderWeightChart();
    showToast('Measurement saved!');
  });

  // ── Settings ──────────────────────────────────────
  function renderSettings() {
    if (!currentProfile) return;
    const s = id => document.getElementById(id);
    if (s('settings-fname'))  s('settings-fname').value  = currentProfile.first_name || '';
    if (s('settings-lname'))  s('settings-lname').value  = currentProfile.last_name  || '';
    if (s('settings-email'))  s('settings-email').value  = currentProfile.email      || currentUser?.email || '';
    if (s('settings-level'))  s('settings-level').value  = currentProfile.level      || 'beginner';
    if (s('settings-goal'))   s('settings-goal').value   = currentProfile.goal       || 'strength';
    if (s('settings-plan-name')) s('settings-plan-name').textContent = (currentProfile.plan || 'Free').charAt(0).toUpperCase() + (currentProfile.plan || 'free').slice(1);

    const name = [currentProfile.first_name, currentProfile.last_name].filter(Boolean).join(' ');
    if (s('settings-name-display'))  s('settings-name-display').textContent  = name || '–';
    if (s('settings-level-display')) s('settings-level-display').textContent = currentProfile.level || 'beginner';

    // Avatar initials
    const av = s('settings-avatar');
    if (av && name) {
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      av.textContent = initials;
      av.style.display = 'flex'; av.style.alignItems = 'center'; av.style.justifyContent = 'center';
      av.style.fontFamily = 'var(--font-display)'; av.style.fontWeight = '800';
      av.style.fontSize = '1.5rem'; av.style.color = '#000';
    }

    // Lang toggle in settings
    const settingsLangBtn = s('settings-lang-btn');
    const settingsLangLabel = s('settings-lang-label');
    if (settingsLangBtn && settingsLangLabel) {
      settingsLangLabel.textContent = localStorage.getItem('vfitness-lang') === 'fi' ? 'EN' : 'FI';
      settingsLangBtn.addEventListener('click', () => {
        const curr = localStorage.getItem('vfitness-lang') || 'en';
        const next = curr === 'en' ? 'fi' : 'en';
        localStorage.setItem('vfitness-lang', next);
        settingsLangLabel.textContent = next === 'fi' ? 'EN' : 'FI';
      });
    }
  }

  document.getElementById('settings-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const updated = {
      id:         currentUser.id,
      first_name: document.getElementById('settings-fname').value.trim(),
      last_name:  document.getElementById('settings-lname').value.trim(),
      level:      document.getElementById('settings-level').value,
      goal:       document.getElementById('settings-goal').value,
    };

    const { error } = await upsertProfile(updated);
    const successEl = document.getElementById('settings-success');
    const errorEl   = document.getElementById('settings-error');
    if (error) { errorEl.textContent = error.message; return; }

    errorEl.textContent = '';
    successEl.style.display = 'block';
    setTimeout(() => { successEl.style.display = 'none'; }, 2500);

    currentProfile = { ...currentProfile, ...updated };
    renderProfile(currentProfile, currentUser);
    renderSettings();
  });

  // Units toggle
  document.querySelectorAll('.units-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.units-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ── Toast notification ────────────────────────────
  function showToast(msg, type = 'success') {
    const existing = document.getElementById('db-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'db-toast';
    const color = type === 'success' ? '#22C55E' : type === 'error' ? '#ef4444' : '#F97316';
    toast.style.cssText = `
      position:fixed; bottom:2rem; right:2rem; z-index:999;
      background:var(--ink-2); border:1px solid ${color}40;
      border-left:3px solid ${color}; border-radius:var(--r-md);
      padding:0.85rem 1.25rem; color:var(--text);
      font-family:var(--font-body); font-size:0.875rem; font-weight:500;
      box-shadow:var(--shadow-3); display:flex; align-items:center; gap:0.6rem;
      animation:toastIn 0.25s ease; max-width:280px;
    `;
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5">
        <polyline points="20,6 9,17 4,12"/>
      </svg>${escHtml(msg)}`;

    if (!document.getElementById('db-toast-style')) {
      const s = document.createElement('style');
      s.id = 'db-toast-style';
      s.textContent = '@keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}';
      document.head.appendChild(s);
    }
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ── Utility ───────────────────────────────────────
  function escHtml(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Program Detail Modal ──────────────────────────

  // Static guest preview data matching seed in schema-programs-v2.sql
  const PROGRAM_DETAIL_DATA = {
    'Power Foundation': {
      category: 'strength', level: 'All Levels', duration_weeks: 12, sessions_per_week: 4,
      color: '#F97316',
      sessions: [
        { day_number: 1, name: 'Lower Body Strength', focus: 'legs', estimated_duration_minutes: 65, estimated_calories: 430, notes: 'Focus on depth and bracing. Add 2.5 kg/week.',
          program_exercises: [
            { order_index:1, exercise_name:'Warm-up Squat',       equipment:'Barbell',   sets:3, reps:'5 @50%',  rest_seconds:60,  calories_per_set:6,  notes:'Light weight, perfect form' },
            { order_index:2, exercise_name:'Back Squat',          equipment:'Barbell',   sets:4, reps:'5 @80%',  rest_seconds:180, calories_per_set:14, notes:'3-sec descent, drive through heels' },
            { order_index:3, exercise_name:'Romanian Deadlift',   equipment:'Barbell',   sets:3, reps:'8',       rest_seconds:120, calories_per_set:10, notes:'Hinge at hips, slight knee bend' },
            { order_index:4, exercise_name:'Leg Press',           equipment:'Machine',   sets:3, reps:'10',      rest_seconds:90,  calories_per_set:8,  notes:'Full range of motion' },
            { order_index:5, exercise_name:'Walking Lunge',       equipment:'Dumbbells', sets:3, reps:'12 each', rest_seconds:75,  calories_per_set:9,  notes:'Keep torso upright' },
            { order_index:6, exercise_name:'Standing Calf Raise', equipment:'Machine',   sets:4, reps:'15',      rest_seconds:60,  calories_per_set:4,  notes:'Pause at top' }
          ]
        },
        { day_number: 2, name: 'Upper Body Push', focus: 'push', estimated_duration_minutes: 60, estimated_calories: 390, notes: 'Shoulder warm-up essential before heavy pressing.',
          program_exercises: [
            { order_index:1, exercise_name:'Bench Press',            equipment:'Barbell',       sets:4, reps:'5 @80%', rest_seconds:180, calories_per_set:12, notes:'Retract scapula, controlled descent' },
            { order_index:2, exercise_name:'Overhead Press',         equipment:'Barbell',       sets:3, reps:'8',      rest_seconds:120, calories_per_set:10, notes:'Brace core, full lockout' },
            { order_index:3, exercise_name:'Incline Dumbbell Press', equipment:'Dumbbells',     sets:3, reps:'10',     rest_seconds:90,  calories_per_set:8,  notes:'30–45° incline' },
            { order_index:4, exercise_name:'Cable Fly',              equipment:'Cable Machine', sets:3, reps:'12',     rest_seconds:60,  calories_per_set:6,  notes:'Full stretch at bottom' },
            { order_index:5, exercise_name:'Tricep Pushdown',        equipment:'Cable Machine', sets:3, reps:'12',     rest_seconds:60,  calories_per_set:5,  notes:'Elbows fixed, squeeze at bottom' },
            { order_index:6, exercise_name:'Lateral Raise',          equipment:'Dumbbells',     sets:3, reps:'15',     rest_seconds:45,  calories_per_set:4,  notes:'Slight forward lean' }
          ]
        },
        { day_number: 4, name: 'Upper Body Pull & Deadlift', focus: 'pull', estimated_duration_minutes: 70, estimated_calories: 470, notes: 'Heaviest day. Full neural recovery needed.',
          program_exercises: [
            { order_index:1, exercise_name:'Deadlift',         equipment:'Barbell',       sets:4, reps:'5 @85%',   rest_seconds:180, calories_per_set:18, notes:'Brace and pull from hips' },
            { order_index:2, exercise_name:'Barbell Row',      equipment:'Barbell',       sets:4, reps:'8',        rest_seconds:120, calories_per_set:12, notes:'Pull to lower chest' },
            { order_index:3, exercise_name:'Pull-Up',          equipment:'Pull-up Bar',   sets:3, reps:'Max reps', rest_seconds:90,  calories_per_set:10, notes:'Full hang to chin over bar' },
            { order_index:4, exercise_name:'Seated Cable Row', equipment:'Cable Machine', sets:3, reps:'12',       rest_seconds:75,  calories_per_set:7,  notes:'Squeeze shoulder blades' },
            { order_index:5, exercise_name:'Face Pull',        equipment:'Cable Machine', sets:3, reps:'15',       rest_seconds:60,  calories_per_set:5,  notes:'Protects shoulder health' },
            { order_index:6, exercise_name:'Barbell Curl',     equipment:'Barbell',       sets:3, reps:'10',       rest_seconds:60,  calories_per_set:6,  notes:'No swinging' }
          ]
        },
        { day_number: 5, name: 'Full Body Accessory', focus: 'full_body', estimated_duration_minutes: 55, estimated_calories: 350, notes: 'Address weak points, build work capacity.',
          program_exercises: [
            { order_index:1, exercise_name:'Front Squat',       equipment:'Barbell',   sets:3, reps:'5 @70%',  rest_seconds:120, calories_per_set:10, notes:'Builds quad strength for back squat' },
            { order_index:2, exercise_name:'DB Shoulder Press', equipment:'Dumbbells', sets:3, reps:'10',      rest_seconds:90,  calories_per_set:8,  notes:'Seated, controlled' },
            { order_index:3, exercise_name:'Dumbbell Row',      equipment:'Dumbbells', sets:3, reps:'12 each', rest_seconds:75,  calories_per_set:7,  notes:'Neutral spine' },
            { order_index:4, exercise_name:'Leg Curl',          equipment:'Machine',   sets:3, reps:'12',      rest_seconds:60,  calories_per_set:6,  notes:'Full range' },
            { order_index:5, exercise_name:'Ab Wheel Rollout',  equipment:'Ab Wheel',  sets:3, reps:'10',      rest_seconds:60,  calories_per_set:6,  notes:'Brace core throughout' },
            { order_index:6, exercise_name:'Farmer Walk',       equipment:'Dumbbells', sets:3, reps:'30m',     rest_seconds:60,  calories_per_set:8,  notes:'Maximize grip strength' }
          ]
        }
      ]
    },
    'Endurance Engine': {
      category: 'cardio', level: 'Beginner', duration_weeks: 8, sessions_per_week: 5,
      color: '#22C55E',
      sessions: [
        { day_number: 1, name: 'HIIT Sprint Session', focus: 'hiit', estimated_duration_minutes: 35, estimated_calories: 380, notes: 'Warm up 5 min before starting intervals.',
          program_exercises: [
            { order_index:1, exercise_name:'Jog Warm-Up',      equipment:'Treadmill / Outdoor', sets:1, reps:'5 min',                   rest_seconds:0,  calories_per_set:40, notes:'Easy pace, Zone 1' },
            { order_index:2, exercise_name:'Sprint Intervals', equipment:'Treadmill / Outdoor', sets:10,reps:'30 sec on / 30 sec off',  rest_seconds:0,  calories_per_set:20, notes:'90% max effort sprints' },
            { order_index:3, exercise_name:'Jog Cool-Down',    equipment:'Treadmill / Outdoor', sets:1, reps:'5 min',                   rest_seconds:0,  calories_per_set:40, notes:'Zone 1, lower HR' }
          ]
        },
        { day_number: 2, name: 'Steady State Run', focus: 'cardio', estimated_duration_minutes: 35, estimated_calories: 320, notes: 'Conversational pace throughout. Stay in Zone 2.',
          program_exercises: [
            { order_index:1, exercise_name:'Easy Run Zone 2', equipment:'Treadmill / Outdoor', sets:1, reps:'30 min', rest_seconds:0, calories_per_set:280, notes:'Conversational pace, 65–75% max HR' },
            { order_index:2, exercise_name:'Stretching',      equipment:'No Equipment',        sets:1, reps:'5 min',  rest_seconds:0, calories_per_set:0,   notes:'Focus on hip flexors and calves' }
          ]
        },
        { day_number: 3, name: 'Threshold Intervals', focus: 'hiit', estimated_duration_minutes: 45, estimated_calories: 460, notes: 'Hard but sustainable effort. Should not be gasping.',
          program_exercises: [
            { order_index:1, exercise_name:'Warm-Up Jog',   equipment:'Treadmill / Outdoor', sets:1, reps:'5 min',       rest_seconds:0,   calories_per_set:40, notes:'Easy pace' },
            { order_index:2, exercise_name:'Threshold Run', equipment:'Treadmill / Outdoor', sets:5, reps:'3 min @85%',  rest_seconds:120, calories_per_set:64, notes:'85% max HR, 2 min rest between reps' },
            { order_index:3, exercise_name:'Cool-Down Jog', equipment:'Treadmill / Outdoor', sets:1, reps:'5 min',       rest_seconds:0,   calories_per_set:40, notes:'Easy pace' }
          ]
        },
        { day_number: 4, name: 'Active Recovery', focus: 'mobility', estimated_duration_minutes: 30, estimated_calories: 150, notes: 'Low intensity only. Let body recover.',
          program_exercises: [
            { order_index:1, exercise_name:'Easy Walk',    equipment:'Outdoor',     sets:1, reps:'20 min', rest_seconds:0, calories_per_set:110, notes:'Flat ground, easy pace' },
            { order_index:2, exercise_name:'Foam Rolling', equipment:'Foam Roller', sets:1, reps:'10 min', rest_seconds:0, calories_per_set:0,   notes:'Quads, hamstrings, IT band, calves' }
          ]
        },
        { day_number: 5, name: 'Long Run', focus: 'cardio', estimated_duration_minutes: 50, estimated_calories: 520, notes: 'Longest run of the week. Prioritise completion over pace.',
          program_exercises: [
            { order_index:1, exercise_name:'Easy Long Run Zone 2', equipment:'Treadmill / Outdoor', sets:1, reps:'45 min', rest_seconds:0, calories_per_set:480, notes:'Steady Zone 2, hydrate every 15 min' },
            { order_index:2, exercise_name:'Stretching',           equipment:'No Equipment',        sets:1, reps:'5 min',  rest_seconds:0, calories_per_set:0,   notes:'Full lower body stretch' }
          ]
        }
      ]
    },
    'Sculpt & Define': {
      category: 'body_composition', level: 'Intermediate', duration_weeks: 16, sessions_per_week: 5,
      color: '#8B5CF6',
      sessions: [
        { day_number: 1, name: 'Chest & Shoulders', focus: 'push', estimated_duration_minutes: 55, estimated_calories: 380, notes: 'Superset lat raises with pressing for time efficiency.',
          program_exercises: [
            { order_index:1, exercise_name:'Dumbbell Bench Press',     equipment:'Dumbbells',    sets:4, reps:'12', rest_seconds:75, calories_per_set:10, notes:'Full range of motion, elbows at 45°' },
            { order_index:2, exercise_name:'Cable Crossover',          equipment:'Cable Machine', sets:3, reps:'15', rest_seconds:60, calories_per_set:6,  notes:'Squeeze at centre, full stretch at sides' },
            { order_index:3, exercise_name:'Seated DB Shoulder Press', equipment:'Dumbbells',    sets:3, reps:'12', rest_seconds:75, calories_per_set:8,  notes:'Controlled, avoid arching lower back' },
            { order_index:4, exercise_name:'Arnold Press',             equipment:'Dumbbells',    sets:3, reps:'12', rest_seconds:60, calories_per_set:7,  notes:'Rotate palms throughout movement' },
            { order_index:5, exercise_name:'Cable Lateral Raise',      equipment:'Cable Machine', sets:3, reps:'15', rest_seconds:45, calories_per_set:5,  notes:'Constant tension from cable' },
            { order_index:6, exercise_name:'Push-Up',                  equipment:'Bodyweight',   sets:3, reps:'15', rest_seconds:45, calories_per_set:4,  notes:'Perfect plank position throughout' }
          ]
        },
        { day_number: 2, name: 'Back & Biceps', focus: 'pull', estimated_duration_minutes: 55, estimated_calories: 370, notes: 'Initiate all pulls with the back, not the arms.',
          program_exercises: [
            { order_index:1, exercise_name:'Lat Pulldown',       equipment:'Cable Machine', sets:4, reps:'12',      rest_seconds:75, calories_per_set:9, notes:'Full stretch at top, squeeze at bottom' },
            { order_index:2, exercise_name:'Cable Row',          equipment:'Cable Machine', sets:4, reps:'12',      rest_seconds:75, calories_per_set:8, notes:'Neutral grip, drive elbows back' },
            { order_index:3, exercise_name:'Single Arm DB Row',  equipment:'Dumbbells',     sets:3, reps:'12 each', rest_seconds:60, calories_per_set:7, notes:'Brace on bench, retract scapula' },
            { order_index:4, exercise_name:'Face Pull',          equipment:'Cable Machine', sets:3, reps:'15',      rest_seconds:45, calories_per_set:5, notes:'External rotation at the end' },
            { order_index:5, exercise_name:'Dumbbell Curl',      equipment:'Dumbbells',     sets:3, reps:'12',      rest_seconds:60, calories_per_set:6, notes:'Controlled on the way down' },
            { order_index:6, exercise_name:'Hammer Curl',        equipment:'Dumbbells',     sets:3, reps:'12',      rest_seconds:45, calories_per_set:5, notes:'Targets brachialis, neutral grip' }
          ]
        },
        { day_number: 3, name: 'Legs & Glutes', focus: 'legs', estimated_duration_minutes: 60, estimated_calories: 430, notes: 'Focus on glute activation before compound lifts.',
          program_exercises: [
            { order_index:1, exercise_name:'Leg Press',          equipment:'Machine',           sets:4, reps:'12', rest_seconds:90, calories_per_set:11, notes:'Drive through heels, full range' },
            { order_index:2, exercise_name:'Romanian Deadlift',  equipment:'Barbell',           sets:3, reps:'12', rest_seconds:90, calories_per_set:10, notes:'Feel hamstring stretch at bottom' },
            { order_index:3, exercise_name:'Hip Thrust',         equipment:'Barbell / Machine', sets:4, reps:'15', rest_seconds:75, calories_per_set:8,  notes:'Full hip extension, pause 1 sec at top' },
            { order_index:4, exercise_name:'Leg Curl',           equipment:'Machine',           sets:3, reps:'15', rest_seconds:60, calories_per_set:6,  notes:'Both concentric and eccentric controlled' },
            { order_index:5, exercise_name:'Leg Extension',      equipment:'Machine',           sets:3, reps:'15', rest_seconds:60, calories_per_set:6,  notes:'Pause at full extension' },
            { order_index:6, exercise_name:'Seated Calf Raise',  equipment:'Machine',           sets:4, reps:'20', rest_seconds:45, calories_per_set:3,  notes:'Full stretch at bottom, hold at top' }
          ]
        },
        { day_number: 4, name: 'Arms & Core', focus: 'arms', estimated_duration_minutes: 50, estimated_calories: 310, notes: 'Keep rest periods short to maximise pump.',
          program_exercises: [
            { order_index:1, exercise_name:'Tricep Dips',    equipment:'Bodyweight / Bench', sets:3, reps:'12', rest_seconds:75, calories_per_set:7, notes:'Lean forward to emphasise triceps' },
            { order_index:2, exercise_name:'Skull Crushers', equipment:'Barbell',           sets:3, reps:'12', rest_seconds:75, calories_per_set:6, notes:'Lower to forehead, elbows in' },
            { order_index:3, exercise_name:'Cable Pushdown', equipment:'Cable Machine',     sets:3, reps:'15', rest_seconds:60, calories_per_set:5, notes:'Full extension, squeeze at bottom' },
            { order_index:4, exercise_name:'Preacher Curl',  equipment:'Machine / Barbell', sets:3, reps:'12', rest_seconds:60, calories_per_set:6, notes:'No cheating, strict form' },
            { order_index:5, exercise_name:'Plank',          equipment:'Bodyweight',        sets:3, reps:'60s', rest_seconds:45, calories_per_set:4, notes:'Posterior pelvic tilt, brace hard' },
            { order_index:6, exercise_name:'Cable Crunch',   equipment:'Cable Machine',     sets:3, reps:'15', rest_seconds:45, calories_per_set:4, notes:'Round spine, contract abs' }
          ]
        },
        { day_number: 5, name: 'Full Body Circuit', focus: 'full_body', estimated_duration_minutes: 55, estimated_calories: 420, notes: 'Move between exercises with minimal rest. High intensity.',
          program_exercises: [
            { order_index:1, exercise_name:'Goblet Squat',     equipment:'Kettlebell / Dumbbell', sets:3, reps:'15',      rest_seconds:60, calories_per_set:8, notes:'Elbows inside knees at bottom' },
            { order_index:2, exercise_name:'DB Deadlift',      equipment:'Dumbbells',             sets:3, reps:'12',      rest_seconds:75, calories_per_set:9, notes:'Flat back, drive hips forward' },
            { order_index:3, exercise_name:'Push-Up',          equipment:'Bodyweight',            sets:3, reps:'15',      rest_seconds:45, calories_per_set:4, notes:'Full range, chest touches ground' },
            { order_index:4, exercise_name:'Dumbbell Row',     equipment:'Dumbbells',             sets:3, reps:'12 each', rest_seconds:60, calories_per_set:7, notes:'Alternate arms each set' },
            { order_index:5, exercise_name:'Dumbbell Lunge',   equipment:'Dumbbells',             sets:3, reps:'12 each', rest_seconds:60, calories_per_set:8, notes:'Step forward, back knee near floor' },
            { order_index:6, exercise_name:'Mountain Climber', equipment:'Bodyweight',            sets:3, reps:'30s',     rest_seconds:45, calories_per_set:5, notes:'Fast pace, hips level' }
          ]
        }
      ]
    },
    'Flex & Flow': {
      category: 'mobility', level: 'All Levels', duration_weeks: null, sessions_per_week: 7,
      color: '#06B6D4',
      sessions: [
        { day_number: 1, name: 'Morning Mobility', focus: 'mobility', estimated_duration_minutes: 25, estimated_calories: 100, notes: 'Best done first thing in the morning on empty stomach.',
          program_exercises: [
            { order_index:1, exercise_name:"Hip Flexor Stretch",       equipment:'No Equipment', sets:2, reps:'60s each', rest_seconds:15, calories_per_set:5, notes:'Lunge position, press hips forward' },
            { order_index:2, exercise_name:'Cat-Cow',                  equipment:'No Equipment', sets:2, reps:'10',       rest_seconds:10, calories_per_set:3, notes:'Slow and deliberate, full spine' },
            { order_index:3, exercise_name:"World's Greatest Stretch", equipment:'No Equipment', sets:2, reps:'5 each',   rest_seconds:15, calories_per_set:4, notes:'Thoracic rotation + hip opener' },
            { order_index:4, exercise_name:'T-Spine Rotation',         equipment:'No Equipment', sets:2, reps:'10 each',  rest_seconds:10, calories_per_set:3, notes:'Keep hips square' },
            { order_index:5, exercise_name:'Deep Squat Hold',          equipment:'No Equipment', sets:2, reps:'30s',      rest_seconds:15, calories_per_set:3, notes:'Use doorframe if needed' },
            { order_index:6, exercise_name:'Chest Opener',             equipment:'No Equipment', sets:2, reps:'30s',      rest_seconds:10, calories_per_set:2, notes:'Clasp hands behind back, lift chest' }
          ]
        },
        { day_number: 2, name: 'Hip & Lower Back', focus: 'mobility', estimated_duration_minutes: 30, estimated_calories: 115, notes: 'Focus on controlled breathing in each stretch.',
          program_exercises: [
            { order_index:1, exercise_name:'Piriformis Stretch', equipment:'No Equipment', sets:2, reps:'60s each', rest_seconds:15, calories_per_set:4, notes:'Seated or lying — both work' },
            { order_index:2, exercise_name:'Figure Four',        equipment:'No Equipment', sets:2, reps:'60s each', rest_seconds:15, calories_per_set:4, notes:'Pull shin toward chest gently' },
            { order_index:3, exercise_name:'Low Lunge Twist',    equipment:'No Equipment', sets:2, reps:'30s each', rest_seconds:10, calories_per_set:3, notes:'Back knee on floor, reach up' },
            { order_index:4, exercise_name:'Supine Twist',       equipment:'No Equipment', sets:2, reps:'60s each', rest_seconds:10, calories_per_set:3, notes:'Keep shoulders flat on mat' },
            { order_index:5, exercise_name:"Child's Pose",       equipment:'No Equipment', sets:2, reps:'60s',      rest_seconds:10, calories_per_set:2, notes:'Arms extended forward' },
            { order_index:6, exercise_name:'Downward Dog',       equipment:'No Equipment', sets:2, reps:'30s',      rest_seconds:10, calories_per_set:3, notes:'Pedal heels alternately' }
          ]
        },
        { day_number: 3, name: 'Shoulder & Upper Body', focus: 'mobility', estimated_duration_minutes: 25, estimated_calories: 95, notes: 'Ideal for desk workers and overhead athletes.',
          program_exercises: [
            { order_index:1, exercise_name:'Doorway Chest Stretch',       equipment:'No Equipment', sets:2, reps:'30s each', rest_seconds:10, calories_per_set:2, notes:'Step through doorframe, arms at 90°' },
            { order_index:2, exercise_name:'Shoulder Circles',            equipment:'No Equipment', sets:2, reps:'10 each',  rest_seconds:10, calories_per_set:3, notes:'Big controlled circles, both directions' },
            { order_index:3, exercise_name:'Cross Body Shoulder Stretch', equipment:'No Equipment', sets:2, reps:'30s each', rest_seconds:10, calories_per_set:2, notes:'Pull elbow across chest' },
            { order_index:4, exercise_name:'Thread the Needle',           equipment:'No Equipment', sets:2, reps:'10 each',  rest_seconds:10, calories_per_set:3, notes:'On hands and knees, reach under' },
            { order_index:5, exercise_name:'Wrist Circles',               equipment:'No Equipment', sets:2, reps:'10 each',  rest_seconds:10, calories_per_set:2, notes:'Both directions, full range' },
            { order_index:6, exercise_name:'Eagle Arms',                  equipment:'No Equipment', sets:2, reps:'30s',      rest_seconds:10, calories_per_set:2, notes:'Wrap arms, lift elbows' }
          ]
        },
        { day_number: 4, name: 'Full Body Flow', focus: 'mobility', estimated_duration_minutes: 30, estimated_calories: 130, notes: "Connect breath to movement. Hold each pose with intention.",
          program_exercises: [
            { order_index:1, exercise_name:'Sun Salutation A',         equipment:'No Equipment', sets:3, reps:'5 rounds',   rest_seconds:30, calories_per_set:10, notes:'Flow at your own pace' },
            { order_index:2, exercise_name:'Warrior I Flow',           equipment:'No Equipment', sets:2, reps:'60s each',   rest_seconds:15, calories_per_set:5,  notes:'Press back heel firmly down' },
            { order_index:3, exercise_name:'Triangle Pose',            equipment:'No Equipment', sets:2, reps:'30s each',   rest_seconds:10, calories_per_set:3,  notes:"Reach long, don't compress side" },
            { order_index:4, exercise_name:'Pigeon Pose',              equipment:'No Equipment', sets:2, reps:'60s each',   rest_seconds:15, calories_per_set:4,  notes:'Deep hip opener, breathe into tightness' },
            { order_index:5, exercise_name:'Seated Forward Fold',      equipment:'No Equipment', sets:2, reps:'60s',        rest_seconds:10, calories_per_set:3,  notes:'Hinge at hips, spine long' },
            { order_index:6, exercise_name:'Supine Hamstring Stretch', equipment:'No Equipment', sets:2, reps:'30s each',   rest_seconds:10, calories_per_set:2,  notes:'Use strap or towel if needed' }
          ]
        },
        { day_number: 5, name: 'Rest or Light Walk', focus: 'recovery', estimated_duration_minutes: 20, estimated_calories: 80, notes: 'Optional. Movement without pressure — listen to your body.',
          program_exercises: [
            { order_index:1, exercise_name:'Easy Walk', equipment:'Outdoor', sets:1, reps:'20 min', rest_seconds:0, calories_per_set:80, notes:'Flat ground, easy conversational pace' }
          ]
        },
        { day_number: 6, name: 'Hamstrings & Calves', focus: 'mobility', estimated_duration_minutes: 25, estimated_calories: 100, notes: 'Common tight spots for runners and lifters.',
          program_exercises: [
            { order_index:1, exercise_name:'Standing Hamstring Stretch',  equipment:'No Equipment', sets:2, reps:'30s each', rest_seconds:10, calories_per_set:3, notes:'Hinge forward, soft knee' },
            { order_index:2, exercise_name:'Seated Hamstring Stretch',    equipment:'No Equipment', sets:2, reps:'60s each', rest_seconds:10, calories_per_set:3, notes:'Reach for toes, back flat' },
            { order_index:3, exercise_name:'Standing Calf Stretch',       equipment:'No Equipment', sets:2, reps:'30s each', rest_seconds:10, calories_per_set:2, notes:'Step back, heel on floor' },
            { order_index:4, exercise_name:'Downward Dog to Calf Raise',  equipment:'No Equipment', sets:2, reps:'10 reps',  rest_seconds:15, calories_per_set:3, notes:'Rise onto toes from down dog' },
            { order_index:5, exercise_name:'Seated Toe Reach',            equipment:'No Equipment', sets:2, reps:'30s',      rest_seconds:10, calories_per_set:2, notes:'Both legs extended, reach forward' }
          ]
        },
        { day_number: 7, name: 'Full Body Recovery', focus: 'recovery', estimated_duration_minutes: 30, estimated_calories: 110, notes: 'Parasympathetic reset. No intensity, full body scan.',
          program_exercises: [
            { order_index:1, exercise_name:'Foam Rolling',     equipment:'Foam Roller', sets:1, reps:'15 min', rest_seconds:0, calories_per_set:60, notes:'Full body: quads, IT band, upper back, lats' },
            { order_index:2, exercise_name:'Light Stretching', equipment:'No Equipment',sets:1, reps:'15 min', rest_seconds:0, calories_per_set:50, notes:'Hold each stretch 30–60 s, no bouncing' }
          ]
        }
      ]
    }
  };

  const PROGRAM_DETAIL_MODAL = document.getElementById('program-detail-modal');
  const PROGRAM_DETAIL_CONTENT = document.getElementById('program-detail-content');
  const PROGRAM_DETAIL_CLOSE = document.getElementById('program-detail-close');

  if (PROGRAM_DETAIL_CLOSE) {
    PROGRAM_DETAIL_CLOSE.addEventListener('click', () => {
      PROGRAM_DETAIL_MODAL.style.display = 'none';
      document.body.style.overflow = '';
    });
  }

  if (PROGRAM_DETAIL_MODAL) {
    PROGRAM_DETAIL_MODAL.addEventListener('click', e => {
      if (e.target === PROGRAM_DETAIL_MODAL) {
        PROGRAM_DETAIL_MODAL.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }

  function renderProgramDetailModal(programName, sessions, programMeta) {
    const color = programMeta.color || '#F97316';
    const categoryLabel = (programMeta.category || 'program').replace('_', ' ');
    const durationLabel = programMeta.duration_weeks
      ? programMeta.duration_weeks + ' weeks'
      : 'Ongoing';
    const frequencyLabel = programMeta.sessions_per_week === 7
      ? 'Daily'
      : (programMeta.sessions_per_week || '–') + 'x / week';

    const isGuest = !(currentUser && currentUser.id !== 'guest');

    // Build tab buttons
    const tabButtons = sessions.map((s, i) => `
      <button
        class="pd-session-tab${i === 0 ? ' active' : ''}"
        data-tab-idx="${i}"
        style="${i === 0 ? `border-color:${color};color:${color};background:${color}18` : ''}"
        aria-selected="${i === 0}"
      >
        <span class="pd-tab-day">Day ${s.day_number}</span>
        <span class="pd-tab-name">${escHtml(s.name)}</span>
      </button>
    `).join('');

    // Build each session panel
    const sessionPanels = sessions.map((s, i) => {
      const exercises = (s.program_exercises || [])
        .slice()
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

      const exRows = exercises.map((ex, idx) => {
        const setsLabel = ex.sets && ex.reps ? `${ex.sets} × ${ex.reps}` : ex.reps || ex.sets || '–';
        const restLabel = ex.rest_seconds > 0 ? `${ex.rest_seconds}s` : '–';
        const totalCal  = (ex.calories_per_set || 0) * (ex.sets || 1);
        return `
          <div class="pd-exercise-row">
            <div class="pd-ex-num">${idx + 1}</div>
            <div class="pd-ex-info">
              <div class="pd-ex-name">${escHtml(ex.exercise_name)}</div>
              <div class="pd-ex-equip">${escHtml(ex.equipment || '–')}</div>
              ${ex.notes ? `<div class="pd-ex-note">${escHtml(ex.notes)}</div>` : ''}
            </div>
            <div class="pd-ex-sets">${escHtml(setsLabel)}</div>
            <div class="pd-ex-rest">${restLabel} rest</div>
            <div class="pd-ex-cal">${totalCal > 0 ? '~' + totalCal + ' cal' : '–'}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="pd-session-panel${i === 0 ? ' active' : ''}" data-panel-idx="${i}">
          <div class="pd-session-header">
            <div>
              <div class="pd-session-focus" style="color:${color}">${escHtml((s.focus || '').replace('_',' '))}</div>
              <h4 class="pd-session-title">${escHtml(s.name)}</h4>
              ${s.notes ? `<p class="pd-session-notes">${escHtml(s.notes)}</p>` : ''}
            </div>
            <div class="pd-session-stats">
              <div class="pd-session-stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                ${s.estimated_duration_minutes || '–'} min
              </div>
              <div class="pd-session-stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                ~${s.estimated_calories || '–'} cal
              </div>
            </div>
          </div>

          <div class="pd-exercise-table">
            <div class="pd-exercise-header">
              <div class="pd-ex-num">#</div>
              <div class="pd-ex-info">Exercise</div>
              <div class="pd-ex-sets">Sets × Reps</div>
              <div class="pd-ex-rest">Rest</div>
              <div class="pd-ex-cal">Est. Cal</div>
            </div>
            ${exRows}
          </div>
        </div>
      `;
    }).join('');

    const startBtn = isGuest
      ? `<button class="btn btn-primary" onclick="window.openAuthModal('signup')">Sign Up to Start This Program</button>`
      : `<button class="btn btn-primary" onclick="window.enrollProgram('${escHtml(programName)}');document.getElementById('program-detail-modal').style.display='none';document.body.style.overflow=''">Start This Program</button>`;

    PROGRAM_DETAIL_CONTENT.innerHTML = `
      <div class="pd-header" style="background: linear-gradient(135deg, ${color}22 0%, transparent 100%); border-bottom: 1px solid ${color}33">
        <div class="pd-tag" style="color:${color};border-color:${color}44">${escHtml(categoryLabel)}</div>
        <h2 class="pd-title">${escHtml(programName)}</h2>
        <div class="pd-stats">
          <span class="pd-stat-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
            ${durationLabel}
          </span>
          <span class="pd-stat-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 20V10M12 20V4M18 20V14"/></svg>
            ${frequencyLabel}
          </span>
          <span class="pd-stat-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            ${escHtml(programMeta.level || 'All Levels')}
          </span>
        </div>
      </div>

      <div class="pd-body">
        <h3 class="pd-section-title">Week 1 Schedule</h3>
        <div class="pd-sessions-tabs" role="tablist" aria-label="Training days">
          ${tabButtons}
        </div>
        <div class="pd-sessions-content">
          ${sessionPanels}
        </div>
        <div class="pd-footer">
          ${startBtn}
          ${isGuest ? `<p class="pd-guest-note">Preview only — create a free account to save progress and track all ${sessions.length} sessions</p>` : ''}
        </div>
      </div>
    `;

    // Tab switching logic
    const tabs   = PROGRAM_DETAIL_CONTENT.querySelectorAll('.pd-session-tab');
    const panels = PROGRAM_DETAIL_CONTENT.querySelectorAll('.pd-session-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const idx = parseInt(tab.dataset.tabIdx, 10);
        tabs.forEach((t, i) => {
          const isActive = i === idx;
          t.classList.toggle('active', isActive);
          t.setAttribute('aria-selected', isActive);
          if (isActive) {
            t.style.borderColor = color;
            t.style.color       = color;
            t.style.background  = color + '18';
          } else {
            t.style.borderColor = '';
            t.style.color       = '';
            t.style.background  = '';
          }
        });
        panels.forEach((p, i) => p.classList.toggle('active', i === idx));
      });
    });
  }

  window.openProgramDetail = async function(programName) {
    if (!PROGRAM_DETAIL_MODAL) return;
    // Decode HTML entities that may be passed from onclick attributes
    const name = programName.replace(/&amp;/g, '&');

    PROGRAM_DETAIL_MODAL.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Show loading state
    PROGRAM_DETAIL_CONTENT.innerHTML = `
      <div class="pd-loading">
        <div class="pd-spinner"></div>
        <p>Loading program...</p>
      </div>
    `;

    const staticMeta = PROGRAM_DETAIL_DATA[name];
    if (!staticMeta) {
      PROGRAM_DETAIL_CONTENT.innerHTML = `<div class="pd-loading"><p style="color:var(--text-2)">Program not found.</p></div>`;
      return;
    }

    // Try fetching live data from Supabase if user is authenticated
    const isGuestMode = window.isGuest && window.isGuest();
    let sessions = null;

    if (!isGuestMode) {
      try {
        const session = await getSession().catch(() => null);
        if (session) {
          const { data: prog } = await db.from('programs').select('id').eq('name', name).single();
          if (prog) {
            const { data } = await getProgramSessions(prog.id);
            if (data && data.length > 0) sessions = data;
          }
        }
      } catch (e) {
        console.warn('[openProgramDetail] Supabase fetch failed, using static data:', e);
      }
    }

    // Fall back to static data
    if (!sessions) sessions = staticMeta.sessions;

    renderProgramDetailModal(name, sessions, staticMeta);
  };

})();
