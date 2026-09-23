#!/usr/bin/env bash
# fetch.sh X.Y.Z: put the binaries of Coco MCP release vX.Y.Z into the
# platform packages, checked against the release's SHA256SUMS, and set every
# package to that version.
set -euo pipefail
version="${1:?usage: fetch.sh X.Y.Z}"
root="$(cd "$(dirname "$0")/.." && pwd)"
base="https://github.com/camiloazula/coco-mcp/releases/download/v$version"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
cd "$work"
curl -fsSLO "$base/SHA256SUMS"
if command -v sha256sum > /dev/null; then sum=sha256sum; else sum="shasum -a 256"; fi
# dir in packages/ | target triple | file in the archive
while read -r dir target file; do
  archive="coco-mcp-v$version-$target"
  case "$target" in
    *windows*) archive="$archive.zip" ;;
    *) archive="$archive.tar.gz" ;;
  esac
  curl -fsSLO "$base/$archive"
  grep " $archive\$" SHA256SUMS | $sum -c - > /dev/null
  rm -rf "$archive.d" && mkdir "$archive.d"
  case "$archive" in
    *.zip) unzip -q "$archive" -d "$archive.d" ;;
    *) tar -xzf "$archive" -C "$archive.d" ;;
  esac
  inner="$archive.d/coco-mcp-v$version-$target/$file"
  install -m 755 "$inner" "$root/packages/$dir/$file"
  echo "$dir: $file from $archive"
done <<LIST
darwin-arm64 aarch64-apple-darwin coco-mcp
darwin-x64 x86_64-apple-darwin coco-mcp
linux-x64 x86_64-unknown-linux-gnu coco-mcp
win32-x64 x86_64-pc-windows-msvc coco-mcp.exe
LIST
node "$root/scripts/set-version.js" "$version"
