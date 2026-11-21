# Axolotl Website

The official website for [Axolotl Launcher](https://axlmc.org). It is a hybrid Nuxt 4 site: public pages are prerendered at build time, while Nuxt Studio and API routes run on a small Nitro Node service.

## Stack

- Nuxt 4.6, Vue 3.5 and TypeScript
- Nuxt 5 compatibility preview (`future.compatibilityVersion: 5`): Vite Environment API, case-sensitive routing, typed routes and client payload extraction
- Tailwind CSS 4 with site-owned design tokens (light, dark and OLED themes)
- `@nuxt/content` collections for documentation and blog posts
- `nuxt-studio` at `/_studio`, publishing through GitHub OAuth
- `@comark/vue` for Markdown parsing and component rendering
- `@vueuse/core` for browser utilities
- `ultracite` for the formatter base and the `pnpm check` wrapper
- `@nuxt/icon` with the Lucide set for UI icons, plus `nuxt-icons` for local brand SVGs in `app/assets/icons`
- `@nuxtjs/i18n` with `zh-CN` (default, no prefix) and `en` (`/en/*`)
- `@nuxtjs/seo` for sitemaps, robots and `llms.txt`
- `@nuxt/devtools` 4.1.0 with the component inspector, data inspector, timeline and Vite inspect
- `@nuxtjs/device` for visitor OS detection; unsupported devices fall back to the Windows download
- Native HTML dialogs, popovers and view transitions (no component library)

### Module choices

- `@nuxt/content` owns the content database and collection schemas in `content.config.ts`. Nuxt Studio edits those collections; the public docs page keeps rendering raw Markdown with `@comark/vue`, including its TOC and Shiki plugins.
- `nuxt-studio` must run on a live Nitro server for OAuth, sessions and Git writes. The public pages remain prerendered, but `/_studio` and `/__nuxt_studio/*` are server-rendered and excluded from search indexes and the sitemap.
- `motion-v/nuxt`, `nuxt-lenis`, `nuxt-icons`, `@vueuse/nuxt`, `@nuxt/image`, `@nuxt/icon`, `@nuxtjs/device`, `@nuxtjs/i18n` and `@nuxtjs/seo` are consumed as Nuxt modules.
- Carousels and dates use native elements and `Intl.DateTimeFormat`; no Swiper or dayjs plugin is registered.
- Tailwind CSS 4 uses `@tailwindcss/vite`, the supported Nuxt 4 integration; the older Nuxt Tailwind module targets the previous setup.

DevTools 4 requires Vite 8 and therefore Nuxt 4.5+. It only exists in development; press `Shift` + `Alt` + `D` in the browser to open it.

## Development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev` regenerates the search index and fetches the launcher demo before starting Nuxt. For local Studio sign-in, copy `.env.example` to `.env`; Nuxt reads that file and Git ignores it. All source and tooling files are TypeScript; `pnpm lint` enforces this with `scripts/check-typescript.ts`.

Useful checks:

```bash
pnpm lint
pnpm check:knip
pnpm typecheck
pnpm test
pnpm build
pnpm check:media
pnpm exec playwright install chromium
pnpm test:e2e
```

`pnpm build` writes both halves of the deployment to `.output`: prerendered HTML and assets in `.output/public`, and the Nitro Node bundle in `.output/server`. `pnpm preview` runs the Node server locally. The build fails on broken internal links (`nuxt-link-checker`) and on missing local media references (`scripts/check-media.ts`).

## Studio and content workflow

The collections are defined in `content.config.ts`:

- `docs` — `content/docs/<locale>/*.md`
- `blog` — `content/blog/<locale>/<slug>.md`, one canonical file per post; `/blog` is the only blog list

The public site reads docs and blog posts through `queryCollection`.

Editors sign in at `/_studio` with GitHub. Register both callback URLs on the OAuth App: `https://axlmc.org/__nuxt_studio/auth/github` and `http://localhost:3000/__nuxt_studio/auth/github`. Only addresses in `NUXT_STUDIO_AUTH_GITHUB_MODERATORS` may publish. Studio commits Markdown back to the repository; the push triggers the normal CI build and deploy.

### Writing a blog post

Create a file in `content/blog/<locale>/` from Studio's document menu, or edit an existing post. Use a lowercase kebab-case slug as the filename and keep `title`, `description`, `locale`, `publishedAt`, `updatedAt`, `authors`, `tags`, `cover`, `draft` and `sponsored` in the frontmatter.

Studio saves unpublished edits as browser-local drafts, checks them against Git, and publishes all changed files as one commit. Previous revisions are Git commits; the article links to its GitHub commit history.

## Support checkout

Support tiers never link to Afdian plan pages directly. The page requests a checkout URL from `/api/support/checkout/<plan>.json`, and the endpoint returns the official Afdian `order/create` URL. The three static JSON responses are prerendered and served directly by OpenResty; the Nitro route remains available for plans that need runtime validation with `NUXT_AFDIAN_USER_ID`/`NUXT_AFDIAN_TOKEN`.

## Launcher demo

`/demo` frames the launcher frontend's web demo build, which each launcher release attaches as `Axolotl_Launcher_<version>_web_demo.zip`. `pnpm dev` and `pnpm build` first run `scripts/fetch-launcher-demo.ts`: it downloads the package of the latest stable release (or, when that has none, of the newest earlier stable release that has one), checks it against the asset's SHA-256 digest and unpacks it into the ignored `public/launcher-demo/<version>/`, downloading again only when a newer release ships one. When no stable release has a package, `/demo` shows a download link instead.

- `GITHUB_TOKEN` authenticates the release lookup. Without it, GitHub allows 60 lookups an hour per IP address.
- `AXOLOTL_WEB_DEMO=<path>` uses a local build instead: the launcher repository's `apps/app-frontend/demo/dist` (built there with `node node_modules/vite/bin/vite.js build --config demo/vite.config.ts`) or a package `.zip`. `AXOLOTL_WEB_DEMO=off` uses none.
- A failed lookup or download fails the build in CI. Elsewhere it only warns, and `/demo` keeps the package it already has, if any.

## Contributors card

`pnpm dev` and `pnpm build` also run `scripts/generate-contributors.ts`, a build-time rewrite of [Axolotl-Launcher/contributors-img](https://github.com/Axolotl-Launcher/contributors-img). It fetches the contributors of `Axolotl-Launcher/Axolotl` from the GitHub API, strips the former contributors listed in `scripts/former-contributors.json` (vendored from that service), inlines every avatar as a data URL and writes the SVG card to the ignored `public/contributors.svg`, served at `/contributors.svg`.

- `GITHUB_TOKEN` authenticates the contributor lookup. Without it, GitHub allows 60 requests an hour per IP address.
- Contributor data and avatars are cached in `.cache/contributors-img/` for three days, so repeated builds do not refetch them.
- `AXOLOTL_CONTRIBUTORS_REPO=owner/name` renders another repository. `AXOLOTL_CONTRIBUTORS_MAX`, `AXOLOTL_CONTRIBUTORS_COLUMNS` and `AXOLOTL_CONTRIBUTORS_ANON=true` mirror the service's `max`, `columns` and `anon` parameters (defaults 100, 12 and false). `FORMER_CONTRIBUTORS_FILE` overrides the vendored exclusion list. `AXOLOTL_CONTRIBUTORS=off` skips generation.
- A failed lookup or download fails the build in CI. Elsewhere it only warns, and the site keeps the card it already has, if any.

## Release data

`releases/catalog.json` (changelog announcements) and `releases/latest.json` (latest stable tag and asset checksums) are generated files owned by the launcher repository. Do not edit them here.

After every published `v*` release, the launcher repository's `sync-website-release-data.yml` workflow:

1. Generates `releases/catalog.json` from the launcher's `apps/app-frontend/src/announcements/catalog.ts` at the released tag, so announcements written ahead of a release stay off the site. Stable releases also update `releases/latest.json`; beta releases preserve it.
2. Commits the files to `main` here as **Axolotl Release Bot** when they changed. Unchanged data creates no commit.
3. That push triggers the production deployment below. When a release is resumed with unchanged data, the workflow dispatches the deployment instead.

## Deployment

The production host runs OpenResty in front of the `axlmc-website` systemd service.

1. Install the service: copy `deploy/systemd/axlmc-website.service` to `/etc/systemd/system/`, then run `systemctl daemon-reload`.
2. Create `/etc/axlmc-website.env` (mode `600`) for optional values such as `NUXT_AFDIAN_USER_ID`/`NUXT_AFDIAN_TOKEN`. Studio OAuth values are managed separately.
3. Create a GitHub OAuth App with the callback above, then add these repository values:
   - variable `NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID`
   - variable `NUXT_STUDIO_AUTH_GITHUB_MODERATORS` (comma-separated emails)
   - secret `NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET`
   - secret `NUXT_STUDIO_AUTH_SESSION_SECRET`

   The deploy workflow writes them to `/www/wwwroot/axlmc.org/studio.env`, which the systemd unit reads after `/etc/axlmc-website.env`.

4. Allow the deployment user to restart the service without a password, for example with a sudoers rule limited to `systemctl restart axlmc-website`.
5. Install `deploy/openresty/axlmc.org.conf` and reload OpenResty, then run the first deploy.
6. Confirm the release is active and the Node service is healthy. Prerendered files are served from `current/public`, Studio/API requests proxy to `127.0.0.1:3000`, and unknown routes fall back to Nitro.
7. `systemctl enable --now axlmc-website` once the first release is active.

`scripts/activate-website.sh` validates the new release, switches the `current` symlink, restarts the service and waits for its health check. If the restart or check fails, it restores the previous release and restarts again.

## Repository layout

| Path                | Purpose                                                             |
| ------------------- | ------------------------------------------------------------------- |
| `app/`              | Pages, components, composables and styles                           |
| `content/`          | Docs and blog posts                                                 |
| `content.config.ts` | Nuxt Content collections and Studio form schemas                    |
| `server/`           | Nitro API routes                                                    |
| `shared/`           | Types, constants and pure helpers shared by app, server and scripts |
| `scripts/`          | Index generation, media checks, deployment activation               |
| `deploy/`           | OpenResty and systemd configuration                                 |
| `releases/`         | Generated launcher release data; do not edit                        |

The user performs visual and interaction acceptance. Do not commit `.output`, `.nuxt`, `.data`, `public/launcher-demo` or OAuth secrets.
