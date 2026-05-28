---
name: initiative-completion
description: Verify initiative lifecycle state after a PR is merged. Use after post-merge-cleanup or after confirming a milestone PR merged to check that milestone bookkeeping was included before merge, keep partially complete initiatives active while identifying the next milestone, move only fully completed initiatives to done or the local equivalent when that move was part of the merged PR or explicitly requested, and report any missing bookkeeping without creating routine post-merge documentation PRs.
---

# Initiative Completion

## Purpose

Verify the initiative lifecycle after a PR merge. Milestone acceptance
bookkeeping should normally be part of the milestone implementation PR before
that PR is merged, not a separate post-merge documentation PR.

Use `post-merge-cleanup` first for local git cleanup. Use this skill to confirm
that the merged PR left durable initiative state coherent and to decide the next
workflow step.

If milestone bookkeeping was omitted from the merged PR, report the gap and
recommend folding it into the next implementation/docs PR unless the user
explicitly requests a standalone bookkeeping fix.

## Required Process

1. Confirm merge state.
   - Verify the PR is merged, or use the user's explicit confirmation.
   - Identify the merged branch, PR, initiative, and milestone.
   - Confirm local cleanup has run or note that it remains pending.
2. Read local guidance.
   - Read `AGENTS.md`. If not present, check for `CONTRIBUTING.md` or `.github/copilot-instructions.md` as fallbacks.
   - Read product and initiative docs named by local guidance.
   - Inspect existing done/active initiative conventions.
3. Verify milestone bookkeeping.
   - When available, run the read-only lifecycle checker first and use its output as evidence:
     `node /Users/hanna/.codex/skills/initiative-completion/scripts/check-initiative-lifecycle.mjs --repo <repo> --initiative <initiative-path> --milestone <milestone-id> --pr <number> --strict`
   - Confirm the merged PR already marked the milestone according to local convention.
   - Confirm the merged PR already recorded PR link, merge date, validation evidence, or completion notes if local convention supports those fields.
   - Do not create a new routine documentation PR solely to mark the just-merged milestone complete.
   - If bookkeeping is missing, report it as a process gap and recommend adding it before merge in future milestone PRs, or folding the correction into the next planned PR.
   - Only edit initiative docs after merge when the user explicitly asks for a standalone bookkeeping fix or when the initiative is fully complete and the repository convention requires a completion move now.
   - Do not mark unmerged or partially reviewed work as complete.
   - If the checker reports final-milestone lifecycle drift, call it out as a pre-merge gate miss and recommend adding this check to the next PR-prep/conformance workflow.
4. Decide initiative state.
   - If more milestones remain, leave the initiative in `docs/initiatives/active/<initiative>/` or the local active equivalent and identify the next milestone.
   - Do not move a partially complete initiative back to backlog just because the next milestone is not being implemented in this same turn. Backlog movement requires an explicit human/product decision to pause or defer the whole initiative.
   - If the initiative already moved from backlog to active, keep that active location stable across milestone completion PRs until all milestones complete or the user explicitly pauses the initiative.
   - If all milestones are complete, verify the merged PR moved the initiative to `docs/initiatives/done/<initiative>/` or the local equivalent; if it did not, ask before creating a standalone completion PR unless the user explicitly requested completion bookkeeping now.
   - Update product/backlog status only when the repository's source-of-truth docs require it.
5. Preserve auditability.
   - Prefer `git mv` for tracked folder moves.
   - Keep completion changes scoped to bookkeeping.
   - Do not start the next milestone implementation in the same step.
   - Avoid post-merge docs-only churn for every milestone; acceptance docs belong in the milestone PR before merge.
6. Report completion.
   - Use `references/completion-report-template.md`.
   - If `references/completion-report-template.md` is not found, produce a freeform completion summary covering: initiative, milestone, PR link, merge date, and next recommended skill.
   - Include the next recommended skill.

## Guardrails

- Do not consider a PR merged unless confirmed by GitHub state or explicit user instruction.
- Do not move an active initiative to done while incomplete milestones remain.
- Do not move an active initiative back to backlog while incomplete milestones remain unless the user explicitly asks to pause/defer the initiative as a whole.
- Do not create churny bookkeeping PRs that only move an initiative out of active after one milestone and then require the next activation to move it back.
- Do not create routine post-merge documentation PRs just to mark an individual milestone accepted; require that bookkeeping before merge instead.
- Do not update product status mechanically if local docs say another file is source of truth.
- Do not mix post-merge bookkeeping with new implementation work.
- Do not delete branches; that belongs to `post-merge-cleanup`.

## Next Skill

End by recommending the next skill:

- If another milestone remains, recommend the next implementation/prep workflow for that milestone. Use `initiative-activation` only if the repository still needs a fresh implementation branch or packet; do not use it to move the initiative folder back from backlog to active when it should have stayed active.
- If the initiative is complete, recommend `initiative-planning` when the user wants to start another idea.
- If cleanup has not run, recommend `post-merge-cleanup` before further branch work.
- If completion state is ambiguous, ask for the human decision before moving docs.
