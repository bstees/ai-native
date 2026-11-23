# Requirement ledger

Run the requirement ledger as a separate pre-acceptance check alongside the
[task contract](task-contract.md) and [independent verification](independent-verification.md).
The [task evidence bundle](../quality/task-evidence-bundle.md) retains its own
requirements and validation.

Assign each requirement a stable ID, summarize the requirement, and cite its
authoritative source. Record conflicting inputs by reference, the affected
requirement IDs, and a resolution reference when the conflict is resolved.
Keep raw prompts, private correspondence, personal data, and secrets out of
the ledger.

Use draft while gathering evidence. A verified requirement needs at least
one independently checkable reference, such as a CI result, test result,
review record, or repository artifact. Cite an HTTPS URL or a repository-relative
file path with an extension. An agent's completion claim is
insufficient. Reviewers should follow the references and confirm that the
evidence supports the stated requirement. The CLI checks the ledger's
structure and recorded state locally without resolving external references.

Mark the ledger ready only when all required requirements are verified and
all conflicts are resolved. Validate the [example](examples/requirement-ledger.json)
with the same command used for a project ledger.

```sh
npm run validate:requirement-ledger -- assets/workflows/examples/requirement-ledger.json
```
