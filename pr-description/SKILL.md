---
name: pr-description
description: Use when opening a pull request, updating a pull request description, or preparing a summary for review. By default, after preparing the description for committed PR-ready work, push the branch and open or update the PR unless the user explicitly asks for description-only output.
---

# PR Description Skill

## Purpose

Write pull request descriptions that help reviewers understand the change quickly and review it effectively. When the user asks for PR prep or invokes this skill after committed PR-ready work, the default outcome is an opened or updated PR, not just a pasted draft, unless the user explicitly asks for description-only output.

This skill is organized into focused sections: **required process → PR title → description template → rules → pre-merge checklist → examples**. Consult only the sections relevant to your current task.

## Required process

Before writing the PR description:

### Phase 1: Setup

1. Confirm `pr-readiness-gate` has already routed this branch to `pr-description`, or run it before continuing. A current clean readiness result may include `pre-pr-adversary-review`, `milestone-conformance-review`, `release-log`, or `testing`; do not rerun those gates only because this skill was invoked.
2. Run the PR prep helper below when available.
3. Fetch the latest remote base branch before reviewing the diff:
   - Determine the base branch from the user request, existing PR metadata, or the remote default branch.
   - Run `git fetch origin <base-branch>` when `origin` is the target remote.
   - Review the branch diff against `origin/<base-branch>`, not a potentially stale local branch.
4. If creating a new work branch as part of PR prep, start it from the fetched base tip. Prefer the bundled branch helper below when available.
5. Inspect `git status --short`.
   - Unless the user explicitly asked for description-only output, refuse PR publishing/prep when relevant uncommitted changes are present.
   - Route back to the appropriate workflow skill to commit them, or ask for explicit commit authorization when they are not covered by a workflow skill.
   - Ignore unrelated uncommitted changes only when they are clearly outside the branch diff and will not affect PR title/body, validation, generated artifacts, release log, or publish commands.
6. Review relevant notes in `PRODUCT.md`.

### Phase 2: Analyze

7. Identify the user-facing or maintainer-facing purpose of the change.
8. Identify test coverage and validation performed.
9. Identify risks, tradeoffs, and follow-up work.
10. Ensure the PR addresses a single, clearly defined feature, bug fix, or logical change.

### Phase 3: Finalize

11. If user-facing or maintainer-facing behavior changed, update `release-log.md` using `release-log`.
12. Unless the user explicitly asked for description-only output, open or update the PR:
   - If a PR already exists for the current branch, update its title/body.
   - If no PR exists, push the current branch and open a draft PR by default.
   - Prefer the `github:yeet` publish flow when full publish work is needed because it already covers GitHub auth checks, branch push, and draft PR creation. Reuse the PR title/body produced by this skill rather than relying on autofill.
   - Use `gh pr create` / `gh pr edit` as a fallback when the GitHub app path is unavailable or cannot infer the repository/head branch cleanly.
   - If the branch belongs to an initiative with `initiative.json`, record the opened PR after the PR number is known:
     `node $SKILLS_DIR/initiative-completion/scripts/initiative-lifecycle.mjs record-pr-opened --repo <repo> --initiative <initiative-path> --milestone <milestone-id> --pr <number>`
   - For a final-milestone PR that should complete the initiative once merged, use `--complete-on-merge` on the same command.
   - Treat the lifecycle transition as scoped commit authorization through lifecycle-transition tooling. Commit and push the resulting lifecycle diff before declaring PR prep complete.
   - If `release-log.md` used a placeholder such as `PR: TBD`, replace it with the opened PR number or URL after the PR exists, commit that small follow-up if needed, push it, and update the PR body if the description mentions the release entry.

## Default publish behavior

Use this default decision table:

- User says "PR description only", "draft a PR body", "do not push", "do not open", or equivalent: return the title/body only.
- User asks to open, publish, prepare PR, create PR, update PR, or invokes this skill after a clean committed branch intended for review: push and open/update the PR.
- User invokes this skill with relevant uncommitted changes and did not ask for description-only output: stop before publishing and route to the workflow skill that should commit those changes.
- User invokes this skill on an existing PR branch: update the existing PR title/body instead of creating a duplicate.

Opening defaults:

- Open a draft PR unless the user explicitly asks for ready-for-review.
- Use the fetched remote default/base branch unless the user names another base.
- Never push directly to `main`/`master`.
- Do not create a duplicate PR when one already exists for the branch.

## Helper script

Use the bundled helper for read-only PR preparation context:

- Script: `$SKILLS_DIR/pr-description/scripts/pr-prep.mjs`
- Behavior: reports branch diff context, changed file groups, current PR metadata when available, likely validation commands, and release-log/product-alignment prompts.

Examples:

```bash
node $SKILLS_DIR/pr-description/scripts/pr-prep.mjs
node $SKILLS_DIR/pr-description/scripts/pr-prep.mjs --base origin/main
node $SKILLS_DIR/pr-description/scripts/pr-prep.mjs --json
```

When using `--base origin/main` or another remote-tracking ref, fetch it first so the prep report reflects the current base commit.
If the helper script is unavailable or fails, proceed manually by inspecting `git diff origin/<base-branch>...HEAD` and gathering the same context by hand.

## Branch helper

Use the bundled branch helper when starting a new PR branch:

- Script: `$SKILLS_DIR/pr-description/scripts/branch-from-latest.mjs`
- Behavior: requires a clean working tree, detects or accepts the base branch, fetches the remote base, refuses existing local or remote branch names, and creates the new branch from the fetched remote base tip.
- Non-goals: it does not stash, rebase existing work, force-push, create commits, or open PRs.

Before choosing a branch name, check the repository's local contribution guidance for branch naming conventions, especially `AGENTS.md` and `.github/instructions/contribution-workflow.instructions.md` when present. Repository-local conventions override generic assistant defaults such as `codex/`.

Examples:

```bash
node $SKILLS_DIR/pr-description/scripts/branch-from-latest.mjs docs/update-guide
node $SKILLS_DIR/pr-description/scripts/branch-from-latest.mjs feat/new-workflow --base main
```

If the branch helper is unavailable or fails, fetch the base branch manually and create the new branch from the fetched base tip with standard git commands.

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

## Examples Reference

For reusable summary, testing, and complete PR body examples, read `references/pr-body-examples.md` only when the default template is not enough.

## Final response after opening PR

After opening or updating a PR, summarize:

- PR title
- PR URL
- Main change
- Testing status
- Any known risks

If the user explicitly requested description-only output, say that no PR was opened and include the title/body.

## Next Skill

End by recommending the next skill:

- If user/maintainer-facing behavior changed and no release entry exists, recommend `release-log` before final PR update.
- If readiness has not been checked yet, recommend `pr-readiness-gate` before opening, updating, or marking the PR ready.
- After the PR is open, recommend waiting for review feedback, then using `copilot-feedback-gate` when feedback is functionality-heavy or systemic, otherwise `review-comments`.
- After the user merges the PR, recommend `post-merge-cleanup`, then `initiative-completion` for initiative bookkeeping.
