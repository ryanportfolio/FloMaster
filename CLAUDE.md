# Claude Code Guidelines

> Kernel rules. Read first. Cross-cutting only. Topical detail lives in `.claude/reference/`.

## What this project is

Website for an independent, one-person plumbing business in Hampton Roads, Virginia (Chesapeake, Hampton, Newport News, Norfolk, Portsmouth, Suffolk, Virginia Beach), residential and commercial. The owner is a master plumber who does every job. Current phase: a private prototype for the owner to review. Research: `docs/research.md` (do not edit). Design: `docs/design-brief.md`.

Won't compromise on:

- No invented business facts on a public site. Unconfirmed claims (licence, fees, prices, 24/7, warranty, reviews) stay tagged placeholders until the owner confirms them.
- No stock photos, no fake or filtered reviews. AI-generated images appear only as tagged stand-ins in the prototype and are replaced by real photos before any public launch.
- Licence number on every page; every fee listed.
- Emergency (phone) and planned (booking) paths split from the first screen.
- Mobile Core Web Vitals good (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1) and WCAG 2.2 AA.

## Default prose mode: caveman ultra

Invoke the `caveman` skill at **ultra** at session start. Applies to all prose replies, this and every future session.

- Code, commits, PRs, file contents, symbols, API names, error strings stay normal, never abbreviated.
- Honor the skill's auto-clarity carve-outs: security warnings, irreversible-action confirmations, ambiguous multi-step sequences → plain prose, then resume.

## Always-on cleanup

Caveman covers chat replies only. Anything written to a file or for another reader (docs, READMEs, UI copy, emails, commit messages, PR text) uses the `writing` skill in normal prose. Preserve facts, caveats, exact quotations, code and identifiers. No jargon, in chat or in files: say what a thing does in plain words instead of coining labels, internal codes or shorthand the reader hasn't seen. If a new term is unavoidable, define it the first time.

## CRITICAL: Verification

This is the user's own Windows machine (Node 24), so local installs, builds and dev servers are real and the user can open a localhost server you start. The authoritative signals are a clean `npm run build` plus the check scripts in `.claude/reference/commands.md` (flows, axe, keyboard, overflow, Lighthouse with a recorded INP run), all on the production build in headed Chrome. No CI yet: generate `.github/workflows/ci.yml` with `node .claude/scripts/write-ci-workflow.mjs` (show the user, then `--write`).

Rules:

- Inspect logs / run scripts / read code yourself before claiming anything works.
- Never claim visual/UI verification you didn't actually perform.
- Can't run the authoritative check → flag the risk plainly, don't claim it passes.
- Visual/UI checks: headed Chrome on the real GPU, launched through `launchPlacedChrome()` (`scripts/lib/launch-chrome.mjs`). Never headless (WebGL falls back to the CPU), never minimized (rAF drops to 1 fps). Pass this rule into every subagent prompt that does browser work.
- Parallel or subagent browser work: each agent opens its own browser through `mcp__playwright-iso__*` (`--isolated`, any number at once) or `launchPlacedChrome()`. Never the shared playwright plugin or the app's Browser pane, which hold one browser and deadlock a second user.

## Core principles

- Plan before acting. Break large refactors into atomic steps.
- Reproduce bugs before fixing them.
- Scope discipline: No unrequested refactors, features, abstractions, or extra coding. Minimum complexity for the task at hand; don't regress performance.
- No unit tests or type tests unless the user asks.
- Solve generally. Never hard-code to pass specific tests. If a test or requirement is wrong, say so rather than work around it.
- Scratch work → `.tmp/` (gitignored). Promote to `scripts/` if reusable; otherwise delete.
- Durable project knowledge → `.claude/reference/` via `/recall save` (committed, travels to every machine and sandbox). Standing truths only: moments (PR numbers, branch names, task status, tool-version snapshots) rot and don't get saved. `/recall` and `.claude/reference/` replace Claude Code's built-in auto memory, which stays off (`"autoMemoryEnabled": false` in `.claude/settings.json`).
- Welcome correction. Confident-sounding mistakes happen; don't defend wrong answers. Weighty recommendations get a `/why` pressure-test before they're presented (caveman skill); the user can also run `/why` on any recommendation.
- Restraint is a feature. New kernel rules, skills, and reference entries must earn their place; prefer pruning stale content over accreting. More ≠ better; complex ≠ complicated. This file loads every turn: keep cross-cutting safety and process rules here, move area-specific detail to `.claude/reference/`, and never restate what the harness already injects (skills list, environment block, tool docs). See `/optimize-context`.

