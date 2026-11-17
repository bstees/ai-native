# November 13 Requirements-Grounded Verification Pilot

## Status

Candidate approved after the durable feedback record was merged. The bounded
pilot may run; merge and any resulting runtime-policy remediation remain human
gates.

## Goal

Test whether independent, specification-derived verification exposes missing
requirements more reliably than implementation-informed testing alone.

## Candidate

The approved candidate is the Node runtime and dependency-lock mismatch
fixed by commit `f8afa3f`. The pre-fix revision is `0ffa3a5`, and the repository
records the failure in
`.ai-native/feedback/toil/2026-08-11-node-runtime-build-mismatch.md`.

This candidate is suitable because it has a durable before/after boundary, a
reproducible runtime-contract surface, and a merged account of the intended
behavior.

## Approved Inputs

After candidate approval, freeze:

- the original failure record and applicable repository runtime contract
- pre-fix and post-fix commit SHAs
- exact supported Node runtime and dependency installation command
- acceptance criteria and prohibited changes
- a bounded execution budget

## Method

1. Give a fresh verification actor the frozen requirements without the patch.
2. Have it state candidate invariants and design focused tests before it sees
   implementation details.
3. Run the same verification against the pre-fix and post-fix revisions.
4. Compare the independent tests with implementation-informed tests already in
   the repository.
5. Record disclosed requirement deviations, false positives, defects detected,
   human-review minutes, execution time, token use, and command cost.
6. Ask a read-only reviewer to assess whether the evidence proves the original
   requirement rather than merely reproducing the implementation.

## Success Criteria

- The frozen requirements and expected results are established before patch
  inspection.
- At least one focused command is executed unchanged against both revisions.
- Differential evidence records expected and observed results for both commits.
- Any compromise, substitution, or unfulfilled criterion is explicit.
- Results separate specification-derived findings from code-derived findings.
- The experiment reports false positives, cost, context use, and human effort.

## Result

The approved pilot ran against read-only archives of `0ffa3a5` and `f8afa3f`
using the same verifier fingerprint for both revisions.

- runtime selection: failed before and passed after; the patch added `.nvmrc`
  with Node `22.23.4`, which satisfies Vite's declared engine range
- package engine declaration: failed before and after; `package.json` still has
  no `engines.node` contract
- setup guidance: failed before and after; the README still does not name
  `.nvmrc`, `nvm use`, or a supported Node version

The durable result is
[`pilot-report.json`](../experiments/november-13-node-runtime-pilot/pilot-report.json).
It records one fail-before/pass-after check and two material unfulfilled
requirements. Independent read-only review and remediation remain pending.

## Stop Conditions

Stop and report a bounded unknown if the original requirement cannot be
reconstructed, either revision cannot be built reproducibly, or the supported
runtime cannot execute both sides without changing their committed contents.
Do not modify the historical revisions to force the experiment to pass.
