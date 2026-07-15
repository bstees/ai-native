const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { applyInstructionFiles, legacyIndexPath } = require("../scripts/instruction-files");
const {
  applySync,
  gitignoreEndMarker,
  gitignoreStartMarker,
  inspectSyncState,
  repoConfigFile,
  stateFile
} = require("../scripts/shared-assets");
const { version } = require("../scripts/shared-assets-version");
const { seedRepoOnboarding } = require("../scripts/seed-repo-onboarding");

function read(targetRoot, relativePath) {
  return fs.readFileSync(path.join(targetRoot, relativePath), "utf8");
}

async function run() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-native-sync-test-"));
  const targetRoot = path.join(tempRoot, "consumer-repo");
  fs.mkdirSync(targetRoot);
  require("child_process").execFileSync("git", ["init"], { cwd: targetRoot, stdio: "ignore" });

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
  assert.ok(read(targetRoot, ".ai-native/engineering-quality.md").includes("Engineering Quality"));
  assert.ok(fs.existsSync(path.join(targetRoot, stateFile)));
  assert.ok(fs.existsSync(path.join(targetRoot, repoConfigFile)));
  assert.ok(read(targetRoot, ".gitignore").includes(gitignoreStartMarker));
  assert.strictEqual(JSON.parse(read(targetRoot, stateFile)).assetVersion, version);
  assert.strictEqual(JSON.parse(read(targetRoot, repoConfigFile)).repoRole, "consumer");
  assert.strictEqual(JSON.parse(read(targetRoot, repoConfigFile)).standardsMode, "managed");

  const upToDateInspection = inspectSyncState(targetRoot);
  assert.strictEqual(upToDateInspection.status, "up-to-date");
  assert.strictEqual(upToDateInspection.versionStatus, "current");
  assert.strictEqual(upToDateInspection.repoRole, "consumer");
  assert.strictEqual(upToDateInspection.standardsMode, "managed");

  const noOpResult = applySync({ targetRoot });
  assert.strictEqual(noOpResult.action, "no-op");
  assert.ok(noOpResult.logs.some((line) => line.includes("already up to date")));
  assert.ok(noOpResult.logs.some((line) => line.includes(version)));
  assert.ok(noOpResult.logs.some((line) => line.includes(".gitignore")));

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

  const ignoredRoot = path.join(tempRoot, "ignored-repo");
  fs.mkdirSync(ignoredRoot);
  fs.writeFileSync(path.join(ignoredRoot, ".gitignore"), ".ai-native/\n");
  require("child_process").execFileSync("git", ["init"], { cwd: ignoredRoot, stdio: "ignore" });
  applySync({ targetRoot: ignoredRoot });
  const ignoredNoOpResult = applySync({ targetRoot: ignoredRoot });
  const ignoredGitignore = read(ignoredRoot, ".gitignore");
  assert.ok(ignoredGitignore.includes(gitignoreStartMarker));
  assert.ok(ignoredGitignore.includes(gitignoreEndMarker));
  assert.ok(ignoredNoOpResult.ignoredManagedPaths.includes(".ai-native/core-operating-rules.md"));
  assert.ok(!ignoredNoOpResult.logs.some((line) => line.includes("WARN")));

  const badIgnoreRoot = path.join(tempRoot, "bad-ignore-repo");
  fs.mkdirSync(badIgnoreRoot);
  fs.writeFileSync(path.join(badIgnoreRoot, ".gitignore"), ".ai-native/\n!.ai-native/\n");
  require("child_process").execFileSync("git", ["init"], { cwd: badIgnoreRoot, stdio: "ignore" });
  applySync({ targetRoot: badIgnoreRoot });
  fs.appendFileSync(path.join(badIgnoreRoot, ".gitignore"), ".ai-native/repo-config.json\n");
  const badIgnoreResult = applySync({ targetRoot: badIgnoreRoot });
  assert.ok(badIgnoreResult.ignoredRepoOwnedPaths.includes(".ai-native/repo-config.json"));
  assert.ok(badIgnoreResult.logs.some((line) => line.includes("WARN")));

  const instructionRoot = path.join(tempRoot, "instruction-repo");
  fs.mkdirSync(instructionRoot);
  applySync({ targetRoot: instructionRoot });
  const autoInstructionResult = await applyInstructionFiles({
    targetRoot: instructionRoot,
    mode: "auto"
  });
  assert.ok(fs.existsSync(path.join(instructionRoot, "AGENTS.md")));
  assert.ok(fs.lstatSync(path.join(instructionRoot, "CLAUDE.md")).isSymbolicLink());
  assert.ok(
    fs.lstatSync(path.join(instructionRoot, ".github", "copilot-instructions.md")).isSymbolicLink()
  );
  assert.ok(autoInstructionResult.logs.some((line) => line.includes("INSTRUCTION-AUTO")));

  const appendRoot = path.join(tempRoot, "append-repo");
  fs.mkdirSync(appendRoot);
  applySync({ targetRoot: appendRoot });
  fs.writeFileSync(path.join(appendRoot, "AGENTS.md"), "# Custom AGENTS\n");
  fs.writeFileSync(path.join(appendRoot, "CLAUDE.md"), "# Custom CLAUDE\n");
  ensureDir(path.join(appendRoot, ".github"));
  fs.writeFileSync(
    path.join(appendRoot, ".github", "copilot-instructions.md"),
    "# Custom Copilot\n"
  );
  const appendInstructionResult = await applyInstructionFiles({
    targetRoot: appendRoot,
    mode: "append"
  });
  assert.ok(read(appendRoot, "AGENTS.md").includes("ai-native-shared-guidance:start"));
  assert.ok(read(appendRoot, "CLAUDE.md").includes("AI Native Shared Guidance"));
  assert.ok(
    read(appendRoot, ".github/copilot-instructions.md").includes("AI Native Shared Guidance")
  );
  assert.ok(appendInstructionResult.logs.some((line) => line.includes("INSTRUCTION-APPEND")));

  const conflictRoot = path.join(tempRoot, "conflict-repo");
  fs.mkdirSync(conflictRoot);
  applySync({ targetRoot: conflictRoot });
  fs.writeFileSync(path.join(conflictRoot, "AGENTS.md"), "# Custom AGENTS\n");
  const conflictInstructionResult = await applyInstructionFiles({
    targetRoot: conflictRoot,
    mode: "auto",
    interactive: false
  });
  assert.strictEqual(conflictInstructionResult.action, "conflict");
  assert.ok(conflictInstructionResult.logs.some((line) => line.includes("--instructions-mode=replace")));

  const replaceRoot = path.join(tempRoot, "replace-repo");
  fs.mkdirSync(replaceRoot);
  applySync({ targetRoot: replaceRoot });
  ensureDir(path.join(replaceRoot, ".github"));
  fs.writeFileSync(path.join(replaceRoot, "AGENTS.md"), "# Custom AGENTS\n");
  fs.writeFileSync(path.join(replaceRoot, "CLAUDE.md"), "# Custom CLAUDE\n");
  fs.writeFileSync(
    path.join(replaceRoot, ".github", "copilot-instructions.md"),
    "# Custom Copilot\n"
  );
  const replaceInstructionResult = await applyInstructionFiles({
    targetRoot: replaceRoot,
    mode: "replace"
  });
  assert.ok(read(replaceRoot, "AGENTS.md").includes("ai-native-managed: instructions"));
  assert.ok(read(replaceRoot, "AGENTS.md").includes("Legacy Guidance"));
  assert.ok(fs.lstatSync(path.join(replaceRoot, "CLAUDE.md")).isSymbolicLink());
  assert.ok(
    fs.lstatSync(path.join(replaceRoot, ".github", "copilot-instructions.md")).isSymbolicLink()
  );
  assert.ok(fs.existsSync(path.join(replaceRoot, "AGENTS-old.md")));
  assert.ok(fs.existsSync(path.join(replaceRoot, "CLAUDE-old.md")));
  assert.ok(fs.existsSync(path.join(replaceRoot, ".github", "copilot-instructions-old.md")));
  assert.ok(read(replaceRoot, legacyIndexPath).includes("AGENTS-old.md"));
  assert.ok(read(replaceRoot, legacyIndexPath).includes("CLAUDE-old.md"));
  assert.ok(replaceInstructionResult.logs.some((line) => line.includes("INSTRUCTION-REPLACE")));

  const sourceRoot = path.join(tempRoot, "source-repo");
  fs.mkdirSync(sourceRoot);
  fs.writeFileSync(
    path.join(sourceRoot, "ai-native.config.json"),
    JSON.stringify({ repoRole: "source", repoName: "AI Native" }, null, 2) + "\n"
  );
  const sourceInspection = inspectSyncState(sourceRoot);
  assert.strictEqual(sourceInspection.status, "source");
  assert.strictEqual(sourceInspection.repoRole, "source");
  const sourceResult = applySync({ targetRoot: sourceRoot });
  assert.strictEqual(sourceResult.action, "source");
  assert.ok(sourceResult.logs.some((line) => line.includes("source repo")));
  assert.ok(!fs.existsSync(path.join(sourceRoot, ".ai-native")));

  const forkedRoot = path.join(tempRoot, "forked-repo");
  fs.mkdirSync(forkedRoot);
  applySync({ targetRoot: forkedRoot });
  const forkedConfigPath = path.join(forkedRoot, repoConfigFile);
  const forkedConfig = JSON.parse(fs.readFileSync(forkedConfigPath, "utf8"));
  forkedConfig.standardsMode = "forked";
  fs.writeFileSync(forkedConfigPath, JSON.stringify(forkedConfig, null, 2) + "\n");
  fs.writeFileSync(
    path.join(forkedRoot, ".ai-native", "core-operating-rules.md"),
    "forked local standards\n"
  );
  const forkedInspection = inspectSyncState(forkedRoot);
  assert.strictEqual(forkedInspection.status, "forked");
  assert.strictEqual(forkedInspection.standardsMode, "forked");

  const forkedResult = applySync({ targetRoot: forkedRoot });
  assert.strictEqual(forkedResult.action, "forked");
  assert.ok(forkedResult.logs.some((line) => line.includes("FORKED")));
  assert.strictEqual(
    read(forkedRoot, ".ai-native/core-operating-rules.md"),
    "forked local standards\n"
  );

  console.log("Shared asset sync verification passed.");
}

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
