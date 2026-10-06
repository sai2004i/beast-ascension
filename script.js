/* =========================================================
   BEAST ASCENSION ENGINE — ENTERPRISE TIER
========================================================= */

/* State Variables */
let trainingMode = localStorage.getItem("beastTrainingMode") || "gym";
let activeWorkout = null;
let workoutTimer = null;
let workoutStartTime = null;
let workoutPausedTime = 0;
let isWorkoutTimerRunning = false;
let workoutTimerWasStarted = false;
let completedSetIds = new Set();
let workoutSetCount = 0;
let workoutOpenedAt = null;
let activeWorkoutMode = "gym";
let workoutOpener = null;
let intelOpener = null;
let workoutDraftSaveTimer = null;
let restTimerInterval = null;
let restSecondsRemaining = 0;
let restTimerTotalSeconds = 60;
let restEndsAt = 0;
let restTimerPaused = false;
let calendarViewDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let weightTrendRangeDays = 30;
const ACTIVE_WORKOUT_DRAFT_KEY = "beastActiveWorkoutDraft";

/* Set-by-Set Split Timer State */
let exerciseSplitTimes = {};
let activeSplitIndex = null;
let splitTimerInterval = null;
let splitStartTime = null;

const defaultProgress = {
    workoutsCompleted: 0,
    level: 1,
    gyomei: 0,
    akaza: 0,
    toji: 0,
    baki: 0,
    fusion: 0,
    hybrid: 0,
    lastWorkoutDate: null,
    streak: 0
};

let beastProgress = { ...defaultProgress };
try {
    const saved = JSON.parse(localStorage.getItem("beastProgress"));
    if (saved && typeof saved === "object") beastProgress = { ...defaultProgress, ...saved };
} catch (_) {}

/* Workouts Catalog — Mapped Correctly */
const workouts = {
    gyomei: {
        owner: "🗿 GYOMEI — STRENGTH & SIZE",
        title: "TITAN STRENGTH",
        description: "Heavy compound movements designed to forge dense skeletal frame and immovable power.",
        image: "assets/gyomei.jpg",
        gym: [
            { name: "Barbell Back Squat", sets: "4 sets × 5–8 reps" },
            { name: "Barbell Bench Press", sets: "4 sets × 5–8 reps" },
            { name: "Romanian Deadlift", sets: "3 sets × 6–10 reps" },
            { name: "Weighted Pull-ups / Lat Pulldown", sets: "4 sets × 6–10 reps" },
            { name: "Leg Press", sets: "3 sets × 10–12 reps" },
            { name: "Standing Calf Raise", sets: "4 sets × 12–15 reps" }
        ],
        home: [
            { name: "Backpack Squats", sets: "4 sets × 12–20 reps" },
            { name: "Push-ups", sets: "4 sets × max controlled reps" },
            { name: "Bulgarian Split Squats", sets: "4 sets × 10–15 each leg" },
            { name: "Backpack Romanian Deadlift", sets: "4 sets × 12–15 reps" },
            { name: "Inverted Table Rows / Towel Rows", sets: "4 sets × 8–15 reps" },
            { name: "Single-leg Calf Raises", sets: "4 sets × 15–25 reps" }
        ]
    },
    akaza: {
        owner: "👊 AKAZA — EXPLOSIVE POWER",
        title: "DEMON FISTS",
        description: "Explosive kinetic push force, shoulder armor, and rapid combat hand combinations.",
        image: "assets/akaza.jpg",
        gym: [
            { name: "Barbell Bench Press", sets: "4 sets × 6–8 reps" },
            { name: "Standing Overhead Press", sets: "4 sets × 6–10 reps" },
            { name: "Incline Dumbbell Press", sets: "3 sets × 8–12 reps" },
            { name: "Medicine Ball Chest Pass", sets: "4 sets × 6 explosive throws" },
            { name: "Cable Triceps Pushdown", sets: "3 sets × 10–15 reps" },
            { name: "Lateral Raises", sets: "4 sets × 12–20 reps" },
            { name: "Fast Shadow Boxing", sets: "6 rounds × 30s fast / 30s rest" }
        ],
        home: [
            { name: "Explosive Push-ups", sets: "5 sets × 5–10 reps" },
            { name: "Pike Push-ups", sets: "4 sets × 8–15 reps" },
            { name: "Diamond Push-ups", sets: "3 sets × max controlled reps" },
            { name: "Backpack Overhead Press", sets: "4 sets × 10–15 reps" },
            { name: "Fast Shadow Boxing", sets: "6 rounds × 30s fast / 30s rest" }
        ]
    },
    toji: {
        owner: "⚡ TOJI — SPEED & ATHLETICISM",
        title: "HEAVENLY SPEED",
        description: "Zero cursed energy. Pure physical dominance, sprint mechanics, and fast twitch reactive agility.",
        image: "assets/toji.jpg",
        gym: [
            { name: "Box Jumps", sets: "5 sets × 3–5 explosive reps" },
            { name: "Jump Squats", sets: "4 sets × 6–10 reps" },
            { name: "Walking Lunges", sets: "3 sets × 12 each leg" },
            { name: "Sprint Intervals", sets: "8 × 40–60m max effort" },
            { name: "Hanging Knee Raises", sets: "4 sets × 10–15 reps" },
            { name: "Plank", sets: "3 sets × 45–60s" }
        ],
        home: [
            { name: "Sprint Intervals", sets: "8 × 40–60m sprints" },
            { name: "Broad Jumps", sets: "5 sets × 3–5 reps" },
            { name: "Jump Squats", sets: "4 sets × 8–12 reps" },
            { name: "Reverse Lunges", sets: "4 sets × 12 each leg" },
            { name: "Mountain Climbers", sets: "4 sets × 30s sprint" },
            { name: "Plank", sets: "4 sets × 45–60s" }
        ]
    },
    baki: {
        owner: "🐉 BAKI — RAW POWER",
        title: "MONSTER POWER",
        description: "Brutal posterior chain tension, crush grip, arm wrestling leverage, and combat conditioning.",
        image: "assets/baki.jpg",
        gym: [
            { name: "Deadlift", sets: "4 sets × 3–5 reps" },
            { name: "Pull-ups", sets: "4 sets × max reps" },
            { name: "Barbell Row", sets: "4 sets × 6–10 reps" },
            { name: "Farmer's Carry", sets: "4 rounds × 30–40m" },
            { name: "Hammer Curls", sets: "4 sets × 8–12 reps" },
            { name: "Hanging Leg Raises", sets: "3 sets × 10–15 reps" }
        ],
        home: [
            { name: "Pull-ups", sets: "5 sets × max reps" },
            { name: "Backpack Rows", sets: "4 sets × 10–20 reps" },
            { name: "Heavy Backpack Carry", sets: "4 rounds × 30–60s" },
            { name: "Backpack Hammer Curls", sets: "4 sets × 10–15 reps" },
            { name: "Towel Grip Hang", sets: "4 sets × 30–45s" },
            { name: "Floor Leg Raises", sets: "4 sets × 12–20 reps" }
        ]
    },
    fusion: {
        owner: "🗿⚡ GYOMEI + TOJI — FUSION",
        title: "BEAST ATHLETE",
        description: "Powerbuilding fusion blending heavy compound loads with rapid kinetic transitions.",
        image: "assets/day5.jpg",
        gym: [
            { name: "Front Squat", sets: "4 sets × 5–8 reps" },
            { name: "Push Press", sets: "4 sets × 5–8 reps" },
            { name: "Barbell Row", sets: "4 sets × 6–10 reps" },
            { name: "Explosive Push-ups", sets: "4 sets × 6–12 reps" },
            { name: "Walking Lunges", sets: "3 sets × 12 each leg" },
            { name: "Farmer's Carry", sets: "4 rounds × 30m" }
        ],
        home: [
            { name: "Backpack Front Squats", sets: "4 sets × 12–20 reps" },
            { name: "Explosive Push-ups", sets: "5 sets × 5–12 reps" },
            { name: "Backpack Rows", sets: "4 sets × 10–20 reps" },
            { name: "Walking Lunges", sets: "4 sets × 15 each leg" },
            { name: "Broad Jumps", sets: "5 sets × 3–5 reps" },
            { name: "Heavy Backpack Carry", sets: "4 rounds × 45s" }
        ]
    },
    hybrid: {
        owner: "⚔️ ALL 4 BEASTS — HYBRID ASCENSION",
        title: "ULTIMATE HYBRID",
        description: "The complete crucible combining size, rapid strikes, sprint speed, and visceral grip power.",
        image: "assets/hybrid.jpg",
        gym: [
            { name: "Barbell Squat", sets: "3 sets × 5–8 reps" },
            { name: "Barbell Bench Press", sets: "3 sets × 5–8 reps" },
            { name: "Pull-ups", sets: "3 sets × max reps" },
            { name: "Explosive Push-ups", sets: "3 sets × 6–12 reps" },
            { name: "Sprint Intervals", sets: "6 × 40m" },
            { name: "Farmer's Carry", sets: "3 rounds × 30m" },
            { name: "Hanging Leg Raises", sets: "3 sets × 10–15 reps" }
        ],
        home: [
            { name: "Backpack Squats", sets: "4 sets × 15–20 reps" },
            { name: "Push-ups", sets: "4 sets × max reps" },
            { name: "Pull-ups", sets: "4 sets × max reps" },
            { name: "Explosive Push-ups", sets: "4 sets × 5–10 reps" },
            { name: "Sprint Intervals", sets: "6 × 40m" },
            { name: "Heavy Backpack Carry", sets: "4 rounds × 45s" },
            { name: "Floor Leg Raises", sets: "4 sets × 15–20 reps" }
        ]
    }
};

const beastRanks = [
    { level: 1, icon: "🥉", name: "NOVICE BEAST", description: "The dawn of your path. Every legend starts somewhere." },
    { level: 5, icon: "🔥", name: "DEMON SLAYER INITIATE", description: "Unlocking initial physical fortitude and daily discipline." },
    { level: 10, icon: "⚡", name: "HASHIRA / HEAVENLY RESTRICTION", description: "Transcending normal biological thresholds through speed and power." },
    { level: 25, icon: "👹", name: "OGRE ASCENSION", description: "Pure savagery, dense hypertrophy, and unbreakable grip strength." },
    { level: 50, icon: "👑", name: "ULTIMATE BEAST", description: "The pinnacle of the Four Beast system. A legendary force." }
];

const beastAchievements = [
    { id: "first_workout", icon: "🥉", title: "FIRST BLOOD", description: "Complete your first workout.", unlocked: p => p.workoutsCompleted >= 1 },
    { id: "warrior_7", icon: "🔥", title: "7-DAY WARRIOR", description: "Build a 7-day workout streak.", unlocked: p => p.streak >= 7 },
    { id: "beast_25", icon: "💀", title: "BEAST MODE", description: "Complete 25 total workouts.", unlocked: p => p.workoutsCompleted >= 25 },
    { id: "unstoppable_100", icon: "⚡", title: "UNSTOPPABLE", description: "Complete 100 total workouts.", unlocked: p => p.workoutsCompleted >= 100 },
    { id: "ultimate_beast", icon: "👑", title: "ULTIMATE BEAST", description: "Reach Level 50 and ascend.", unlocked: p => p.level >= 50 }
];

