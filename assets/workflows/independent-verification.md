# Independent Verification

Use this workflow after implementation when acceptance requires evidence that
the implementer did not define or weaken after seeing the solution.

1. Freeze and approve the applicable task-contract revision.
2. Let the implementation actor work within the approved scope and authority.
3. Commit the implementation, then record its commit, exact changed paths,
   commands, exit results, and evidence for every acceptance-criterion ID in a
   task evidence bundle.
4. Give a fresh, read-only reviewer the approved contract, diff, and evidence
   bundle. Do not give it authority to patch what it reviews.
5. Resolve blocking findings through a new implementation pass, then ask for a
   new review. Do not have the reviewer silently repair and approve its own
   repair.
6. Preserve the final disposition and unresolved risks for the human merge or
   rollout gate.

The governing formats are the
[`task contract`](./task-contract.md) and
[`task evidence bundle`](../quality/task-evidence-bundle.md).
