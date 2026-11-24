/* ==========================================================================
   Food Web Rescue Mission — Mission 2: Ecosystem Emergency
   ========================================================================== */

(() => {
  "use strict";

  const A = window.FWR_APP;
  const D = A.D;
  const $ = A.$;

  let run = null;

  function init() {
    const done = !!A.state.progress.missions.emergency.done;
    run = {
      snakeOff: done,
      submitted: done,
      revealed: done,
      correct: done,
    };

    const toggle = $("#snakeToggle");
    toggle.checked = done;
    $("#snakeToggleLabel").textContent = done ? "Snakes OFF" : "Snakes ON";
    $("#emergencyCompleteBadge").hidden = !done;
    $("#emergencyCompletion").hidden = !done;
    $("#emergencySubmit").disabled = done;
    $("#emergencyAttemptLabel").textContent = done ? "Complete" : "Select all that apply";

    renderForm();
    renderChart(done);

    if (done) {
      const inputs = A.$$("#emergencyForm input");
      inputs.forEach((input) => {
        input.checked = D.EMERGENCY_CORRECT.has(input.value);
      });
      markOptions(new Set(D.EMERGENCY_CORRECT), true, true);
      setHealth(100);
      $("#emergencyCompletionText").textContent =
        `You predicted the cascade correctly. Best score: ${A.state.progress.missions.emergency.best}/30. Use Reset simulation to replay.`;
      setFeedback(
        "Mission complete",
        "Frogs and rabbits increase, grass decreases, and eagles decline slightly. Grasshoppers also fall as frog numbers rise.",
        "positive"
      );
    } else {
      setHealth(0);
      setFeedback("Snake is ON", "Turn the snake OFF to trigger the disturbance, then make your prediction.", "");
    }
  }

  function renderForm() {
    const form = $("#emergencyForm");
    if (!form) return;
    form.innerHTML = D.EMERGENCY_OPTIONS.map((option) => `
      <label class="check-item" data-option="${option.id}">
        <input type="checkbox" value="${option.id}">
        <span>${A.escapeHtml(option.text)}</span>
      </label>
    `).join("");
  }

  function renderChart(reveal) {
    const chart = $("#populationChart");
    if (!chart) return;

    const rows = D.CASCADE.map((item) => {
      const tone = item.direction === "increase" ? "positive" : "negative";
      const beforeHeight = A.clamp((item.before / 160) * 100, 2, 100);
      const afterHeight = A.clamp((item.after / 160) * 100, item.after === 0 ? 1 : 2, 100);
      return `
        <div class="pop-row">
          <div class="pop-name">${item.emoji} ${A.escapeHtml(item.name)}</div>
          <div class="pop-bars">
            <div class="pop-bar before" style="height:${beforeHeight}%" title="Before: ${item.before}"></div>
            ${reveal
              ? `<div class="pop-bar after ${tone}" style="height:${afterHeight}%" title="After: ${item.after}"></div>`
              : ""}
          </div>
          <div class="pop-after-label ${reveal ? tone : "neutral"}">${reveal ? item.after : "—"}</div>
        </div>
      `;
    }).join("");

    chart.innerHTML = `
      <div class="legend-row">
        <span><i class="dot neutral"></i> Before</span>
        <span><i class="dot positive"></i> After: increase</span>
        <span><i class="dot negative"></i> After: decrease</span>
      </div>
      ${rows}
    `;
  }

  function setSnakeOff(off) {
    if (!run) return;
    run.snakeOff = !!off;
    run.submitted = false;
    run.revealed = false;
    run.correct = false;

    const toggle = $("#snakeToggle");
    toggle.checked = !!off;
    $("#snakeToggleLabel").textContent = off ? "Snakes OFF" : "Snakes ON";
    $("#emergencyCompletion").hidden = true;
    $("#emergencySubmit").disabled = false;
    $("#emergencyAttemptLabel").textContent = "Select all that apply";

    const inputs = A.$$("#emergencyForm input");
    inputs.forEach((input) => {
      input.checked = false;
      input.disabled = false;
    });
    A.$$("#emergencyForm .check-item").forEach((label) => {
      label.classList.remove("is-correct", "is-wrong");
    });

    renderChart(false);

    if (off) {
      setHealth(65);
      setFeedback(
        "Snake removed",
        "Predict which populations will change, then submit to run the simulation.",
        ""
      );
    } else {
      setHealth(A.state.progress.missions.emergency.done ? 100 : 0);
      setFeedback("Snake is back", "Turn the snake OFF to run the disturbance.", "");
    }

    A.saveState();
    A.updateGlobalStats();
  }

  function submit() {
    if (!run) return;
    if (!run.snakeOff) {
      A.toast("Turn the snake OFF first.", "negative");
      return;
    }

    const selected = new Set(
      A.$$("#emergencyForm input:checked").map((input) => input.value)
    );
    if (selected.size === 0) {
      A.toast("Select at least one outcome.", "negative");
      return;
    }

    run.submitted = true;
    run.revealed = true;
    A.state.progress.stats.emergencyAttempts += 1;

    const isCorrect =
      selected.size === D.EMERGENCY_CORRECT.size &&
      Array.from(selected).every((id) => D.EMERGENCY_CORRECT.has(id));

    run.correct = isCorrect;
    renderChart(true);
    markOptions(selected, true, isCorrect);

    if (isCorrect) {
      A.state.progress.missions.emergency.done = true;
      A.state.progress.missions.emergency.best = 30;
      A.state.progress.missions.emergency.health = 100;
      A.state.progress.health = 100;
      A.saveState();

      $("#emergencyCompletion").hidden = false;
      $("#emergencyCompleteBadge").hidden = false;
      $("#emergencySubmit").disabled = true;
      $("#emergencyAttemptLabel").textContent = "Correct";
      $("#emergencyCompletionText").textContent =
        "You predicted the cascade correctly. Frog and rabbit populations rise, grass falls, and eagles decline slightly. Grasshoppers also decrease as frogs increase.";
      setHealth(100);
      setFeedback(
        "Prediction correct! +30",
        "Removing the snake releases frogs and rabbits. The extra grazing pressure outweighs the grasshopper decline, so grass decreases. The eagle loses snake prey and declines slightly.",
        "positive"
      );
      A.playComplete();
      A.toast("Mission 2 complete — Mission 3 unlocked!", "positive");
    } else {
      A.state.progress.health = 65;
      A.saveState();
      setHealth(65);
      setFeedback(
        "Not quite — adjust your prediction",
        "The correct cascade is frog ↑, rabbit ↑, grass ↓, eagle ↓ slightly. Grasshopper ↓ is a secondary effect as frogs increase.",
        "negative"
      );
      A.playWrong();
      A.toast("Not quite. Review the highlighted outcomes and try again.", "negative");
    }

    A.updateGlobalStats();
  }

  function markOptions(selected, reveal, lock) {
    A.$$("#emergencyForm .check-item").forEach((label) => {
      const id = label.dataset.option;
      const input = label.querySelector("input");
      label.classList.remove("is-correct", "is-wrong");
      if (reveal) {
        if (D.EMERGENCY_CORRECT.has(id)) label.classList.add("is-correct");
        else if (selected.has(id)) label.classList.add("is-wrong");
      }
      input.disabled = !!lock;
    });
  }

  function reset() {
    const wasDone = !!A.state.progress.missions.emergency.done;
    run = {
      snakeOff: false,
      submitted: false,
      revealed: false,
      correct: false,
    };
    const toggle = $("#snakeToggle");
    toggle.checked = false;
    $("#snakeToggleLabel").textContent = "Snakes ON";
    $("#emergencyCompletion").hidden = true;
    $("#emergencyCompleteBadge").hidden = !wasDone;
    $("#emergencySubmit").disabled = false;
    $("#emergencyAttemptLabel").textContent = "Select all that apply";

    const inputs = A.$$("#emergencyForm input");
    inputs.forEach((input) => {
      input.checked = false;
      input.disabled = false;
    });
    A.$$("#emergencyForm .check-item").forEach((label) => {
      label.classList.remove("is-correct", "is-wrong");
    });

    renderChart(false);
    setHealth(wasDone ? 100 : 0);
    setFeedback("Simulation reset", "Snake is back. Turn it OFF to run the disturbance again.", "");
    A.saveState();
    A.updateGlobalStats();
    A.toast("Simulation reset.");
  }

  function setHealth(value) {
    A.state.progress.health = A.clamp(value, 0, 100);
    const label = $("#emergencyHealth");
    if (label) label.textContent = `${A.state.progress.health}%`;
  }

  function setFeedback(title, text, tone) {
    const element = $("#emergencyFeedback");
    if (!element) return;
    element.className = `feedback-panel${tone ? ` is-${tone}` : ""}`;
    element.innerHTML = `<strong>${A.escapeHtml(title)}</strong><p>${A.escapeHtml(text)}</p>`;
  }

  A.registerScreen("emergency", init);

  const toggle = $("#snakeToggle");
  if (toggle) {
    toggle.addEventListener("change", (event) => {
      A.unlockAudio();
      A.playClick();
      setSnakeOff(event.target.checked);
    });
  }

  const submitButton = $("#emergencySubmit");
  if (submitButton) {
    submitButton.addEventListener("click", () => {
      A.unlockAudio();
      submit();
    });
  }

  const resetButton = $("#emergencyReset");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      A.unlockAudio();
      A.playClick();
      reset();
    });
  }

  const form = $("#emergencyForm");
  if (form) {
    form.addEventListener("change", () => {
      if (!run || run.correct) return;
      A.$$("#emergencyForm .check-item").forEach((label) => {
        label.classList.remove("is-correct", "is-wrong");
      });
      if (run.submitted) {
        setFeedback(
          "Adjust your prediction",
          "Change your selections if needed, then submit again.",
          ""
        );
      }
      A.playClick();
    });
  }

  window.FWR_EMERGENCY = { init, submit, reset };
})();
