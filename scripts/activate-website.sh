#!/usr/bin/env bash
# Activate a prebuilt Nuxt release on the production host.
#
# The release directory is the contents of Nuxt's `.output`: `server/` holds
# the Nitro Node bundle and `public/` holds the prerendered pages and assets.
# OpenResty serves the static files directly and proxies Studio, the API and
# unknown routes to the systemd service.
set -euo pipefail
umask 022

site_directory=/www/wwwroot/axlmc.org
service_name=axlmc-website
health_url=http://127.0.0.1:3000/
release_id=${1:?Expected a release ID}
if [[ ! "$release_id" =~ ^[0-9]+-[0-9]+-[0-9a-f]{40}$ ]]; then
    echo 'Invalid release ID.' >&2
    exit 1
fi

release_directory="$site_directory/releases/$release_id"
exec 9>"$site_directory/.deploy.lock"
flock -w 60 9

if [[ ! -s "$release_directory/server/index.mjs" ]]; then
    echo 'Missing Nitro server entry: server/index.mjs' >&2
    exit 1
fi

for page in \
    public/index.html public/en/index.html \
    public/blog/index.html public/en/blog/index.html \
    public/download/index.html public/download/thanks/index.html \
    public/en/download/index.html public/en/download/thanks/index.html \
    public/docs/index.html public/en/docs/index.html \
    public/articles/index.html public/en/articles/index.html \
    public/changelog/index.html public/en/changelog/index.html \
    public/demo/index.html public/en/demo/index.html \
    public/support/index.html public/en/support/index.html \
    public/blog/terms/index.html public/en/blog/terms/index.html \
    public/blog/privacy/index.html public/en/blog/privacy/index.html \
    public/search-index.json public/robots.txt public/sitemap_index.xml public/llms.txt \
    public/api/support/checkout/coffee.json \
    public/api/support/checkout/token.json \
    public/api/support/checkout/custom.json; do
    if [[ ! -s "$release_directory/$page" ]]; then
        echo "Missing or empty prerendered file: $page" >&2
        exit 1
    fi
done

if [[ -e "$site_directory/current" && ! -L "$site_directory/current" ]]; then
    echo 'The current path must be a symlink or absent.' >&2
    exit 1
fi

restart_service() {
    if [[ $EUID -eq 0 ]]; then
        systemctl restart "$service_name"
    else
        sudo -n systemctl restart "$service_name"
    fi
}

wait_for_health() {
    for _ in {1..30}; do
        if curl --fail --silent --show-error --max-time 5 "$health_url" >/dev/null; then
            return 0
        fi
        sleep 1
    done
    return 1
}

# Keep Nuxt assets available to pages opened before the switch.
if [[ -d "$release_directory/public/_nuxt" ]]; then
    mkdir -p "$site_directory/shared/_nuxt"
    rsync -rpt --chmod=D755,F644 \
        "$release_directory/public/_nuxt/" "$site_directory/shared/_nuxt/"
fi

# Transitional compatibility: the pre-SSR OpenResty config used the release
# root as its document root. Relative links keep that layout working until the
# new config (root `current/public`) is reloaded, so the cutover has no outage.
for entry in "$release_directory/public"/*; do
    [[ -e "$entry" ]] || continue
    name=${entry##*/}
    if [[ ! -e "$release_directory/$name" && ! -L "$release_directory/$name" ]]; then
        ln -s "public/$name" "$release_directory/$name"
    fi
done

previous_target=$(readlink "$site_directory/current" 2>/dev/null || true)

ln -s "releases/$release_id" "$site_directory/.current-$release_id"
mv -Tf "$site_directory/.current-$release_id" "$site_directory/current"

if ! restart_service; then
    echo "Failed to restart $service_name." >&2
    if [[ -n "$previous_target" ]]; then
        ln -s "$previous_target" "$site_directory/.current-$release_id"
        mv -Tf "$site_directory/.current-$release_id" "$site_directory/current"
        restart_service || true
    fi
    exit 1
fi

if ! wait_for_health; then
    echo "Health check failed after activating $release_id." >&2
    if [[ -n "$previous_target" ]]; then
        echo "Rolling back to $previous_target" >&2
        ln -s "$previous_target" "$site_directory/.current-$release_id"
        mv -Tf "$site_directory/.current-$release_id" "$site_directory/current"
        if restart_service && wait_for_health; then
            echo 'Rollback completed.' >&2
        else
            echo 'Rollback health check failed as well.' >&2
        fi
    else
        echo 'No previous release to roll back to.' >&2
    fi
    exit 1
fi

echo "Activated website release $release_id"
