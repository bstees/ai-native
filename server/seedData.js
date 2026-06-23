const seedRecords = [
  {
    stage: "signals",
    title: "Trusted source registry",
    summary:
      "Curated official and research sources used to watch common SDLC patterns in AI adoption.",
    status: "active",
    reviewStatus: "approved",
    owner: "ai-native",
    path: "signals/sources.yml",
    nextAction: "Add evidence records tied to the current source set."
  },
  {
    stage: "signals",
    title: "Signal operating model",
    summary:
      "Defines how industry changes move from monitored signal to decision-worthy concept.",
    status: "active",
    reviewStatus: "approved",
    owner: "ai-native",
    path: "signals/operating-model.md",
    nextAction: "Convert the first recurring patterns into concept records."
  },
  {
    stage: "decisions",
    title: "Centrally maintained repo rules",
    summary:
      "Approved decision to publish shared repo operating rules as a cross-repo asset.",
    status: "approved",
    reviewStatus: "approved",
    owner: "ai-native",
    path: "decisions/records/2026-06-23-centralized-repo-rules.md",
    nextAction: "Measure whether Interest Lens needs only light adaptation."
  },
  {
    stage: "decisions",
    title: "Human-gated agent controls",
    summary:
      "Approved decision making explicit approval points part of every production-facing asset.",
    status: "approved",
    reviewStatus: "approved",
    owner: "ai-native",
    path: "decisions/records/2026-06-23-human-gated-agent-controls.md",
    nextAction: "Apply the gate model to concept promotion and rollout records."
  },
  {
    stage: "assets",
    title: "Core operating rules asset",
    summary:
      "First shared asset intended for consumer repos that want a stable baseline for AI behavior.",
    status: "published",
    reviewStatus: "approved",
    owner: "ai-native",
    path: "assets/repo-rules/ai-native-core-operating-rules.md",
    nextAction: "Pilot this asset inside Interest Lens and capture friction."
  },
  {
    stage: "pilots",
    title: "Interest Lens rollout",
    summary:
      "The first consumer rollout path for AI Native assets, starting with core operating rules.",
    status: "proposed",
    reviewStatus: "pending-human-review",
    owner: "repo-owner",
    path: "pilots/interest-lens/adoptions/2026-06-23-core-operating-rules.md",
    nextAction: "Review the baseline and approve or defer the pilot."
  }
];

const seedApprovals = [
  {
    recordTitle: "Interest Lens rollout",
    gateType: "consumer-rollout",
    reviewerRole: "repo-owner",
    status: "pending-human-review",
    prompt:
      "Approve or defer the first Interest Lens pilot using the centrally maintained core operating rules asset."
  }
];

module.exports = {
  seedRecords,
  seedApprovals
};
