---
description: "Analyzes the current state of the project and proposes the next task to tackle, reading BUGS.md first (pending bugs take priority) and then ROADMAP.md. Use when the user wants to know what to work on next ('que hago ahora', 'siguiente tarea', 'que es lo proximo')."
---

Steps:

1. Read `docs/BUGS.md`. If there are pending bugs (not marked as resolved), list them by priority.
2. If there are no pending bugs, read `docs/ROADMAP.md` and identify the next pending improvement by priority.
3. Propose the highest-priority task with:
   - What needs to be done and why
   - Which files will be affected (estimate)
   - Approximate complexity level (small / medium / large)
4. Ask the user whether to proceed with that task or prefer a different one.

Do not start implementing anything until the user confirms.
