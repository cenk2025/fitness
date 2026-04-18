/* ═══════════════════════════════════════════════════
   V FITNESS — Program Sessions & Exercises Schema v2
   ─────────────────────────────────────────────────
   HOW TO RUN:
   1. Go to your Supabase project dashboard
   2. Click "SQL Editor" in the left sidebar
   3. Click "+ New query"
   4. Paste this ENTIRE file
   5. Click "Run" (or Ctrl+Enter)

   Run AFTER the original schema.sql
═══════════════════════════════════════════════════ */

-- ─────────────────────────────────────────────────
-- 1. PROGRAM_SESSIONS
--    One row per training day within a program week
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.program_sessions (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id                 UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  week_number                INT NOT NULL DEFAULT 1,
  day_number                 INT NOT NULL,
  name                       TEXT NOT NULL,
  focus                      TEXT,
  estimated_duration_minutes INT,
  estimated_calories         INT,
  notes                      TEXT
);

CREATE INDEX IF NOT EXISTS idx_program_sessions_program
  ON public.program_sessions(program_id, week_number, day_number);

ALTER TABLE public.program_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can read program sessions"
  ON public.program_sessions;
CREATE POLICY "Anyone authenticated can read program sessions"
  ON public.program_sessions FOR SELECT
  USING (auth.uid() IS NOT NULL);


-- ─────────────────────────────────────────────────
-- 2. PROGRAM_EXERCISES
--    Exercises belonging to a session
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.program_exercises (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID NOT NULL REFERENCES public.program_sessions(id) ON DELETE CASCADE,
  order_index      INT DEFAULT 0,
  exercise_name    TEXT NOT NULL,
  equipment        TEXT,
  sets             INT,
  reps             TEXT,
  rest_seconds     INT,
  duration_seconds INT,
  notes            TEXT,
  calories_per_set INT
);

ALTER TABLE public.program_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can read program exercises"
  ON public.program_exercises;
CREATE POLICY "Anyone authenticated can read program exercises"
  ON public.program_exercises FOR SELECT
  USING (auth.uid() IS NOT NULL);


-- ─────────────────────────────────────────────────
-- 3. SEED: Week 1 sessions + exercises for all 4 programs
-- ─────────────────────────────────────────────────
DO $$
DECLARE
  pf_id UUID;
  ee_id UUID;
  sd_id UUID;
  ff_id UUID;

  -- Power Foundation session IDs
  pf_s1 UUID; pf_s2 UUID; pf_s3 UUID; pf_s4 UUID;

  -- Endurance Engine session IDs
  ee_s1 UUID; ee_s2 UUID; ee_s3 UUID; ee_s4 UUID; ee_s5 UUID;

  -- Sculpt & Define session IDs
  sd_s1 UUID; sd_s2 UUID; sd_s3 UUID; sd_s4 UUID; sd_s5 UUID;

  -- Flex & Flow session IDs
  ff_s1 UUID; ff_s2 UUID; ff_s3 UUID; ff_s4 UUID;
  ff_s5 UUID; ff_s6 UUID; ff_s7 UUID;