/* =========================================================
   BEAST EXERCISE INTELLIGENCE DATABASE
========================================================= */
const exerciseIntel = {
    "Barbell Back Squat": {
        targets: "Quadriceps, Gluteus Maximus, Adductors, Spinal Erectors, Core",
        dailyLife: "Builds absolute knee stability, effortless sit-to-stand posture, lower back endurance, and heavy lifting leverage from the floor.",
        transformation: "Thickens thighs, develops massive leg density, drives human growth hormone production, and creates immovable foundational stability.",
        howTo: [
            "Set bar across upper trapezius (high-bar) or rear delts (low-bar).",
            "Unrack, step back, set feet slightly wider than shoulder-width with toes flared out 15–30 degrees.",
            "Inhale deep into your diaphragm and brace your core like preparing for a strike.",
            "Descend by breaking simultaneously at hips and knees until thighs are below parallel.",
            "Drive up through mid-foot, maintaining a rigid spine and proud chest."
        ]
    },
    "Barbell Squat": {
        targets: "Quadriceps, Gluteus Maximus, Adductors, Spinal Erectors, Core",
        dailyLife: "Builds absolute knee stability, effortless sit-to-stand posture, lower back endurance, and heavy lifting leverage from the floor.",
        transformation: "Thickens thighs, develops massive leg density, drives human growth hormone production, and creates immovable foundational stability.",
        howTo: [
            "Set bar across upper trapezius or rear deltoids.",
            "Unrack and step back, setting feet shoulder-width apart.",
            "Brace core and descend hips down until thighs hit parallel.",
            "Drive upwards through mid-foot with power."
        ]
    },
    "Barbell Bench Press": {
        targets: "Pectoralis Major, Anterior Deltoids, Triceps Brachii",
        dailyLife: "Empowers raw pushing leverage (moving heavy objects, shoving, self-defense bracing) while protecting the shoulder capsule.",
        transformation: "Forges dense upper armor, slabs of chest mass, thick triceps lockouts, and powerful kinetic torso drive.",
        howTo: [
            "Lie flat with eyes beneath the racked bar; plant feet flat on the floor.",
            "Grip slightly wider than shoulder-width, retract and depress shoulder blades into the bench.",
            "Unrack bar over chest, lower with control to mid-sternum with elbows tucked roughly 45–70 degrees.",
            "Touch chest softly without bouncing, then explode vertically and slightly back toward the rack."
        ]
    },
    "Romanian Deadlift": {
        targets: "Hamstrings, Glute Complex, Erector Spinae, Latissimus Dorsi",
        dailyLife: "Eliminates chronic lower-back vulnerability, masters the hip-hinge mechanics required to pick up heavy loads safely, and bulletproofs knees.",
        transformation: "Builds dense posterior hamstring sweep, glute shelf power, and a reinforced spinal erector column.",
        howTo: [
            "Hold barbell at hip height with an overhand grip, shoulders back and knees softly unlocked.",
            "Push hips backwards as if trying to touch a wall behind you with your glutes.",
            "Lower bar down close along your shins until hamstrings reach full active stretch (just below knee).",
            "Squeeze glutes forward to return to an erect lockout without hyper-extending the lower back."
        ]
    },
    "Weighted Pull-ups / Lat Pulldown": {
        targets: "Latissimus Dorsi, Teres Major, Rhomboids, Biceps, Forearm Flexors",
        dailyLife: "Mastery of your own bodyweight, climbing, pulling objects toward you, and counteracting slumped desk posture.",
        transformation: "Widens upper back into a dramatic V-taper demon back silhouette and creates powerful arms and gripping claws.",
        howTo: [
            "Grip bar wider than shoulder-width with overhand or neutral palms.",
            "Initiate the pull by pulling shoulder blades down and back, not just pulling with elbows.",
            "Drive elbows down toward hip pockets until chin easily clears the bar.",
            "Lower under full 2–3 second eccentric control to a full dead-hang stretch."
        ]
    },
    "Leg Press": {
        targets: "Quadriceps (Vastus Medialis/Lateralis), Glutes",
        dailyLife: "Builds high-volume knee tendon durability and pure leg drive without placing axial compressive stress on the spine.",
        transformation: "Massive quad hypertrophy and teardrop development above the knee joint.",
        howTo: [
            "Position back and hips flat against the pads; place feet mid-plate shoulder-width apart.",
            "Release safety lock and lower sled until knees form a clean 90-degree angle without tailbone curling off pad.",
            "Press smoothly back up through mid-foot and heels without violently hyperextending or locking knees at the top."
        ]
    },
    "Standing Calf Raise": {
        targets: "Gastrocnemius, Soleus, Achilles Tendon",
        dailyLife: "Absorbs ground reaction force while walking, running, or landing; guards against ankle sprains and plantar fasciitis.",
        transformation: "Carves diamond-cut lower leg aesthetics and elastic ankle spring.",
        howTo: [
            "Place balls of feet on elevated ledge; let heels drop into full deep calf stretch.",
            "Drive up onto big toes with maximum contraction, pausing 1 full second at peak height.",
            "Descend slowly over 3 seconds down to the deepest safe stretch."
        ]
    },
    "Standing Overhead Press": {
        targets: "Anterior & Lateral Deltoids, Clavicular Pec, Triceps, Trapezius, Core",
        dailyLife: "Lifting loads overhead with ease, rock-solid standing balance, and total shoulder stability under compression.",
        transformation: "Broad boulder shoulders, thick upper traps, and an immovable trunk.",
        howTo: [
            "Grip barbell at shoulder width resting across clavicles, elbows slightly forward.",
            "Squeeze glutes and abs tight to lock your spine.",
            "Press straight up, tilting head back slightly to clear the chin, then push head through as the bar locks overhead."
        ]
    },
    "Incline Dumbbell Press": {
        targets: "Upper Pectoralis (Clavicular Head), Anterior Deltoid, Triceps",
        dailyLife: "Upward pushing power, athletic chest bracing, and overhead stability.",
        transformation: "Fills in upper chest shelf beneath the collarbone for full armour plate aesthetics.",
        howTo: [
            "Set incline bench to 30–45 degrees.",
            "Kick dumbbells up to shoulder line, pull shoulder blades into the bench.",
            "Press up in a gentle arc, squeezing upper pecs at the peak without clacking weights together."
        ]
    },
    "Medicine Ball Chest Pass": {
        targets: "Pectorals, Triceps, Anterior Core, Serratus Anterior",
        dailyLife: "Explosive kinetic impulse, martial arts striking push, and rapid chest-arm twitch reflex.",
        transformation: "Recruits high-threshold motor units for blindingly fast, explosive upper-body speed.",
        howTo: [
            "Stand in athletic staggered stance holding medicine ball at sternum.",
            "Brace core and throw the ball horizontally into a solid wall or partner with maximum violent intention.",
            "Catch rebounding ball or reset instantly for repetitive explosive bursts."
        ]
    },
    "Cable Triceps Pushdown": {
        targets: "Triceps Brachii (Lateral & Medial Heads)",
        dailyLife: "Pushing doors, locking out elbows safely, and joint resilience against hyperextension injuries.",
        transformation: "Thickens horseshoe triceps arm silhouette.",
        howTo: [
            "Pin elbows securely against your torso ribs.",
            "Push rope or bar down until arms lock straight, flaring the rope outward at the bottom.",
            "Return slowly to 90 degrees without letting elbows drift forward."
        ]
    },
    "Lateral Raises": {
        targets: "Lateral Deltoid",
        dailyLife: "Shields shoulder rotators from dynamic shear stresses when lifting items sideways.",
        transformation: "Widening shoulder breadth to achieve the anime physique silhouette.",
        howTo: [
            "Hold dumbbells at sides with slight forward torso lean.",
            "Raise arms out to sides leading with elbows until parallel with shoulders.",
            "Pause briefly at peak, avoiding swinging with your lower back."
        ]
    },
    "Fast Shadow Boxing": {
        targets: "Shoulder Endurance, Rotator Cuff, Obliques, Cardiovascular System",
        dailyLife: "Razor-sharp hand-eye coordination, reaction timing, stress release, and stamina.",
        transformation: "Leans out fat reserves, conditions core rotation, and makes arms whip-fast.",
        howTo: [
            "Adopt fighting stance, hands guarding chin, elbows tucked.",
            "Throw rapid 1-2 punch combos, hooks, and slips with full kinetic rotation through hips.",
            "Snap fists back instantly to chin after every throw."
        ]
    },
    "Box Jumps": {
        targets: "Quadriceps, Glutes, Calves, Hip Flexors",
        dailyLife: "Triphasic explosive power, vertical jumping capability, and confident obstacle clearance.",
        transformation: "Converts muscle mass into real-world leaping velocity and elastic athleticism.",
        howTo: [
            "Stand facing plyo box in athletic ready stance.",
            "Hinge hips back and swing arms behind you, then explode upwards.",
            "Land softly on the box in a partial squat, absorbing impact smoothly.",
            "Step down carefully—do not rebound jump backwards to protect Achilles tendons."
        ]
    },
    "Jump Squats": {
        targets: "Quadriceps, Gluteal Complex, Calves",
        dailyLife: "Sprinting acceleration, quick court cuts, and high-intensity lower body conditioning.",
        transformation: "Forges springy, explosive legs capable of launch power at any second.",
        howTo: [
            "Squat down to quarter or half squat depth.",
            "Explode upwards into the air with maximum force.",
            "Land lightly through toe-to-heel mechanics and flow directly into the next rep."
        ]
    },
    "Walking Lunges": {
        targets: "Quadriceps, Glutes, Hamstrings, Adductors, Core",
        dailyLife: "Single-leg balance, pelvic alignment, stair climbing ease, and injury prevention on uneven terrain.",
        transformation: "Deep quad separation and functional hip-stabilizer muscle thickness.",
        howTo: [
            "Step forward with torso upright.",
            "Lower back knee down toward floor until both knees hit 90-degree bends.",
            "Drive through front heel to step straight into the next forward lunge step."
        ]
    },
    "Sprint Intervals": {
        targets: "Whole-body kinetic chain, Hamstrings, Glutes, Core, Cardiovascular System",
        dailyLife: "Maximal cardiovascular VO2 peak, fast-twitch motor unit recruitment, and functional survival speed.",
        transformation: "Burns visceral body fat rapidly, hardens abdominal musculature, and produces athletic speed.",
        howTo: [
            "Accelerate smooth and hard into 100% maximum sprint speed over 40–60 meters.",
            "Maintain high knee drive, aggressive backward arm pump, and dorsiflexed toes.",
            "Decelerate gradually; walk back slowly to recover before the next round."
        ]
    },
    "Hanging Knee Raises": {
        targets: "Rectus Abdominis, Obliques, Hip Flexors, Forearm Grip",
        dailyLife: "Protects lower back from hyper-lordosis, stabilizes pelvis during walking/running.",
        transformation: "Deep six-pack block development and powerful lower-core contraction strength.",
        howTo: [
            "Hang from pull-up bar with straight arms and shoulders engaged.",
            "Pull knees up toward chest by curling your pelvis upward, not just swinging legs.",
            "Lower legs slowly without building swinging momentum."
        ]
    },
    "Plank": {
        targets: "Transverse Abdominis, Rectus Abdominis, Glutes, Shoulders",
        dailyLife: "Total torso rigidity, preventing lumbar spine injuries under load.",
        transformation: "Tucks waistline tightly and creates an iron shield around internal organs.",
        howTo: [
            "Rest on forearms and toes, elbows stacked under shoulders.",
            "Squeeze glutes, quads, and pull belly button toward spine.",
            "Hold an unbroken straight line from heels to crown of head."
        ]
    },
    "Deadlift": {
        targets: "Entire Posterior Chain: Spinal Erectors, Glutes, Hamstrings, Lats, Traps, Forearms",
        dailyLife: "Unshakable total-body power. Makes picking up heavy couches, luggage, or tools effortless and safe.",
        transformation: "Builds wide back thickness, brutal neck/trap development, and raw primal strength.",
        howTo: [
            "Step up to bar with feet hip-width apart; bar cuts across mid-foot.",
            "Hinge down and grip bar outside legs; wedge hips down until shins touch bar.",
            "Pack lats, flatten back, take deep diaphragmatic breath.",
            "Push floor away with legs until fully upright; finish by locking hips and knees."
        ]
    },
    "Pull-ups": {
        targets: "Lats, Biceps, Brachialis, Rhomboids, Core",
        dailyLife: "Pulling yourself up over barriers, climbing obstacles, and upper-body power-to-weight mastery.",
        transformation: "Creates wide demon wings (latissimus) and dense arm thickness.",
        howTo: [
            "Grab bar overhead with overhand grip slightly outside shoulders.",
            "Engage shoulder blades downwards; pull chest toward the bar.",
            "Clear chin over bar smoothly, pause, and lower to full dead hang."
        ]
    },
    "Barbell Row": {
        targets: "Latissimus Dorsi, Rhomboids, Middle Trapezius, Posterior Deltoid, Biceps",
        dailyLife: "Pulling heavy items toward your body, reinforced back posture, eliminating shoulder roundness.",
        transformation: "Massive upper-back 3D landscape and dense arm pulling musculature.",
        howTo: [
            "Hinge at hips with torso bent forward at approximately 45 degrees, keeping back flat.",
            "Grip barbell overhand and pull bar up toward lower ribcage / navel.",
            "Squeeze shoulder blades hard at peak, then lower bar smoothly under full control."
        ]
    },
    "Farmer's Carry": {
        targets: "Trapezius, Forearm Grip, Core Obliques, Quadriceps, Calves",
        dailyLife: "Carrying groceries, suitcases, and materials for miles without tiring; unbreakable grip strength.",
        transformation: "Enormous bull neck and thick vascular forearms.",
        howTo: [
            "Deadlift heavy weights (dumbbells or trap bar) cleanly to your sides.",
            "Keep chest tall, shoulders back, and abs braced.",
            "Take quick, controlled, heel-to-toe paces for distance without swaying."
        ]
    },
    "Hammer Curls": {
        targets: "Brachialis, Brachioradialis, Biceps Brachii",
        dailyLife: "Arm flex power with neutral wrist grip, lifting boxes, and elbow tendon protection.",
        transformation: "Pushes biceps peak higher by building the underlying brachialis and thickens forearms.",
        howTo: [
            "Hold dumbbells at sides with palms facing inward toward each other.",
            "Curl weights up keeping palms facing inward throughout the movement.",
            "Squeeze hard at the peak, then lower under control for 2–3 seconds."
        ]
    },
    "Hanging Leg Raises": {
        targets: "Lower Rectus Abdominis, Hip Flexors, Forearms",
        dailyLife: "High kicking agility, gymnastic core control, and pelvic stability.",
        transformation: "Cuts deep horizontal lines into abdominal wall and builds grip endurance.",
        howTo: [
            "Hang from bar with overhand grip.",
            "Keeping legs as straight as possible, raise feet up to bar level by flexing abs.",
            "Lower slowly without swinging backward."
        ]
    },
    "Front Squat": {
        targets: "Quadriceps, Upper Back, Core Abdominals",
        dailyLife: "Carrying heavy weights in front of torso, upright posture, and knee shock absorption.",
        transformation: "Maximum quad focus with zero lower back strain; forces rigid thoracic extension.",
        howTo: [
            "Rest bar across anterior deltoids with fingertips under bar (clean grip) or arms crossed.",
            "Keep elbows pointed high and chest tall throughout the descent.",
            "Squat deep between knees; drive up leading through elbows."
        ]
    },
    "Push Press": {
        targets: "Deltoids, Triceps, Core, Glutes, Calves",
        dailyLife: "Transferring kinetic force from legs through arms—crucial in athletic sports and martial arts.",
        transformation: "Full body explosive power and dense 3D shoulder growth.",
        howTo: [
            "Rack bar at shoulders; dip knees down 2–4 inches in vertical dip.",
            "Drive violently through heels to pop the bar off shoulders.",
            "Press through with arms as momentum transfers, locking out overhead."
        ]
    },
    "Explosive Push-ups": {
        targets: "Pectorals, Triceps, Serratus Anterior, Deltoids",
        dailyLife: "Quick pushing reflex, break-fall reaction, and martial arts strike velocity.",
        transformation: "Fast-twitch fiber recruiting for rapid upper-body push power.",
        howTo: [
            "Assume plank push-up position.",
            "Lower chest to floor, then press up with maximum acceleration so hands leave the floor.",
            "Land softly with slightly bent arms and repeat instantly."
        ]
    },
    "Backpack Squats": {
        targets: "Quadriceps, Glutes, Hamstrings, Core",
        dailyLife: "Endurance leg strength, carrying rucks, hiking resilience.",
        transformation: "High-volume leg muscle endurance and definition.",
        howTo: [
            "Wear a sturdy weighted backpack strapped tightly across shoulders.",
            "Perform deep, controlled squats keeping chest up and weight on mid-foot."
        ]
    },
    "Push-ups": {
        targets: "Pectoralis Major, Triceps, Anterior Deltoids, Core",
        dailyLife: "Fundamental push strength, posture, and core stability.",
        transformation: "Sculpted chest, lean triceps, and iron plank line.",
        howTo: [
            "Place hands shoulder-width apart, body forming a straight plank line.",
            "Lower chest until touching floor, then press all the way back to full arm lockout."
        ]
    },
    "Bulgarian Split Squats": {
        targets: "Quadriceps, Gluteus Medius/Maximus, Core",
        dailyLife: "Single-leg balance, fixing muscle imbalances between legs.",
        transformation: "Targeted quad teardrop development and deep glute sculpting.",
        howTo: [
            "Place one foot elevated behind you on a couch/chair.",
            "Lower hips until front thigh is parallel to ground, then drive up through front heel."
        ]
    },
    "Backpack Romanian Deadlift": {
        targets: "Hamstrings, Glutes, Lower Back",
        dailyLife: "Safe lifting mechanics and strong hip hinges.",
        transformation: "Tight hamstrings and lower-back resilience without heavy gym iron.",
        howTo: [
            "Hold weighted backpack by handles in front of thighs.",
            "Hinge hips backward, keeping spine flat until hamstrings stretch, then snap hips forward."
        ]
    },
    "Inverted Table Rows / Towel Rows": {
        targets: "Lats, Rhomboids, Biceps, Grip",
        dailyLife: "Upper back pulling capacity using home furniture.",
        transformation: "Counters rounded shoulders and builds V-taper at home.",
        howTo: [
            "Lie underneath a sturdy table, grip table edge with overhand grip.",
            "Pull chest up to table underside while keeping body rigid as a plank."
        ]
    },
    "Single-leg Calf Raises": {
        targets: "Calves, Ankle Stabilizers",
        dailyLife: "Single-foot balance, ankle sprain resistance.",
        transformation: "Sharp calf definition using bodyweight resistance.",
        howTo: [
            "Balance on ball of one foot on a stair edge; lower heel to full stretch, then press to maximum height."
        ]
    },
    "Pike Push-ups": {
        targets: "Anterior Deltoids, Triceps, Upper Chest",
        dailyLife: "Calisthenic overhead pushing mastery and shoulder health.",
        transformation: "Shoulder cap development simulating handstand push-ups.",
        howTo: [
            "Assume push-up position, then walk feet forward until hips are hinged high in an inverted V-shape.",
            "Lower head toward floor between hands, then press back up along the same angle."
        ]
    },
    "Diamond Push-ups": {
        targets: "Triceps, Inner Pectorals",
        dailyLife: "Close-grip arm pushing and elbow joint strength.",
        transformation: "Dense triceps thickness and deep chest line separation.",
        howTo: [
            "Form a diamond shape with thumbs and index fingers beneath sternum.",
            "Lower chest to touch hands and press back up to full triceps lockout."
        ]
    },
    "Backpack Overhead Press": {
        targets: "Deltoids, Upper Traps, Triceps",
        dailyLife: "Lifting packages or gear overhead at home.",
        transformation: "Shoulder rounding and deltoid fullness.",
        howTo: [
            "Hold weighted backpack by its sides at collarbone height.",
            "Press straight overhead to lockout without hyperextending lower back."
        ]
    },
    "Broad Jumps": {
        targets: "Glutes, Hamstrings, Quads, Calves",
        dailyLife: "Horizontal leaping power, athletic agility, and quick evasion.",
        transformation: "Fast-twitch sprint motor unit activation.",
        howTo: [
            "Hinge hips back, swing arms behind, and leap as far forward as possible.",
            "Land softly in a balanced athletic squat."
        ]
    },
    "Mountain Climbers": {
        targets: "Core, Hip Flexors, Deltoids, Conditioning",
        dailyLife: "High-tempo metabolic stamina and abdominal endurance.",
        transformation: "Melts subcutaneous fat and sharpens abdominal definition.",
        howTo: [
            "Start in high plank position.",
            "Drive knees toward chest in rapid alternating running motion without bouncing hips."
        ]
    },
    "Heavy Backpack Carry": {
        targets: "Trapezius, Forearms, Core, Calves",
        dailyLife: "Endurance under load, rucking capability.",
        transformation: "Core stiffness and shoulder endurance.",
        howTo: [
            "Hug weighted backpack against chest or carry in one hand and walk tall."
        ]
    },
    "Backpack Rows": {
        targets: "Lats, Rhomboids, Biceps",
        dailyLife: "Pulling power, posture correction.",
        transformation: "Mid-back thickness.",
        howTo: [
            "Hinge forward at hips holding backpack handles.",
            "Row backpack smoothly into lower abdomen, squeezing shoulder blades together."
        ]
    },
    "Backpack Hammer Curls": {
        targets: "Brachialis, Biceps, Forearms",
        dailyLife: "Arm lifting strength.",
        transformation: "Thick arm development at home.",
        howTo: [
            "Hold side straps of backpack.",
            "Curl upward keeping elbows steady against torso ribs."
        ]
    },
    "Backpack Front Squats": {
        targets: "Quadriceps, Core",
        dailyLife: "Front load mechanics and quad endurance.",
        transformation: "Upper quad hypertrophy.",
        howTo: [
            "Hold backpack close across upper chest.",
            "Perform deep squats while keeping torso strictly vertical."
        ]
    },
    "Towel Grip Hang": {
        targets: "Forearm Flexors, Finger Tenacity",
        dailyLife: "Grip endurance, saving hands from fatigue.",
        transformation: "Vascular, dense forearm development.",
        howTo: [
            "Drape two towels over a bar, grab towels tightly, and hang with feet off floor for time."
        ]
    },
    "Floor Leg Raises": {
        targets: "Lower Rectus Abdominis, Hip Flexors",
        dailyLife: "Core bracing and pelvic positioning.",
        transformation: "Flattens waistline and sculpts lower abs.",
        howTo: [
            "Lie flat on back with hands beneath hips for support.",
            "Raise straight legs to 90 degrees, pause, and lower slowly without letting heels touch floor."
        ]
    },
    "Reverse Lunges": {
        targets: "Glutes, Hamstrings, Quads",
        dailyLife: "Knee-friendly lunge variations, deceleration balance.",
        transformation: "Glute-ham tie-in development.",
        howTo: [
            "Step backward with one leg and drop back knee toward ground.",
            "Drive forward through front heel to return to start position."
        ]
    }
};

