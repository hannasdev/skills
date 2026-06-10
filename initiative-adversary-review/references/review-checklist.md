# Initiative Adversary Review Checklist

Use this only when a deeper pass is needed.

## Product

- The problem statement names the pain or opportunity, not just the proposed solution.
- Goals are outcome-oriented.
- Non-goals prevent likely scope creep.
- User, maintainer, operator, or system impact is clear.

## Architecture

- Ownership boundaries are explicit.
- Public contracts, schemas, generated artifacts, data flows, or APIs are named where relevant.
- Migration and compatibility expectations are clear.
- Security, permissions, destructive actions, and trust boundaries are considered when relevant.

## Milestones

- Each milestone is independently reviewable.
- Each milestone has one primary behavior change.
- Each milestone stays within review-oriented tripwires or explains why not: 3-5 acceptance criteria, no more than 2 major subsystem boundaries, estimated non-generated diff under 800 changed lines, and one focused validation story.
- Acceptance criteria can be verified from branch diff, tests, docs, generated artifacts, or manual workflow evidence.
- Required validation is concrete.
- A milestone does not require hidden follow-up work to leave the repository coherent.
- The split rationale would help a reviewer understand why the milestone is not smaller.

## Risk

- Failure modes are named.
- Edge cases are testable.
- Human decisions are marked as open questions rather than implied.
- The plan does not rely on private chat rationale.
