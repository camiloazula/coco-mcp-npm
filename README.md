# npm packages for Coco MCP

The npm distribution of [Coco MCP](https://github.com/camiloazula/coco-mcp),
a tool for debugging Model Context Protocol servers from the command line or
a native window.

```bash
npx coco-mcp
```

`coco-mcp` is a small package that runs the prebuilt binary of this machine's
platform. The binaries live in one package each, `coco-mcp-darwin-arm64`,
`coco-mcp-darwin-x64`, `coco-mcp-linux-x64` and `coco-mcp-win32-x64`, listed
as optional dependencies so npm installs only the matching one. Nothing is
compiled on install.

The binaries are those of the main repository's releases, taken by checksum
from the release's archives. `scripts/fetch.sh X.Y.Z` puts them in place and
sets the version everywhere; `scripts/publish.sh` publishes the five
packages; the workflow does both for each new release.

The shim and this file are under MIT OR Apache-2.0, as Coco MCP is.
