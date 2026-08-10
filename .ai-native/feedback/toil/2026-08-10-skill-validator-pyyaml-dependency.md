# Skill Validator Requires Undeclared PyYAML Dependency

## Metadata

- `feedback_id`: `toil-2026-08-10-skill-validator-pyyaml`
- `captured_on`: `2026-08-10`
- `captured_by`: `codex`
- `source_type`: `toil`
- `scope`: `candidate-shared`
- `status`: `new`

## Context

Creating and validating the repo-local `model-selector` skill with the standard
`skill-creator` workflow.

## Friction

`quick_validate.py` failed under both the system Python and bundled workspace
Python because neither environment provided its imported `yaml` module. The
validation required a temporary `PyYAML` installation before it could run.

## Likely Guidance Gap

The skill-validation workflow assumes an undeclared Python dependency and does
not identify a dependency-complete runtime or fallback command.

## Proposed Improvement

Bundle `PyYAML` with the skill-creator runtime, make the validator dependency
free, or document a supported dependency-complete invocation.

## Evidence

- `ModuleNotFoundError: No module named 'yaml'` from
  `/Users/bstees/.codex/skills/.system/skill-creator/scripts/quick_validate.py`
- Validation succeeded after installing `PyYAML` into a temporary directory.

## Next Action

Review with the shared skill-creator maintainers and choose a deterministic
validator runtime that does not require per-task dependency installation.
