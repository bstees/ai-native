const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  applyInstructionFiles,
  appendEndMarker,
  appendStartMarker,
  legacyIndexPath,
  referenceLine
} = require("../scripts/instruction-files");
const {
  applySync,
  gitignoreEndMarker,
  gitignoreRule,
  gitignoreStartMarker,
  inspectSyncState,
  repoConfigFile,
  stateFile
} = require("../scripts/shared-assets");
const { version } = require("../scripts/shared-assets-version");
const { seedRepoOnboarding } = require("../scripts/seed-repo-onboarding");
const { resolveAgentPlan } = require("../assets/agent-orchestration/resolve");

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
  assert.ok(
    read(targetRoot, ".ai-native/agent-orchestration/README.md").includes(
      "Vendor-Neutral Agent Orchestration"
    )
  );
  const installedAgentPlan = resolveAgentPlan({
    root: path.join(targetRoot, ".ai-native", "agent-orchestration"),
    provider: "generic",
    profile: "documentation"
  });
  assert.strictEqual(installedAgentPlan.status, "ready");
  assert.ok(fs.existsSync(path.join(targetRoot, stateFile)));
  assert.ok(fs.existsSync(path.join(targetRoot, repoConfigFile)));
  assert.strictEqual(read(targetRoot, ".gitignore"), `${gitignoreRule}\n`);
  assert.strictEqual(JSON.parse(read(targetRoot, stateFile)).assetVersion, version);
  assert.strictEqual(JSON.parse(read(targetRoot, repoConfigFile)).repoRole, "consumer");
  assert.strictEqual(JSON.parse(read(targetRoot, repoConfigFile)).installMode, "local");
  assert.strictEqual(JSON.parse(read(targetRoot, repoConfigFile)).schemaVersion, 2);

  const upToDateInspection = inspectSyncState(targetRoot);
  assert.strictEqual(upToDateInspection.status, "up-to-date");
  assert.strictEqual(upToDateInspection.versionStatus, "current");
  assert.strictEqual(upToDateInspection.repoRole, "consumer");
  assert.deepStrictEqual(upToDateInspection.trackedAiNativePaths, []);

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
  assert.strictEqual(ignoredGitignore, `${gitignoreRule}\n`);
  assert.ok(ignoredNoOpResult.ignoredManagedPaths.includes(".ai-native"));
  assert.ok(!ignoredNoOpResult.logs.some((line) => line.includes("WARN")));

  const legacyRoot = path.join(tempRoot, "legacy-seeded-repo");
  fs.mkdirSync(legacyRoot);
  require("child_process").execFileSync("git", ["init"], { cwd: legacyRoot, stdio: "ignore" });
  require("child_process").execFileSync("git", ["config", "user.email", "test@example.com"], {
    cwd: legacyRoot
  });
  require("child_process").execFileSync("git", ["config", "user.name", "Test User"], {
    cwd: legacyRoot
  });
  applySync({ targetRoot: legacyRoot });
  fs.writeFileSync(
    path.join(legacyRoot, ".ai-native", "feedback", "toil", "legacy-local-note.md"),
    "# Preserve me\n"
  );
  fs.writeFileSync(
    path.join(legacyRoot, ".gitignore"),
    [
      "node_modules/",
      gitignoreStartMarker,
      "!.ai-native/",
      ".ai-native/*",
      "!.ai-native/repo-config.json",
      "!.ai-native/feedback/",
      gitignoreEndMarker,
      ""
    ].join("\n")
  );
  require("child_process").execFileSync("git", ["add", "-f", ".ai-native", ".gitignore"], {
    cwd: legacyRoot
  });
  require("child_process").execFileSync("git", ["commit", "-m", "legacy seed"], {
    cwd: legacyRoot,
    stdio: "ignore"
  });

  const legacyInspection = inspectSyncState(legacyRoot);
  assert.ok(legacyInspection.trackedAiNativePaths.length > 0);
  const blockedCliMigration = require("child_process").spawnSync(
    process.execPath,
    [path.join(__dirname, "..", "scripts", "sync.js"), legacyRoot, "--without-instructions"],
    { cwd: path.join(__dirname, ".."), encoding: "utf8" }
  );
  assert.strictEqual(blockedCliMigration.status, 2);
  assert.ok(blockedCliMigration.stdout.includes("MIGRATION-REQUIRED"));
  assert.ok(inspectSyncState(legacyRoot).trackedAiNativePaths.length > 0);
  const migrationPreview = applySync({ targetRoot: legacyRoot, dryRun: true, migrateTrackedAssets: true });
  assert.ok(migrationPreview.logs.some((line) => line.startsWith("UNTRACK ")));

  const migrationResult = applySync({ targetRoot: legacyRoot, migrateTrackedAssets: true });
  assert.ok(migrationResult.logs.some((line) => line.includes("local files preserved")));
  assert.deepStrictEqual(inspectSyncState(legacyRoot).trackedAiNativePaths, []);
  assert.ok(fs.existsSync(path.join(legacyRoot, ".ai-native", "feedback", "toil", "legacy-local-note.md")));
  assert.strictEqual(
    read(legacyRoot, ".gitignore"),
    `node_modules/\n\n${gitignoreRule}\n`
  );
  const stagedMigration = require("child_process").execFileSync(
    "git",
    ["diff", "--cached", "--name-only"],
    { cwd: legacyRoot, encoding: "utf8" }
  );
  assert.ok(stagedMigration.includes(".ai-native/core-operating-rules.md"));

  const instructionRoot = path.join(tempRoot, "instruction-repo");
  fs.mkdirSync(instructionRoot);
  applySync({ targetRoot: instructionRoot });
  const autoInstructionResult = await applyInstructionFiles({
    targetRoot: instructionRoot,
    mode: "auto"
  });
  assert.ok(fs.existsSync(path.join(instructionRoot, "AGENTS.md")));
  assert.ok(fs.lstatSync(path.join(instructionRoot, "CLAUDE.md")).isSymbolicLink());
  assert.strictEqual(fs.readlinkSync(path.join(instructionRoot, "CLAUDE.md")), "AGENTS.md");
  assert.ok(
    fs.lstatSync(path.join(instructionRoot, ".github", "copilot-instructions.md")).isSymbolicLink()
  );
  assert.strictEqual(
    fs.readlinkSync(path.join(instructionRoot, ".github", "copilot-instructions.md")),
    "../AGENTS.md"
  );
  assert.strictEqual(read(instructionRoot, "CLAUDE.md"), read(instructionRoot, "AGENTS.md"));
  assert.strictEqual(
    read(instructionRoot, ".github/copilot-instructions.md"),
    read(instructionRoot, "AGENTS.md")
  );
  assert.strictEqual(autoInstructionResult.effectiveMode, "replace");
  assert.ok(autoInstructionResult.logs.some((line) => line.includes("INSTRUCTION-REPLACE")));

  const comparisonInstructionRoot = path.join(tempRoot, "different-instruction-repo");
  fs.mkdirSync(comparisonInstructionRoot);
  await applyInstructionFiles({
    targetRoot: comparisonInstructionRoot,
    mode: "auto"
  });
  assert.strictEqual(
    read(comparisonInstructionRoot, "AGENTS.md"),
    read(instructionRoot, "AGENTS.md"),
    "managed AGENTS.md must be byte-identical across repository names"
  );

  const keepRoot = path.join(tempRoot, "keep-repo");
  fs.mkdirSync(keepRoot);
  applySync({ targetRoot: keepRoot });
  fs.writeFileSync(path.join(keepRoot, "AGENTS.md"), "# Custom AGENTS\n");
  fs.writeFileSync(path.join(keepRoot, "CLAUDE.md"), "# Custom CLAUDE\n");
  ensureDir(path.join(keepRoot, ".github"));
  fs.writeFileSync(
    path.join(keepRoot, ".github", "copilot-instructions.md"),
    "# Custom Copilot\n"
  );
  const keepInstructionResult = await applyInstructionFiles({
    targetRoot: keepRoot,
    mode: "keep"
  });
  assert.ok(read(keepRoot, "AGENTS.md").includes(referenceLine));
  assert.strictEqual(read(keepRoot, "CLAUDE.md"), "# Custom CLAUDE\n");
  assert.strictEqual(
    read(keepRoot, ".github/copilot-instructions.md"),
    "# Custom Copilot\n"
  );
  assert.ok(keepInstructionResult.logs.some((line) => line.includes("INSTRUCTION-KEEP")));

  const legacyAppendRoot = path.join(tempRoot, "legacy-append-repo");
  fs.mkdirSync(legacyAppendRoot);
  applySync({ targetRoot: legacyAppendRoot });
  const oldBlock = `${appendStartMarker}\n## AI Native Shared Guidance\n${appendEndMarker}`;
  fs.writeFileSync(path.join(legacyAppendRoot, "AGENTS.md"), `# Existing\n\n${oldBlock}\n`);
  fs.writeFileSync(path.join(legacyAppendRoot, "CLAUDE.md"), `# Claude\n\n${oldBlock}\n`);
  ensureDir(path.join(legacyAppendRoot, ".github"));
  fs.symlinkSync("../AGENTS.md", path.join(legacyAppendRoot, ".github", "copilot-instructions.md"));
  const legacyAppendResult = await applyInstructionFiles({
    targetRoot: legacyAppendRoot,
    mode: "auto"
  });
  assert.strictEqual(legacyAppendResult.effectiveMode, "keep");
  assert.ok(read(legacyAppendRoot, "AGENTS.md").includes(referenceLine));
  assert.ok(!read(legacyAppendRoot, "AGENTS.md").includes(appendStartMarker));
  assert.strictEqual(read(legacyAppendRoot, "CLAUDE.md"), "# Claude\n");
  assert.ok(!fs.existsSync(path.join(legacyAppendRoot, ".github", "copilot-instructions.md")));

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
  assert.ok(conflictInstructionResult.logs.some((line) => line.includes("--instructions-mode=keep")));

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

  const legacyForkedRoot = path.join(tempRoot, "legacy-forked-repo");
  fs.mkdirSync(legacyForkedRoot);
  applySync({ targetRoot: legacyForkedRoot });
  const legacyForkedConfigPath = path.join(legacyForkedRoot, repoConfigFile);
  const legacyForkedConfig = JSON.parse(fs.readFileSync(legacyForkedConfigPath, "utf8"));
  legacyForkedConfig.standardsMode = "forked";
  fs.writeFileSync(legacyForkedConfigPath, JSON.stringify(legacyForkedConfig, null, 2) + "\n");
  fs.writeFileSync(
    path.join(legacyForkedRoot, ".ai-native", "core-operating-rules.md"),
    "forked local standards\n"
  );
  const legacyForkedInspection = inspectSyncState(legacyForkedRoot);
  assert.strictEqual(legacyForkedInspection.status, "outdated");

  const legacyForkedResult = applySync({ targetRoot: legacyForkedRoot });
  assert.strictEqual(legacyForkedResult.action, "sync");
  assert.notStrictEqual(
    read(legacyForkedRoot, ".ai-native/core-operating-rules.md"),
    "forked local standards\n"
  );
  const migratedConfig = JSON.parse(read(legacyForkedRoot, repoConfigFile));
  assert.strictEqual(migratedConfig.installMode, "local");
  assert.ok(!Object.prototype.hasOwnProperty.call(migratedConfig, "standardsMode"));

  console.log("Shared asset sync verification passed.");
}

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
