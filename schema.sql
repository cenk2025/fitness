/* ═══════════════════════════════════════════════════
   V FITNESS — Supabase Schema
   ─────────────────────────────────────────────────
   HOW TO RUN:
   1. Go to your Supabase project dashboard
   2. Click "SQL Editor" in the left sidebar
   3. Click "+ New query"
   4. Paste this ENTIRE file
   5. Click "Run" (or Ctrl+Enter)
═══════════════════════════════════════════════════ */

-- ─────────────────────────────────────────────────
-- 1. PROFILES
--    Extends Supabase auth.users
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name      TEXT,
  last_name       TEXT,
  email           TEXT,
  avatar_url      TEXT,
  level           TEXT DEFAULT 'beginner'  CHECK (level IN ('beginner','intermediate','advanced','elite')),
  goal            TEXT DEFAULT 'strength'  CHECK (goal IN ('strength','weight_loss','muscle_gain','endurance','mobility')),
  plan            TEXT DEFAULT 'free'      CHECK (plan IN ('free','pro','elite')),
  calorie_goal    INT DEFAULT 2350,
  protein_goal_g  INT DEFAULT 180,
  carbs_goal_g    INT DEFAULT 250,
  fat_goal_g      INT DEFAULT 72,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- ─────────────────────────────────────────────────
-- 2. WORKOUTS (library / catalogue)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workouts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT CHECK (category IN ('chest','back','legs','shoulders','core','hiit','mobility','cardio','full_body')),
  level       TEXT CHECK (level IN ('beginner','intermediate','advanced','elite')),
  sets        INT,
  reps        INT,
  duration_minutes INT,
  description TEXT,
  is_public   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Seed with starting exercises
INSERT INTO public.workouts (name, category, level, sets, reps, duration_minutes) VALUES
  ('Bench Press',      'chest',     'intermediate', 4, 10, 45),
  ('Deadlift',         'back',      'advanced',     5,  5, 60),
  ('Back Squat',       'legs',      'beginner',     4, 10, 40),
  ('Overhead Press',   'shoulders', 'intermediate', 4,  8, 35),
  ('Pull-Up',          'back',      'intermediate', 4,  8, 30),
  ('Plank Circuit',    'core',      'beginner',     3, NULL, 20),
  ('Tabata Blast',     'hiit',      'advanced',     8, NULL, 25),
  ('Romanian Deadlift','legs',      'intermediate', 4, 10, 40),
  ('Dumbbell Row',     'back',      'beginner',     3, 12, 30),
  ('Incline Press',    'chest',     'intermediate', 3, 10, 35),
  ('Hip Thrust',       'legs',      'beginner',     4, 12, 35),
  ('Lateral Raise',    'shoulders', 'beginner',     3, 15, 20)
ON CONFLICT DO NOTHING;

-- RLS (public workouts readable by all authenticated users)
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read workouts"
  ON public.workouts FOR SELECT USING (auth.role() = 'authenticated');


-- ─────────────────────────────────────────────────
-- 3. WORKOUT LOGS
--    User's actual workout sessions
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id        UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  exercise_name     TEXT,          -- freeform name if no workout_id
  category          TEXT,
  sets              INT,
  reps              INT,
  weight_kg         NUMERIC(6,2),
  duration_minutes  INT,
  notes             TEXT,
  logged_at         TIMESTAMPTZ DEFAULT now(),
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_workout_logs_user ON public.workout_logs(user_id, logged_at DESC);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own workout logs"
  ON public.workout_logs FOR ALL USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────
-- 4. PROGRAMS (catalogue)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.programs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  category            TEXT,
  level               TEXT,
  duration_weeks      INT,
  sessions_per_week   INT,
  description         TEXT,
  is_public           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.programs (name, category, level, duration_weeks, sessions_per_week, description) VALUES
  ('Power Foundation',  'strength',         'all',          12, 4, 'Progressive overload: squat, bench, deadlift.'),
  ('Endurance Engine',  'cardio',           'beginner',      8, 5, 'HIIT + steady-state cardio to boost VO₂ Max.'),
  ('Sculpt & Define',   'body_composition', 'intermediate', 16, 5, 'Hypertrophy meets strategic fat loss.'),
  ('Flex & Flow',       'mobility',         'all',          NULL, 7, 'Daily mobility and yoga recovery.')
ON CONFLICT DO NOTHING;

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read programs"
  ON public.programs FOR SELECT USING (auth.role() = 'authenticated');


-- ─────────────────────────────────────────────────
-- 5. USER PROGRAMS
--    Which programs a user is enrolled in
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_programs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id      UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  started_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  current_week    INT DEFAULT 1,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','paused','completed')),
  UNIQUE (user_id, program_id)
);

ALTER TABLE public.user_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own programs"
  ON public.user_programs FOR ALL USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────
-- 6. NUTRITION LOGS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type    TEXT CHECK (meal_type IN ('breakfast','lunch','dinner','snack','pre_workout','post_workout')),
  description  TEXT,
  calories     INT,
  protein_g    NUMERIC(6,1),
  carbs_g      NUMERIC(6,1),
  fat_g        NUMERIC(6,1),
  fiber_g      NUMERIC(6,1),
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_nutrition_logs_user_date ON public.nutrition_logs(user_id, log_date DESC);

ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own nutrition logs"
  ON public.nutrition_logs FOR ALL USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────
-- 7. BODY MEASUREMENTS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg       NUMERIC(5,2),
  height_cm       NUMERIC(5,1),
  body_fat_pct    NUMERIC(4,1),
  muscle_mass_kg  NUMERIC(5,2),
  chest_cm        NUMERIC(5,1),
  waist_cm        NUMERIC(5,1),
  hips_cm         NUMERIC(5,1),
  arms_cm         NUMERIC(5,1),
  thighs_cm       NUMERIC(5,1),
  measured_at     TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_body_measurements_user ON public.body_measurements(user_id, measured_at DESC);

ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own measurements"
  ON public.body_measurements FOR ALL USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────
-- 8. PERSONAL BESTS
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.personal_bests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name   TEXT NOT NULL,
  weight_kg       NUMERIC(6,2),
  reps            INT,
  distance_m      NUMERIC(8,2),
  time_seconds    INT,
  notes           TEXT,
  achieved_at     TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, exercise_name)
);

ALTER TABLE public.personal_bests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own personal bests"
  ON public.personal_bests FOR ALL USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────
-- DONE ✓
-- Tables created:
--   profiles · workouts · workout_logs
--   programs · user_programs · nutrition_logs
--   body_measurements · personal_bests
-- ─────────────────────────────────────────────────
