# Approval Packets

Use these formats without omitting fields. Keep the public Friday brief outside
these private AI Native packets.

## Front-Gate Contract

- Contract: `AIN-YYYY-MM-DD-NN rev N`.
- Fingerprint: SHA-256 of the task-contract approval boundary.
- Goal: one bounded outcome.
- Evidence: primary research source, its limits, and repository evidence.
- Repository baseline: repository, base commit, and proposed branch.
- Included scope: exact behaviors and components included.
- Excluded scope: explicit non-goals.
- Expected changed paths: exact repository-relative path set.
- Excluded paths: exact paths or bounded path groups that must not change.
- Constraints: stable IDs and statements.
- Assumptions: stable IDs, validation status, and evidence.
- Acceptance criteria: stable `AC-NNN` IDs, exact statements, required evidence,
  owner, and a statement that each criterion freezes on approval.
- Verification: exact targeted commands, full repository verification,
  differential evidence when applicable, and required human review.
- Authority: allowed actions after approval.
- Prohibited actions: at minimum merge, auto-merge, release, deploy, destructive
  migration, shared-asset publication, consumer rollout, scope expansion, and
  requirement weakening.
- Risks, unknowns, collision status, and human-gate triggers.
- Recommendation: implement, investigate first, or defer.
- Approval instruction: `Approve <stable ID> rev N, fingerprint <sha256>.`

State that approval authorizes the bounded implementation, verification,
branch push, draft pull request, in-scope CI repair, and transition to
ready-for-review. It never authorizes merge or deployment.

## Deviation Approval Packet

Use this only after the compliant revisit loop cannot honor the active contract.

- Active contract: stable ID, revision, and fingerprint.
- Exact deviation: affected contract fields and acceptance IDs.
- Cause: why the active revision cannot presently be honored.
- Attempted remedies: every revisit attempt and its evidence.
- Proposed delta: exact old-to-new contract changes.
- Risk delta: new or changed risks and authority.
- Verification delta: added or changed evidence requirements.
- Superseding contract: proposed revision and fingerprint.

Ask for exactly one decision:

- `Approve <stable ID> rev N, fingerprint <sha256>.`
- `Keep rev N-1; continue only if the original contract can be honored.`
- `Abandon <stable ID>.`

Do not resume on ambiguity or silence. Preserve the old revision after a new
revision is approved.
