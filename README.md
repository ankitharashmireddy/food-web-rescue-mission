# Food Web Rescue Mission

An offline, browser-based Class 12 Biology learning game for the **Ecosystem** chapter. Students rebuild a grassland food web, predict a trophic cascade after a snake is removed, and apply Lindeman's 10% law.

## Quick start

No build step, server, database, or installation is required.

1. Open `index.html` in any modern browser.
2. Or serve the folder locally (optional): `py -m http.server 8123` and visit `http://127.0.0.1:8123/`.

Everything runs from local files. The game makes **no network requests**, uses **no external fonts, images, CDNs, or libraries**, and stores progress in the browser's Local Storage under `fwr_state_v1`.

## Technology

- **HTML5** — nine-screen single-page interface
- **CSS3** — hand-written design system in `styles.css`
- **JavaScript (ES2020)** — vanilla JS, no framework or build tooling

> Tailwind CSS is intentionally **not** used: the project must work offline from plain files with no npm/CDN dependency. The utility-style consistency Tailwind would provide is handled by CSS custom properties and reusable component classes.

Python, SQL, Flask, and databases are **not** used. `requirements.txt` is kept empty (documentation only) to record that there are no Python dependencies.

## Screens

1. Welcome
2. Learning Dashboard
3. Learning Zone (12 topics)
4. Eco-Pedia (searchable glossary)
5. Ecosystem Explorer (habitat, food web, populations, what-if)
6. Mission 1 — Build the Food Web
7. Mission 2 — Ecosystem Emergency
8. Mission 3 — Energy Master
9. Final Results + detailed report

## Game rules

- **Mission 1:** click a food source, then its consumer. Seven correct links: `+10` each (`70` total). Reversed or invalid links: `−3`. Health rises with each correct link. Hints are limited by difficulty (guided ∞, standard 3, expert 0).
- **Mission 2:** switch snakes OFF, select all predicted outcomes, submit. Correct set = frog ↑, rabbit ↑, grass ↓, eagle ↓ slightly (`+30`). Grasshopper ↓ is a secondary effect shown in the explanation.
- **Mission 3:** calculate energy transfer (`10,000 → 1,000 → 100 → 10 J`) and answer three questions (`+10` each).
- Correct indicators are green; incorrect indicators are red.
- Badges: Food Web Builder, Ecosystem Protector, Energy Expert, Ecosystem Guardian.

## Custom skills

The dashboard and Settings → Skills let you add **any number of skills** (no fixed list). Skills are saved locally and shown on the dashboard and final report.

## File map

| File | Purpose |
| --- | --- |
| `index.html` | All nine screens, overlays, and script loading order |
| `styles.css` | Design tokens, layout, components, responsive rules |
| `data.js` | Single source of truth: organisms, links, cascade, topics, quizzes, badges |
| `app.js` | State, Local Storage, navigation, audio, scoring helpers |
| `web-canvas.js` | Reusable SVG food web with curved energy arrows |
| `mission-web.js` | Mission 1 logic |
| `mission-emergency.js` | Mission 2 logic |
| `mission-energy.js` | Mission 3 logic |
| `screen-dashboard.js`, `screen-pedia.js`, `screen-lesson.js`, `screen-explorer.js`, `screen-results.js` | Learning and reporting screens |
| `skills.js`, `settings.js`, `boot.js` | Skills, settings modal, global events |
| `PROJECT_CONTEXT.md` | Living project context for future updates |
| `.env`, `.env.example`, `.gitignore`, `requirements.txt` | Project configuration files |

## Version control

Repository: `https://github.com/ankitharashmireddy/food-web-rescue-mission`

```bash
git init -b main
git status
git add .
git commit -m "Build Food Web Rescue Mission"
git branch
git log --oneline
git remote add origin https://github.com/ankitharashmireddy/food-web-rescue-mission.git
git push -u origin main
```
