/* ═══════════════════════════════════════════════════
   V FITNESS — Application Logic
   · i18n (EN / FI)
   · Navbar scroll
   · Cookie consent
   · Workout filter
   · Pricing toggle
   · Scroll reveal
   · Period buttons
═══════════════════════════════════════════════════ */

// ── i18n Strings ─────────────────────────────────
const i18n = {
  en: {
    // Nav
    'nav.programs':  'Programs',
    'nav.workouts':  'Workouts',
    'nav.nutrition': 'Nutrition',
    'nav.progress':  'Progress',
    'nav.pricing':   'Pricing',
    'nav.cta':       'Start Free',

    // Hero
    'hero.badge':  '50,000+ Athletes Worldwide',
    'hero.title1': 'BUILD YOUR',
    'hero.title2': 'STRONGEST',
    'hero.title3': 'SELF',
    'hero.sub':    'Science-backed training programs, real-time coaching, and intelligent nutrition — for every level from first rep to elite athlete.',
    'hero.cta1':   'Start Training Free',
    'hero.cta2':   'Watch Preview',
    'hero.stat1':  'Workouts',
    'hero.stat2':  'Programs',
    'hero.stat3':  'Satisfaction',
    'hero.stat4':  'AI Coach',

    // Levels
    'level.beginner':     'Beginner',
    'level.intermediate': 'Intermediate',
    'level.advanced':     'Advanced',
    'level.elite':        'Elite',
    'level.all':          'All Levels',

    // Programs
    'programs.tag':   'Training Programs',
    'programs.title': 'Every Goal. Every Level.',
    'programs.title.prefix': 'Every Goal.',
    'programs.title.suffix': 'Every Level.',
    'programs.sub':   'Structured programs built by certified coaches and sports scientists — with progressive overload baked in.',
    'programs.start': 'Start Program',
    'programs.strength.tag':  'Strength',
    'programs.strength.name': 'Power Foundation',
    'programs.strength.desc': '12-week progressive overload program. Squat, bench, deadlift — build a bulletproof foundation.',
    'programs.cardio.tag':    'Cardio',
    'programs.cardio.name':   'Endurance Engine',
    'programs.cardio.desc':   'HIIT, steady-state, and interval training to skyrocket your VO₂ Max and cardiovascular endurance.',
    'programs.body.tag':      'Body Composition',
    'programs.body.name':     'Sculpt & Define',
    'programs.body.desc':     'Targeted muscle hypertrophy meets strategic fat loss. Transform your physique in 16 weeks.',
    'programs.mobility.tag':  'Mobility',
    'programs.mobility.name': 'Flex & Flow',
    'programs.mobility.desc': 'Daily mobility routines, yoga flows, and recovery protocols. Move better, feel better, perform better.',

    // Workouts
    'workouts.tag':  'Exercise Library',
    'workouts.title':'500+ Expert Workouts',
    'workouts.title.prefix': '500+',
    'workouts.title.suffix': 'Expert Workouts',
    'workouts.sub':  'Filter by muscle group, equipment, duration, or intensity. Every exercise includes coaching cues and form videos.',
    'workouts.viewall': 'View All 500+ Workouts',
    'workouts.filter.all':       'All',
    'workouts.filter.chest':     'Chest',
    'workouts.filter.back':      'Back',
    'workouts.filter.legs':      'Legs',
    'workouts.filter.shoulders': 'Shoulders',
    'workouts.filter.core':      'Core',
    'workouts.filter.hiit':      'HIIT',
    'workouts.bench.name':  'Bench Press',
    'workouts.deadlift.name': 'Deadlift',
    'workouts.squat.name':  'Back Squat',
    'workouts.ohp.name':    'Overhead Press',
    'workouts.plank.name':  'Plank Circuit',
    'workouts.hiit.name':   'Tabata Blast',

    // Tags
    'tag.strength':    'Strength',
    'tag.core':        'Core',
    'tag.hiit':        'HIIT',
    'tag.beginner':    'Beginner',
    'tag.intermediate':'Intermediate',
    'tag.advanced':    'Advanced',

    // Nutrition
    'nutrition.tag':       'Nutrition Intelligence',
    'nutrition.title':     'Fuel Your Performance',
    'nutrition.title.prefix': 'Fuel Your',
    'nutrition.title.suffix': 'Performance',
    'nutrition.sub':       'AI-powered meal planning that adapts to your training load, body composition goals, and food preferences.',
    'nutrition.today':     "Today's Nutrition",
    'nutrition.kcal':      'kcal',
    'nutrition.protein':   'Protein',
    'nutrition.carbs':     'Carbs',
    'nutrition.fat':       'Fat',
    'nutrition.breakfast': 'Breakfast',
    'nutrition.lunch':     'Lunch',
    'nutrition.dinner':    'Dinner',
    'nutrition.snack':     'Snack',
    'nutrition.meal1':     'Oats + Protein Shake + Berries',
    'nutrition.meal2':     'Grilled Chicken + Brown Rice + Broccoli',
    'nutrition.meal3':     'Salmon + Sweet Potato + Asparagus',
    'nutrition.meal4':     'Greek Yogurt + Almonds + Honey',
    'nutrition.water':     'Hydration',

    // Progress
    'progress.tag':      'Progress Tracking',
    'progress.title':    'See Every Gain',
    'progress.title.prefix': 'See Every',
    'progress.title.suffix': 'Gain',
    'progress.sub':      'Comprehensive analytics that show your strength gains, body composition changes, and performance improvements over time.',
    'progress.strength': 'Strength Progress',
    'progress.squat':    'Squat 1RM gain',
    'progress.vo2':      'VO₂ Max',
    'progress.rhr':      'Resting HR',
    'progress.streak':   'Streak',

    // Features
    'features.tag':   'Why V Fitness',
    'features.title': 'Everything You Need',
    'features.title.prefix': 'Everything You',
    'features.title.suffix': 'Need',
    'features.ai.title':        'AI Coaching',
    'features.ai.desc':         'Real-time form feedback, adaptive load recommendations, and personalized weekly plans powered by machine learning.',
    'features.progress.title':  'Smart Progress',
    'features.progress.desc':   'Automated progressive overload, 1RM tracking, volume analysis, and weekly performance summaries.',
    'features.community.title': 'Community',
    'features.community.desc':  'Monthly challenges, leaderboards, workout sharing, and a global community of 50K+ athletes.',
    'features.support.title':   '24/7 Support',
    'features.support.desc':    'Live chat, certified coach access, and an AI assistant that answers your questions any time, any day.',
    'features.offline.title':   'Offline Mode',
    'features.offline.desc':    'Download workouts and train anywhere — gym, home, or travel — with no internet connection required.',
    'features.wearable.title':  'Wearable Sync',
    'features.wearable.desc':   'Seamless sync with Apple Watch, Garmin, Whoop, and Polar devices for heart rate and recovery data.',

    // Testimonials
    'testimonials.tag':   'Success Stories',
    'testimonials.title': 'Real Results. Real People.',
    'testimonials.title.prefix': 'Real Results.',
    'testimonials.title.suffix': 'Real People.',
    'testimonials.1.text': 'I went from 0 to squatting 120kg in 6 months. The progressive overload system is unlike anything I\'ve tried — it just works.',
    'testimonials.1.meta': '+52kg squat · 6 months',
    'testimonials.2.text': 'As a competitive runner, I needed something beyond generic plans. V Fitness\'s AI coach adapted my training weekly based on my Garmin data. Dropped my 10K time by 4 minutes.',
    'testimonials.2.meta': '-4 min 10K · Competitive runner',
    'testimonials.3.text': 'Started completely from scratch at 45. The beginner programs were so well structured, I never felt lost or overwhelmed. Lost 14kg in 4 months.',
    'testimonials.3.meta': '-14kg · Beginner to fitness',

    // Pricing
    'pricing.tag':      'Pricing',
    'pricing.title':    'Simple, Transparent Pricing',
    'pricing.title.prefix': 'Simple,',
    'pricing.title.middle': 'Transparent',
    'pricing.title.suffix': 'Pricing',
    'pricing.sub':      'Start free. Upgrade when you\'re ready. Cancel anytime.',
    'pricing.monthly':  'Monthly',
    'pricing.annual':   'Annual',
    'pricing.permonth': '/ month',
    'pricing.popular':  'Most Popular',
    'pricing.free.name': 'Starter',
    'pricing.free.desc': 'Perfect to explore V Fitness and start your journey.',
    'pricing.free.f1':  '50 free workouts',
    'pricing.free.f2':  '3 beginner programs',
    'pricing.free.f3':  'Basic progress tracking',
    'pricing.free.f4':  'AI Coach',
    'pricing.free.f5':  'Nutrition plans',
    'pricing.free.cta': 'Get Started Free',
    'pricing.pro.name': 'Pro',
    'pricing.pro.desc': 'For serious athletes who want the complete V Fitness experience.',
    'pricing.pro.f1':   '500+ workouts unlocked',
    'pricing.pro.f2':   'All 120+ programs',
    'pricing.pro.f3':   'AI Coach (unlimited)',
    'pricing.pro.f4':   'Full nutrition plans',
    'pricing.pro.f5':   'Wearable sync',
    'pricing.pro.f6':   'Offline downloads',
    'pricing.pro.cta':  'Start 7-Day Free Trial',
    'pricing.elite.name': 'Elite',
    'pricing.elite.desc': 'For competitive athletes who need a dedicated coach and elite-level data analysis.',
    'pricing.elite.f1': 'Everything in Pro',
    'pricing.elite.f2': '1-on-1 certified coach',
    'pricing.elite.f3': 'Weekly video check-ins',
    'pricing.elite.f4': 'Advanced body composition',
    'pricing.elite.f5': 'Custom program builder',
    'pricing.elite.cta':'Go Elite',

    // CTA
    'cta.title':     'Start Your Transformation Today',
    'cta.title.prefix': 'Start Your Transformation',
    'cta.title.suffix': 'Today',
    'cta.sub':       'Join 50,000+ athletes who are already training smarter with V Fitness. No credit card required.',
    'cta.btn1':      'Start Free Today',
    'cta.btn2':      'Browse Programs',
    'cta.available': 'Available on',

    // Footer
    'footer.tagline': 'Science-backed training for every athlete.',
    'footer.product': 'Product',
    'footer.training':'Training',
    'footer.company': 'Company',
    'footer.legal':   'Legal',
    'footer.strength':'Strength',
    'footer.cardio':  'Cardio',
    'footer.mobility':'Mobility',
    'footer.hiit':    'HIIT',
    'footer.yoga':    'Yoga & Recovery',
    'footer.about':   'About Us',
    'footer.blog':    'Blog',
    'footer.careers': 'Careers',
    'footer.press':   'Press',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy Policy',
    'footer.terms':   'Terms of Service',
    'footer.cookies': 'Cookie Policy',
    'footer.gdpr':    'GDPR',
    'footer.copy':    '© 2026 V Fitness. All rights reserved.',
    'footer.location':'Made with passion in Finland & beyond.',

    // Cookie
    'cookie.msg': 'We use cookies to personalize your experience and track performance.',

    // Nav auth
    'nav.login':     'Log In',
    'nav.dashboard': 'Dashboard',

    // Auth modal
    'auth.login':           'Log In',
    'auth.signup':          'Sign Up',
    'auth.welcome.login':   'Welcome back. Let\'s get to work.',
    'auth.welcome.signup':  'Join 50,000+ athletes. Start free.',
    'auth.email':           'Email',
    'auth.password':        'Password',
    'auth.forgot':          'Forgot password?',
    'auth.login.btn':       'Log In',
    'auth.firstname':       'First Name',
    'auth.lastname':        'Last Name',
    'auth.level':           'Fitness Level',
    'auth.goal':            'Primary Goal',
    'auth.goal.strength':   'Strength',
    'auth.goal.loss':       'Weight Loss',
    'auth.goal.muscle':     'Muscle Gain',
    'auth.goal.endurance':  'Endurance',
    'auth.goal.mobility':   'Mobility',
    'auth.signup.btn':      'Create Account',
    'auth.terms':           'By signing up you agree to our Terms and Privacy Policy.',
    'auth.or':              'or',
    'auth.guest':           'Continue as Guest',
    'auth.guest.badge':     'No account needed',

    // Dashboard nav
    'db.overview':   'Overview',
    'db.programs':   'My Programs',
    'db.workouts':   'Workouts',
    'db.nutrition':  'Nutrition',
    'db.progress':   'Progress',
    'db.body':       'Body Stats',
    'db.settings':   'Settings',
    'db.logout':     'Log Out',

    // Overview
    'db.overview.title':  'Overview',
    'db.streak':          'Day Streak',
    'db.totalWorkouts':   'Total Workouts',
    'db.thisWeek':        'This Week',
    'db.totalHours':      'Total Hours',
    'db.weekly':          'Weekly Activity',
    'db.todays.plan':     'Today\'s Plan',
    'db.active':          'Active',
    'db.recent':          'Recent Workouts',
    'db.viewall':         'View All',
    'db.no.workouts':     'No workouts logged yet. Start your first session!',
    'db.start':           'Start',
    'db.log':             'Log',

    // Programs
    'db.programs.title':  'My Programs',
    'db.no.programs':     'No active programs. Browse programs to get started.',
    'db.browse.programs': 'Browse Programs',

    // Workouts
    'db.workouts.title':  'Workout Log',
    'db.log.workout':     'Log Workout',
    'db.log.new':         'Log New Workout',
    'db.exercise':        'Exercise',
    'db.category':        'Category',
    'db.sets':            'Sets',
    'db.reps':            'Reps',
    'db.weight':          'Weight (kg)',
    'db.duration':        'Duration (min)',
    'db.notes':           'Notes',
    'db.save':            'Save',
    'db.cancel':          'Cancel',

    // Nutrition
    'db.nutrition.title': 'Nutrition',
    'db.macros':          'Daily Macros',
    'db.log.meal':        'Log a Meal',
    'db.meal.type':       'Meal',
    'db.meal.name':       'Description',
    'db.save.meal':       'Save Meal',
    'db.todays.meals':    'Today\'s Meals',
    'db.no.meals':        'No meals logged today.',

    // Progress
    'db.progress.title':  'Progress',
    'db.bench.pr':        'Bench PR',
    'db.deadlift.pr':     'Deadlift PR',
    'db.weight.trend':    'Body Weight Trend',
    'db.personal.bests':  'Personal Bests',
    'db.add.pr':          'Add PR',
    'db.log.pr':          'Log Personal Best',
    'db.no.prs':          'No personal bests recorded yet.',

    // Body
    'db.body.title':          'Body Stats',
    'db.add.measurement':     'Add Measurement',
    'db.weight.kg':           'Weight (kg)',
    'db.bodyfat':             'Body Fat %',
    'db.muscle.mass':         'Muscle Mass',
    'db.chest.cm':            'Chest (cm)',
    'db.waist.cm':            'Waist (cm)',
    'db.hips.cm':             'Hips (cm)',
    'db.arms.cm':             'Arms (cm)',
    'db.measurement.history': 'Measurement History',
    'db.no.measurements':     'No measurements recorded yet.',

    // Settings
    'db.settings.title': 'Settings',
    'db.profile':        'Profile',
    'db.subscription':   'Subscription',
    'db.plan.desc':      'Upgrade to Pro for unlimited access',
    'db.upgrade':        'Upgrade',
    'db.preferences':    'Preferences',
    'db.language':       'Language',
    'db.units':          'Units',
    'db.danger.zone':    'Danger Zone',
    'db.save.profile':   'Save Profile',
    'db.saved':          'Saved!',
  },

  fi: {
    // Nav
    'nav.programs':  'Ohjelmat',
    'nav.workouts':  'Harjoitukset',
    'nav.nutrition': 'Ravinto',
    'nav.progress':  'Edistyminen',
    'nav.pricing':   'Hinnoittelu',
    'nav.cta':       'Aloita Ilmaiseksi',

    // Hero
    'hero.badge':  '50 000+ Urheilijaa Maailmanlaajuisesti',
    'hero.title1': 'RAKENNA',
    'hero.title2': 'VAHVIN',
    'hero.title3': 'ITSESI',
    'hero.sub':    'Tieteeseen perustuvat harjoitusohjelmat, reaaliaikainen valmennus ja älykäs ravintoseuranta — kaikille tasolta aloittelijoista huippu-urheilijoihin.',
    'hero.cta1':   'Aloita Ilmaiseksi',
    'hero.cta2':   'Katso Esikatselu',
    'hero.stat1':  'Harjoitusta',
    'hero.stat2':  'Ohjelmaa',
    'hero.stat3':  'Tyytyväisyys',
    'hero.stat4':  'AI-Valmentaja',

    // Levels
    'level.beginner':     'Aloittelija',
    'level.intermediate': 'Keskitaso',
    'level.advanced':     'Edistynyt',
    'level.elite':        'Eliitti',
    'level.all':          'Kaikki Tasot',

    // Programs
    'programs.tag':   'Harjoitusohjelmat',
    'programs.title': 'Jokainen Tavoite. Jokainen Taso.',
    'programs.title.prefix': 'Jokainen Tavoite.',
    'programs.title.suffix': 'Jokainen Taso.',
    'programs.sub':   'Sertifioitujen valmentajien ja urheilutieteilijöiden rakentamat strukturoidut ohjelmat — progressiivinen ylikuormitus sisäänrakennettuna.',
    'programs.start': 'Aloita Ohjelma',
    'programs.strength.tag':  'Voimaharjoittelu',
    'programs.strength.name': 'Voiman Perusta',
    'programs.strength.desc': '12 viikon progressiivinen ohjelma. Kyykky, penkkipunnerrus, maastaveto — rakenna häikäisemätön perusta.',
    'programs.cardio.tag':    'Kestävyys',
    'programs.cardio.name':   'Kestävyysmoottori',
    'programs.cardio.desc':   'HIIT, tasavauhtinen ja intervalliharjoittelu VO₂ Maxin ja sydän- ja verisuonikestävyyden räjähdysmäiseen kasvattamiseen.',
    'programs.body.tag':      'Kehon Koostumus',
    'programs.body.name':     'Muotoile & Kiinteytä',
    'programs.body.desc':     'Kohdistettu lihaskasvatus yhdistettynä strategiseen rasvanpolttoon. Muunna kehoasi 16 viikossa.',
    'programs.mobility.tag':  'Liikkuvuus',
    'programs.mobility.name': 'Jousta & Virtaa',
    'programs.mobility.desc': 'Päivittäiset liikkuvuusrutiinit, joogaharjoitukset ja palautumisprotokollat. Liiku paremmin, tunne itsesi paremmin, suorita paremmin.',

    // Workouts
    'workouts.tag':  'Harjoituskirjasto',
    'workouts.title':'500+ Asiantuntijaharjoitusta',
    'workouts.title.prefix': '500+',
    'workouts.title.suffix': 'Asiantuntijaharjoitusta',
    'workouts.sub':  'Suodata lihasryhmän, välineiden, keston tai intensiteetin mukaan. Jokainen liike sisältää ohjaustips ja tekniikkavideon.',
    'workouts.viewall': 'Näytä Kaikki 500+ Harjoitusta',
    'workouts.filter.all':       'Kaikki',
    'workouts.filter.chest':     'Rinta',
    'workouts.filter.back':      'Selkä',
    'workouts.filter.legs':      'Jalat',
    'workouts.filter.shoulders': 'Hartiat',
    'workouts.filter.core':      'Keskivartalo',
    'workouts.filter.hiit':      'HIIT',
    'workouts.bench.name':  'Penkkipunnerrus',
    'workouts.deadlift.name': 'Maastaveto',
    'workouts.squat.name':  'Takakyykky',
    'workouts.ohp.name':    'Niskataakkakyykky',
    'workouts.plank.name':  'Lankku-kierros',
    'workouts.hiit.name':   'Tabata-räjähdys',

    // Tags
    'tag.strength':    'Voima',
    'tag.core':        'Keskivartalo',
    'tag.hiit':        'HIIT',
    'tag.beginner':    'Aloittelija',
    'tag.intermediate':'Keskitaso',
    'tag.advanced':    'Edistynyt',

    // Nutrition
    'nutrition.tag':       'Ravintotietoisuus',
    'nutrition.title':     'Tankkaa Suorituskykyäsi',
    'nutrition.title.prefix': 'Tankkaa',
    'nutrition.title.suffix': 'Suorituskykyäsi',
    'nutrition.sub':       'Tekoälyohjattu ateriasuunnittelu, joka mukautuu harjoituskuormaasi, kehon koostumuksen tavoitteisiisi ja ruokamieltymyksiisi.',
    'nutrition.today':     'Tämän Päivän Ravinto',
    'nutrition.kcal':      'kcal',
    'nutrition.protein':   'Proteiini',
    'nutrition.carbs':     'Hiilihydraatit',
    'nutrition.fat':       'Rasva',
    'nutrition.breakfast': 'Aamiainen',
    'nutrition.lunch':     'Lounas',
    'nutrition.dinner':    'Illallinen',
    'nutrition.snack':     'Välipala',
    'nutrition.meal1':     'Kaurapuuro + Proteiinishake + Marjat',
    'nutrition.meal2':     'Grillattua Kanaa + Täysjyväriisi + Parsakaali',
    'nutrition.meal3':     'Lohi + Bataatti + Parsa',
    'nutrition.meal4':     'Kreikkalainen Jogurtti + Mantelit + Hunaja',
    'nutrition.water':     'Nesteytys',

    // Progress
    'progress.tag':      'Edistymisen Seuranta',
    'progress.title':    'Näe Jokainen Edistysaskel',
    'progress.title.prefix': 'Näe Jokainen',
    'progress.title.suffix': 'Edistysaskel',
    'progress.sub':      'Kattavat analytiikkatiedot, jotka näyttävät voimasi kasvun, kehon koostumuksen muutokset ja suorituskyvyn parantumisen ajan myötä.',
    'progress.strength': 'Voiman Kehitys',
    'progress.squat':    'Kyykky 1RM kasvu',
    'progress.vo2':      'VO₂ Max',
    'progress.rhr':      'Leposyke',
    'progress.streak':   'Putki',

    // Features
    'features.tag':   'Miksi V Fitness',
    'features.title': 'Kaikki Mitä Tarvitset',
    'features.title.prefix': 'Kaikki Mitä',
    'features.title.suffix': 'Tarvitset',
    'features.ai.title':        'AI-Valmennus',
    'features.ai.desc':         'Reaaliaikainen tekniikkapalaute, adaptiiviset kuormasuositukset ja henkilökohtaiset viikkosuunnitelmat koneoppimisen avulla.',
    'features.progress.title':  'Älykäs Edistyminen',
    'features.progress.desc':   'Automatisoitu progressiivinen ylikuormitus, 1RM-seuranta, volyymi-analyysi ja viikoittaiset suorituskykyyhteenvedot.',
    'features.community.title': 'Yhteisö',
    'features.community.desc':  'Kuukausittaiset haasteet, tulostaulukot, harjoitusten jakaminen ja 50 000+ urheilijan maailmanlaajuinen yhteisö.',
    'features.support.title':   '24/7 Tuki',
    'features.support.desc':    'Live-chat, sertifioitujen valmentajien pääsy ja AI-avustaja, joka vastaa kysymyksiisi milloin tahansa.',
    'features.offline.title':   'Offline-Tila',
    'features.offline.desc':    'Lataa harjoitukset ja harjoittele missä tahansa — salilla, kotona tai matkoilla — ilman internet-yhteyttä.',
    'features.wearable.title':  'Puettavan Synkronointi',
    'features.wearable.desc':   'Saumaton synkronointi Apple Watchin, Garminin, Whoopin ja Polarin kanssa sykettä ja palautumisdataa varten.',

    // Testimonials
    'testimonials.tag':   'Menestystarinat',
    'testimonials.title': 'Todellisia Tuloksia. Todellisia Ihmisiä.',
    'testimonials.title.prefix': 'Todellisia Tuloksia.',
    'testimonials.title.suffix': 'Todellisia Ihmisiä.',
    'testimonials.1.text': 'Siirryin nollasta 120 kg:n kyykkyyn 6 kuukaudessa. Progressiivinen ylikuormitusjärjestelmä on verraton — se vain toimii.',
    'testimonials.1.meta': '+52 kg kyykky · 6 kuukautta',
    'testimonials.2.text': 'Kilpajuoksijana tarvitsin jotain geneerisiä suunnitelmia parempaa. V Fitnessin AI-valmentaja mukautti harjoitteluani viikoittain Garmin-datani perusteella. Paransin 10K-aikani 4 minuutilla.',
    'testimonials.2.meta': '-4 min 10K · Kilpajuoksija',
    'testimonials.3.text': 'Aloitin täysin alusta 45-vuotiaana. Aloittelijaohjelmat olivat niin hyvin rakennettu, etten koskaan tuntunut eksyväni. Laihduin 14 kg 4 kuukaudessa.',
    'testimonials.3.meta': '-14 kg · Liikuntaan tutustuva',

    // Pricing
    'pricing.tag':      'Hinnoittelu',
    'pricing.title':    'Yksinkertainen, Läpinäkyvä Hinnoittelu',
    'pricing.title.prefix': 'Yksinkertainen,',
    'pricing.title.middle': 'Läpinäkyvä',
    'pricing.title.suffix': 'Hinnoittelu',
    'pricing.sub':      'Aloita ilmaiseksi. Päivitä kun olet valmis. Peru milloin tahansa.',
    'pricing.monthly':  'Kuukausittain',
    'pricing.annual':   'Vuosittain',
    'pricing.permonth': '/ kuukausi',
    'pricing.popular':  'Suosituin',
    'pricing.free.name': 'Aloittelija',
    'pricing.free.desc': 'Täydellinen V Fitnessin kokeiluun ja matkasi aloittamiseen.',
    'pricing.free.f1':  '50 ilmaista harjoitusta',
    'pricing.free.f2':  '3 aloittelijaohjelmaa',
    'pricing.free.f3':  'Perustason edistymisen seuranta',
    'pricing.free.f4':  'AI-Valmentaja',
    'pricing.free.f5':  'Ravinto-ohjelmat',
    'pricing.free.cta': 'Aloita Ilmaiseksi',
    'pricing.pro.name': 'Pro',
    'pricing.pro.desc': 'Vakavasti otettaville urheilijoille, jotka haluavat täydellisen V Fitness -kokemuksen.',
    'pricing.pro.f1':   '500+ harjoitusta käytettävissä',
    'pricing.pro.f2':   'Kaikki 120+ ohjelmaa',
    'pricing.pro.f3':   'AI-Valmentaja (rajoittamaton)',
    'pricing.pro.f4':   'Täydet ravinto-ohjelmat',
    'pricing.pro.f5':   'Puettavan synkronointi',
    'pricing.pro.f6':   'Offline-lataukset',
    'pricing.pro.cta':  'Aloita 7 Päivän Ilmainen Kokeilu',
    'pricing.elite.name': 'Eliitti',
    'pricing.elite.desc': 'Kilpaurheilijoille, jotka tarvitsevat omistautuneen valmentajan ja eliittitason data-analyysin.',
    'pricing.elite.f1': 'Kaikki Pro-tasossa',
    'pricing.elite.f2': 'Henkilökohtainen sertifioitu valmentaja',
    'pricing.elite.f3': 'Viikoittaiset videopalaverit',
    'pricing.elite.f4': 'Edistynyt kehon koostumus',
    'pricing.elite.f5': 'Mukautettu ohjelmien rakentaja',
    'pricing.elite.cta':'Siirry Eliittiin',

    // CTA
    'cta.title':     'Aloita Muutoksesi Tänään',
    'cta.title.prefix': 'Aloita Muutoksesi',
    'cta.title.suffix': 'Tänään',
    'cta.sub':       'Liity 50 000+ urheilijaan, jotka jo harjoittelevat älykkäämmin V Fitnessin avulla. Ei luottokorttia tarvita.',
    'cta.btn1':      'Aloita Ilmaiseksi Tänään',
    'cta.btn2':      'Selaa Ohjelmia',
    'cta.available': 'Saatavilla',

    // Footer
    'footer.tagline': 'Tieteeseen perustuvaa harjoittelua kaikille urheilijoille.',
    'footer.product': 'Tuote',
    'footer.training':'Harjoittelu',
    'footer.company': 'Yritys',
    'footer.legal':   'Juridiikka',
    'footer.strength':'Voimaharjoittelu',
    'footer.cardio':  'Kestävyys',
    'footer.mobility':'Liikkuvuus',
    'footer.hiit':    'HIIT',
    'footer.yoga':    'Jooga & Palautuminen',
    'footer.about':   'Meistä',
    'footer.blog':    'Blogi',
    'footer.careers': 'Ura',
    'footer.press':   'Lehdistö',
    'footer.contact': 'Ota Yhteyttä',
    'footer.privacy': 'Tietosuojakäytäntö',
    'footer.terms':   'Käyttöehdot',
    'footer.cookies': 'Evästekäytäntö',
    'footer.gdpr':    'GDPR',
    'footer.copy':    '© 2026 V Fitness. Kaikki oikeudet pidätetään.',
    'footer.location':'Tehty intohimolla Suomessa ja maailmalla.',

    // Cookie
    'cookie.msg': 'Käytämme evästeitä kokemuksesi personoimiseen ja suorituskyvyn seurantaan.',

    // Nav auth
    'nav.login':     'Kirjaudu',
    'nav.dashboard': 'Kojelauta',

    // Auth modal
    'auth.login':          'Kirjaudu',
    'auth.signup':         'Rekisteröidy',
    'auth.welcome.login':  'Tervetuloa takaisin. Mennään töihin.',
    'auth.welcome.signup': 'Liity 50 000+ urheilijaan. Aloita ilmaiseksi.',
    'auth.email':          'Sähköposti',
    'auth.password':       'Salasana',
    'auth.forgot':         'Unohditko salasanan?',
    'auth.login.btn':      'Kirjaudu',
    'auth.firstname':      'Etunimi',
    'auth.lastname':       'Sukunimi',
    'auth.level':          'Kuntotaso',
    'auth.goal':           'Päätavoite',
    'auth.goal.strength':  'Voimaharjoittelu',
    'auth.goal.loss':      'Painonpudotus',
    'auth.goal.muscle':    'Lihaskasvatus',
    'auth.goal.endurance': 'Kestävyys',
    'auth.goal.mobility':  'Liikkuvuus',
    'auth.signup.btn':     'Luo Tili',
    'auth.terms':          'Rekisteröitymällä hyväksyt käyttöehtomme ja tietosuojakäytäntömme.',
    'auth.or':             'veya',
    'auth.guest':          'Jatka Vieraana',
    'auth.guest.badge':    'Ei tiliä tarvita',

    // Dashboard nav
    'db.overview':  'Yleiskatsaus',
    'db.programs':  'Omat Ohjelmat',
    'db.workouts':  'Harjoitukset',
    'db.nutrition': 'Ravinto',
    'db.progress':  'Edistyminen',
    'db.body':      'Kehon Tilastot',
    'db.settings':  'Asetukset',
    'db.logout':    'Kirjaudu Ulos',

    // Overview
    'db.overview.title': 'Yleiskatsaus',
    'db.streak':         'Putki (päiviä)',
    'db.totalWorkouts':  'Harjoituksia Yhteensä',
    'db.thisWeek':       'Tällä Viikolla',
    'db.totalHours':     'Tunteja Yhteensä',
    'db.weekly':         'Viikon Aktiivisuus',
    'db.todays.plan':    'Tämän Päivän Suunnitelma',
    'db.active':         'Aktiivinen',
    'db.recent':         'Viimeisimmät Harjoitukset',
    'db.viewall':        'Näytä Kaikki',
    'db.no.workouts':    'Ei harjoituksia vielä. Aloita ensimmäinen harjoituksesi!',
    'db.start':          'Aloita',
    'db.log':            'Kirjaa',

    // Programs
    'db.programs.title':  'Omat Ohjelmat',
    'db.no.programs':     'Ei aktiivisia ohjelmia. Selaa ohjelmia aloittaaksesi.',
    'db.browse.programs': 'Selaa Ohjelmia',

    // Workouts
    'db.workouts.title': 'Harjoituspäiväkirja',
    'db.log.workout':    'Kirjaa Harjoitus',
    'db.log.new':        'Kirjaa Uusi Harjoitus',
    'db.exercise':       'Harjoitus',
    'db.category':       'Kategoria',
    'db.sets':           'Sarjat',
    'db.reps':           'Toistot',
    'db.weight':         'Paino (kg)',
    'db.duration':       'Kesto (min)',
    'db.notes':          'Muistiinpanot',
    'db.save':           'Tallenna',
    'db.cancel':         'Peruuta',

    // Nutrition
    'db.nutrition.title': 'Ravinto',
    'db.macros':          'Päivittäiset Makrot',
    'db.log.meal':        'Kirjaa Ateria',
    'db.meal.type':       'Ateria',
    'db.meal.name':       'Kuvaus',
    'db.save.meal':       'Tallenna Ateria',
    'db.todays.meals':    'Tämän Päivän Ateriat',
    'db.no.meals':        'Ei aterioita kirjattu tänään.',

    // Progress
    'db.progress.title': 'Edistyminen',
    'db.bench.pr':       'Penkkipunnerrus EN',
    'db.deadlift.pr':    'Maastaveto EN',
    'db.weight.trend':   'Painon Kehitys',
    'db.personal.bests': 'Henkilökohtaiset Ennätykset',
    'db.add.pr':         'Lisää EN',
    'db.log.pr':         'Kirjaa Henkilökohtainen Ennätys',
    'db.no.prs':         'Ei henkilökohtaisia ennätyksiä vielä.',

    // Body
    'db.body.title':          'Kehon Tilastot',
    'db.add.measurement':     'Lisää Mittaus',
    'db.weight.kg':           'Paino (kg)',
    'db.bodyfat':             'Kehon Rasva %',
    'db.muscle.mass':         'Lihasmassa',
    'db.chest.cm':            'Rinta (cm)',
    'db.waist.cm':            'Vyötärö (cm)',
    'db.hips.cm':             'Lantio (cm)',
    'db.arms.cm':             'Käsivarret (cm)',
    'db.measurement.history': 'Mittaushistoria',
    'db.no.measurements':     'Ei mittauksia vielä.',

    // Settings
    'db.settings.title': 'Asetukset',
    'db.profile':        'Profiili',
    'db.subscription':   'Tilaus',
    'db.plan.desc':      'Päivitä Pro-tasolle rajattomaan käyttöön',
    'db.upgrade':        'Päivitä',
    'db.preferences':    'Asetukset',
    'db.language':       'Kieli',
    'db.units':          'Yksiköt',
    'db.danger.zone':    'Vaaravyöhyke',
    'db.save.profile':   'Tallenna Profiili',
    'db.saved':          'Tallennettu!',
  }
};

