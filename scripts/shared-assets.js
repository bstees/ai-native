const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const manifest = require("./shared-assets-manifest");
const {
  buildManagedRepoConfig,
  getRepoConfig,
  getSourceConfig,
  repoConfigFile
} = require("./repo-role");
const { version } = require("./shared-assets-version");

const sourceRoot = path.join(__dirname, "..");
const aiNativeDir = ".ai-native";
const stateFile = path.join(aiNativeDir, ".sync-state.json");
const gitignoreFile = ".gitignore";
const gitignoreStartMarker = "# ai-native managed assets:start";
const gitignoreEndMarker = "# ai-native managed assets:end";

function buildGeneratedFiles() {
  return [
    {
      target: ".ai-native/README.md",
      contents: [
        "# AI Native Assets",
        "",
        "This directory contains assets installed from the `AI Native` repository.",
        "",
        "- `core-operating-rules.md` is the current shared baseline for AI-agent behavior.",
        "- `goal-and-plan-mode.md` defines when work must start in explicit planning.",
        "- `engineering-quality.md` defines the shared engineering quality bar.",
        "- `repo-onboarding-audit.md` is the first-time adoption workflow for this repo.",
        "- `ui-quality-standard.md` defines the cross-repo UI quality bar.",
        "- `ui-review-checklist.md` is the default UI approval checklist.",
        "- `usability-validation-standard.md` requires browser or simulator flow validation.",
        "- `agent-orchestration/` defines portable sub-agent profiles, context policy, routing, and provider adapters.",
        "- `feedback/` is the repo-local source of truth for toil, developer notes, and audits.",
        "- Local additions should stay minimal and repo-specific."
      ].join("\n")
    },
    {
      target: ".ai-native/feedback/capture-guidance.md",
      contents: [
        "# Feedback Capture Guidance",
        "",
        "Use markdown in this directory as the source of truth for repo-local feedback.",
        "",
        "- `toil/` is for friction uncovered while doing work.",
        "- `developer-notes/` is for markdown written directly by developers.",
        "- `../audits/` is for structured standards and onboarding reviews.",
        "- Review feedback on a commit-time sweep and on a recurring cadence."
      ].join("\n")
    },
    {
      target: ".ai-native/feedback/toil/README.md",
      contents: [
        "# Toil Feedback",
        "",
        "Create a markdown entry here whenever delivery friction could have been reduced with better guidance.",
        "",
        "Use `../feedback-entry-template.md` as the default structure."
      ].join("\n")
    },
    {
      target: ".ai-native/feedback/developer-notes/README.md",
      contents: [
        "# Developer Notes Feedback",
        "",
        "Markdown created here by developers should be treated as feedback input during commit-time and scheduled ingestion reviews."
      ].join("\n")
    },
    {
      target: ".ai-native/audits/README.md",
      contents: [
        "# Repo Audits",
        "",
        "Store onboarding audits, standards reviews, and recurring ecosystem health checks here."
      ].join("\n")
    }
  ];
}

function getManagedFiles() {
  const copiedFiles = manifest.map((entry) => ({
    target: entry.target,
    contents: fs.readFileSync(path.join(sourceRoot, entry.source), "utf8"),
    source: entry.source,
    kind: "copied"
  }));

  const generatedFiles = buildGeneratedFiles().map((entry) => ({
    target: entry.target,
    contents: entry.contents,
    source: "generated",
    kind: "generated"
  }));

  return [...copiedFiles, ...generatedFiles].sort((left, right) =>
    left.target.localeCompare(right.target)
  );
}

function getManagedIgnorePaths() {
  return [stateFile, ...getManagedFiles().map(({ target }) => target)];
}

function getRepoOwnedPaths() {
  return [
    ".ai-native/repo-config.json",
    ".ai-native/feedback/",
    ".ai-native/feedback/toil/",
    ".ai-native/feedback/developer-notes/",
    ".ai-native/audits/"
  ];
}

