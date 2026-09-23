#!/usr/bin/env node
// set-version.js X.Y.Z: write the version into every package, and into the
// umbrella's optional dependencies, so the five publish as one release.
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(version || "")) {
  console.error("usage: set-version.js X.Y.Z");
  process.exit(2);
}
const packages = path.join(__dirname, "..", "packages");
for (const dir of fs.readdirSync(packages)) {
  const file = path.join(packages, dir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
  pkg.version = version;
  if (pkg.optionalDependencies) {
    for (const name of Object.keys(pkg.optionalDependencies)) {
      pkg.optionalDependencies[name] = version;
    }
  }
  fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`${pkg.name} ${version}`);
}
