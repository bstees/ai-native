const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");

const recordCatalog = [
  {
    stage: "signals",
    path: "signals/sources.yml",
    title: "Trusted source registry",
    summary:
      "Curated official and research sources used to watch common SDLC patterns in AI adoption.",
    status: "active",
    reviewStatus: "approved",
    owner: "ai-native",
    nextAction: "Add evidence records tied to the current source set."
  },
  {
    stage: "signals",
    path: "signals/operating-model.md",
    status: "active",
    reviewStatus: "approved",
    owner: "ai-native",
    nextAction: "Convert the first recurring patterns into concept records."
  },
  {
    stage: "decisions",
    path: "decisions/current-epics.md",
    status: "active",
    reviewStatus: "approved",
    owner: "ai-native",
    nextAction: "Keep the active epics aligned with what the service actually proves in practice."
  },
  {
    stage: "decisions",
    path: "decisions/records/2026-06-23-centralized-repo-rules.md"
  },
  {
    stage: "decisions",
    path: "decisions/records/2026-06-23-human-gated-agent-controls.md"
  },
  {
    stage: "assets",
    path: "assets/sharing-model.md",
    status: "active",
    reviewStatus: "approved",
    owner: "ai-native",
    nextAction: "Keep deciding which assets should sync centrally versus be generated in place."
  },
  {
    stage: "assets",
    path: "assets/feedback/README.md"
  },
  {
    stage: "assets",
    path: "assets/feedback/feedback-ingestion-standard.md"
  },
  {
    stage: "assets",
    path: "assets/feedback/feedback-entry-template.md"
  },
  {
    stage: "assets",
    path: "assets/workflows/goal-and-plan-mode.md"
  },
  {
    stage: "assets",
    path: "assets/workflows/repo-onboarding-audit.md"
  },
  {
    stage: "assets",
    path: "assets/workflows/feature-delivery.md"
  },
  {
    stage: "assets",
    path: "assets/workflows/bug-fix.md"
  },
  {
    stage: "assets",
    path: "assets/workflows/code-review.md"
  },
  {
    stage: "assets",
    path: "assets/workflows/debugging.md"
  },
  {
    stage: "assets",
    path: "assets/workflows/rollout-and-validation.md"
  },
  {
    stage: "assets",
    path: "assets/workflows/usability-validation.md"
  },
  {
    stage: "assets",
    path: "assets/quality/engineering-quality.md"
  },
  {
    stage: "assets",
    path: "assets/quality/ui-quality-standard.md"
  },
  {
    stage: "assets",
    path: "assets/quality/ui-review-checklist.md"
  },
  {
    stage: "assets",
    path: "assets/quality/usability-validation-standard.md"
  },
  {
    stage: "assets",
    path: "assets/repo-rules/ai-native-core-operating-rules.md",
    status: "published",
    reviewStatus: "approved",
    owner: "ai-native",
    nextAction: "Pilot this asset inside Interest Lens and capture friction."
  },
  {
    stage: "pilots",
    path: "pilots/interest-lens/adoption-plan.md",
    status: "active",
    reviewStatus: "approved",
    owner: "ai-native",
    nextAction: "Turn the plan into live consumer-repo adoption."
  },
  {
    stage: "pilots",
    path: "pilots/interest-lens/first-asset-rollout.md",
    status: "proposed",
    reviewStatus: "approved",
    owner: "ai-native",
    nextAction: "Use the rollout notes while validating the first shared asset."
  },
  {
    stage: "pilots",
    path: "pilots/interest-lens/adoptions/2026-06-23-core-operating-rules.md"
  },
  {
    stage: "pilots",
    path: "pilots/interest-lens/usability/critical-user-flows.md",
    status: "active",
    reviewStatus: "approved",
    owner: "ai-native",
    nextAction: "Exercise these flows directly in browser or simulator during UI validation."
  },
  {
    stage: "pilots",
    path: "pilots/interest-lens/usability/feedback-log.md",
    status: "active",
    reviewStatus: "approved",
    owner: "ai-native",
    nextAction: "Convert recurring human feedback into stricter reusable standards."
  }
];

function readFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function extractFirstHeading(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

function extractMetadataValue(markdown, key) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`-\\s+\\\`${escapedKey}\\\`:\\s*(.+)$`, "m"));
  return match ? match[1].trim().replace(/^`|`$/g, "") : "";
}

function extractFirstParagraph(markdown) {
  const lines = markdown.split("\n");
  let collecting = false;
  const buffer = [];

  for (const line of lines) {
    if (!collecting && /^#/.test(line.trim())) {
      collecting = true;
      continue;
    }

    if (!collecting) {
      continue;
    }

    if (!line.trim()) {
      if (buffer.length) {
        break;
      }
      continue;
    }

    if (/^(##|- |\* )/.test(line.trim())) {
      if (buffer.length) {
        break;
      }
      continue;
    }

    buffer.push(line.trim());
  }

  return buffer.join(" ");
}

function buildRecord(entry) {
  const raw = readFile(entry.path);
  const title = extractFirstHeading(raw) || entry.title || path.basename(entry.path);
  const summary = extractFirstParagraph(raw) || entry.summary || "No summary captured yet.";

  return {
    stage: entry.stage,
    path: entry.path,
    title,
    summary,
    status: extractMetadataValue(raw, "status") || entry.status || "active",
    reviewStatus: extractMetadataValue(raw, "review_status") || entry.reviewStatus || "draft",
    owner: extractMetadataValue(raw, "owner") || entry.owner || "ai-native",
    needsReviewBy: extractMetadataValue(raw, "needs_review_by") || "",
    approvedBy: extractMetadataValue(raw, "approved_by") || "",
    approvedOn: extractMetadataValue(raw, "approved_on") || "",
    nextAction: extractMetadataValue(raw, "next_action") || entry.nextAction || "",
    sourceType: "markdown"
  };
}

function buildApprovals(records) {
  return records
    .filter((record) => record.reviewStatus === "pending-human-review")
    .map((record) => ({
      recordPath: record.path,
      recordTitle: record.title,
      gateType: record.stage === "pilots" ? "consumer-rollout" : `${record.stage}-review`,
      reviewerRole: record.needsReviewBy || "repo-owner",
      status: "pending-human-review",
      prompt: record.nextAction || `Review and decide the next action for ${record.title}.`
    }));
}

function loadRepoRecords() {
  const records = recordCatalog.map(buildRecord);
  const approvals = buildApprovals(records);
  return { records, approvals };
}

module.exports = {
  loadRepoRecords
};
