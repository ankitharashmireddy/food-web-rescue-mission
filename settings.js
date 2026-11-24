/* ==========================================================================
   Food Web Rescue Mission — Global settings and skills
   ========================================================================== */

window.FWR_SETTINGS = (() => {
  "use strict";

  const A = window.FWR_APP;
  const $ = A.$;

  function open(tab = "audio") {
    fill();
    switchTab(tab);
    const overlay = $("#settingsOverlay");
    if (overlay) overlay.hidden = false;
    A.unlockAudio();
  }

  function close() {
    const overlay = $("#settingsOverlay");
    if (overlay) overlay.hidden = true;
  }

  function fill() {
    const settings = A.state.settings;
    const audio = $("#setAudio");
    const music = $("#setMusic");
    const difficulty = $("#setDifficulty");
    const language = $("#setLanguage");
    const reduced = $("#setReducedMotion");
    const large = $("#setLargeText");
    const contrast = $("#setHighContrast");

    if (audio) audio.checked = !!settings.audio;
    if (music) music.checked = !!settings.music;
    if (difficulty) difficulty.value = settings.difficulty || "standard";
    if (language) language.value = settings.language || "English";
    if (reduced) reduced.checked = !!settings.reducedMotion;
    if (large) large.checked = !!settings.largeText;
    if (contrast) contrast.checked = !!settings.highContrast;

    if (window.FWR_SKILLS) window.FWR_SKILLS.refreshAll();
  }

  function switchTab(name) {
    A.$$(".settings-nav button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.settingsTab === name);
    });
    A.$$(".settings-panel").forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.settingsPanel === name);
    });

    if (name === "skills") {
      window.setTimeout(() => {
        const input = $("#skillInput");
        if (input) input.focus();
      }, 60);
    }
  }

  function save() {
    A.state.settings.audio = !!($("#setAudio") && $("#setAudio").checked);
    A.state.settings.music = !!($("#setMusic") && $("#setMusic").checked);
    A.state.settings.difficulty = ($("#setDifficulty") && $("#setDifficulty").value) || "standard";
    A.state.settings.language = ($("#setLanguage") && $("#setLanguage").value) || "English";
    A.state.settings.reducedMotion = !!($("#setReducedMotion") && $("#setReducedMotion").checked);
    A.state.settings.largeText = !!($("#setLargeText") && $("#setLargeText").checked);
    A.state.settings.highContrast = !!($("#setHighContrast") && $("#setHighContrast").checked);

    if (!A.D.DIFFICULTY[A.state.settings.difficulty]) {
      A.state.settings.difficulty = "standard";
    }

    A.saveState();
    A.applySettings();
    close();
    A.toast("Settings saved.", "positive");
  }

  function addSkillFromInput() {
    const input = $("#skillInput");
    if (!input) return;
    if (window.FWR_SKILLS.add(input.value)) {
      input.value = "";
      input.focus();
    }
  }

  function requestReset() {
    A.askConfirm({
      title: "Reset progress?",
      text: "This clears mission scores, badges and topic progress. Settings and skills are kept.",
      label: "Reset",
      callback: A.resetProgress,
    });
  }

  const settingsButton = $("#settingsBtn");
  if (settingsButton) {
    settingsButton.addEventListener("click", () => {
      A.playClick();
      open("audio");
    });
  }

  const saveButton = $("#settingsSave");
  if (saveButton) {
    saveButton.addEventListener("click", () => {
      A.unlockAudio();
      A.playClick();
      save();
    });
  }

  const resetButton = $("#resetProgressBtn");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      A.playClick();
      requestReset();
    });
  }

  const addSkill = $("#addSkillBtn");
  if (addSkill) {
    addSkill.addEventListener("click", () => {
      A.unlockAudio();
      A.playClick();
      addSkillFromInput();
    });
  }

  const skillInput = $("#skillInput");
  if (skillInput) {
    skillInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        A.unlockAudio();
        addSkillFromInput();
      }
    });
  }

  A.$$("[data-settings-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      A.playClick();
      switchTab(button.dataset.settingsTab);
    });
  });

  return { open, close, save, switchTab };
})();
