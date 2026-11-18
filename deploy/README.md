# Production deployment

The site is a hybrid Nuxt build. OpenResty serves the prerendered files and proxies Studio, the API and unknown routes to the `axlmc-website` systemd service.

## Directory layout

```text
/www/wwwroot/axlmc.org/
├── current -> releases/<run>-<attempt>-<sha>
├── releases/<id>/
│   ├── public/          # prerendered pages and assets
│   └── server/          # Nitro Node bundle
├── shared/_nuxt/        # build assets shared across releases
└── .deploy.lock
```

OpenResty must use `current/public` as the document root.

## First-time setup

1. Install Node 24 at `/usr/bin/node` (adjust `ExecStart` if the binary lives elsewhere).
2. Copy `systemd/axlmc-website.service` to `/etc/systemd/system/axlmc-website.service` and run `systemctl daemon-reload`.
3. Create `/etc/axlmc-website.env`, owned by root with mode `600`, for optional values:
   - `NUXT_STUDIO_GIT_GITHUB_TOKEN`
   - `NUXT_AFDIAN_USER_ID` / `NUXT_AFDIAN_TOKEN`
   - `NUXT_PUBLIC_UMAMI_ENABLED`, `NUXT_PUBLIC_UMAMI_SCRIPT_URL`, `NUXT_PUBLIC_UMAMI_WEBSITE_ID` — analytics are opt-in and read at build time; point them at a self-hosted Umami instance. Without them the site loads no third-party analytics script.
4. Create the GitHub OAuth App with callbacks `https://axlmc.org/__nuxt_studio/auth/github` and `http://localhost:3000/__nuxt_studio/auth/github`. Studio requests `user:email` and, because the repository is private, `repo`.
5. Add these repository values in GitHub:
   - variable `NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID`
   - variable `NUXT_STUDIO_AUTH_GITHUB_MODERATORS` (comma-separated account emails)
   - secret `NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET`
   - secret `NUXT_STUDIO_AUTH_SESSION_SECRET`

   Every deploy writes them, with mode `600`, to `/www/wwwroot/axlmc.org/studio.env`. The unit reads that file after `/etc/axlmc-website.env`, so the repository values are the source of truth for Studio.

6. Allow the deploy user to restart only this service. Example sudoers entry:

   ```text
   deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart axlmc-website
   ```

7. Install `openresty/axlmc.org.conf` with the site's certificate paths and reload OpenResty, then run the first deploy.
8. `systemctl enable --now axlmc-website` once the first release is active.

## Deploy flow

A push to `main` that changes app, content, `deploy/` or configuration files runs `.github/workflows/deploy-website.yml`. The workflow builds `.output`, uploads `server/` and `public/`, copies them into a new release directory, and runs the activation script. Activation:

1. validates the Nitro entry and key prerendered files;
2. copies `_nuxt` into `shared/`;
3. switches the `current` symlink;
4. restarts the service and polls `http://127.0.0.1:3000/`;
5. rolls the symlink back and restarts the previous release if the check fails.

## Studio publishing

Production editors sign in at `/_studio`. Publishing commits Markdown to the repository through the GitHub Contents API; it never writes to the production filesystem. The resulting push rebuilds the site.

Blog posts are one file per post at `content/blog/<locale>/<slug>.md`. Create or edit the file in Studio; publishing commits it to Git and triggers the normal deploy. The repository's Git history is the revision history.

## Troubleshooting

- If the first automated deploy ran before the host was prepared, re-run the workflow manually with `force-deploy` after installing the unit and environment file.
- `systemctl status axlmc-website` and `journalctl -u axlmc-website -n 100` show Node errors.
- `curl -I http://127.0.0.1:3000/` checks the service directly.
- If Studio login fails, verify the OAuth callback, the moderator list (GitHub account emails) and `NUXT_STUDIO_AUTH_SESSION_SECRET`.
- If Studio login or publishing fails, verify the OAuth callback, moderator list and `NUXT_STUDIO_AUTH_SESSION_SECRET`, then restart the service after changing the environment file.
- `nginx -t` before reloading OpenResty; the configuration proxies `/_studio` with a regex so `/_studio-app/` assets stay static.
