# Usability Validation Standard

## Purpose

Define the shared standard for verifying usability before UI work is considered
done.

## Core Rule

Usability must be verified through direct interaction by the agent using a
browser or simulator, not inferred from code alone.

## Required Practices

- Generate and maintain critical user flows for affected UI areas.
- Exercise those flows directly in browser or simulator.
- Verify that controls are reachable in supported view states.
- Verify that primary actions remain visible and operable.
- Verify that spacing and layout do not degrade important interactions.
- Capture findings from both automated checks and human feedback.

## Feedback Learning Rule

Human feedback should tighten the standard over time rather than disappear into
one-off revisions.

- recurring feedback should become guidance
- recurring failures should become checklist items
- recurring aesthetic or usability corrections should become reusable standards

## Critical User Flow Requirement

For any meaningful UI surface, maintain a small set of critical user flows that
represent the minimum usable experience.

Each critical flow should define:

- goal
- starting state
- sequence of actions
- expected visible outcome
- failure conditions

## Done Rule

UI work is not done if:

- key controls cannot be reached
- critical flows were not exercised directly
- browser or simulator validation was skipped
- usability issues remain unexplained