// ── State ─────────────────────────────────────────
let currentLang = localStorage.getItem('vfitness-lang') || 'en';
let isAnnual = false;

// ── Apply i18n ────────────────────────────────────
function applyLang(lang) {
  const strings = i18n[lang] || i18n.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (strings[key] === undefined) return;
    // Only set textContent on leaf nodes (no child elements).
    // Elements with child SVGs or spans must not be wiped.
    if (el.children.length === 0) {
      el.textContent = strings[key];
    } else {
      // Replace only the first TEXT node, preserving child elements
      let replaced = false;
      el.childNodes.forEach(node => {
        if (!replaced && node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          node.textContent = strings[key] + ' ';
          replaced = true;
        }
      });
      if (!replaced) el.textContent = strings[key];
    }
  });
  // Cookie message paragraph (has child anchor)
  const cookieMsg = document.getElementById('cookie-msg');
  if (cookieMsg) {
    const link = cookieMsg.querySelector('a');
    cookieMsg.textContent = (strings['cookie.msg'] || '') + ' ';
    if (link) {
      link.textContent = lang === 'fi' ? 'Tietosuojakäytäntö' : 'Privacy Policy';
      cookieMsg.appendChild(link);
    }
  }
  document.documentElement.lang = lang;
  const langLabel = document.getElementById('lang-label');
  if (langLabel) langLabel.textContent = lang === 'en' ? 'FI' : 'EN';
  localStorage.setItem('vfitness-lang', lang);
}

