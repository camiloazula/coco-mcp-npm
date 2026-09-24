#!/usr/bin/env bash
# publish.sh: publish the four platform packages, then the umbrella, from
# what fetch.sh put in place. In the publish workflow npm authenticates it as
# the packages' trusted publisher; by hand it needs `npm login` and 2FA.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
# A version already on the registry is left alone, so a rerun after a
# failure publishes only what is missing.
publish() {
  local dir="$1"; shift
  local name version
  name=$(node -p "require('$root/packages/$dir/package.json').name")
  version=$(node -p "require('$root/packages/$dir/package.json').version")
  if npm view "$name@$version" version > /dev/null 2>&1; then
    echo "$name@$version is published already"
    return
  fi
  (cd "$root/packages/$dir" && npm publish --access public "$@")
}
for dir in darwin-arm64 darwin-x64 linux-x64 windows-x64; do
  publish "$dir" "$@"
done
publish coco-mcp "$@"