function getState(targetRoot) {
  const targetPath = path.join(targetRoot, stateFile);

  if (!fs.existsSync(targetPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(targetPath, "utf8"));
}

function buildState(managedFiles) {
  return {
    schemaVersion: 1,
    assetVersion: version,
    managedFiles: managedFiles.map((entry) => entry.target)
  };
}

function buildRepoConfigContents(existingConfig, targetRoot) {
  const defaultRepoName = path.basename(targetRoot);
  const config = {
    ...buildManagedRepoConfig({ repoName: defaultRepoName }),
    ...(existingConfig || {})
  };

  if (config.repoRole !== "consumer") {
    config.repoRole = "consumer";
  }

  if (!config.standardsMode) {
    config.standardsMode = "managed";
  }

  return JSON.stringify(config, null, 2) + "\n";
}

function ensureDir(directory, dryRun) {
  if (!dryRun) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function buildManagedGitignoreBlock() {
  return [
    gitignoreStartMarker,
    "!.ai-native/",
    ".ai-native/*",
    "!.ai-native/repo-config.json",
    "!.ai-native/feedback/",
    "!.ai-native/feedback/toil/",
    "!.ai-native/feedback/developer-notes/",
    "!.ai-native/audits/",
    ...getManagedIgnorePaths(),
    gitignoreEndMarker
  ].join("\n");
}

function updateGitignoreContents(existingContents) {
  const block = buildManagedGitignoreBlock();

  if (existingContents.includes(gitignoreStartMarker) && existingContents.includes(gitignoreEndMarker)) {
    return existingContents.replace(
      new RegExp(`${gitignoreStartMarker}[\\s\\S]*${gitignoreEndMarker}`),
      block
    );
  }

  const trimmed = existingContents.trimEnd();
  return `${trimmed}${trimmed ? "\n\n" : ""}${block}\n`;
}

function writeFile(targetPath, contents, dryRun, logs, action = "WRITE") {
  ensureDir(path.dirname(targetPath), dryRun);
  logs.push(`${action} ${targetPath}`);
  if (!dryRun) {
    fs.writeFileSync(targetPath, contents);
  }
}

function removeFile(targetPath, dryRun, logs) {
  logs.push(`REMOVE ${targetPath}`);
  if (!dryRun && fs.existsSync(targetPath)) {
    fs.rmSync(targetPath);
  }
}

function gitCommandSucceeds(targetRoot, args) {
  try {
    execFileSync("git", ["-C", targetRoot, ...args], {
      stdio: ["ignore", "pipe", "ignore"]
    });
    return true;
  } catch (error) {
    if (error.status === 1 || error.status === 128) {
      return false;
    }
    throw error;
  }
}

function detectGitIgnoreStatus(targetRoot) {
  if (!gitCommandSucceeds(targetRoot, ["rev-parse", "--is-inside-work-tree"])) {
    return {
      isGitRepo: false,
      ignoredPaths: [],
      ignoredManagedPaths: [],
      ignoredRepoOwnedPaths: []
    };
  }

  const ignoredManagedPaths = getManagedIgnorePaths().filter((relativePath) =>
    gitCommandSucceeds(targetRoot, ["check-ignore", "-q", relativePath])
  );
  const ignoredRepoOwnedPaths = getRepoOwnedPaths().filter((relativePath) =>
    gitCommandSucceeds(targetRoot, ["check-ignore", "-q", relativePath])
  );

  return {
    isGitRepo: true,
    ignoredPaths: [...new Set([...ignoredManagedPaths, ...ignoredRepoOwnedPaths])],
    ignoredManagedPaths,
    ignoredRepoOwnedPaths
  };
}

function inspectSyncState(targetRoot) {
  if (!targetRoot) {
    throw new Error("A target repo path is required.");
  }

  const resolvedTargetRoot = path.resolve(targetRoot);

  if (!fs.existsSync(resolvedTargetRoot)) {
    throw new Error(`Target repo not found at ${resolvedTargetRoot}`);
  }

  const managedFiles = getManagedFiles();
  const desiredTargets = new Set(managedFiles.map((entry) => entry.target));
  const existingState = getState(resolvedTargetRoot);
  const repoConfig = getRepoConfig(resolvedTargetRoot);
  const sourceConfig = getSourceConfig(resolvedTargetRoot);
  const aiNativePath = path.join(resolvedTargetRoot, aiNativeDir);
  const hasAiNativeDir = fs.existsSync(aiNativePath);
  const gitIgnoreStatus = detectGitIgnoreStatus(resolvedTargetRoot);
  const repoRole = sourceConfig?.repoRole || repoConfig?.repoRole || "consumer";
  const standardsMode = repoRole === "consumer" ? repoConfig?.standardsMode || "managed" : null;

  const missingFiles = [];
  const outdatedFiles = [];
  const versionStatus =
    !existingState?.assetVersion ? "missing" : existingState.assetVersion === version ? "current" : "outdated";

  for (const entry of managedFiles) {
    const targetPath = path.join(resolvedTargetRoot, entry.target);
    if (!fs.existsSync(targetPath)) {
      missingFiles.push(entry.target);
      continue;
    }

    const currentContents = fs.readFileSync(targetPath, "utf8");
    if (currentContents !== entry.contents) {
      outdatedFiles.push(entry.target);
    }
  }

  const staleManagedFiles = (existingState?.managedFiles || []).filter(
    (target) => !desiredTargets.has(target)
  );

  const status = !hasAiNativeDir
    ? repoRole === "source"
      ? "source"
      : "new"
    : repoRole === "source"
      ? "source"
    : standardsMode === "forked"
      ? "forked"
    : versionStatus !== "current" ||
        missingFiles.length > 0 ||
        outdatedFiles.length > 0 ||
        staleManagedFiles.length > 0
      ? "outdated"
      : "up-to-date";

  return {
    targetRoot: resolvedTargetRoot,
    status,
    assetVersion: version,
    versionStatus,
    repoRole,
    standardsMode,
    repoConfig,
    sourceConfig,
    managedFiles,
    missingFiles,
    outdatedFiles,
    staleManagedFiles,
    hasAiNativeDir,
    gitIgnoredPaths: gitIgnoreStatus.ignoredPaths,
    ignoredManagedPaths: gitIgnoreStatus.ignoredManagedPaths,
    ignoredRepoOwnedPaths: gitIgnoreStatus.ignoredRepoOwnedPaths,
    isGitRepo: gitIgnoreStatus.isGitRepo,
    existingState
  };
}

function applySync({ targetRoot, dryRun = false }) {
  const inspection = inspectSyncState(targetRoot);
  const logs = [];

  const repoConfigContents = buildRepoConfigContents(inspection.repoConfig, inspection.targetRoot);

  if (inspection.status === "source") {
    logs.push(
      `SOURCE ${inspection.targetRoot} is the AI Native source repo; sync only applies to downstream consumer repos`
    );
    return {
      ...inspection,
      action: "source",
      logs
    };
  }

  if (inspection.status === "forked") {
    writeFile(
      path.join(inspection.targetRoot, repoConfigFile),
      repoConfigContents,
      dryRun,
      logs,
      "CONFIG"
    );
    writeFile(path.join(inspection.targetRoot, stateFile), JSON.stringify(buildState(inspection.managedFiles), null, 2) + "\n", dryRun, logs, "STATE ");
    logs.push(
      `FORKED ${path.join(inspection.targetRoot, aiNativeDir)} is diverged from AI Native; managed assets were not overwritten`
    );
    return {
      ...inspection,
      action: "forked",
      logs
    };
  }

  if (inspection.repoRole === "consumer" && inspection.standardsMode === "managed" && inspection.isGitRepo) {
    const gitignorePath = path.join(inspection.targetRoot, gitignoreFile);
    const existingGitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, "utf8") : "";
    const desiredGitignore = updateGitignoreContents(existingGitignore);

    if (existingGitignore !== desiredGitignore) {
      writeFile(gitignorePath, desiredGitignore, dryRun, logs, "GITIGNORE");
    } else {
      logs.push(`OK    ${gitignorePath}`);
    }
  }

  if (inspection.status === "up-to-date") {
    writeFile(
      path.join(inspection.targetRoot, repoConfigFile),
      repoConfigContents,
      dryRun,
      logs,
      "CONFIG"
    );
    if (inspection.ignoredRepoOwnedPaths.length > 0) {
      logs.push(
        `WARN  ${inspection.ignoredRepoOwnedPaths.join(", ")} is ignored by git in ${inspection.targetRoot}`
      );
    }
    logs.push(
      `OK    ${path.join(inspection.targetRoot, aiNativeDir)} is already up to date at ${inspection.assetVersion}`
    );
    return {
      ...inspection,
      action: "no-op",
      logs
    };
  }

  for (const entry of inspection.managedFiles) {
    const targetPath = path.join(inspection.targetRoot, entry.target);
    const exists = fs.existsSync(targetPath);
    const currentContents = exists ? fs.readFileSync(targetPath, "utf8") : null;

    if (!exists) {
      writeFile(targetPath, entry.contents, dryRun, logs, "CREATE");
      continue;
    }

    if (currentContents !== entry.contents) {
      writeFile(targetPath, entry.contents, dryRun, logs, "UPDATE");
    }
  }

  for (const relativePath of inspection.staleManagedFiles) {
    removeFile(path.join(inspection.targetRoot, relativePath), dryRun, logs);
  }

  writeFile(
    path.join(inspection.targetRoot, repoConfigFile),
    repoConfigContents,
    dryRun,
    logs,
    "CONFIG"
  );
  const stateContents = JSON.stringify(buildState(inspection.managedFiles), null, 2) + "\n";
  writeFile(path.join(inspection.targetRoot, stateFile), stateContents, dryRun, logs, "STATE ");

  if (inspection.ignoredRepoOwnedPaths.length > 0) {
    logs.push(
      `WARN  ${inspection.ignoredRepoOwnedPaths.join(", ")} is ignored by git in ${inspection.targetRoot}`
    );
  }

  logs.push(
    inspection.status === "new"
      ? `INSTALLED ${path.join(inspection.targetRoot, aiNativeDir)} at ${inspection.assetVersion}`
      : `SYNCED ${path.join(inspection.targetRoot, aiNativeDir)} to ${inspection.assetVersion}`
  );

  return {
    ...inspection,
    action: inspection.status === "new" ? "install" : "sync",
    logs
  };
}

module.exports = {
  aiNativeDir,
  stateFile,
  gitignoreFile,
  gitignoreStartMarker,
  gitignoreEndMarker,
  getManagedIgnorePaths,
  getRepoOwnedPaths,
  repoConfigFile,
  getManagedFiles,
  inspectSyncState,
  applySync
};