document.getElementById('lang-btn').addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'fi' : 'en';
  applyLang(currentLang);
});

// ── Navbar scroll ─────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ── Hamburger ─────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
  mobileMenu.setAttribute('aria-hidden', !open);
});
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  });
});

// ── Cookie Consent ────────────────────────────────
const cookieBanner = document.getElementById('cookie-banner');
const cookieKey = 'vfitness-cookies';

function hideCookie() {
  cookieBanner.classList.add('hidden');
  setTimeout(() => { cookieBanner.style.display = 'none'; }, 350);
}

if (localStorage.getItem(cookieKey)) {
  cookieBanner.style.display = 'none';
} else {
  setTimeout(() => { cookieBanner.style.opacity = '1'; }, 800);
}

document.getElementById('cookie-accept').addEventListener('click', () => {
  localStorage.setItem(cookieKey, 'accepted');
  hideCookie();
});
document.getElementById('cookie-decline').addEventListener('click', () => {
  localStorage.setItem(cookieKey, 'declined');
  hideCookie();
});

// ── Workout Filter ────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const workoutCards = document.querySelectorAll('.workout-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    workoutCards.forEach(card => {
      const match = filter === 'all' || card.getAttribute('data-category') === filter;
      card.classList.toggle('hidden', !match);
    });
  });
});

