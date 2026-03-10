# AGENTS.md

Purpose: keep this repository efficient for AI-assisted work with minimal rescanning, disciplined Git usage, and clean handoff between sessions.

Mandatory read order before touching code:
1. `AGENTS.md`
2. `PROJECT_STATE.md`
3. `TASK_QUEUE.md`
4. `ARCHITECTURE.md`
5. `SESSION_HANDOFF.md`
6. `README.md` if present
7. `.github/copilot-instructions.md` when using Copilot or similar inline agents

Working rules:
- Default branch workflow: `main` is stable, `dev` is the default working branch.
- Do not work on `main` unless explicitly asked to stabilize or release.
- Prefer working directly on `dev`. Create a feature branch only when the change is structurally separate or risky.
- Read the smallest useful set of files first. Do not do a full repository scan by default.
- Make small, focused changes only. Do not refactor unrelated areas.
- Do not rewrite existing documentation blindly; improve it in place.
- After meaningful work, update `PROJECT_STATE.md`, `TASK_QUEUE.md`, `ARCHITECTURE.md`, and `SESSION_HANDOFF.md` as needed.
- Leave the repository handoff-ready after every completed step.

Testing expectations:
- Do not invent test, build, or lint commands.
- If commands are discoverable, run the narrowest relevant checks for the changed area and document the result.
- If no checks exist yet, record that gap in `PROJECT_STATE.md` and `SESSION_HANDOFF.md`.

Security expectations:
- Never commit secrets, tokens, private keys, credentials, or local machine data.
- Treat `.env*`, service credentials, and generated auth artifacts as sensitive unless a file is clearly a safe example.
- If secrets are found, do not print their values; document the risk and remediation need.

Current repository note:
- This repository currently has no application code, README, or discovered build/test tooling.
- Document uncertainty explicitly instead of guessing project details.
