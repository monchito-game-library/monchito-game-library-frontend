---
description: "Creates a pull request for the current branch following project conventions: checks repo state, ensures branch is pushed and up to date with master (rebasing if needed), opens the PR via gh, and activates auto-merge squash. Use when the user wants to open a PR ('crea la PR', 'abre el pull request', 'crear la pull request')."
argument-hint: '[description]'
---

Steps:

1. Check the repo state: `git status` and `git diff`.
2. If there are uncommitted changes, ask the user whether they want to include them or whether they are already ready.
3. Ensure the current branch is NOT `master`. If it is `master`, create a new branch with an appropriate name based on the type of change:
   - `feat/short-description` for new features
   - `fix/bug-description` for bug fixes
   - `chore/task` for maintenance
   - `docs/description` for documentation
   - `refactor/description` for refactors
   - `test/description` for coverage improvements
4. **Assume the user has already pushed the branch** (Claude does not have permission to run `git push` in this sandbox; the user runs it before invoking `/pr`). Verify with `git log @{u}..HEAD --oneline` that there are no unpushed local commits and that the branch exists on remote. If there are unpushed commits or the branch has not been published yet, **stop and ask the user to push** before continuing.
5. **Check whether the branch is up to date with master**: run `git fetch origin master --quiet` and then `git log HEAD..origin/master --oneline`. If it prints any commits, master has advanced since the branch was created. In that case:
   - Attempt an automatic rebase: `git rebase origin/master`.
   - If the rebase finishes cleanly, re-check `git log @{u}..HEAD --oneline` — there will be unpushed local commits (the rebased ones); **stop and ask the user to run `git push --force-with-lease`** before continuing.
   - If the rebase has conflicts, **abort with `git rebase --abort`** and ask the user to rebase manually; do not attempt to resolve conflicts automatically.
   - If master has not advanced, continue to the next step without touching anything.
6. Open the PR with `gh pr create` against `master`, with title and body in Spanish, following the format:
   - Title: short and descriptive (≤ 70 characters)
   - Body: sections `## Resumen` (bullets) and `## Plan de pruebas` (checklist)
7. **Activate auto-merge squash automatically** without asking: `gh pr merge <number> --auto --squash`. Report the PR number and URL.

Optional argument: $ARGUMENTS — use it as the suggested description or title for the PR if provided.
