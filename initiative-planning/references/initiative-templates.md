# Initiative Templates

Use these templates when a repository does not already provide local initiative templates. Match existing repository headings and bookkeeping when they exist.

## `prd.md`

```markdown
# <Initiative Name>

## Status

- State: Backlog
- Owner: <human or team, if known>
- Created: YYYY-MM-DD
- Related docs: <links>

## Problem

Describe the user, maintainer, or system problem this initiative solves. Keep this outcome-focused.

## Goals

- <Goal 1>
- <Goal 2>

## Non-Goals

- <Explicitly out-of-scope item>
- <Tempting follow-up that should not be included>

## Product And Design Alignment

Explain how the initiative aligns with the repository's product principles, design guidelines, target architecture, and operating constraints.

## Proposed Solution

Describe the intended behavior and durable workflow. Keep details stable enough to survive implementation.

## User / Maintainer Workflows

- <Workflow or scenario>
- <Workflow or scenario>

## Acceptance Criteria

- [ ] <Repository-observable criterion>
- [ ] <User/maintainer-visible criterion>
- [ ] <Validation or diagnostic criterion>

## Risks And Tradeoffs

| Risk | Impact | Mitigation / Decision Path |
| --- | --- | --- |
| <risk> | <impact> | <mitigation> |

## Testing Strategy

Describe the unit, integration, contract, generated-output, migration, manual, or CI validation expected across the initiative.

## Open Questions

- [ ] <Question requiring human/product/architecture decision>
```

## `milestones.md`

```markdown
# <Initiative Name> Milestones

## Milestone 1: <Outcome Name>

### Outcome

Describe the smallest coherent outcome this milestone delivers.

### Scope

- <Included work>
- <Included work>

### Non-Goals

- <Excluded work>

### Acceptance Criteria

- [ ] <Criterion that a conformance reviewer can verify from diff/tests/docs>
- [ ] <Criterion that proves behavior rather than implementation shape>

### Required Validation

- `<command or focused validation>`
- Manual: <artifact or workflow to inspect, if needed>

### Risks / Watchpoints

- <Edge case, ownership boundary, migration issue, or review hotspot>

### Status

- [ ] Not started
- [ ] Implemented
- [ ] Conformance reviewed
- [ ] Adversarially reviewed
- [ ] PR opened
- [ ] Merged
```

Repeat the milestone block for each independently reviewable gate.

## `architecture.md`

```markdown
# <Initiative Name> Architecture Notes

## Context

Summarize the architectural pressure or constraint that makes this document necessary.

## Current State

Describe the relevant existing contracts, ownership boundaries, data flows, persistence model, APIs, or operational behavior.

## Target Shape

Describe the intended architecture after the initiative or milestone.

## Decisions

| Decision | Rationale | Alternatives Considered |
| --- | --- | --- |
| <decision> | <why> | <alternatives> |

## Contracts And Boundaries

- <Public API, schema, file ownership, generated artifact, workflow, or responsibility boundary>

## Migration / Compatibility

Describe how existing data, configs, generated artifacts, integrations, or user workflows continue to work.

## Failure Modes

- <Failure mode and intended behavior>
- <Partial-write, stale-state, rollback, retry, or diagnostic path>

## Security / Safety Considerations

- <Path handling, permissions, secrets, destructive operations, trust boundary, or abuse case>

## Validation

- <Contract test, integration test, migration test, smoke test, manual review, or generated artifact verification>

## Open Questions

- [ ] <Question>
```
