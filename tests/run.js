const { execFileSync } = require("child_process");
const path = require("path");

const testFiles = [
  "api.test.js",
  "agent-orchestration-contracts.test.js",
  "agent-routing.test.js",
  "weekly-digest-delivery-manifest.test.js",
  "task-contract.test.js",
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
