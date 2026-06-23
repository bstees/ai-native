# Development Workflows

This directory contains reusable workflows for AI-assisted software
development.

These are development workflows for the agent doing the work, not product
workflows inside an application.

## Why These Exist

Across current agentic-development tooling, there is strong commonality around:

- understanding repository context before changing code
- establishing a clear goal before execution
- using tools explicitly instead of improvising everything in prompts
- keeping intermediate state visible
- verifying outcomes before declaring success
- introducing human review at meaningful risk boundaries

That commonality shows up across current OpenAI Codex docs, Claude Code docs,
GitHub Copilot documentation, and DORA's delivery-oriented framing. This
workflow set turns that common ground into reusable operating patterns.

Sources used:

- [OpenAI Codex docs](https://developers.openai.com/codex)
- [Claude Code overview](https://code.claude.com/docs/en/overview)
- [GitHub Copilot docs](https://docs.github.com/en/copilot)
- [DORA](https://dora.dev/)

## What Is Stable vs Variable

### Common Enough To Standardize

- require a clear goal before work begins
- gather context before editing
- prefer the smallest useful change
- run relevant verification
- record assumptions and outcomes
- use human gates for consequential or protected actions

### Usually Variable By Team

- how much planning is expected before coding
- how much refactoring is allowed during feature work
- how strict branch, commit, and review requirements are
- which test depth is required before handoff
- when a workflow can auto-continue versus must pause

These workflow docs standardize the first category and explicitly mark the
second for local adaptation.

## Initial Workflow Set

- [`goal-and-plan-mode.md`](./goal-and-plan-mode.md)
- [`feature-delivery.md`](./feature-delivery.md)
- [`bug-fix.md`](./bug-fix.md)
- [`code-review.md`](./code-review.md)
- [`debugging.md`](./debugging.md)
- [`repo-onboarding-audit.md`](./repo-onboarding-audit.md)
- [`rollout-and-validation.md`](./rollout-and-validation.md)
- [`usability-validation.md`](./usability-validation.md)

All workflows in this directory should be read alongside
[`../quality/engineering-quality.md`](../quality/engineering-quality.md).

## Adaptation Rule

Consumer repos should keep the default sequence intact unless local constraints
clearly require a change. Prefer adding repo-specific details rather than
rewriting the workflow from scratch.
