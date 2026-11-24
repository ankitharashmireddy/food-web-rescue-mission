/* ==========================================================================
   Food Web Rescue Mission — Mission 1: Build the Food Web
   ========================================================================== */

(() => {
  "use strict";

  const A = window.FWR_APP;
  const D = A.D;
  const C = window.FWR_CANVAS;
  const $ = A.$;

  let run = null;

  function init() {
    const done = !!A.state.progress.missions.web.done;
    run = {
      correct: new Set(done ? D.EDGES.map(A.pairKey) : []),
      score: done ? Number(A.state.progress.missions.web.best) || 0 : 0,
      wrong: 0,
      hints: 0,
      selected: null,
      completed: done,
    };

    $("#webCompleteBadge").hidden = !done;
    $("#webCompletion").hidden = !done;

    if (done) {
      const best = Number(A.state.progress.missions.web.best) || 0;
      $("#webCompletionText").textContent =
        `Best score: ${best}/70. Use Reset attempt to replay the mission and try for a higher score.`;
    }

    renderCanvas();
    renderSidebar();

    if (done) {
      setFeedback(
        "Mission complete",
        "All seven links are connected. Use Reset attempt to replay.",
        "positive"
      );
    } else {
      setFeedback("Ready, Guardian", "Select a food source to begin.", "");
    }
  }

  function renderCanvas() {
    const container = $("#webCanvas");
    if (!container || !run) return;
    C.render(container, {
      selectedId: run.selected,
      getEdges: () => (run && run.completed
        ? D.EDGES
        : D.EDGES.filter((edge) => run && run.correct.has(A.pairKey(edge)))),
      onNodeClick: handleNode,
    });
  }

  function handleNode(id) {
    if (!run || run.completed) return;
    const container = $("#webCanvas");

    if (run.selected === id) {
      clearSelection();
      setFeedback("Selection cleared", "Choose a food source to begin.", "");
      return;
    }

    if (!run.selected) {
      run.selected = id;
      C.setSelected(container, id);
      const organism = D.ORGANISM_BY_ID[id];
      setFeedback(`${organism.name} selected`, `Now choose the organism that eats ${organism.name}.`, "");
      A.playClick();
      return;
    }

    const source = run.selected;
    const target = id;
    const sourceOrganism = D.ORGANISM_BY_ID[source];
    const targetOrganism = D.ORGANISM_BY_ID[target];
    const pair = `${source}>${target}`;
    const reverse = `${target}>${source}`;

    if (run.correct.has(pair)) {
      clearSelection();
      A.toast("That link is already connected.");
      return;
    }

    if (D.EDGE_PAIRS.has(pair)) {
      run.correct.add(pair);
      run.score += 10;
      const health = Math.round((run.correct.size / D.EDGES.length) * 100);
      A.state.progress.health = health;
      A.state.progress.missions.web.health = health;
      A.saveState();
      clearSelection();
      if (container && typeof container._draw === "function") container._draw();
      renderSidebar();
      setFeedback(
        "Correct connection! +10",
        `${sourceOrganism.name} → ${targetOrganism.name}. Energy flows from the food source to its consumer.`,
        "positive"
      );
      A.playCorrect();
      A.toast("+10 points", "positive");
      if (run.correct.size === D.EDGES.length) complete();
      return;
    }

    run.score = Math.max(0, run.score - 3);
    run.wrong += 1;
    A.state.progress.stats.wrongConnections += 1;
    A.saveState();
    renderSidebar();
    shakeNodes([source, target]);
    clearSelection();

    if (D.EDGE_PAIRS.has(reverse)) {
      setFeedback(
        "Wrong direction! −3",
        `Energy flows from the food source to the organism that eats it. Correct: ${targetOrganism.name} → ${sourceOrganism.name}.`,
        "negative"
      );
      A.toast("−3 points — check the arrow direction.", "negative");
    } else {
      setFeedback(
        "Not a direct link −3",
        `${sourceOrganism.name} and ${targetOrganism.name} are not directly connected in this grassland web. Check what each organism eats.`,
        "negative"
      );
      A.toast("−3 points — that pair is not a direct feeding link.", "negative");
    }
    A.playWrong();
  }

  function complete() {
    const firstCompletion = !A.state.progress.missions.web.done;
    run.completed = true;
    A.state.progress.missions.web.done = true;
    A.state.progress.missions.web.best = Math.max(
      Number(A.state.progress.missions.web.best) || 0,
      run.score
    );
    A.state.progress.missions.web.health = 100;
    A.state.progress.health = 100;
    A.saveState();

    $("#webCompletion").hidden = false;
    $("#webCompleteBadge").hidden = false;
    $("#webCompletionText").textContent =
      `You connected all seven links and scored ${run.score} points. Best score: ${A.state.progress.missions.web.best}/70.` +
      (firstCompletion ? " Mission 2 is now unlocked." : "");

    renderSidebar();
    setFeedback(
      "Web restored!",
      "All seven energy links are connected. The grassland is stable enough to continue.",
      "positive"
    );
    A.playComplete();
    A.toast(firstCompletion ? "Mission 1 complete — Mission 2 unlocked!" : "Replay complete!", "positive");
    A.updateGlobalStats();
  }

  function renderSidebar() {
    if (!run) return;
    const correctCount = run.correct.size;
    const health = run.completed ? 100 : Math.round((correctCount / D.EDGES.length) * 100);
    const config = D.DIFFICULTY[A.state.settings.difficulty] || D.DIFFICULTY.standard;
    const remainingHints = config.hints === Infinity
      ? Infinity
      : Math.max(0, config.hints - run.hints);

    $("#webHealthValue").textContent = `${health}%`;
    $("#webHealthRing").style.setProperty("--value", health);
    $("#webScore").textContent = String(run.score);
    $("#webConnections").textContent = `${correctCount} / ${D.EDGES.length}`;
    $("#webProgressBar").style.width = `${health}%`;
    $("#hintCount").textContent = config.hints === Infinity
      ? "(∞)"
      : `(${remainingHints} left)`;
    $("#hintBtn").disabled = run.completed || remainingHints === 0;
    $("#webCompleteBadge").hidden = !A.state.progress.missions.web.done;
  }

  function hint() {
    if (!run || run.completed) return;
    const config = D.DIFFICULTY[A.state.settings.difficulty] || D.DIFFICULTY.standard;
    if (config.hints !== Infinity && run.hints >= config.hints) {
      A.toast("No hints left on this difficulty.", "negative");
      return;
    }

    const missing = D.EDGES.find((edge) => !run.correct.has(A.pairKey(edge)));
    if (!missing) {
      A.toast("Every link is already connected.");
      return;
    }

    run.hints += 1;
    A.state.progress.stats.hintsUsed += 1;
    A.saveState();
    const source = D.ORGANISM_BY_ID[missing.source];
    const target = D.ORGANISM_BY_ID[missing.target];
    setFeedback("Hint", `Try connecting ${source.name} → ${target.name}.`, "");
    pulseNodes([missing.source, missing.target]);
    renderSidebar();
    A.playClick();
  }

  function reset() {
    if (!run) return;
    const wasDone = !!A.state.progress.missions.web.done;
    run = {
      correct: new Set(),
      score: 0,
      wrong: 0,
      hints: 0,
      selected: null,
      completed: false,
    };
    $("#webCompletion").hidden = true;
    if (!wasDone) {
      A.state.progress.health = 0;
      A.state.progress.missions.web.health = 0;
    }
    A.saveState();
    renderCanvas();
    renderSidebar();
    setFeedback("New attempt", "Select a food source to begin.", "");
    A.updateGlobalStats();
    A.toast(wasDone ? "Replaying Mission 1." : "Attempt reset.");
  }

  function setFeedback(title, text, tone) {
    const element = $("#webFeedback");
    if (!element) return;
    element.className = `panel feedback-panel${tone ? ` is-${tone}` : ""}`;
    element.innerHTML = `<strong>${A.escapeHtml(title)}</strong><p>${A.escapeHtml(text)}</p>`;
  }

  function clearSelection() {
    if (!run) return;
    run.selected = null;
    const container = $("#webCanvas");
    if (container) C.setSelected(container, null);
  }

  function shakeNodes(ids) {
    const container = $("#webCanvas");
    if (!container) return;
    ids.forEach((id) => {
      const node = container.querySelector(`[data-org="${id}"]`);
      if (!node) return;
      node.classList.add("is-wrong");
      window.setTimeout(() => node.classList.remove("is-wrong"), 420);
    });
  }

  function pulseNodes(ids) {
    const container = $("#webCanvas");
    if (!container) return;
    ids.forEach((id) => {
      const node = container.querySelector(`[data-org="${id}"]`);
      if (!node) return;
      node.classList.add("is-hint");
      window.setTimeout(() => node.classList.remove("is-hint"), 1700);
    });
  }

  A.registerScreen("web", init);

  const hintButton = $("#hintBtn");
  if (hintButton) {
    hintButton.addEventListener("click", () => {
      A.unlockAudio();
      hint();
    });
  }

  const resetButton = $("#resetWebBtn");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      A.unlockAudio();
      A.playClick();
      reset();
    });
  }

  window.FWR_WEB = { init, hint, reset };
})();
