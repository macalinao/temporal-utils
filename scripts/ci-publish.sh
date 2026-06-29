#!/usr/bin/env bash
set -e

# Publishing uses npm OIDC trusted publishing (no NPM_TOKEN required).
#
# bun publish does not support OIDC trusted publishing yet
# (https://github.com/oven-sh/bun/issues/22423), so we pack each package with
# `bun pm pack` -- which rewrites the `catalog:` and `workspace:` protocols to
# concrete versions in the tarball -- and then publish the resulting tarball
# with `npm publish`, which supports OIDC and auto-generates provenance.
#
# Requires: npm >= 11.5.1 and `id-token: write` permission in the workflow, plus
# a trusted publisher configured for each package on npmjs.com.

echo "Publishing packages via npm OIDC trusted publishing..."

PACK_DIR="$(mktemp -d)"

pack_dir() {
  local parent="$1"
  for dir in "$parent"/*; do
    if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
      if ! grep -q '"private": true' "$dir/package.json"; then
        echo "Packing $(basename "$dir")..."
        # bun pm pack resolves catalog:/workspace: protocols to concrete versions
        (cd "$dir" && bun pm pack --destination "$PACK_DIR")
      fi
    fi
  done
}

echo "Packing publishable packages..."
pack_dir packages

echo "Publishing tarballs to npm..."
for tarball in "$PACK_DIR"/*.tgz; do
  echo "Publishing $(basename "$tarball")..."
  npm publish "$tarball" --access public --provenance
done

# Tag the release in git
echo "Creating git tags via Changeset..."
changeset tag

echo "Publishing complete!"
