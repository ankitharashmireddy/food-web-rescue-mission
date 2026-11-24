/* ==========================================================================
   Food Web Rescue Mission — Welcome and Dashboard screens
   ========================================================================== */

(() => {
  "use strict";

  const A = window.FWR_APP;
  const D = A.D;
  const $ = A.$;

  const MISSIONS = [
    {
      key: "web",
      icon: "🕸️",
      title: "Build the Food Web",
      description: "Connect all seven energy links in the grassland.",
      max: 70,
    },
    {
      key: "emergency",
      icon: "⚠️",
      title: "Ecosystem Emergency",
      description: "Predict what happens when the snake disappears.",
      max: 30,
    },
    {
      key: "energy",
      icon: "⚡",
      title: "Energy Master",
      description: "Apply the 10% law and answer three quick questions.",
      max: 30,
    },
  ];

  function renderWelcome() {
    A.renderWelcomeContinue();
  }

  function renderDashboard() {
    renderMissionList();
    renderProgress();
    renderSkills();
    renderSnapshot();

    const summary = $("#missionSummary");
    if (summary) summary.textContent = `${A.missionsDone()} of 3 complete`;

    const topicPill = $("#topicProgressPill");
    if (topicPill) topicPill.textContent = `${A.completedTopics()} / ${D.TOPICS.length} topics`;
  }

  function renderMissionList() {
    const list = $("#missionList");
    if (!list) return;
    const missions = A.state.progress.missions;

    list.innerHTML = MISSIONS.map((meta, index) => {
      const record = missions[meta.key];
      const locked = meta.key === "emergency"
        ? !missions.web.done
        : meta.key === "energy"
          ? !missions.emergency.done
          : false;
      const status = record.done
        ? `<span class="status-pill positive">Complete · ${Number(record.best) || 0}/${meta.max}</span>`
        : locked
          ? `<span class="status-pill">Locked</span>`
          : `<span class="status-pill">Ready</span>`;
      const button = locked
        ? `<button class="btn btn-small btn-ghost" type="button" disabled>Locked</button>`
        : `<button class="btn btn-small ${record.done ? "btn-secondary" : "btn-primary"}" type="button" data-go="${meta.key}">${record.done ? "Replay" : "Start"}</button>`;

      return `
        <div class="mission-item ${record.done ? "is-done" : ""} ${locked ? "is-locked" : ""}">
          <div class="mission-icon">${locked ? "🔒" : meta.icon}</div>
          <div class="mission-copy">
            <strong>${index + 1}. ${meta.title}</strong>
            <small>${meta.description} ${locked ? "Complete the previous mission to unlock." : ""}</small>
          </div>
          ${status}
          ${button}
        </div>
      `;
    }).join("");
  }

  function renderProgress() {
    const container = $("#dashboardProgress");
    if (!container) return;
    const missions = A.state.progress.missions;
    const topics = A.completedTopics();
    const totalTopics = D.TOPICS.length;

    container.innerHTML = [
      progressLine("Learning topics", topics, totalTopics),
      progressLine("Food web restored", missions.web.done ? 1 : 0, 1),
      progressLine("Emergency prediction", missions.emergency.done ? 1 : 0, 1),
      progressLine("Energy challenge", missions.energy.done ? 1 : 0, 1),
    ].join("");
  }

  function progressLine(label, value, max) {
    const percent = max ? Math.round((value / max) * 100) : 0;
    return `
      <div class="progress-line">
        <div class="progress-label">
          <span>${A.escapeHtml(label)}</span>
          <strong>${value} / ${max}</strong>
        </div>
        <div class="progress-track"><div style="width:${percent}%"></div></div>
      </div>
    `;
  }

  function renderSkills() {
    const container = $("#dashboardSkills");
    if (container && window.FWR_SKILLS) {
      window.FWR_SKILLS.render(container, { removable: true });
    }
  }

  function renderSnapshot() {
    const container = $("#dashboardSnapshot");
    if (!container) return;
    const health = Math.round(A.state.progress.health || 0);
    container.innerHTML = `
      <div class="snapshot-card"><span>Total score</span><strong>${A.totalScore()}/${A.MAX_SCORE}</strong></div>
      <div class="snapshot-card"><span>Ecosystem health</span><strong>${health}%</strong></div>
      <div class="snapshot-card"><span>Badges</span><strong>${A.badgeCount()}/4</strong></div>
      <div class="snapshot-card"><span>Skills</span><strong>${A.state.skills.length}</strong></div>
    `;
  }

  A.registerScreen("welcome", renderWelcome);
  A.registerScreen("dashboard", renderDashboard);

  const resultsButton = $("#dashboardResultsBtn");
  if (resultsButton) {
    resultsButton.addEventListener("click", () => {
      A.unlockAudio();
      A.playClick();
      A.showScreen("results");
    });
  }

  const addSkillShortcut = $("#addSkillShortcut");
  if (addSkillShortcut) {
    addSkillShortcut.addEventListener("click", () => {
      A.unlockAudio();
      A.playClick();
      if (window.FWR_SETTINGS) window.FWR_SETTINGS.open("skills");
    });
  }
})();