/* =========================================
   POLYPHONIC AUDIO SYNTHESIS & HAPTICS
========================================= */
let globalAudioCtx = null;

function getAudioContext() {
    if (!globalAudioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) globalAudioCtx = new AudioCtx();
    }
    return globalAudioCtx;
}

function unlockWebAudio() {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
        ctx.resume();
    }
}
["touchstart", "touchend", "pointerdown", "click"].forEach(event => {
    document.addEventListener(event, unlockWebAudio, { once: true, passive: true });
});

function beastAudioEnabled() {
    try {
        const s = JSON.parse(localStorage.getItem("beastSettings")) || {};
        return s.soundEnabled !== false;
    } catch (_) { return true; }
}

function playBeastTone(type = "click") {
    if (!beastAudioEnabled()) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume();

        const profiles = {
            click: [[380, 0.05], [520, 0.07]],
            rest: [[440, 0.09], [554, 0.12]],
            warning: [[660, 0.08], [660, 0.08]],
            victory: [[523, 0.12], [659, 0.12], [784, 0.14], [1046, 0.28]],
            achievement: [[440, 0.1], [554, 0.1], [659, 0.1], [880, 0.3]]
        };
        const chord = profiles[type] || profiles.click;
        let offset = 0;
        chord.forEach(([freq, duration]) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type === "victory" ? "sawtooth" : "triangle";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + offset);
            gain.gain.setValueAtTime(0.001, ctx.currentTime + offset);
            gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + offset + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + offset);
            osc.stop(ctx.currentTime + offset + duration + 0.02);
            offset += duration + 0.03;
        });
    } catch (_) {}
}

function vibrateBeast(pattern = 40) {
    if (!beastAudioEnabled()) return;
    if ("vibrate" in navigator) navigator.vibrate(pattern);
}

/* Formatters */
function formatWorkoutTime(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0));
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
}

function formatRestTime(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0));
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function formatSplitTime(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0));
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
}

function dateKey(dateInput) {
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* Mode Selection */
window.setTrainingMode = function (mode) {
    trainingMode = mode === "home" ? "home" : "gym";
    localStorage.setItem("beastTrainingMode", trainingMode);

    const gymBtn = document.getElementById("gymModeBtn");
    const homeBtn = document.getElementById("homeModeBtn");
    const settingsSelect = document.getElementById("settingsTrainingMode");

    if (gymBtn && homeBtn) {
        gymBtn.classList.toggle("active", trainingMode === "gym");
        homeBtn.classList.toggle("active", trainingMode === "home");
    }
    if (settingsSelect) settingsSelect.value = trainingMode;
};

/* Page Navigation */
window.showPage = function (pageName) {
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active-page"));
    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.remove("active");
        button.removeAttribute("aria-current");
    });
    const targetPage = document.getElementById(`${pageName}Page`);
    const activeNav = document.querySelector(`.nav-item[data-page="${pageName}"]`);
    if (!targetPage) return;
    targetPage.classList.add("active-page");
    if (activeNav) {
        activeNav.classList.add("active");
        activeNav.setAttribute("aria-current", "page");
    }
    if (pageName === "nutrition") renderNutrition();
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
};

window.startTodayWorkout = function () {
    if (getActiveWorkoutDraft()) {
        resumeWorkout();
        return;
    }
    const plan = getTodayWorkout();
    if (!plan.workout) {
        showPage("workout");
        return;
    }
    const loggedToday = getWorkoutHistory().some(entry => dateKey(entry.date) === dateKey(new Date()));
    if (loggedToday) showPage("progress");
    else startWorkout(plan.key);
};

function getTodayWorkout() {
    const day = new Date().getDay();
    const schedule = [null, "gyomei", "akaza", "toji", "baki", "fusion", "hybrid"];
    const key = schedule[day];
    return { key, workout: key ? workouts[key] : null, dayName: new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(new Date()) };
}

