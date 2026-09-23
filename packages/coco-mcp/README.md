# coco-mcp

Debug MCP servers in depth, from the command line or a native window.
This package runs the prebuilt Coco MCP binary for your platform; the
program itself is at [camiloazula/coco-mcp](https://github.com/camiloazula/coco-mcp).

```bash
npx coco-mcp                   # the window
npx coco-mcp --cli --help      # the command line
```

Or install it once:

```bash
npm install -g coco-mcp
```

Binaries are published for macOS (arm64 and x86_64), Linux (x86_64) and
Windows (x86_64), one optional dependency each; npm installs the one that
matches. Other platforms get the release page instead.
