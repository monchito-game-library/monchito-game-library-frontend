---
description: >
  Synchronise README.md (English, canonical) and README.es.md (Spanish) after
  editing either one. Detects which file changed, translates prose naturally,
  keeps code/commands/paths identical, preserves table/fence parity, and
  verifies structural parity before finishing. Does NOT commit or push.
argument-hint: '[en|es]'
---

# sync-readme

Keeps `README.md` (English, canonical) and `README.es.md` (Spanish) in structural
and content parity after any edit to either file.

## When to use

- After editing `README.md`: propagate changes to `README.es.md`.
- After editing `README.es.md`: propagate changes to `README.md`.
- Optionally pass `en` or `es` to force the direction instead of auto-detecting.

## Flow

### Step 1 — Determine source

If an argument was passed (`en` or `es`), use it as the source language.

Otherwise auto-detect from git:

```bash
git diff --stat HEAD -- README.md README.es.md
git status --porcelain README.md README.es.md
```

- Only `README.md` changed → source is `en`, target is `README.es.md`.
- Only `README.es.md` changed → source is `es`, target is `README.md`.
- Both changed → ask the user: "Both README.md and README.es.md have changes. Which is the source? [en/es]"
- Neither changed → nothing to do; stop and report "No README changes detected."

### Step 2 — Read the source file

Read the source file in full.

### Step 3 — Translate and write the target

Write the target file applying these rules:

1. **Structure parity**: the target must have the same number of `#`, `##`, `###`, `####` headings, fenced code blocks (` ``` `), and Markdown tables as the source.
2. **Prose translation**: translate all human-readable prose naturally. Do not translate proper nouns, brand names, package names, file paths, code snippets, or CLI commands.
3. **Language-switcher lines**: always preserve these as the first two lines:
   - `README.md` (EN): `**English** | [Español](README.es.md)`
   - `README.es.md` (ES): `[English](README.md) | **Español**`
4. **Canonical note**: always preserve the `>` block note on the third line:
   - `README.md`: `> This is the canonical version. The Spanish translation is in [README.es.md](README.es.md).`
   - `README.es.md`: `> Esta es la traducción al español. La versión canónica está en [README.md](README.md).`
5. **Code blocks**: content inside fenced code blocks is copied verbatim (no translation).
6. **Table parity**: tables must have the same number of rows and columns. Translate only the cell content that is prose.
7. **Links**: internal links (`[text](README.md)`, `[text](README.es.md)`) are preserved as-is. External URLs are never changed.

### Step 4 — Structural parity check

After writing the target, verify structural parity between `README.md` and `README.es.md`:

````bash
# Heading counts
grep -c '^#' README.md
grep -c '^#' README.es.md

# Fenced code block counts (``` lines)
grep -c '^```' README.md
grep -c '^```' README.es.md

# Table separator row counts (lines starting with |---|)
grep -c '^|---' README.md
grep -c '^|---' README.es.md

# Language-switcher links present
grep -c 'README.es.md' README.md
grep -c 'README.md' README.es.md
````

All paired counts must be equal, and each switcher grep must return ≥ 1. If any check fails, fix the target file and re-run the checks.

### Step 5 — Report

List the sections that were propagated (by heading title) and confirm all parity checks passed.

Do NOT commit or push — per project convention (`CLAUDE.md`).
