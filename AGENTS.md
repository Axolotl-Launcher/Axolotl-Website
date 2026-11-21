# Axolotl Website

This repository is the official Axolotl Launcher website: a hybrid Nuxt 4.6 site using the Nuxt 5 compatibility preview (`future.compatibilityVersion: 5`), Vue 3.5, Tailwind CSS 4 and a small, site-owned component layer. Public pages are prerendered; Nuxt Studio and API routes run on the Nitro Node service. Use spaces, never tabs. All source and tooling files are TypeScript (`.ts`); `pnpm lint` runs `scripts/check-typescript.ts` and rejects JavaScript files or Vue `<script>` blocks without `lang="ts"`.

The launcher itself (desktop app, release pipeline and announcement catalog) lives in [Axolotl-Launcher/Axolotl](https://github.com/Axolotl-Launcher/Axolotl). `releases/` is generated there and pushed here; do not edit it by hand.

## Instruction Routing

Read the applicable instruction files before editing, even when your session starts at the repository root.

| Changed area                                             | Read                                                 |
| -------------------------------------------------------- | ---------------------------------------------------- |
| Any frontend implementation                              | [README.md](README.md) and [REVIEW.md](REVIEW.md)    |
| Agent instructions, Skills or their validation           | [.agents/AGENTS.md](.agents/AGENTS.md)               |
| Agent delivery: commits, pushes, PRs, reviews, archiving | [REVIEW.md](REVIEW.md)                               |
| Deployment and server operation                          | [deploy/](deploy/) and `scripts/activate-website.sh` |

## Development

- `pnpm install --frozen-lockfile`
- `pnpm dev` for local development
- `pnpm build` for the production build: prerendered files in `.output/public` and the Nitro server bundle in `.output/server`; it runs `nuxt-link-checker` and the media guard
- `pnpm preview` runs the built Nitro server locally
- `pnpm check:media` verifies every local image, font and social-preview reference in the prerendered output
- `pnpm test` for Vitest unit tests
- `pnpm typecheck`, `pnpm lint`, `pnpm fix`
- `pnpm check:knip` fails on unused files, exports and dependencies; it runs as a CI gate
- `pnpm test:e2e` builds and runs Playwright against the prerendered public pages; install browsers once with `pnpm exec playwright install chromium`
- `pnpm prepr` runs lint, the Knip unused-code gate, typecheck, unit tests and the production build

Nuxt DevTools 4 is installed and enabled in development (`Shift` + `Alt` + `D`). Keep `future.compatibilityVersion: 5`.

The download page uses `@nuxtjs/device` for client-side OS detection. Static prerendering has no request user agent, so `device.defaultUserAgent` is pinned to Windows and the recommendation waits for hydration before switching. Supported desktop systems get a direct download CTA; mobile, crawler and unknown systems fall back to Windows.

Support tiers must not link to Afdian pages directly. Plan IDs and checkout URLs live in `shared/support.ts`; the page calls `/api/support/checkout/<plan>.json`. The three JSON responses are prerendered and served directly by OpenResty, while the Nitro route can validate plans with `NUXT_AFDIAN_USER_ID`/`NUXT_AFDIAN_TOKEN`.

Node and pnpm versions are pinned in `.nvmrc` and `package.json`. The user performs visual and interaction acceptance; do not run excessive browser automation unless requested.

## Structure

- `app/pages/` — file-based routes. Public routes are prerendered; `/_studio` and `/api` are served by Node and must stay out of prerender, robots and sitemap.
- `app/components/` — site components; `app/components/docs/` holds the knowledge-base shell.
- `app/assets/css/` — Tailwind 4 entry and the design tokens/themes. `tokens.css` and `themes.css` are the source of truth for the brand palette, surfaces and typography.
- `app/assets/icons/` — local brand SVGs for `nuxt-icons`, rendered with `<NuxtIcon name="…">`. UI icons use the Lucide set through `@nuxt/icon`.
- `app/utils/` and `app/composables/` — download resolution, i18n helpers, docs navigation and theme state.
- `content/docs/` — local Markdown documentation, one directory per content locale.
- `content.config.ts` — Nuxt Content collections and Studio form schemas for docs and blog posts.
- `server/` — Nitro API routes.
- `i18n/locales/` — zh-CN and en-US UI messages (`en` is the URL prefix, `en-US` is the content locale).
- `public/` — static assets, favicons and the launcher demo build. `public/launcher-demo/` is fetched by `scripts/fetch-launcher-demo.ts` and ignored.
- `shared/` — types and constants shared by the site and build scripts.
- `scripts/check-media.ts` validates prerendered media references.
- `releases/` — generated release data. Do not edit.
- `deploy/` — OpenResty and systemd configuration for the production host.

## Content and Studio

- **Read [REVIEW.md](REVIEW.md) before committing, pushing, opening a pull request or reviewing a change.** It is the single home for the delivery workflow: commit and trailer conventions, push preconditions, pull request content, review expectations and archiving. The rules in this section remain in force and refine it.
- Every commit created by an Agent must use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): `<type>[optional scope][!]: <description>`. This applies to ordinary commits, amended messages, merge commits, squash commits and reverts; replace Git's default message when necessary. Do not rewrite existing history just to normalize messages.
- Use a lowercase type matching the change: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `style` or `revert`. Use a concise scope when useful, and describe the actual change. Mark breaking changes with `!` or a `BREAKING CHANGE:` footer; explain their impact in the body.
- Never add `[skip ci]` to a commit that changes `releases/`, the site, its dependencies or its build: it also suppresses the deployment that a release-data push triggers. These message rules do not authorize a commit or history rewrite by themselves.
- Use existing package scripts and relevant tests during development; see the Development section above.
- Before a frontend commit, run `pnpm fix`; inspect the diff, preserve user changes, and stage corrected files without unrelated formatting changes.
- Run full pre-PR workflows only when explicitly requested. If the user indicates they are about to create a PR without requesting checks, ask whether to run them. Do not repeat them after each prompt.
- Pre-PR command: `pnpm prepr`. It runs the site lint, Knip, typecheck, tests and production build.

