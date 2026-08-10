const fs = require("fs");
const path = require("path");

const { stateFile } = require("./shared-assets");

const repoSurfaceIndexBootstrapId = "repo-surface-index-v1";
const minimumStateSchemaVersion = 2;

function readState(targetRoot) {
  const targetPath = path.join(path.resolve(targetRoot), stateFile);
  if (!fs.existsSync(targetPath)) return { targetPath, state: null };
  return {
    targetPath,
    state: JSON.parse(fs.readFileSync(targetPath, "utf8"))
  };
}

function completedBootstraps(state) {
  return Array.isArray(state?.completedBootstraps)
    ? state.completedBootstraps.filter((entry) => typeof entry === "string")
    : [];
}

function isRepoSurfaceIndexBootstrapComplete(state) {
  return completedBootstraps(state).includes(repoSurfaceIndexBootstrapId);
}

function writeState(targetPath, state) {
  const temporaryPath = path.join(
    path.dirname(targetPath),
    `.${path.basename(targetPath)}.${process.pid}.tmp`
  );

  try {
    fs.writeFileSync(temporaryPath, `${JSON.stringify(state, null, 2)}\n`);
    fs.renameSync(temporaryPath, targetPath);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.rmSync(temporaryPath);
  }
}

function recordBootstrapCompletion(targetPath, state) {
  const nextState = {
    ...state,
    schemaVersion: Math.max(
      minimumStateSchemaVersion,
      Number.isInteger(state.schemaVersion) ? state.schemaVersion : 0
    ),
    completedBootstraps: [
      ...new Set([...completedBootstraps(state), repoSurfaceIndexBootstrapId])
    ].sort()
  };
  writeState(targetPath, nextState);
  return nextState;
}

function bootstrapRepoSurfaceIndex({ targetRoot, dryRun = false, indexer } = {}) {
  if (!targetRoot) throw new Error("A target repo path is required.");

  const resolvedTargetRoot = path.resolve(targetRoot);
  let stateResult;

  try {
    stateResult = readState(resolvedTargetRoot);
  } catch (error) {
    return {
      action: "failed",
      bootstrapId: repoSurfaceIndexBootstrapId,
      targetRoot: resolvedTargetRoot,
      logs: [`INDEX-WARN could not read sync state; bootstrap remains pending: ${error.message}`]
    };
  }

  if (isRepoSurfaceIndexBootstrapComplete(stateResult.state)) {
    return {
      action: "skip",
      bootstrapId: repoSurfaceIndexBootstrapId,
      targetRoot: resolvedTargetRoot,
      logs: []
    };
  }

  if (dryRun) {
    return {
      action: "preview",
      bootstrapId: repoSurfaceIndexBootstrapId,
      targetRoot: resolvedTargetRoot,
      logs: [
        `INDEX-BOOTSTRAP ${repoSurfaceIndexBootstrapId} is pending; dry run did not build or record it`
      ]
    };
  }

  if (!stateResult.state) {
    return {
      action: "failed",
      bootstrapId: repoSurfaceIndexBootstrapId,
      targetRoot: resolvedTargetRoot,
      logs: [
        `INDEX-WARN sync state is missing at ${stateResult.targetPath}; bootstrap remains pending`
      ]
    };
  }

  try {
    const surfaceIndexer = indexer || require("./repo-surface-index");
    const indexPath = surfaceIndexer.defaultIndexPath(resolvedTargetRoot);
    const index = surfaceIndexer.buildSurfaceIndex(resolvedTargetRoot, {
      outputPath: indexPath
    });
    surfaceIndexer.writeIndex(indexPath, index);
    recordBootstrapCompletion(stateResult.targetPath, stateResult.state);

    return {
      action: "bootstrapped",
      bootstrapId: repoSurfaceIndexBootstrapId,
      targetRoot: resolvedTargetRoot,
      indexPath,
      summary: index.summary,
      logs: [
        `INDEX-BOOTSTRAP ${repoSurfaceIndexBootstrapId} completed at ${indexPath} records=${index.summary.records}`
      ]
    };
  } catch (error) {
    return {
      action: "failed",
      bootstrapId: repoSurfaceIndexBootstrapId,
      targetRoot: resolvedTargetRoot,
      logs: [`INDEX-WARN bootstrap failed and will retry on the next sync: ${error.message}`]
    };
  }
}

module.exports = {
  bootstrapRepoSurfaceIndex,
  isRepoSurfaceIndexBootstrapComplete,
  repoSurfaceIndexBootstrapId
};
