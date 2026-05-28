---
name: code-review
description: Use when reviewing code changes, PR diffs, reviewer comments, or deciding whether a change is ready to merge.
---

# Code Review Skill

## Purpose

Review changes for correctness, maintainability, scope control, and alignment with project intent.

## Delegation default

When this skill is invoked from a normal user conversation and a multi-agent
spawn tool is available, do not perform the review in the current conversation
context. Spawn a separate review agent instead.

Use this delegation pattern:

1. Spawn one `explorer` agent with `fork_context: true`.
2. Give the agent a self-contained prompt to run this code-review workflow on
   the current repository or requested PR/diff.
3. Explicitly tell the spawned agent it is the delegated review agent and must
   perform the review locally without spawning another review agent.
4. Wait for the spawned agent when the user is waiting for review results.
5. Relay the agent's findings in the current conversation, preserving severity,
   file/line references, testing notes, and final stance.
6. Close the agent after its result is no longer needed.

If the multi-agent tool is unavailable, perform the review in the current
context and note that the delegation fallback was used.

If this skill is already running inside a spawned/delegated review agent,
perform the review locally and do not spawn another agent.

## Required process

Before giving review feedback:

1. If the PR description is incomplete or missing, request the author to provide a detailed description before proceeding.
2. Run the PR prep helper from `/Users/hanna/.codex/skills/pr-description/scripts/pr-prep.mjs` if available. If unavailable, proceed with the review manually and note its absence in the review summary.
3. Review the diff against the intended base branch, preferably the latest fetched remote-tracking ref.
4. Review related repository source-of-truth docs, such as `PRODUCT.md`, `PRD.md`, or repository-local guidance named by `AGENTS.md`.
5. Identify the purpose of the change.
6. Check whether the implementation matches that purpose.
7. Check whether the change introduces unnecessary scope.
8. Run an adversarial pass against changed code and tests.
9. Check tests and validation.
10. Separate blocking issues from suggestions.

## Review priorities

Focus on correctness and safety first; other priorities are secondary.

1. Correctness and safety
2. Scope control
3. Maintainability and tests
4. Readability and style

Stop and request clarification if correctness or scope is unclear before addressing other concerns.

## Feedback categories

Use these labels when useful:

- **Blocking:** Must be fixed before merge.
- **Question:** Needs clarification before deciding.
- **Suggestion:** Improvement, but not required.
- **Nit:** Small style/readability issue.

## Rules

- Do not approve changes that contradict `PRD.md`.
- Do not approve hidden scope expansion.
- Do not request unrelated refactors.
- Do not nitpick style unless it significantly impacts readability or violates established project-wide consistency rules.
- Do not assume tests passed unless evidence is present.
- Do not treat all reviewer comments as equally important.
- If feedback lacks specific examples, clear reasoning, or actionable steps, ask for clarification instead of guessing.
- Prefer small, focused follow-up PRs over expanding the current PR.

## What to check

### Adversarial pass

Do this before concluding that no issues were found.

**Baseline checks:**
- Treat prior implementation summaries, plans, and confidence from the same session as untrusted.
- If the review is happening in the same session that implemented the change, explicitly say so in the testing notes or review summary.

**Input and state testing:**
- For each changed helper, shared function, or workflow boundary, try to construct at least one input or state that breaks the intended invariant.

**Failure path inspection:**
- Skipped or partial writes
- Stale reads or duplicate records
- Conflicting identities, null, or empty values
- Fallback behavior and permission/read-only constraints
- Pagination, truncation, and limits

**Special attention areas:**
- `ON CONFLICT`, `INSERT OR IGNORE`, and fallback chains
- Compatibility aliases, cache reuse, and default values
- Silent no-ops and test fixtures

**Test validity:**
- Review changed test helpers and fixtures as possible sources of false confidence.
- Ask whether an added test could still pass if the production behavior were wrong.

### Correctness

- Does the code do what the PR claims?
- Are edge cases handled?
- Are errors handled intentionally?
- Are async/state transitions safe?
- Are assumptions explicit?

### Scope

- Is the change limited to one concern?
- Are unrelated files modified?
- Is there accidental cleanup mixed in?
- Would any part be better as a follow-up PR?

### Tests

- Are tests added or updated for changed behavior?
- Do tests cover important edge cases?
- Are integration tests needed?
- Were tests actually run?

### Maintainability

- Is the logic understandable?
- Are names clear?
- Is duplication acceptable or harmful?
- Is complexity proportional to the value?

### Documentation

- Does user-facing behavior need docs?
- Does `PRD.md` need an update?
- Does the PR description match the actual change?

## Review output format

Prefer this structure:

```md
## Review summary

Brief overall assessment.

## Blocking

- ...

## Questions

- ...

## Suggestions

- ...

## Nits

- ...

## Testing notes

- ...
```

Omit empty sections.

## When reviewing reviewer comments

Group comments into:

- Correctness issues
- Required changes
- Optional improvements
- Opinions / preferences
- Conflicting or unclear feedback

Then recommend what to implement, what to push back on, and what to clarify.

## Final review stance

End with one of:

- Ready to merge
- Ready after minor changes
- Needs changes
- Needs clarification before review can continue

## Next Skill

End by recommending the next skill:

- Stance `Ready to merge`: recommend `pr-description` if PR prep is still needed, or waiting for merge if the PR is already ready.
- Stance `Ready after minor changes` or `Needs changes`: recommend `milestone-implementation` for initiative-based work or implementation with `testing` otherwise, then rerun `code-review` or `pre-pr-adversary-review`.
- Stance `Needs clarification before review can continue`: ask for the missing decision before further review.
