---
name: weekly-brief-delivery
description: Turn AI Native opportunities from the Friday AI Engineering Brief into contract-bound, isolated branches and CI-verified pull requests. Use when preparing the brief's private AI Native approval packet or delivering an explicitly approved brief item; do not use for publishing the public brief or for unrelated repository work.
---

# Weekly Brief Delivery

## Goal

Move a research-backed AI Native improvement from one front-door human
approval to a pull request ready for human review without silently changing the
approved specification.

## Read First

- [`../../../assets/workflows/task-contract.md`](../../../assets/workflows/task-contract.md)
- [`../../../assets/workflows/independent-verification.md`](../../../assets/workflows/independent-verification.md)
- [`../../../assets/quality/task-evidence-bundle.md`](../../../assets/quality/task-evidence-bundle.md)
- [`../../../assets/workflows/feature-delivery.md`](../../../assets/workflows/feature-delivery.md)

Use [the approval packet formats](references/approval-packets.md) when proposing
work or requesting a superseding approval.

## Proposal Mode

Scheduled brief runs are proposal-only. Browse and inspect repositories
read-only, then:

1. Propose at most three research-backed AI Native opportunities with stable
   `AIN-YYYY-MM-DD-NN` identifiers.
2. Produce one complete approval contract per opportunity using the reference
   format. Expected and excluded paths must be exact, not illustrative.
3. Freeze stable acceptance-criterion IDs, evidence requirements, authority,
   and human gates in the presented revision and calculate its fingerprint.
4. Stop without creating a worktree, branch, edit, commit, push, or pull request.

Approval applies only to the exact stable ID, revision, fingerprint, and issue
date stated by the human. Ambiguous approval is not authorization.

## Delivery Mode

For every explicitly approved item:

1. Treat one stable ID as one delivery unit, isolated worktree, branch, task
   contract, evidence bundle, and pull request. Do not combine items unless the
   approved contract explicitly does so.
2. Refresh `origin/main`, record its commit, and work from a dedicated worktree.
   Never modify or clean the primary checkout.
3. Materialize the approved packet as a repository-native task contract without
   changing its meaning. Freeze its criteria, record the approval, calculate
   the fingerprint, and validate it before implementation edits.
4. Implement the smallest complete slice within the exact approved path set.
5. Run targeted checks and the repository verification command. Create an
   evidence bundle covering every acceptance ID, exact changed paths and
   commands, deviations, commit, and reviewer disposition.
6. Give the contract, final diff, and evidence to a fresh, read-only reviewer.
   The reviewer must not patch its own findings.
7. Resolve blocking findings in a separate implementation pass, refresh the
   evidence, and obtain a fresh review.
8. Push the branch and open a draft pull request. Monitor required GitHub checks
   and repair in-scope failures through the deviation loop.
9. Mark the pull request ready for human review only when the exact approved
   revision is satisfied, local verification is green, the evidence validator
   passes, independent review is verified, and all required GitHub checks are
   present and green.

Never merge, enable auto-merge, release, deploy, publish shared assets, roll out
to consumers, change repository protection, or broaden authority.

## Deviation Loop

Audit conformance before the first implementation edit, after edits, after each
verification pass, after independent review, and after each CI result. A
deviation is any mismatch in the approved goal, scope, exact path set,
constraints, assumptions, frozen criteria, required evidence, authority,
prohibited actions, gates, security posture, or verification outcome.

Every deviation must start a revisit:

1. Record the deviation and evidence.
2. Diagnose its cause.
3. Revise only the implementation approach, never the approved contract.
4. Remove or repair only agent-owned nonconforming work.
5. Rerun affected targeted checks and the full verification set.
6. Refresh evidence and repeat independent review when the diff changes.
7. Keep an existing pull request in draft and rerun CI.

Repeat while the approved contract can still be honored safely. Never silently
waive, reinterpret, omit, substitute, or weaken a requirement.

If compliance requires any contract change, stop and present the deviation
approval packet. Human approval creates a new immutable contract revision and
fingerprint while preserving the prior revision. An approval recorded as a
deviation inside the old evidence bundle does not make that old revision
verified. Rejection means return to the prior approved contract or abandon the
item.

## Stop Conditions

Stop for human direction when the active contract cannot be honored without a
new path, changed criterion, broader authority, destructive action,
security-sensitive decision, or accepted residual risk. Stop and report rather
than claiming success when authentication, validation, independent review, or
required CI remains unavailable.
