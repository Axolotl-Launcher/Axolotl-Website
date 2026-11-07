#!/usr/bin/env bash
set -euo pipefail
umask 022

site_directory=/www/wwwroot/axlmc.org
release_id=${1:?Expected a release ID}
if [[ ! "$release_id" =~ ^[0-9]+-[0-9]+-[0-9a-f]{40}$ ]]; then
    echo 'Invalid release ID.' >&2
    exit 1
fi

release_directory="$site_directory/releases/$release_id"
exec 9>"$site_directory/.deploy.lock"
flock -w 60 9

for page in index.html changelog/index.html demo/index.html terms/index.html privacy/index.html robots.txt sitemap.xml llms.txt; do
    if [[ ! -s "$release_directory/$page" ]]; then
        echo "Missing or empty prerendered file: $page" >&2
        exit 1
    fi
done

if [[ -e "$site_directory/current" && ! -L "$site_directory/current" ]]; then
    echo 'The current path must be a symlink or absent.' >&2
    exit 1
fi

# Keep Nuxt assets available to pages opened before the switch.
if [[ -d "$release_directory/_nuxt" ]]; then
    mkdir -p "$site_directory/shared/_nuxt"
    rsync -rpt --chmod=D755,F644 \
        "$release_directory/_nuxt/" "$site_directory/shared/_nuxt/"
fi

ln -s "releases/$release_id" "$site_directory/.current-$release_id"
mv -Tf "$site_directory/.current-$release_id" "$site_directory/current"
echo "Activated website release $release_id"
