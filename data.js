/*
 * ZOMBIES DEV PLAN · DATA
 * Edit this file to change the plan itself: phases, weeks, goals, milestones, tasks,
 * and the scope sheet categories. Save, then refresh the page.
 *
 * Your progress (task statuses, tasks you added on the page, everything in the scope sheet)
 * is saved separately in your browser and is kept when you edit this file.
 * Statuses are matched by task "id", so keep ids the same when you reword a task,
 * and give any new task a new unique id.
 *
 * Task fields:  id = unique id   t = title   n = note (can be "")   c = 1 core / 0 nice to have
 */

window.PLAN_DATA = {
  title: "Zombies Dev Plan",
  subtitle: "Unreal Engine 5 · 4-player co-op · round-based",
  startDate: "2026-11-09",   // first day of week 1 (you can also change it on the page)
  totalWeeks: 36,

  phases: [
    {
      id: "p1", name: "Pre-production", weeks: [1, 2],
      goal: "Decide exactly what you're building before you build anything. Small, locked scope is what gets games finished.",
      milestone: "One-page design doc written and an empty project in source control.",
      tasks: [
        { id: "a1", c: 1, t: "Write a one-page design doc", n: "Core loop, 4-player co-op, win/lose conditions, and the one thing that makes yours different." },
        { id: "a2", c: 1, t: "Lock the v1 scope", n: "Fill in the scope sheet below, then lock it. Anything new after that goes to Later." },
        { id: "a3", c: 0, t: "Play reference games and list mechanics to copy or skip", n: "" },
        { id: "a4", c: 1, t: "Create the UE5 project and decide Blueprint vs C++", n: "Blueprint is fine. C++ helps once replication and weapon logic get heavy." },
        { id: "a5", c: 1, t: "Set up source control with backups", n: "Git + LFS, Perforce, or Diversion. Commit daily." },
        { id: "a6", c: 1, t: "Set folder structure and naming conventions", n: "BP_, SM_, SK_, M_, MI_, WBP_, ABP_ prefixes from day one." },
        { id: "a7", c: 0, t: "Start a bug list next to this plan", n: "" },
      ]
    },
    {
      id: "p2", name: "Core loop prototype", weeks: [3, 6],
      goal: "Single player, grey boxes, no art. Prove the shoot-survive-earn loop is fun before anything else.",
      milestone: "You can survive rounds, earn points, and die on a greybox map.",
      tasks: [
        { id: "b1", c: 1, t: "First-person character: move, sprint, crouch, jump", n: "" },
        { id: "b2", c: 1, t: "Weapon base class: hitscan fire, ammo, reload, ADS", n: "One weapon Blueprint driven by a Data Asset per gun, so adding guns is just data." },
        { id: "b3", c: 1, t: "Weapon swapping with a 2-gun limit", n: "" },
        { id: "b4", c: 1, t: "Player health, damage, regen, and death", n: "" },
        { id: "b5", c: 1, t: "Basic zombie AI: NavMesh, chase, melee attack", n: "Behavior Tree or StateTree." },
        { id: "b6", c: 1, t: "Zombie health, hit reactions, headshot multiplier", n: "" },
        { id: "b7", c: 1, t: "Zombie spawn points tied to zones", n: "Only spawn in zones players have unlocked." },
        { id: "b8", c: 1, t: "Round manager: zombie count and health scaling per round", n: "Cap zombies alive at once (around 24) and queue the rest." },
        { id: "b9", c: 1, t: "Points: per hit, per kill, headshot bonus", n: "" },
        { id: "b10", c: 1, t: "Greybox test map with 3 to 4 zones", n: "Use modeling tools or BSP. No art yet." },
        { id: "b11", c: 1, t: "Debug HUD: round, points, ammo, health", n: "" },
      ]
    },
    {
      id: "p3", name: "Multiplayer foundation", weeks: [7, 10],
      goal: "Make it co-op now, while the codebase is small. Retrofitting replication after every system exists is the most common way these projects stall.",
      milestone: "Four players can host, join, and survive rounds together.",
      tasks: [
        { id: "c1", c: 1, t: "Pick listen server or dedicated server", n: "Listen server is simplest for 4-player co-op." },
        { id: "c2", c: 1, t: "Sessions: host and join through Steam or EOS", n: "" },
        { id: "c3", c: 1, t: "Replicate movement, firing, reloading", n: "Server decides all damage. Clients only show effects." },
        { id: "c4", c: 1, t: "Move round state to GameState and points to PlayerState", n: "" },
        { id: "c5", c: 1, t: "Replicate zombies with AI running on the server only", n: "" },
        { id: "c6", c: 1, t: "Downed, revive, and bleed-out system", n: "" },
        { id: "c7", c: 1, t: "Spectate when dead, respawn at round end", n: "" },
        { id: "c8", c: 1, t: "Game over when everyone is down, with end-of-match screen", n: "" },
        { id: "c9", c: 0, t: "Lobby with ready-up and player list", n: "" },
        { id: "c10", c: 1, t: "Test with simulated lag and packet loss", n: "Use network emulation in the editor's Play settings." },
      ]
    },
    {
      id: "p4", name: "Zombies systems", weeks: [11, 16],
      goal: "Add the features that make it a round-based zombies game, still on greybox.",
      milestone: "Feature-complete on the greybox map.",
      tasks: [
        { id: "d1", c: 1, t: "Buyable doors and debris that open zones and spawners", n: "" },
        { id: "d2", c: 1, t: "Wall-buy weapons and ammo refills", n: "" },
        { id: "d3", c: 1, t: "Mystery box: random weapon, moves location", n: "" },
        { id: "d4", c: 1, t: "Perk machines: health, fast reload, fire rate, quick revive", n: "" },
        { id: "d5", c: 1, t: "Power-up drops: max ammo, insta-kill, double points, nuke", n: "" },
        { id: "d6", c: 1, t: "Barricade windows that zombies tear down and players rebuild", n: "" },
        { id: "d7", c: 1, t: "Interaction system with prompts and costs", n: "One interface for doors, wall buys, box, perks, and revives." },
        { id: "d8", c: 1, t: "Final HUD: points feed, round counter, perks, downed markers", n: "" },
        { id: "d9", c: 0, t: "Power switch that turns on perks", n: "" },
        { id: "d10", c: 0, t: "Weapon upgrade machine", n: "" },
        { id: "d11", c: 0, t: "Special round every 5 to 6 rounds", n: "Fast enemy type that comes in waves." },
        { id: "d12", c: 0, t: "Second zombie type (runner, tank, etc.)", n: "" },
        { id: "d13", c: 0, t: "Easter egg or main quest", n: "" },
      ]
    },
    {
      id: "p5", name: "Art and audio", weeks: [12, 26],
      goal: "Runs alongside systems work once the greybox layout stops changing. Keep the poly budgets from earlier.",
      milestone: "Map, characters, guns, and zombies fully dressed with sound.",
      tasks: [
        { id: "e1", c: 1, t: "First-person arms with idle, fire, reload, sprint animations", n: "" },
        { id: "e2", c: 1, t: "Gun models", n: "5k to 12k tris third-person, 20k to 40k first-person, 1 material each." },
        { id: "e3", c: 1, t: "Four player characters with LODs", n: "30k to 60k tris each." },
        { id: "e4", c: 1, t: "Zombie models and variants with LODs", n: "They are your most numerous mesh, so keep them lean." },
        { id: "e5", c: 1, t: "Zombie animations: walk, run, attack, death, window climb", n: "" },
        { id: "e6", c: 1, t: "Map art pass replacing the greybox", n: "Use Nanite for static environment meshes." },
        { id: "e7", c: 1, t: "Lighting pass and atmosphere", n: "Lumen or baked lighting, fog, mood." },
        { id: "e8", c: 1, t: "VFX: muzzle flash, impacts, blood, power-up glow", n: "Niagara." },
        { id: "e9", c: 1, t: "Sound: guns, zombies, footsteps, UI", n: "" },
        { id: "e10", c: 1, t: "Menus: main, pause, settings, lobby", n: "" },
        { id: "e11", c: 0, t: "Music and round start/end stingers", n: "" },
      ]
    },
    {
      id: "p6", name: "Polish and optimization", weeks: [25, 31],
      goal: "Make it feel good and run well at high rounds with a full lobby.",
      milestone: "Holds target frame rate with 4 players at round 30+.",
      tasks: [
        { id: "f1", c: 1, t: "Profile at high rounds", n: "stat unit, stat gpu, stat rhi, and Unreal Insights." },
        { id: "f2", c: 1, t: "LODs and AI significance for distant zombies", n: "Tick and animate far zombies less often." },
        { id: "f3", c: 1, t: "Network optimization: relevancy, dormancy, update rates", n: "" },
        { id: "f4", c: 1, t: "Game feel: recoil, hitmarkers, screen shake, kill feedback", n: "" },
        { id: "f5", c: 1, t: "Balance round curve, prices, perk costs, box odds", n: "" },
        { id: "f6", c: 1, t: "Settings: graphics, audio, sensitivity, keybinds, FOV", n: "" },
        { id: "f7", c: 0, t: "Controller support", n: "" },
        { id: "f8", c: 0, t: "Match stats and leaderboards", n: "" },
      ]
    },
    {
      id: "p7", name: "Test and ship", weeks: [30, 36],
      goal: "Get it in front of people, fix what breaks, and release.",
      milestone: "Release build live on Steam.",
      tasks: [
        { id: "g1", c: 1, t: "Weekly 4-player playtests, log every bug", n: "" },
        { id: "g2", c: 1, t: "Package shipping builds and test on a clean PC", n: "" },
        { id: "g3", c: 1, t: "Steam page: capsule art, screenshots, trailer", n: "Put the page up months before launch to collect wishlists." },
        { id: "g4", c: 1, t: "Steamworks setup: app ID, depots, achievements", n: "" },
        { id: "g5", c: 0, t: "Crash reporting", n: "" },
        { id: "g6", c: 0, t: "Launch and first-patch plan", n: "" },
      ]
    }
  ],

  rules: [
    "Finish each milestone before starting the next phase. Art and audio is the only phase meant to overlap.",
    "Greybox everything first. Never make final art for a room whose layout might change.",
    "Build multiplayer in phase 3, not at the end.",
    "Anything not in your locked scope goes in the Later list, not into this build.",
    "Play your own game every week, and with three friends at least once a phase."
  ]
};

