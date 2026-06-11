---
name: pr-readiness-gate
description: Use immediately before opening, updating, or marking a pull request ready. Orchestrates the final pre-PR checks so initiative scope, adversarial review, release-log hygiene, and validation evidence are in place before reviewers see the branch. If git status or branch diff is unavailable, issue verdict `Needs human decision` with finding "Cannot inspect branch state -- provide git diff output or describe the changes made before proceeding."
---

# PR Readiness Gate

## Purpose

Decide whether a branch is actually ready for PR publication without creating predictable review churn.

This skill is an orchestrator. It does not replace:

- `milestone-conformance-review`
- `pre-pr-adversary-review`
- `testing`
- `release-log`
- `pr-description`

It exists to route through those skills in the right order and to block PR prep when obvious readiness gaps remain.

## Use When

Use this skill when the user asks to:

- prepare a PR
- open or update a PR
- mark a PR ready for review
- sanity-check whether the current branch is ready for reviewers

Use it after implementation and before `pr-description`.

## Required Process

1. Establish the publication context.
   - Identify the base branch.
   - If the base branch cannot be determined from git context or user input, issue verdict `Needs human decision` with finding: "Base branch is ambiguous -- specify the intended merge target before proceeding."
   - Identify whether the branch is initiative-based.
   - Identify whether user-facing or maintainer-facing behavior changed.
   - Identify whether a PR already exists for the branch.
2. Inspect current branch state.
   - Review `git status --short`.
   - Review the branch diff against the intended base.
   - If git status or branch diff is unavailable, issue verdict `Needs human decision` with finding: "Cannot inspect branch state -- provide git diff output or describe the changes made before proceeding."
   - Confirm the branch addresses a single user-visible or system-visible outcome. If two independent problems are fixed or two independent features are added, the branch is out of scope.
3. Decide which prerequisite gates are required.
   - Evaluate conditions in order. If any higher-priority condition is true, apply its gate and do not apply lower-priority exemptions to that gate. (1) Initiative-based -> milestone-conformance-review required. (2) Any behavior, contract, migration, CI, operational, or non-trivial code change -> adversarial review required. (3) Only if neither (1) nor (2) applies may the docs-only/mechanical exemption be considered.
   - If the work is initiative-based and milestone scope, acceptance criteria, or initiative bookkeeping matter, run `milestone-conformance-review` first unless a current clean result already exists for the same base/head pair. A result is current if it was produced after the most recent commit on the branch and no files have changed since it was run. If new commits exist since the last result, the gate must be re-run.
   - For behavior changes, contract changes, migrations, boundary-sensitive work, CI changes, operational changes, or non-trivial code changes, run `pre-pr-adversary-review` unless a current clean result already exists for the same base/head pair.
   - For docs-only changes (no code execution path altered) or purely mechanical changes defined as automated find-and-replace with no logic added or removed, you may skip adversarial review. For any other change type, adversarial review is required.
4. Check release-log readiness.
   - If user-facing or maintainer-facing behavior changed, ensure `release-log.md` is updated or route to `release-log`.
   - A placeholder such as `PR: TBD` is acceptable only before the first PR is opened for the branch, and only when the release entry is otherwise complete.
   - If a PR already exists and the release entry still has `TBD` or equivalent, or if required release-log content is incomplete, the branch is not PR-ready.
5. Check validation evidence.
   - Confirm there are concrete commands and outcomes that can be cited in the PR.
   - For behavior changes, expect focused evidence for at least one meaningful edge case or failure path, not only the main happy path.
   - If needed proof is missing, route through `testing` before PR prep.
6. Check durable artifact hygiene.
   - Product or initiative docs should not use branch-specific or review-state wording that will go stale after merge.
   - Generated docs and tool descriptions should match the implementation when applicable.
   - Open blockers from prior reviews or gates must be fixed or explicitly carried forward as risks.
7. Produce a readiness verdict.

## Readiness Checklist

A branch is ready for `pr-description` only when all of these are true:

- The branch is scoped to one logical change.
- Required conformance review has passed or is not applicable.
- Required adversarial review has passed or is not applicable.
- Release-log coverage is correct for the branch stage.
- Validation evidence is specific and honest.
- Durable docs and initiative state are not obviously stale or branch-specific.
- No known blocking or should-fix gate findings remain unresolved.

## Verdicts

Use one of these verdicts:

- If more than one blocking gate is unmet, issue verdict `Needs focused fixes before PR` and list all unmet gates under Findings in priority order: (1) conformance, (2) adversarial review, (3) release-log, (4) validation. The Next Step must list all required gates in sequence.

- `Ready for pr-description`
- `Run milestone-conformance-review first`
- `Run pre-pr-adversary-review first`
- `Update release-log first`
- `Add validation first`
- `Needs focused fixes before PR`
- `Needs human decision`

## Non-Goals

- Do not perform a second full code review.
- Do not open, update, or publish the PR directly.
- Do not replace detailed testing or milestone review.
- Do not resolve review threads.

## Output Format

Return this structure:

```md
## PR Readiness Gate

Scope: <branch and base>
PR state: <no PR yet | existing PR #...>
Verdict: <one verdict from the allowed list>

## Required Gates
- Conformance: <needed/not needed/result>
- Adversarial review: <needed/not needed/result>
- Release log: <needed/not needed/result>
- Validation: <result>

## Findings
- <readiness gap or confirmation>

## Next Step
- <exact next skill to run>
- <why>
```

Keep the output short and decision-oriented.

## Next Skill

End by recommending the next skill:

- Verdict `Ready for pr-description`: recommend `pr-description`.
- Verdict `Run milestone-conformance-review first`: recommend `milestone-conformance-review`.
- Verdict `Run pre-pr-adversary-review first`: recommend `pre-pr-adversary-review`.
- Verdict `Update release-log first`: recommend `release-log`, then rerun `pr-readiness-gate`.
- Verdict `Add validation first`: recommend `testing`, then rerun `pr-readiness-gate`.
- Verdict `Needs focused fixes before PR`: recommend `milestone-implementation` for initiative work or implementation plus `testing` otherwise, then rerun `pr-readiness-gate`.
- Verdict `Needs human decision`: ask for the decision, then rerun `pr-readiness-gate`.