function renderTodayOverview() {
    const eyebrow = document.getElementById("todayEyebrow");
    const title = document.getElementById("todayTitle");
    const description = document.getElementById("todayDescription");
    const status = document.getElementById("todayStatus");
    const action = document.getElementById("todayAction");
    if (!eyebrow || !title || !description || !status || !action) return;
    const draft = getActiveWorkoutDraft();
    if (draft && workouts[draft.workout]) {
        eyebrow.textContent = "READY TO CONTINUE";
        title.textContent = workouts[draft.workout].title.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
        description.textContent = "Your saved session is ready. Your set entries are waiting where you left them.";
        status.textContent = "SESSION SAVED";
        action.textContent = "Resume workout";
        return;
    }
    const plan = getTodayWorkout();
    const loggedToday = getWorkoutHistory().some(entry => dateKey(entry.date) === dateKey(new Date()));
    eyebrow.textContent = plan.dayName;
    if (!plan.workout) {
        title.textContent = "Recovery day";
        description.textContent = "Take a rest day, hydrate, and let your training settle in.";
        status.textContent = "REST";
        action.textContent = "Explore your plan";
        return;
    }
    title.textContent = plan.workout.title.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    description.textContent = `${plan.workout.description} About 45–90 minutes.`;
    status.textContent = loggedToday ? "SESSION LOGGED" : "TODAY'S SESSION";
    action.textContent = loggedToday ? "View today's progress" : "Start today's workout";
};

function renderHomeSnapshot() {
    const sessionsValue = document.getElementById("homeSessionsValue");
    const sessionsDetail = document.getElementById("homeSessionsDetail");
    const proteinValue = document.getElementById("homeProteinValue");
    const proteinDetail = document.getElementById("homeProteinDetail");
    const proteinProgress = document.getElementById("homeProteinProgress");
    const proteinFill = proteinProgress?.querySelector("span");
    const weightValue = document.getElementById("homeWeightValue");
    const weightDetail = document.getElementById("homeWeightDetail");
    if (!sessionsValue || !proteinValue || !weightValue) return;

    const today = new Date();
    const todayKey = dateKey(today);
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    const startKey = dateKey(weekStart);
    const workoutHistory = getWorkoutHistory();
    const sessions = workoutHistory.filter(entry => {
        const key = dateKey(entry.date);
        return key && key >= startKey && key <= todayKey;
    }).length;
    sessionsValue.textContent = String(sessions);
    if (sessionsDetail) sessionsDetail.textContent = sessions === 1 ? "session in the last 7 days" : "sessions in the last 7 days";
    const insight = document.getElementById("homeTrainingInsight");
    if (insight) {
        const previousStart = dateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 13));
        const previousSessions = workoutHistory.filter(entry => {
            const key = dateKey(entry.date);
            return key && key >= previousStart && key < startKey;
        }).length;
        if (sessions === 0 && previousSessions === 0) {
            insight.textContent = "No sessions logged in the last 14 days. Log your next session to restart your weekly rhythm.";
        } else if (sessions > previousSessions) {
            insight.textContent = "You logged " + sessions + (sessions === 1 ? " session" : " sessions") + " in the last 7 days, up from " + previousSessions + " in the previous 7.";
        } else if (sessions < previousSessions) {
            insight.textContent = "You logged " + sessions + (sessions === 1 ? " session" : " sessions") + " in the last 7 days, down from " + previousSessions + " in the previous 7.";
        } else {
            insight.textContent = "You matched the previous 7 days with " + sessions + (sessions === 1 ? " session." : " sessions.");
        }
    }

    const goals = getNutritionGoals();
    const proteinTarget = Number(goals?.protein) || 0;
    const protein = getNutritionHistory().filter(entry => entry.type === "food" && dateKey(entry.date) === todayKey)
        .reduce((total, entry) => total + (Number(entry.protein) || 0), 0);
    if (proteinTarget > 0) {
        const remaining = Math.max(0, proteinTarget - protein);
        proteinValue.textContent = `${Math.round(protein)} / ${Math.round(proteinTarget)} g`;
        if (proteinDetail) proteinDetail.textContent = remaining ? `${Math.round(remaining)} g remaining today` : "Daily target reached";
        if (proteinProgress) {
            proteinProgress.setAttribute("aria-valuemax", String(Math.round(proteinTarget)));
            proteinProgress.setAttribute("aria-valuenow", String(Math.min(Math.round(proteinTarget), Math.round(protein))));
        }
        if (proteinFill) proteinFill.style.width = `${Math.min(100, protein / proteinTarget * 100)}%`;
    } else {
        proteinValue.textContent = "No target";
        if (proteinDetail) proteinDetail.textContent = "Set one to track daily intake";
        if (proteinProgress) {
            proteinProgress.setAttribute("aria-valuemax", "0");
            proteinProgress.setAttribute("aria-valuenow", "0");
        }
        if (proteinFill) proteinFill.style.width = "0%";
    }

    const latestWeight = getWeightHistory()[0];
    weightValue.textContent = latestWeight ? `${Number(latestWeight.weight).toLocaleString()} kg` : "—";
    if (weightDetail) weightDetail.textContent = latestWeight ? `Last logged ${new Date(latestWeight.date).toLocaleDateString()}` : "No weigh-in logged";
}

window.scrollToWorkout = function () {
    const target = document.getElementById("trainingSection");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
};

/* =========================================================
   MANUAL WORKOUT TIMER CONTROLLER
========================================================= */
window.toggleWorkoutTimer = function () {
    const toggleBtn = document.getElementById("timerToggleBtn");
    const timerDisplay = document.getElementById("workoutTimer");
    if (!toggleBtn || !timerDisplay) return;

    if (!isWorkoutTimerRunning) {
        isWorkoutTimerRunning = true;
        workoutTimerWasStarted = true;
        workoutStartTime = Date.now() - workoutPausedTime;
        clearInterval(workoutTimer);
        workoutTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - workoutStartTime) / 1000);
            timerDisplay.textContent = formatWorkoutTime(elapsed);
        }, 1000);

        toggleBtn.textContent = "Pause timer";
        toggleBtn.setAttribute("aria-pressed", "true");
        toggleBtn.classList.add("running");
        playBeastTone("click");
        vibrateBeast(30);
    } else {
        isWorkoutTimerRunning = false;
        clearInterval(workoutTimer);
        workoutPausedTime = Date.now() - workoutStartTime;

        toggleBtn.textContent = "Resume timer";
        toggleBtn.setAttribute("aria-pressed", "false");
        toggleBtn.classList.remove("running");
        playBeastTone("click");
    }
    persistWorkoutDraft();
};

/* =========================================================
   EXERCISE-BY-EXERCISE SPLIT TIMER
========================================================= */
window.toggleExerciseSplit = function (index) {
    const splitBtn = document.getElementById(`splitBtn_${index}`);
    const splitBadge = document.getElementById(`splitDisplay_${index}`);
    if (!splitBtn || !splitBadge) return;

    if (activeSplitIndex === index) {
        clearInterval(splitTimerInterval);
        const elapsed = Math.floor((Date.now() - splitStartTime) / 1000);
        exerciseSplitTimes[index] = (exerciseSplitTimes[index] || 0) + elapsed;
        activeSplitIndex = null;
        splitTimerInterval = null;
        splitStartTime = null;

        splitBtn.textContent = "SPLIT ▶";
        splitBtn.classList.remove("running");
        splitBadge.classList.remove("active");
        splitBadge.textContent = formatSplitTime(exerciseSplitTimes[index]);
        playBeastTone("click");
        persistWorkoutDraft();
        return;
    }

    if (activeSplitIndex !== null) {
        clearInterval(splitTimerInterval);
        const prevElapsed = Math.floor((Date.now() - splitStartTime) / 1000);
        exerciseSplitTimes[activeSplitIndex] = (exerciseSplitTimes[activeSplitIndex] || 0) + prevElapsed;
        const prevBtn = document.getElementById(`splitBtn_${activeSplitIndex}`);
        const prevBadge = document.getElementById(`splitDisplay_${activeSplitIndex}`);
        if (prevBtn) {
            prevBtn.textContent = "SPLIT ▶";
            prevBtn.classList.remove("running");
        }
        if (prevBadge) {
            prevBadge.classList.remove("active");
            prevBadge.textContent = formatSplitTime(exerciseSplitTimes[activeSplitIndex]);
        }
    }

    activeSplitIndex = index;
    splitStartTime = Date.now();
    splitBtn.textContent = "PAUSE ⏸";
    splitBtn.classList.add("running");
    splitBadge.classList.add("active");
    playBeastTone("click");
    vibrateBeast(30);

    if (!isWorkoutTimerRunning && typeof toggleWorkoutTimer === "function") {
        toggleWorkoutTimer();
    }

    splitTimerInterval = setInterval(() => {
        if (activeSplitIndex !== index) return;
        const currentRun = Math.floor((Date.now() - splitStartTime) / 1000);
        const totalSecs = (exerciseSplitTimes[index] || 0) + currentRun;
        splitBadge.textContent = formatSplitTime(totalSecs);
    }, 1000);
    persistWorkoutDraft();
};

function getActiveWorkoutDraft() {
    try {
        const draft = JSON.parse(localStorage.getItem(ACTIVE_WORKOUT_DRAFT_KEY) || "null");
        if (!draft || !workouts[draft.workout] || !Array.isArray(draft.sets)) return null;
        return {
            ...draft,
            sets: draft.sets.filter(set => set && typeof set === "object" && typeof set.setId === "string"),
            splitSeconds: draft.splitSeconds && typeof draft.splitSeconds === "object" ? draft.splitSeconds : {}
        };
    } catch (_) { return null; }
}

function clearActiveWorkoutDraft() {
    clearTimeout(workoutDraftSaveTimer);
    workoutDraftSaveTimer = null;
    try { localStorage.removeItem(ACTIVE_WORKOUT_DRAFT_KEY); } catch (_) {}
}

function hasWorkoutDraftProgress() {
    if (completedSetIds.size || isWorkoutTimerRunning || workoutPausedTime > 0 || activeSplitIndex !== null) return true;
    return [...document.querySelectorAll(".telemetry-weight, .telemetry-reps")].some(input => String(input.value || "").trim() !== "");
}

function persistWorkoutDraft() {
    if (!activeWorkout || !hasWorkoutDraftProgress()) return;
    const elapsedMs = isWorkoutTimerRunning && workoutStartTime
        ? Math.max(0, Date.now() - workoutStartTime)
        : workoutTimerWasStarted
            ? workoutPausedTime
            : Math.max(0, Date.now() - (workoutOpenedAt || Date.now()));
    const splitSeconds = { ...exerciseSplitTimes };
    if (activeSplitIndex !== null && splitStartTime) {
        splitSeconds[activeSplitIndex] = (splitSeconds[activeSplitIndex] || 0) + Math.floor((Date.now() - splitStartTime) / 1000);
    }
    const sets = [];
    document.querySelectorAll(".exercise-item").forEach((item, exerciseIndex) => {
        item.querySelectorAll(".set-row").forEach((row, setIndex) => {
            sets.push({
                setId: `${exerciseIndex}:${setIndex}`,
                weight: row.querySelector(".telemetry-weight")?.value || "",
                reps: row.querySelector(".telemetry-reps")?.value || "",
                completed: Boolean(row.querySelector(".exercise-check")?.checked)
            });
        });
    });
    const draft = {
        workout: activeWorkout,
        mode: activeWorkoutMode,
        startedAt: workoutOpenedAt || Date.now(),
        elapsedMs,
        timerWasStarted: workoutTimerWasStarted,
        restSeconds: restTimerInterval && restEndsAt ? Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000)) : Math.max(0, restSecondsRemaining),
        restEndsAt: restTimerInterval ? restEndsAt : 0,
        restPaused: restTimerPaused,
        restTotalSeconds: restTimerTotalSeconds,
        splitSeconds,
        sets,
        savedAt: Date.now()
    };
    try { localStorage.setItem(ACTIVE_WORKOUT_DRAFT_KEY, JSON.stringify(draft)); } catch (_) {}
}

function queueWorkoutDraftSave() {
    clearTimeout(workoutDraftSaveTimer);
    workoutDraftSaveTimer = setTimeout(persistWorkoutDraft, 150);
}

window.resumeWorkout = function () {
    const draft = getActiveWorkoutDraft();
    if (draft) startWorkout(draft.workout, draft);
};

