#!/usr/bin/env bash
# publish.sh: publish the four platform packages, then the umbrella, from
# what fetch.sh put in place. Needs `npm login` or NODE_AUTH_TOKEN.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
for dir in darwin-arm64 darwin-x64 linux-x64 win32-x64; do
  (cd "$root/packages/$dir" && npm publish --access public "$@")
done
(cd "$root/packages/coco-mcp" && npm publish --access public "$@")
