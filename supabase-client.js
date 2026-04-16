/* ═══════════════════════════════════════════════════
   V FITNESS — Supabase Client Singleton
═══════════════════════════════════════════════════ */

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth helpers ──────────────────────────────────
async function getSession() {
  const { data } = await db.auth.getSession();
  return data.session;
}

async function getUser() {
  const { data } = await db.auth.getUser();
  return data.user;
}

async function getProfile(userId) {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

async function upsertProfile(profile) {
  const { data, error } = await db
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();
  return { data, error };
}

// ── Workout logs ──────────────────────────────────
async function getWorkoutLogs(userId, limit = 10) {
  const { data, error } = await db
    .from('workout_logs')
    .select('*, workouts(name, category)')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(limit);
  return { data, error };
}

async function logWorkout(log) {
  const { data, error } = await db
    .from('workout_logs')
    .insert(log)
    .select()
    .single();
  return { data, error };
}

// ── Nutrition logs ────────────────────────────────
async function getNutritionLogs(userId, date) {
  const { data, error } = await db
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', date);
  return { data, error };
}

// ── Body measurements ─────────────────────────────
async function getMeasurements(userId, limit = 20) {
  const { data, error } = await db
    .from('body_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('measured_at', { ascending: false })
    .limit(limit);
  return { data, error };
}

async function addMeasurement(m) {
  const { data, error } = await db
    .from('body_measurements')
    .insert(m)
    .select()
    .single();
  return { data, error };
}

// ── Personal bests ────────────────────────────────
async function getPersonalBests(userId) {
  const { data, error } = await db
    .from('personal_bests')
    .select('*')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false });
  return { data, error };
}

async function upsertPersonalBest(pb) {
  const { data, error } = await db
    .from('personal_bests')
    .upsert(pb, { onConflict: 'user_id,exercise_name' })
    .select()
    .single();
  return { data, error };
}

// ── User programs ─────────────────────────────────
async function getUserPrograms(userId) {
  const { data, error } = await db
    .from('user_programs')
    .select('*, programs(name, category, duration_weeks, sessions_per_week)')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });
  return { data, error };
}

// ── Streak helper ─────────────────────────────────
async function getStreak(userId) {
  const { data } = await db
    .from('workout_logs')
    .select('logged_at')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(90);

  if (!data || data.length === 0) return 0;

  const days = [...new Set(data.map(d => d.logged_at.slice(0, 10)))];
  let streak = 0;
  let check = new Date();
  check.setHours(0, 0, 0, 0);

  for (const day of days) {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    const diff = (check - d) / 86400000;
    if (diff <= 1) { streak++; check = d; }
    else break;
  }
  return streak;
}
