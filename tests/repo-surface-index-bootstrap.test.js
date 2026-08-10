const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");

const {
  bootstrapRepoSurfaceIndex,
  isRepoSurfaceIndexBootstrapComplete,
  repoSurfaceIndexBootstrapId
} = require("../scripts/repo-surface-index-bootstrap");
const { defaultIndexPath } = require("../scripts/repo-surface-index");
const { applySync, stateFile } = require("../scripts/shared-assets");

function initializeRepo(root) {
  fs.mkdirSync(root, { recursive: true });
  execFileSync("git", ["init"], { cwd: root, stdio: "ignore" });
}

function readState(root) {
  return JSON.parse(fs.readFileSync(path.join(root, stateFile), "utf8"));
}

function write(root, relativePath, contents) {
  const targetPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, contents);
}

function recordingIndexer(indexPath, calls, { fail = false } = {}) {
  return {
    defaultIndexPath() {
      calls.defaultIndexPath += 1;
      return indexPath;
    },
    buildSurfaceIndex() {
      calls.build += 1;
      if (fail) throw new Error("fixture index failure");
      return { summary: { records: 1 } };
    },
    writeIndex(targetPath, index) {
      calls.write += 1;
      write(path.dirname(targetPath), path.basename(targetPath), JSON.stringify(index));
    }
  };
}

