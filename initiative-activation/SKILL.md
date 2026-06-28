---
name: initiative-activation
description: Activate an accepted initiative for implementation. Use when moving an initiative from backlog to active state or an equivalent repository convention, creating a fresh implementation branch from main, selecting the first or next milestone, updating initiative bookkeeping, and producing an implementation packet for a builder agent.
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
   - If `initiative.json` exists or repository guidance expects structured lifecycle state, treat it as the lifecycle source of truth and read Markdown only for rationale, acceptance criteria, constraints, and scope.
   - Read `prd.md`, `milestones.md`, and optional `architecture.md`.
   - Confirm the target milestone and any carried-forward review notes.
   - Confirm the target milestone has a scope budget or equivalent scope notes. If scope tripwires are exceeded without rationale, stop and recommend returning to `initiative-planning` before activation.
3. Move the initiative to active.
   - Prefer `git mv` when the repository is under git and the folder is tracked.
   - Use the repository's active initiative convention, usually `docs/initiatives/active/<initiative>/`.
   - Prefer structured lifecycle tooling over manual Markdown status edits:
     `node $SKILLS_DIR/initiative-completion/scripts/initiative-lifecycle.mjs activate --repo <repo> --initiative <initiative-path> --milestone <milestone-id>`
   - Ensure `initiative.json` records `state: "active"` and the selected `currentMilestone`.
   - Update Markdown status summaries only when local docs require human-readable mirrors, and keep them consistent with JSON.
4. Create the implementation branch.
   - Use the repo's branch naming convention.
   - Start from the freshest appropriate base, usually fetched `main` / `origin/main`.
   - Prefer an existing branch helper if the repository or another skill provides one.
   - Never push directly to `main`.
5. Produce an implementation packet.
   - Include only what a builder needs for the selected milestone.
   - Include acceptance criteria, non-goals, relevant constraints, scope budget, required validation, known risks, and explicit deferrals.
   - Do not include the full planning conversation.
6. Commit activation bookkeeping.
   - Treat this skill invocation as explicit authorization to create the scoped activation commit.
   - Use `commit` for commit inspection, staging, message quality, and DCO sign-off rules.
   - Commit only activation bookkeeping and branch/initiative setup artifacts. Do not include feature implementation.
   - If activation changes cannot be separated safely from unrelated edits, stop and ask for direction instead of committing.
   - Do not leave successful activation bookkeeping uncommitted.
7. Report activation.
   - Active initiative path
   - Branch name and base
   - Target milestone
   - Activation commit hash and subject, or why no commit was created
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
- Do not manually infer lifecycle truth from Markdown checkboxes when `initiative.json` is present.

## Next Skill

End by recommending the next skill:

- If the implementation packet is ready, recommend `milestone-implementation`.
- After the milestone implementation report is complete, recommend `milestone-conformance-review`.
- If activation revealed planning gaps, recommend returning to `initiative-planning` or `initiative-adversary-review` before coding.
