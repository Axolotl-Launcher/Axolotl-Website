# REVIEW.md — Agent commit, push, review and archiving discipline

> This file is the single home for **all Agent delivery work** in this repository: commits, pushes, pull requests, commit and PR messages, code review, self-review, workflow reuse and archiving of carried-over work.
> Read it before starting. It is used **together with** [AGENTS.md](AGENTS.md) and [.agents/AGENTS.md](.agents/AGENTS.md) and does not replace them; technical standards live under [standards/frontend/](standards/frontend/DEVELOPMENT.md), environment and site conventions in [README.md](README.md).
> The file was migrated from the same-named file in the Axolotl Launcher monorepo and keeps only the parts that apply to this website repository.

## 1. Scope and priority

- Applies to **all** delivery actions executed or assisted by an Agent in this repository, whether by the main Agent or by a delegated sub-agent.
- Priority: the operator's explicit instruction for the current action > this file > [AGENTS.md](AGENTS.md) and scoped instructions > [standards/](standards/frontend/DEVELOPMENT.md). On a conflict at the same level, **the more specific rule wins**.
- **This file is not implementation authorization.** It governs "how", not "what": a review request stays read-only, and skills ([.agents/skills/](.agents/skills/)) do not authorize implementation, dependency changes, commits, messages or remote actions.
- When an operator instruction conflicts with this file, the operator wins; **record that deviation in the delivery notes**.

## 2. Core principles

1. **Evidence over self-report.** Conclusions from sub-agents, external contributors and tool output are **self-reports, not facts**. Before reporting success, confirm it through read-only means up to a verifiable handle: file and line, command and exit code, remote SHA, HTTP status. If it cannot be confirmed, **say plainly that it could not be confirmed**.
2. **Distrust your own context.** Treat state in the context (file contents, branch, remotes, task progress) as possibly stale; verify it on the spot before acting or reporting on it, and trust the on-the-spot facts when they conflict.
3. **Attribute truthfully.** Do not blame the network, the environment or other people wrongly, and do not credit or blame the wrong source. Attribution needs a controlled comparison or historical evidence.
4. **Review before sending.** Any text that will land in an external system (PR body, review comment, issue, release notes, announcement) must be shown to the operator as the **final text to be sent** first; if the structure, wording or items change before it is sent, the authorization is void and the text must be re-submitted for review.
5. **Ask once when uncertain.** Ask first when the requirement is ambiguous, business context is needed, or the repository and documents cannot answer and a wrong guess would be costly; do not "guess first, change later".
6. **Delegate implementation, verify read-only.** Hand complex changes to sub-agents for parallel execution; the main Agent owns planning, review and acceptance. **Instruction files themselves** (this file, the `AGENTS.md` files) and release-type operations are maintained by the main Agent personally.
7. **One change at a time.** Do not bundle, do not fix things in passing, do not widen the scope; **record** out-of-scope problems instead of fixing them on the spot.

## 3. Commits

