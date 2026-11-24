/* ==========================================================================
   Food Web Rescue Mission — custom skills input
   Users can add any number of skills; stored in Local Storage.
   ========================================================================== */

window.FWR_SKILLS = (() => {
  "use strict";

  const A = window.FWR_APP;

  function render(container, options = {}) {
    if (!container) return;
    const removable = options.removable !== false;
    if (!A.state.skills.length) {
      container.innerHTML = `<span class="chip-empty">No skills yet. Add any skill you want to practise.</span>`;
      return;
    }
    container.innerHTML = A.state.skills.map((skill, index) => `
      <span class="chip">
        ${A.escapeHtml(skill)}
        ${removable ? `<button type="button" data-skill-index="${index}" aria-label="Remove ${A.escapeHtml(skill)}">×</button>` : ""}
      </span>
    `).join("");
  }

  function refreshAll() {
    render(document.getElementById("dashboardSkills"), { removable: true });
    render(document.getElementById("settingsSkills"), { removable: true });
    const count = document.getElementById("skillCount");
    if (count) {
      count.textContent = `${A.state.skills.length} skill${A.state.skills.length === 1 ? "" : "s"} added`;
    }
  }

  function add(rawName) {
    const name = String(rawName || "").trim().replace(/\s+/g, " ").slice(0, 60);
    if (!name) {
      A.toast("Type a skill name first.", "negative");
      return false;
    }
    if (A.state.skills.some((skill) => skill.toLowerCase() === name.toLowerCase())) {
      A.toast("That skill is already in your list.", "negative");
      return false;
    }
    A.state.skills.push(name);
    A.saveState();
    refreshAll();
    A.toast(`Skill added: ${name}`, "positive");
    return true;
  }

  function remove(index) {
    if (!Number.isInteger(index) || index < 0 || index >= A.state.skills.length) return;
    const removed = A.state.skills.splice(index, 1)[0];
    A.saveState();
    refreshAll();
    A.toast(`Removed skill: ${removed}`);
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-skill-index]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    remove(Number(button.dataset.skillIndex));
  });

  return { render, refreshAll, add, remove };
})();
