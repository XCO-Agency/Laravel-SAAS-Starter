<!-- Generated from ai-config/brain/rules/engineering-conduct.md — edit there and re-run ai-config/install.sh to re-sync. Do not edit here. -->

# Engineering Conduct (all repos)

> Behavioral guardrails for AI-assisted changes. Applies to every repo the agent touches.
> Bias to caution over speed; on trivial edits use judgment.

## Never commit or push without being asked (with ONE exception)

- **Interactive pairing:** do NOT run `git commit`, `git push`, or open a PR unless the user
  explicitly asks in that request. Make changes in the working tree, then **stop and report**
  what changed  - let the user review and commit. This overrides `xco-commit` / `xco-open-pr`,
  which run only on explicit request.
- **The headless exception:** when you were handed a task through the headless coding loop
  (`run-claude-task.sh` / `run-claude-review.sh` → `claude -p`, following `coding-workflow.md`
  or `pr-review-workflow.md`), that delegation **IS** the explicit instruction to commit, push,
  and open a DRAFT pull request. Proceed without pausing. You still NEVER merge and NEVER push to
  a protected branch (`main`, `staging`) directly - you push your own feature branch and PR it.
  In this mode `coding-workflow.md` / `pr-review-workflow.md` govern, not the pairing rule above.

## Commits, branches, PRs

- **Conventional Commits** (`<type>: <imperative summary>`; types `feat fix refactor docs test chore
  perf ci build revert style`). One author. **No AI attribution anywhere**: no `Co-Authored-By`, no
  "Generated with ...", no trailer, in commits, PR titles/bodies, issues or comments. The
  commit-quality hook only sees `git commit -m`; a `-F` file or heredoc message is not checked, so
  the rule is yours to keep.
- Never commit to `main` or `staging`. Cut `<type>/<short-slug>` from the base (usually `staging`)
  and PR into it. Stage files explicitly; never sweep in changes you did not make.
- Branches are disposable: every repo has `delete_branch_on_merge` on, so a merged branch is gone.
  Never push more work to a merged branch or reuse its name; cut a fresh one. Remove any worktree
  you created once its PR is merged or abandoned (the box reaps leftovers daily, but do not rely
  on it).

## GitHub Actions is out of the development flow

XCO's GitHub Actions have been billing-blocked org-wide since 2026-08-06: jobs do not start, every
run reports a `2s` failure, and many repos' workflows do not trigger on these branches at all. By
standing operator instruction, CI is not part of any flow here.

- Do NOT read, wait on, re-run, or gate on GitHub checks: no `gh pr checks`, no `gh run
  list/view/watch`, no status rollup.
- Do NOT report a check's state - not in a PR comment, a status line, a Slack/Lark message, or a
  final summary. The billing block is known background, never a finding.
- The bar is the **repo's own local gate**, run locally: its tests, typecheck, lint, build. Report
  THOSE results. A red check with a green local gate is not a problem; it is noise.
- Never write "runs in CI" as a reason for not running something. Name what you did not run and why.

## Think before coding

- State assumptions explicitly; if uncertain, ask. Don't guess scope, fields, or formats.
- If multiple valid interpretations exist, present them  - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop and name what's confusing before implementing.

## Never guess a diagnosis - trace it

When something doesn't work, find out why before changing anything.

- **Trace the actual path.** Read the code that runs, in the order it runs: which
  component is mounted, which branch is taken, where the value comes from, where
  it is consumed. "It should work" is not a diagnosis.
- **Verify the surface first.** Confirm *which* code the user is looking at
  before fixing it - two buttons, two routes, two components with similar names.
  Ask if it's ambiguous; the answer costs one message, a wrong fix costs several.
- **Check the docs for third-party behaviour** rather than recalling it. An
  attribute you assume exists may not. Prefer the vendor's docs over any
  in-repo summary; in-repo notes go stale and can be wrong.
- **Instrument when you can't observe.** If the failure only shows in a browser
  or a device you can't reach, add a temporary log and ask for the output.
  That is faster than a sequence of speculative fixes.
- **One fix per confirmed cause.** Don't stack changes hoping one lands - each
  unverified change hides the next symptom and makes the real cause harder to see.
- If a second attempt at the same bug fails, stop editing and go back to
  tracing. Repeated near-misses mean the model of the problem is wrong, not
  that the fix needs another tweak.
- Say what the evidence was. "X is null because Y never runs" - not "should be
  fixed now".

## Simplicity first (YAGNI)

- Write the minimum code that solves the ask. Nothing speculative.
- No abstractions for single-use code; no unrequested "flexibility" or config.
- No error handling for impossible scenarios.
- If you wrote 200 lines and it could be 50, rewrite it. Ask: "would a senior engineer call this overcomplicated?"

## Surgical changes

- Touch only what the request needs  - every changed line should trace to the ask.
- Match the surrounding style even if you'd do it differently. No drive-by refactors, reformatting, quote-style or type-hint churn.
- Remove only the imports/vars/functions YOUR change orphaned. Pre-existing dead code → mention it, don't delete.

## Goal-driven execution

- Turn the task into verifiable success criteria before coding ("make it work" is too weak).
- Fixing a bug → reproduce it with a test first, then fix (where test infra exists).
- Multi-step work → state a brief plan, each step with a verify check; run the affected tests/lint.
