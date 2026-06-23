const fs = require("fs");
const path = require("path");

const targetRoot = "/Users/bstees/work/my-interest";
const aiNativeRoot = path.join(__dirname, "..");
const aiNativeDir = path.join(targetRoot, ".ai-native");
const feedbackDir = path.join(aiNativeDir, "feedback");
const toilDir = path.join(feedbackDir, "toil");
const developerNotesDir = path.join(feedbackDir, "developer-notes");
const auditsDir = path.join(aiNativeDir, "audits");

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function writeFile(relativePath, contents) {
  const targetPath = path.join(targetRoot, relativePath);
  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, contents);
}

function installSharedAssets() {
  const installerPath = path.join(aiNativeRoot, "scripts", "install-interest-lens.js");
  require(installerPath);
}

function seedAudit() {
  writeFile(
    ".ai-native/audits/2026-06-23-initial-onboarding-audit.md",
    [
      "# Interest Lens Initial Onboarding Audit",
      "",
      "## Purpose",
      "",
      "Record the first standards audit for Interest Lens as it joins the AI Native ecosystem.",
      "",
      "## Repo Snapshot",
      "",
      "- `captured_on`: `2026-06-23`",
      "- `repo`: `Interest Lens`",
      "- `workflow`: `repo-onboarding-audit`",
      "- `scope`: `initial standards alignment`",
      "",
      "## What Already Aligns",
      "",
      "- The repo already has meaningful behavioral validation through `vitest`, including domain logic tests and end-to-end-ish UI flow coverage in `src/main.test.jsx`.",
      "- The app is already modular in several useful places, including `AppChrome`, `HomeView`, `FormFields`, and utility modules for calculations, pay schedule handling, and storage.",
      "- `npm run check` already combines tests and a production build, which is a strong baseline validation command for agent work.",
      "",
      "## Gaps Against The New Standard",
      "",
      "- Mutation testing is not yet present for logic-heavy utility modules, so the current unit layer is not yet vetted to the stricter quality bar.",
      "- UI validation expectations are present in shared AI Native docs but are not yet expressed as repo-local critical user flows with browser or simulator evidence.",
      "- Several UI responsibilities still converge in `src/main.jsx`, which makes future agentic refactors riskier than they need to be.",
      "- Component-level tests are uneven. The repo has meaningful app-flow coverage, but independently tested reusable UI component contracts are still thin.",
      "- Repo-local feedback capture has not yet been part of the normal delivery loop, so usability toil and process friction are not being harvested systematically.",
      "",
      "## Initial Feedback System Installed",
      "",
      "- `.ai-native/feedback/toil/` is now the default home for agent-generated toil feedback.",
      "- `.ai-native/feedback/developer-notes/` is now a first-class input for markdown created directly by developers.",
      "- `.ai-native/audits/` is now the home for onboarding and recurring standards audits.",
      "- Default ingestion cadence should be a commit-time sweep plus a scheduled weekly review.",
      "",
      "## Recommended Next Slice",
      "",
      "1. Define the first repo-local critical user flows for the highest-value screens and validate them in browser or simulator.",
      "2. Break out the next seam from `src/main.jsx` into smaller contracts where responsibility is still too centralized.",
      "3. Add mutation testing for the most branch-heavy utility modules, starting with calculations and payoff logic.",
      "4. Start capturing toil and developer-authored markdown feedback on every meaningful UI iteration.",
      "",
      "## Human Gates",
      "",
      "- Confirm which onboarding changes may land directly versus on a feature branch.",
      "- Confirm when the repo is ready to enforce mutation testing as a hard gate instead of a target state.",
      "- Confirm the first set of critical user flows before they become required approval criteria.",
      "",
      "## Outcome",
      "",
      "Interest Lens is not yet ready for a blind `apply new standards` command to safely refactor itself end to end. It is ready for guided adoption using the shared standards, repo-local feedback capture, and an incremental audit-driven upgrade path."
    ].join("\n")
  );
}

function seedFeedback() {
  writeFile(
    ".ai-native/feedback/toil/2026-06-23-ui-validation-toil.md",
    [
      "# UI Validation Toil Feedback",
      "",
      "## Metadata",
      "",
      "- `feedback_id`: `interest-lens-ui-validation-toil-2026-06-23`",
      "- `captured_on`: `2026-06-23`",
      "- `captured_by`: `codex`",
      "- `source_type`: `toil`",
      "- `scope`: `repo-local`",
      "- `status`: `new`",
      "",
      "## Context",
      "",
      "Early onboarding work for Interest Lens surfaced repeated concern around inconsistent spacing, hard-to-reach controls, and view-state-specific usability regressions.",
      "",
      "## Friction",
      "",
      "The repo did not yet have a local critical-user-flow inventory or a required browser-or-simulator validation trail, so UI issues depended too heavily on late human review.",
      "",
      "## Likely Guidance Gap",
      "",
      "Interest Lens needs repo-local flow definitions and a standing expectation that meaningful UI changes are exercised directly before asking for approval.",
      "",
      "## Proposed Improvement",
      "",
      "Create and maintain critical user flows for the key debt-entry, profile, and recommendation surfaces, then require browser or simulator evidence during UI-related completion checks.",
      "",
      "## Next Action",
      "",
      "Seed the first repo-local critical user flows and use them during the next UI-focused task."
    ].join("\n")
  );

  writeFile(
    ".ai-native/feedback/developer-notes/2026-06-23-standards-adoption-seed.md",
    [
      "# Standards Adoption Developer Note",
      "",
      "## Metadata",
      "",
      "- `feedback_id`: `interest-lens-standards-adoption-seed-2026-06-23`",
      "- `captured_on`: `2026-06-23`",
      "- `captured_by`: `repo-owner`",
      "- `source_type`: `developer-note`",
      "- `scope`: `candidate-shared`",
      "- `status`: `new`",
      "",
      "## Context",
      "",
      "Interest Lens is being used as the first proving ground for how AI Native should serve other production repositories.",
      "",
      "## Friction",
      "",
      "There is not yet a crisp standard workflow for bringing an existing repo into the ecosystem, installing shared rules, and deciding what can be enforced immediately versus adopted incrementally.",
      "",
      "## Likely Guidance Gap",
      "",
      "The ecosystem needs a first-class onboarding workflow rather than treating initial adoption like ordinary feature work.",
      "",
      "## Proposed Improvement",
      "",
      "Use the shared `repo-onboarding-audit` workflow for first-time adoption and keep collecting repo-local feedback before promoting anything cross-repo.",
      "",
      "## Next Action",
      "",
      "Review this note during the next scheduled feedback sweep and decide which parts should harden into additional AI Native automation."
    ].join("\n")
  );
}

function main() {
  if (!fs.existsSync(targetRoot)) {
    throw new Error(`Interest Lens repo not found at ${targetRoot}`);
  }

  ensureDir(aiNativeDir);
  ensureDir(feedbackDir);
  ensureDir(toilDir);
  ensureDir(developerNotesDir);
  ensureDir(auditsDir);

  installSharedAssets();
  seedAudit();
  seedFeedback();

  console.log(`Seeded Interest Lens onboarding assets in ${aiNativeDir}`);
}

main();
