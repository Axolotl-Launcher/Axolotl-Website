# Axolotl Website

This repository is the official Axolotl Launcher website: a statically generated Nuxt 4.6 site using the Nuxt 5 compatibility preview (`future.compatibilityVersion: 5`), Vue 3.5, Tailwind CSS 4 and a small, site-owned component layer. Use spaces, never tabs. All source and tooling files are TypeScript (`.ts`); `pnpm lint` runs `scripts/check-typescript.ts` and rejects JavaScript files or Vue `<script>` blocks without `lang="ts"`.

The launcher itself (desktop app, release pipeline and announcement catalog) lives in [Axolotl-Launcher/Axolotl](https://github.com/Axolotl-Launcher/Axolotl). `releases/` is generated there and pushed here; do not edit it by hand.

## Instruction Routing

Read the applicable instruction files before editing, even when your session starts at the repository root.

| Changed area                    | Read                                                 |
| ------------------------------- | ---------------------------------------------------- |
| Agent instructions and Skills   | [.agents/AGENTS.md](.agents/AGENTS.md)               |
| Deployment and server operation | [deploy/](deploy/) and `scripts/activate-website.sh` |

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
- `content/docs/` — local Markdown (MDC) documentation, one directory per content locale.
- `content/articles/` — repository-authored Markdown. Legal pages are Vue routes under `app/pages/`.
- `i18n/locales/` — zh-CN and en-US UI messages (`en` is the URL prefix, `en-US` is the content locale).
- `public/` — static assets, favicons and the launcher demo build. `public/launcher-demo/` is fetched by `scripts/fetch-launcher-demo.ts` and ignored.
- `shared/` — types and constants shared by the site and build scripts.
- `scripts/check-media.ts` validates prerendered media references.
- `releases/` — generated release data. Do not edit.
- `deploy/` — OpenResty configuration for the production host.

## Knowledge Base

Documentation is repository-authored Markdown under `content/docs/<locale>/` and uses the native MDC pipeline:

- Each file keeps `title`, `description`, `locale`, `slug`, `group`, `order` and `updatedAt` in its frontmatter.
- `scripts/build-search-index.ts` indexes the local docs at build time.
- No documentation content is fetched from an external service; deployments only need the repository.
- Articles and legal documents remain repository-authored.

## Design and UI

Preserve the original design primitives: the pink brand scale, the light/dark/OLED surface ladders, the Inter-based fluid typography and the `data-theme` switching contract. New components should consume the semantic utilities generated from `app/assets/css/tokens.css` (`bg-surface-1`, `text-fg-muted`, `border-divider`, `text-section`, etc.) rather than hard-coded colours.

Prefer native platform capabilities (View Transitions, `<dialog>`, container queries, `color-mix()`, OKLCH-ready tokens) over dependencies. Keep client-side JavaScript small; the site should remain useful before hydration.

## Verification and Commits

- Run `pnpm fix` before committing and inspect the diff; it runs ESLint and Prettier.
- Before a release or PR, `pnpm prepr` runs lint, typecheck, tests and the production build.
- Every Agent commit must use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): `<type>[optional scope]: <description>`. Use lowercase types (`feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `style`, `revert`). Never add `[skip ci]` to a commit that changes the site, content or deployment.
- Do not commit generated artifacts (`.output`, `.nuxt`, `public/launcher-demo`, test results).
- A push to `main` that changes app/content/assets/config files deploys automatically; `.github/workflows/deploy-website.yml` builds, uploads and atomically activates the release.