- **Message format**: always [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/); types, scopes and the use of `!`/`BREAKING CHANGE:` are defined in [AGENTS.md](AGENTS.md) under "Verification and Commits". This file does not repeat that table.
- **The body states the "why"**: the motivation, the misconception being corrected and the trade-offs taken. Do not write a changelog of "changed A, changed B" — that is `git show`'s job.
- **Run the gates that belong to the changed file type before committing**, not one blanket pass:
  - Frontend changes → the affected package's `fix` and `lint` (the site's `pnpm fix`, `pnpm lint`; shared packages through their matching `--filter` scripts), see [frontend development](standards/frontend/DEVELOPMENT.md). Frontend behavior changes also run that package's `test` (the site's `pnpm test`). Visual and interaction acceptance is performed by the operator; do not run excessive browser automation unless explicitly requested.
  - Agent instruction or skill changes → `pnpm check-agents`.
  - `_typos.toml` or bulk copy changes → verify spelling with `typos` (exclusion semantics in section 11); CI's Check spelling job runs the same check.
  - Build script changes → run `pnpm build` once to prove the pipeline works (the two build scripts' failure semantics are in section 11).
- **Stage only your own paths**: use `git add <specific paths>`. When other Agents or the user may be changing the same working tree, **never** use `git add -A` or `git add .`; before committing, confirm with `git show --name-only HEAD` that the committed files match the intent.
- **One commit does one thing**; documentation changes are committed separately from code changes; **never rewrite pushed history just to normalize it**.
- **`[skip ci]`**: the repository rule is in [AGENTS.md](AGENTS.md) — commits that change `releases/`, the site, its dependencies or its build **never** use it (it also skips the deployment that a release-data push triggers); other commits may append it after the conventional prefix when needed, for example `docs(agents): … [skip ci]`.
- Before committing, confirm the working tree contains **no** other people's in-flight changes; if it does, stop and ask instead of deciding for them.

## 4. Trailers

Format `Token: Name <email>`, placed at the **end of the commit message body** (`BREAKING CHANGE:` excepted, as it is part of the body). By purpose:

- **Attribution and credit**: `Signed-off-by` (DCO sign-off), `Co-authored-by` / `Co-developed-by` (co-authors), `Suggested-by` / `Helped-by` / `Mentored-by` / `Thanks-to` (ideas and help), `Based-on-patch-by` (derived from someone else's patch).
- **Provenance and verification**: `Reported-by` (issue reporter, for fix commits), `Tested-by`, `Reviewed-by`, `Acked-by`.
- **Tracking**: `Fixes`, `Closes`, `Resolves`, `Link`, `Cc`, `Bug`.
- **Process**: `BREAKING CHANGE:`, `Release-As`, `Change-Id`.
- **AI participation**: `Assisted-by` (declares AI assistance), `Acted-By` (the human operator).

Requirements:

- **Follow the repository's existing habits**; do not invent another scheme. AI-assisted commits use `Assisted-by: Codex` or `Assisted-by: Claude <noreply@anthropic.com>`; the operator uses `Acted-By` with the `git config` identity; closing issues follows the upstream repository habit — `fixed #N` in the commit body, `Fixes #N` in the PR body.
- Cite other people's work **truthfully**: `Reported-by` for reporters, `Co-authored-by` for co-authors; never present an external source as your own.
- Names and email addresses must come from **known sources** (`git config`, the other party's commit records); never guess or invent them.

## 5. Pushing

Preconditions (**all are required**):

1. The working tree is clean and contains only the commits about to be pushed;
2. The relevant gates have been run and pass (section 3);
3. The target state has been verified read-only: the remote's current tip and how this commit relates to it.

Flow:

```sh
git fetch origin main --prune
git rebase origin/main          # resolve conflicts; never hide them with a merge
git push origin HEAD:main
git fetch origin main --prune   # read back
git rev-parse origin/main       # must equal the local HEAD
```

- **Always read back and compare**: reporting "pushed" without comparing the remote SHA is not done.
- **When the remote was force-pushed** (`forced update`), first verify whether the new tip still contains your base and overlaps your files, then decide between rebasing and abandoning; never `--force` blindly.
- **Pushing is an external, irreversible action**; the main Agent performs it personally and never delegates it.
- After a pushed problem is found, the correct fix is a **follow-up fix commit**, not rewriting pushed history.

## 6. Opening pull requests

- The operator's own changes **go straight to main by default** (the repository's existing habit; release data is pushed by a bot). Open a PR only for: external contributor submissions, an independent review, CI backing before the merge, or an operator request.
- The repository has **no PR template**, so the body follows a fixed structure:
  1. **Motivation**: the problem being solved and the linked issue (`Fixes #N`);
  2. **Changes**: listed by subsystem, with the trade-offs;
  3. **Verification evidence**: command and real exit code per item, including mutation verification (broken must fail, restored must pass);
  4. **Unverified items**: honestly list what was not run, tested or reviewed;
  5. **Risk and rollback**: the blast radius and how to revert.
- Titles use Conventional Commits; wording matches the repository and **does not put on a show** (no unrequested sections, suggestion blocks, timelines or self-description).
- **Review before sending**: any text that lands on GitHub (including review comments and inline comments) must be shown to the operator as final text first.
- Before merging someone else's PR, run a **side-effect-free conflict rehearsal** (`git merge-tree --write-tree --name-only origin/main <ref>`) and verify whether its CI conclusions were caused by this change; do not pin your breakage on someone else, and do not speak for them in the PR.

## 7. Reviewing code changes

- **A review request stays read-only**; a review does not imply authorization to implement.
- A review covers at least: whether contracts and interfaces are broken, boundaries and error paths, concurrency and races, brand-name compliance, i18n (`src/locales/` and shared package messages), whether gate coverage is sufficient, and whether the change actually solves the stated problem.
- **Conclusions need evidence**: give `file:line` and a reproduction command; "looks fine to me" is not a conclusion.
- **Independently verify** other people's and sub-agents' conclusions (section 2.1). Prefer **controlled comparisons**: re-run on a clean baseline, reproduce through a different entry point, or use mutation verification.
- **Require mutation verification**: every new guard (test, assertion, gate) must be proven **able to fail** — break the guarded object, the guard must report; restore it, the guard must pass.
- **Distinguish "passes" from "prevents"**: local green does not mean CI is stable; for known-flaky gates, state the local-versus-CI difference and never claim CI is fixed based on local results.
- When you find your own judgment was wrong, **correct it on the spot** and write the correction into the archive (section 10).

## 8. Self-review before delivery

Ask yourself before delivering:

- Which files did I actually change? Does that match the plan? Did I sweep in anyone else's in-flight changes?
- Which gates did I run? What were the exit codes? Did I "run but not read" any result?
- Is there a counterexample to my conclusion? Did I treat "local pass" as "CI pass"?
- Did I treat any single source's conclusion as a fact?
- **What could I not verify?** (This must appear in the delivery notes and must not be omitted.)

When you find a mistake: correct the conclusion → explain what the earlier statement got wrong → record it in the archive. **Do not** quietly change the conclusion and leave no trace.

## 9. Reusing workflows

- Prefer the existing assets: the project skills under [.agents/skills/](.agents/skills/), the technical standards under [standards/](standards/frontend/DEVELOPMENT.md), and the existing `pnpm` scripts (`check-agents`, `fix`, `lint`, `test`, `build`, `prepr`).
- **Do not create long-term scripts for one-off verification**; clean up temporary artifacts when finishing, and write intermediate and archived artifacts to `.agents/plans/` (see section 10).
- Proven reusable procedures:
  - **Worktree isolation**: give each parallel task its own worktree so they do not overwrite each other.
  - **One writer per worktree**: only one Agent may write a given worktree at a time; `rebase`/`stash`/`checkout` wipe other people's in-flight changes, so stop other writers before running them.
  - **Close mutation verification with `try/finally`**: even a failure mid-way must not leave the broken code in the tree.
  - **Restore files from git objects with shell redirection** (`git show <ref>:<path> > <path>`); do not use a write path that rewrites line endings.

## 10. Archiving carried-over work

- The archive home is **only** `.agents/plans/` (the directory is ignored); **never** `git add -f` or otherwise bypass `.gitignore`.
- Filenames must be descriptive so a later session can restore the work context from them.
- An archive entry must contain: **symptom → evidence → root cause → action → open items**. Evidence gives reproducible commands or file paths.
- **Open items must be handled explicitly**: either close them with the reason, or mark them "awaiting decision" and state who must decide what. **Never leave them silently.**
- To track several open items across sessions, keep a **ledger** file (in the same directory) recording number, status, evidence and blockers per item, and update it after each round of work.
- When restoring context, read the archive first, then **verify on the spot** that the state it records still holds (section 2.2).

## 11. Confirmed tool facts (this repository)

Each item is a criterion obtained from this repository's actual behavior or current configuration:

- **Instruction validation scope**: `pnpm check-agents` validates only the files listed in `trackedGuidance` in [scripts/check-agents.mjs](scripts/check-agents.mjs) (the `AGENTS.md` files, `.agents/`, `standards/`, `.github/instructions/` and the root `REVIEW.md`); add a new root instruction file there.
- **Frontend gate split**: ESLint ignores `scripts/**` and `packages/**` (vendored packages run their own `lint`); Prettier checks every file not ignored by `.gitignore`. `pnpm fix` writes formatting; `pnpm lint` is read-only.
- **typos exclusion semantics**: to judge whether an exclusion applies you must run `typos` **without path arguments**; to check a specific path against the exclusion rules add `--force-exclude` (an explicit path bypasses `extend-exclude`). CI's Check spelling job invokes it without paths.
- **Dependency install threshold**: [pnpm-workspace.yaml](pnpm-workspace.yaml) sets `minimumReleaseAge: 10080` (7 days), so versions inside the window are rejected by the repository's own gate; the only workaround is the request-level `--config.minimumReleaseAgeExclude`, never a repository setting change.
- **Build script failure semantics**: `scripts/fetch-launcher-demo.mjs` and `scripts/generate-contributors.mjs` exit with code 1 on failure in CI (the `CI` environment variable) and only warn locally while keeping the existing artifacts; contributor data and avatars are cached in `.cache/contributors-img/` for 3 days.
