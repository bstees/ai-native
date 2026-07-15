const fs = require("fs");
const path = require("path");

const { applySync } = require("./shared-assets");

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function writeFileIfMissing(targetPath, contents, logs) {
  if (fs.existsSync(targetPath)) {
    logs.push(`SKIP  ${targetPath}`);
    return;
  }

  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, contents);
  logs.push(`WRITE ${targetPath}`);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildAuditContents({ repoName, capturedOn }) {
  return [
    `# ${repoName} Initial Onboarding Audit`,
    "",
    "## Purpose",
    "",
    `Record the first standards audit for ${repoName} as it joins the AI Native ecosystem.`,
    "",
    "## Repo Snapshot",
    "",
    `- \`captured_on\`: \`${capturedOn}\``,
    `- \`repo\`: \`${repoName}\``,
    "- `workflow`: `repo-onboarding-audit`",
    "- `scope`: `initial standards alignment`",
    "",
    "## What Already Aligns",
    "",
    "- Document the current practices that already match the shared AI Native standards.",
    "- Call out existing validation, modularity, review discipline, and other strengths worth preserving.",
    "",
    "## Gaps Against The New Standard",
    "",
    "- Capture the highest-value mismatches between current practice and the desired operating model.",
    "- Focus on gaps that affect delivery quality, reviewability, validation depth, or feedback capture.",
    "",
    "## Initial Feedback System Installed",
    "",
    "- `.ai-native/feedback/toil/` is the default home for agent-generated toil feedback.",
    "- `.ai-native/feedback/developer-notes/` is a first-class input for markdown created directly by developers.",
    "- `.ai-native/audits/` is the home for onboarding and recurring standards audits.",
    "- Default ingestion cadence should be a commit-time sweep plus a scheduled recurring review.",
    "",
    "## Recommended Next Slice",
    "",
    "1. Define the first concrete local adoption slice.",
    "2. Identify the strongest practical validation command or workflow to use during future work.",
    "3. Capture one or two repo-local feedback loops that should become part of normal delivery.",
    "",
    "## Human Gates",
    "",
    "- Confirm which onboarding changes may land directly versus on a feature branch.",
    "- Confirm which standards are guidance now versus hard gates now.",
    "- Confirm what should stay repo-local before promoting anything back into shared AI Native assets.",
    "",
    "## Outcome",
    "",
    `${repoName} now has the shared AI Native baseline installed and is ready for an incremental, audit-driven adoption path.`
  ].join("\n");
}

function buildToilContents({ repoSlug, repoName, capturedOn }) {
  return [
    "# Onboarding Toil Feedback",
    "",
    "## Metadata",
    "",
    `- \`feedback_id\`: \`${repoSlug}-onboarding-toil-${capturedOn}\``,
    `- \`captured_on\`: \`${capturedOn}\``,
    "- `captured_by`: `codex`",
    "- `source_type`: `toil`",
    "- `scope`: `repo-local`",
    "- `status`: `new`",
    "",
    "## Context",
    "",
    `${repoName} is adopting the shared AI Native baseline.`,
    "",
    "## Friction",
    "",
    "Capture any onboarding friction that made installation, validation, or local adaptation harder than it should have been.",
    "",
    "## Likely Guidance Gap",
    "",
    "Describe which workflow, instruction, or asset should become clearer or more portable next.",
    "",
    "## Proposed Improvement",
    "",
    "Record the smallest useful improvement that would reduce the same friction next time.",
    "",
    "## Next Action",
    "",
    "Review this during the next feedback sweep and decide whether it stays local or should be promoted back into AI Native."
  ].join("\n");
}

function buildDeveloperNoteContents({ repoSlug, repoName, capturedOn }) {
  return [
    "# Standards Adoption Developer Note",
    "",
    "## Metadata",
    "",
    `- \`feedback_id\`: \`${repoSlug}-standards-adoption-${capturedOn}\``,
    `- \`captured_on\`: \`${capturedOn}\``,
    "- `captured_by`: `repo-owner`",
    "- `source_type`: `developer-note`",
    "- `scope`: `candidate-shared`",
    "- `status`: `new`",
    "",
    "## Context",
    "",
    `${repoName} is being onboarded into the AI Native ecosystem.`,
    "",
    "## Friction",
    "",
    "Capture what was unclear about installing shared assets, deciding local variation points, or validating the first adoption slice.",
    "",
    "## Likely Guidance Gap",
    "",
    "Describe the missing or ambiguous guidance that made the initial setup harder than necessary.",
    "",
    "## Proposed Improvement",
    "",
    "Describe the workflow, script, or asset improvement that would make the next onboarding smoother.",
    "",
    "## Next Action",
    "",
    "Review this note during the next scheduled feedback sweep and decide what should harden into reusable AI Native tooling."
  ].join("\n");
}

function seedRepoOnboarding({ targetRoot, repoName, capturedOn }) {
  if (!repoName) {
    throw new Error("A repo name is required.");
  }

  const result = applySync({ targetRoot });
  const repoSlug = slugify(repoName);
  const logs = [...result.logs];

  const auditPath = path.join(
    result.targetRoot,
    ".ai-native",
    "audits",
    `${capturedOn}-initial-onboarding-audit.md`
  );
  const toilPath = path.join(
    result.targetRoot,
    ".ai-native",
    "feedback",
    "toil",
    `${capturedOn}-${repoSlug}-onboarding-toil.md`
  );
  const developerNotePath = path.join(
    result.targetRoot,
    ".ai-native",
    "feedback",
    "developer-notes",
    `${capturedOn}-${repoSlug}-standards-adoption.md`
  );

  writeFileIfMissing(auditPath, buildAuditContents({ repoName, capturedOn }), logs);
  writeFileIfMissing(toilPath, buildToilContents({ repoSlug, repoName, capturedOn }), logs);
  writeFileIfMissing(
    developerNotePath,
    buildDeveloperNoteContents({ repoSlug, repoName, capturedOn }),
    logs
  );

  return {
    targetRoot: result.targetRoot,
    logs
  };
}

function printUsage() {
  console.log(
    "Usage: node scripts/seed-repo-onboarding.js <target-repo-path> --repo-name \"Repo Name\" [--date YYYY-MM-DD]"
  );
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const targetRoot = args[0];
  const repoNameIndex = args.indexOf("--repo-name");
  const dateIndex = args.indexOf("--date");
  const repoName = repoNameIndex >= 0 ? args[repoNameIndex + 1] : "";
  const capturedOn =
    dateIndex >= 0 ? args[dateIndex + 1] : new Date().toISOString().slice(0, 10);

  if (!targetRoot || !repoName) {
    printUsage();
    process.exit(1);
  }

  try {
    const result = seedRepoOnboarding({ targetRoot, repoName, capturedOn });
    result.logs.forEach((line) => console.log(line));
    console.log(`Seeded onboarding assets in ${path.join(result.targetRoot, ".ai-native")}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  seedRepoOnboarding
};
