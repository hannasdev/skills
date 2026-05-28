---
name: milestone-implementation
description: Implement exactly one initiative milestone from an implementation packet. Use after initiative-activation when a builder agent should work from the packet, active initiative docs, repo rules, acceptance criteria, explicit non-goals, required validation, and known risks; return an implementation report without declaring the milestone complete.
---

# Milestone Implementation

## Purpose

Build the selected milestone from the implementation packet. This is the builder role: implement, test, and report. Do not declare the milestone accepted or PR-ready.

Completion belongs to `milestone-conformance-review` and `pre-pr-adversary-review`.

## Inputs

Use the implementation packet as the primary task boundary. It should include:

- branch and base boundary
- active initiative path
- target milestone
- objective
- acceptance criteria
- explicit non-goals
- relevant constraints
- relevant files or areas
- required validation
- known risks and watchpoints
- open questions

If the packet is missing critical information, inspect the active initiative docs. If scope, acceptance criteria, or architecture would need to be invented, stop and ask instead of guessing.

## Required Process

1. Rebuild local context.
   - Read repository guidance such as `AGENTS.md`.
   - Read the active initiative `prd.md`, `milestones.md`, and optional `architecture.md`.
   - Read the implementation packet.
   - Confirm current branch and intended base.
2. Confirm the milestone boundary.
   - Restate the objective, acceptance criteria, non-goals, and required validation.
   - Flag ambiguity before editing if it would affect behavior or scope.
3. Inspect existing code and tests.
   - Locate relevant modules, contracts, docs, generated artifacts, and nearest tests.
   - Prefer established project patterns over new abstractions.
4. Implement narrowly.
   - Build only the selected milestone.
   - Keep unrelated cleanup out of scope.
   - Use `testing` for test additions, bug fixes, generated outputs, CI changes, or validation.
   - Use `refactoring` only for behavior-preserving structural work.
5. Validate.
   - Run focused tests that prove the changed behavior.
   - If changes touch shared modules or public APIs, run the full test suite. Otherwise, run tests in affected packages only.
   - If validation runs but fails, diagnose the failure. If it is caused by your changes, fix before reporting. If it is a pre-existing or environmental failure, document it in the implementation report and proceed.
   - If validation cannot be run, report why and what uncertainty remains.
6. Review your own diff.
   - Check each acceptance criterion has implementation or evidence.
   - Check non-goals were respected.
   - Check docs/release-log/bookkeeping expectations from the packet.
7. Return an implementation report.
   - Use `references/implementation-report-template.md`.
   - Include assumptions and known gaps honestly.
   - Do not say the milestone passed; say what changed and what was tested.

## Guardrails

- Do not use the prior planning conversation as hidden scope.
- Do not weaken acceptance criteria.
- Do not silently expand into later milestones.
- Do not mark milestone status complete unless the packet explicitly asks for implementation-side bookkeeping.
- Do not open a PR from this skill; hand off to review first.
- Do not claim tests passed unless commands were run.

## Next Skill

End by recommending the next skill:

- If implementation and validation are complete, recommend `milestone-conformance-review`.
- If tests are missing or failing, recommend continuing with `testing` before conformance review.
- If the packet is wrong or incomplete, recommend `initiative-activation` to revise the packet or `initiative-planning` if the initiative docs themselves need changes.
