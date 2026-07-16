# Vendor-Neutral Agent Orchestration

## Purpose

Define task-oriented sub-agent profiles without coupling reusable workflows to
a provider or model name.

## Contract

The orchestration layers have separate responsibilities:

1. A skill or workflow requests a profile by `id`.
2. The profile declares capability, context, execution, and output needs.
3. The routing policy maps capability tiers to organization-controlled model
   aliases and defines escalation.
4. A provider adapter reports how each requirement is enforced.
5. The runtime assembles the smallest context packet and records degraded or
   unsupported controls before execution.

Skills should request profiles or capability tiers. They should not name
models or restate provider configuration.

## Capability Tiers

- `economy`: extraction, formatting, and deterministic transformations
- `efficient`: documentation, summarization, and read-heavy exploration
- `balanced`: routine implementation, testing, and analysis
- `advanced`: architecture, difficult debugging, and risk review
- `maximum`: exceptional ambiguity or consequence after lower tiers fail

Model names belong only in a local model registry. The shared routing policy
uses stable aliases so adopters can change providers or models independently.

## Context Policy

Default to a fresh sub-agent context containing only:

- the delegated goal
- acceptance criteria
- explicitly selected files
- applicable canonical guidance

Do not inherit the parent transcript, unrelated repository guidance, or raw
exploration logs unless the task explicitly depends on them. Return a concise
result rather than intermediate output.

## Enforcement Levels

Adapters classify every control as:

- `native`: enforced by the provider or client
- `orchestrator`: enforced while constructing or validating the run
- `prompt`: advisory instructions only
- `unsupported`: unavailable and must be accepted, compensated for, or blocked

The resolver fails closed on unsupported requirements marked `required` and
reports all weaker-than-native enforcement.

## Included Profiles

- [`profiles/documentation.json`](./profiles/documentation.json)
- [`profiles/explorer.json`](./profiles/explorer.json)
- [`profiles/delivery.json`](./profiles/delivery.json)
- [`profiles/reviewer.json`](./profiles/reviewer.json)

Validate a provider/profile pairing with:

```bash
node .ai-native/agent-orchestration/resolve.js \
  --provider codex \
  --profile documentation
```

The output is a provider-neutral execution plan. Provider launchers may consume
that plan without changing the profile contract.

## Extension Rule

Add a provider by supplying an adapter that conforms to
[`contracts/provider-adapter.schema.json`](./contracts/provider-adapter.schema.json).
Add a workload by supplying a profile that conforms to
[`contracts/agent-profile.schema.json`](./contracts/agent-profile.schema.json).
Do not copy the tier definitions or context policy into an adapter.
