#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function parseVersion(value) {
  const match = String(value || "").trim().match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  return match ? match.slice(1).map(Number) : null;
}

function compareVersions(left, right) {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}

function satisfiesRange(version, range) {
  if (!version || typeof range !== "string") return false;
  return range.split("||").some((rawAlternative) => {
    const alternative = rawAlternative.trim();
    const match = alternative.match(/^(\^|>=)\s*(\d+\.\d+\.\d+)$/);
    if (!match) return false;
    const minimum = parseVersion(match[2]);
    if (match[1] === ">=") return compareVersions(version, minimum) >= 0;
    return version[0] === minimum[0] && compareVersions(version, minimum) >= 0;
  });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function inspectRepository(repositoryPath) {
  const packagePath = path.join(repositoryPath, "package.json");
  const lockPath = path.join(repositoryPath, "package-lock.json");
  const readmePath = path.join(repositoryPath, "README.md");
  const nvmrcPath = path.join(repositoryPath, ".nvmrc");
  const packageJson = readJson(packagePath);
  const lock = readJson(lockPath);
  const viteRange = lock.packages?.["node_modules/vite"]?.engines?.node || null;
  const selectedVersion = fs.existsSync(nvmrcPath)
    ? parseVersion(fs.readFileSync(nvmrcPath, "utf8"))
    : null;
  const projectRange = packageJson.engines?.node || null;
  const readme = fs.readFileSync(readmePath, "utf8");

  return [
    {
      id: "runtime-selector",
      requirement: "The repository selects a Node version compatible with its checked-in Vite toolchain.",
      passed: Boolean(selectedVersion && viteRange && satisfiesRange(selectedVersion, viteRange)),
      evidence: {
        selectedVersion: selectedVersion ? selectedVersion.join(".") : null,
        viteRange
      }
    },
    {
      id: "package-engine",
      requirement: "package.json declares a supported Node engine range compatible with the selected runtime.",
      passed: Boolean(projectRange && selectedVersion && satisfiesRange(selectedVersion, projectRange)),
      evidence: { projectRange, selectedVersion: selectedVersion ? selectedVersion.join(".") : null }
    },
    {
      id: "setup-guidance",
      requirement: "README setup guidance names the repository's Node runtime selection path.",
      passed: /(?:\.nvmrc|nvm\s+use|Node(?:\.js)?\s+(?:20|22|24))/i.test(readme),
      evidence: { mentionsRuntimeSelection: /(?:\.nvmrc|nvm\s+use|Node(?:\.js)?\s+(?:20|22|24))/i.test(readme) }
    }
  ];
}

function main() {
  const repositoryPath = process.argv[2];
  const criterion = process.argv[3] || "all";
  if (!repositoryPath) {
    process.stderr.write("Usage: verify-runtime-contract <repository-path> [criterion-id|all]\n");
    process.exitCode = 2;
    return;
  }
  const results = inspectRepository(path.resolve(repositoryPath));
  const selected = criterion === "all" ? results : results.filter((item) => item.id === criterion);
  if (!selected.length) {
    process.stderr.write(`Unknown criterion: ${criterion}\n`);
    process.exitCode = 2;
    return;
  }
  const payload = {
    verifierSha256: crypto.createHash("sha256").update(fs.readFileSync(__filename)).digest("hex"),
    criterion,
    results: selected
  };
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exitCode = selected.every((item) => item.passed) ? 0 : 1;
}

main();
