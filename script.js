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
let completedExercises = new Set();
let restTimerInterval = null;
let restSecondsRemaining = 0;
let calendarViewDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

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

/* Workouts Catalog */
const workouts = {
    gyomei: {
        owner: "🗿 GYOMEI — STRENGTH & SIZE",
        title: "TITAN STRENGTH",
        description: "Heavy compound movements designed to forge dense skeletal frame and immovable power.",
        image: "assets/hybrid.png",
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
        image: "assets/akaza.png",
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
        image: "assets/toji.png",
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
        image: "assets/baki.png",
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
        image: "assets/day5.png",
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
        image: "assets/hybrid.png",
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
   DYNAMIC BEAST AURA PARTICLE CANVAS
========================================= */
class BeastParticleCanvas {
    constructor() {
        this.canvas = document.createElement("canvas");
        this.canvas.id = "beastVFXCanvas";
        document.body.prepend(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.particles = [];
        this.resize();
        window.addEventListener("resize", () => this.resize());
        this.initParticles(35);
        this.render();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initParticles(count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2.5 + 0.8,
                speedY: -(Math.random() * 0.8 + 0.2),
                speedX: (Math.random() - 0.5) * 0.4,
                alpha: Math.random() * 0.6 + 0.2
            });
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const isActive = Boolean(activeWorkout);

        this.particles.forEach(p => {
            p.y += p.speedY * (isActive ? 2.5 : 1);
            p.x += p.speedX;
            if (p.y < 0) {
                p.y = this.canvas.height;
                p.x = Math.random() * this.canvas.width;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * (isActive ? 1.4 : 1), 0, Math.PI * 2);
            this.ctx.fillStyle = isActive
                ? `rgba(255, 30, 30, ${p.alpha * 1.3})`
                : `rgba(180, 20, 20, ${p.alpha})`;
            this.ctx.shadowBlur = isActive ? 12 : 5;
            this.ctx.shadowColor = "#ff1e1e";
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.render());
    }
}

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
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active-page"));
    document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));

    const targetPage = document.getElementById(`${pageName}Page`);
    const activeNav = document.querySelector(`.nav-item[data-page="${pageName}"]`);

    if (targetPage) targetPage.classList.add("active-page");
    if (activeNav) activeNav.classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
};

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
        workoutStartTime = Date.now() - workoutPausedTime;
        clearInterval(workoutTimer);
        workoutTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - workoutStartTime) / 1000);
            timerDisplay.textContent = formatWorkoutTime(elapsed);
        }, 1000);

        toggleBtn.textContent = "PAUSE ⏸";
        toggleBtn.classList.add("running");
        playBeastTone("click");
        vibrateBeast(30);
    } else {
        isWorkoutTimerRunning = false;
        clearInterval(workoutTimer);
        workoutPausedTime = Date.now() - workoutStartTime;

        toggleBtn.textContent = "RESUME ▶";
        toggleBtn.classList.remove("running");
        playBeastTone("click");
    }
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
};

