# Food Web Rescue Mission

A playable offline HTML5 Canvas adventure game for Class 11/12 Biology. Explore ecosystems, discover organisms, rebuild food chains, solve energy puzzles and restore ecosystem stability.

## How to run the game

1. Open `index.html` in Chrome, Edge or Firefox.
2. Or run a local server:
   - `py -m http.server 8123`
   - Visit `http://127.0.0.1:8123/`
3. Click **Start Adventure**, choose a world, and use **WASD / Arrow keys**.

## How to play

- Move with WASD or arrow keys.
- Press E near an organism to discover it.
- Press J to open the Eco Journal.
- Press P to pause.
- Complete the food-chain, energy and ecosystem-rescue challenges in each world.

## Quick start

No build step, server, database, or installation is required.

1. Open `index.html` in any modern browser.
2. Or serve the folder locally (optional): `py -m http.server 8123` and visit `http://127.0.0.1:8123/`.

Everything runs from local files. The game makes **no network requests**, uses **no external fonts, images, CDNs, or libraries**, and stores progress in the browser's Local Storage under `fwr_state_v1`.

## Technology

- **HTML5** — nine-screen single-page interface
- **CSS3** — hand-written warm woodland design system in `styles.css`
- **JavaScript (ES2020)** — vanilla JS, no framework or build tooling
- **SVG** — local diagrams and icons in `assets/`

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
| `css/styles.css` | Design tokens, layout, components, responsive rules |
| `js/data.js` | Single source of truth: organisms, links, cascade, topics, quizzes, badges |
| `js/app.js` | State, Local Storage, navigation, audio, scoring helpers |
| `js/web-canvas.js` | Reusable SVG food web with curved energy arrows |
| `js/missions/mission-web.js` | Mission 1 logic |
| `js/missions/mission-emergency.js` | Mission 2 logic |
| `js/missions/mission-energy.js` | Mission 3 logic |
| `js/screens/screen-dashboard.js`, `js/screens/screen-pedia.js`, `js/screens/screen-lesson.js`, `js/screens/screen-explorer.js`, `js/screens/screen-results.js` | Learning and reporting screens |
| `js/skills.js`, `js/settings.js`, `js/boot.js` | Skills, settings modal, global events |
| `PROJECT_CONTEXT.md` | Living project context for future updates |
| `.env`, `.env.example`, `.gitignore`, `requirements.txt` | Project configuration files |

## Asset folders

| Folder | Contents |
| --- | --- |
| `assets/backgrounds/` | Welcome, learning, explorer and emergency background artwork |
| `assets/organisms/` | Organism illustrations |
| `assets/badges/` | Badge artwork |
| `assets/diagrams/` | SVG food chain, food web, energy pyramid, nutrient cycle and population graph |
| `assets/icons/` | SVG interface icons |
| `assets/ui/` | Logo and UI artwork |
| `assets/sounds/` | Sound mapping; audio is generated with the Web Audio API |
| `assets/effects/` | Sparkle, star and confetti artwork |
| `assets/fonts/` | Font notes; system fonts are used |
| `assets/inspiration/` | Supplied inspiration images, not used at runtime |

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
