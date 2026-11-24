/* ==========================================================================
   Food Web Rescue Mission — Final Results and report
   ========================================================================== */

(() => {
  "use strict";

  const A = window.FWR_APP;
  const D = A.D;
  const $ = A.$;

  function renderResults() {
    const missions = A.state.progress.missions;
    const allDone = missions.web.done && missions.emergency.done && missions.energy.done;
    const health = Math.round(A.state.progress.health || 0);

    $("#resultsTitle").textContent = allDone ? "Ecosystem Guardian!" : "Guardian in Training";
    $("#resultsSubtitle").textContent = allDone
      ? "You rebuilt the food web, traced the cascade and mastered the 10% law."
      : "Complete all three missions to earn the full Ecosystem Guardian title.";

    $("#resultsStats").innerHTML = `
      <div class="result-stat">
        <span>Total score</span>
        <strong class="positive">${A.totalScore()}/${A.MAX_SCORE}</strong>
      </div>
      <div class="result-stat">
        <span>Ecosystem health</span>
        <strong class="${health >= 70 ? "positive" : "negative"}">${health}%</strong>
      </div>
      <div class="result-stat">
        <span>Missions</span>
        <strong>${A.missionsDone()}/3</strong>
      </div>
      <div class="result-stat">
        <span>Topics</span>
        <strong>${A.completedTopics()}/${D.TOPICS.length}</strong>
      </div>
    `;

    renderBadges();
    renderSummary();
    renderReport();

    const reportPanel = $("#reportPanel");
    const reportButton = $("#viewReportBtn");
    if (reportPanel) reportPanel.hidden = true;
    if (reportButton) reportButton.textContent = "View Report";
  }

  function renderBadges() {
    const earned = A.badgeState();
    const grid = $("#resultsBadges");
    if (!grid) return;
    grid.innerHTML = D.BADGES.map((badge) => `
      <div class="badge-card ${earned[badge.id] ? "is-earned" : ""}">
        <span class="badge-emoji">${badge.emoji}</span>
        <strong>${A.escapeHtml(badge.name)}</strong>
        <small>${A.escapeHtml(badge.description)}</small>
      </div>
    `).join("");

    const summary = $("#badgeSummary");
    if (summary) summary.textContent = `${A.badgeCount()} / ${D.BADGES.length}`;
  }

  function renderSummary() {
    const missions = A.state.progress.missions;
    const skills = A.state.skills.length
      ? A.state.skills.map((skill) => `<span class="chip">${A.escapeHtml(skill)}</span>`).join("")
      : `<span class="chip-empty">No skills added yet.</span>`;

    $("#resultsSummary").innerHTML = `
      <div class="summary-list">
        <div class="summary-row"><span>Food-web connections</span><strong>${missions.web.done ? "7 / 7 complete" : "Not complete"}</strong></div>
        <div class="summary-row"><span>Emergency prediction</span><strong>${missions.emergency.done ? "Correct · +30" : "Not complete"}</strong></div>
        <div class="summary-row"><span>Energy quiz</span><strong>${Number(missions.energy.best) || 0} / 30</strong></div>
        <div class="summary-row"><span>Learning topics</span><strong>${A.completedTopics()} / ${D.TOPICS.length}</strong></div>
        <div class="summary-row"><span>Ecosystem health</span><strong>${Math.round(A.state.progress.health || 0)}%</strong></div>
      </div>
      <div class="lesson-section">
        <h4>Skills practised</h4>
        <div class="chip-row">${skills}</div>
      </div>
    `;
  }

  function renderReport() {
    const container = $("#reportContent");
    if (!container) return;
    const missions = A.state.progress.missions;
    const stats = A.state.progress.stats;
    const completed = D.TOPICS
      .filter((topic) => (A.state.progress.topics[topic.slug] || {}).completed)
      .map((topic) => `<li>${A.escapeHtml(topic.title)}</li>`)
      .join("");

    const nextSteps = [];
    if (!missions.web.done) nextSteps.push("Complete Mission 1: connect all seven energy links.");
    if (!missions.emergency.done) nextSteps.push("Complete Mission 2: predict the snake-removal cascade.");
    if (!missions.energy.done) nextSteps.push("Complete Mission 3: finish the energy quiz.");
    if (!nextSteps.length) nextSteps.push("All missions complete. Replay any mission to improve your best score.");
    if (A.completedTopics() < D.TOPICS.length) nextSteps.push(`Review the remaining Learning Zone topics (${A.completedTopics()}/${D.TOPICS.length} complete).`);

    container.innerHTML = `
      <div class="report-grid">
        <div class="report-block">
          <h4>Mission scores</h4>
          <ul>
            <li>Food web: ${Number(missions.web.best) || 0}/70 ${missions.web.done ? "· complete" : "· not complete"}</li>
            <li>Emergency: ${Number(missions.emergency.best) || 0}/30 ${missions.emergency.done ? "· complete" : "· not complete"}</li>
            <li>Energy: ${Number(missions.energy.best) || 0}/30 ${missions.energy.done ? "· complete" : "· not complete"}</li>
          </ul>
        </div>
        <div class="report-block">
          <h4>Practice record</h4>
          <ul>
            <li>Reversed or invalid links: ${stats.wrongConnections}</li>
            <li>Hints used: ${stats.hintsUsed}</li>
            <li>Emergency attempts: ${stats.emergencyAttempts}</li>
            <li>Energy answers correct: ${stats.energyCorrect}</li>
          </ul>
        </div>
        <div class="report-block">
          <h4>Topics completed</h4>
          ${completed ? `<ul>${completed}</ul>` : `<p class="muted small">No topics completed yet.</p>`}
        </div>
        <div class="report-block">
          <h4>Next steps</h4>
          <ul>${nextSteps.map((step) => `<li>${A.escapeHtml(step)}</li>`).join("")}</ul>
        </div>
      </div>
    `;
  }

  A.registerScreen("results", renderResults);

  const viewButton = $("#viewReportBtn");
  if (viewButton) {
    viewButton.addEventListener("click", () => {
      A.unlockAudio();
      A.playClick();
      const panel = $("#reportPanel");
      if (!panel) return;
      panel.hidden = !panel.hidden;
      viewButton.textContent = panel.hidden ? "View Report" : "Hide Report";
      if (!panel.hidden) panel.scrollIntoView({ behavior: A.state.settings.reducedMotion ? "auto" : "smooth", block: "start" });
    });
  }

  const closeReport = $("#closeReportBtn");
  if (closeReport) {
    closeReport.addEventListener("click", () => {
      A.playClick();
      const panel = $("#reportPanel");
      if (panel) panel.hidden = true;
      if (viewButton) viewButton.textContent = "View Report";
    });
  }

  const playAgain = $("#playAgainBtn");
  if (playAgain) {
    playAgain.addEventListener("click", () => {
      A.unlockAudio();
      A.playClick();
      A.askConfirm({
        title: "Play again?",
        text: "This clears mission scores, badges and topic progress. Settings and skills are kept.",
        label: "Restart",
        callback: A.resetProgress,
      });
    });
  }
})();