Documentation is repository-authored Markdown under `content/docs/<locale>/`; blog posts are `content/blog/<locale>/<slug>.md`, one canonical file per post. Both are Nuxt Content collections defined in `content.config.ts` and edited through Studio at `/_studio`. The `/blog` page is the only blog list:

- Each docs file keeps `title`, `description`, `locale`, `slug`, `group`, `order` and `updatedAt` in its frontmatter.
- Nuxt Content uses its own Zod 3 export in `content.config.ts`. Do not import app-level schemas into it.
- The public docs page queries the collection and renders `rawbody` with Comark, preserving the TOC and Shiki plugins.
- Studio keeps unpublished edits as browser-local drafts, detects conflicts against Git, and publishes all changed files as a Git commit to the configured branch.
- Blog history is Git history. Do not add timestamped copies of posts, a generated blog index, or a custom publish endpoint; the article links to the file's GitHub commit history.
- `scripts/build-search-index.ts` indexes the local docs at build time.
- No documentation content is fetched from an external service; deployments only need the repository.
- Articles and legal documents remain repository-authored.
- Do not create unrelated scripts or documentation. Remove files created only for temporary verification after checks complete.
- Agent intermediate and archived artifacts — plans, specs, worklogs and captured evidence — belong in the ignored `.agents/plans/` and nowhere else, with descriptive filenames so a later session can find the plan it needs and restore that work's context. Never stage them with `git add -f` or otherwise bypass `.gitignore`; repository content is for code, configuration and maintained documentation.
- Avoid heading comments such as `=== Helper methods ===`. Use doc comments where helpful; add inline comments only when necessary to explain non-obvious behavior.
- Preserve exact source whitespace when editing; do not copy tool line numbers or display markers into source.

## Design and UI

Preserve the original design primitives: the pink brand scale, the light/dark/OLED surface ladders, the Inter-based fluid typography and the `data-theme` switching contract. New components should consume the semantic utilities generated from `app/assets/css/tokens.css` (`bg-surface-1`, `text-fg-muted`, `border-divider`, `text-section`, etc.) rather than hard-coded colours.

Use `@vueuse/core` for browser APIs (event listeners, media queries, storage, observers, timers) instead of hand-written `addEventListener`, `matchMedia`, `localStorage` or observer code. Ultracite provides the formatter base; `pnpm check` runs its CLI.

Prefer native platform capabilities (View Transitions, `<dialog>`, container queries, `color-mix()`, OKLCH-ready tokens) over dependencies. Keep client-side JavaScript small; the site should remain useful before hydration.

## Deployment

- Do not commit generated artifacts (`.output`, `.nuxt`, `public/launcher-demo`, test results).
- A push to `main` that changes app/content/deploy/assets/config files deploys automatically; `.github/workflows/deploy-website.yml` builds `.output`, uploads both `server/` and `public/`, and atomically activates the release before restarting `axlmc-website`.
