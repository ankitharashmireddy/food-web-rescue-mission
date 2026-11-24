/* ==========================================================================
   Food Web Rescue Mission — Mission 3: Energy Master
   ========================================================================== */

(() => {
  "use strict";

  const A = window.FWR_APP;
  const D = A.D;
  const $ = A.$;

  let run = null;

  function init() {
    const done = !!A.state.progress.missions.energy.done;
    run = {
      index: 0,
      score: 0,
      selected: null,
      answered: false,
      finished: false,
      results: [],
    };

    $("#energyInput").value = "10000";
    renderPyramid(10000);
    renderQuiz();

    $("#energyCompletion").hidden = !done;
    $("#energyCompleteBadge").hidden = !done;
    if (done) {
      $("#energyCompletionText").textContent =
        `Best score: ${A.state.progress.missions.energy.best}/30. Retry the quiz to improve it.`;
    }
  }

  function renderPyramid(baseValue) {
    const base = A.clamp(Number(baseValue) || 10000, 100, 1000000000000);
    const levels = [
      { width: 42, alpha: 0.24, label: "Tertiary consumers", sub: "Eagle", value: base / 1000 },
      { width: 58, alpha: 0.18, label: "Secondary consumers", sub: "Snake, frog", value: base / 100 },
      { width: 76, alpha: 0.13, label: "Primary consumers", sub: "Rabbit, grasshopper", value: base / 10 },
      { width: 96, alpha: 0.09, label: "Producers", sub: "Grass", value: base },
    ];

    const pyramid = $("#energyPyramid");
    if (!pyramid) return;
    pyramid.innerHTML = levels.map((level, index) => `
      <div class="energy-tier" style="--tier-width:${level.width}%;--tier-alpha:${level.alpha}">
        <span class="energy-tier-label">${A.escapeHtml(level.label)}<small>${A.escapeHtml(level.sub)}</small></span>
        <strong>${formatEnergy(level.value)}</strong>
      </div>
      ${index < levels.length - 1 ? '<div class="energy-loss">↓ ~90% lost</div>' : ""}
    `).join("");

    const note = $("#energyNote");
    if (note) {
      note.textContent =
        `${formatEnergy(base)} in producers → ${formatEnergy(base / 10)} in primary consumers → ` +
        `${formatEnergy(base / 100)} in secondary consumers → ${formatEnergy(base / 1000)} in tertiary consumers. ` +
        "About 90% is lost at each transfer.";
    }
  }

  function formatEnergy(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "— J";
    if (number >= 1000) return `${Math.round(number).toLocaleString("en-IN")} J`;
    if (number >= 10) return `${Math.round(number)} J`;
    if (number >= 1) return `${number.toFixed(1)} J`;
    return `${number.toFixed(2)} J`;
  }

  function renderQuiz() {
    if (!run) return;
    const box = $("#energyQuiz");
    const progress = $("#energyProgress");
    if (!box) return;

    const dots = D.ENERGY_QUIZ.map((_, index) => {
      const stateClass = run.finished || index < run.index
        ? "is-done"
        : index === run.index
          ? "is-current"
          : "";
      return `<span class="quiz-dot ${stateClass}"></span>`;
    }).join("");

    if (run.finished) {
      const positive = run.score >= 20;
      box.innerHTML = `
        <div class="quiz-progress">${dots}</div>
        <div class="quiz-feedback ${positive ? "positive" : "negative"}">
          <strong>${run.score}/30 points</strong>
          <p>${positive ? "Energy Expert standard reached — at least 2 of 3 correct." : "Review the 10% law and try again for at least 2 of 3 correct."}</p>
        </div>
        <button class="btn btn-primary full" id="energyRetry" type="button">Retry quiz</button>
      `;
      if (progress) progress.textContent = `${run.score}/30`;
      return;
    }

    const question = D.ENERGY_QUIZ[run.index];
    const options = question.options.map((option, index) => {
      let stateClass = "";
      if (run.answered) {
        if (index === question.answer) stateClass = "is-correct";
        else if (index === run.selected) stateClass = "is-wrong";
      } else if (index === run.selected) {
        stateClass = "is-selected";
      }
      return `
        <button class="option-btn ${stateClass}" type="button" data-energy-option="${index}" ${run.answered ? "disabled" : ""}>
          <span class="option-letter">${String.fromCharCode(65 + index)}</span>
          <span>${A.escapeHtml(option)}</span>
        </button>
      `;
    }).join("");

    const feedback = run.answered
      ? `<div class="quiz-feedback ${run.selected === question.answer ? "positive" : "negative"}">
          <strong>${run.selected === question.answer ? "Correct! +10" : "Not quite"}</strong>
          <p>${A.escapeHtml(question.why)}</p>
        </div>`
      : "";

    box.innerHTML = `
      <div class="quiz-progress">${dots}</div>
      <p class="muted small">Question ${run.index + 1} of ${D.ENERGY_QUIZ.length}</p>
      <h4>${A.escapeHtml(question.question)}</h4>
      <div class="quiz-options">${options}</div>
      ${feedback}
      <button class="btn btn-primary full" id="${run.answered ? "energyNext" : "energyCheck"}" type="button">
        ${run.answered ? (run.index === D.ENERGY_QUIZ.length - 1 ? "Finish quiz" : "Next question") : "Check answer"}
      </button>
    `;

    if (progress) {
      progress.textContent = `${Math.min(run.index + (run.answered ? 1 : 0), 3)} / 3`;
    }
  }

  function selectOption(index) {
    if (!run || run.answered || run.finished) return;
    run.selected = index;
    renderQuiz();
    A.playClick();
  }

  function checkAnswer() {
    if (!run || run.finished) return;
    if (run.selected === null) {
      A.toast("Choose an answer first.", "negative");
      return;
    }
    const question = D.ENERGY_QUIZ[run.index];
    const correct = run.selected === question.answer;
    run.answered = true;
    run.results.push({ index: run.index, correct });
    if (correct) {
      run.score += 10;
      A.state.progress.stats.energyCorrect += 1;
      A.playCorrect();
    } else {
      A.playWrong();
    }
    renderQuiz();
  }

  function nextQuestion() {
    if (!run || !run.answered) return;
    if (run.index >= D.ENERGY_QUIZ.length - 1) {
      finish();
      return;
    }
    run.index += 1;
    run.selected = null;
    run.answered = false;
    renderQuiz();
    A.playClick();
  }

  function finish() {
    if (!run) return;
    run.finished = true;
    A.state.progress.missions.energy.done = true;
    A.state.progress.missions.energy.best = Math.max(
      Number(A.state.progress.missions.energy.best) || 0,
      run.score
    );
    A.state.progress.missions.energy.health = 100;
    A.state.progress.health = 100;
    A.state.progress.stats.energyAttempts += 1;
    A.saveState();

    $("#energyCompletion").hidden = false;
    $("#energyCompleteBadge").hidden = false;
    $("#energyCompletionText").textContent =
      `You scored ${run.score}/30. Best score: ${A.state.progress.missions.energy.best}/30.`;
    renderQuiz();
    A.playComplete();
    A.toast("Mission 3 complete!", "positive");
    A.updateGlobalStats();
  }

  function retry() {
    run = {
      index: 0,
      score: 0,
      selected: null,
      answered: false,
      finished: false,
      results: [],
    };
    $("#energyCompletion").hidden = true;
    renderQuiz();
    A.toast("Quiz reset. Good luck!");
  }

  function calculate() {
    const input = $("#energyInput");
    const value = Number(input.value);
    if (!Number.isFinite(value) || value < 100) {
      A.toast("Enter an energy value of at least 100 J.", "negative");
      input.focus();
      return;
    }
    const safe = A.clamp(value, 100, 1000000000000);
    input.value = String(safe);
    renderPyramid(safe);
    A.playClick();
  }

  A.registerScreen("energy", init);

  const calcButton = $("#energyCalc");
  if (calcButton) {
    calcButton.addEventListener("click", () => {
      A.unlockAudio();
      calculate();
    });
  }

  const input = $("#energyInput");
  if (input) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        A.unlockAudio();
        calculate();
      }
    });
  }

  const quiz = $("#energyQuiz");
  if (quiz) {
    quiz.addEventListener("click", (event) => {
      A.unlockAudio();
      const option = event.target.closest("[data-energy-option]");
      if (option) {
        selectOption(Number(option.dataset.energyOption));
        return;
      }
      if (event.target.closest("#energyCheck")) {
        checkAnswer();
        return;
      }
      if (event.target.closest("#energyNext")) {
        nextQuestion();
        return;
      }
      if (event.target.closest("#energyRetry")) {
        retry();
      }
    });
  }

  window.FWR_ENERGY = { init, calculate, retry };
})();
