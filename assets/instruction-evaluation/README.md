# Instruction Evaluation

## Purpose

Measure whether changes to AI-facing Markdown preserve or improve agent behavior
while reducing the total context cost of accepted work.

This framework evaluates `agents.md`, skills, workflows, prompt templates, and
similar instruction artifacts as behavioral configuration. A smaller file is
not considered more efficient when it causes more failures, retries, or human
correction.

## Evaluation Rule

Compare a control and candidate using:

- the same evaluation cases
- the same model identifier and settings
- fresh context for every attempt
- multiple attempts per case
- automated checks where outcomes are deterministic
- rubric scoring for judgment-heavy behavior

Quality and safety are gates. Among candidates that pass those gates, prefer
the candidate with fewer total tokens per successful outcome. A candidate may
also be accepted when quality improves without increasing failures or safety
violations, even if token cost is unchanged.

Do not use the included character-based instruction estimate as an exact model
token count. Record provider-reported `inputTokens` and `outputTokens` in run
files for the end-to-end comparison.

## Contents

- [`cases/`](./cases/) contains representative task definitions and rubrics.
- [`contracts/evaluation-case.schema.json`](./contracts/evaluation-case.schema.json)
  defines a valid case.
- [`contracts/evaluation-run.schema.json`](./contracts/evaluation-run.schema.json)
  defines the results recorded for one instruction variant.
- [`../../scripts/evaluate-instructions.js`](../../scripts/evaluate-instructions.js)
  validates cases and compares two recorded runs.

The initial cases cover implementation, diagnosis, planning under ambiguity,
and evidence-based review. Consumer repositories should add cases for their
own recurring and high-risk work rather than relying only on these generic
cases.

## Running An Evaluation

First validate the checked-in case contracts:

```bash
npm run eval:instructions
```

Then create one run JSON file for the current instructions and another for the
proposed instructions. Instruction paths are resolved relative to each run
file. Run each case several times in a clean context and record provider token
usage plus rubric scores.

A minimal result has this shape; every scored dimension must match the case's
rubric:

```json
{
  "variant": "control",
  "model": "provider/model-version",
  "modelSettings": { "temperature": 0 },
  "instructionFiles": ["../agents.md"],
  "results": [
    {
      "caseId": "targeted-bug-fix",
      "attempts": [
        {
          "success": true,
          "inputTokens": 1200,
          "outputTokens": 450,
          "qualityScores": {
            "correctness": 4,
            "scopeControl": 2,
            "validation": 2,
            "maintainability": 2
          },
          "violations": []
        }
      ]
    }
  ]
}
```

Compare the runs:

```bash
npm run eval:instructions -- \
  --control /absolute/path/control-run.json \
  --candidate /absolute/path/candidate-run.json
```

Add `--json` for machine-readable output. The command exits unsuccessfully
when the candidate does not pass the acceptance rule, so it can be used in CI
after run results have been produced.

## Scoring Guidance

Each attempt must include every rubric dimension from its case. Scores may not
exceed that dimension's maximum. A violation is an observed forbidden behavior
and is always recorded separately from the quality score.

Prefer blind scoring: the reviewer should not know which instruction variant
produced the response. Calibrate model-based graders against periodic human
review instead of treating a grader model as ground truth.

Record an attempt as successful only when its task-level acceptance criteria
are satisfied. Record retries and human corrections even if the final response
eventually succeeds; their tokens are part of the real cost.

## Interpreting Results

The comparison reports:

- success rate
- normalized rubric quality
- forbidden-behavior violations
- provider-reported tokens per success
- human corrections
- estimated instruction footprint

The default acceptance gate requires:

1. matching model identifiers
2. zero candidate violations
3. no decrease in success rate
4. no decrease in normalized quality
5. either lower tokens per success, or higher quality without higher token cost

For consequential changes, use more attempts and inspect confidence intervals
before treating a small difference as meaningful. This first implementation
deliberately reports observed results rather than claiming statistical
significance from a small sample.

## Maintaining The Suite

- Add a case when a real failure, repeated correction, or important workflow is
  not represented.
- Keep case prompts stable so results remain comparable over time.
- Version material rubric changes alongside the instruction change they affect.
- Keep deterministic assertions outside subjective rubrics where possible.
- Do not add cases merely to make one candidate look favorable.

## Pilot Experiment

[`pilot/`](./pilot/) contains a synthetic repository and two instruction
variants for exercising the complete evaluation path with Codex. It is an
experimental fixture, not a recommendation to replace a production
`AGENTS.md`.

Run one fresh session per case and variant with:

```bash
npm run eval:instructions:pilot
```

Use `-- --attempts=3` for repeated sampling. The runner pins the model and
reasoning effort, creates an isolated temporary Git repository for every
attempt, and stores raw JSONL events, final responses, diffs, exact usage, and
a manifest under `pilot/runs/`. Variant order is counterbalanced across cases
to reduce order and shared-cache effects. Review and score those artifacts
before using the normal comparison command.
