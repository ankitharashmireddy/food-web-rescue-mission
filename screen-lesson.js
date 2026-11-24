/* ==========================================================================
   Food Web Rescue Mission — Learning Zone
   ========================================================================== */

(() => {
  "use strict";

  const A = window.FWR_APP;
  const D = A.D;
  const $ = A.$;

  let currentSlug = null;
  let quiz = { slug: null, selected: null, answered: false };

  function renderLesson() {
    ensureSlug();
    const topic = D.TOPIC_BY_SLUG[currentSlug];

    const label = $("#lessonProgressLabel");
    if (label) label.textContent = `${A.completedTopics()} / ${D.TOPICS.length} complete`;

    renderTopicList();
    renderLessonMain(topic);
  }

  function ensureSlug() {
    if (currentSlug && D.TOPIC_BY_SLUG[currentSlug]) return;
    const next = D.TOPICS.find((topic) => !(A.state.progress.topics[topic.slug] || {}).completed);
    currentSlug = (next || D.TOPICS[0]).slug;
  }

  function renderTopicList() {
    const list = $("#topicList");
    if (!list) return;
    list.innerHTML = D.TOPICS.map((topic, index) => {
      const done = !!(A.state.progress.topics[topic.slug] || {}).completed;
      const active = topic.slug === currentSlug;
      return `
        <button class="topic-btn ${active ? "is-active" : ""} ${done ? "is-complete" : ""}" type="button" data-topic="${topic.slug}">
          <span class="topic-check">${done ? "✓" : String(index + 1).padStart(2, "0")}</span>
          <span>${A.escapeHtml(topic.title)}</span>
        </button>
      `;
    }).join("");
  }

  function renderLessonMain(topic) {
    const main = $("#lessonMain");
    if (!main) return;

    if (!topic) {
      main.innerHTML = `<div class="empty-state">Choose a topic to begin.</div>`;
      return;
    }

    if (quiz.slug !== currentSlug) {
      quiz = { slug: currentSlug, selected: null, answered: false };
    }

    const question = topic.quiz;
    const answered = quiz.answered;
    const selected = quiz.selected;
    const correct = answered && selected === question.answer;

    const options = question.options.map((option, index) => {
      let stateClass = "";
      if (answered) {
        if (index === question.answer) stateClass = "is-correct";
        else if (index === selected) stateClass = "is-wrong";
      } else if (index === selected) {
        stateClass = "is-selected";
      }
      return `
        <button class="option-btn ${stateClass}" type="button" data-lesson-option="${index}" ${answered ? "disabled" : ""}>
          <span class="option-letter">${String.fromCharCode(65 + index)}</span>
          <span>${A.escapeHtml(option)}</span>
        </button>
      `;
    }).join("");

    const visual = topic.visual.map((item, index) => (
      `${index ? '<span class="visual-arrow">→</span>' : ""}<span class="visual-chip">${A.escapeHtml(item)}</span>`
    )).join("");

    const feedback = answered
      ? `<div class="quiz-feedback ${correct ? "positive" : "negative"}">
          <strong>${correct ? "Correct! Topic complete." : "Not quite."}</strong>
          <p>${A.escapeHtml(question.why)}</p>
        </div>`
      : "";

    const actions = answered
      ? `<div class="button-row">
          <button class="btn btn-primary" type="button" data-next-topic>${isLastTopic() ? "Back to dashboard" : "Next topic →"}</button>
          ${correct ? "" : '<button class="btn btn-ghost" type="button" id="lessonRetry">Try again</button>'}
        </div>`
      : `<button class="btn btn-primary" type="button" id="lessonCheck">Check answer</button>`;

    main.innerHTML = `
      <div class="lesson-topline">
        <span class="status-pill">${A.escapeHtml(topic.tag)}</span>
        <span class="status-pill ${(A.state.progress.topics[topic.slug] || {}).completed ? "positive" : ""}">
          ${(A.state.progress.topics[topic.slug] || {}).completed ? "Completed" : "In progress"}
        </span>
      </div>
      <h3 class="lesson-title">${A.escapeHtml(topic.title)}</h3>
      <p class="lesson-summary">${A.escapeHtml(topic.summary)}</p>
      <div class="visual-chain">${visual}</div>
      <div class="lesson-section">
        <h4>Explanation</h4>
        ${topic.explanation.map((paragraph) => `<p class="muted">${A.escapeHtml(paragraph)}</p>`).join("")}
      </div>
      <div class="lesson-section">
        <h4>Key points</h4>
        <ul class="key-points">
          ${topic.keyPoints.map((point) => `<li>${A.escapeHtml(point)}</li>`).join("")}
        </ul>
      </div>
      <div class="example-box"><strong>Example:</strong> ${A.escapeHtml(topic.example)}</div>
      <div class="quiz-box">
        <h4>Quick check</h4>
        <p>${A.escapeHtml(question.question)}</p>
        <div class="quiz-options">${options}</div>
        ${feedback}
        ${actions}
      </div>
    `;
  }

  function isLastTopic() {
    return D.TOPICS.findIndex((topic) => topic.slug === currentSlug) === D.TOPICS.length - 1;
  }

  function selectTopic(slug) {
    if (!D.TOPIC_BY_SLUG[slug]) return;
    currentSlug = slug;
    quiz = { slug, selected: null, answered: false };
    renderLesson();
  }

  function selectOption(index) {
    if (quiz.answered) return;
    quiz.selected = index;
    renderLessonMain(D.TOPIC_BY_SLUG[currentSlug]);
    A.playClick();
  }

  function checkAnswer() {
    const topic = D.TOPIC_BY_SLUG[currentSlug];
    if (!topic) return;
    if (quiz.selected === null) {
      A.toast("Choose an answer first.", "negative");
      return;
    }
    quiz.answered = true;
    const correct = quiz.selected === topic.quiz.answer;
    if (correct) {
      markTopicComplete(topic.slug);
      A.playCorrect();
      A.toast("Correct — topic marked complete.", "positive");
    } else {
      A.playWrong();
    }
    renderLessonMain(topic);
    A.updateGlobalStats();
  }

  function markTopicComplete(slug) {
    const existing = A.state.progress.topics[slug] || {};
    if (existing.completed) return;
    A.state.progress.topics[slug] = { ...existing, completed: true, quizScore: 1 };
    A.saveState();
    renderTopicList();
    const label = $("#lessonProgressLabel");
    if (label) label.textContent = `${A.completedTopics()} / ${D.TOPICS.length} complete`;
  }

  function nextTopic() {
    const index = D.TOPICS.findIndex((topic) => topic.slug === currentSlug);
    if (index === D.TOPICS.length - 1) {
      A.toast("You reached the last topic. Review any topic or start a mission.", "positive");
      A.showScreen("dashboard");
      return;
    }
    selectTopic(D.TOPICS[index + 1].slug);
    A.playClick();
  }

  function retry() {
    quiz.selected = null;
    quiz.answered = false;
    renderLessonMain(D.TOPIC_BY_SLUG[currentSlug]);
    A.playClick();
  }

  A.registerScreen("lesson", renderLesson);

  const list = $("#topicList");
  if (list) {
    list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-topic]");
      if (!button) return;
      A.unlockAudio();
      selectTopic(button.dataset.topic);
      A.playClick();
    });
  }

  const main = $("#lessonMain");
  if (main) {
    main.addEventListener("click", (event) => {
      A.unlockAudio();
      const option = event.target.closest("[data-lesson-option]");
      if (option) {
        selectOption(Number(option.dataset.lessonOption));
        return;
      }
      if (event.target.closest("#lessonCheck")) {
        checkAnswer();
        return;
      }
      if (event.target.closest("#lessonRetry")) {
        retry();
        return;
      }
      if (event.target.closest("[data-next-topic]")) {
        nextTopic();
      }
    });
  }

  window.FWR_LESSON = { current: () => currentSlug };
})();
