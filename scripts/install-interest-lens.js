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
const sourceFeedbackReadme = path.join(sourceRoot, "assets", "feedback", "README.md");
const sourceFeedbackStandard = path.join(
  sourceRoot,
  "assets",
  "feedback",
  "feedback-ingestion-standard.md"
);
const sourceFeedbackTemplate = path.join(
  sourceRoot,
  "assets",
  "feedback",
  "feedback-entry-template.md"
);
const sourceOnboardingWorkflow = path.join(
  sourceRoot,
  "assets",
  "workflows",
  "repo-onboarding-audit.md"
);
const targetDir = path.join(targetRoot, ".ai-native");
const targetFeedbackDir = path.join(targetDir, "feedback");
const targetToilDir = path.join(targetFeedbackDir, "toil");
const targetDeveloperNotesDir = path.join(targetFeedbackDir, "developer-notes");
const targetAuditsDir = path.join(targetDir, "audits");
const targetAsset = path.join(targetDir, "core-operating-rules.md");
const targetUiStandard = path.join(targetDir, "ui-quality-standard.md");
const targetUiChecklist = path.join(targetDir, "ui-review-checklist.md");
const targetUsabilityStandard = path.join(targetDir, "usability-validation-standard.md");
const targetPlanModeWorkflow = path.join(targetDir, "goal-and-plan-mode.md");
const targetFeedbackReadme = path.join(targetFeedbackDir, "README.md");
const targetFeedbackStandard = path.join(targetFeedbackDir, "feedback-ingestion-standard.md");
const targetFeedbackTemplate = path.join(targetFeedbackDir, "feedback-entry-template.md");
const targetOnboardingWorkflow = path.join(targetDir, "repo-onboarding-audit.md");
const targetFeedbackRootReadme = path.join(targetFeedbackDir, "capture-guidance.md");
const targetToilReadme = path.join(targetToilDir, "README.md");
const targetDeveloperNotesReadme = path.join(targetDeveloperNotesDir, "README.md");
const targetAuditsReadme = path.join(targetAuditsDir, "README.md");
const targetReadme = path.join(targetDir, "README.md");

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function install() {
  if (!fs.existsSync(targetRoot)) {
    throw new Error(`Interest Lens repo not found at ${targetRoot}`);
  }

  ensureDir(targetDir);
  ensureDir(targetFeedbackDir);
  ensureDir(targetToilDir);
  ensureDir(targetDeveloperNotesDir);
  ensureDir(targetAuditsDir);
  fs.copyFileSync(sourceAsset, targetAsset);
  fs.copyFileSync(sourceUiStandard, targetUiStandard);
  fs.copyFileSync(sourceUiChecklist, targetUiChecklist);
  fs.copyFileSync(sourceUsabilityStandard, targetUsabilityStandard);
  fs.copyFileSync(sourcePlanModeWorkflow, targetPlanModeWorkflow);
  fs.copyFileSync(sourceFeedbackReadme, targetFeedbackReadme);
  fs.copyFileSync(sourceFeedbackStandard, targetFeedbackStandard);
  fs.copyFileSync(sourceFeedbackTemplate, targetFeedbackTemplate);
  fs.copyFileSync(sourceOnboardingWorkflow, targetOnboardingWorkflow);
  fs.writeFileSync(
    targetReadme,
    [
      "# AI Native Assets",
      "",
      "This directory contains assets installed from the `AI Native` repository.",
      "",
      "- `core-operating-rules.md` is the current shared baseline for AI-agent behavior.",
      "- `goal-and-plan-mode.md` defines when work must start in explicit planning.",
      "- `repo-onboarding-audit.md` is the first-time adoption workflow for this repo.",
      "- `ui-quality-standard.md` defines the cross-repo UI quality bar.",
      "- `ui-review-checklist.md` is the default UI approval checklist.",
      "- `usability-validation-standard.md` requires browser or simulator flow validation.",
      "- `feedback/` is the repo-local source of truth for toil, developer notes, and audits.",
      "- Local additions should stay minimal and repo-specific."
    ].join("\n")
  );
  fs.writeFileSync(
    targetFeedbackRootReadme,
    [
      "# Feedback Capture Guidance",
      "",
      "Use markdown in this directory as the source of truth for repo-local feedback.",
      "",
      "- `toil/` is for friction uncovered while doing work.",
      "- `developer-notes/` is for markdown written directly by developers that should be treated as feedback.",
      "- `../audits/` is for structured standards and onboarding reviews.",
      "- Review feedback on a commit-time sweep and on a recurring cadence."
    ].join("\n")
  );
  fs.writeFileSync(
    targetToilReadme,
    [
      "# Toil Feedback",
      "",
      "Create a markdown entry here whenever delivery friction could have been reduced with better guidance.",
      "",
      "Use `../feedback-entry-template.md` as the default structure."
    ].join("\n")
  );
  fs.writeFileSync(
    targetDeveloperNotesReadme,
    [
      "# Developer Notes Feedback",
      "",
      "Markdown created here by developers should be treated as feedback input during commit-time and scheduled ingestion reviews."
    ].join("\n")
  );
  fs.writeFileSync(
    targetAuditsReadme,
    [
      "# Repo Audits",
      "",
      "Store onboarding audits, standards reviews, and recurring ecosystem health checks here."
    ].join("\n")
  );

  console.log(`Installed AI Native assets into ${targetDir}`);
}

install();
