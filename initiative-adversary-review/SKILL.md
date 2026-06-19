---
name: initiative-adversary-review
description: Adversarially review initiative planning artifacts before implementation or activation. Delegates to adversarial-reviewer when available. Use when reviewing initiative PRDs, milestones, optional architecture notes, or similar repository planning docs against product principles, target architecture, repo guidance, scope clarity, milestone quality, risk coverage, and testability before moving work into active implementation.
---

# Initiative Adversary Review

## Purpose

Stress-test the initiative plan before code is written. This review asks whether the documented plan is coherent, valuable, scoped, testable, aligned with repository guidance, and ready to become active work.

This is not an implementation review. Do not require a diff, and do not judge code quality unless implementation details in the initiative docs create architectural or delivery risk.

## Delegation Default

Invoking this skill is an explicit request to use `adversarial-reviewer` when
multi-agent spawning is available. Do not run this review locally merely
because the user did not separately say "use a subagent."

When a multi-agent spawn tool is available, spawn a cold delegated
`adversarial-reviewer` agent. Give it only the initiative artifacts and
relevant repository source-of-truth docs, not the whole planning conversation.

If delegation is unavailable, perform the review locally and state that the review did not run in a cold context.

## Required Process

1. Establish scope.
   - Identify the initiative folder and whether it is in `backlog/`, `active/`, or another repository convention.
   - Read `prd.md`, `milestones.md`, and `architecture.md` when present.
   - If `prd.md` or `milestones.md` is absent, issue a `Blocked` verdict stating which required artifact is missing.
   - Read repository guidance such as `AGENTS.md`.
   - Read product, design, architecture, contribution, or workflow docs named by repository guidance.
   - Inspect one other initiative in the same parent directory (preferring a completed one) only to learn local structure and quality expectations.
2. Review product fit.
   - Is the problem real and outcome-focused?
   - Is the value clear for users, maintainers, operators, or the system?
   - Does it align with product principles and roadmap/source-of-truth docs?
3. Review scope control.
   - Are goals and non-goals explicit?
   - Are tempting follow-ups excluded?
   - Is there hidden scope expansion in milestones or architecture notes?
4. Review architecture and ownership.
   - Are boundaries, contracts, persistence, generated artifacts, APIs, permissions, migrations, or operational responsibilities clear where relevant?
   - Are alternatives or tradeoffs recorded when they materially affect future work?
5. Review milestone quality.
   - Does each milestone produce a coherent, reviewable state?
   - Are acceptance criteria externally observable and testable?
   - Are required validations named at the right level?
   - Are dependencies and sequencing clear?
   - Does each milestone include a plausible scope budget covering primary behavior change, subsystem boundaries, acceptance criteria count, estimated non-generated diff size, validation shape, and split rationale?
   - Treat more than 5 acceptance criteria, more than 2 major subsystem boundaries, estimated non-generated diff over 800 changed lines, or diffuse validation as review-churn tripwires. Recommend splitting or documenting why the larger gate is still more reviewable.
6. Review risk coverage.
   - Look for edge cases, compatibility risks, migration risks, data-loss risks, unsafe assumptions, ambiguity, and review churn.
   - Check whether risks have mitigation, validation, or a human decision path.
7. Produce a verdict.
   - **Accepted:** ready to activate or implement.
   - **Accepted with notes:** safe to proceed; carry named risks forward.
   - **Needs revision:** revise initiative docs before activation.
   - **Blocked:** missing decision or contradiction prevents meaningful planning.

## Review Priorities

1. Product and architecture alignment
2. Scope clarity and non-goals
3. Milestone acceptance criteria
4. Testability and validation strategy
5. Risk and ambiguity visibility
6. Scope budget and likely review burden
7. Wording and polish

## Output Format

Use this structure:

```md
## Initiative Adversary Review

Scope: <initiative path and docs reviewed>
Verdict: Accepted | Accepted with notes | Needs revision | Blocked

## Blocking / Must Revise
- <issue, impact, suggested doc change>

## Should Improve
- <gap likely to cause implementation or review churn>

## Consider
- <tradeoff, optional clarification, or future follow-up>

## Checked / No Action
- <important risk area reviewed and accepted>

## Activation Notes
- <risks or constraints the implementation packet should carry forward>
```

Omit empty sections. Keep findings tied to the durable artifact that should change.

## Next Skill

End by recommending the next skill:

- Verdict `Accepted` or `Accepted with notes`: recommend `initiative-activation`.
- Verdict `Needs revision`: recommend `initiative-planning` to update the docs, then rerun `initiative-adversary-review`.
- Verdict `Blocked`: ask for the required human/product/architecture decision before rerunning this skill.