/* Start Workout With Face Framing In Modal */
window.startWorkout = function (workoutKey) {
    const workout = workouts[workoutKey];
    if (!workout) return;

    activeWorkout = workoutKey;
    completedExercises.clear();

    const modal = document.getElementById("workoutModal");
    const title = document.getElementById("modalTitle");
    const owner = document.getElementById("modalOwner");
    const desc = document.getElementById("modalDescription");
    const img = document.getElementById("modalCharacterImage");
    const list = document.getElementById("exerciseList");

    if (!modal || !title || !owner || !desc || !img || !list) return;

    title.textContent = workout.title;
    owner.textContent = workout.owner;
    desc.textContent = workout.description;
    img.style.backgroundImage = `url("${workout.image}")`;

    // Dynamic face centering based on character artwork
    if (workoutKey === "gyomei") {
        img.style.backgroundPosition = "85% 24%";
        img.style.backgroundSize = "180% auto";
    } else if (workoutKey === "akaza") {
        img.style.backgroundPosition = "center 25%";
        img.style.backgroundSize = "cover";
    } else if (workoutKey === "toji") {
        img.style.backgroundPosition = "center 22%";
        img.style.backgroundSize = "cover";
    } else if (workoutKey === "baki") {
        img.style.backgroundPosition = "center 24%";
        img.style.backgroundSize = "cover";
    } else if (workoutKey === "fusion") {
        img.style.backgroundPosition = "center 30%";
        img.style.backgroundSize = "cover";
    } else if (workoutKey === "hybrid") {
        img.style.backgroundPosition = "center 25%";
        img.style.backgroundSize = "cover";
    }

    const exercises = trainingMode === "home" ? workout.home : workout.gym;

    // Reset timer variables to stationary 00:00:00
    clearInterval(workoutTimer);
    workoutTimer = null;
    workoutStartTime = null;
    workoutPausedTime = 0;
    isWorkoutTimerRunning = false;

    // Reset split times
    exerciseSplitTimes = {};
    activeSplitIndex = null;
    clearInterval(splitTimerInterval);
    splitTimerInterval = null;
    splitStartTime = null;

    list.innerHTML = `
        <div class="workout-tracker">
            <div class="timer-section">
                <span class="timer-label">TOTAL WORKOUT DURATION</span>
                <div class="workout-timer" id="workoutTimer">00:00:00</div>
                <button type="button" class="timer-toggle-btn" id="timerToggleBtn" onclick="toggleWorkoutTimer()">
                    START CLOCK ▶
                </button>
            </div>
            <div class="exercise-progress-box">
                <div class="exercise-progress-text" id="exerciseProgress">0 / ${exercises.length} COMPLETED</div>
                <div class="exercise-progress-track">
                    <div class="exercise-progress-fill" id="exerciseProgressBar"></div>
                </div>
            </div>
        </div>
    `;

    exercises.forEach((ex, idx) => {
        const item = document.createElement("div");
        item.className = "exercise-item";
        item.innerHTML = `
            <div class="exercise-header-row">
                <label class="exercise-label">
                    <input type="checkbox" class="exercise-check" data-index="${idx}">
                    <span class="custom-checkbox">✓</span>
                    <div class="exercise-information">
                        <div class="exercise-name">${idx + 1}. ${ex.name}</div>
                        <div class="exercise-sets">${ex.sets}</div>
                    </div>
                </label>
                <div class="exercise-actions">
                    <button type="button" class="split-timer-btn" id="splitBtn_${idx}" onclick="toggleExerciseSplit(${idx})">
                        SPLIT ▶
                    </button>
                    <span class="split-display-badge" id="splitDisplay_${idx}">00:00</span>
                    <button type="button" class="intel-info-btn" onclick="showExerciseIntel('${ex.name.replace(/'/g, "\\'")}')" aria-label="Exercise details">
                        ℹ
                    </button>
                </div>
            </div>
            <div class="exercise-telemetry">
                <input type="number" placeholder="Weight (KG)" class="telemetry-weight" min="0" step="0.5">
                <input type="number" placeholder="Actual Reps" class="telemetry-reps" min="0" step="1">
            </div>
        `;

        const check = item.querySelector(".exercise-check");
        check.addEventListener("change", function () {
            playBeastTone("click");
            vibrateBeast(40);
            if (this.checked) {
                if (activeSplitIndex === idx) {
                    toggleExerciseSplit(idx);
                }
                completedExercises.add(idx);
                item.classList.add("completed");
                window.startRest(60);
            } else {
                completedExercises.delete(idx);
                item.classList.remove("completed");
            }
            updateExerciseProgress(exercises.length);
        });

        list.appendChild(item);
    });

    modal.classList.add("show");
    document.body.classList.add("modal-open");
    updateExerciseProgress(exercises.length);
};

function updateExerciseProgress(total) {
    const text = document.getElementById("exerciseProgress");
    const bar = document.getElementById("exerciseProgressBar");
    const count = completedExercises.size;
    if (text) text.textContent = `${count} / ${total} COMPLETED`;
    if (bar && total > 0) bar.style.width = `${(count / total) * 100}%`;
}

window.closeWorkout = function () {
    const modal = document.getElementById("workoutModal");
    if (modal) modal.classList.remove("show");
    document.body.classList.remove("modal-open");
    
    clearInterval(workoutTimer);
    workoutTimer = null;
    workoutStartTime = null;
    workoutPausedTime = 0;
    isWorkoutTimerRunning = false;

    clearInterval(splitTimerInterval);
    splitTimerInterval = null;
    activeSplitIndex = null;
    splitStartTime = null;
    exerciseSplitTimes = {};

    activeWorkout = null;
    window.skipRest();
};

/* Rest Timer */
window.startRest = function (seconds = 60) {
    const panel = document.getElementById("restTimerPanel");
    const display = document.getElementById("restTimerDisplay");
    if (!panel || !display) return;

    clearInterval(restTimerInterval);
    restSecondsRemaining = seconds;
    panel.hidden = false;
    display.textContent = formatRestTime(restSecondsRemaining);
    playBeastTone("rest");

    restTimerInterval = setInterval(() => {
        restSecondsRemaining -= 1;
        display.textContent = formatRestTime(Math.max(0, restSecondsRemaining));
        if ([10, 5, 4, 3, 2, 1].includes(restSecondsRemaining)) {
            playBeastTone(restSecondsRemaining <= 5 ? "warning" : "rest");
        }
        if (restSecondsRemaining <= 0) {
            clearInterval(restTimerInterval);
            playBeastTone("victory");
            vibrateBeast([100, 70, 100]);
            display.textContent = "REST COMPLETE";
        }
    }, 1000);
};

