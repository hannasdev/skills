---
name: initiative-completion
description: Complete post-merge initiative bookkeeping after a PR is merged. Use after post-merge-cleanup or after confirming a milestone PR merged to update docs/initiatives/active/<initiative>/milestones.md, move a fully completed initiative to done/ or the local equivalent, update product/backlog status when required, and decide whether to activate the next milestone.
---

# Initiative Completion

## Purpose

Finalize the initiative lifecycle after a PR merge. This skill updates durable initiative state and decides the next workflow step.

Use `post-merge-cleanup` first for local git cleanup. Use this skill for initiative/milestone bookkeeping.

## Required Process

1. Confirm merge state.
   - Verify the PR is merged, or use the user's explicit confirmation.
   - Identify the merged branch, PR, initiative, and milestone.
   - Confirm local cleanup has run or note that it remains pending.
2. Read local guidance.
   - Read `AGENTS.md`. If not present, check for `CONTRIBUTING.md` or `.github/copilot-instructions.md` as fallbacks.
   - Read product and initiative docs named by local guidance.
   - Inspect existing done/active initiative conventions.
3. Update milestone bookkeeping.
   - Mark the merged milestone according to local convention.
   - Record PR link, merge date, validation evidence, or completion notes only if local convention supports it.
   - Do not mark unmerged or partially reviewed work as complete.
4. Decide initiative state.
   - If more milestones remain, leave initiative active and identify the next milestone.
   - If all milestones are complete, move the initiative to `docs/initiatives/done/<initiative>/` or the local equivalent.
   - Update product/backlog status only when the repository's source-of-truth docs require it.
5. Preserve auditability.
   - Prefer `git mv` for tracked folder moves.
   - Keep completion changes scoped to bookkeeping.
   - Do not start the next milestone implementation in the same step.
6. Report completion.
   - Use `references/completion-report-template.md`.
   - If `references/completion-report-template.md` is not found, produce a freeform completion summary covering: initiative, milestone, PR link, merge date, and next recommended skill.
   - Include the next recommended skill.

## Guardrails

- Do not consider a PR merged unless confirmed by GitHub state or explicit user instruction.
- Do not move an active initiative to done while incomplete milestones remain.
- Do not update product status mechanically if local docs say another file is source of truth.
- Do not mix post-merge bookkeeping with new implementation work.
- Do not delete branches; that belongs to `post-merge-cleanup`.

## Next Skill

End by recommending the next skill:

- If another milestone remains, recommend `initiative-activation` for the next milestone.
- If the initiative is complete, recommend `initiative-planning` when the user wants to start another idea.
- If cleanup has not run, recommend `post-merge-cleanup` before further branch work.
- If completion state is ambiguous, ask for the human decision before moving docs.
