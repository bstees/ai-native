#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const enforcementRank = { unsupported: 0, prompt: 1, orchestrator: 2, native: 3 };

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    if (!key?.startsWith("--") || argv[index + 1] === undefined) {
      throw new Error("Usage: resolve.js --provider <id> --profile <id> [--root <directory>]");
    }
    result[key.slice(2)] = argv[index + 1];
  }
  return result;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function resolveAgentPlan({ root = __dirname, provider, profile }) {
  if (!provider || !profile) {
    throw new Error("Both provider and profile are required.");
  }

  const adapter = readJson(path.join(root, "adapters", `${provider}.json`));
  const agentProfile = readJson(path.join(root, "profiles", `${profile}.json`));
  const routing = readJson(path.join(root, "routing-policy.json"));
  const tier = routing.tiers[agentProfile.requirements.capabilityTier];

  if (!tier) {
    throw new Error(`Unknown capability tier: ${agentProfile.requirements.capabilityTier}`);
  }

  const controls = Object.entries(agentProfile.requirements.controls).map(([control, importance]) => {
    const enforcement = adapter.enforcement[control] || "unsupported";
    return { control, importance, enforcement };
  });
  const blockers = controls.filter(
    ({ importance, enforcement }) => importance === "required" && enforcementRank[enforcement] === 0
  );

  return {
    schemaVersion: 1,
    provider: adapter.id,
    profile: agentProfile.id,
    status: blockers.length ? "blocked" : "ready",
    routing: {
      capabilityTier: agentProfile.requirements.capabilityTier,
      modelAlias: tier.modelAlias,
      reasoningEffort: adapter.reasoningEffortMap[agentProfile.requirements.reasoningEffort] ?? null,
      escalationProfile: agentProfile.escalationProfile || null,
      escalationTier: tier.escalatesTo
    },
    execution: agentProfile.execution,
    context: {
      ...agentProfile.context,
      providerInheritance: adapter.contextInheritanceMap[agentProfile.context.inheritance] ?? null
    },
    output: agentProfile.output,
    controls,
    blockers,
    adapterNotes: adapter.notes || []
  };
}

if (require.main === module) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const plan = resolveAgentPlan({ root: args.root, provider: args.provider, profile: args.profile });
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
    process.exitCode = plan.status === "blocked" ? 2 : 0;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { resolveAgentPlan };
