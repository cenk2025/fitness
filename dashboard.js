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
      const session = await getSession();
      if (!session) { window.openAuthModal('login'); return; }
      currentUser = session.user;
    } else {
      currentUser = { id: 'guest', email: 'guest@vfitness.app' };
    }

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    await loadAll();
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

      renderProfile(GUEST_PROFILE, currentUser);
      renderOverview(7);        // 7-day demo streak
      renderWorkoutsList();
      renderProgress();
      renderBodyStats();
      renderNutrition(GUEST_MEALS);
      renderSettings();
      showGuestBanner();
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

    // Today's nutrition
    const todayDate = new Date().toISOString().slice(0, 10);
    const { data: nutrition } = await getNutritionLogs(uid, todayDate);
    renderNutrition(nutrition || []);
  }

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

    document.getElementById('log-exercise').value  = '';
    document.getElementById('log-sets').value      = '';
    document.getElementById('log-reps').value      = '';
    document.getElementById('log-weight').value    = '';
    document.getElementById('log-duration').value  = '';
    document.getElementById('log-notes').value     = '';
    document.getElementById('log-error').textContent = '';
    logWorkoutForm.style.display = 'none';

    // Reload
    const { data: logs } = await getWorkoutLogs(currentUser.id, 50);
    allWorkoutLogs = logs || [];
    renderWorkoutsList();
    renderRecentWorkouts('recent-workouts-list', 5);
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

    // Reset form
    e.target.reset();
    const today = new Date().toISOString().slice(0, 10);
    const { data: nutrition } = await getNutritionLogs(currentUser.id, today);
    renderNutrition(nutrition || []);
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

  // ── Utility ───────────────────────────────────────
  function escHtml(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();
