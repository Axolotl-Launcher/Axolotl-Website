# Axolotl Website

The official website for [Axolotl Launcher](https://axlmc.org), built as a statically generated Nuxt 4 site.

## Stack

- Nuxt 4.6 with the static preset, Vue 3.5 and TypeScript
- Nuxt 5 compatibility preview (`future.compatibilityVersion: 5`): Vite Environment API, case-sensitive routing, typed routes and client payload extraction
- Tailwind CSS 4 with site-owned design tokens (light, dark and OLED themes)
- `@nuxt/content` for articles and local MDX documentation
- `@nuxtjs/mdc` for MDC parsing, prose components and runtime Markdown rendering
- `@nuxt/icon` with the Lucide set for UI icons, plus `nuxt-icons` for local brand SVGs in `app/assets/icons`
- `@nuxtjs/i18n` with `zh-CN` (default, no prefix) and `en` (`/en/*`)
- `@nuxtjs/seo` for sitemaps, robots and `llms.txt`
- `@nuxt/devtools` 4.1.0 with the component inspector, data inspector, timeline and Vite inspect
- `@nuxtjs/device` for visitor OS detection; unsupported devices fall back to the Windows download
- Native HTML dialogs, popovers and view transitions (no component library)

`experimental.nitroAutoImports` stays enabled because `@nuxtjs/i18n` 10.6.0 still imports `useRuntimeConfig` from Nitro's `#imports`; remove it once i18n supports the Nuxt 5 defaults.

DevTools 4 requires Vite 8 and therefore Nuxt 4.5+. It only exists in development; press `Shift` + `Alt` + `D` in the browser to open it.

## Development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Useful checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check:media
pnpm exec playwright install chromium
pnpm test:e2e
```

The production build is written to `.output/public` and served by OpenResty. Every route must be prerendered; there is no SPA fallback. `pnpm build` fails on broken internal links (`nuxt-link-checker`) and on missing local media references (`scripts/check-media.mjs`).

## Support checkout

Support tiers never link to Afdian plan pages directly. The page requests a checkout URL from `/api/support/checkout/<plan>.json`, and the endpoint returns the official Afdian `order/create` URL. Static builds prerender those JSON responses, so the feature works on OpenResty without a server process; a runtime Nitro or serverless deployment can additionally validate plan IDs against Afdian's `query-plan` API using `NUXT_AFDIAN_USER_ID` and `NUXT_AFDIAN_TOKEN`.

Set `NUXT_AFDIAN_USER_ID` and `NUXT_AFDIAN_TOKEN` in `.env` (or the deployment environment) to enable validation. Without them the endpoint returns the configured checkout URLs and reports `validated: false`. The OpenResty config serves the API directory as JSON.

## Documentation

Docs are local MDX files under `content/docs/<locale>/` and are rendered by `@nuxt/content`. Each file keeps its navigation metadata in frontmatter (`title`, `description`, `locale`, `slug`, `group`, `order`, `updatedAt`). Add or edit the file, then run `pnpm build`; `scripts/build-search-index.mjs` indexes it automatically. No external knowledge base or credentials are involved.

Articles are normal Markdown under `content/articles`. Legal pages are maintained as Vue pages in `app/pages` so their wording is reviewed in code.
Review the new PNGs before committing them: `--update-snapshots` rewrites a
baseline from whatever the current build renders, including a regression.

No workflow runs the end-to-end suite yet. If you add one on `ubuntu-latest`,
record the Linux baselines on Linux first, using the Playwright version pinned in
`package.json` so the recording machine and the runner agree
(`mcr.microsoft.com/playwright:v<version>-noble` is the matching image). Never
share one `node_modules` between a Linux and a Windows checkout.

## Launcher demo

`/demo` frames the launcher frontend's web demo build, which each launcher
release attaches as `Axolotl_Launcher_<version>_web_demo.zip`. `pnpm dev` and
`pnpm build` first run `scripts/fetch-launcher-demo.mjs`: it downloads the
package of the latest stable release (or, when that has none, of the newest
earlier stable release that has one), checks it against the asset's SHA-256
digest and unpacks it into the ignored `src/public/launcher-demo/<version>/`,
downloading again only when a newer release ships one. When no stable release
has a package, `/demo` shows a download link instead.

- `GITHUB_TOKEN` authenticates the release lookup. Without it, GitHub allows 60
  lookups an hour per IP address.
- `AXOLOTL_WEB_DEMO=<path>` uses a local build instead: the launcher
  repository's `apps/app-frontend/demo/dist` (built there with
  `node node_modules/vite/bin/vite.js build --config demo/vite.config.ts`) or a
  package `.zip`. `AXOLOTL_WEB_DEMO=off` uses none.
- A failed lookup or download fails the build in CI. Elsewhere it only warns,
  and `/demo` keeps the package it already has, if any.

## Contributors card

`pnpm dev` and `pnpm build` also run `scripts/generate-contributors.mjs`, a
build-time rewrite of
[Axolotl-Launcher/contributors-img](https://github.com/Axolotl-Launcher/contributors-img).
It fetches the contributors of `Axolotl-Launcher/Axolotl` from the GitHub API,
strips the former contributors listed in `scripts/former-contributors.json`
(vendored from that service), inlines every avatar as a data URL and writes the
SVG card to the ignored `src/public/contributors.svg`, served at
`/contributors.svg`.

- `GITHUB_TOKEN` authenticates the contributor lookup. Without it, GitHub allows
  60 requests an hour per IP address.
- Contributor data and avatars are cached in `.cache/contributors-img/` for three
  days, so repeated builds do not refetch them.
- `AXOLOTL_CONTRIBUTORS_REPO=owner/name` renders another repository.
  `AXOLOTL_CONTRIBUTORS_MAX`, `AXOLOTL_CONTRIBUTORS_COLUMNS` and
  `AXOLOTL_CONTRIBUTORS_ANON=true` mirror the service's `max`, `columns` and
  `anon` parameters (defaults 100, 12 and false).
  `FORMER_CONTRIBUTORS_FILE` overrides the vendored exclusion list.
  `AXOLOTL_CONTRIBUTORS=off` skips generation.
- A failed lookup or download fails the build in CI. Elsewhere it only warns,
  and the site keeps the card it already has, if any.

## Release data

`releases/catalog.json` (changelog announcements) and `releases/latest.json`
(latest stable tag and asset checksums) are generated files owned by the launcher
repository. Do not edit them here.

After every published `v*` release, the launcher repository's
`sync-website-release-data.yml` workflow:

1. Generates `releases/catalog.json` from the launcher's
   `apps/app-frontend/src/announcements/catalog.ts` at the released tag, so
   announcements written ahead of a release stay off the site. Stable releases
   also update `releases/latest.json`; beta releases preserve it.
2. Commits the files to `main` here as **Axolotl Release Bot** when they changed.
   Unchanged data creates no commit.
3. That push triggers the production deployment below. When a release is
   resumed with unchanged data, the workflow dispatches the deployment instead.

## Deployment

A push to `main` that changes the site, content, assets, scripts or configuration triggers `.github/workflows/deploy-website.yml`. It runs checks, builds the static site, uploads it to the server and atomically switches the `current` symlink. Release data under `releases/` is generated by the launcher repository and also triggers a deployment.

## Design

The visual language is defined in `app/assets/css/tokens.css` and `app/assets/css/themes.css`: the pink brand scale, the three surface ladders, Inter typography and the `data-theme` contract. Keep new UI on those semantic tokens instead of one-off colours.
