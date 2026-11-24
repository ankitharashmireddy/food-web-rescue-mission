# Project Context — Food Web Rescue Mission

**Purpose of this file:** a compact, living record so work can continue after a break. Update the **Current state** and **Next steps** sections whenever the project changes.

_Last updated: 2026-11-24_

## 1. Goal

Build a complete offline static website for Class 12 Biology (Ecosystem): a game where students restore a grassland food web, simulate a snake-removal trophic cascade, and master the 10% energy law. Nine reference screens must exist. No backend, database, Python, npm, CDN, or network calls.

## 2. Hard constraints

- HTML5 + CSS3 + vanilla JavaScript only.
- No Python, Flask, SQL, SQLite, npm, Tailwind build step, external fonts, images, or APIs.
- All visuals are inline emoji, CSS, or generated SVG.
- Local Storage key: `fwr_state_v1`. State shape: `{ version, settings, skills, progress }`.
- Green = correct/positive; red = wrong/negative. Avoid multicolour gradients.
- Standard system fonts; one primary green accent plus red/amber for feedback.
- Skill input must accept **any number** of skills.

## 3. Architecture

Scripts load in dependency order at the end of `index.html`:

```
data.js → app.js → skills.js → web-canvas.js → screen-*.js → mission-*.js → screen-results.js → settings.js → boot.js
```

- `window.FWR` — immutable content/rules (`data.js`).
- `window.FWR_APP` — shared state, navigation, scoring, audio, confirm dialog (`app.js`). Screens register hooks with `A.registerScreen(name, fn)`.
- `window.FWR_CANVAS` — creates the organism nodes and curved SVG arrows; recalculates on resize via `ResizeObserver`.
- Each screen/mission file is an IIFE that attaches listeners once at load. Dynamic content is rendered by screen hooks.
- `boot.js` calls `A.init()` then shows the welcome screen.

### Biology model

Seven organisms: grass (T1), grasshopper (T2), rabbit (T2), frog (T3), snake (T3–T4), eagle (T3–T4), decomposer (outside scored chain).

Seven arrows (food → consumer):

1. Grass → Grasshopper
2. Grass → Rabbit
3. Grasshopper → Frog
4. Frog → Snake
5. Rabbit → Snake
6. Rabbit → Eagle
7. Snake → Eagle

Snake removal answer: frog ↑, rabbit ↑, grass ↓, eagle ↓ slightly; grasshopper ↓ is explained as a secondary effect. Energy chain: 10,000 → 1,000 → 100 → 10 J.

## 4. Scoring

| Mission | Correct | Wrong | Max |
| --- | --- | --- | --- |
| 1 — Build web | +10 per link | −3 per reversed/invalid pair | 70 |
| 2 — Emergency | +30 for exact correct set | retry with feedback | 30 |
| 3 — Energy | +10 per quiz question | retry with explanation | 30 |

Difficulty affects Mission 1 hints only: guided ∞, standard 3, expert 0.

## 5. Current state

Implemented and browser-tested locally at `http://127.0.0.1:8123/`:

- All nine screens render; no console errors.
- Mission 1: all seven connections scored 70/70; reversed pair shows −3 feedback; replay/hints work.
- Mission 2: correct prediction scored 30; cascade chart and badges unlock correctly.
- Mission 3: calculator and quiz scored 30/30; energy note text fixed to avoid duplicated `J`.
- Results: 130/130, 4/4 badges, report toggle.
- Learning Zone: 12 topics; topic completion now refreshes the topic list immediately.
- Skills: arbitrary add/remove, saved locally; duplicate names rejected case-insensitively.
- Settings: audio, music, difficulty, language, reduced motion, large text, high contrast, reset progress.
- Reload persistence verified (welcome "Continue" panel and saved score/settings restored).

Configuration files exist: `.env`, `.env.example`, `.gitignore`, `requirements.txt` (no dependencies), `README.md`, this file.

### Known caveats

- The food-web canvas has `min-width: 720px`; on narrow screens the canvas panel scrolls horizontally by design.
- Web Audio starts only after the first user gesture (browser autoplay policy).
- Language setting currently has one option (English); UI text is not translated.

## 6. Next steps / maintenance checklist

1. After any change, reload the page and check `browser.console` for errors.
2. Re-run the quick verification: dashboard → Mission 1 (7 links) → Mission 2 (4 checkboxes) → Mission 3 (3 questions) → results → settings/skills → reload.
3. Keep `data.js` as the only content source; do not duplicate organism or topic text in screen files.
4. Update this file when rules, screens, or storage shape change.
5. Git: commit on `main`; push to `https://github.com/ankitharashmireddy/food-web-rescue-mission.git`.

## 7. GitHub

Profile: `https://github.com/ankitharashmireddy`
Intended repo: `https://github.com/ankitharashmireddy/food-web-rescue-mission`

If no authenticated GitHub CLI is available, create the empty repository on GitHub and push manually with the commands in `README.md`. Do not commit secrets; `.env` is ignored by Git.