// ── Pricing Toggle ────────────────────────────────
const monthlyBtn = document.getElementById('billing-monthly');
const annualBtn  = document.getElementById('billing-annual');
const proPrice   = document.getElementById('pro-price');
const elitePrice = document.getElementById('elite-price');

const prices = {
  monthly: { pro: '€14.90', elite: '€29.90' },
  annual:  { pro: '€8.90',  elite: '€17.90' }
};

monthlyBtn.addEventListener('click', () => {
  isAnnual = false;
  monthlyBtn.classList.add('active');
  annualBtn.classList.remove('active');
  proPrice.textContent   = prices.monthly.pro;
  elitePrice.textContent = prices.monthly.elite;
});

annualBtn.addEventListener('click', () => {
  isAnnual = true;
  annualBtn.classList.add('active');
  monthlyBtn.classList.remove('active');
  proPrice.textContent   = prices.annual.pro;
  elitePrice.textContent = prices.annual.elite;
});

// ── Chart Period Buttons ──────────────────────────
document.querySelectorAll('.period-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.chart-period-btns')
       .querySelectorAll('.period-btn')
       .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ── Scroll Reveal ─────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.revealDelay || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

function addReveal(selector, stagger = 0) {
  document.querySelectorAll(selector).forEach((el, idx) => {
    el.classList.add('reveal');
    el.dataset.revealDelay = idx * stagger;
    revealObserver.observe(el);
  });
}

addReveal('.program-card',      80);
addReveal('.workout-card',      60);
addReveal('.feature-card',      80);
addReveal('.testimonial-card',  100);
addReveal('.pricing-card',      100);
addReveal('.progress-stat-card',80);
addReveal('.meal-card',         60);
addReveal('.section-header',    0);

// ── Smooth anchor navigation ──────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});

// ── Water cup toggle ──────────────────────────────
document.querySelectorAll('.water-cup').forEach(cup => {
  cup.addEventListener('click', () => cup.classList.toggle('filled'));
  cup.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cup.classList.toggle('filled');
    }
  });
});

// ── Init ──────────────────────────────────────────
applyLang(currentLang);
