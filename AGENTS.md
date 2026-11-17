# Axolotl Website

This repository is the official Axolotl Launcher website: a statically generated Nuxt 4.6 site using the Nuxt 5 compatibility preview (`future.compatibilityVersion: 5`), Vue 3.5, Tailwind CSS 4 and a small, site-owned component layer. Use spaces, never tabs.

The launcher itself (desktop app, release pipeline and announcement catalog) lives in [Axolotl-Launcher/Axolotl](https://github.com/Axolotl-Launcher/Axolotl). `releases/` is generated there and pushed here; do not edit it by hand.

## Instruction Routing

Read the applicable instruction files before editing, even when your session starts at the repository root.

| Changed area                                             | Read                                                           |
| -------------------------------------------------------- | -------------------------------------------------------------- |
| Shared UI, layouts and DI contracts                      | [packages/ui/AGENTS.md](packages/ui/AGENTS.md)                 |
| API client                                               | [packages/api-client/AGENTS.md](packages/api-client/AGENTS.md) |
| Any frontend implementation                              | [Frontend development](standards/frontend/DEVELOPMENT.md)      |
| Agent instructions, Skills or their validation           | [.agents/AGENTS.md](.agents/AGENTS.md)                         |
| Agent delivery: commits, pushes, PRs, reviews, archiving | [REVIEW.md](REVIEW.md)                                         |
| Deployment and server operation                          | [deploy/](deploy/) and `scripts/activate-website.sh`           |

## Development

- `pnpm install --frozen-lockfile`
- `pnpm dev` for local development
- `pnpm build` for the static production build (`.output/public`); it runs `nuxt-link-checker` and the media guard
- `pnpm check:media` verifies every local image, font and social-preview reference in the prerendered output
- `pnpm test` for Vitest unit tests
- `pnpm typecheck`, `pnpm lint`, `pnpm fix`
- `pnpm test:e2e` builds and runs Playwright against the generated site; install browsers once with `pnpm exec playwright install chromium`
- `pnpm prepr` runs lint, typecheck, unit tests and the production build

Nuxt DevTools 4 is installed and enabled in development (`Shift` + `Alt` + `D`). Keep `future.compatibilityVersion: 5`; `experimental.nitroAutoImports` is a temporary compatibility exception for `@nuxtjs/i18n` 10.6.0 and should be removed once i18n supports the Nuxt 5 defaults.

The download page uses `@nuxtjs/device` for client-side OS detection. Static prerendering has no request user agent, so `device.defaultUserAgent` is pinned to Windows and the recommendation waits for hydration before switching. Supported desktop systems get a direct download CTA; mobile, crawler and unknown systems fall back to Windows.

Support tiers must not link to Afdian pages directly. Plan IDs and checkout URLs live in `shared/support.ts`; the page calls `/api/support/checkout/<plan>.json`, which is prerendered for static deployment and can validate plans at runtime with `NUXT_AFDIAN_USER_ID`/`NUXT_AFDIAN_TOKEN`.

Node and pnpm versions are pinned in `.nvmrc` and `package.json`. The user performs visual and interaction acceptance; do not run excessive browser automation unless requested.

## Structure

- `app/pages/` — file-based routes. Every public route must prerender because OpenResty serves static files only.
- `app/components/` — site components; `app/components/docs/` holds the knowledge-base shell.
- `app/assets/css/` — Tailwind 4 entry and the design tokens/themes. `tokens.css` and `themes.css` are the source of truth for the brand palette, surfaces and typography.
- `app/assets/icons/` — local brand SVGs for `nuxt-icons`, rendered with `<NuxtIcon name="…">`. UI icons use the Lucide set through `@nuxt/icon`.
- `app/utils/` and `app/composables/` — download resolution, i18n helpers, docs navigation and theme state.
- `content/docs/` — local MDX documentation, one directory per content locale.
- `content/articles/` — repository-authored Markdown. Legal pages are Vue routes under `app/pages/`.
- `i18n/locales/` — zh-CN and en-US UI messages (`en` is the URL prefix, `en-US` is the content locale).
- `public/` — static assets, favicons and the launcher demo build. `public/launcher-demo/` is fetched by `scripts/fetch-launcher-demo.mjs` and ignored.
- `shared/` — types and constants shared by the site and build scripts.
- `content/transformers/mdx.mjs` — feeds `.mdx` files through the MDC parser; `scripts/check-media.mjs` validates prerendered media references.
- `releases/` — generated release data. Do not edit.
- `deploy/` — OpenResty configuration for the production host.

## Knowledge Base
- **Read [REVIEW.md](REVIEW.md) before committing, pushing, opening a pull request or reviewing a change.** It is the single home for the delivery workflow: commit and trailer conventions, push preconditions, pull request content, review expectations and archiving. The rules in this section remain in force and refine it.
- Every commit created by an Agent must use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): `<type>[optional scope][!]: <description>`. This applies to ordinary commits, amended messages, merge commits, squash commits and reverts; replace Git's default message when necessary. Do not rewrite existing history just to normalize messages.
- Use a lowercase type matching the change: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `style` or `revert`. Use a concise scope when useful (for example `website`, `ui` or `agents`), and describe the actual change. Mark breaking changes with `!` or a `BREAKING CHANGE:` footer; explain their impact in the body.
- Never add `[skip ci]` to a commit that changes `releases/`, the site, its dependencies or its build: it also suppresses the deployment that a release-data push triggers. These message rules do not authorize a commit or history rewrite by themselves.
- Use existing package scripts and relevant tests during development; see [frontend validation and formatting](standards/frontend/DEVELOPMENT.md).
- Before a frontend commit, run the affected package's `fix` script (`pnpm fix` for the site, `pnpm --filter @modrinth/ui fix` for shared UI) as described in the frontend standard. Inspect the diff, preserve user changes, and stage corrected files without unrelated formatting changes.
- Run full pre-PR workflows only when explicitly requested. If the user indicates they are about to create a PR without requesting checks, ask whether to run them. Do not repeat them after each prompt.
- Pre-PR command: `pnpm prepr`. It runs the site lint and production build; run `pnpm test` and the affected vendored package's `lint` separately.