## Subagents

- Run independent work in parallel: when parts don't depend on each other's results or edit the same files (research across areas, separate reviews, changes to separate modules), start their subagents in one message instead of one after another. Keep dependent or overlapping work sequential, and give parallel writers separate files or worktrees.
- Omit `model` on subagent calls unless the user names one. The default is `CLAUDE_CODE_SUBAGENT_MODEL` when set, else the session model.

## Git: push on completion

- "Complete" = the requested change finished and verified to this environment's limits. On Complete: commit, push, and open or update the PR. Mid-task or exploratory work is NOT a commit trigger.
- Stage intentionally. Never blanket-commit unrelated changes.
- Before opening a PR, check for an existing one (`gh pr list --head <branch>`) and push to that instead.
- Merge PRs with **squash** by default (`gh pr merge --squash`); merge-commit or rebase only when the user explicitly asks.
- Never force-push or run destructive git operations without an explicit request.
- End commit messages with the standard `Co-Authored-By:` trailer.
- PowerShell quoting trap: embedded `"` inside a here-string argument gets mangled en route to native exes (git/gh) and splits the argument. For multiline commit messages / PR bodies, write the text to a `.tmp/` file and use `git commit -F <file>` / `gh pr create --body-file <file>`, or keep the message free of double quotes.

## Environment & deploy target

Host not chosen (see `docs/design-brief.md`, tech stack and open questions); no database or secrets yet. Any review deployment must be private (password or access control) and `noindex`, and placeholder phone numbers use the fictional 555-0100 to 555-0199 range. Ask before installing app-runtime dependencies; provide migrations as copy/paste-ready artifacts rather than running them blind. Choosing a host, publishing anything, and sending real texts or emails always need the user.

## Project reference library

Topical reference lives in `.claude/reference/`. Consult BEFORE non-trivial work in an unfamiliar area: `/recall <topic>` or read directly.

| File | Covers |
|---|---|
| `secrets.md` | Env var names + purpose |
| `architecture.md` | System flow, auth, state |
| `pitfalls.md` | Accumulated gotchas |
| `commands.md` | Build / dev / test commands |
| `tech-stack.md` | Non-default picks + why |
| `deployment.md` | Deploy target, artifacts |

New quirk bites → save it to `.claude/reference/pitfalls.md` before the task ends, without asking, when it cost a retry, a backed-out change, or a user correction and its cause is confirmed. Amend an existing entry over adding one. Other reference edits stay behind `/recall save`.

## Codex compatibility

Every skill in `.claude/skills/` has a standalone Codex version in `.agents/skills/`, registered `native` in `.agents/skill-modes.json`, or is registered `disabled` when it needs Claude-only tools. Adding or editing a skill updates its Codex version in the same change, with tools translated per `.agents/codex-tools.md`; never ship a generated adapter. For a `native` skill, once its port matches, run `node .claude/scripts/sync-codex-skills.mjs --baseline <name>` to record the reviewed Claude source; `disabled` skills skip this step. Then run `node .claude/scripts/sync-codex-skills.mjs --check`; it warns on drift or a missing registration, locally and in CI, and fails only on unreadable input. `AGENTS.md` owns Codex runtime safety.
