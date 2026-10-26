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
`.output/public` to the Cloudflare Pages **Direct Upload** project with the pinned
Wrangler CLI and `--branch main`. It runs when a push to `main` changes
`releases/` and on manual dispatch. Ordinary website commits therefore go live
with the next launcher release or a manual deployment.

Pages serves only static assets; no Worker adapter or Pages Functions are needed.
GitHub Actions owns the build and publication order. Pages does not run a hosted
build. Before uploading, the workflow checks that the homepage exists and that
every catalog version appears in the prerendered changelog. A missing secret or a
failed build fails the job without replacing the live site.

The deployment needs these Actions settings in this repository:

- Secret `CLOUDFLARE_API_TOKEN`: a Cloudflare API token with
  **Account > Cloudflare Pages > Edit** for the account that owns `axlmc.org`.
- Secret `CLOUDFLARE_ACCOUNT_ID`: that Cloudflare account ID.
- Variable `CLOUDFLARE_PAGES_PROJECT_NAME`: the Pages project name
  (`axolotl-website`).

Any website build-time environment variables must be provided to the GitHub build
step; runtime Pages variables cannot change already generated HTML. Domain routing
(`axlmc.org`, `www` redirect) is configured in Cloudflare, not in the CI token.

See Cloudflare's [Direct Upload CI guide](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
and [custom domain setup](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## Manual website deployment

Open **Actions > Deploy website to Cloudflare Pages > Run workflow**, select
**main**, and click **Run workflow**. Alternatively, run:

```sh
gh workflow run deploy-website.yml --ref main
```

The workflow builds the latest `main` after obtaining the production deployment
concurrency lock. Other branches are skipped. It uses the release data already in
`releases/`; it does not regenerate announcements from potentially unreleased
`catalog.ts` entries.

To roll back site content, select a previous successful production deployment in
Pages and choose **Rollback**. This does not roll back the synchronized release
data; the next deployment publishes the current `main` again.
