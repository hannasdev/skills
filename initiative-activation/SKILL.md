---
name: initiative-activation
description: Activate an accepted initiative for implementation. Use when moving docs/initiatives/backlog/<initiative> to docs/initiatives/active/<initiative> or an equivalent repository convention, creating a fresh implementation branch from main, selecting the first or next milestone, updating initiative bookkeeping, and producing an implementation packet for a builder agent.
---

# Initiative Activation

## Purpose

Move an accepted initiative from planning into implementation with a clean branch, a named milestone, and a compact implementation packet.

Activation is a decision point. Do not activate fuzzy or rejected initiative docs just because implementation is possible.

## Preconditions

- The initiative has passed initiative adversarial review, or the user explicitly accepts the known risks.
- The target milestone is known.
- The repository working tree is clean enough to move docs and create a branch without mixing unrelated work.
- Repository guidance permits starting implementation.

If any precondition is not met, stop and report the blocker or ask for the missing decision.

## Required Process

1. Read local guidance.
   - Read `AGENTS.md` or equivalent.
   - Read contribution or branch naming guidance.
   - Read product/initiative docs named by local guidance.
2. Confirm initiative state.
   - Locate the initiative in `docs/initiatives/backlog/<initiative>/` or the local equivalent.
   - Read `prd.md`, `milestones.md`, and optional `architecture.md`.
   - Confirm the target milestone and any carried-forward review notes.
3. Move the initiative to active.
   - Prefer `git mv` when the repository is under git and the folder is tracked.
   - Use the repository's active initiative convention, usually `docs/initiatives/active/<initiative>/`.
   - Update status/bookkeeping fields only when local docs use them.
4. Create the implementation branch.
   - Use the repo's branch naming convention.
   - Start from the freshest appropriate base, usually fetched `main` / `origin/main`.
   - Prefer an existing branch helper if the repository or another skill provides one.
   - Never push directly to `main`.
5. Produce an implementation packet.
   - Include only what a builder needs for the selected milestone.
   - Include acceptance criteria, non-goals, relevant constraints, required validation, known risks, and explicit deferrals.
   - Do not include the full planning conversation.
6. Report activation.
   - Active initiative path
   - Branch name and base
   - Target milestone
   - Files moved or updated
   - Implementation packet
   - Any unresolved risks or human decisions

## Implementation Packet

Use `references/implementation-packet-template.md` for the packet structure.

The packet can be returned in the conversation, saved in the initiative folder, or passed to a delegated implementation agent. Save it as a file only when repository convention or the user asks for durable packet files.

## Guardrails

- Do not activate more than one initiative if repository guidance says only one may be active.
- Do not silently weaken acceptance criteria during activation.
- Do not add implementation scope while moving docs.
- Do not create a branch from stale local `main` when a remote base is available.
- Do not mix activation changes with feature implementation in the same commit unless the user explicitly wants that.

## Next Skill

End by recommending the next skill:

- If the implementation packet is ready, recommend `milestone-implementation`.
- After the milestone implementation report is complete, recommend `milestone-conformance-review`.
- If activation revealed planning gaps, recommend returning to `initiative-planning` or `initiative-adversary-review` before coding.