/* Set-focused workout logger with resumable local drafts */
window.startWorkout = function (workoutKey, resumeDraft = null) {
    let launchStage = "checking workout data";
    try {
    const workout = workouts[workoutKey];
    if (!workout) {
        console.error("Workout launch failed: unknown workout key.", workoutKey);
        alert("This workout is unavailable. Refresh the page and try again.");
        return;
    }
    launchStage = "reading saved workout";
    const savedDraft = resumeDraft || getActiveWorkoutDraft();
    if (savedDraft && savedDraft.workout !== workoutKey) {
        if (!confirm("A different workout is saved. Starting this one will replace it.")) return;
        clearActiveWorkoutDraft();
        resumeDraft = null;
    } else if (!resumeDraft && savedDraft?.workout === workoutKey) {
        resumeDraft = savedDraft;
    }
    const modal = document.getElementById("workoutModal");
    const title = document.getElementById("modalTitle");
    const owner = document.getElementById("modalOwner");
    const desc = document.getElementById("modalDescription");
    const img = document.getElementById("modalCharacterImage");
    const list = document.getElementById("exerciseList");
    if (!modal || !title || !owner || !desc || !img || !list) {
        console.error("Workout launch failed: workout modal elements are missing.");
        alert("This workout could not open. Refresh the page and try again.");
        return;
    }

    launchStage = "preparing workout state";
    workoutOpener = document.activeElement;
    activeWorkout = workoutKey;
    completedSetIds.clear();
    workoutSetCount = 0;
    title.textContent = workout.title;
    owner.textContent = workout.owner;
    desc.textContent = workout.description;
    img.style.backgroundImage = `url("${workout.image}")`;
    const positions = { gyomei: ["85% 24%", "180% auto"], akaza: ["center 25%", "cover"], toji: ["center 22%", "cover"], baki: ["center 24%", "cover"], fusion: ["center 30%", "cover"], hybrid: ["center", "cover"] };
    [img.style.backgroundPosition, img.style.backgroundSize] = positions[workoutKey] || ["center", "cover"];

    const workoutMode = resumeDraft?.mode === "home" ? "home" : trainingMode;
    const exercises = workoutMode === "home" ? workout.home : workout.gym;
    clearInterval(workoutTimer);
    workoutTimer = null;
    workoutStartTime = null;
    workoutPausedTime = Math.max(0, Number(resumeDraft?.elapsedMs) || 0);
    workoutOpenedAt = Date.now() - workoutPausedTime;
    activeWorkoutMode = workoutMode;
    isWorkoutTimerRunning = false;
    workoutTimerWasStarted = Boolean(resumeDraft?.timerWasStarted);
    exerciseSplitTimes = resumeDraft?.splitSeconds && typeof resumeDraft.splitSeconds === "object" ? { ...resumeDraft.splitSeconds } : {};
    clearInterval(restTimerInterval);
    restTimerInterval = null;
    restSecondsRemaining = 0;
    restTimerTotalSeconds = 60;
    restEndsAt = 0;
    restTimerPaused = false;
    const savedRestEndsAt = Number(resumeDraft?.restEndsAt) || 0;
    restSecondsRemaining = savedRestEndsAt > 0
        ? Math.max(0, Math.ceil((savedRestEndsAt - Date.now()) / 1000))
        : Math.max(0, Number(resumeDraft?.restSeconds) || 0);
    restTimerTotalSeconds = Math.max(restSecondsRemaining, Number(resumeDraft?.restTotalSeconds) || 60);
    restTimerPaused = Boolean(resumeDraft?.restPaused) && restSecondsRemaining > 0;
    activeSplitIndex = null;
    clearInterval(splitTimerInterval);
    splitTimerInterval = null;
    splitStartTime = null;
    list.innerHTML = `
        <div class="workout-tracker">
            <div class="timer-section">
                <span class="timer-label">Session duration</span>
                <div class="workout-timer" id="workoutTimer" aria-live="off">00:00:00</div>
                <button type="button" class="timer-toggle-btn" id="timerToggleBtn" onclick="toggleWorkoutTimer()" aria-pressed="false">Start timer</button>
            </div>
            <div class="exercise-progress-box">
                <div class="exercise-progress-text" id="exerciseProgress">0 of 0 sets complete</div>
                <div class="exercise-progress-track" role="progressbar" id="exerciseProgressBarTrack" aria-label="Workout sets completed" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0">
                    <div class="exercise-progress-fill" id="exerciseProgressBar"></div>
                </div>
            </div>
        </div>
    `;

    launchStage = "building exercise list";
    exercises.forEach((exercise, exerciseIndex) => {
        const match = exercise.sets.match(/(\d+)\s+sets?/i);
        const setCount = match ? Math.max(1, Number(match[1])) : 1;
        workoutSetCount += setCount;
        const previousEntry = getWorkoutHistory().find(entry => Array.isArray(entry.telemetry) && entry.telemetry.some(item => item?.name === exercise.name));
        const previousExercise = previousEntry?.telemetry?.find(item => item?.name === exercise.name);
        const completedPreviousSets = Array.isArray(previousExercise?.sets)
            ? previousExercise.sets.filter(set => set?.weight > 0 && set?.reps > 0)
            : [];
        const previousSet = completedPreviousSets[completedPreviousSets.length - 1];
        const legacyPerformance = previousExercise?.weight > 0 && previousExercise?.reps > 0 ? `${previousExercise.weight} kg × ${previousExercise.reps}` : "";
        const previousText = previousSet ? `${previousSet.weight} kg × ${previousSet.reps}` : legacyPerformance;
        const item = document.createElement("article");
        item.className = "exercise-item";
        item.innerHTML = `
            <div class="exercise-header-row">
                <div class="exercise-information">
                    <div class="exercise-name">${exerciseIndex + 1}. ${exercise.name}</div>
                    <div class="exercise-sets">${exercise.sets}</div>
                    ${previousText ? `<div class="previous-performance">Last time: ${previousText}</div>` : ""}
                </div>
                <div class="exercise-actions">
                    <button type="button" class="split-timer-btn" id="splitBtn_${exerciseIndex}" onclick="toggleExerciseSplit(${exerciseIndex})">Start split</button>
                    <span class="split-display-badge" id="splitDisplay_${exerciseIndex}" aria-label="Exercise elapsed time">00:00</span>
                    <button type="button" class="intel-info-btn" onclick="showExerciseIntel('${exercise.name.replace(/'/g, "\\'")}')" aria-label="Details for ${exercise.name}">i</button>
                </div>
            </div>
            <div class="set-list" aria-label="Sets for ${exercise.name}">
                ${Array.from({ length: setCount }, (_, setIndex) => `
                    <div class="set-row" data-set-index="${exerciseIndex}:${setIndex}">
                        <span class="set-number">${setIndex + 1}</span>
                        <input type="number" placeholder="kg" class="telemetry-weight" min="0" step="0.5" inputmode="decimal" aria-label="Weight in kilograms, set ${setIndex + 1}, ${exercise.name}">
                        <input type="number" placeholder="reps" class="telemetry-reps" min="0" step="1" inputmode="numeric" aria-label="Reps, set ${setIndex + 1}, ${exercise.name}">
                        <label class="set-complete">
                            <input type="checkbox" class="exercise-check" data-set-id="${exerciseIndex}:${setIndex}" aria-label="Mark set ${setIndex + 1} complete for ${exercise.name}">
                            <span class="custom-checkbox" aria-hidden="true">✓</span>
                        </label>
                    </div>
                `).join("")}
            </div>
        `;
        const savedSets = new Map((resumeDraft?.sets || []).map(set => [set.setId, set]));
        item.querySelectorAll(".set-row").forEach((row, setIndex) => {
            const set = savedSets.get(`${exerciseIndex}:${setIndex}`);
            if (!set) return;
            const weightInput = row.querySelector(".telemetry-weight");
            const repsInput = row.querySelector(".telemetry-reps");
            const checkbox = row.querySelector(".exercise-check");
            if (weightInput) weightInput.value = set.weight ?? "";
            if (repsInput) repsInput.value = set.reps ?? "";
            if (checkbox && set.completed) {
                checkbox.checked = true;
                completedSetIds.add(`${exerciseIndex}:${setIndex}`);
                row.classList.add("completed");
            }
        });
        item.querySelectorAll(".telemetry-weight, .telemetry-reps").forEach(input => input.addEventListener("input", queueWorkoutDraftSave));
        item.querySelectorAll(".exercise-check").forEach(check => {
            check.addEventListener("change", function () {
                const row = this.closest(".set-row");
                if (this.checked) {
                    completedSetIds.add(this.dataset.setId);
                    row?.classList.add("completed");
                    if (activeSplitIndex === exerciseIndex) toggleExerciseSplit(exerciseIndex);
                    startRest(60);
                    playBeastTone("click");
                    vibrateBeast(30);
                } else {
                    completedSetIds.delete(this.dataset.setId);
                    row?.classList.remove("completed");
                }
                item.classList.toggle("completed", [...item.querySelectorAll(".exercise-check")].every(input => input.checked));
                updateExerciseProgress(workoutSetCount);
                persistWorkoutDraft();
            });
        });
        list.appendChild(item);
        const splitDisplay = document.getElementById(`splitDisplay_${exerciseIndex}`);
        if (splitDisplay) splitDisplay.textContent = formatSplitTime(exerciseSplitTimes[exerciseIndex] || 0);
        const exerciseChecks = Array.from(item.querySelectorAll(".exercise-check"));
        item.classList.toggle("completed", exerciseChecks.length > 0 && exerciseChecks.every(input => input.checked));
    });

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    updateExerciseProgress(workoutSetCount);
    if (resumeDraft) {
        const timerDisplay = document.getElementById("workoutTimer");
        const timerButton = document.getElementById("timerToggleBtn");
        if (timerDisplay) timerDisplay.textContent = formatWorkoutTime(workoutPausedTime / 1000);
        if (timerButton && workoutPausedTime > 0) timerButton.textContent = "Resume timer";
        if (restSecondsRemaining > 0 && restTimerPaused) {
            const restPanel = document.getElementById("restTimerPanel");
            if (restPanel) restPanel.hidden = false;
            updateRestTimerUI();
            updateRestNextSet();
        } else if (restSecondsRemaining > 0) startRest(restSecondsRemaining);
        persistWorkoutDraft();
    }
    launchStage = "opening workout sheet";
    modal.querySelector(".modal-close")?.focus();
    } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        console.error("Workout launch failed during " + launchStage + ":", error);
        activeWorkout = null;
        clearInterval(workoutTimer);
        clearInterval(splitTimerInterval);
        clearInterval(restTimerInterval);
        workoutTimer = null;
        splitTimerInterval = null;
        restTimerInterval = null;
        workoutStartTime = null;
        workoutOpenedAt = null;
        isWorkoutTimerRunning = false;
        workoutSetCount = 0;
        completedSetIds.clear();
        document.body.classList.remove("modal-open");
        const failedModal = document.getElementById("workoutModal");
        failedModal?.classList.remove("show");
        failedModal?.setAttribute("aria-hidden", "true");
        alert("Workout launch failed during " + launchStage + ": " + detail);
    }
};

function updateExerciseProgress(totalSets) {
    const text = document.getElementById("exerciseProgress");
    const bar = document.getElementById("exerciseProgressBar");
    const track = document.getElementById("exerciseProgressBarTrack");
    const count = completedSetIds.size;
    if (text) text.textContent = `${count} of ${totalSets} sets complete`;
    if (bar && totalSets > 0) bar.style.width = `${(count / totalSets) * 100}%`;
    if (track) {
        track.setAttribute("aria-valuemax", String(totalSets));
        track.setAttribute("aria-valuenow", String(count));
    }
}
window.closeWorkout = function (completed = false) {
    if (!completed && activeWorkout) {
        if (hasWorkoutDraftProgress()) {
            persistWorkoutDraft();
            if (!confirm("Save this workout and exit? You can resume it later.")) return;
        } else {
            clearActiveWorkoutDraft();
        }
    }
    const modal = document.getElementById("workoutModal");
    if (modal) {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("modal-open");
    clearInterval(workoutTimer);
    clearInterval(splitTimerInterval);
    workoutTimer = null;
    splitTimerInterval = null;
    workoutStartTime = null;
    workoutOpenedAt = null;
    workoutPausedTime = 0;
    isWorkoutTimerRunning = false;
    workoutTimerWasStarted = false;
    activeSplitIndex = null;
    splitStartTime = null;
    exerciseSplitTimes = {};
    activeWorkout = null;
    completedSetIds.clear();
    workoutSetCount = 0;
    skipRest();
    if (workoutOpener?.isConnected) workoutOpener.focus();
    workoutOpener = null;
    if (!completed) renderTodayOverview();
};
window.discardWorkout = function () {
    if (!activeWorkout || !confirm("Discard this workout and all unsaved set entries?")) return;
    clearActiveWorkoutDraft();
    closeWorkout(true);
    renderTodayOverview();
};
/* Rest Timer */
window.startRest = function (seconds = 60) {
    const panel = document.getElementById("restTimerPanel");
    if (!panel) return;
    clearInterval(restTimerInterval);
    restTimerInterval = null;
    restSecondsRemaining = Math.max(1, Math.round(Number(seconds) || 60));
    restTimerTotalSeconds = restSecondsRemaining;
    restEndsAt = Date.now() + restSecondsRemaining * 1000;
    restTimerPaused = false;
    panel.hidden = false;
    updateRestTimerUI();
    updateRestNextSet();
    playBeastTone("rest");
    restTimerInterval = setInterval(tickRestTimer, 1000);
    if (activeWorkout) persistWorkoutDraft();
};

function updateRestTimerUI() {
    const display = document.getElementById("restTimerDisplay");
    const pauseButton = document.getElementById("restPauseButton");
    const ring = document.getElementById("restTimerRing");
    if (display) display.textContent = restSecondsRemaining > 0 ? formatRestTime(restSecondsRemaining) : "READY";
    if (pauseButton) pauseButton.textContent = restSecondsRemaining <= 0 ? "Again" : restTimerPaused ? "Resume" : "Pause";
    if (pauseButton) pauseButton.setAttribute("aria-pressed", String(restTimerPaused));
    if (ring) {
        const circumference = 144.5;
        const remaining = restTimerTotalSeconds > 0 ? restSecondsRemaining / restTimerTotalSeconds : 0;
        ring.style.strokeDashoffset = String(circumference * (1 - Math.max(0, Math.min(1, remaining))));
    }
}

function updateRestNextSet() {
    const label = document.getElementById("restNextExercise");
    if (!label) return;
    const nextRow = [...document.querySelectorAll(".exercise-item")].flatMap(item =>
        [...item.querySelectorAll(".set-row")].map(row => ({ item, row }))
    ).find(({ row }) => !row.querySelector(".exercise-check")?.checked);
    if (!nextRow) {
        label.textContent = "All sets complete · finish when ready.";
        return;
    }
    const exercise = nextRow.item.querySelector(".exercise-name")?.textContent.replace(/^\d+\.\s*/, "").trim() || "Next set";
    const setNumber = Number(nextRow.row.querySelector(".set-number")?.textContent) || 1;
    label.textContent = "Next: " + exercise + " · Set " + setNumber;
}

function tickRestTimer() {
    restSecondsRemaining = Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000));
    updateRestTimerUI();
    if ([10, 5, 4, 3, 2, 1].includes(restSecondsRemaining)) {
        playBeastTone(restSecondsRemaining <= 5 ? "warning" : "rest");
    }
    if (restSecondsRemaining <= 0) {
        clearInterval(restTimerInterval);
        restTimerInterval = null;
        restEndsAt = 0;
        restTimerPaused = false;
        const label = document.getElementById("restNextExercise");
        if (label) label.textContent = "Rest complete · ready when you are.";
        playBeastTone("victory");
        vibrateBeast([100, 70, 100]);
    }
    if (activeWorkout && restSecondsRemaining <= 0) persistWorkoutDraft();
}

