# Implementation Report Template

```markdown
## Milestone Implementation Report

Initiative: <path>
Milestone: <heading>
Branch: <branch>
Base: <base>
Commit: <short sha and subject, or "not created: <reason>">

## Summary

- <what changed>

## Changed Files

- `<path>`: <purpose>

## Acceptance Criteria Coverage

| Criterion | Implementation Evidence | Test / Validation Evidence |
| --- | --- | --- |
| <criterion> | <code/docs/artifact evidence> | <test/manual evidence> |

## Scope Budget Check

- Primary behavior change preserved: yes / no
- Major subsystem boundaries touched: <actual list>
- Acceptance criteria count: <count>
- Non-generated diff size: <actual or approximate changed lines, excluding generated/vendor/lockfile churn>
- Validation shape: <focused / broader than planned / incomplete>
- Exceeded tripwires: <none, or list with rationale>

## Tests And Validation

- `<command>`: passed / failed / not run
- Manual: <result>

## Assumptions

- <assumption, or None>

## Known Gaps

- <gap, or None>

## Deferred Work

- <explicit deferral, or None>

## Notes For Review

- <risk, tradeoff, or area for conformance/adversarial review>
```
