---
name: milestone-conformance-review
description: Review whether an implementation branch satisfies an initiative milestone. Delegates to conformance-auditor when available. Use after milestone implementation and before PR prep, or after substantial feedback-driven changes, to compare the branch diff against main with active initiative docs, milestones.md, optional architecture.md, the selected milestone gate, acceptance criteria, non-goals, and test evidence.
---

# Milestone Conformance Review

## Purpose

Audit whether the branch built the milestone it promised to build.

This is a neutral scope review, not a general code review. It asks:

- Did the branch satisfy the target milestone acceptance criteria?
- Did it respect non-goals and architectural constraints?
- Did it update the durable artifacts that the milestone required?
- Is there evidence from tests, docs, generated artifacts, or manual validation?

Use `pre-pr-adversary-review` or `code-review` separately for bugs, maintainability, and hostile edge-case review.

## Delegation Default

Invoking this skill is an explicit request to use `conformance-auditor` when
multi-agent spawning is available. Do not run this review locally merely
because the user did not separately say "use a subagent."

When a multi-agent spawn tool is available, spawn a cold delegated
`conformance-auditor` agent. Give it:

- initiative PRD
- milestones file
- optional architecture notes
- target milestone
- branch diff against the intended base
- test results, if available

Do not give it the implementation conversation or builder justifications unless they are already present in durable artifacts.

## Required Process

1. Establish the branch boundary.
   - Identify branch name.
   - Identify base branch, usually `main` or `origin/main`.
   - Record merge-base SHA and head SHA when available.
   - Review the branch diff against the selected base, not only unstaged local changes.
2. Load initiative artifacts.
   - Read `initiative.json` first when present; treat it as the lifecycle source of truth.
   - Read active initiative `prd.md`.
   - Read `milestones.md`.
   - Read `architecture.md` when present.
   - Read repository guidance if it defines initiative or milestone conventions.
   - Use Markdown for rationale, acceptance criteria, non-goals, and scope details; do not infer lifecycle state from Markdown checkboxes when JSON exists.
3. Identify the target milestone.
   - If multiple milestones appear touched, review the named target milestone first and flag possible scope creep.
   - If no milestone is named and it cannot be inferred safely, stop and ask.
4. Map criteria to evidence.
   - For each acceptance criterion, cite diff evidence, tests, docs, generated artifacts, or manual validation.
   - Mark missing or weak evidence clearly.
5. Check non-goals and scope.
   - Flag under-implementation.
   - Flag scope creep, unrelated cleanup, or premature future-milestone work.
   - Compare the branch against the milestone scope budget when present. Call out exceeded tripwires, especially more acceptance criteria, more subsystem boundaries, larger non-generated diff, or broader validation needs than planned.
6. Check required bookkeeping.
   - Structured lifecycle status in `initiative.json`
   - Initiative docs alignment
   - Release-log or user/maintainer docs if the milestone requires them
   - Architecture notes if the implementation changes durable contracts
   - If `initiative.json` exists, use lifecycle tooling before manual doc inspection:
     `node /Users/hanna/.codex/skills/initiative-completion/scripts/initiative-lifecycle.mjs check --repo <repo> --initiative <initiative-path> --milestone <milestone-id> --strict`
   - If the target milestone appears to be the final milestone, verify lifecycle bookkeeping before returning `Pass`:
     - milestone status and evidence reflect acceptance/completion or `complete_on_merge`
     - PRD and product/source-of-truth status do not contradict `initiative.json`
     - the initiative remains at its stable path unless local policy explicitly requires an archive move
     - release-log or completion notes contain the PR link/date when local convention supports it
   - When available, run the read-only lifecycle checker to make this deterministic:
     `node /Users/hanna/.codex/skills/initiative-completion/scripts/check-initiative-lifecycle.mjs --repo <repo> --initiative <initiative-path> --milestone <milestone-id> --strict`
   - Treat a strict lifecycle-check failure on a final milestone as `Partial` or `Needs decision`, not `Pass`, unless the user explicitly records a deferral or `complete_on_merge` state.
7. Record conformance lifecycle state.
   - If the verdict is `Pass` and the initiative has `initiative.json`, run the lifecycle transition before handing off to PR readiness:
     `node /Users/hanna/.codex/skills/initiative-completion/scripts/initiative-lifecycle.mjs record-conformance --repo <repo> --initiative <initiative-path> --milestone <milestone-id>`
   - Treat the lifecycle transition as scoped commit authorization through lifecycle-transition tooling. Commit only the resulting lifecycle/bookkeeping diff with `commit` before PR readiness.
   - If unrelated local changes prevent a clean lifecycle commit, report the blocker instead of leaving the transition uncommitted.
   - If the verdict is `Partial`, `Fail`, or `Needs decision`, do not record conformance.
8. Produce a verdict.
   - **Pass:** milestone criteria are satisfied with adequate evidence.
   - **Partial:** useful progress, but criteria/evidence/bookkeeping remain incomplete.
   - **Fail:** branch does not satisfy the milestone or materially violates scope/constraints.
   - **Needs decision:** human/product/architecture ambiguity blocks a fair verdict.

## Non-Goals

- Do not approve general code quality.
- Do not perform a full adversarial bug hunt.
- Do not accept private implementation rationale as evidence.
- Do not require work beyond the target milestone unless the branch already expanded into that scope.

## Output Format

Use `references/conformance-report-template.md`.
If `references/conformance-report-template.md` is not found, use this minimal structure: Verdict, Criteria-Evidence Table, Scope Budget Check, Scope Findings, Bookkeeping Findings, Next Skill Recommendation.

Keep the verdict crisp. Findings should name the acceptance criterion, the evidence, and the missing piece.

## Rerun Rule

A conformance verdict is valid only for the reviewed base/head pair. Rerun the relevant parts of this review if `main` gains commits that touch files also modified in the branch, if the branch adds or removes non-trivial changes after the last review, or if feedback-driven fixes alter scope.

## Next Skill

End by recommending the next skill:

- Verdict `Pass`: recommend `pr-readiness-gate`.
- Verdict `Partial` or `Fail`: recommend `milestone-implementation`, with `testing` for missing proof and `initiative-activation` only if the implementation packet itself needs revision.
- Verdict `Needs decision`: ask for the decision, then rerun `milestone-conformance-review`.
