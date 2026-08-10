---
name: dry-context
description: Discover existing public or exported contracts before proposing new code, then find duplicated implementation or guidance and recommend the smallest safe reuse or canonicalization. Use when code, components, docs, workflows, or standards may duplicate what already exists or are likely to drift.
---

# Dry Context

## Goal

Discover reusable repo surfaces before reducing repetition in code or markdown,
while preserving clarity, quality, and local usability.

## Read First

For duplicated AI-facing instructions, workflows, or standards, read the first
applicable path that exists:

- source repo: `planning/instruction-system-architecture.md`
- consumer repo: `.ai-native/README.md`

Read these only if they are relevant to the suspected duplication:

- `.ai-native/core-operating-rules.md` or
  `assets/repo-rules/ai-native-core-operating-rules.md`
- `.ai-native/goal-and-plan-mode.md` or `assets/workflows/README.md`
- `.ai-native/engineering-quality.md` or
  `assets/quality/engineering-quality.md`

## Workflow

1. Resolve the repo root. Select the first index tool that exists:
   `.ai-native/tools/repo-surface-index.js` in a consumer repo, otherwise
   `scripts/repo-surface-index.js` in the source repo. Query it with a few terms
   from the requested behavior, contract, component, or rule:

   ```bash
   REPO_SURFACE_INDEX_TOOL=".ai-native/tools/repo-surface-index.js"
   if [ ! -f "$REPO_SURFACE_INDEX_TOOL" ]; then
     REPO_SURFACE_INDEX_TOOL="scripts/repo-surface-index.js"
   fi
   node "$REPO_SURFACE_INDEX_TOOL" query TERM... --root REPO_ROOT --limit 12
   ```

   `query` creates or refreshes the local index automatically; Git repositories
   store it in private Git metadata. Do not routinely run `build` or `status`,
   read the script, or load the raw cache.
2. Open credible matches in their defining source. Verify the exported or
   public signature and inspect a caller or test when behavior matters.
3. If the command is unavailable, fails, or returns no credible match, use
   targeted `rg` and direct reads, widening gradually. An empty result is not
   proof that no reusable surface exists.
4. Identify the repeated thing and classify it:
   - duplicated implementation
   - duplicated guidance
   - repeated workflow sequence
   - repeated checklist logic
   - repeated local adaptation that should become canonical
5. Decide the smallest safe reduction:
   - extract shared code
   - replace repetition with a reference
   - narrow one file and let another stay canonical
   - promote a repeated local pattern into one reusable asset
6. Check that the reduction does not hide necessary context from the reader.
7. Report the discovery evidence, duplication, proposed reduction, and
   guardrails.

## Outputs

- a concise list of duplication findings
- verified existing surface contracts with symbol, path, and signature, or an
  explicit no-match result with the searched scope
- recommended canonical location for each repeated rule or pattern
- proposed extraction or reference strategy
- any cases where repetition should remain because local clarity matters more

## Guardrails

- do not remove context that is necessary for safe execution
- do not optimize for fewer words if the result becomes vague
- do not merge files with different responsibilities just to reduce file count
- prefer references over paraphrased repetition when one file is already
  canonical
- treat index results as navigation, not behavioral authority
- do not load the complete index into context or promote private implementation
  details as reuse contracts
- if known generated or third-party code appears in results, do not treat it as
  reusable repo logic; report the missing `.gitignore` rule
