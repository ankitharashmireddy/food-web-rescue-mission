/* ==========================================================================
   Food Web Rescue Mission — event boot
   ========================================================================== */

(() => {
  "use strict";

  const A = window.FWR_APP;
  const $ = A.$;

  function closeHowTo() {
    const overlay = $("#howToOverlay");
    if (overlay) overlay.hidden = true;
  }

  function openHowTo() {
    const overlay = $("#howToOverlay");
    if (overlay) overlay.hidden = false;
    A.unlockAudio();
  }

  document.addEventListener("pointerdown", A.unlockAudio, { once: true });

  document.addEventListener("click", (event) => {
    const go = event.target.closest("[data-go]");
    if (go) {
      event.preventDefault();
      A.unlockAudio();
      A.playClick();
      A.showScreen(go.dataset.go);
      return;
    }

    if (event.target.closest("[data-open-settings]")) {
      event.preventDefault();
      A.playClick();
      window.FWR_SETTINGS.open("audio");
      return;
    }

    if (event.target.closest("[data-close-settings]")) {
      event.preventDefault();
      A.playClick();
      window.FWR_SETTINGS.close();
      return;
    }

    if (event.target.closest("[data-close-howto]")) {
      event.preventDefault();
      A.playClick();
      closeHowTo();
      return;
    }

    if (event.target.closest("#howToBtn")) {
      event.preventDefault();
      A.playClick();
      openHowTo();
      return;
    }

    if (event.target.closest("#brandHome") || event.target.closest("#homeBtn")) {
      event.preventDefault();
      A.playClick();
      A.showScreen("welcome");
      return;
    }

    if (event.target.closest("#soundBtn")) {
      event.preventDefault();
      A.state.settings.audio = !A.state.settings.audio;
      A.saveState();
      A.applySettings();
      if (A.state.settings.audio) {
        A.unlockAudio();
        A.playClick();
      }
      A.toast(A.state.settings.audio ? "Sound on." : "Sound off.");
      return;
    }

    if (event.target.closest("#confirmYes")) {
      event.preventDefault();
      A.playClick();
      A.runConfirm();
      return;
    }

    if (event.target.closest("#confirmNo")) {
      event.preventDefault();
      A.playClick();
      A.closeConfirm();
      return;
    }

    const settingsOverlay = $("#settingsOverlay");
    if (settingsOverlay && event.target === settingsOverlay) {
      window.FWR_SETTINGS.close();
      return;
    }

    const howToOverlay = $("#howToOverlay");
    if (howToOverlay && event.target === howToOverlay) {
      closeHowTo();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const confirmOverlay = $("#confirmOverlay");
    if (confirmOverlay && !confirmOverlay.hidden) {
      A.closeConfirm();
      return;
    }
    const settingsOverlay = $("#settingsOverlay");
    if (settingsOverlay && !settingsOverlay.hidden) {
      window.FWR_SETTINGS.close();
      return;
    }
    closeHowTo();
  });

  A.init();
  A.showScreen("welcome", { force: true });
})();
