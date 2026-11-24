/* ==========================================================================
   Food Web Rescue Mission — Ecosystem Explorer
   ========================================================================== */

(() => {
  "use strict";

  const A = window.FWR_APP;
  const D = A.D;
  const $ = A.$;

  let tab = "habitat";
  let selected = "grass";
  let snakeOff = false;

  function renderExplorer() {
    A.$$("#explorerTabs .tab").forEach((button) => {
      const active = button.dataset.explorerTab === tab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });

    const content = $("#explorerContent");
    if (!content) return;

    if (tab === "habitat" || tab === "web") {
      content.innerHTML = `
        <div class="explorer-grid">
          <div>
            <div class="web-preview-wrap">
              <div class="web-canvas" id="explorerCanvas" data-web="explorer"></div>
            </div>
            <div class="legend-row">
              <span><i class="dot positive"></i> Energy flow: food → consumer</span>
              <span><i class="dot neutral"></i> Click an organism to inspect it</span>
            </div>
          </div>
          <aside class="panel explorer-info" id="explorerInfo">${infoMarkup(tab === "web")}</aside>
        </div>
      `;
      renderExplorerCanvas();
    } else if (tab === "populations") {
      content.innerHTML = populationsMarkup();
    } else {
      content.innerHTML = whatIfMarkup();
      const toggle = $("#explorerSnakeToggle");
      if (toggle) {
        toggle.addEventListener("change", (event) => {
          A.unlockAudio();
          A.playClick();
          snakeOff = event.target.checked;
          renderExplorer();
        });
      }
    }
  }

  function renderExplorerCanvas() {
    const canvas = $("#explorerCanvas");
    if (!canvas) return;
    window.FWR_CANVAS.render(canvas, {
      edges: D.EDGES,
      selectedId: selected,
      onNodeClick: (id, node) => {
        selected = id;
        node.blur();
        window.FWR_CANVAS.setSelected(canvas, selected);
        const info = $("#explorerInfo");
        if (info) info.innerHTML = infoMarkup(tab === "web");
        A.playClick();
      },
    });
  }

  function infoMarkup(showLinks) {
    const organism = D.ORGANISM_BY_ID[selected] || D.ORGANISM_BY_ID.grass;
    const links = D.EDGES
      .filter((edge) => edge.source === organism.id || edge.target === organism.id)
      .map((edge) => {
        const source = D.ORGANISM_BY_ID[edge.source].name;
        const target = D.ORGANISM_BY_ID[edge.target].name;
        return `<li>${A.escapeHtml(source)} → ${A.escapeHtml(target)}</li>`;
      })
      .join("");

    return `
      <div class="organism-head">
        <div class="organism-emoji">${organism.emoji}</div>
        <div>
          <h3>${A.escapeHtml(organism.name)}</h3>
          <span class="status-pill">${A.escapeHtml(organism.tier)} · ${A.escapeHtml(organism.tierLabel)}</span>
        </div>
      </div>
      <dl class="info-list">
        <div><dt>Role</dt><dd>${A.escapeHtml(organism.role)}</dd></div>
        <div><dt>Food</dt><dd>${A.escapeHtml(organism.food)}</dd></div>
        <div><dt>Predators</dt><dd>${organism.predators.length ? A.escapeHtml(organism.predators.join(", ")) : "None in this web"}</dd></div>
      </dl>
      <div class="fact-box">${A.escapeHtml(organism.fact)}</div>
      ${showLinks && links ? `<div class="lesson-section"><h4>Energy links</h4><ul class="key-points">${links}</ul></div>` : ""}
    `;
  }

  function populationsMarkup() {
    const rows = D.ORGANISMS.map((organism) => `
      <div class="population-row">
        <div class="population-name">${organism.emoji} ${A.escapeHtml(organism.name)}</div>
        <div class="population-bar-wrap"><div class="population-bar" style="width:100%"></div></div>
        <div class="population-value">100</div>
      </div>
    `).join("");

    return `
      <div class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Before the disturbance</p>
            <h3>Illustrative population baseline</h3>
          </div>
          <span class="status-pill positive">Stable</span>
        </div>
        <div class="population-list">${rows}</div>
        <p class="muted small">Every population is indexed to 100 for comparison. These are illustrative values, not measured field data.</p>
      </div>
    `;
  }

  function whatIfMarkup() {
    const rows = snakeOff
      ? D.CASCADE.map((item) => {
        const tone = item.direction === "increase" ? "positive" : "negative";
        return `
          <div class="cascade-row ${tone}">
            <div class="cascade-name">${item.emoji} ${A.escapeHtml(item.name)}</div>
            <div>
              <div class="cascade-direction">${A.escapeHtml(item.label)}</div>
              <p class="cascade-reason">${A.escapeHtml(item.reason)}</p>
            </div>
          </div>
        `;
      }).join("")
      : `<div class="empty-state">Snake is ON. Turn it OFF to reveal the cascade.</div>`;

    const canPlay = A.state.progress.missions.web.done;
    const action = canPlay
      ? `<button class="btn btn-primary full" type="button" data-go="emergency">Take the Mission 2 challenge</button>`
      : `<button class="btn btn-primary full" type="button" disabled>Complete Mission 1 to unlock</button>`;

    return `
      <div class="whatif-grid">
        <div class="panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">What if?</p>
              <h3>Remove the snake</h3>
            </div>
            <label class="switch">
              <input type="checkbox" id="explorerSnakeToggle" ${snakeOff ? "checked" : ""}>
              <span class="switch-track" aria-hidden="true"></span>
              <span class="switch-label">${snakeOff ? "Snakes OFF" : "Snakes ON"}</span>
            </label>
          </div>
          <div class="cascade-list">${rows}</div>
        </div>
        <aside class="panel">
          <h3>How to read this</h3>
          <p class="muted">A trophic cascade is a chain of indirect effects. Removing a predator can release its prey, which then changes the next level down.</p>
          <p class="muted small">In this simplified model, the rabbit increase raises grazing pressure on grass more than the grasshopper decline reduces it.</p>
          ${action}
        </aside>
      </div>
    `;
  }

  A.registerScreen("explorer", renderExplorer);

  const tabs = $("#explorerTabs");
  if (tabs) {
    tabs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-explorer-tab]");
      if (!button) return;
      A.unlockAudio();
      A.playClick();
      tab = button.dataset.explorerTab;
      renderExplorer();
    });
  }

  window.FWR_EXPLORER = { render: renderExplorer };
})();
