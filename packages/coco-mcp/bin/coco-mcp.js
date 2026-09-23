#!/usr/bin/env node
// Runs the Coco MCP binary that the platform package for this machine
// carries, with the arguments given, and exits as it exits. The binary is
// built by the release workflow of github.com/camiloazula/coco-mcp; this
// package only locates it.
"use strict";

const { spawnSync } = require("node:child_process");

const PACKAGES = {
  "darwin-arm64": "coco-mcp-darwin-arm64",
  "darwin-x64": "coco-mcp-darwin-x64",
  "linux-x64": "coco-mcp-linux-x64",
  "win32-x64": "coco-mcp-win32-x64",
};

const key = `${process.platform}-${process.arch}`;
const pkg = PACKAGES[key];
if (!pkg) {
  console.error(
    `coco-mcp: no prebuilt binary for ${key}. The archives for every platform, ` +
      "and the source, are at https://github.com/camiloazula/coco-mcp/releases",
  );
  process.exit(2);
}

const exe = process.platform === "win32" ? "coco-mcp.exe" : "coco-mcp";
let bin;
try {
  bin = require.resolve(`${pkg}/${exe}`);
} catch {
  console.error(
    `coco-mcp: the package ${pkg} is not installed. It is an optional dependency ` +
      "of coco-mcp; reinstall without --no-optional, or with the platform allowed.",
  );
  process.exit(2);
}

const result = spawnSync(bin, process.argv.slice(2), { stdio: "inherit" });
if (result.error) {
  console.error(`coco-mcp: ${result.error.message}`);
  process.exit(2);
}
process.exit(result.status === null ? 1 : result.status);
