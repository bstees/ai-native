const path = require("path");
const readline = require("readline");

const { applyInstructionFiles, formatConflictCommands, inspectInstructionFiles } = require("./instruction-files");
const { applySync, inspectSyncState } = require("./shared-assets");

function formatInspection(inspection) {
  const lines = [
    `STATUS ${inspection.status} ${path.join(inspection.targetRoot, ".ai-native")} role=${inspection.repoRole} target=${inspection.assetVersion}`
  ];

  if (inspection.versionStatus !== "current") {
    lines.push(
      `VERSION ${inspection.versionStatus} current=${inspection.existingState?.assetVersion || "none"} target=${inspection.assetVersion}`
    );
  }

  if (inspection.status === "source") {
    lines.push("ROLE source repos publish standards; they do not consume downstream sync updates");
  }

  if (inspection.gitIgnoredPaths.length > 0) {
    lines.push(`IGNORED ${inspection.gitIgnoredPaths.join(", ")}`);
  }

  if (inspection.missingFiles.length > 0) {
    lines.push(`MISSING ${inspection.missingFiles.join(", ")}`);
  }

  if (inspection.outdatedFiles.length > 0) {
    lines.push(`OUTDATED ${inspection.outdatedFiles.join(", ")}`);
  }

  if (inspection.staleManagedFiles.length > 0) {
    lines.push(`STALE ${inspection.staleManagedFiles.join(", ")}`);
  }

  if (inspection.trackedAiNativePaths.length > 0) {
    lines.push(`TRACKED ${inspection.trackedAiNativePaths.length} legacy .ai-native path(s)`);
  }

  return lines;
}

function printUsage() {
  console.log(
    "Usage: node scripts/sync.js <target-repo-path> [--dry-run] [--without-instructions] [--instructions-mode=replace|keep|skip] [--migrate-tracked-assets] [--yes]"
  );
}

async function confirmTrackedMigration(count) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) =>
    rl.question(
      `Remove ${count} legacy .ai-native path(s) from the Git index while preserving local files? [y/N] `,
      resolve
    )
  );
  rl.close();
  return ["y", "yes"].includes(answer.trim().toLowerCase());
}

if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);
    const dryRun = args.includes("--dry-run");
    const skipInstructions = args.includes("--without-instructions");
    const assumeYes = args.includes("--yes");
    const migrateTrackedArg = args.includes("--migrate-tracked-assets");
    const instructionsModeArg = args.find((arg) => arg.startsWith("--instructions-mode="));
    const instructionsMode = instructionsModeArg ? instructionsModeArg.split("=")[1] : "auto";
    const targetRoot = args.find(
      (arg) =>
        arg !== "--dry-run" &&
        arg !== "--without-instructions" &&
        arg !== "--yes" &&
        arg !== "--migrate-tracked-assets" &&
        !arg.startsWith("--instructions-mode=")
    );

    if (!targetRoot) {
      printUsage();
      process.exit(1);
    }

    try {
      const inspection = inspectSyncState(targetRoot);
      formatInspection(inspection).forEach((line) => console.log(line));

      let migrateTrackedAssets = migrateTrackedArg || assumeYes || dryRun;
      if (
        inspection.trackedAiNativePaths.length > 0 &&
        !migrateTrackedAssets &&
        process.stdin.isTTY &&
        process.stdout.isTTY
      ) {
        migrateTrackedAssets = await confirmTrackedMigration(
          inspection.trackedAiNativePaths.length
        );
      }

      if (inspection.trackedAiNativePaths.length > 0 && !migrateTrackedAssets) {
        console.log(
          `MIGRATION-REQUIRED ${inspection.trackedAiNativePaths.length} tracked .ai-native path(s) must be removed from the Git index`
        );
        console.log(
          `NEXT  npm run sync -- ${JSON.stringify(targetRoot)} --migrate-tracked-assets`
        );
        process.exitCode = 2;
        return;
      }

      const result = applySync({ targetRoot, dryRun, migrateTrackedAssets });
      result.logs.forEach((line) => console.log(line));

      if (!skipInstructions) {
        const instructionsInspection = inspectInstructionFiles(targetRoot);
        if (!instructionsInspection.safeToAutoApply && instructionsMode === "auto" && !(process.stdin.isTTY && process.stdout.isTTY) && !assumeYes) {
          console.log("INSTRUCTION-CONFLICT existing custom instruction files require a choice");
          formatConflictCommands(targetRoot).forEach((command) => console.log(`NEXT  ${command}`));
        } else {
          const instructionResult = await applyInstructionFiles({
            targetRoot,
            mode: instructionsMode,
            dryRun,
            interactive: process.stdin.isTTY && process.stdout.isTTY && !assumeYes
          });
          instructionResult.logs.forEach((line) => console.log(line));
        }
      }
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  })();
}
