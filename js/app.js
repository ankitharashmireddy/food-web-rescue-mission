/* ==========================================================================
   Food Web Rescue Mission — core
   Shared state, navigation, audio, scoring helpers and small utilities.
   ========================================================================== */

window.FWR_APP = (() => {
  "use strict";

  const D = window.FWR;
  const STORAGE_KEY = "fwr_state_v1";
  const MAX_SCORE = Object.values(D.MISSION_META).reduce((sum, item) => sum + item.maxScore, 0);
  const SVG_NS = "http://www.w3.org/2000/svg";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[character]));

  const pairKey = (edge) => `${edge.source}>${edge.target}`;

  const SCREEN_IDS = {
    welcome: "screen-welcome",
    dashboard: "screen-dashboard",
    pedia: "screen-pedia",
    lesson: "screen-lesson",
    explorer: "screen-explorer",
    web: "screen-web",
    emergency: "screen-emergency",
    energy: "screen-energy",
    results: "screen-results",
  };

  const screenHooks = {};

  /* ------------------------------------------------------------------ */
  /* State                                                              */
  /* ------------------------------------------------------------------ */

  function freshProgress() {
    return {
      health: 0,
      topics: {},
      missions: {
        web: { done: false, best: 0, health: 0 },
        emergency: { done: false, best: 0, health: 0 },
        energy: { done: false, best: 0, health: 0 },
      },
      stats: {
        wrongConnections: 0,
        hintsUsed: 0,
        emergencyAttempts: 0,
        energyCorrect: 0,
        energyAttempts: 0,
      },
    };
  }

  function freshState() {
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return {
      version: 1,
      settings: { ...D.DEFAULT_SETTINGS, reducedMotion: !!prefersReducedMotion },
      skills: [],
      progress: freshProgress(),
    };
  }

  function loadState() {
    const base = freshState();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return base;

      const merged = {
        ...base,
        ...parsed,
        settings: { ...base.settings, ...(parsed.settings || {}) },
        progress: {
          ...base.progress,
          ...(parsed.progress || {}),
          topics: (parsed.progress && parsed.progress.topics) || {},
          missions: { ...base.progress.missions, ...((parsed.progress && parsed.progress.missions) || {}) },
          stats: { ...base.progress.stats, ...((parsed.progress && parsed.progress.stats) || {}) },
        },
      };

      Object.keys(base.progress.missions).forEach((key) => {
        merged.progress.missions[key] = {
          ...base.progress.missions[key],
          ...((parsed.progress && parsed.progress.missions && parsed.progress.missions[key]) || {}),
        };
      });

      merged.skills = Array.isArray(parsed.skills)
        ? parsed.skills.filter((skill) => typeof skill === "string" && skill.trim()).slice(0, 5000)
        : [];
      merged.progress.health = clamp(Number(merged.progress.health) || 0, 0, 100);

      if (!D.DIFFICULTY[merged.settings.difficulty]) merged.settings.difficulty = "standard";
      merged.settings.language = merged.settings.language || "English";
      return merged;
    } catch (error) {
      return base;
    }
  }

  const state = loadState();

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      /* Local Storage can be unavailable in locked-down browsers. */
    }
  }

  function totalScore() {
    return Object.keys(state.progress.missions).reduce(
      (sum, key) => sum + (Number(state.progress.missions[key].best) || 0),
      0
    );
  }

  function missionsDone() {
    return Object.values(state.progress.missions).filter((mission) => mission.done).length;
  }

  function completedTopics() {
    return Object.values(state.progress.topics).filter((topic) => topic && topic.completed).length;
  }

  function badgeState() {
    const missions = state.progress.missions;
    return {
      "food-web-builder": !!missions.web.done,
      "ecosystem-protector": !!missions.emergency.done,
      "energy-expert": !!missions.energy.done && (Number(missions.energy.best) || 0) >= 20,
      "ecosystem-guardian": !!(missions.web.done && missions.emergency.done && missions.energy.done),
      "perfect-score": totalScore() === MAX_SCORE,
      "nature-saver": !!(missions.web.done && missions.emergency.done && missions.energy.done && Number(state.progress.health || 0) >= 100),
    };
  }

  function badgeCount() {
    return Object.values(badgeState()).filter(Boolean).length;
  }

  function registerScreen(name, hook) {
    if (Object.prototype.hasOwnProperty.call(SCREEN_IDS, name) && typeof hook === "function") {
      screenHooks[name] = hook;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Global UI                                                          */
  /* ------------------------------------------------------------------ */

  function updateGlobalStats() {
    const score = $("#statScore");
    const missions = $("#statMissions");
    const health = $("#statHealth");
    if (score) score.textContent = String(totalScore());
    if (missions) missions.textContent = `${missionsDone()}/3`;
    if (health) health.textContent = `${Math.round(state.progress.health || 0)}%`;
    renderWelcomeContinue();
  }

  function renderWelcomeContinue() {
    const box = $("#welcomeContinue");
    const text = $("#welcomeContinueText");
    if (!box || !text) return;
    const hasProgress = totalScore() > 0 || missionsDone() > 0 || completedTopics() > 0;
    box.hidden = !hasProgress;
    if (hasProgress) {
      text.textContent = `Score ${totalScore()}/${MAX_SCORE} · ${missionsDone()}/3 missions · ${completedTopics()}/12 topics`;
    }
  }

  function announce(message) {
    const announcer = $("#announcer");
    if (announcer) announcer.textContent = message;
  }

  let toastTimer = null;
  function toast(message, tone = "") {
    const element = $("#toast");
    if (!element) return;
    element.textContent = message;
    element.className = `toast is-visible${tone ? ` is-${tone}` : ""}`;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      element.classList.remove("is-visible");
    }, 3000);
  }

  function showScreen(name, options = {}) {
    let target = Object.prototype.hasOwnProperty.call(SCREEN_IDS, name) ? name : "welcome";

    if (!options.force) {
      if (target === "emergency" && !state.progress.missions.web.done) {
        toast("Mission 2 unlocks after you complete Mission 1.", "negative");
        target = "dashboard";
      }
      if (target === "energy" && !state.progress.missions.emergency.done) {
        toast("Mission 3 unlocks after you complete Mission 2.", "negative");
        target = "dashboard";
      }
    }

    const screen = document.getElementById(SCREEN_IDS[target]);
    if (!screen) return;

    $$(".screen").forEach((item) => item.classList.remove("is-active"));
    screen.classList.add("is-active");
    document.body.dataset.screen = target;

    const hook = screenHooks[target];
    if (hook) hook();

    window.scrollTo({ top: 0, behavior: state.settings.reducedMotion ? "auto" : "smooth" });
    announce(`${target} screen opened`);
  }

  /* ------------------------------------------------------------------ */
  /* Audio (Web Audio API, generated locally)                           */
  /* ------------------------------------------------------------------ */

  let audioCtx = null;
  let musicNodes = [];

  function unlockAudio() {
    try {
      if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioCtx = new Ctx();
      }
      if (audioCtx.state === "suspended") audioCtx.resume();
      if (state.settings.music && state.settings.audio) startMusic();
    } catch (error) {
      audioCtx = null;
    }
  }

  function canSound() {
    return !!audioCtx && !!state.settings.audio;
  }

  function tone(frequency, offset, duration, type = "sine", volume = 0.04) {
    if (!canSound()) return;
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const start = audioCtx.currentTime + offset;
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(audioCtx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  function playClick() {
    tone(700, 0, 0.055, "square", 0.018);
  }

  function playCorrect() {
    tone(523.25, 0, 0.1, "sine", 0.045);
    tone(659.25, 0.08, 0.11, "sine", 0.045);
    tone(783.99, 0.17, 0.16, "sine", 0.04);
  }

  function playWrong() {
    tone(220, 0, 0.1, "sawtooth", 0.026);
    tone(164.81, 0.1, 0.16, "sawtooth", 0.024);
  }

  function playComplete() {
    tone(523.25, 0, 0.12, "sine", 0.05);
    tone(659.25, 0.1, 0.12, "sine", 0.05);
    tone(783.99, 0.2, 0.14, "sine", 0.05);
    tone(1046.5, 0.32, 0.24, "sine", 0.045);
  }

  function startMusic() {
    if (!audioCtx || musicNodes.length || !state.settings.music || !state.settings.audio) return;
    [110, 164.81, 220].forEach((frequency) => {
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0075, audioCtx.currentTime + 1.4);
      oscillator.connect(gain).connect(audioCtx.destination);
      oscillator.start();
      musicNodes.push({ oscillator, gain });
    });
  }

  function stopMusic() {
    if (!audioCtx) return;
    const nodes = musicNodes;
    musicNodes = [];
    nodes.forEach(({ oscillator, gain }) => {
      try {
        gain.gain.cancelScheduledValues(audioCtx.currentTime);
        gain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.18);
        window.setTimeout(() => {
          try {
            oscillator.stop();
          } catch (error) {
            /* already stopped */
          }
        }, 500);
      } catch (error) {
        /* already stopped */
      }
    });
  }

  function applySettings() {
    document.body.classList.toggle("reduced-motion", !!state.settings.reducedMotion);
    document.documentElement.classList.toggle("large-text", !!state.settings.largeText);
    document.body.classList.toggle("high-contrast", !!state.settings.highContrast);

    const soundButton = $("#soundBtn");
    if (soundButton) {
      soundButton.textContent = state.settings.audio ? "🔊" : "🔇";
      soundButton.setAttribute("aria-label", state.settings.audio ? "Mute sound effects" : "Unmute sound effects");
    }

    if (!state.settings.audio || !state.settings.music) {
      stopMusic();
    } else {
      startMusic();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Confirm dialog and reset                                           */
  /* ------------------------------------------------------------------ */

  let confirmCallback = null;

  function askConfirm({ title, text, label, callback }) {
    const overlay = $("#confirmOverlay");
    if (!overlay) return;
    $("#confirmTitle").textContent = title || "Are you sure?";
    $("#confirmText").textContent = text || "";
    $("#confirmYes").textContent = label || "Reset";
    confirmCallback = typeof callback === "function" ? callback : null;
    overlay.hidden = false;
  }

  function closeConfirm() {
    const overlay = $("#confirmOverlay");
    if (overlay) overlay.hidden = true;
    confirmCallback = null;
  }

  function runConfirm() {
    const callback = confirmCallback;
    closeConfirm();
    if (callback) callback();
  }

  function resetProgress() {
    state.progress = freshProgress();
    saveState();
    const settingsOverlay = $("#settingsOverlay");
    if (settingsOverlay) settingsOverlay.hidden = true;
    closeConfirm();
    updateGlobalStats();
    showScreen("welcome", { force: true });
    toast("Progress reset. Ready for a fresh start.", "positive");
  }

  function init() {
    applySettings();
    updateGlobalStats();
    renderWelcomeContinue();
  }

  return {
    D,
    MAX_SCORE,
    SVG_NS,
    $,
    $$,
    escapeHtml,
    pairKey,
    state,
    clamp,
    saveState,
    totalScore,
    missionsDone,
    completedTopics,
    badgeState,
    badgeCount,
    registerScreen,
    showScreen,
    updateGlobalStats,
    renderWelcomeContinue,
    announce,
    toast,
    unlockAudio,
    playClick,
    playCorrect,
    playWrong,
    playComplete,
    startMusic,
    stopMusic,
    applySettings,
    askConfirm,
    closeConfirm,
    runConfirm,
    resetProgress,
    init,
  };
})();