window.toggleRestTimer = function () {
    if (restTimerInterval) {
        restSecondsRemaining = Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000));
        clearInterval(restTimerInterval);
        restTimerInterval = null;
        restEndsAt = 0;
        restTimerPaused = true;
        updateRestTimerUI();
        if (activeWorkout) persistWorkoutDraft();
        return;
    }
    if (restSecondsRemaining <= 0) {
        startRest(60);
        return;
    }
    restTimerPaused = false;
    restEndsAt = Date.now() + restSecondsRemaining * 1000;
    restTimerInterval = setInterval(tickRestTimer, 1000);
    updateRestTimerUI();
};

window.adjustRest = function (seconds) {
    const panel = document.getElementById("restTimerPanel");
    const adjustment = Number(seconds);
    if (!panel || panel.hidden || !Number.isFinite(adjustment)) return;
    const wasPaused = restTimerPaused;
    if (restTimerInterval) restSecondsRemaining = Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000));
    restSecondsRemaining = Math.max(0, restSecondsRemaining + Math.round(adjustment));
    restTimerTotalSeconds = Math.max(restSecondsRemaining, restTimerTotalSeconds + Math.max(0, adjustment));
    clearInterval(restTimerInterval);
    restTimerInterval = null;
    if (restSecondsRemaining > 0) {
        restTimerPaused = wasPaused;
        if (restTimerPaused) {
            restEndsAt = 0;
        } else {
            restEndsAt = Date.now() + restSecondsRemaining * 1000;
            restTimerInterval = setInterval(tickRestTimer, 1000);
        }
    } else {
        restTimerPaused = false;
        restEndsAt = 0;
        const label = document.getElementById("restNextExercise");
        if (label) label.textContent = "Rest complete · ready when you are.";
    }
    updateRestTimerUI();
    if (activeWorkout) persistWorkoutDraft();
};

window.skipRest = function () {
    clearInterval(restTimerInterval);
    restTimerInterval = null;
    restSecondsRemaining = 0;
    restTimerTotalSeconds = 60;
    restEndsAt = 0;
    restTimerPaused = false;
    const panel = document.getElementById("restTimerPanel");
    if (panel) panel.hidden = true;
    updateRestTimerUI();
    if (activeWorkout) persistWorkoutDraft();
};

/* Exercise Intel Viewer */
window.showExerciseIntel = function (exerciseName) {
    const rawIntel = exerciseIntel[exerciseName] || {
        targets: "Primary compound groups and muscular kinetic chain.",
        dailyLife: "Builds functional physical resilience, athletic posture, and movement efficiency.",
        transformation: "Stimulates muscle fiber hypertrophy and increases kinetic tension output.",
        howTo: [
            "Lock clean starting posture with feet balanced.",
            "Brace core and maintain rhythmic diaphragmatic breathing.",
            "Execute full range of motion under strict eccentric control."
        ]
    };

    const modal = document.getElementById("exerciseIntelModal");
    const titleEl = document.getElementById("intelModalTitle");
    const targetsEl = document.getElementById("intelTargets");
    const dailyEl = document.getElementById("intelDailyLife");
    const transformEl = document.getElementById("intelTransform");
    const howToEl = document.getElementById("intelHowTo");

    if (!modal || !titleEl) return;

    intelOpener = document.activeElement;
    titleEl.textContent = exerciseName.toUpperCase();
    targetsEl.textContent = rawIntel.targets;
    dailyEl.textContent = rawIntel.dailyLife;
    transformEl.textContent = rawIntel.transformation;

    howToEl.innerHTML = rawIntel.howTo
        .map(step => `<li>${step}</li>`)
        .join("");

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    modal.querySelector(".intel-close")?.focus();
    playBeastTone("click");
    vibrateBeast(35);
};

window.closeExerciseIntel = function () {
    const modal = document.getElementById("exerciseIntelModal");
    if (modal) {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
    }
    if (intelOpener?.isConnected) intelOpener.focus();
    intelOpener = null;
};

/* Complete Workout with Progressive Overload Telemetry & Split Time */
window.completeWorkout = function () {
    if (!activeWorkout) return;
    const incomplete = workoutSetCount - completedSetIds.size;
    if (incomplete > 0 && !confirm(`${incomplete} set(s) are not marked complete. Finish and save this session anyway?`)) return;
    const duration = isWorkoutTimerRunning
        ? Math.floor((Date.now() - workoutStartTime) / 1000)
        : workoutTimerWasStarted
            ? Math.floor(workoutPausedTime / 1000)
            : Math.floor((Date.now() - workoutOpenedAt) / 1000);
    const telemetryData = [];
    let sessionVolume = 0;
    if (activeSplitIndex !== null && splitStartTime) {
        exerciseSplitTimes[activeSplitIndex] = (exerciseSplitTimes[activeSplitIndex] || 0) + Math.floor((Date.now() - splitStartTime) / 1000);
        clearInterval(splitTimerInterval);
        activeSplitIndex = null;
        splitStartTime = null;
        splitTimerInterval = null;
    }
    document.querySelectorAll(".exercise-item").forEach((item, exerciseIndex) => {
        const name = item.querySelector(".exercise-name")?.textContent.replace(/^\d+\.\s*/, "").trim();
        const sets = [...item.querySelectorAll(".set-row")].map((row, setIndex) => {
            const weight = Number(row.querySelector(".telemetry-weight")?.value) || 0;
            const reps = Number(row.querySelector(".telemetry-reps")?.value) || 0;
            const completed = Boolean(row.querySelector(".exercise-check")?.checked);
            if (completed && weight > 0 && reps > 0) sessionVolume += weight * reps;
            return { set: setIndex + 1, weight, reps, completed };
        });
        telemetryData.push({ name, sets, splitSeconds: exerciseSplitTimes[exerciseIndex] || 0 });
    });
    const workoutKey = activeWorkout;
    beastProgress.workoutsCompleted = (Number(beastProgress.workoutsCompleted) || 0) + 1;
    if (typeof beastProgress[workoutKey] === "number") beastProgress[workoutKey] = Math.min(100, beastProgress[workoutKey] + 10);
    beastProgress.level = Math.floor(beastProgress.workoutsCompleted / 5) + 1;
    updateStreak();
    const history = getWorkoutHistory();
    history.unshift({ id: Date.now(), workout: workoutKey, date: new Date().toISOString(), duration, tonnage: sessionVolume, telemetry: telemetryData });
    saveWorkoutHistory(history);
    try { localStorage.setItem("beastProgress", JSON.stringify(beastProgress)); }
    catch (error) { console.error("Storage error:", error); }
    playBeastTone("victory");
    vibrateBeast([80, 50, 160]);
    clearActiveWorkoutDraft();
    closeWorkout(true);
    updateAllUI();
    updateAchievements();
    setTimeout(() => alert("Workout complete. Your sets and training volume have been saved."), 100);
};
function updateStreak() {
    const today = dateKey(new Date());
    const lastDate = beastProgress.lastWorkoutDate;

    if (!lastDate) {
        beastProgress.streak = 1;
    } else {
        const diffDays = Math.round((new Date(`${today}T00:00:00`) - new Date(`${lastDate}T00:00:00`)) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) beastProgress.streak += 1;
        else if (diffDays > 1) beastProgress.streak = 1;
    }
    beastProgress.lastWorkoutDate = today;
}

function getWorkoutHistory() {
    try {
        const d = JSON.parse(localStorage.getItem("beastWorkoutHistory"));
        return Array.isArray(d) ? d.filter(entry => entry && typeof entry === "object" && !Array.isArray(entry)) : [];
    } catch (_) { return []; }
}

function saveWorkoutHistory(history) {
    try {
        localStorage.setItem("beastWorkoutHistory", JSON.stringify(history.slice(0, 100)));
    } catch (_) {}
}

function getWeightHistory() {
    try {
        const d = JSON.parse(localStorage.getItem("beastWeightHistory"));
        return Array.isArray(d) ? d : [];
    } catch (_) { return []; }
}

window.setWeightTrendRange = function (days) {
    const allowed = [7, 30, 90, 365];
    const nextRange = Number(days);
    if (!allowed.includes(nextRange)) return;
    weightTrendRangeDays = nextRange;
    document.querySelectorAll(".trend-range-button").forEach(button => {
        button.setAttribute("aria-pressed", String(Number(button.dataset.range) === nextRange));
    });
    renderWeightTrend();
};

function renderWeightTrend() {
    const chart = document.getElementById("weightTrendChart");
    const summary = document.getElementById("weightTrendSummary");
    if (!chart) return;
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - weightTrendRangeDays + 1);
    const startKey = dateKey(start);
    const endKey = dateKey(end);
    const data = getWeightHistory()
        .map(entry => ({ weight: Number(entry.weight), date: new Date(entry.date) }))
        .filter(entry => Number.isFinite(entry.weight) && entry.weight > 0 && !Number.isNaN(entry.date.getTime()))
        .filter(entry => dateKey(entry.date) >= startKey && dateKey(entry.date) <= endKey)
        .sort((a, b) => a.date - b.date);

    if (!data.length) {
        chart.innerHTML = '<div class="chart-empty"><strong>No weigh-ins in this range</strong><span>Try a longer range or log a new measurement.</span></div>';
        if (summary) summary.textContent = "Only your logged measurements appear here.";
        return;
    }
    if (data.length === 1 && summary) summary.textContent = "One measurement logged. Add another in this range to compare.";
    if (data.length > 1 && summary) {
        const change = data[data.length - 1].weight - data[0].weight;
        const signed = change > 0 ? "+" : "";
        summary.textContent = "Change across logged measurements: " + signed + change.toFixed(1) + " kg.";
    }

    const width = 720;
    const plotLeft = 54;
    const plotRight = 696;
    const plotTop = 20;
    const plotBottom = 156;
    const weights = data.map(entry => entry.weight);
    let min = Math.min(...weights);
    let max = Math.max(...weights);
    if (min === max) { min -= 0.5; max += 0.5; }
    const padding = (max - min) * 0.08;
    min -= padding;
    max += padding;
    const points = data.map((entry, index) => {
        const x = data.length === 1 ? (plotLeft + plotRight) / 2 : plotLeft + index / (data.length - 1) * (plotRight - plotLeft);
        const y = plotBottom - (entry.weight - min) / (max - min) * (plotBottom - plotTop);
        return { x, y, entry };
    });
    const pointString = points.map(point => point.x.toFixed(1) + "," + point.y.toFixed(1)).join(" ");
    const areaPath = points.length > 1
        ? "M " + pointString.replace(/ /g, " L ") + " L " + plotRight + "," + plotBottom + " L " + plotLeft + "," + plotBottom + " Z"
        : "";
    const middle = (min + max) / 2;
    const labels = [max, middle, min];
    const yPositions = [plotTop, (plotTop + plotBottom) / 2, plotBottom];
    const grid = labels.map((value, index) =>
        '<line class="trend-gridline" x1="' + plotLeft + '" y1="' + yPositions[index] + '" x2="' + plotRight + '" y2="' + yPositions[index] + '"></line>'
    ).join("");
    const circles = points.map(point =>
        '<circle class="trend-point" cx="' + point.x.toFixed(1) + '" cy="' + point.y.toFixed(1) + '" r="4"><title>' +
        point.entry.weight.toFixed(1) + ' kg, ' + escapeHtml(point.entry.date.toLocaleDateString()) + '</title></circle>'
    ).join("");
    const dateOptions = { month: "short", day: "numeric" };
    const firstLabel = escapeHtml(data[0].date.toLocaleDateString(undefined, dateOptions));
    const lastLabel = escapeHtml(data[data.length - 1].date.toLocaleDateString(undefined, dateOptions));
    chart.innerHTML = '<div class="trend-plot"><div class="trend-y-axis" aria-hidden="true"><span>' + max.toFixed(1) +
        '</span><span>' + middle.toFixed(1) + '</span><span>' + min.toFixed(1) + '</span></div>' +
        '<svg viewBox="0 0 ' + width + ' 170" preserveAspectRatio="none" role="img" aria-label="Bodyweight trend from ' +
        firstLabel + ' to ' + lastLabel + '">' +
        '<title>Logged bodyweight measurements</title><defs><linearGradient id="trendArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#ff8178" stop-opacity=".25"></stop><stop offset="100%" stop-color="#ff8178" stop-opacity="0"></stop></linearGradient></defs>' +
        grid + (areaPath ? '<path class="trend-area" d="' + areaPath + '"></path>' : "") +
        (points.length > 1 ? '<polyline class="trend-line" points="' + pointString + '"></polyline>' : "") +
        circles + '</svg></div><div class="trend-date-axis" aria-hidden="true"><span>' + firstLabel + '</span><span>' +
        lastLabel + '</span></div>';
}