window.skipRest = function () {
    clearInterval(restTimerInterval);
    const panel = document.getElementById("restTimerPanel");
    if (panel) panel.hidden = true;
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

    titleEl.textContent = exerciseName.toUpperCase();
    targetsEl.textContent = rawIntel.targets;
    dailyEl.textContent = rawIntel.dailyLife;
    transformEl.textContent = rawIntel.transformation;

    howToEl.innerHTML = rawIntel.howTo
        .map(step => `<li>${step}</li>`)
        .join("");

    modal.classList.add("show");
    playBeastTone("click");
    vibrateBeast(35);
};

window.closeExerciseIntel = function () {
    const modal = document.getElementById("exerciseIntelModal");
    if (modal) modal.classList.remove("show");
};

/* Complete Workout with Progressive Overload Telemetry & Split Time */
window.completeWorkout = function () {
    if (!activeWorkout) return;

    const total = document.querySelectorAll(".exercise-check").length;
    const completed = completedExercises.size;

    if (total > 0 && completed < total) {
        const confirmDone = confirm(`⚠️ ${total - completed} exercise(s) are incomplete. Complete anyway?`);
        if (!confirmDone) return;
    }

    const duration = isWorkoutTimerRunning 
        ? Math.floor((Date.now() - workoutStartTime) / 1000) 
        : Math.floor(workoutPausedTime / 1000);

    const workoutKey = activeWorkout;

    // Harvest Weight, Reps, and Split telemetry
    const telemetryData = [];
    let sessionTonnage = 0;
    document.querySelectorAll(".exercise-item").forEach((item, idx) => {
        const name = item.querySelector(".exercise-name")?.textContent.replace(/^\d+\.\s*/, "").trim();
        const weight = parseFloat(item.querySelector(".telemetry-weight")?.value) || 0;
        const reps = parseInt(item.querySelector(".telemetry-reps")?.value, 10) || 0;
        const splitSecs = exerciseSplitTimes[idx] || 0;

        if (weight > 0 && reps > 0) {
            sessionTonnage += (weight * reps);
        }
        telemetryData.push({ name, weight, reps, splitSeconds: splitSecs });
    });

    beastProgress.workoutsCompleted = (Number(beastProgress.workoutsCompleted) || 0) + 1;
    if (typeof beastProgress[workoutKey] === "number") {
        beastProgress[workoutKey] = Math.min(100, beastProgress[workoutKey] + 10);
    }
    beastProgress.level = Math.floor(beastProgress.workoutsCompleted / 5) + 1;

    updateStreak();

    // Store rich workout telemetry
    const history = getWorkoutHistory();
    history.unshift({
        id: Date.now(),
        workout: workoutKey,
        date: new Date().toISOString(),
        duration,
        tonnage: sessionTonnage,
        telemetry: telemetryData
    });
    saveWorkoutHistory(history);

    try {
        localStorage.setItem("beastProgress", JSON.stringify(beastProgress));
    } catch (e) {
        console.error("Storage error:", e);
    }

    playBeastTone("victory");
    vibrateBeast([80, 50, 160]);

    closeWorkout();
    updateAllUI();
    updateAchievements();

    setTimeout(() => alert("⚔️ WORKOUT COMPLETED! Progressive Overload Telemetry Saved."), 100);
};

function updateStreak() {
    const today = new Date().toISOString().split("T")[0];
    const lastDate = beastProgress.lastWorkoutDate;

    if (!lastDate) {
        beastProgress.streak = 1;
    } else {
        const diffDays = Math.floor((new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) beastProgress.streak += 1;
        else if (diffDays > 1) beastProgress.streak = 1;
    }
    beastProgress.lastWorkoutDate = today;
}

function getWorkoutHistory() {
    try {
        const d = JSON.parse(localStorage.getItem("beastWorkoutHistory"));
        return Array.isArray(d) ? d : [];
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
};

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
    const favorite = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "NONE";

    const todayStr = new Date().toISOString().slice(0, 10);
    const completedToday = history.some(x => x.date.slice(0, 10) === todayStr);

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
            if (d.beastAchievementsUnlocked) localStorage.setItem("beastAchievementsUnlocked", JSON.stringify(d.beastAchievementsUnlocked));
            alert("⚔️ DATA RESTORED! Refreshing...");
            location.reload();
        } catch (_) {
            alert("Invalid Beast backup file.");
        }
    };
    reader.readAsText(file);
};

document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        closeExerciseIntel();
        closeWorkout();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    new BeastParticleCanvas();
    setTrainingMode(trainingMode);

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

    updateAllUI();
    updateAchievements();
});

// PWA Service Worker Registration
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(err => console.error("SW Registration failed:", err));
    });
}