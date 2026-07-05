# Assets

This directory is where approved decisions become reusable artifacts.

The goal is to maintain shared native-AI tools in one place so production repos
can adopt them without each repo inventing its own version.

## Candidate Asset Types

- prompts
- repo rules
- workflow templates
- validation checklists
- sync or install scripts
- agent definitions
- NFR frameworks
- infrastructure decision frameworks
- tool-selection frameworks
- observability standards

## Rule

Assets here should exist because a decision record justifies them, not because a
single tool release looked interesting.

## Current Assets

- [`repo-rules/`](./repo-rules/) contains the first shared operating-rules
  asset for consumer repositories.
- [`quality/`](./quality/) contains reusable engineering quality standards.
- [`workflows/`](./workflows/) contains shared development workflows for common
  agentic software-delivery tasks.
