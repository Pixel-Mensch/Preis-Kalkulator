# ARCHITECTURE.md

High-level structure:
- The repository currently contains only workflow and handoff documentation.
- No application architecture is present yet.

Main modules and responsibilities:
- `AGENTS.md`: agent workflow and repository operating rules
- `PROJECT_STATE.md`: current known status, gaps, and risks
- `TASK_QUEUE.md`: prioritized next work
- `ARCHITECTURE.md`: architecture record; currently limited by missing source files
- `SESSION_HANDOFF.md`: most recent work and next-step guidance
- `.github/copilot-instructions.md`: short inline guidance for Copilot-style agents

Entry points:
- None discovered

Important flows:
- Agent workflow: read control files first, inspect only the smallest relevant context, make a focused change, then update control files before stopping
- Git workflow: stabilize on `main`, perform normal work on `dev`, avoid unrelated branch sprawl

Important files and what they do:
- `AGENTS.md`: defines mandatory read order and working discipline
- `PROJECT_STATE.md`: states what is known without guessing
- `TASK_QUEUE.md`: keeps the next session actionable
- `SESSION_HANDOFF.md`: tells the next agent exactly where to continue

Architecture limitations:
- No source files, config files, services, or runtime flows are available yet to document.
