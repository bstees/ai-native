# Task Evidence Bundle

The evidence bundle is the executable handoff between implementation and
acceptance. It binds verification to an approved task-contract revision, not
to the implementation agent's own description of success.

The machine-readable format is
[`contracts/task-evidence-bundle.schema.json`](./contracts/task-evidence-bundle.schema.json).
A complete example is
[`examples/task-evidence-bundle.json`](./examples/task-evidence-bundle.json).

## Required Boundary

- The implementer records changed paths, a content fingerprint, and exact
  verification commands. Command evidence must include every command frozen in
  the approved contract; additional targeted checks are allowed. An uncommitted
  bundle may be reviewed provisionally, but a `verified` disposition requires a
  durable commit.
- Every acceptance-criterion ID has explicit evidence and a result.
- Every known compromise, substitution, or unfulfilled criterion is recorded as
  a requirement deviation and starts a revisit. A `verified` disposition
  requires every deviation to be `resolved` by a compliant repair. Human
  approval of a contract change creates a superseding revision and fingerprint;
  it never verifies a deviation against the old revision.
- Differential evidence records the base and patched revisions, exact command,
  and expected and observed result on each revision. When differential testing
  is unsafe or irrelevant, the bundle records why it is not applicable.
- A reviewer using the read-only
  [`reviewer` profile](../agent-orchestration/profiles/reviewer.json) examines
  the approved contract, diff, and evidence from fresh context.
- The reviewer may verify, require changes, or block. It must not patch the
  implementation while acting as the independent reviewer.
- The validator loads the referenced approved task contract and requires exact
  task identity, revision, contract fingerprint, and criterion coverage.
- A bundle cannot be `verified` when it lacks a commit, the reviewer is the
  implementer, a command failed, criterion evidence is incomplete, or a
  blocking finding is unresolved. It also cannot be verified while any
  deviation remains disclosed, approved, or rejected, or with internally
  inconsistent differential evidence.

Store durable references and concise outcomes. Raw prompts, chain-of-thought,
secret-bearing output, and entire terminal transcripts are neither required
nor appropriate evidence.

Validate a bundle with `npm run validate:task-evidence -- <path>`.