/*
 * SCOPE SHEET CATEGORIES
 * Each category: k = unique key, name = heading, one = word used on the "+ Add" button, f = fields.
 * Each field: [key, label, placeholder OR a list of dropdown choices, width weight].
 * Add a field or a whole category here and it appears on the page.
 * Don't change a category's k or a field's key once you've entered data, or that data will be hidden.
 */
window.SCOPE_CATEGORIES = [
  { k: "maps", name: "Maps and zones", one: "zone", f: [
      ["name", "Name", "e.g. Spawn room", 3],
      ["notes", "Notes", "Door cost, what's in it, which zones it connects to", 5] ] },
  { k: "guns", name: "Guns", one: "gun", f: [
      ["name", "Name", "e.g. M1911", 3],
      ["class", "Class", ["Pistol", "SMG", "Assault rifle", "Marksman rifle", "Shotgun", "LMG", "Sniper", "Launcher", "Wonder weapon", "Melee"], 2],
      ["source", "Where to get it", ["Starting weapon", "Wall buy", "Mystery box", "Wall buy + Mystery box", "Quest / Easter egg"], 2],
      ["cost", "Cost", "Cost", 1],
      ["notes", "Notes", "Damage, fire rate, mag size", 3] ] },
  { k: "perks", name: "Perks", one: "perk", f: [
      ["name", "Name", "e.g. Iron Gut", 3],
      ["effect", "Effect", "e.g. Take twice as many hits before going down", 5],
      ["cost", "Cost", "Cost", 1] ] },
  { k: "zombies", name: "Zombie types", one: "zombie type", f: [
      ["name", "Name", "e.g. Shambler", 3],
      ["type", "Type", ["Standard", "Fast", "Tank", "Ranged", "Exploder", "Special round", "Boss"], 2],
      ["round", "First round", "First round", 1],
      ["notes", "Behavior", "Health, speed, attacks, weak spot", 4] ] },
  { k: "powerups", name: "Power-ups", one: "power-up", f: [
      ["name", "Name", "e.g. Max Ammo", 3],
      ["effect", "Effect", "e.g. Refills everyone's ammo", 5] ] },
  { k: "features", name: "Other features", one: "feature", f: [
      ["name", "Name", "e.g. Weapon upgrade machine", 3],
      ["notes", "Notes", "How it works, what it costs", 5] ] }
];

