---
name: pr-description
description: Use when opening a pull request, updating a pull request description, or preparing a summary for review.
---

# PR Description Skill

## Purpose

Write pull request descriptions that help reviewers understand the change quickly and review it effectively.

This skill is organized into focused sections: **required process → PR title → description template → rules → pre-merge checklist → examples**. Consult only the sections relevant to your current task.

## Required process

Before writing the PR description:

1. Run `pre-pr-adversary-review` first and address or explicitly carry forward its blocking/should-fix findings.
2. Run the PR prep helper below when available.
3. Fetch the latest remote base branch before reviewing the diff:
   - Determine the base branch from the user request, existing PR metadata, or the remote default branch.
   - Run `git fetch origin <base-branch>` when `origin` is the target remote.
   - Review the branch diff against `origin/<base-branch>`, not a potentially stale local branch.
4. If creating a new work branch as part of PR prep, start it from the fetched base tip. Prefer the bundled branch helper below when available.
5. Review relevant notes in `PRODUCT.md`.
6. Identify the user-facing or maintainer-facing purpose of the change.
7. Identify test coverage and validation performed.
8. Identify risks, tradeoffs, and follow-up work.
9. Ensure the PR addresses a single, clearly defined feature, bug fix, or logical change.
10. If user-facing or maintainer-facing behavior changed, update `release-log.md` using `skills/release-log/SKILL.md`.

## Helper script

Use the bundled helper for read-only PR preparation context:

- Script: `/Users/hanna/.codex/skills/pr-description/scripts/pr-prep.mjs`
- Behavior: reports branch diff context, changed file groups, current PR metadata when available, likely validation commands, and release-log/product-alignment prompts.

Examples:

```bash
node /Users/hanna/.codex/skills/pr-description/scripts/pr-prep.mjs
node /Users/hanna/.codex/skills/pr-description/scripts/pr-prep.mjs --base origin/main
node /Users/hanna/.codex/skills/pr-description/scripts/pr-prep.mjs --json
```

When using `--base origin/main` or another remote-tracking ref, fetch it first so the prep report reflects the current base commit.

## Branch helper

Use the bundled branch helper when starting a new PR branch:

- Script: `/Users/hanna/.codex/skills/pr-description/scripts/branch-from-latest.mjs`
- Behavior: requires a clean working tree, detects or accepts the base branch, fetches the remote base, refuses existing local or remote branch names, and creates the new branch from the fetched remote base tip.
- Non-goals: it does not stash, rebase existing work, force-push, create commits, or open PRs.

Before choosing a branch name, check the repository's local contribution guidance for branch naming conventions, especially `AGENTS.md` and `.github/instructions/contribution-workflow.instructions.md` when present. Repository-local conventions override generic assistant defaults such as `codex/`.

Examples:

```bash
node /Users/hanna/.codex/skills/pr-description/scripts/branch-from-latest.mjs docs/update-guide
node /Users/hanna/.codex/skills/pr-description/scripts/branch-from-latest.mjs feat/new-workflow --base main
```

## PR title

Use a clear title matching the primary change.

Prefer Conventional Commit style:

```text
feat: add pull request description workflow
fix: prevent runs.json from being committed
docs: clarify maintainer release process
```

## PR description template

Use this structure:

```markdown

## Summary

- Briefly describe what changed.
- Keep this concrete and reviewer-oriented.

## Motivation

Explain why the change is needed.

## Implementation

Describe the key technical decisions.

## Testing

List validation performed.

Examples:

- `npm test`
- `npm run lint`
- Manual test of `<specific workflow>`
- Not run: `<reason>`

## Risks and tradeoffs

Call out anything reviewers should pay attention to.

## Follow-up

List any known follow-up work, or write `None`.
```

## Rules

- Do not write vague PR descriptions.
- Do not claim tests were run unless they actually were.
- Do not hide uncertainty. If something was not validated, say so.
- Do not expand the PR scope in the description to make it sound larger than it is.
- Mention any intentional omissions.
- Mention any behavior changes explicitly.
- Mention any migration, release, or compatibility impact if relevant.
- Update the PR description if the implementation scope changes after review.

## Pre-merge checklist

Before marking a PR ready, verify these common failure points:

1. Contract text and sample output match exactly. If a section is named one way in docs or generated output, examples should use the same label verbatim.
2. Tests cover behavior, not only headings or presence checks. Assert representative bullets, examples, and failure paths where relevant.
3. Validation is based on explicit user intent, not just parsed values. If flags or inputs can be malformed, fail fast with a clear error.
4. Detailed roadmap state lives in `PRODUCT.md`; keep `README.md` high-level unless a top-level status snapshot truly needs updating.
5. Keep the PR scoped to one concern. If review uncovers a second feature or workflow, split it into a separate PR.

Use this checklist to tighten the implementation before review and to keep the PR description honest about scope, validation, and follow-up.

## Good summary examples

Good:
```markdown
## Summary

- Adds a reusable PR description skill.
- Documents the required structure for summary, motivation, implementation, testing, risks, and follow-up.
- Aligns PR descriptions with the repo's existing PR-only workflow.
```

Bad:
```markdown
## Summary

Updated some docs and improved workflow.
```

## Testing section rules

If tests were run:
```markdown
## Testing

- `npm test`
- `npm run lint`
```

If tests were not run:
```markdown
## Testing

- Not run: documentation-only change.
```

If validation was manual:
```markdown
## Testing

- Manually reviewed generated PR description against the branch diff.
```

## Reusable PR body examples

For docs-heavy changes:

```markdown
## Summary

- Clarifies contributor-facing documentation for the targeted workflow.
- Keeps the change scoped to docs and alignment updates only.

## Motivation

The current docs leave room for inconsistent reviewer expectations and repeated follow-up comments.

## Implementation

- Updated the relevant skill and supporting docs.
- Kept behavior changes out of scope.

## Testing

- Not run: documentation-only change.

## Risks and tradeoffs

- Low risk: the main risk is wording drift if related docs are updated separately later.

## Follow-up

- None.
```

For code-heavy changes:

```markdown
## Summary

- Tightens validation for the targeted workflow.
- Adds or updates tests for the affected edge cases.

## Motivation

The previous behavior accepted ambiguous or malformed input, which made failures harder to diagnose during review.

## Implementation

- Added explicit validation for the affected input path.
- Updated tests to cover both successful and failing cases.

## Testing

- `node --test src/test/unit/example.test.mjs`

## Risks and tradeoffs

- Validation is stricter than before, so previously tolerated malformed input now fails fast.

## Follow-up

- None.
```

## Final response after opening PR

After opening or updating a PR, summarize:

- PR title
- PR URL
- Main change
- Testing status
- Any known risks

## Next Skill

End by recommending the next skill:

- If user/maintainer-facing behavior changed and no release entry exists, recommend `release-log` before final PR update.
- After the PR is open, recommend waiting for review feedback, then using `copilot-feedback-gate` when feedback is functionality-heavy or systemic, otherwise `review-comments`.
- After the user merges the PR, recommend `post-merge-cleanup`, then `initiative-completion` for initiative bookkeeping.
