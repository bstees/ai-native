const path = require("path");

const { applyInstructionFiles, formatConflictCommands, inspectInstructionFiles } = require("./instruction-files");
const { applySync, inspectSyncState } = require("./shared-assets");

function formatInspection(inspection) {
  const lines = [
    `STATUS ${inspection.status} ${path.join(inspection.targetRoot, ".ai-native")} role=${inspection.repoRole}${inspection.standardsMode ? ` mode=${inspection.standardsMode}` : ""} target=${inspection.assetVersion}`
  ];

  if (inspection.versionStatus !== "current") {
    lines.push(
      `VERSION ${inspection.versionStatus} current=${inspection.existingState?.assetVersion || "none"} target=${inspection.assetVersion}`
    );
  }

  if (inspection.status === "source") {
    lines.push("ROLE source repos publish standards; they do not consume downstream sync updates");
  }

  if (inspection.status === "forked") {
    lines.push("MODE forked repos keep feedback flowing but no longer auto-track AI Native standards");
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

  return lines;
}

function printUsage() {
  console.log(
    "Usage: node scripts/sync.js <target-repo-path> [--dry-run] [--without-instructions] [--instructions-mode=replace|append|skip] [--yes]"
  );
}

if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);
    const dryRun = args.includes("--dry-run");
    const skipInstructions = args.includes("--without-instructions");
    const assumeYes = args.includes("--yes");
    const instructionsModeArg = args.find((arg) => arg.startsWith("--instructions-mode="));
    const instructionsMode = instructionsModeArg ? instructionsModeArg.split("=")[1] : "auto";
    const targetRoot = args.find(
      (arg) =>
        arg !== "--dry-run" &&
        arg !== "--without-instructions" &&
        arg !== "--yes" &&
        !arg.startsWith("--instructions-mode=")
    );

    if (!targetRoot) {
      printUsage();
      process.exit(1);
    }

    try {
      const inspection = inspectSyncState(targetRoot);
      formatInspection(inspection).forEach((line) => console.log(line));

      const result = applySync({ targetRoot, dryRun });
      result.logs.forEach((line) => console.log(line));

      if (!skipInstructions) {
        const instructionsInspection = inspectInstructionFiles(targetRoot);
        if (!instructionsInspection.safeToAutoApply && instructionsMode === "auto" && !(process.stdin.isTTY && process.stdout.isTTY) && !assumeYes) {
          console.log("INSTRUCTION-CONFLICT existing custom instruction files require a choice");
          formatConflictCommands(targetRoot).forEach((command) => console.log(`NEXT  ${command}`));
        } else {
          const instructionResult = await applyInstructionFiles({
            targetRoot,
            mode: assumeYes && instructionsMode === "auto" ? "replace" : instructionsMode,
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