/*
 * TASK PAGES
 * Every task has its own page (click "Page" next to it). A task listed here opens with these sections.
 * Any other task opens with the "default" sections. You can also add your own sections on the page.
 * Each section: k = unique key (don't change once you've written in it), h = heading,
 * hint = grey prompt shown in the empty box, text = optional starting text.
 */
window.PAGE_TEMPLATES = {
  "default": {
    sections: [
      { k: "notes", h: "Notes", hint: "Anything about this task: how you'll do it, what you tried, what's left." },
      { k: "decisions", h: "Decisions", hint: "Choices you made and why, so you don't have to re-decide later." },
      { k: "links", h: "Links and references", hint: "Tutorials, docs, videos, asset links." }
    ]
  },

  // Write a one-page design doc
  "a1": {
    intro: "Keep it to one page. If a section gets long, you're designing too much too early.",
    sections: [
      { k: "pitch", h: "One-line pitch", hint: "The whole game in one sentence. e.g. A 4-player co-op zombie survival game where..." },
      { k: "core", h: "Core loop", hint: "What a player does every round. e.g. Shoot zombies → earn points → spend on doors, guns, perks → survive harder rounds." },
      { k: "players", h: "Players and co-op", hint: "Player count, what happens when someone goes down, revives, whether points are shared." },
      { k: "rounds", h: "Rounds and difficulty", hint: "How zombie count, health and speed grow each round. When special rounds happen." },
      { k: "economy", h: "Points economy", hint: "Points per hit, kill and headshot. Rough prices for doors, wall guns, the box and perks." },
      { k: "winlose", h: "Win and lose", hint: "Game over when everyone is down? Is there an ending, Easter egg or escape?" },
      { k: "setting", h: "Setting and tone", hint: "Where and when it takes place, the art style, the mood." },
      { k: "unique", h: "What makes it different", hint: "The one or two things players will remember about your game." },
      { k: "notv1", h: "Not in v1", hint: "Good ideas you're deliberately saving for later." }
    ]
  },

  // Play reference games
  "a3": {
    sections: [
      { k: "games", h: "Games to play", hint: "Which games and modes, and what to pay attention to in each." },
      { k: "copy", h: "Copy", hint: "Mechanics that work and that you want too." },
      { k: "skip", h: "Skip", hint: "Things that annoyed you or don't fit your game." },
      { k: "ideas", h: "Ideas sparked", hint: "New ideas that came up while playing." }
    ]
  },

  // Create the UE5 project
  "a4": {
    sections: [
      { k: "lang", h: "Blueprint or C++", hint: "Which, and why. Mixed is common: C++ base classes, Blueprint children." },
      { k: "version", h: "Engine version", hint: "Pick one version and stay on it until you ship." },
      { k: "template", h: "Template and plugins", hint: "e.g. First Person template, Online Subsystem Steam, Enhanced Input." },
      { k: "target", h: "Target platforms and specs", hint: "PC only? Minimum GPU you want to support?" }
    ]
  },

  // Source control
  "a5": {
    sections: [
      { k: "tool", h: "Tool and host", hint: "e.g. Git + LFS on GitHub, Perforce, or Diversion." },
      { k: "ignore", h: "What not to commit", hint: "Binaries/, Intermediate/, Saved/, DerivedDataCache/ and .vs/ should be ignored." },
      { k: "routine", h: "Routine", hint: "e.g. Commit at the end of every session with a short message. Push daily." }
    ]
  },

  // Naming conventions
  "a6": {
    sections: [
      { k: "prefixes", h: "Asset prefixes", hint: "", text: "BP_  Blueprint\nSM_  Static mesh\nSK_  Skeletal mesh\nABP_ Animation Blueprint\nAM_  Anim montage\nA_   Animation sequence\nM_   Material\nMI_  Material instance\nT_   Texture (suffix _D diffuse, _N normal, _ORM packed)\nWBP_ Widget Blueprint\nNS_  Niagara system\nS_   Sound\nDA_  Data asset\nE_   Enum\nF_   Struct" },
      { k: "folders", h: "Folder structure", hint: "", text: "Content/\n  Zombies/        (your game's root folder)\n    Core/          GameMode, GameState, PlayerState, interfaces\n    Characters/    Player/, Zombies/\n    Weapons/       one folder per gun\n    Maps/\n    UI/\n    Audio/\n    VFX/" },
      { k: "other", h: "Other rules", hint: "e.g. No spaces in names. Variables in PascalCase. Booleans start with b." }
    ]
  },

  // Bug list
  "a7": {
    sections: [
      { k: "open", h: "Open bugs", hint: "One per line: what happens, how to make it happen, how bad it is." },
      { k: "fixed", h: "Fixed", hint: "Move bugs here when they're fixed." }
    ]
  },

  // Round manager
  "b8": {
    sections: [
      { k: "count", h: "Zombie count per round", hint: "e.g. Round 1: 6 per player, then +2 per player each round." },
      { k: "health", h: "Health scaling", hint: "e.g. 150 HP at round 1, +100 per round until round 10, then ×1.1 per round." },
      { k: "speed", h: "Speed changes", hint: "Which rounds zombies start jogging and sprinting." },
      { k: "cap", h: "Max alive at once", hint: "e.g. 24. The rest wait in a queue." },
      { k: "breaks", h: "Time between rounds", hint: "Seconds of downtime, and what plays (sound, UI) at round start and end." }
    ]
  },

  // Listen or dedicated server
  "c1": {
    sections: [
      { k: "choice", h: "Choice", hint: "Listen server or dedicated server." },
      { k: "why", h: "Why", hint: "Cost, cheating, latency, how players will find games." },
      { k: "hosting", h: "Hosting and matchmaking", hint: "Steam lobbies, EOS, invite-only, server browser?" }
    ]
  },

  // Steam page
  "g3": {
    sections: [
      { k: "short", h: "Short description", hint: "The one or two sentences under the capsule image." },
      { k: "capsule", h: "Capsule art", hint: "Ideas and sizes needed." },
      { k: "shots", h: "Screenshots", hint: "List of moments to capture." },
      { k: "trailer", h: "Trailer plan", hint: "Shot list, length, music." },
      { k: "tags", h: "Tags", hint: "e.g. Zombies, Co-op, FPS, Survival, Wave-based." }
    ]
  }
};
