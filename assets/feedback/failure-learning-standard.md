# Failure Learning Standard

Use a failure record when an agent run, workflow, or human correction exposes a
repeatable system weakness. The goal is not to turn every incident into a
permanent rule. It is to promote only generalizable lessons with regression
evidence.

The executable format is
[`contracts/failure-record.schema.json`](./contracts/failure-record.schema.json).
A promoted example is
[`examples/failure-record.json`](./examples/failure-record.json).

## Promotion Loop

1. Preserve a concise evidence reference and classify the failure.
2. Record one durable reference per observed occurrence. The recurrence count
   must equal that reference list, and the evidence must state whether the
   pattern is incident-specific, repository-wide, or cross-repository.
   Incident-specific answers normally remain local evidence rather than shared
   guidance.
3. Choose the narrowest remediation: instruction, skill, tool, validator,
   test, or workflow constraint.
4. Add a representative regression case and capture its result.
5. Promote a guardrail only after at least two observations establish a
   pattern, the regression passes, and a human owner approves the target asset.
6. Close the record only when outcome evidence shows the remediation worked.

Do not store raw private conversations, secrets, or full chain-of-thought in a
failure record. Preserve durable paths, test IDs, hashes, and concise observed
behavior instead.

Validate a record with `npm run validate:failure-record -- <path>`.
