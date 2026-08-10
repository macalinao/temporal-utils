#!/usr/bin/env bash
set -euo pipefail

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
#
# Packages whose current version is already on the registry are skipped, so a
# release that only bumps some packages -- or a re-run after a partial failure
# -- does not die on "cannot publish over the previously published versions".
# A package that fails to publish does not abort the rest; failures are
# collected and reported at the end.

echo "Publishing packages via npm OIDC trusted publishing..."

PACK_DIR="$(mktemp -d)"
TO_PUBLISH=()
FAILED=()

# Is <name>@<version> already on the registry? `npm view` exits non-zero when
# the package does not exist at all, and prints nothing when the package exists
# but the version does not.
version_published() {
  local name="$1" version="$2" out
  out="$(npm view "$name@$version" version 2>/dev/null)" || return 1
  [ -n "$out" ]
}

pack_dir() {
  local parent="$1"
  for dir in "$parent"/*; do
    [ -d "$dir" ] && [ -f "$dir/package.json" ] || continue

    local name version
    name="$(node -p "require('./$dir/package.json').name")"
    version="$(node -p "require('./$dir/package.json').version")"

    if [ "$(node -p "require('./$dir/package.json').private === true")" = "true" ]; then
      echo "Skipping $name (private)"
      continue
    fi

    if version_published "$name" "$version"; then
      echo "Skipping $name@$version (already published)"
      continue
    fi

    echo "Packing $name@$version..."
    # Pack into a per-package directory so the tarball path is unambiguous
    # (scoped names get mangled in the filename).
    local out_dir="$PACK_DIR/$(echo "$name" | tr '/' '-')"
    mkdir -p "$out_dir"
    # bun pm pack resolves catalog:/workspace: protocols to concrete versions
    (cd "$dir" && bun pm pack --destination "$out_dir")

    local tarball
    tarball="$(find "$out_dir" -maxdepth 1 -name '*.tgz' -print -quit)"
    if [ -z "$tarball" ]; then
      echo "::error::No tarball produced for $name@$version"
      FAILED+=("$name@$version (pack)")
      continue
    fi
    TO_PUBLISH+=("$name@$version:$tarball")
  done
}

echo "Packing publishable packages..."
pack_dir packages

if [ ${#TO_PUBLISH[@]} -eq 0 ]; then
  echo "Nothing new to publish."
else
  echo "Publishing tarballs to npm..."
  for entry in "${TO_PUBLISH[@]}"; do
    pkg="${entry%%:*}"
    tarball="${entry#*:}"
    echo "Publishing $pkg..."
    if ! npm publish "$tarball" --access public --provenance; then
      echo "::error::Failed to publish $pkg"
      FAILED+=("$pkg (publish)")
    fi
  done
fi

if [ ${#FAILED[@]} -gt 0 ]; then
  echo "Failed to publish ${#FAILED[@]} package(s):"
  printf '  - %s\n' "${FAILED[@]}"
  exit 1
fi

# Tag the release in git
echo "Creating git tags via Changeset..."
changeset tag

echo "Publishing complete!"
