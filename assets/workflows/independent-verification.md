# Independent Verification

Use this workflow after implementation when acceptance requires evidence that
the implementer did not define or weaken after seeing the solution.

1. Freeze and approve the applicable task-contract revision.
2. Let the implementation actor work within the approved scope and authority.
3. Before acceptance, enumerate compromises, substitutions, and unfulfilled
   criteria. Every deviation starts a revisit under the approved contract. A
   verified bundle requires every deviation to be resolved by a compliant
   repair; do not let the implementer silently redefine success.
4. Commit the implementation, then record its commit, exact changed paths,
   commands, exit results, and evidence for every acceptance-criterion ID in a
   task evidence bundle.
5. For bug fixes or other behavior-changing patches, run the same focused test
   against the base and patched revisions. Prefer evidence that fails before
   and passes after. Record why differential testing is not applicable when it
   would be unsafe or would not prove the intended change.
6. Give a fresh, read-only reviewer the approved contract, diff, and evidence
   bundle. Do not give it authority to patch what it reviews.
7. Resolve blocking findings through a new implementation pass, then ask for a
   new review. Do not have the reviewer silently repair and approve its own
   repair.
8. When a deviation cannot be repaired without changing the contract, stop and
   request explicit approval of a superseding revision and fingerprint. An
   approved deviation may remain in the old bundle as history, but it cannot
   verify that old revision. Continue only against the new approved contract.
9. Preserve the final disposition and unresolved risks for the human merge or
   rollout gate.

The governing formats are the
[`task contract`](./task-contract.md) and
[`task evidence bundle`](../quality/task-evidence-bundle.md).
