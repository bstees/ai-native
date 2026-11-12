# Task Evidence Bundle

The evidence bundle is the executable handoff between implementation and
acceptance. It binds verification to an approved task-contract revision, not
to the implementation agent's own description of success.

The machine-readable format is
[`contracts/task-evidence-bundle.schema.json`](./contracts/task-evidence-bundle.schema.json).
A complete example is
[`examples/task-evidence-bundle.json`](./examples/task-evidence-bundle.json).

## Required Boundary

- The implementer records changed paths, a content fingerprint (or durable
  commit), and exact verification commands.
- Every acceptance-criterion ID has explicit evidence and a result.
- A reviewer using the read-only
  [`reviewer` profile](../agent-orchestration/profiles/reviewer.json) examines
  the approved contract, diff, and evidence from fresh context.
- The reviewer may verify, require changes, or block. It must not patch the
  implementation while acting as the independent reviewer.
- The validator loads the referenced approved task contract and requires exact
  task identity, revision, contract fingerprint, and criterion coverage.
- A bundle cannot be `verified` when the reviewer is the implementer, a
  command failed, criterion evidence is incomplete, or a blocking finding is
  unresolved.

Store durable references and concise outcomes. Raw prompts, chain-of-thought,
secret-bearing output, and entire terminal transcripts are neither required
nor appropriate evidence.

Validate a bundle with `npm run validate:task-evidence -- <path>`.
