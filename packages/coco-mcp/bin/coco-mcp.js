#!/usr/bin/env node
// Runs the Coco MCP binary that the platform package for this machine
// carries, with the arguments given, and exits as it exits. The binary is
// built by the release workflow of github.com/camiloazula/coco-mcp; this
// package only locates it, and tells it how it was installed (COCO_INSTALL)
// so its update notice names the right command.
"use strict";

const { spawnSync } = require("node:child_process");
const { channel } = require("./install.js");

const PACKAGES = {
  "darwin-arm64": "coco-mcp-darwin-arm64",
  "darwin-x64": "coco-mcp-darwin-x64",
  "linux-x64": "coco-mcp-linux-x64",
  "win32-x64": "coco-mcp-windows-x64",
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

const env = { ...process.env };
try {
  env.COCO_INSTALL = env.COCO_INSTALL || channel(__dirname, process.env);
} catch {
  // Without it the binary reads its own path instead.
}
const result = spawnSync(bin, process.argv.slice(2), { stdio: "inherit", env });
if (result.error) {
  console.error(`coco-mcp: ${result.error.message}`);
  process.exit(2);
}
process.exit(result.status === null ? 1 : result.status);
