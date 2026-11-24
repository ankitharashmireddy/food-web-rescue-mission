# Agent notes

Read `PROJECT_CONTEXT.md` before making changes. It contains the biology model, scoring rules, architecture, and current verification state.

## Rules for this repo

- Static site only: HTML, CSS, JavaScript. No backend, database, package manager, or external assets.
- Keep content in `data.js`; keep presentation in `styles.css`; keep logic in the small IIFE modules.
- Preserve script load order in `index.html`.
- Green for correct, red for wrong. No multicolour gradients.
- Never commit `.env` or local credential files.
- After changes, verify in a browser and update the **Current state** section of `PROJECT_CONTEXT.md`.