function run() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "repo-index-bootstrap-test-"));
  const sourceRoot = path.join(__dirname, "..");
  const syncScript = path.join(sourceRoot, "scripts", "sync.js");

  try {
    const legacyRoot = path.join(tempRoot, "legacy-consumer");
    initializeRepo(legacyRoot);
    applySync({ targetRoot: legacyRoot });
    const legacyStatePath = path.join(legacyRoot, stateFile);
    const legacyState = readState(legacyRoot);
    legacyState.schemaVersion = 1;
    delete legacyState.completedBootstraps;
    fs.writeFileSync(legacyStatePath, `${JSON.stringify(legacyState, null, 2)}\n`);

    const calls = { defaultIndexPath: 0, build: 0, write: 0 };
    const fixtureIndexPath = path.join(tempRoot, "fixture-index.json");
    const indexer = recordingIndexer(fixtureIndexPath, calls);
    const first = bootstrapRepoSurfaceIndex({ targetRoot: legacyRoot, indexer });
    assert.strictEqual(first.action, "bootstrapped");
    assert.deepStrictEqual(calls, { defaultIndexPath: 1, build: 1, write: 1 });
    assert.strictEqual(readState(legacyRoot).schemaVersion, 2);
    assert.ok(readState(legacyRoot).completedBootstraps.includes(repoSurfaceIndexBootstrapId));

    fs.rmSync(fixtureIndexPath);
    const second = bootstrapRepoSurfaceIndex({ targetRoot: legacyRoot, indexer });
    assert.strictEqual(second.action, "skip");
    assert.deepStrictEqual(calls, { defaultIndexPath: 1, build: 1, write: 1 });
    assert.ok(!fs.existsSync(fixtureIndexPath), "a completed bootstrap must not recreate a missing cache");

    const driftedState = readState(legacyRoot);
    driftedState.assetVersion = "00.00.0";
    fs.writeFileSync(legacyStatePath, `${JSON.stringify(driftedState, null, 2)}\n`);
    applySync({ targetRoot: legacyRoot });
    assert.ok(
      readState(legacyRoot).completedBootstraps.includes(repoSurfaceIndexBootstrapId),
      "later asset syncs must preserve completed bootstrap markers"
    );

    const dryRunRoot = path.join(tempRoot, "dry-run-consumer");
    initializeRepo(dryRunRoot);
    applySync({ targetRoot: dryRunRoot });
    const dryRunCalls = { defaultIndexPath: 0, build: 0, write: 0 };
    const preview = bootstrapRepoSurfaceIndex({
      targetRoot: dryRunRoot,
      dryRun: true,
      indexer: recordingIndexer(path.join(tempRoot, "dry-run-index.json"), dryRunCalls)
    });
    assert.strictEqual(preview.action, "preview");
    assert.deepStrictEqual(dryRunCalls, { defaultIndexPath: 0, build: 0, write: 0 });
    assert.ok(!isRepoSurfaceIndexBootstrapComplete(readState(dryRunRoot)));

    const failureRoot = path.join(tempRoot, "failure-consumer");
    initializeRepo(failureRoot);
    applySync({ targetRoot: failureRoot });
    const failureCalls = { defaultIndexPath: 0, build: 0, write: 0 };
    const failed = bootstrapRepoSurfaceIndex({
      targetRoot: failureRoot,
      indexer: recordingIndexer(path.join(tempRoot, "failure-index.json"), failureCalls, {
        fail: true
      })
    });
    assert.strictEqual(failed.action, "failed");
    assert.ok(failed.logs.some((line) => line.includes("will retry")));
    assert.ok(!isRepoSurfaceIndexBootstrapComplete(readState(failureRoot)));
    const retried = bootstrapRepoSurfaceIndex({
      targetRoot: failureRoot,
      indexer: recordingIndexer(path.join(tempRoot, "retry-index.json"), failureCalls)
    });
    assert.strictEqual(retried.action, "bootstrapped");
    assert.strictEqual(failureCalls.build, 2);

    const freshRoot = path.join(tempRoot, "fresh-cli-consumer");
    initializeRepo(freshRoot);
    write(freshRoot, "src/public.js", "export function firstSurface(input) { return input; }\n");
    const freshSync = spawnSync(
      process.execPath,
      [syncScript, freshRoot, "--without-instructions"],
      { cwd: sourceRoot, encoding: "utf8" }
    );
    assert.strictEqual(freshSync.status, 0, freshSync.stderr);
    assert.ok(freshSync.stdout.includes("INDEX-BOOTSTRAP"));
    assert.ok(isRepoSurfaceIndexBootstrapComplete(readState(freshRoot)));
    const cachePath = defaultIndexPath(freshRoot);
    assert.ok(fs.existsSync(cachePath));
    assert.ok(fs.existsSync(path.join(freshRoot, ".ai-native", "tools", "repo-surface-index.js")));
    assert.ok(fs.existsSync(path.join(freshRoot, ".ai-native", "skills", "dry-context", "SKILL.md")));

    fs.rmSync(cachePath);
    write(freshRoot, "src/public.js", "export function secondSurface(input, options) { return input; }\n");
    const repeatedSync = spawnSync(
      process.execPath,
      [syncScript, freshRoot, "--without-instructions"],
      { cwd: sourceRoot, encoding: "utf8" }
    );
    assert.strictEqual(repeatedSync.status, 0, repeatedSync.stderr);
    assert.ok(!repeatedSync.stdout.includes("INDEX-BOOTSTRAP"));
    assert.ok(!fs.existsSync(cachePath), "a subsequent sync must not invoke indexing at all");

    const installedTool = path.join(freshRoot, ".ai-native", "tools", "repo-surface-index.js");
    const query = spawnSync(
      process.execPath,
      [installedTool, "query", "secondSurface", "--root", freshRoot, "--json"],
      { encoding: "utf8" }
    );
    assert.strictEqual(query.status, 0, query.stderr);
    assert.strictEqual(JSON.parse(query.stdout).results[0].name, "secondSurface");
    assert.ok(fs.existsSync(cachePath), "query-time refresh remains independent of sync bootstrap");

    const legacyCliRoot = path.join(tempRoot, "legacy-cli-consumer");
    initializeRepo(legacyCliRoot);
    write(
      legacyCliRoot,
      "src/legacy.js",
      "export function legacySurface(input) { return input; }\n"
    );
    applySync({ targetRoot: legacyCliRoot });
    const legacyCliStatePath = path.join(legacyCliRoot, stateFile);
    const legacyCliState = readState(legacyCliRoot);
    legacyCliState.schemaVersion = 1;
    delete legacyCliState.completedBootstraps;
    fs.writeFileSync(legacyCliStatePath, `${JSON.stringify(legacyCliState, null, 2)}\n`);

    const migratedLegacySync = spawnSync(
      process.execPath,
      [syncScript, legacyCliRoot, "--without-instructions"],
      { cwd: sourceRoot, encoding: "utf8" }
    );
    assert.strictEqual(migratedLegacySync.status, 0, migratedLegacySync.stderr);
    assert.ok(migratedLegacySync.stdout.includes("INDEX-BOOTSTRAP"));
    assert.ok(isRepoSurfaceIndexBootstrapComplete(readState(legacyCliRoot)));
    const legacyCliCachePath = defaultIndexPath(legacyCliRoot);
    assert.ok(fs.existsSync(legacyCliCachePath));

    fs.rmSync(legacyCliCachePath);
    const repeatedLegacySync = spawnSync(
      process.execPath,
      [syncScript, legacyCliRoot, "--without-instructions"],
      { cwd: sourceRoot, encoding: "utf8" }
    );
    assert.strictEqual(repeatedLegacySync.status, 0, repeatedLegacySync.stderr);
    assert.ok(!repeatedLegacySync.stdout.includes("INDEX-BOOTSTRAP"));
    assert.ok(!fs.existsSync(legacyCliCachePath));

    const freshDryRunRoot = path.join(tempRoot, "fresh-cli-dry-run");
    initializeRepo(freshDryRunRoot);
    const freshDryRun = spawnSync(
      process.execPath,
      [syncScript, freshDryRunRoot, "--without-instructions", "--dry-run"],
      { cwd: sourceRoot, encoding: "utf8" }
    );
    assert.strictEqual(freshDryRun.status, 0, freshDryRun.stderr);
    assert.ok(freshDryRun.stdout.includes("dry run did not build or record it"));
    assert.ok(!fs.existsSync(path.join(freshDryRunRoot, ".ai-native")));
    assert.ok(!fs.existsSync(defaultIndexPath(freshDryRunRoot)));

    const nonGitConsumerRoot = path.join(tempRoot, "non-git-consumer");
    fs.mkdirSync(nonGitConsumerRoot);
    write(
      nonGitConsumerRoot,
      "src/non-git.js",
      "export function nonGitSurface(input) { return input; }\n"
    );
    const nonGitSync = spawnSync(
      process.execPath,
      [syncScript, nonGitConsumerRoot, "--without-instructions"],
      { cwd: sourceRoot, encoding: "utf8" }
    );
    assert.strictEqual(nonGitSync.status, 0, nonGitSync.stderr);
    const nonGitCachePath = defaultIndexPath(nonGitConsumerRoot);
    assert.strictEqual(
      nonGitCachePath,
      path.join(nonGitConsumerRoot, ".ai-native", "cache", "repo-surface-index.json")
    );
    assert.ok(fs.existsSync(nonGitCachePath));
    assert.strictEqual(fs.readFileSync(path.join(nonGitConsumerRoot, ".gitignore"), "utf8"), ".ai-native/\n");
    execFileSync("git", ["init"], { cwd: nonGitConsumerRoot, stdio: "ignore" });
    const ignoredAfterGitInit = spawnSync(
      "git",
      ["check-ignore", "-q", ".ai-native/cache/repo-surface-index.json"],
      { cwd: nonGitConsumerRoot }
    );
    assert.strictEqual(ignoredAfterGitInit.status, 0);

    console.log("Repository surface index bootstrap tests passed.");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

run();
