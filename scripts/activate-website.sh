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

for page in \
    index.html en/index.html \
    blog/index.html en/blog/index.html \
    download/index.html download/thanks/index.html \
    en/download/index.html en/download/thanks/index.html \
    docs/index.html en/docs/index.html \
    articles/index.html en/articles/index.html \
    changelog/index.html en/changelog/index.html \
    demo/index.html en/demo/index.html \
    support/index.html en/support/index.html \
    terms/index.html en/terms/index.html \
    privacy/index.html en/privacy/index.html \
    search-index.json blog-index.json \
    robots.txt sitemap.xml llms.txt \
    api/support/checkout/coffee.json \
    api/support/checkout/token.json \
    api/support/checkout/custom.json; do
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
