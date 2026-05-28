---
name: release-log
description: Use when preparing a PR that changes user or maintainer behavior and you want a human-readable release entry focused on value, impact, and action.
---

# Release Log Skill

## Purpose

Capture user-facing value from each relevant PR in a concise, non-technical release log so merged work remains understandable after review context is gone.

## When to use

Use this skill during PR creation or PR updates when the change affects:
- user workflows
- maintainer workflows
- configuration defaults
- output shape or behavior
- setup, migration, or operational expectations

Skip for strictly internal refactors with no external impact.

## Required process

Before writing the release log entry:

1. Run the PR prep helper from `/Users/hanna/.codex/skills/pr-description/scripts/pr-prep.mjs` when available.
2. Review the PR diff against the intended base branch.
3. Review the best available PR context:
   - finished PR description, when one exists
   - PR description draft
   - PR prep report
   - `pre-pr-adversary-review` findings and PR prep notes
4. Identify concrete user or maintainer value.
5. Identify who is affected and whether any action is required.
6. Add/update one entry in `release-log.md`.
7. If the change alters product status, committed decisions, roadmap claims, milestone status, integration status, user workflow, or maintainer workflow, check whether the repository's product and decision source-of-truth docs also need alignment. Do not update these mechanically. Update only when their status or claims would otherwise drift from the release-log entry.

## Entry format

Use this structure:

```markdown
### YYYY-MM-DD — Short title

- What changed: <plain-language change summary>
- Why it matters: <value/outcome for users or maintainers>
- Who is affected: <audience>
- Action needed: <explicit action or `None`>
- PR: <link or #number>
```

Rules:
- Place new entries in the file's current open release-log section. If there is no `## Unreleased` or equivalent staging heading, insert the new entry after the introductory text and before the first existing dated entry.
- Keep dated entries newest first.
- Use plain language; avoid internal implementation detail unless it changes behavior.
- Keep bullets outcome-focused.
- If no action is required, write `Action needed: None`.
- Do not duplicate technical changelog wording.

## Quality bar

Good:
- Explains the benefit, not only the code movement.
- Makes impact clear in under 5 bullets.
- Mentions required user action only when relevant.

Bad:
- "Refactored module paths and updated exports."
- Vague statements with no value framing.

## Final response after updating release log

After updating `release-log.md`, summarize:
- the new release-log entry title/date
- intended audience
- any required user action (or `None`)

## Next Skill

End by recommending the next skill:

- If the release entry was added during PR prep, recommend `pr-description` to update the PR body.
- If the release entry changes product or milestone claims, recommend `milestone-conformance-review` before PR prep.
- If the release entry came from review feedback, recommend `review-comments` after validation.
