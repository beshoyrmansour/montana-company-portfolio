---
name: preflight
description: Run the full local CI gate — lint, typecheck, content:validate, routes:check, unit tests — before pushing, so failures surface locally. Trigger on "preflight", "run the checks", "is this safe to push", "run the CI gate locally", "pre-push checks".
disable-model-invocation: true
---

# Preflight — local CI gate

Run every quality check CI runs — in CI's order, with `routes:check` pulled out of `build` as its own fast step (see "What maps to CI") — so a red pipeline never surprises you after pushing. Attempt **all** steps even if an early one fails, then print one consolidated PASS/FAIL table with the output of any failure quoted.

## What maps to CI

`.github/workflows/ci.yml` → `quality` job runs (after `npm ci`): `lint` → `typecheck` → `content:validate` → `npm test` → `build`. The `build` script is `content:validate && routes:check && next build`, so **`routes:check` runs inside `build`** in CI. Preflight runs `routes:check` as its own fast step (no full `next build` needed) so route drift fails in seconds.

Core gate (always run these five, in this order):

| #   | Command                    | CI step it mirrors                                     |
| --- | -------------------------- | ------------------------------------------------------ |
| 1   | `npm run lint`             | Lint (`eslint .`)                                      |
| 2   | `npm run typecheck`        | Typecheck (`tsc --noEmit`)                             |
| 3   | `npm run content:validate` | Validate content (`tsx scripts/validate-content.ts`)   |
| 4   | `npm run routes:check`     | inside `npm run build` (`tsx scripts/check-routes.ts`) |
| 5   | `npm test`                 | Unit tests (`vitest run`)                              |

Heavier, opt-in (CI runs them; **only run when the user asks** — each is minutes, not seconds):

- `npm run build` — full `next build`. CI's "Build (Next.js)" step. Re-runs content:validate + routes:check first.
- `npm run test:e2e` — Playwright (`playwright test`). CI's `e2e` job; needs `npm run build && npm start` serving on :3000.
- `npm run format:check` — `prettier --check .`. CI does not gate on this in `quality`, but it's the formatting parity check; add it if the user wants formatting verified. Fix with `npm run format`.

## How to run it

Run this one block from the repo root. It runs all five core checks, never stops on the first failure, logs each command's output, and prints the summary table.

```bash
set +e
LOGDIR="${TMPDIR:-/tmp}/montana-preflight"
mkdir -p "$LOGDIR"
fail=0
summary=""
run_step() {
  name="$1"; cmd="$2"
  echo "▶ $name — $cmd"
  eval "$cmd" > "$LOGDIR/$name.log" 2>&1
  st=$?
  cat "$LOGDIR/$name.log"
  if [ "$st" -eq 0 ]; then r="PASS ✅"; else r="FAIL ❌"; fail=1; fi
  summary="${summary}  ${r}  ${name}  (log: $LOGDIR/$name.log)
"
  echo
}
run_step "lint"             "npm run lint"
run_step "typecheck"        "npm run typecheck"
run_step "content:validate" "npm run content:validate"
run_step "routes:check"     "npm run routes:check"
run_step "test"             "npm test"
echo "==================== PREFLIGHT SUMMARY ===================="
printf "%s" "$summary"
echo "=========================================================="
if [ "$fail" -eq 0 ]; then
  echo "✅ All checks passed — this branch is safe to push."
else
  echo "❌ One or more checks failed — see the FAIL rows above. Not safe to push yet."
fi
exit "$fail"
```

> Note on shells: this block uses a plain string accumulator and a helper function — **no** indexed arrays or bash-only `${!arr[@]}` expansion — so it runs identically under **bash and zsh** (this repo's default shell is zsh). Logs land in `${TMPDIR:-/tmp}/montana-preflight/<step>.log` — outside the repo, so nothing gets committed.

## Reporting rules (do this after running)

1. Render a Markdown summary table with one row per core step and its result:

   | Step             | Command                    | Result  |
   | ---------------- | -------------------------- | ------- |
   | Lint             | `npm run lint`             | ✅ / ❌ |
   | Typecheck        | `npm run typecheck`        | ✅ / ❌ |
   | Content validate | `npm run content:validate` | ✅ / ❌ |
   | Routes check     | `npm run routes:check`     | ✅ / ❌ |
   | Unit tests       | `npm test`                 | ✅ / ❌ |

2. For **every** failing step, quote the relevant tail of its `${TMPDIR:-/tmp}/montana-preflight/<step>.log` in a fenced code block so the error is visible without re-running.
3. **All green:** state plainly — "All checks passed — the branch is safe to push." If the user asked for the heavier steps, note whether `build` / `test:e2e` / `format:check` were run and their results too.
4. **Any red:** state it's not safe to push, then **offer to fix the failures** (e.g. `npm run format` for formatting, code edits for lint/type/test errors, content edits for validate/routes failures). Ask before making changes unless the user already said to fix.

## Gotchas to remember when fixing

- `content:validate` / `routes:check` failures are usually **content**, not code — check `content/**/*.json` against the Zod schemas in `src/schemas/`. A common cause: a product/news JSON file's stem not matching its internal `slug` field (the validator enforces stem === slug), or a missing locale in an i18n object (`{ en, ar?, fr?, de? }`).
- `typecheck` uses `tsc --noEmit` and is faster than `build`; fix types here before reaching for a full build.
- Prefer `npm run format` (auto-fix) over hand-editing whitespace when only `format:check` is red.