Documentation is repository-authored MDX under `content/docs/<locale>/`:

- Each file keeps `title`, `description`, `locale`, `slug`, `group`, `order` and `updatedAt` in its frontmatter.
- `content/transformers/mdx.mjs` teaches Nuxt Content to parse `.mdx` with the same MDC pipeline as `.md`.
- `scripts/build-search-index.mjs` indexes the local docs at build time.
- No documentation content is fetched from an external service; deployments only need the repository.
- Articles and legal documents remain repository-authored.
- Do not create unrelated scripts or documentation. Remove files created only for temporary verification after checks complete.
- Agent intermediate and archived artifacts — plans, specs, worklogs and captured evidence — belong in the ignored `.agents/plans/` and nowhere else, with descriptive filenames so a later session can find the plan it needs and restore that work's context. Never stage them with `git add -f` or otherwise bypass `.gitignore`; repository content is for code, configuration and maintained documentation.
- Avoid heading comments such as `=== Helper methods ===`. Use doc comments where helpful; add inline comments only when necessary to explain non-obvious behavior.
- Preserve exact source whitespace when editing; do not copy tool line numbers or display markers into source.

## Design and UI

Preserve the original design primitives: the pink brand scale, the light/dark/OLED surface ladders, the Inter-based fluid typography and the `data-theme` switching contract. New components should consume the semantic utilities generated from `app/assets/css/tokens.css` (`bg-surface-1`, `text-fg-muted`, `border-divider`, `text-section`, etc.) rather than hard-coded colours.

Prefer native platform capabilities (View Transitions, `<dialog>`, container queries, `color-mix()`, OKLCH-ready tokens) over dependencies. Keep client-side JavaScript small; the site should remain useful before hydration.

## Verification and Commits

- Run `pnpm fix` before committing and inspect the diff; it runs ESLint and Prettier.
- Before a release or PR, `pnpm prepr` runs lint, typecheck, tests and the production build.
- Every Agent commit must use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): `<type>[optional scope]: <description>`. Use lowercase types (`feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `style`, `revert`). Never add `[skip ci]` to a commit that changes the site, content or deployment.
- Do not commit generated artifacts (`.output`, `.nuxt`, `public/launcher-demo`, test results).
- A push to `main` that changes app/content/assets/config files deploys automatically; `.github/workflows/deploy-website.yml` builds, uploads and atomically activates the release.
