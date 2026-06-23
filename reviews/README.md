# Reviews

This directory provides the lightweight human interface for governance.

The goal is to make human gates visible and easy to operate without adding a
heavy workflow engine too early.

## Current Mechanism

- record-level status fields
- one shared review queue
- linked records for decisions, concepts, and adoptions

## When To Scale Up

Keep this format while:

- the number of active reviews is small
- the same few people are making decisions
- records are still evolving quickly

Scale it up when:

- the queue becomes hard to manage manually
- approvals start happening in parallel across multiple repos
- you need summaries, notifications, or audit history beyond markdown edits
