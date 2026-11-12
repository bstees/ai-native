# Task Contract

Use a task contract before implementation when work crosses repositories,
changes a shared asset, or carries consequential authority. The contract makes
the goal, boundaries, evidence, and human decisions independent of the agent
that performs the implementation.

The executable contract is
[`contracts/task-contract.schema.json`](./contracts/task-contract.schema.json).
A valid example lives at
[`examples/task-contract.json`](./examples/task-contract.json).

## Lifecycle

1. Create a draft with a bounded goal, included and excluded scope, the exact
   expected changed-path set, explicit path exclusions, constraints,
   assumptions, and stable acceptance-criterion IDs.
2. Assign an authority level and name the actions that remain prohibited.
3. Add human gates for consequential, irreversible, architectural, security,
   or product-judgment decisions.
4. Approve the contract by freezing every acceptance criterion and recording
   a fingerprint covering the goal, repository revision, path set, scope, constraints,
   assumptions, acceptance criteria, authority, and human-gate definitions.
5. Implement against the approved revision. The implementation agent may not
   edit the approved boundaries or their fingerprint. Gate status may advance,
   but the gate's decision and trigger remain part of the approved boundary.
6. If success criteria change, supersede the contract and approve a new
   revision. Never silently rewrite the old one.

## Authority Rule

`read_only` permits inspection only. `reversible_changes` permits scoped local
changes that can be reviewed and reverted. `consequential_changes` always
requires at least one explicit human gate before the consequential action.

Validate a contract with `npm run validate:task-contract -- <path>`.
