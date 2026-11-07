# Axolotl Website

The official website for Axolotl Launcher, served at <https://axlmc.org>.

The launcher, its release pipeline and the announcement catalog live in
[Axolotl-Launcher/Axolotl](https://github.com/Axolotl-Launcher/Axolotl). This
repository was extracted from that repository's `apps/website` directory with its
history.

## Download sources

The browser reads release metadata only from
`https://update.axlmc.org/api/downloads/latest?channel=release|beta`. Switching
download sources keeps that catalog and its version tag, attachment names and
relative paths; it only changes the generated file URLs. No Pages Functions or
GitHub/GitLink release-list requests are used.
The Update Server download source serves files from
`https://dist.axlmc.org/<relative_path>` while keeping metadata on Update Server.

Sources are registered in `src/utils/download-sources.ts` with an identity,
localized label and description, and an asset URL builder. The settings list and
preference validation derive from that registry; its first entry is the
recommended source used by Automatic. `use-launcher-downloads.ts` owns the single
browser request, loading/error state, timeout and retry. Add a registry entry and
its Chinese translations to introduce a new file source.

## Development

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Create the static production output in `.output/public` with `pnpm build` and
serve it locally with `pnpm preview`. `pnpm test` runs the unit tests and
`pnpm lint` checks formatting and lint rules for the site.

The shared packages under `packages/` (`@modrinth/ui`, `assets`, `utils`,
`api-client` and `tooling-config`) are vendored from the launcher repository and
linked by the pnpm workspace. Each keeps its own `lint` script, for example
`pnpm --filter @modrinth/ui lint`.

## Page-level tests

```sh
pnpm test:e2e
```

This builds the site, serves `.output/public` through `e2e/static-server.mjs`,
and drives it with Playwright. The tests run against the build output rather than
a dev server, because a dev server renders unminified styles, injects its own
client, and a stale one is indistinguishable from a real regression.

- `e2e/theme.spec.ts` asserts theme resolution across a real page load.
- `e2e/landing.visual.spec.ts` compares full-page screenshots of the landing page
  in all three themes. The clock, the update server catalogue, third-party imagery
  and scripts, the design font and lazy images are all pinned in the spec, so a
  run that differs means the design changed.
- `e2e/landing.reduced-motion.spec.ts` checks that the project showcase drops its
  edge fade when the rows stop scrolling under `prefers-reduced-motion: reduce`,
  while the normal marquee keeps it.

### Visual baselines are recorded per platform

Baselines live in `e2e/__visual__/`, with the platform in the file name
(`landing-light-win32.png`). Glyph rasterisation differs between operating
systems, so a baseline recorded on one platform cannot be compared on another.
Only the Windows set is committed today.

On a platform without a baseline the visual tests **fail** rather than skip, and
the failure names the missing file and the command that records it:

```sh
pnpm test:e2e:update
```

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

## Release data

`releases/catalog.json` (changelog announcements) and `releases/latest.json`
(latest stable tag and asset checksums) are generated files owned by the launcher
repository. Do not edit them here.

After every published `v*` release, the launcher repository's
`sync-website-release-data.yml` workflow:

1. Generates `releases/catalog.json` from the launcher's
   `apps/app-frontend/src/announcements/catalog.ts` on `main`. Stable releases
   also update `releases/latest.json`; beta releases preserve it.
2. Commits the files to `main` here as **Axolotl Release Bot** when they changed.
   Unchanged data creates no commit.
3. That push triggers the production deployment below. When a release is
   resumed with unchanged data, the workflow dispatches the deployment instead.

## Deployment

`.github/workflows/deploy-website.yml` builds `main` on GitHub's runner and uploads
`.output/public` over SSH to `/www/wwwroot/axlmc.org/` on the Linux server.
OpenResty serves the generated files; no Node.js process runs on the server.
Separate jobs run lint and tests, spelling
checks, and a single static build in parallel. Deployment eligibility is evaluated
after all three jobs pass. The deployment job downloads that build artifact and
uploads it without rebuilding. It only
runs when a push to `main` changes `releases/` or when manually dispatched on
`main` with `force-deploy` enabled. Ordinary website commits therefore go live
with the next launcher release or a manual deployment. If a history rewrite makes
the pre-push commit unavailable, the workflow tries fetching it. If it cannot be
recovered, automatic deployment is skipped with a warning; use `force-deploy` to
publish manually.

GitHub Actions owns the build and publication order. Before uploading, the
workflow checks that the homepage exists and that
every catalog version appears in the prerendered changelog. A missing secret or a
failed build fails the job without replacing the live site.

The deployment needs these **Actions secrets** in this repository:

- `DEPLOY_HOST`: the server IP address or SSH hostname, without a URL scheme.
- `DEPLOY_USER`: the SSH user that owns the website directory.
- `DEPLOY_PORT`: optional SSH port; defaults to `22`.
- `DEPLOY_SSH_PRIVATE_KEY`: the complete, unencrypted SSH private key, including
  its header and footer. Use a dedicated deployment key and install its public
  key in the server user's `~/.ssh/authorized_keys`.
- `DEPLOY_SSH_KNOWN_HOSTS`: the server's verified OpenSSH `known_hosts` entry.
  For a nonstandard port, the entry uses `[host]:port`. Obtain the entry with
  `ssh-keyscan -p PORT HOST` and verify its fingerprint through the server console
  before saving it. The workflow requires strict host verification.

The server needs Bash, `rsync`, and `flock` (usually supplied by `util-linux`).
Create `/www/wwwroot/axlmc.org/` once and give the deployment user ownership.
The OpenResty worker user needs read access to files and traverse access to
their parent directories. Deployment uses SSH private-key authentication only;
it needs neither root access nor `sudo`. No Cloudflare API secrets are used.

Each upload goes into `releases/<run-id>-<attempt>-<commit>/`. After checking
the generated pages, `scripts/activate-website.sh` copies `_nuxt/`
into `shared/` without deleting older assets, then atomically
switches the `current` symlink. Failed uploads never switch the live directory.
Deleted pages are absent from the new release; older Nuxt assets remain
available for already-open pages. Launcher demo files are served from
`current/launcher-demo/` and switch with the website release; an open demo may
need a refresh after deployment. Old releases and shared assets are retained
for rollback; monitor disk usage and remove old versions according to your
retention policy. Do not delete the current release or assets still needed by
retained releases.

### OpenResty setup (once)

Use [`deploy/openresty/axlmc.org.conf`](deploy/openresty/axlmc.org.conf) as the
sample for `/www/server/openresty/nginx/conf/sites-enabled/axlmc.org.conf`.
It serves pages and `/launcher-demo/` from `current/`, reads historical Nuxt
assets from `shared/`, sends
HTTP and `www` traffic to `https://axlmc.org`, and returns real 404 responses.
HTML and unversioned files revalidate; Nuxt's hashed assets have immutable caching.
The main `nginx.conf` must include `sites-enabled/*.conf` inside its `http` block
and load `mime.types`. Check existing virtual hosts for duplicate domain entries.

Replace the sample's Let's Encrypt certificate paths with your existing paths.
The certificate must cover both `axlmc.org` and `www.axlmc.org`; certificate
renewal remains the responsibility of the server's existing certificate tooling.
If IPv6 is disabled on the server, remove the `[::]` listen directives. After installing
the configuration, validate and reload it once:

```sh
sudo /www/server/openresty/nginx/sbin/nginx -t
sudo /www/server/openresty/nginx/sbin/nginx -s reload
```

The Actions workflow only uploads and activates website files. It never installs,
modifies, or reloads OpenResty configuration or TLS certificates. Publish the
first build and test the server before switching the domain's DNS records.

Any website build-time environment variables must be provided to the GitHub build
step; server environment variables cannot change already generated HTML.

## Manual website deployment

Open **Actions > Website checks and deployment > Run workflow**, select
**main**, enable **force-deploy**, and click **Run workflow**. Leave it disabled
to run checks and build without deploying. Forced deployment still requires all
checks to pass and only deploys `main`. Alternatively, run:

```sh
gh workflow run deploy-website.yml --ref main -f force-deploy=true
```

Runs on `main` build the latest `main` after obtaining the workflow concurrency
lock. Runs on other branches validate the site without deploying it. The workflow
uses the release data already in `releases/`; it does not regenerate announcements
from potentially unreleased `catalog.ts` entries.

To roll back, replace `RELEASE_ID` with a retained directory name and run on the
server as the deployment user:

```sh
cd /www/wwwroot/axlmc.org
test -s "releases/RELEASE_ID/index.html" && ln -s "releases/RELEASE_ID" .rollback && mv -Tf .rollback current
```

Coordinate rollback with any running deployment. No OpenResty reload is needed.
Rollback does not change the synchronized release data in Git; the next
deployment publishes the current `main` again.
