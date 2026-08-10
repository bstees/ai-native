---
name: bounded-investigation
description: Keep branching investigations finite without weakening evidence or validation. Use for debugging, root-cause analysis, research, repository discovery, reviews, or ambiguous failures when search paths may multiply, scope may drift, repeated attempts are producing little new information, or the work risks becoming a rabbit hole.
---

# Bounded Investigation

## Goal

Reach a decision-useful conclusion within an explicit investigation boundary.
Make uncertainty and exhausted paths visible instead of hiding them in more
search.

## Read First

- [`../../../assets/workflows/goal-and-plan-mode.md`](../../../assets/workflows/goal-and-plan-mode.md)
- [`../dry-context/SKILL.md`](../dry-context/SKILL.md) when searching for an
  existing contract or duplicated guidance
- [`../token-efficiency/SKILL.md`](../token-efficiency/SKILL.md) when excessive
  context, rather than uncertainty, is the main problem

Treat those files as canonical for task planning, reuse discovery, and context
reduction. Do not restate their procedures in the investigation.

## Establish The Investigation Contract

Before broad discovery, record:

- **question**: the single uncertainty to resolve
- **decision**: what the result will enable someone to decide or do
- **in scope**: systems, artifacts, hypotheses, or time range that may matter
- **out of scope**: adjacent questions that will not be pursued
- **known evidence**: facts already supported by an authoritative source
- **budget**: observable limits such as files, queries, experiments, hypotheses,
  or branches; use wall-clock time only when the runtime can track it reliably
- **checkpoint**: when to reassess, no later than half the initial budget
- **stop conditions**: evidence that answers the question, disproves a path,
  exhausts the budget, or makes further work unauthorized or disproportionately
  costly

Choose a budget proportional to consequence and uncertainty. If the user has
set a limit, preserve it. Otherwise, start with the smallest slice capable of
testing the leading hypothesis and at most two credible alternatives.

## Investigate In Bounded Slices

1. Rank paths by information gain, authority of available evidence, and cost.
2. Test the highest-value path with the cheapest discriminating check.
3. Keep a compact evidence ledger containing the path or hypothesis, evidence
   location, result, and disposition. Do not preserve a raw activity diary.
4. Keep at most two unresolved branches open. Park new branches unless they are
   more decision-relevant than an active branch.
5. At each checkpoint or material surprise, choose exactly one action:
   - **continue** within the existing contract because a named check can resolve
     a remaining uncertainty
   - **narrow** to the branch most likely to affect the decision
   - **stop** because a stop condition is met or remaining work has low expected
     information value
   - **escalate** because the investigation needs a materially larger scope,
     new authority, inaccessible evidence, or a consequential tradeoff
6. Extend a budget only with a new bound, the evidence that justifies the
   extension, and the decision it is expected to unlock. Request user direction
   when the extension materially changes the agreed scope or cost.

## Stop With A Useful Result

Stopping does not require certainty. Stop when one of these is true:

- authoritative evidence answers the question at the confidence the decision
  requires
- the leading explanation is disproved and remaining paths would not change
  the immediate decision
- independent checks stop producing materially new information
- the next check costs more than its likely decision value
- the budget is exhausted
- progress requires unavailable access, user choice, or out-of-scope action

Do not stop merely because the first search failed. Widen once in a deliberate,
bounded way when a credible source or hypothesis remains untested.

## Output

Return a bounded findings handoff:

```yaml
question: <investigated uncertainty>
status: answered | bounded-unknown | blocked
conclusion: <decision-useful result>
confidence: high | medium | low
evidence:
  - <authoritative location and what it proves>
eliminated_paths:
  - <path and why it was closed>
unresolved:
  - <remaining uncertainty and why it was not pursued>
budget: <limit and amount used>
next_action: <recommended decision or smallest follow-up>
escalate_when:
  - <observable condition requiring renewed investigation>
```

Use `bounded-unknown` when the available evidence cannot answer the question
within the contract. Reserve `blocked` for a concrete dependency that prevents
meaningful progress, not for ordinary uncertainty.

## Guardrails

- do not use a budget to justify skipping required safety or correctness checks
- do not confuse effort already spent with evidence that a path is valuable
- do not keep searching to avoid reporting an uncomfortable or uncertain result
- do not expand from diagnosis into implementation without authorization
- do not revisit a closed path unless new evidence changes its premise
- preserve contradictory authoritative evidence and lower confidence accordingly
