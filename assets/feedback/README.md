# Feedback Assets

## Purpose

Define how consumer repos capture operational friction, usability toil, and
developer-authored guidance as reusable feedback.

## Core Position

Feedback should live as markdown inside each consumer repo. That keeps the
source material close to the work, diffable in git, and easy for both humans
and agents to promote into stronger shared standards later.

## Required Feedback Channels

- `feedback/toil/` for feedback generated from friction observed during active
  work
- `feedback/developer-notes/` for markdown created directly by developers that
  should be treated as signal
- `audits/` for structured onboarding and standards reviews

## Shared Rules

- toil that could be reduced with better guidance should create a feedback
  markdown entry automatically as part of the task output
- repo-local markdown written in isolation by developers should be considered
  candidate feedback, not ignored
- feedback should be reviewed on a defined cadence and at commit boundaries
- recurring themes should harden local rules first, then shared AI Native
  assets when commonality is clear

## Supporting Assets

- [`feedback-ingestion-standard.md`](./feedback-ingestion-standard.md)
- [`feedback-entry-template.md`](./feedback-entry-template.md)