window.saveWeightEntry = function () {
    const input = document.getElementById("weightLogInput");
    const val = Number(input?.value);
    if (!Number.isFinite(val) || val <= 0) {
        alert("Enter a valid weight in KG.");
        return;
    }
    const history = getWeightHistory();
    history.unshift({ id: Date.now(), weight: val, date: new Date().toISOString() });
    localStorage.setItem("beastWeightHistory", JSON.stringify(history.slice(0, 100)));
    if (input) input.value = "";
    playBeastTone("click");
    renderUltimateDashboard();
    renderHomeSnapshot();
    renderWeightTrend();
};

const NUTRITION_HISTORY_KEY = "beastNutritionHistory";
const NUTRITION_GOALS_KEY = "beastNutritionGoals";

function getNutritionHistory() {
    try {
        const saved = JSON.parse(localStorage.getItem(NUTRITION_HISTORY_KEY) || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch (_) { return []; }
}

function getNutritionGoals() {
    try {
        const saved = JSON.parse(localStorage.getItem(NUTRITION_GOALS_KEY) || "null");
        return saved && typeof saved === "object" ? saved : null;
    } catch (_) { return null; }
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function populateNutritionGoals() {
    const goals = getNutritionGoals();
    if (!goals) return;
    const fields = { goalCalories: "calories", goalProtein: "protein", goalCarbs: "carbs", goalFat: "fat", goalFiber: "fiber" };
    Object.entries(fields).forEach(([id, key]) => {
        const field = document.getElementById(id);
        if (field && goals[key] != null) field.value = goals[key];
    });
}

window.saveNutritionGoals = function (event) {
    event?.preventDefault();
    const form = document.getElementById("nutritionGoalsForm");
    if (form && !form.reportValidity()) return;
    const goals = {
        calories: Number(document.getElementById("goalCalories")?.value),
        protein: Number(document.getElementById("goalProtein")?.value),
        carbs: Number(document.getElementById("goalCarbs")?.value) || 0,
        fat: Number(document.getElementById("goalFat")?.value) || 0,
        fiber: Number(document.getElementById("goalFiber")?.value) || 0
    };
    if (!Number.isFinite(goals.calories) || goals.calories <= 0 || !Number.isFinite(goals.protein) || goals.protein < 0) {
        alert("Enter valid calorie and protein targets.");
        return;
    }
    try {
        localStorage.setItem(NUTRITION_GOALS_KEY, JSON.stringify(goals));
        renderNutrition();
        playBeastTone("click");
    } catch (_) { alert("Could not save nutrition targets on this device."); }
};

window.addFoodEntry = function (event) {
    event?.preventDefault();
    const form = document.getElementById("foodLogForm");
    if (form && !form.reportValidity()) return;
    const name = document.getElementById("foodName")?.value.trim();
    if (!name) return;
    const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: "food",
        name,
        calories: Number(document.getElementById("foodCalories")?.value),
        protein: Number(document.getElementById("foodProtein")?.value),
        carbs: Number(document.getElementById("foodCarbs")?.value),
        fat: Number(document.getElementById("foodFat")?.value),
        fiber: Number(document.getElementById("foodFiber")?.value),
        date: new Date().toISOString()
    };
    if (Object.values(entry).some(value => typeof value === "number" && (!Number.isFinite(value) || value < 0))) {
        alert("Nutrition values must be zero or greater.");
        return;
    }
    try {
        const history = getNutritionHistory();
        history.unshift(entry);
        localStorage.setItem(NUTRITION_HISTORY_KEY, JSON.stringify(history.slice(0, 1000)));
        form.reset();
        document.getElementById("foodFiber").value = "0";
        renderNutrition();
        playBeastTone("click");
    } catch (_) { alert("Could not save this food entry on this device."); }
};

window.addWater = function (milliliters) {
    const amount = Number(milliliters);
    if (!Number.isFinite(amount) || amount <= 0) return;
    try {
        const history = getNutritionHistory();
        history.unshift({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type: "water", milliliters: amount, date: new Date().toISOString() });
        localStorage.setItem(NUTRITION_HISTORY_KEY, JSON.stringify(history.slice(0, 1000)));
        renderNutrition();
        playBeastTone("click");
    } catch (_) { alert("Could not save water on this device."); }
};

window.removeFoodEntry = function (entryId) {
    const history = getNutritionHistory().filter(entry => entry.id !== entryId);
    try {
        localStorage.setItem(NUTRITION_HISTORY_KEY, JSON.stringify(history));
        renderNutrition();
    } catch (_) { alert("Could not update the food log."); }
};

function renderNutrition() {
    const summary = document.getElementById("nutritionSummary");
    const log = document.getElementById("foodLogList");
    if (!summary || !log) return;
    const today = dateKey(new Date());
    const entries = getNutritionHistory().filter(entry => dateKey(entry.date) === today);
    const goals = getNutritionGoals();
    const foods = entries.filter(entry => entry.type === "food");
    const totals = foods.reduce((total, entry) => {
        ["calories", "protein", "carbs", "fat", "fiber"].forEach(key => total[key] += Number(entry[key]) || 0);
        return total;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
    const water = entries.filter(entry => entry.type === "water").reduce((sum, entry) => sum + (Number(entry.milliliters) || 0), 0);
    const dateLabel = document.getElementById("nutritionDateLabel");
    if (dateLabel) dateLabel.textContent = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date());
    const waterLabel = document.getElementById("waterTotal");
    if (waterLabel) waterLabel.textContent = `${water.toLocaleString()} ml`;

    const metrics = [
        ["Calories", "calories", "kcal"], ["Protein", "protein", "g"], ["Carbs", "carbs", "g"], ["Fat", "fat", "g"], ["Fiber", "fiber", "g"]
    ];
    summary.innerHTML = metrics.map(([label, key, unit]) => {
        const target = Number(goals?.[key]) || 0;
        const consumed = totals[key];
        const ratio = target > 0 ? Math.min(100, consumed / target * 100) : 0;
        const remaining = target > 0 ? Math.max(0, target - consumed) : null;
        return `<article class="nutrition-metric">
            <div class="nutrition-metric-heading"><h3>${label}</h3><span>${target ? `${target.toLocaleString()} ${unit} target` : "Set target"}</span></div>
            <div class="nutrition-progress" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="${target || 0}" aria-valuenow="${Math.round(consumed)}"><span style="width:${ratio}%"></span></div>
            <div class="nutrition-metric-values"><span>Consumed <b>${Number(consumed.toFixed(1)).toLocaleString()} ${unit}</b></span><span>${target ? `Remaining <b>${Number(remaining.toFixed(1)).toLocaleString()} ${unit}</b>` : "No target set"}</span></div>
        </article>`;
    }).join("");

    log.innerHTML = foods.length ? foods.map(entry => `
        <article class="food-log-entry">
            <div><strong>${escapeHtml(entry.name)}</strong><span>${new Date(entry.date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · ${Math.round(entry.calories)} kcal · ${Number(entry.protein).toFixed(1)} g protein</span></div>
            <button type="button" class="remove-food-entry" onclick="removeFoodEntry('${escapeHtml(entry.id)}')" aria-label="Remove ${escapeHtml(entry.name)} from today's food log">×</button>
        </article>`).join("") : '<p class="nutrition-empty">Nothing logged yet. Add a meal above to start today’s log.</p>';
    renderHomeSnapshot();
}
function getCurrentBeastRank(level) {
    let current = beastRanks[0];
    beastRanks.forEach(r => {
        if (level >= r.level) current = r;
    });
    return current;
}

window.changeCalendarMonth = function (dir) {
    calendarViewDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + Number(dir || 0), 1);
    renderWorkoutCalendar();
};

/* Unified Render Pass */
function updateAllUI() {
    const workouts = Number(beastProgress.workoutsCompleted) || 0;
    const level = Math.floor(workouts / 5) + 1;
    const currentLevelWorkouts = workouts % 5;
    const levelPercentage = (currentLevelWorkouts / 5) * 100;
    const rank = getCurrentBeastRank(level);
    const ringProgress = {
        sessions: (currentLevelWorkouts / 5) * 100,
        streak: Math.min(100, ((Number(beastProgress.streak) || 0) / 7) * 100),
        tier: Math.min(100, (level / 50) * 100)
    };
    Object.entries(ringProgress).forEach(([name, value]) => {
        const ring = document.querySelector(`[data-ring="${name}"] .activity-ring`);
        if (ring) ring.style.setProperty('--ring-value', `${value}%`);
    });

    const elWorkouts = document.getElementById("workoutsCompleted");
    const elStreak = document.getElementById("currentStreak");
    const elProgressLevel = document.getElementById("progressLevel");
    const elHeaderLevel = document.getElementById("levelNumber");
    const elCurrentLevel = document.getElementById("currentLevel");

    if (elWorkouts) elWorkouts.textContent = workouts;
    if (elStreak) elStreak.textContent = beastProgress.streak;
    if (elProgressLevel) elProgressLevel.textContent = level;
    if (elHeaderLevel) elHeaderLevel.textContent = level;
    if (elCurrentLevel) elCurrentLevel.textContent = level;

    const elLevelTitle = document.getElementById("levelTitle");
    const elLevelProgressText = document.getElementById("levelProgressText");
    const elLevelProgressBar = document.getElementById("levelProgressBar");

    if (elLevelTitle) elLevelTitle.textContent = rank.name;
    if (elLevelProgressText) elLevelProgressText.textContent = `${currentLevelWorkouts} / 5 TO NEXT LEVEL`;
    if (elLevelProgressBar) elLevelProgressBar.style.width = `${levelPercentage}%`;

    ["gyomei", "akaza", "toji", "baki", "fusion", "hybrid"].forEach(key => {
        const bar = document.getElementById(`${key}Progress`);
        const text = document.getElementById(`${key}ProgressText`);
        const val = beastProgress[key] || 0;
        if (bar) bar.style.width = `${val}%`;
        if (text) text.textContent = `${val}%`;
    });

    const elRankIcon = document.getElementById("currentRankIcon");
    const elRankName = document.getElementById("currentRankName");
    const elRankDesc = document.getElementById("currentRankDescription");
    const elXpFill = document.getElementById("xpFill");
    const elXpText = document.getElementById("xpText");
    const elXpPercentage = document.getElementById("xpPercentage");
    const elXpProgressText = document.getElementById("xpProgressText");

    if (elRankIcon) elRankIcon.textContent = rank.icon;
    if (elRankName) elRankName.textContent = rank.name;
    if (elRankDesc) elRankDesc.textContent = rank.description;
    if (elXpFill) elXpFill.style.width = `${levelPercentage}%`;
    if (elXpText) elXpText.textContent = `${currentLevelWorkouts} / 5 WORKOUTS`;
    if (elXpPercentage) elXpPercentage.textContent = `${Math.round(levelPercentage)}%`;
    if (elXpProgressText) {
        const remaining = 5 - currentLevelWorkouts;
        elXpProgressText.textContent = remaining === 0 ? "LEVEL UP READY!" : `${remaining} workout${remaining !== 1 ? "s" : ""} to Level ${level + 1}`;
    }

    document.querySelectorAll(".rank-timeline .rank-node").forEach(node => {
        const req = Number(node.dataset.level);
        const status = node.querySelector(".rank-node-status");
        node.classList.remove("active", "locked");

        if (req === rank.level) {
            node.classList.add("active");
            if (status) {
                status.textContent = "CURRENT";
                status.className = "rank-node-status current-rank-status";
            }
        } else if (level >= req) {
            if (status) {
                status.textContent = "UNLOCKED";
                status.className = "rank-node-status";
            }
        } else {
            node.classList.add("locked");
            if (status) {
                status.textContent = "🔒 LOCKED";
                status.className = "rank-node-status";
            }
        }
    });

    renderWorkoutHistory();
    renderWorkoutCalendar();
    renderTodayOverview();
    renderHomeSnapshot();
    renderWeightTrend();
    renderUltimateDashboard();
}

function renderWorkoutHistory() {
    const container = document.getElementById("workoutHistory");
    if (!container) return;
    const history = getWorkoutHistory().slice(0, 5);
    if (!history.length) {
        container.innerHTML = '<p class="history-empty">NO SESSIONS LOGGED YET.</p>';
        return;
    }
    container.innerHTML = history.map(entry => {
        const w = workouts[entry.workout];
        const date = new Date(entry.date);
        const title = w ? w.title : String(entry.workout || "WORKOUT").toUpperCase();
        const tonnageStr = entry.tonnage ? ` • ${Math.round(entry.tonnage)} KG VOLUME` : "";
        return `
            <article class="history-item">
                <div>
                    <strong>${title}</strong>
                    <span>${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}${tonnageStr}</span>
                </div>
                <b>${formatWorkoutTime(entry.duration)}</b>
            </article>
        `;
    }).join("");
}

function renderWorkoutCalendar() {
    const container = document.getElementById("workoutCalendar");
    const label = document.getElementById("calendarMonthLabel");
    const summary = document.getElementById("calendarSummary");
    if (!container || !label) return;

    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const trainedDays = new Set(getWorkoutHistory().map(x => dateKey(x.date)).filter(Boolean));
    const todayStr = dateKey(new Date());

    let trainedThisMonth = 0;
    label.textContent = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(calendarViewDate);
    container.innerHTML = "";

    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement("div");
        blank.className = "calendar-day empty";
        container.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const cell = document.createElement("div");
        cell.className = "calendar-day";
        if (trainedDays.has(key)) {
            cell.classList.add("trained");
            trainedThisMonth += 1;
        }
        if (key === todayStr) cell.classList.add("today");
        cell.innerHTML = `<span>${d}</span>${trainedDays.has(key) ? "<b>🔥</b>" : ""}`;
        container.appendChild(cell);
    }

    if (summary) summary.textContent = `${trainedThisMonth} SESSIONS LOGGED THIS MONTH`;
}

function renderUltimateDashboard() {
    const root = document.getElementById("ultimateDashboard");
    if (!root) return;

    const history = getWorkoutHistory();
    const weights = getWeightHistory();
    const totalSecs = history.reduce((s, x) => s + (Number(x.duration) || 0), 0);
    const totalTonnage = history.reduce((s, x) => s + (Number(x.tonnage) || 0), 0);

    const counts = {};
    history.forEach(x => counts[x.workout] = (counts[x.workout] || 0) + 1);

    const todayStr = dateKey(new Date());
    const completedToday = history.some(x => dateKey(x.date) === todayStr);

    const latestW = weights[0]?.weight;
    const prevW = weights[1]?.weight;
    const diff = latestW != null && prevW != null ? (latestW - prevW).toFixed(1) : "—";

    root.innerHTML = `
        <div class="ultimate-grid">
            <article class="ultimate-card"><span>💪 TOTAL SESSIONS</span><b>${beastProgress.workoutsCompleted || 0}</b></article>
            <article class="ultimate-card"><span>⏱️ TRAINING TIME</span><b>${formatWorkoutTime(totalSecs)}</b></article>
            <article class="ultimate-card"><span>🔥 CURRENT STREAK</span><b>${beastProgress.streak || 0} DAYS</b></article>
            <article class="ultimate-card"><span>🏋️ TONNAGE LIFTED</span><b>${Math.round(totalTonnage).toLocaleString()} KG</b></article>
        </div>

        <section class="ultimate-panel">
            <h2>🎯 DAILY MISSION</h2>
            <p>Execute at least one Beast training workout today.</p>
            <strong style="color:${completedToday ? '#30ded3' : '#ff4242'}">${completedToday ? "✅ MISSION ACCOMPLISHED" : "⏳ MISSION PENDING"}</strong>
        </section>

        <section class="ultimate-panel">
            <h2>⚖️ BODYWEIGHT LOG</h2>
            <div class="weight-log-row">
                <input id="weightLogInput" type="number" step="0.1" min="20" placeholder="Enter weight (KG)">
                <button type="button" onclick="saveWeightEntry()">LOG WEIGHT</button>
            </div>
            <div class="weight-history-list">
                ${weights.slice(0, 6).map(w => `<div><span>${new Date(w.date).toLocaleDateString()}</span><b>${w.weight} KG</b></div>`).join("") || "<p>No logs recorded yet.</p>"}
            </div>
            <p style="margin-top:10px;font-size:12px;color:#aaa">${latestW != null ? `Latest: <b>${latestW} KG</b> (Shift: <b>${diff} KG</b>)` : "Begin tracking weight to observe physical recomposition."}</p>
        </section>

        <section class="ultimate-panel backup-panel">
            <h2>💾 DATA BACKUP & RESTORE</h2>
            <p>Sync your Beast Ascension profile state across devices.</p>
            <button type="button" onclick="exportBeastData()">📤 EXPORT DATA</button>
            <label class="import-label">
                📥 IMPORT DATA
                <input type="file" accept="application/json" onchange="importBeastData(event)">
            </label>
        </section>
    `;
}

window.updateAchievements = function () {
    const grid = document.getElementById("achievementGrid");
    const summary = document.getElementById("achievementSummary");
    if (!grid) return;

    let unlocked = [];
    try { unlocked = JSON.parse(localStorage.getItem("beastAchievementsUnlocked")) || []; } catch (_) {}

    beastAchievements.forEach(a => {
        if (a.unlocked(beastProgress) && !unlocked.includes(a.id)) {
            unlocked.push(a.id);
        }
    });

    localStorage.setItem("beastAchievementsUnlocked", JSON.stringify(unlocked));
    if (summary) summary.textContent = `${unlocked.length} / ${beastAchievements.length} ACHIEVEMENTS UNLOCKED`;

    grid.innerHTML = beastAchievements.map(a => {
        const isUnlocked = unlocked.includes(a.id);
        return `
            <article class="achievement-card ${isUnlocked ? "unlocked" : "locked"}">
                <span class="achievement-icon">${isUnlocked ? a.icon : "🔒"}</span>
                <h3>${a.title}</h3>
                <p>${a.description}</p>
                <span class="achievement-status">${isUnlocked ? "✓ UNLOCKED" : "🔒 LOCKED"}</span>
            </article>
        `;
    }).join("");
};

window.saveSettings = function () {
    const w = Number(document.getElementById("userWeight")?.value);
    const tw = Number(document.getElementById("targetWeight")?.value);
    const sm = document.getElementById("settingsTrainingMode")?.value || trainingMode;
    const sound = document.getElementById("soundEnabled")?.checked !== false;

    if (!Number.isFinite(w) || !Number.isFinite(tw) || w <= 0 || tw <= 0) {
        alert("Please specify valid weights.");
        return;
    }

    localStorage.setItem("beastSettings", JSON.stringify({ currentWeight: w, targetWeight: tw, soundEnabled: sound }));
    setTrainingMode(sm);
    alert("⚔️ SETTINGS SAVED!\n\nYour Beast Ascension configuration has been updated.");
};

window.factoryResetApp = function () {
    const confirmReset = confirm("⚠️ DANGER: Are you sure you want to reset all data?\n\nThis will permanently erase all levels, history, streaks, and achievements back to Tier 1.");
    if (!confirmReset) return;

    localStorage.removeItem("beastProgress");
    localStorage.removeItem("beastWorkoutHistory");
    localStorage.removeItem("beastWeightHistory");
    localStorage.removeItem(NUTRITION_HISTORY_KEY);
    localStorage.removeItem(NUTRITION_GOALS_KEY);
    localStorage.removeItem(ACTIVE_WORKOUT_DRAFT_KEY);
    localStorage.removeItem("beastAchievementsUnlocked");

    beastProgress = { ...defaultProgress };
    updateAllUI();
    updateAchievements();
    alert("⚔️ FACTORY RESET COMPLETE. Back at Tier 1.");
    location.reload();
};

window.exportBeastData = function () {
    const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        beastProgress,
        beastSettings: JSON.parse(localStorage.getItem("beastSettings") || "{}"),
        beastWorkoutHistory: getWorkoutHistory(),
        beastWeightHistory: getWeightHistory(),
        beastNutritionGoals: getNutritionGoals(),
        beastNutritionHistory: getNutritionHistory(),
        beastActiveWorkoutDraft: getActiveWorkoutDraft(),
        beastAchievementsUnlocked: JSON.parse(localStorage.getItem("beastAchievementsUnlocked") || "[]")
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beast-ascension-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

window.importBeastData = function (e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const d = JSON.parse(reader.result);
            if (d.beastProgress) localStorage.setItem("beastProgress", JSON.stringify(d.beastProgress));
            if (d.beastSettings) localStorage.setItem("beastSettings", JSON.stringify(d.beastSettings));
            if (d.beastWorkoutHistory) localStorage.setItem("beastWorkoutHistory", JSON.stringify(d.beastWorkoutHistory));
            if (d.beastWeightHistory) localStorage.setItem("beastWeightHistory", JSON.stringify(d.beastWeightHistory));
            if (d.beastNutritionGoals) localStorage.setItem(NUTRITION_GOALS_KEY, JSON.stringify(d.beastNutritionGoals));
            if (d.beastNutritionHistory) localStorage.setItem(NUTRITION_HISTORY_KEY, JSON.stringify(d.beastNutritionHistory));
            if (Object.prototype.hasOwnProperty.call(d, "beastActiveWorkoutDraft")) {
                const draft = d.beastActiveWorkoutDraft;
                if (draft && workouts[draft.workout] && Array.isArray(draft.sets)) localStorage.setItem(ACTIVE_WORKOUT_DRAFT_KEY, JSON.stringify(draft));
                else localStorage.removeItem(ACTIVE_WORKOUT_DRAFT_KEY);
            }
            if (d.beastAchievementsUnlocked) localStorage.setItem("beastAchievementsUnlocked", JSON.stringify(d.beastAchievementsUnlocked));
            alert("⚔️ DATA RESTORED! Refreshing...");
            location.reload();
        } catch (_) {
            alert("Invalid Beast backup file.");
        }
    };
    reader.readAsText(file);
};

