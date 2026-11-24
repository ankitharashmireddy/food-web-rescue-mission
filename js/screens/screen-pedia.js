/* ==========================================================================
   Food Web Rescue Mission — Eco-Pedia
   ========================================================================== */

(() => {
  "use strict";

  const A = window.FWR_APP;
  const D = A.D;
  const $ = A.$;

  let query = "";

  function renderPedia() {
    const grid = $("#pediaGrid");
    const count = $("#pediaCount");
    if (!grid) return;

    const search = query.trim().toLowerCase();
    const terms = D.ECO_PEDIA.filter((item) => {
      if (!search) return true;
      return `${item.term} ${item.definition} ${item.example}`.toLowerCase().includes(search);
    });

    if (count) {
      count.textContent = `${terms.length} term${terms.length === 1 ? "" : "s"}`;
    }

    if (!terms.length) {
      grid.innerHTML = `<div class="empty-state">No term matches “${A.escapeHtml(query)}”. Try “food”, “trophic” or “energy”.</div>`;
      return;
    }

    grid.innerHTML = terms.map((item) => `
      <article class="pedia-card">
        <h3>${A.escapeHtml(item.term)}</h3>
        <p>${A.escapeHtml(item.definition)}</p>
        <div class="pedia-example"><strong>Example:</strong> ${A.escapeHtml(item.example)}</div>
      </article>
    `).join("");
  }

  A.registerScreen("pedia", renderPedia);

  const search = $("#pediaSearch");
  if (search) {
    search.addEventListener("input", (event) => {
      query = event.target.value;
      renderPedia();
    });
  }
})();
