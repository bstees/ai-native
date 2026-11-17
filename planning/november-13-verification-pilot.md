# November 13 Requirements-Grounded Verification Pilot

## Status

Candidate selection pending human approval. Do not run the pilot until the
owner approves the historical bug and its execution budget.

## Goal

Test whether independent, specification-derived verification exposes missing
requirements more reliably than implementation-informed testing alone.

## Candidate

The recommended candidate is the Node runtime and dependency-lock mismatch
fixed by commit `f8afa3f`. The pre-fix revision is `0ffa3a5`, and the repository
records the failure in
`.ai-native/feedback/toil/2026-08-11-node-runtime-build-mismatch.md`.

This candidate is suitable because it has a durable before/after boundary, a
reproducible build surface, and a written account of the intended behavior. It
must still be approved before execution because selecting the pilot determines
which historical requirement and cost profile the experiment represents.

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

## Stop Conditions

Stop and report a bounded unknown if the original requirement cannot be
reconstructed, either revision cannot be built reproducibly, or the supported
runtime cannot execute both sides without changing their committed contents.
Do not modify the historical revisions to force the experiment to pass.