document.addEventListener("keydown", event => {
    const dialog = document.querySelector(".intel-modal.show .intel-content") || document.querySelector(".workout-modal.show .modal-content");
    if (event.key === "Escape") {
        if (document.getElementById("exerciseIntelModal")?.classList.contains("show")) closeExerciseIntel();
        else closeWorkout();
        return;
    }
    if (event.key !== "Tab" || !dialog) return;
    const focusable = [...dialog.querySelectorAll("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])")]
        .filter(element => !element.closest("[hidden]") && element.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
    }
});
window.addEventListener("pagehide", () => {
    if (activeWorkout && hasWorkoutDraftProgress()) persistWorkoutDraft();
});
document.addEventListener("DOMContentLoaded", () => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
        const revealItems = document.querySelectorAll(".section-header, .workout-card, .rest-section, .stat-card, .progress-card, .achievement-card, .rank-node, .ultimate-card, .ultimate-panel, .history-item");
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
        revealItems.forEach(item => {
            item.classList.add("ios-reveal");
            revealObserver.observe(item);
        });
    }
    setTrainingMode(trainingMode);
    populateNutritionGoals();
    renderNutrition();

    try {
        const s = JSON.parse(localStorage.getItem("beastSettings")) || {};
        if (s.currentWeight && document.getElementById("userWeight")) document.getElementById("userWeight").value = s.currentWeight;
        if (s.targetWeight && document.getElementById("targetWeight")) document.getElementById("targetWeight").value = s.targetWeight;
        if (s.soundEnabled !== undefined && document.getElementById("soundEnabled")) document.getElementById("soundEnabled").checked = s.soundEnabled;
    } catch (_) {}

    document.querySelectorAll(".workout-card[data-workout]").forEach(card => {
        card.addEventListener("click", e => {
            if (e.target.closest("button")) return;
            startWorkout(card.dataset.workout);
        });
    });
    document.querySelectorAll(".start-button[data-workout-key]").forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            window.startWorkout(button.dataset.workoutKey);
        });
    });

    updateAllUI();
    updateAchievements();
    const initialView = new URLSearchParams(window.location.search).get("view");
    if (["workout", "nutrition", "progress", "settings"].includes(initialView)) showPage(initialView);
    else if (window.location.hash === "#workoutSection") showPage("workout");
    else if (window.location.hash === "#progressPage") showPage("progress");
});

// PWA Service Worker Registration
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(err => console.error("SW Registration failed:", err));
    });
}
