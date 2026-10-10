// How this copy of coco-mcp was installed, as `<manager>-<scope>`, for the
// binary's update notice: it tells the user the command that upgrades the
// install they have (`npm i -g coco-mcp@latest`, `npx coco-mcp@latest`, …).
// The binary reads it from COCO_INSTALL; crates/coco-update in
// github.com/camiloazula/coco-mcp lists the values it understands.
//
// Where this package sits decides first: a cache that runs without
// installing, a global root, or a project's node_modules, and for most of
// them the package manager that owns it. npm_config_user_agent, which npm,
// npx, pnpm, yarn and bun set for what they run, names the manager only
// when the path does not: a global npm install run from a `pnpm run` script
// is still upgraded with npm.
"use strict";

const path = require("node:path");
const fs = require("node:fs");

const MANAGERS = ["npm", "pnpm", "yarn", "bun"];

/**
 * @param {string} dir  this file's directory, inside the coco-mcp package
 * @param {Record<string, string | undefined>} env
 * @param {(file: string) => boolean} [exists]
 * @returns {string} e.g. "npm-global", "npm-exec", "pnpm-project"
 */
function channel(dir, env, exists = fs.existsSync) {
  const parts = path.resolve(dir).split(/[\\/]+/);
  const lower = parts.map((p) => p.toLowerCase());
  const has = (part) => lower.includes(part);
  const any = (test) => lower.some(test);
  const pair = (a, b) => lower.some((p, i) => p === a && lower[i + 1] === b);

  // The manager the path names, if it names one.
  let named = null;
  if (has(".pnpm") || has("pnpm")) named = "pnpm";
  else if (has(".bun") || any((p) => p.startsWith("bunx-"))) named = "bun";
  else if (has("yarn") || has(".yarn")) named = "yarn";
  else if (has("_npx")) named = "npm";
  const agent = (env.npm_config_user_agent || "").split("/")[0];
  const manager = named || (MANAGERS.includes(agent) ? agent : "npm");

  // Run without installing: npx's cache, pnpm dlx, yarn dlx, bunx.
  const exec =
    has("_npx") ||
    has("dlx") ||
    any((p) => p.startsWith("dlx-") || p.startsWith("bunx-") || p.startsWith("xfs-"));
  if (exec) return `${manager}-exec`;

  // pnpm, yarn and bun keep global installs in a directory of their own:
  // pnpm/global/5, yarn/global (Data\global on Windows), install/global.
  if (pair("pnpm", "global") || pair("yarn", "global") || pair("data", "global") || pair("install", "global")) {
    return `${manager}-global`;
  }

  // The outermost node_modules is the install's root: pnpm nests the
  // package itself under node_modules/.pnpm/<name>@<version>/node_modules.
  const outer = lower.indexOf("node_modules");
  if (outer > 0) {
    const owner = parts.slice(0, outer);
    const name = lower[outer - 1];
    // npm: <prefix>/lib/node_modules on Unix, %AppData%\npm\node_modules on
    // Windows; with no other name in the path, npm owns it.
    if (name === "lib" || name === "npm") return `${named || "npm"}-global`;
    if (name === "global") return `${manager}-global`;
    if (exists(path.join(owner.join(path.sep) || path.sep, "package.json"))) {
      return `${manager}-project`;
    }
  }
  return `${named || "npm"}-global`;
}

module.exports = { channel };
