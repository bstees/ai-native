const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { applySync, inspectSyncState, stateFile } = require("../scripts/shared-assets");
const { version } = require("../scripts/shared-assets-version");
const { seedRepoOnboarding } = require("../scripts/seed-repo-onboarding");

function read(targetRoot, relativePath) {
  return fs.readFileSync(path.join(targetRoot, relativePath), "utf8");
}

function run() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-native-sync-test-"));
  const targetRoot = path.join(tempRoot, "consumer-repo");
  fs.mkdirSync(targetRoot);

  const initialInspection = inspectSyncState(targetRoot);
  assert.strictEqual(initialInspection.status, "new");

  const dryRunResult = applySync({ targetRoot, dryRun: true });
  assert.strictEqual(dryRunResult.action, "install");
  assert.ok(!fs.existsSync(path.join(targetRoot, ".ai-native")));

  const installResult = applySync({ targetRoot });
  assert.strictEqual(installResult.action, "install");
  assert.ok(installResult.logs.some((line) => line.includes(".ai-native/core-operating-rules.md")));
  assert.ok(installResult.logs.some((line) => line.includes(version)));
  assert.ok(fs.existsSync(path.join(targetRoot, ".ai-native", "core-operating-rules.md")));
  assert.ok(read(targetRoot, ".ai-native/README.md").includes("AI Native Assets"));
  assert.ok(read(targetRoot, ".ai-native/feedback/README.md").includes("Feedback should live"));
  assert.ok(fs.existsSync(path.join(targetRoot, stateFile)));
  assert.strictEqual(JSON.parse(read(targetRoot, stateFile)).assetVersion, version);

  const upToDateInspection = inspectSyncState(targetRoot);
  assert.strictEqual(upToDateInspection.status, "up-to-date");
  assert.strictEqual(upToDateInspection.versionStatus, "current");

  const noOpResult = applySync({ targetRoot });
  assert.strictEqual(noOpResult.action, "no-op");
  assert.ok(noOpResult.logs.some((line) => line.includes("already up to date")));
  assert.ok(noOpResult.logs.some((line) => line.includes(version)));

  const statePath = path.join(targetRoot, stateFile);
  const versionState = JSON.parse(fs.readFileSync(statePath, "utf8"));
  versionState.assetVersion = "26.06.0";
  fs.writeFileSync(statePath, JSON.stringify(versionState, null, 2) + "\n");

  const versionDriftInspection = inspectSyncState(targetRoot);
  assert.strictEqual(versionDriftInspection.status, "outdated");
  assert.strictEqual(versionDriftInspection.versionStatus, "outdated");

  const versionSyncResult = applySync({ targetRoot });
  assert.strictEqual(versionSyncResult.action, "sync");
  assert.strictEqual(JSON.parse(read(targetRoot, stateFile)).assetVersion, version);

  fs.writeFileSync(
    path.join(targetRoot, ".ai-native", "core-operating-rules.md"),
    "locally modified shared asset\n"
  );
  fs.writeFileSync(
    path.join(targetRoot, ".ai-native", "feedback", "toil", "local-note.md"),
    "# Local note\n"
  );
  const existingState = JSON.parse(fs.readFileSync(statePath, "utf8"));
  existingState.managedFiles.push(".ai-native/obsolete-managed-file.md");
  fs.writeFileSync(statePath, JSON.stringify(existingState, null, 2) + "\n");
  fs.writeFileSync(
    path.join(targetRoot, ".ai-native", "obsolete-managed-file.md"),
    "stale managed content\n"
  );

  const driftInspection = inspectSyncState(targetRoot);
  assert.strictEqual(driftInspection.status, "outdated");
  assert.ok(driftInspection.outdatedFiles.includes(".ai-native/core-operating-rules.md"));
  assert.ok(driftInspection.staleManagedFiles.includes(".ai-native/obsolete-managed-file.md"));

  const syncResult = applySync({ targetRoot });
  assert.strictEqual(syncResult.action, "sync");
  assert.ok(!fs.existsSync(path.join(targetRoot, ".ai-native", "obsolete-managed-file.md")));
  assert.ok(fs.existsSync(path.join(targetRoot, ".ai-native", "feedback", "toil", "local-note.md")));
  assert.notStrictEqual(
    read(targetRoot, ".ai-native/core-operating-rules.md"),
    "locally modified shared asset\n"
  );

  const seedResult = seedRepoOnboarding({
    targetRoot,
    repoName: "Example Product",
    capturedOn: "2026-07-15"
  });
  assert.ok(
    seedResult.logs.some((line) => line.includes("2026-07-15-initial-onboarding-audit.md"))
  );
  assert.ok(
    read(
      targetRoot,
      ".ai-native/audits/2026-07-15-initial-onboarding-audit.md"
    ).includes("Example Product")
  );
  assert.ok(
    fs.existsSync(
      path.join(
        targetRoot,
        ".ai-native",
        "feedback",
        "toil",
        "2026-07-15-example-product-onboarding-toil.md"
      )
    )
  );
  assert.ok(fs.existsSync(path.join(targetRoot, ".ai-native", "feedback", "toil", "local-note.md")));

  console.log("Shared asset sync verification passed.");
}

run();
