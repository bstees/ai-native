---
name: model-selector
description: Select a subagent model and spawn configuration that maximizes likely task quality while controlling total token cost. Use before spawning or reconfiguring subagents when choosing a workload profile, capability tier, available runtime model, reasoning effort, context inheritance, task brief, output bound, or escalation path.
---

# Model Selector

## Goal

Choose the least expensive subagent configuration likely to succeed in one pass.
Optimize expected total cost, including retries and parent-agent rework, rather
than minimizing the first call.

## Read First

- [`../../../assets/agent-orchestration/README.md`](../../../assets/agent-orchestration/README.md)
- [`../token-efficiency/SKILL.md`](../token-efficiency/SKILL.md)

Treat the orchestration profiles, routing policy, and provider adapters as
canonical. Do not copy their settings into this skill or permanently bind a
capability tier to a concrete model name.

## Selection Workflow

1. Confirm that delegation creates useful parallelism, isolation, specialist
   focus, or independent review. Recommend no spawn when coordination and
   context-transfer cost exceed the likely benefit.
2. Choose the closest canonical workload profile:
   - `documentation`: bounded writing, editing, formatting, or summarization
   - `explorer`: bounded, read-heavy discovery with evidence locations
   - `delivery`: scoped implementation plus verification
   - `reviewer`: independent correctness, security, regression, or risk review
3. Assess the actual task on five dimensions: ambiguity, reasoning depth,
   novelty, consequence of error, and strength of available validation.
4. Start from the profile's capability tier and raise it only when one or more
   dimensions materially exceed the profile default. Lower it only for a
   deterministic, tightly bounded task with strong validation.
5. Inspect the models the current runtime actually makes available. Match their
   declared strengths to the selected tier. Prefer the runtime default when it
   already satisfies the tier or when model capabilities are unknown.
6. Choose reasoning effort independently from model strength:
   - `low`: extraction, lookup, formatting, or straightforward bounded work
   - `medium`: routine implementation, analysis, or synthesis
   - `high`: difficult debugging, architecture, adversarial review, or material
     ambiguity
   - above `high`: exceptional consequence or complexity, or escalation after a
     lower setting produced inadequate results
7. Build the smallest sufficient context packet. Prefer fresh context plus an
   explicit brief; use limited recent turns when reconstructing necessary
   context would be riskier or larger; use full history only when the delegated
   task is inseparable from it.
8. Bound the result to the artifact or findings the parent needs. Exclude raw
   exploration logs, unrelated files, and duplicated parent context.
9. Define observable escalation triggers before spawning.

## Capability Calibration

| Task shape | Starting tier | Typical effort |
|---|---|---|
| Mechanical extraction or deterministic transformation | `economy` | `low` |
| Bounded exploration, summarization, or documentation | `efficient` | `low` |
| Routine implementation, testing, or multi-source analysis | `balanced` | `medium` |
| Architecture, difficult debugging, or consequential review | `advanced` | `high` |
| Exceptional ambiguity or consequence after a lower tier fails | `maximum` | above `high` |

Treat this table as a starting point, not a substitute for the five-dimension
assessment. Do not use the strongest available model merely because quality is
important; use it when a weaker choice creates meaningful failure or retry risk.

## Context And Spawn Rules

- Prefer no inherited turns for independent exploration, documentation, and
  review. Supply selected evidence directly.
- Prefer a small recent-turn window for delivery work whose acceptance criteria
  were just negotiated in conversation.
- Preserve reviewer independence: provide changed artifacts, requirements, and
  validation results, but not the parent's conclusions.
- Omit a model override when the runtime can route the selected tier more
  reliably than the caller can.
- Respect runtime constraints between model overrides and context inheritance.
  If the desired combination is unsupported, preserve task quality first, then
  minimize context through the brief.
- Never expand permissions, data access, or action authority through model
  selection.

## Output

Return one recommendation in this shape, omitting fields the runtime does not
support:

```yaml
delegation: recommended | unnecessary
profile: documentation | explorer | delivery | reviewer
capability_tier: economy | efficient | balanced | advanced | maximum
model: <current runtime model or inherit>
reasoning_effort: <current runtime value>
fork_turns: <"none", an exact positive turn count such as "3", or "all">
task_brief:
  goal: <one outcome>
  inputs: <only required context and files>
  acceptance_criteria: <observable checks>
  validation: <required commands or evidence>
output: <bounded artifact or findings format>
escalate_when:
  - <observable failure condition>
rationale: <one sentence explaining the quality-cost tradeoff>
```

When execution was requested, translate the recommendation into the runtime's
subagent-spawn arguments and use the assembled `task_brief` as the prompt. When
only advice was requested, return the recommendation without spawning.

## Escalation

Escalate one step rather than jumping directly to the maximum tier. Escalate
when validation fails, the agent reports low confidence with a concrete reason,
required context exceeds the selected model's capacity, or a required control
is unavailable. Fix an incomplete brief before buying more model capacity.

## Guardrails

- do not hardcode model names or pricing in this skill
- do not optimize token count at the expense of safety or verification
- do not confuse a longer context with a better task brief
- do not delegate a vague parent task; narrow it first
- do not retry unchanged settings after an observable capability failure
- do not claim a provider or model satisfies governance requirements merely
  because it is technically available
