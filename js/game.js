/* ==========================================================================
   Food Web Rescue Mission — playable game engine
   Canvas-based adventure with movement, collection, puzzles and saving.
   ========================================================================== */

(() => {
  "use strict";

  const A = window.FWR_APP;
  const D = window.FWR;
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  let W = 0;
  let H = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  const SAVE_KEY = "fwr_game_v1";

  const state = {
    mode: "title",
    worldId: "grassland",
    player: { x: 260, y: 260, speed: 260, r: 16, facing: 1 },
    camera: { x: 0, y: 0 },
    keys: {},
    discovered: new Set(),
    collected: new Set(),
    inventory: [],
    xp: 0,
    badges: new Set(),
    health: 100,
    worldPhase: "explore",
    interactTarget: null,
    scannerTarget: null,
    message: null,
    messageTimer: 0,
    chainSelection: [],
    energyAnswered: false,
    cascadeAnswered: false,
    completedWorlds: new Set(),
    world: null,
    orbs: [],
    time: 0,
  };

  const WORLDS = [
    {
      id: "grassland",
      name: "Grassland Kingdom",
      bg: "#e8f3e8",
      accent: "#2e7d32",
      sky: "#f4efe3",
      organisms: [
        { id: "grass", name: "Grass", emoji: "🌿", tier: "T1 Producer", food: "Sunlight, water and minerals", x: 360, y: 320 },
        { id: "grasshopper", name: "Grasshopper", emoji: "🦗", tier: "T2 Primary consumer", food: "Grass", x: 620, y: 420 },
        { id: "frog", name: "Frog", emoji: "🐸", tier: "T3 Secondary consumer", food: "Grasshoppers", x: 900, y: 360 },
        { id: "snake", name: "Snake", emoji: "🐍", tier: "T3-T4 Consumer", food: "Frogs and rabbits", x: 1180, y: 520 },
        { id: "eagle", name: "Eagle", emoji: "🦅", tier: "T3-T4 Apex consumer", food: "Rabbits and snakes", x: 1450, y: 260 },
        { id: "decomposer", name: "Fungi & Bacteria", emoji: "🍄", tier: "Decomposer", food: "Dead organic matter", x: 520, y: 760 },
      ],
      required: ["grass", "grasshopper", "frog", "snake", "eagle"],
      chain: ["grass", "grasshopper", "frog", "snake", "eagle"],
      energy: {
        question: "If producers contain 10,000 J, how much energy reaches secondary consumers under the 10% law?",
        options: ["1,000 J", "100 J", "10 J", "9,000 J"],
        answer: 1,
        why: "10,000 J becomes 1,000 J in primary consumers and 100 J in secondary consumers.",
      },
      cascade: {
        question: "If snakes disappear, which changes are expected?",
        options: [
          { id: "frog", text: "Frog population increases" },
          { id: "rabbit", text: "Rabbit population increases" },
          { id: "grass", text: "Grass population decreases" },
          { id: "eagle", text: "Eagle population decreases slightly" },
          { id: "stable", text: "The ecosystem remains stable" },
        ],
        correct: new Set(["frog", "rabbit", "grass", "eagle"]),
        explanation: "Removing snakes releases frogs and rabbits. Extra grazing pressure reduces grass, while eagles lose snake prey and decline slightly.",
      },
    },
    {
      id: "forest",
      name: "Forest Realm",
      bg: "#eef5e6",
      accent: "#1f5e24",
      sky: "#f4efe3",
      organisms: [
        { id: "leaves", name: "Leaf litter", emoji: "🍂", tier: "Producer matter", food: "Fallen leaves", x: 340, y: 320 },
        { id: "caterpillar", name: "Caterpillar", emoji: "🐛", tier: "Primary consumer", food: "Leaves", x: 620, y: 420 },
        { id: "bird", name: "Bird", emoji: "🐦", tier: "Secondary consumer", food: "Caterpillars", x: 920, y: 340 },
        { id: "owl", name: "Owl", emoji: "🦉", tier: "Apex consumer", food: "Birds", x: 1220, y: 480 },
        { id: "mushroom", name: "Mushroom", emoji: "🍄", tier: "Decomposer", food: "Dead matter", x: 560, y: 760 },
      ],
      required: ["leaves", "caterpillar", "bird", "owl"],
      chain: ["leaves", "caterpillar", "bird", "owl"],
      energy: {
        question: "If producers contain 10,000 J, how much energy reaches secondary consumers under the 10% law?",
        options: ["1,000 J", "100 J", "10 J", "9,000 J"],
        answer: 1,
        why: "10,000 J becomes 1,000 J in primary consumers and 100 J in secondary consumers.",
      },
      cascade: {
        question: "If owls disappear, which changes are expected?",
        options: [
          { id: "bird", text: "Bird population increases" },
          { id: "caterpillar", text: "Caterpillar population decreases" },
          { id: "leaves", text: "Leaf litter decreases" },
          { id: "owl", text: "Owl population removed" },
          { id: "stable", text: "The forest remains stable" },
        ],
        correct: new Set(["bird", "caterpillar", "leaves", "owl"]),
        explanation: "Removing owls releases birds, which eat more caterpillars and indirectly reduce leaf litter.",
      },
    },
    {
      id: "freshwater",
      name: "Freshwater World",
      bg: "#e6f3f7",
      accent: "#1f6f8b",
      sky: "#eef7fa",
      organisms: [
        { id: "algae", name: "Algae", emoji: "🫧", tier: "T1 Producer", food: "Sunlight and nutrients", x: 340, y: 320 },
        { id: "zooplankton", name: "Zooplankton", emoji: "🦐", tier: "T2 Primary consumer", food: "Algae", x: 620, y: 420 },
        { id: "smallfish", name: "Small fish", emoji: "🐟", tier: "T3 Secondary consumer", food: "Zooplankton", x: 920, y: 340 },
        { id: "largefish", name: "Large fish", emoji: "🐠", tier: "T4 Tertiary consumer", food: "Small fish", x: 1220, y: 480 },
        { id: "heron", name: "Heron", emoji: "🦢", tier: "Apex consumer", food: "Large fish", x: 1480, y: 260 },
      ],
      required: ["algae", "zooplankton", "smallfish", "largefish", "heron"],
      chain: ["algae", "zooplankton", "smallfish", "largefish", "heron"],
      energy: {
        question: "If producers contain 10,000 J, how much energy reaches secondary consumers under the 10% law?",
        options: ["1,000 J", "100 J", "10 J", "9,000 J"],
        answer: 1,
        why: "10,000 J becomes 1,000 J in primary consumers and 100 J in secondary consumers.",
      },
      cascade: {
        question: "If herons disappear, which changes are expected?",
        options: [
          { id: "largefish", text: "Large fish population increases" },
          { id: "smallfish", text: "Small fish population decreases" },
          { id: "algae", text: "Algae population decreases" },
          { id: "heron", text: "Heron population removed" },
          { id: "stable", text: "The water stays stable" },
        ],
        correct: new Set(["largefish", "smallfish", "algae", "heron"]),
        explanation: "Removing herons releases large fish, which reduce small fish and indirectly reduce algae.",
      },
    },
    {
      id: "marine",
      name: "Marine Kingdom",
      bg: "#e3f1f7",
      accent: "#17607d",
      sky: "#eaf6fb",
      organisms: [
        { id: "kelp", name: "Kelp", emoji: "🌿", tier: "T1 Producer", food: "Sunlight and nutrients", x: 340, y: 320 },
        { id: "krill", name: "Krill", emoji: "🦐", tier: "T2 Primary consumer", food: "Kelp and plankton", x: 620, y: 420 },
        { id: "sardine", name: "Sardine", emoji: "🐟", tier: "T3 Secondary consumer", food: "Krill", x: 920, y: 340 },
        { id: "seal", name: "Seal", emoji: "🦭", tier: "T4 Tertiary consumer", food: "Sardines", x: 1220, y: 480 },
        { id: "shark", name: "Shark", emoji: "🦈", tier: "Apex consumer", food: "Seals", x: 1480, y: 260 },
      ],
      required: ["kelp", "krill", "sardine", "seal", "shark"],
      chain: ["kelp", "krill", "sardine", "seal", "shark"],
      energy: {
        question: "If producers contain 10,000 J, how much energy reaches secondary consumers under the 10% law?",
        options: ["1,000 J", "100 J", "10 J", "9,000 J"],
        answer: 1,
        why: "10,000 J becomes 1,000 J in primary consumers and 100 J in secondary consumers.",
      },
      cascade: {
        question: "If sharks disappear, which changes are expected?",
        options: [
          { id: "seal", text: "Seal population increases" },
          { id: "sardine", text: "Sardine population decreases" },
          { id: "kelp", text: "Kelp population decreases" },
          { id: "shark", text: "Shark population removed" },
          { id: "stable", text: "The ocean stays stable" },
        ],
        correct: new Set(["seal", "sardine", "kelp", "shark"]),
        explanation: "Removing sharks releases seals, which reduce sardines and indirectly reduce kelp.",
      },
    },
  ];

  const WORLD_BY_ID = Object.fromEntries(WORLDS.map((w) => [w.id, w]));

  function organismById(world, id) {
    return world.organisms.find((o) => o.id === id);
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      state.xp = Number(parsed.xp) || 0;
      state.badges = new Set(Array.isArray(parsed.badges) ? parsed.badges : []);
      state.completedWorlds = new Set(Array.isArray(parsed.completedWorlds) ? parsed.completedWorlds : []);
      if (parsed.settings && typeof parsed.settings.sound === "boolean") {
        A.state.settings.audio = parsed.settings.sound;
        A.applySettings();
      }
    } catch (e) {}
  }

  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        xp: state.xp,
        badges: [...state.badges],
        completedWorlds: [...state.completedWorlds],
        settings: { sound: !!A.state.settings.audio },
      }));
    } catch (e) {}
  }

  function showPanel(id) {
    document.querySelectorAll(".game-panel").forEach((p) => p.classList.add("hidden"));
    const panel = document.getElementById(id);
    if (panel) panel.classList.remove("hidden");
  }

  function hidePanels() {
    document.querySelectorAll(".game-panel").forEach((p) => p.classList.add("hidden"));
  }

  function setMessage(text, tone) {
    state.message = text;
    state.messageTone = tone || "";
    state.messageTimer = 3.2;
  }

  function setMode(mode) {
    state.mode = mode;
    if (mode === "title") showPanel("titlePanel");
    else if (mode === "howto") showPanel("howToPanel");
    else if (mode === "map") { renderWorldGrid(); showPanel("mapPanel"); }
    else if (mode === "paused") showPanel("pausePanel");
    else if (mode === "scanner") { renderScanner(); showPanel("scannerPanel"); }
    else if (mode === "journal") { renderJournal(); showPanel("journalPanel"); }
    else if (mode === "chain") { renderChain(); showPanel("chainPanel"); }
    else if (mode === "energy") { renderEnergy(); showPanel("energyPanel"); }
    else if (mode === "cascade") { renderCascade(); showPanel("cascadePanel"); }
    else if (mode === "victory") showPanel("victoryPanel");
    else hidePanels();
  }

  function updateObjective() {
    const el = document.getElementById("hudObjective");
    if (!el) return;
    if (!state.world) { el.textContent = "Start adventure"; return; }
    const labels = {
      explore: "Discover all organisms",
      journal: "Open Eco Journal (J)",
      chain: "Build the food chain",
      energy: "Solve energy challenge",
      cascade: "Predict and rescue",
      complete: "Mission complete",
    };
    el.textContent = labels[state.worldPhase] || "Explore";
  }

  function updateHud() {
    document.getElementById("hudWorld").textContent = state.world ? state.world.name : "Title";
    document.getElementById("hudXp").textContent = state.xp;
    document.getElementById("hudBadges").textContent = state.badges.size;
    document.getElementById("hudHealth").style.width = Math.max(0, Math.min(100, state.health)) + "%";
    updateObjective();
  }

  function startWorld(id) {
    const world = WORLD_BY_ID[id];
    if (!world) return;
    state.world = world;
    state.worldId = id;
    state.player.x = 220;
    state.player.y = 260;
    state.camera.x = 0;
    state.camera.y = 0;
    state.discovered = new Set();
    state.collected = new Set();
    state.inventory = [];
    state.health = 100;
    state.worldPhase = "explore";
    updateObjective();
    state.chainSelection = [];
    state.energyAnswered = false;
    state.cascadeAnswered = false;
    state.worldCompleted = false;
    state.orbs = world.organisms.map((o) => ({ x: o.x + 30, y: o.y - 20, collected: false, id: o.id }));
    state.mode = "playing";
    hidePanels();
    setMessage("Explore " + world.name + " and discover organisms. Press E near a glowing orb.", "positive");
    A.playClick();
    saveGame();
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function update(dt) {
    state.time += dt;
    if (state.mode !== "playing") return;

    const p = state.player;
    let vx = 0;
    let vy = 0;
    if (state.keys["ArrowLeft"] || state.keys["a"] || state.keys["A"]) vx -= 1;
    if (state.keys["ArrowRight"] || state.keys["d"] || state.keys["D"]) vx += 1;
    if (state.keys["ArrowUp"] || state.keys["w"] || state.keys["W"]) vy -= 1;
    if (state.keys["ArrowDown"] || state.keys["s"] || state.keys["S"]) vy += 1;
    const len = Math.hypot(vx, vy) || 1;
    p.x += (vx / len) * p.speed * dt;
    p.y += (vy / len) * p.speed * dt;
    p.x = Math.max(40, Math.min(2360, p.x));
    p.y = Math.max(40, Math.min(1560, p.y));
    if (vx !== 0) p.facing = vx > 0 ? 1 : -1;

    state.camera.x = Math.max(0, Math.min(2400 - W, p.x - W / 2));
    state.camera.y = Math.max(0, Math.min(1600 - H, p.y - H / 2));

    state.interactTarget = null;
    for (const org of state.world.organisms) {
      if (distance(p, org) < 70) {
        state.interactTarget = org;
        break;
      }
    }

    for (const orb of state.orbs) {
      if (!orb.collected && distance(p, orb) < 28) {
        orb.collected = true;
        const org = organismById(state.world, orb.id);
        if (org && !state.collected.has(org.id)) {
          state.collected.add(org.id);
          state.inventory.push(org);
          state.xp += 10;
          state.discovered.add(org.id);
          setMessage("Discovered " + org.name + " +" + 10 + " XP", "positive");
          A.playCorrect();
          saveGame();
        }
      }
    }

    if (state.collected.size >= state.world.required.length && state.worldPhase === "explore") {
      state.worldPhase = "journal";
      setMessage("All organisms discovered. Open the Eco Journal (J).", "positive");
    }

    if (state.messageTimer > 0) {
      state.messageTimer -= dt;
      if (state.messageTimer <= 0) state.message = null;
    }
    updateHud();
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    if (state.mode === "title" || state.mode === "howto" || state.mode === "map" || state.mode === "paused" || state.mode === "victory") {
      drawTitleBackground();
      return;
    }
    if (!state.world) return;

    const world = state.world;
    ctx.save();
    ctx.translate(-state.camera.x, -state.camera.y);

    ctx.fillStyle = world.bg;
    ctx.fillRect(0, 0, 2400, 1600);

    ctx.fillStyle = "rgba(46,125,50,0.06)";
    for (let i = 0; i < 120; i++) {
      const x = (i * 137) % 2400;
      const y = (i * 97) % 1600;
      ctx.fillRect(x, y, 2, 8);
    }

    for (let x = 120; x < 2400; x += 320) {
      for (let y = 180; y < 1600; y += 360) {
        ctx.fillStyle = "rgba(75,58,47,0.22)";
        ctx.fillRect(x - 6, y - 40, 12, 80);
        ctx.fillStyle = world.accent;
        ctx.globalAlpha = 0.28;
        ctx.beginPath();
        ctx.arc(x, y - 70, 58, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    ctx.fillStyle = "rgba(46,125,50,0.08)";
    for (let i = 0; i < 80; i++) {
      const x = (i * 137) % 2400;
      const y = (i * 97) % 1600;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const org of world.organisms) {
      const collected = state.collected.has(org.id);
      ctx.globalAlpha = collected ? 0.45 : 1;
      ctx.font = "42px Segoe UI Emoji, Apple Color Emoji, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(org.emoji, org.x, org.y);
      ctx.globalAlpha = 1;
      ctx.font = "bold 13px Segoe UI, sans-serif";
      ctx.fillStyle = "#2b2a24";
      ctx.fillText(org.name, org.x, org.y + 42);
      if (collected) {
        ctx.font = "bold 12px Segoe UI, sans-serif";
        ctx.fillStyle = "#2e7d32";
        ctx.fillText("✓", org.x + 24, org.y - 24);
      }
    }

    for (const orb of state.orbs) {
      if (orb.collected) continue;
      const pulse = 10 + Math.sin(state.time * 4 + orb.x) * 3;
      ctx.fillStyle = "rgba(183,121,31,0.9)";
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fffaf0";
      ctx.font = "bold 12px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("★", orb.x, orb.y);
    }

    const p = state.player;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.facing, 1);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(0, 18, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2e7d32";
    ctx.beginPath();
    ctx.arc(0, 0, p.r + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f7f0e1";
    ctx.beginPath();
    ctx.arc(0, -2, p.r - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2b2a24";
    ctx.beginPath();
    ctx.arc(5, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();

    const mini = document.getElementById("miniMap");
    if (mini && state.world) {
      const mctx = mini.getContext("2d");
      mctx.clearRect(0, 0, mini.width, mini.height);
      mctx.fillStyle = state.world.bg;
      mctx.fillRect(0, 0, mini.width, mini.height);
      const sx = mini.width / 2400;
      const sy = mini.height / 1600;
      for (const org of state.world.organisms) {
        mctx.fillStyle = state.collected.has(org.id) ? "#b9a57a" : "#2e7d32";
        mctx.fillRect(org.x * sx - 2, org.y * sy - 2, 4, 4);
      }
      mctx.fillStyle = "#c0392b";
      mctx.fillRect(state.player.x * sx - 3, state.player.y * sy - 3, 6, 6);
    }

    if (state.message) {
      ctx.fillStyle = state.messageTone === "positive" ? "rgba(46,125,50,0.92)" : "rgba(192,57,43,0.92)";
      ctx.fillRect(20, H - 70, W - 40, 46);
      ctx.fillStyle = "#fffaf0";
      ctx.font = "bold 16px Segoe UI, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(state.message, 36, H - 47);
    }

    if (state.interactTarget) {
      const org = state.interactTarget;
      ctx.fillStyle = "rgba(43,42,36,0.78)";
      ctx.fillRect(W / 2 - 150, H - 118, 300, 34);
      ctx.fillStyle = "#fffaf0";
      ctx.font = "bold 15px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Press E: discover " + org.name, W / 2, H - 101);
    }
  }

  function drawTitleBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#f4efe3");
    g.addColorStop(1, "#e8f3e8");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(46,125,50,0.12)";
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      ctx.arc((i * 137) % W, (i * 97) % H, 40 + (i % 5) * 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.font = "24px Segoe UI Emoji, Apple Color Emoji, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < 14; i++) {
      const x = ((i * 173 + state.time * (20 + i * 3)) % (W + 80)) - 40;
      const y = (i * 97 + Math.sin(state.time + i) * 40 + H * 0.2) % H;
      ctx.globalAlpha = 0.7;
      ctx.fillText(i % 2 === 0 ? "🍃" : "🌿", x, y);
    }
    ctx.globalAlpha = 1;
  }

  function renderWorldGrid() {
    const grid = document.getElementById("worldGrid");
    grid.innerHTML = WORLDS.map((w) => {
      const completed = state.completedWorlds.has(w.id);
      const locked = false;
      return `
        <div class="org-card">
          <div style="font-size:2rem;">${completed ? "✅" : "🌍"}</div>
          <strong>${w.name}</strong>
          <div class="muted small">${completed ? "Completed" : "Ready"}</div>
          <button class="game-btn ${completed ? "" : "primary"}" data-world="${w.id}" style="margin-top:8px;">${completed ? "Replay" : "Enter"}</button>
        </div>
      `;
    }).join("");
    grid.querySelectorAll("[data-world]").forEach((btn) => {
      btn.addEventListener("click", () => {
        A.unlockAudio();
        A.playClick();
        startWorld(btn.dataset.world);
      });
    });
  }

  function renderScanner() {
    const org = state.scannerTarget;
    const title = document.getElementById("scannerTitle");
    const content = document.getElementById("scannerContent");
    const collectBtn = document.getElementById("collectBtn");
    if (!org) return;
    title.textContent = "Eco Scanner: " + org.name;
    content.innerHTML = `
      <div style="font-size:3rem;text-align:center;">${org.emoji}</div>
      <p><strong>Trophic level:</strong> ${org.tier}</p>
      <p><strong>Food:</strong> ${org.food}</p>
      <p class="muted">Scan complete. This organism is part of the ${state.world.name} food web.</p>
      ${state.collected.has(org.id) ? "<p class='message positive'>Already collected.</p>" : "<p class='message'>Collect this specimen for your Eco Journal.</p>"}
    `;
    collectBtn.disabled = state.collected.has(org.id);
    collectBtn.textContent = state.collected.has(org.id) ? "Collected" : "Collect specimen";
  }

  function renderJournal() {
    const content = document.getElementById("journalContent");
    if (!state.world) return;
    const discoveredOrgs = state.world.organisms.filter((o) => state.collected.has(o.id));
    content.innerHTML = `
      <p><strong>Discovered:</strong> ${discoveredOrgs.length} / ${state.world.organisms.length}</p>
      <div class="organism-grid">
        ${discoveredOrgs.map((o) => `
          <div class="org-card">
            <div style="font-size:2rem;">${o.emoji}</div>
            <strong>${o.name}</strong>
            <div class="muted small">${o.tier}</div>
            <div class="muted small">Eats: ${o.food}</div>
          </div>
        `).join("") || "<p class='muted'>No organisms discovered yet.</p>"}
      </div>
      ${state.worldPhase === "journal" ? "<p class='message positive'>Now rebuild the food chain in the correct energy-flow order.</p>" : ""}
    `;
  }

  function renderChain() {
    const slots = document.getElementById("chainSlots");
    const choices = document.getElementById("chainChoices");
    const message = document.getElementById("chainMessage");
    if (!state.world) return;
    const orgs = state.world.organisms;
    slots.innerHTML = state.world.chain.map((id, index) => {
      const selectedId = state.chainSelection[index];
      const org = selectedId ? organismById(state.world, selectedId) : null;
      return `<div class="slot ${org ? "filled" : ""}">${org ? org.emoji + " " + org.name : "Slot " + (index + 1)}</div>`;
    }).join("");

    const used = new Set(state.chainSelection);
    choices.innerHTML = orgs.map((o) => `
      <button class="org-btn" data-chain-org="${o.id}" ${used.has(o.id) ? "disabled" : ""}>${o.emoji} ${o.name}</button>
    `).join("");

    choices.querySelectorAll("[data-chain-org]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.chainSelection.length >= state.world.chain.length) return;
        state.chainSelection.push(btn.dataset.chainOrg);
        A.playClick();
        renderChain();
        if (state.chainSelection.length === state.world.chain.length) validateChain();
      });
    });

    message.innerHTML = "";
  }

  function validateChain() {
    const message = document.getElementById("chainMessage");
    const correct = state.world.chain.every((id, index) => state.chainSelection[index] === id);
    if (correct) {
      message.innerHTML = "<div class='message positive'>Correct food chain! Energy flows from food to consumer. +" + 30 + " XP</div>";
      state.xp += 30;
      state.worldPhase = "energy";
      A.playCorrect();
      saveGame();
      setTimeout(() => {
        hidePanels();
        setMode("energy");
      }, 900);
    } else {
      message.innerHTML = "<div class='message negative'>That order is not right. Check the direction of energy flow.</div>";
      A.playWrong();
    }
  }

  function renderEnergy() {
    const question = document.getElementById("energyQuestion");
    const options = document.getElementById("energyOptions");
    const message = document.getElementById("energyMessage");
    if (!state.world) return;
    question.textContent = state.world.energy.question;
    options.innerHTML = state.world.energy.options.map((opt, index) => `
      <button class="game-btn" data-energy="${index}" style="display:block;width:100%;margin:6px 0;text-align:left;">${String.fromCharCode(65 + index)}. ${opt}</button>
    `).join("");
    message.innerHTML = "";

    options.querySelectorAll("[data-energy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.energyAnswered) return;
        state.energyAnswered = true;
        const index = Number(btn.dataset.energy);
        if (index === state.world.energy.answer) {
          message.innerHTML = "<div class='message positive'>Correct! " + state.world.energy.why + " +" + 20 + " XP</div>";
          state.xp += 20;
          state.worldPhase = "cascade";
          A.playCorrect();
          saveGame();
          setTimeout(() => {
            hidePanels();
            setMode("cascade");
          }, 900);
        } else {
          message.innerHTML = "<div class='message negative'>Not quite. " + state.world.energy.why + "</div>";
          state.health = Math.max(0, state.health - 5);
          A.playWrong();
          state.energyAnswered = false;
        }
      });
    });
  }

  function renderCascade() {
    const options = document.getElementById("cascadeOptions");
    const message = document.getElementById("cascadeMessage");
    if (!state.world) return;
    options.innerHTML = state.world.cascade.options.map((opt) => `
      <label class="org-card" style="display:flex;align-items:center;gap:8px;text-align:left;">
        <input type="checkbox" value="${opt.id}">
        <span>${opt.text}</span>
      </label>
    `).join("");
    message.innerHTML = `<p class="muted">${state.world.cascade.explanation}</p>`;
  }

  function submitCascade() {
    if (!state.world) return;
    const checked = new Set(Array.from(document.querySelectorAll("#cascadeOptions input:checked")).map((i) => i.value));
    const correct = checked.size === state.world.cascade.correct.size &&
      Array.from(checked).every((id) => state.world.cascade.correct.has(id));
    const message = document.getElementById("cascadeMessage");
    if (correct) {
      message.innerHTML = "<div class='message positive'>" + state.world.cascade.explanation + " +" + 20 + " XP</div>";
      state.xp += 20;
      state.worldPhase = "complete";
      state.health = 100;
      A.playComplete();
      saveGame();
      setTimeout(() => {
        state.completedWorlds.add(state.world.id);
        state.badges.add(state.world.id + "-guardian");
        if (state.completedWorlds.size >= 1) state.badges.add("food-chain-builder");
        saveGame();
        document.getElementById("victoryTitle").textContent = state.world.name + " Restored!";
        document.getElementById("victoryText").textContent =
          "You discovered the organisms, rebuilt the food chain, mastered energy transfer and restored ecosystem stability. Total XP: " + state.xp + ".";
        setMode("victory");
      }, 900);
    } else {
      message.innerHTML = "<div class='message negative'>Review the highlighted cascade and try again.</div>";
      state.health = Math.max(0, state.health - 10);
      A.playWrong();
    }
  }

  function handleKeydown(event) {
    state.keys[event.key] = true;
    if (event.key === "e" || event.key === "E") {
      if (state.mode === "playing" && state.interactTarget) {
        state.scannerTarget = state.interactTarget;
        renderScanner();
        setMode("scanner");
        A.playClick();
      }
    }
    if (event.key === "j" || event.key === "J") {
      if (state.mode === "playing") setMode("journal");
    }
    if (event.key === "p" || event.key === "P") {
      if (state.mode === "playing") setMode("paused");
      else if (state.mode === "paused") setMode("playing");
    }
    if (event.key === "Escape") {
      if (state.mode === "journal" || state.mode === "chain" || state.mode === "energy" || state.mode === "cascade" || state.mode === "scanner") setMode("playing");
      else if (state.mode === "paused") setMode("playing");
      else if (state.mode === "howto") setMode("title");
      else if (state.mode === "map") setMode("title");
    }
  }

  function handleKeyup(event) {
    state.keys[event.key] = false;
  }

  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("keyup", handleKeyup);

  document.getElementById("startBtn").addEventListener("click", () => {
    A.unlockAudio();
    A.playClick();
    setMode("map");
  });

  document.getElementById("howToBtn").addEventListener("click", () => {
    A.unlockAudio();
    A.playClick();
    setMode("howto");
  });

  document.getElementById("howToClose").addEventListener("click", () => {
    A.playClick();
    setMode("title");
  });

  document.getElementById("mapClose").addEventListener("click", () => {
    A.playClick();
    setMode("title");
  });

  document.getElementById("pauseBtn").addEventListener("click", () => {
    A.unlockAudio();
    if (state.mode === "playing") setMode("paused");
  });

  document.getElementById("soundBtn").addEventListener("click", () => {
    A.state.settings.audio = !A.state.settings.audio;
    A.saveState();
    A.applySettings();
    if (A.state.settings.audio) A.unlockAudio();
    document.getElementById("soundBtn").textContent = A.state.settings.audio ? "Sound" : "Muted";
    A.playClick();
  });

  document.getElementById("resumeBtn").addEventListener("click", () => {
    A.playClick();
    setMode("playing");
  });

  document.getElementById("restartBtn").addEventListener("click", () => {
    A.playClick();
    if (state.world) startWorld(state.world.id);
  });

  document.getElementById("quitBtn").addEventListener("click", () => {
    A.playClick();
    saveGame();
    setMode("map");
  });

  document.getElementById("journalClose").addEventListener("click", () => {
    A.playClick();
    setMode("playing");
  });

  document.getElementById("collectBtn").addEventListener("click", () => {
    const org = state.scannerTarget;
    if (!org || state.collected.has(org.id)) return;
    state.collected.add(org.id);
    state.inventory.push(org);
    state.xp += 10;
    state.discovered.add(org.id);
    setMessage("Discovered " + org.name + " +" + 10 + " XP", "positive");
    A.playCorrect();
    saveGame();
    renderScanner();
    if (state.collected.size >= state.world.required.length && state.worldPhase === "explore") {
      state.worldPhase = "journal";
      setMessage("All organisms discovered. Open the Eco Journal (J).", "positive");
    }
  });

  document.getElementById("scannerClose").addEventListener("click", () => {
    A.playClick();
    setMode("playing");
  });

  document.getElementById("openChainBtn").addEventListener("click", () => {
    A.playClick();
    state.chainSelection = [];
    setMode("chain");
  });

  document.getElementById("chainReset").addEventListener("click", () => {
    A.playClick();
    state.chainSelection = [];
    renderChain();
  });

  document.getElementById("chainClose").addEventListener("click", () => {
    A.playClick();
    setMode("playing");
  });

  document.getElementById("energyClose").addEventListener("click", () => {
    A.playClick();
    setMode("playing");
  });

  document.getElementById("cascadeClose").addEventListener("click", () => {
    A.playClick();
    setMode("playing");
  });

  const cascadeSubmit = document.createElement("button");
  cascadeSubmit.className = "game-btn primary";
  cascadeSubmit.textContent = "Submit Prediction";
  cascadeSubmit.style.marginTop = "10px";
  cascadeSubmit.addEventListener("click", () => {
    A.unlockAudio();
    A.playClick();
    submitCascade();
  });
  document.getElementById("cascadePanel").querySelector(".panel-box").insertBefore(cascadeSubmit, document.getElementById("cascadeClose").parentElement);

  document.getElementById("victoryContinue").addEventListener("click", () => {
    A.playClick();
    setMode("map");
  });

  A.init();
  loadGame();
  setMode("title");
  updateHud();
  requestAnimationFrame(function loop(now) {
    const dt = Math.min(0.033, (now - (loop.last || now)) / 1000);
    loop.last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  });
})();
