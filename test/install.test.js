// The install channel the shim passes to the binary in COCO_INSTALL.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { channel } = require("../packages/coco-mcp/bin/install.js");

// The projects that have a package.json; matched on the end of the path,
// since on Windows path.resolve puts a drive in front.
const exists = (file) => /[\\/](app|pnpm-app)[\\/]package\.json$/.test(file);
const bin = (...parts) => path.join(...parts, "coco-mcp", "bin");

test("npx runs from its cache", () => {
  const dir = bin("/Users/me/.npm/_npx/1a2b3c/node_modules");
  assert.equal(channel(dir, { npm_config_user_agent: "npm/11.6.0 node/v22.0.0" }, exists), "npm-exec");
  assert.equal(channel(dir, {}, exists), "npm-exec", "without the agent");
});

test("npm global roots, on Unix and Windows", () => {
  assert.equal(channel(bin("/usr/local/lib/node_modules"), {}, exists), "npm-global");
  assert.equal(channel(bin("/opt/homebrew/lib/node_modules"), {}, exists), "npm-global");
  assert.equal(
    channel(bin("/Users/me/.nvm/versions/node/v22.0.0/lib/node_modules"), {}, exists),
    "npm-global",
  );
  if (path.sep === "\\") {
    assert.equal(channel(bin("C:\\Users\\me\\AppData\\Roaming\\npm\\node_modules"), {}, exists), "npm-global");
  }
});

test("a dependency of a project", () => {
  assert.equal(channel(bin("/Users/me/app/node_modules"), {}, exists), "npm-project");
  assert.equal(
    channel(bin("/Users/me/app/node_modules"), { npm_config_user_agent: "yarn/4.5.0 npm/? node/v22" }, exists),
    "yarn-project",
  );
});

test("pnpm nests the package under .pnpm", () => {
  assert.equal(
    channel(bin("/Users/me/pnpm-app/node_modules/.pnpm/coco-mcp@0.4.0/node_modules"), {}, exists),
    "pnpm-project",
  );
  assert.equal(
    channel(bin("/Users/me/Library/pnpm/global/5/node_modules/.pnpm/coco-mcp@0.4.0/node_modules"), {}, exists),
    "pnpm-global",
  );
  assert.equal(
    channel(bin("/Users/me/Library/Caches/pnpm/dlx/abc123/node_modules/.pnpm/coco-mcp@0.4.0/node_modules"), {}, exists),
    "pnpm-exec",
  );
});

test("yarn and bun global installs and one-off runs", () => {
  assert.equal(channel(bin("/Users/me/.config/yarn/global/node_modules"), {}, exists), "yarn-global");
  assert.equal(channel(bin("/Users/me/.bun/install/global/node_modules"), {}, exists), "bun-global");
  assert.equal(channel(bin("/private/tmp/bunx-501-coco-mcp@latest/node_modules"), {}, exists), "bun-exec");
  assert.equal(channel(bin("/private/tmp/xfs-1a2b/dlx-123/node_modules"), { npm_config_user_agent: "yarn/4.5.0" }, exists), "yarn-exec");
});

test("the path outranks the agent that started it", () => {
  // A global npm install run from a `pnpm run` script.
  assert.equal(
    channel(bin("/usr/local/lib/node_modules"), { npm_config_user_agent: "pnpm/9.12.0 npm/? node/v22" }, exists),
    "npm-global",
  );
  assert.equal(
    channel(bin("/Users/me/.npm/_npx/1a2b3c/node_modules"), { npm_config_user_agent: "yarn/1.22.22 npm/? node/v22" }, exists),
    "npm-exec",
  );
});

test("Yarn classic's global root on Windows", () => {
  assert.equal(
    channel(bin("C:\\Users\\me\\AppData\\Local\\Yarn\\Data\\global\\node_modules"), {}, () => true),
    "yarn-global",
  );
});

test("anything else is taken for a global npm install", () => {
  assert.equal(channel("/somewhere/odd", {}, exists), "npm-global");
});
