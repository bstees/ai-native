const path = require("path");

const { applySync, inspectSyncState } = require("./shared-assets");

function formatInspection(inspection) {
  const lines = [
    `STATUS ${inspection.status} ${path.join(inspection.targetRoot, ".ai-native")} target=${inspection.assetVersion}`
  ];

  if (inspection.versionStatus !== "current") {
    lines.push(
      `VERSION ${inspection.versionStatus} current=${inspection.existingState?.assetVersion || "none"} target=${inspection.assetVersion}`
    );
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
  console.log("Usage: node scripts/sync.js <target-repo-path> [--dry-run]");
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const targetRoot = args.find((arg) => arg !== "--dry-run");

  if (!targetRoot) {
    printUsage();
    process.exit(1);
  }

  try {
    const inspection = inspectSyncState(targetRoot);
    formatInspection(inspection).forEach((line) => console.log(line));

    const result = applySync({ targetRoot, dryRun });
    result.logs.forEach((line) => console.log(line));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
