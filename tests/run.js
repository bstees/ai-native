const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const testFiles = [
  "api.test.js",
  "dependency-audit.test.js",
  "agent-orchestration-contracts.test.js",
  "agent-routing.test.js",
  "weekly-digest-delivery-manifest.test.js",
  "task-contract.test.js",
  "requirement-ledger.test.js",
  "task-evidence.test.js",
  "failure-learning.test.js",
  "instruction-evaluation.test.js",
  "repo-surface-index-bootstrap.test.js",
  "repo-surface-index.test.js",
  "sync.test.js"
];

for (const file of testFiles) {
  execFileSync(process.execPath, [path.join(__dirname, file)], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit"
  });
}

// GitHub checks out a synthetic merge commit for pull_request events. Validate
// the evidence layout against the immutable proposal branch head instead.
if (process.env.GITHUB_EVENT_NAME === "pull_request" && process.env.GITHUB_EVENT_PATH) {
  const { pull_request: pullRequest } = JSON.parse(
    fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")
  );
  if (pullRequest.head.ref === "codex/ain-2026-11-20-01-requirement-ledger") {
    const evidencePath = "experiments/weekly-brief-delivery/2026-11-20/" +
      "ain-2026-11-20-01.rev3.task-evidence-bundle.json";
    execFileSync(
      process.execPath,
      ["scripts/validate-task-evidence.js", evidencePath, pullRequest.head.sha],
      { cwd: path.join(__dirname, ".."), stdio: "inherit" }
    );
  }
}
