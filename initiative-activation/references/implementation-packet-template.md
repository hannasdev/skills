# Implementation Packet Template

```markdown
# Implementation Packet: <Initiative> / <Milestone>

## Branch Boundary

- Branch: <branch>
- Base: <base branch or remote tracking ref>
- Merge base: <sha if known>
- Initiative: <path>
- Milestone: <milestone heading>

## Objective

<One-paragraph outcome for this milestone.>

## Acceptance Criteria

- [ ] <criterion copied or derived from milestone>
- [ ] <criterion copied or derived from milestone>

## Scope Budget

- Primary behavior change: <one outcome>
- Major subsystem boundaries touched: <list>
- Acceptance criteria count: <count>
- Estimated non-generated diff size: <estimate>
- Validation shape: <focused validation story>
- Split rationale: <why this is the smallest reviewable unit>

## Explicit Non-Goals

- <out of scope for this milestone>

## Relevant Context

- Product / PRD constraints:
- Architecture / ownership constraints:
- Repository conventions:

## Relevant Files Or Areas

- <file/module/workflow if known>
- <file/module/workflow if known>

## Required Validation

- `<command>`
- Manual: <workflow or artifact to inspect>

## Known Risks And Watchpoints

- <risk>

## Open Questions

- [ ] <question, or None>

## Expected Implementation Report

The builder should return:

- summary of changes
- changed files
- tests added or updated
- commands run and results
- assumptions made
- known gaps
- intentionally deferred work
```