BEGIN
  -- Resolve program IDs
  SELECT id INTO pf_id FROM public.programs WHERE name = 'Power Foundation';
  SELECT id INTO ee_id FROM public.programs WHERE name = 'Endurance Engine';
  SELECT id INTO sd_id FROM public.programs WHERE name = 'Sculpt & Define';
  SELECT id INTO ff_id FROM public.programs WHERE name = 'Flex & Flow';

  -- Bail out gracefully if programs table not seeded yet
  IF pf_id IS NULL OR ee_id IS NULL OR sd_id IS NULL OR ff_id IS NULL THEN
    RAISE EXCEPTION 'Programs not found. Run schema.sql first.';
  END IF;

  -- Clear any existing Week 1 data for these programs so the script
  -- can be re-run safely. program_exercises cascades on session delete.
  DELETE FROM public.program_sessions
   WHERE week_number = 1
     AND program_id IN (pf_id, ee_id, sd_id, ff_id);

  -- ═══════════════════════════════════════════════
  -- POWER FOUNDATION  (4 sessions / week)
  -- ═══════════════════════════════════════════════

  -- Day 1: Lower Body Strength
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (pf_id, 1, 1, 'Lower Body Strength', 'legs', 65, 430, 'Focus on depth and bracing. Add 2.5 kg/week.')
  RETURNING id INTO pf_s1;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, calories_per_set, notes)
  VALUES
    (pf_s1, 1, 'Warm-up Squat',       'Barbell',  3, '5 @50%', 60,  6,  'Light weight, perfect form'),
    (pf_s1, 2, 'Back Squat',          'Barbell',  4, '5 @80%', 180, 14, '3-sec descent, drive through heels'),
    (pf_s1, 3, 'Romanian Deadlift',   'Barbell',  3, '8',      120, 10, 'Hinge at hips, slight knee bend'),
    (pf_s1, 4, 'Leg Press',           'Machine',  3, '10',     90,  8,  'Full range of motion'),
    (pf_s1, 5, 'Walking Lunge',       'Dumbbells',3, '12 each',75,  9,  'Keep torso upright'),
    (pf_s1, 6, 'Standing Calf Raise', 'Machine',  4, '15',     60,  4,  'Pause at top');

  -- Day 2: Upper Body Push
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (pf_id, 1, 2, 'Upper Body Push', 'push', 60, 390, 'Shoulder warm-up essential before heavy pressing.')
  RETURNING id INTO pf_s2;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, calories_per_set, notes)
  VALUES
    (pf_s2, 1, 'Bench Press',           'Barbell',      4, '5 @80%', 180, 12, 'Retract scapula, controlled descent'),
    (pf_s2, 2, 'Overhead Press',        'Barbell',      3, '8',      120, 10, 'Brace core, full lockout'),
    (pf_s2, 3, 'Incline Dumbbell Press','Dumbbells',    3, '10',     90,  8,  '30–45° incline'),
    (pf_s2, 4, 'Cable Fly',             'Cable Machine',3, '12',     60,  6,  'Full stretch at bottom'),
    (pf_s2, 5, 'Tricep Pushdown',       'Cable Machine',3, '12',     60,  5,  'Elbows fixed, squeeze at bottom'),
    (pf_s2, 6, 'Lateral Raise',         'Dumbbells',    3, '15',     45,  4,  'Slight forward lean');

  -- Day 4: Upper Body Pull & Deadlift
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (pf_id, 1, 4, 'Upper Body Pull & Deadlift', 'pull', 70, 470, 'Heaviest day. Full neural recovery needed.')
  RETURNING id INTO pf_s3;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, calories_per_set, notes)
  VALUES
    (pf_s3, 1, 'Deadlift',           'Barbell',      4, '5 @85%',   180, 18, 'Brace and pull from hips'),
    (pf_s3, 2, 'Barbell Row',        'Barbell',      4, '8',        120, 12, 'Pull to lower chest'),
    (pf_s3, 3, 'Pull-Up',            'Pull-up Bar',  3, 'Max reps', 90,  10, 'Full hang to chin over bar'),
    (pf_s3, 4, 'Seated Cable Row',   'Cable Machine',3, '12',       75,  7,  'Squeeze shoulder blades'),
    (pf_s3, 5, 'Face Pull',          'Cable Machine',3, '15',       60,  5,  'Protects shoulder health'),
    (pf_s3, 6, 'Barbell Curl',       'Barbell',      3, '10',       60,  6,  'No swinging');

  -- Day 5: Full Body Accessory
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (pf_id, 1, 5, 'Full Body Accessory', 'full_body', 55, 350, 'Address weak points, build work capacity.')
  RETURNING id INTO pf_s4;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, calories_per_set, notes)
  VALUES
    (pf_s4, 1, 'Front Squat',       'Barbell',  3, '5 @70%',  120, 10, 'Builds quad strength for back squat'),
    (pf_s4, 2, 'DB Shoulder Press', 'Dumbbells',3, '10',      90,  8,  'Seated, controlled'),
    (pf_s4, 3, 'Dumbbell Row',      'Dumbbells',3, '12 each', 75,  7,  'Neutral spine'),
    (pf_s4, 4, 'Leg Curl',          'Machine',  3, '12',      60,  6,  'Full range'),
    (pf_s4, 5, 'Ab Wheel Rollout',  'Ab Wheel', 3, '10',      60,  6,  'Brace core throughout'),
    (pf_s4, 6, 'Farmer Walk',       'Dumbbells',3, '30m',     60,  8,  'Maximize grip strength');

  -- ═══════════════════════════════════════════════
  -- ENDURANCE ENGINE  (5 sessions / week)
  -- ═══════════════════════════════════════════════

  -- Day 1: HIIT Sprint Session
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (ee_id, 1, 1, 'HIIT Sprint Session', 'hiit', 35, 380, 'Warm up 5 min before starting intervals.')
  RETURNING id INTO ee_s1;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, duration_seconds, calories_per_set, notes)
  VALUES
    (ee_s1, 1, 'Jog Warm-Up',      'Treadmill / Outdoor', 1, '5 min',                    0, 300, 40, 'Easy pace, Zone 1'),
    (ee_s1, 2, 'Sprint Intervals', 'Treadmill / Outdoor', 10,'30 sec on / 30 sec off', 0, 30,  20, '90% max effort sprints'),
    (ee_s1, 3, 'Jog Cool-Down',    'Treadmill / Outdoor', 1, '5 min',                    0, 300, 40, 'Zone 1, lower HR');

  -- Day 2: Steady State Run
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (ee_id, 1, 2, 'Steady State Run', 'cardio', 35, 320, 'Conversational pace throughout. Stay in Zone 2.')
  RETURNING id INTO ee_s2;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, duration_seconds, calories_per_set, notes)
  VALUES
    (ee_s2, 1, 'Easy Run Zone 2', 'Treadmill / Outdoor', 1, '30 min', 0, 1800, 280, 'Conversational pace, 65–75% max HR'),
    (ee_s2, 2, 'Stretching',      'No Equipment',         1, '5 min',  0, 300,  0,   'Focus on hip flexors and calves');

  -- Day 3: Threshold Intervals
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (ee_id, 1, 3, 'Threshold Intervals', 'hiit', 45, 460, 'Hard but sustainable effort. Should not be gasping.')
  RETURNING id INTO ee_s3;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, duration_seconds, calories_per_set, notes)
  VALUES
    (ee_s3, 1, 'Warm-Up Jog',      'Treadmill / Outdoor', 1, '5 min',  0,   300, 40, 'Easy pace'),
    (ee_s3, 2, 'Threshold Run',    'Treadmill / Outdoor', 5, '3 min @85%', 120, 180, 64, '85% max HR, 2 min rest between reps'),
    (ee_s3, 3, 'Cool-Down Jog',    'Treadmill / Outdoor', 1, '5 min',  0,   300, 40, 'Easy pace');

  -- Day 4: Active Recovery
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (ee_id, 1, 4, 'Active Recovery', 'mobility', 30, 150, 'Low intensity only. Let body recover.')
  RETURNING id INTO ee_s4;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, duration_seconds, calories_per_set, notes)
  VALUES
    (ee_s4, 1, 'Easy Walk',    'Outdoor',     1, '20 min', 0, 1200, 110, 'Flat ground, easy pace'),
    (ee_s4, 2, 'Foam Rolling', 'Foam Roller', 1, '10 min', 0, 600,  0,   'Quads, hamstrings, IT band, calves');

  -- Day 5: Long Run
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (ee_id, 1, 5, 'Long Run', 'cardio', 50, 520, 'Longest run of the week. Prioritise completion over pace.')
  RETURNING id INTO ee_s5;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, duration_seconds, calories_per_set, notes)
  VALUES
    (ee_s5, 1, 'Easy Long Run Zone 2', 'Treadmill / Outdoor', 1, '45 min', 0, 2700, 480, 'Steady Zone 2, hydrate every 15 min'),
    (ee_s5, 2, 'Stretching',           'No Equipment',         1, '5 min',  0, 300,  0,   'Full lower body stretch');

  -- ═══════════════════════════════════════════════
  -- SCULPT & DEFINE  (5 sessions / week)
  -- ═══════════════════════════════════════════════

  -- Day 1: Chest & Shoulders
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (sd_id, 1, 1, 'Chest & Shoulders', 'push', 55, 380, 'Superset lat raises with pressing for time efficiency.')
  RETURNING id INTO sd_s1;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, calories_per_set, notes)
  VALUES
    (sd_s1, 1, 'Dumbbell Bench Press',    'Dumbbells',    4, '12', 75, 10, 'Full range of motion, elbows at 45°'),
    (sd_s1, 2, 'Cable Crossover',         'Cable Machine',3, '15', 60, 6,  'Squeeze at centre, full stretch at sides'),
    (sd_s1, 3, 'Seated DB Shoulder Press','Dumbbells',    3, '12', 75, 8,  'Controlled, avoid arching lower back'),
    (sd_s1, 4, 'Arnold Press',            'Dumbbells',    3, '12', 60, 7,  'Rotate palms throughout movement'),
    (sd_s1, 5, 'Cable Lateral Raise',     'Cable Machine',3, '15', 45, 5,  'Constant tension from cable'),
    (sd_s1, 6, 'Push-Up',                 'Bodyweight',   3, '15', 45, 4,  'Perfect plank position throughout');

  -- Day 2: Back & Biceps
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (sd_id, 1, 2, 'Back & Biceps', 'pull', 55, 370, 'Initiate all pulls with the back, not the arms.')
  RETURNING id INTO sd_s2;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, calories_per_set, notes)
  VALUES
    (sd_s2, 1, 'Lat Pulldown',        'Cable Machine', 4, '12',      75, 9,  'Full stretch at top, squeeze at bottom'),
    (sd_s2, 2, 'Cable Row',           'Cable Machine', 4, '12',      75, 8,  'Neutral grip, drive elbows back'),
    (sd_s2, 3, 'Single Arm DB Row',   'Dumbbells',     3, '12 each', 60, 7,  'Brace on bench, retract scapula'),
    (sd_s2, 4, 'Face Pull',           'Cable Machine', 3, '15',      45, 5,  'External rotation at the end'),
    (sd_s2, 5, 'Dumbbell Curl',       'Dumbbells',     3, '12',      60, 6,  'Controlled on the way down'),
    (sd_s2, 6, 'Hammer Curl',         'Dumbbells',     3, '12',      45, 5,  'Targets brachialis, neutral grip');

  -- Day 3: Legs & Glutes
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (sd_id, 1, 3, 'Legs & Glutes', 'legs', 60, 430, 'Focus on glute activation before compound lifts.')
  RETURNING id INTO sd_s3;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, calories_per_set, notes)
  VALUES
    (sd_s3, 1, 'Leg Press',         'Machine',          4, '12', 90, 11, 'Drive through heels, full range'),
    (sd_s3, 2, 'Romanian Deadlift', 'Barbell',          3, '12', 90, 10, 'Feel hamstring stretch at bottom'),
    (sd_s3, 3, 'Hip Thrust',        'Barbell / Machine',4, '15', 75, 8,  'Full hip extension, pause 1 sec at top'),
    (sd_s3, 4, 'Leg Curl',          'Machine',          3, '15', 60, 6,  'Both concentric and eccentric controlled'),
    (sd_s3, 5, 'Leg Extension',     'Machine',          3, '15', 60, 6,  'Pause at full extension'),
    (sd_s3, 6, 'Seated Calf Raise', 'Machine',          4, '20', 45, 3,  'Full stretch at bottom, hold at top');

  -- Day 4: Arms & Core
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (sd_id, 1, 4, 'Arms & Core', 'arms', 50, 310, 'Keep rest periods short to maximise pump.')
  RETURNING id INTO sd_s4;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, calories_per_set, notes)
  VALUES
    (sd_s4, 1, 'Tricep Dips',    'Bodyweight / Bench', 3, '12', 75, 7,  'Lean forward to emphasise triceps'),
    (sd_s4, 2, 'Skull Crushers', 'Barbell',            3, '12', 75, 6,  'Lower to forehead, elbows in'),
    (sd_s4, 3, 'Cable Pushdown', 'Cable Machine',      3, '15', 60, 5,  'Full extension, squeeze at bottom'),
    (sd_s4, 4, 'Preacher Curl',  'Machine / Barbell',  3, '12', 60, 6,  'No cheating, strict form'),
    (sd_s4, 5, 'Plank',          'Bodyweight',         3, '60s',45, 4,  'Posterior pelvic tilt, brace hard'),
    (sd_s4, 6, 'Cable Crunch',   'Cable Machine',      3, '15', 45, 4,  'Round spine, contract abs');

  -- Day 5: Full Body Circuit
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (sd_id, 1, 5, 'Full Body Circuit', 'full_body', 55, 420, 'Move between exercises with minimal rest. High intensity.')
  RETURNING id INTO sd_s5;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, calories_per_set, notes)
  VALUES
    (sd_s5, 1, 'Goblet Squat',      'Kettlebell / Dumbbell', 3, '15',      60, 8,  'Elbows inside knees at bottom'),
    (sd_s5, 2, 'DB Deadlift',       'Dumbbells',             3, '12',      75, 9,  'Flat back, drive hips forward'),
    (sd_s5, 3, 'Push-Up',           'Bodyweight',            3, '15',      45, 4,  'Full range, chest touches ground'),
    (sd_s5, 4, 'Dumbbell Row',      'Dumbbells',             3, '12 each', 60, 7,  'Alternate arms each set'),
    (sd_s5, 5, 'Dumbbell Lunge',    'Dumbbells',             3, '12 each', 60, 8,  'Step forward, back knee near floor'),
    (sd_s5, 6, 'Mountain Climber',  'Bodyweight',            3, '30s',     45, 5,  'Fast pace, hips level');

  -- ═══════════════════════════════════════════════
  -- FLEX & FLOW  (7 sessions / week — daily)
  -- ═══════════════════════════════════════════════

  -- Day 1: Morning Mobility
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (ff_id, 1, 1, 'Morning Mobility', 'mobility', 25, 100, 'Best done first thing in the morning on empty stomach.')
  RETURNING id INTO ff_s1;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, duration_seconds, calories_per_set, notes)
  VALUES
    (ff_s1, 1, 'Hip Flexor Stretch',    'No Equipment', 2, '60s each', 15, 60, 5, 'Lunge position, press hips forward'),
    (ff_s1, 2, 'Cat-Cow',               'No Equipment', 2, '10',       10, 0,  3, 'Slow and deliberate, full spine'),
    (ff_s1, 3, 'World''s Greatest Stretch','No Equipment',2,'5 each',  15, 0,  4, 'Thoracic rotation + hip opener'),
    (ff_s1, 4, 'T-Spine Rotation',      'No Equipment', 2, '10 each',  10, 0,  3, 'Keep hips square'),
    (ff_s1, 5, 'Deep Squat Hold',       'No Equipment', 2, '30s',      15, 30, 3, 'Use doorframe if needed'),
    (ff_s1, 6, 'Chest Opener',          'No Equipment', 2, '30s',      10, 30, 2, 'Clasp hands behind back, lift chest');

  -- Day 2: Hip & Lower Back
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (ff_id, 1, 2, 'Hip & Lower Back', 'mobility', 30, 115, 'Focus on controlled breathing in each stretch.')
  RETURNING id INTO ff_s2;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, duration_seconds, calories_per_set, notes)
  VALUES
    (ff_s2, 1, 'Piriformis Stretch',  'No Equipment', 2, '60s each', 15, 60, 4, 'Seated or lying — both work'),
    (ff_s2, 2, 'Figure Four',         'No Equipment', 2, '60s each', 15, 60, 4, 'Pull shin toward chest gently'),
    (ff_s2, 3, 'Low Lunge Twist',     'No Equipment', 2, '30s each', 10, 30, 3, 'Back knee on floor, reach up'),
    (ff_s2, 4, 'Supine Twist',        'No Equipment', 2, '60s each', 10, 60, 3, 'Keep shoulders flat on mat'),
    (ff_s2, 5, 'Child''s Pose',       'No Equipment', 2, '60s',      10, 60, 2, 'Arms extended forward'),
    (ff_s2, 6, 'Downward Dog',        'No Equipment', 2, '30s',      10, 30, 3, 'Pedal heels alternately');

  -- Day 3: Shoulder & Upper Body
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (ff_id, 1, 3, 'Shoulder & Upper Body', 'mobility', 25, 95, 'Ideal for desk workers and overhead athletes.')
  RETURNING id INTO ff_s3;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, duration_seconds, calories_per_set, notes)
  VALUES
    (ff_s3, 1, 'Doorway Chest Stretch',       'No Equipment', 2, '30s each', 10, 30, 2, 'Step through doorframe, arms at 90°'),
    (ff_s3, 2, 'Shoulder Circles',            'No Equipment', 2, '10 each',  10, 0,  3, 'Big controlled circles, both directions'),
    (ff_s3, 3, 'Cross Body Shoulder Stretch', 'No Equipment', 2, '30s each', 10, 30, 2, 'Pull elbow across chest'),
    (ff_s3, 4, 'Thread the Needle',           'No Equipment', 2, '10 each',  10, 0,  3, 'On hands and knees, reach under'),
    (ff_s3, 5, 'Wrist Circles',              'No Equipment', 2, '10 each',  10, 0,  2, 'Both directions, full range'),
    (ff_s3, 6, 'Eagle Arms',                 'No Equipment', 2, '30s',      10, 30, 2, 'Wrap arms, lift elbows');

  -- Day 4: Full Body Flow
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (ff_id, 1, 4, 'Full Body Flow', 'mobility', 30, 130, 'Connect breath to movement. Hold each pose with intention.')
  RETURNING id INTO ff_s4;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, duration_seconds, calories_per_set, notes)
  VALUES
    (ff_s4, 1, 'Sun Salutation A',          'No Equipment', 3, '5 rounds',   30, 0,  10, 'Flow at your own pace'),
    (ff_s4, 2, 'Warrior I Flow',            'No Equipment', 2, '60s each',   15, 60, 5,  'Press back heel firmly down'),
    (ff_s4, 3, 'Triangle Pose',             'No Equipment', 2, '30s each',   10, 30, 3,  'Reach long, don''t compress side'),
    (ff_s4, 4, 'Pigeon Pose',               'No Equipment', 2, '60s each',   15, 60, 4,  'Deep hip opener, breathe into tightness'),
    (ff_s4, 5, 'Seated Forward Fold',       'No Equipment', 2, '60s',        10, 60, 3,  'Hinge at hips, spine long'),
    (ff_s4, 6, 'Supine Hamstring Stretch',  'No Equipment', 2, '30s each',   10, 30, 2,  'Use strap or towel if needed');

  -- Day 5: Rest or Light Walk
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (ff_id, 1, 5, 'Rest or Light Walk', 'recovery', 20, 80, 'Optional. Movement without pressure — listen to your body.')
  RETURNING id INTO ff_s5;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, duration_seconds, calories_per_set, notes)
  VALUES
    (ff_s5, 1, 'Easy Walk', 'Outdoor', 1, '20 min', 0, 1200, 80, 'Flat ground, easy conversational pace');

  -- Day 6: Hamstrings & Calves
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (ff_id, 1, 6, 'Hamstrings & Calves', 'mobility', 25, 100, 'Common tight spots for runners and lifters.')
  RETURNING id INTO ff_s6;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, duration_seconds, calories_per_set, notes)
  VALUES
    (ff_s6, 1, 'Standing Hamstring Stretch',    'No Equipment', 2, '30s each', 10, 30, 3, 'Hinge forward, soft knee'),
    (ff_s6, 2, 'Seated Hamstring Stretch',      'No Equipment', 2, '60s each', 10, 60, 3, 'Reach for toes, back flat'),
    (ff_s6, 3, 'Standing Calf Stretch',         'No Equipment', 2, '30s each', 10, 30, 2, 'Step back, heel on floor'),
    (ff_s6, 4, 'Downward Dog to Calf Raise',    'No Equipment', 2, '10 reps',  15, 0,  3, 'Rise onto toes from down dog'),
    (ff_s6, 5, 'Seated Toe Reach',              'No Equipment', 2, '30s',      10, 30, 2, 'Both legs extended, reach forward');

  -- Day 7: Full Body Recovery
  INSERT INTO public.program_sessions
    (program_id, week_number, day_number, name, focus, estimated_duration_minutes, estimated_calories, notes)
  VALUES
    (ff_id, 1, 7, 'Full Body Recovery', 'recovery', 30, 110, 'Parasympathetic reset. No intensity, full body scan.')
  RETURNING id INTO ff_s7;

  INSERT INTO public.program_exercises
    (session_id, order_index, exercise_name, equipment, sets, reps, rest_seconds, duration_seconds, calories_per_set, notes)
  VALUES
    (ff_s7, 1, 'Foam Rolling',     'Foam Roller', 1, '15 min', 0, 900, 60, 'Full body: quads, IT band, upper back, lats'),
    (ff_s7, 2, 'Light Stretching', 'No Equipment',1, '15 min', 0, 900, 50, 'Hold each stretch 30–60 s, no bouncing');

END $$;
