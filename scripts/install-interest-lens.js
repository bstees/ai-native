const fs = require("fs");
const path = require("path");

const sourceRoot = path.join(__dirname, "..");
const targetRoot = "/Users/bstees/work/my-interest";
const sourceAsset = path.join(
  sourceRoot,
  "assets",
  "repo-rules",
  "ai-native-core-operating-rules.md"
);
const sourceUiStandard = path.join(
  sourceRoot,
  "assets",
  "quality",
  "ui-quality-standard.md"
);
const sourceUiChecklist = path.join(
  sourceRoot,
  "assets",
  "quality",
  "ui-review-checklist.md"
);
const sourceUsabilityStandard = path.join(
  sourceRoot,
  "assets",
  "quality",
  "usability-validation-standard.md"
);
const sourcePlanModeWorkflow = path.join(
  sourceRoot,
  "assets",
  "workflows",
  "goal-and-plan-mode.md"
);
const targetDir = path.join(targetRoot, ".ai-native");
const targetAsset = path.join(targetDir, "core-operating-rules.md");
const targetUiStandard = path.join(targetDir, "ui-quality-standard.md");
const targetUiChecklist = path.join(targetDir, "ui-review-checklist.md");
const targetUsabilityStandard = path.join(targetDir, "usability-validation-standard.md");
const targetPlanModeWorkflow = path.join(targetDir, "goal-and-plan-mode.md");
const targetReadme = path.join(targetDir, "README.md");

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function install() {
  if (!fs.existsSync(targetRoot)) {
    throw new Error(`Interest Lens repo not found at ${targetRoot}`);
  }

  ensureDir(targetDir);
  fs.copyFileSync(sourceAsset, targetAsset);
  fs.copyFileSync(sourceUiStandard, targetUiStandard);
  fs.copyFileSync(sourceUiChecklist, targetUiChecklist);
  fs.copyFileSync(sourceUsabilityStandard, targetUsabilityStandard);
  fs.copyFileSync(sourcePlanModeWorkflow, targetPlanModeWorkflow);
  fs.writeFileSync(
    targetReadme,
    [
      "# AI Native Assets",
      "",
      "This directory contains assets installed from the `AI Native` repository.",
      "",
      "- `core-operating-rules.md` is the current shared baseline for AI-agent behavior.",
      "- `goal-and-plan-mode.md` defines when work must start in explicit planning.",
      "- `ui-quality-standard.md` defines the cross-repo UI quality bar.",
      "- `ui-review-checklist.md` is the default UI approval checklist.",
      "- `usability-validation-standard.md` requires browser or simulator flow validation.",
      "- Local additions should stay minimal and repo-specific."
    ].join("\n")
  );

  console.log(`Installed AI Native assets into ${targetDir}`);
}

install();
