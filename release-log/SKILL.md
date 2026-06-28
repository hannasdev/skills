---
name: release-log
description: Use when preparing or updating a PR that changes user workflows, maintainer workflows, configuration defaults, output shape or behavior, setup, migrations, or operational expectations and needs a human-readable release-log entry focused on value, impact, audience, action needed, and PR linkage. Skip for strictly internal refactors with no external impact.
---

# Release Log Skill

## Purpose

Capture user-facing value from each relevant PR in a concise, non-technical release log so merged work remains understandable after review context is gone.

## Scope

Use this skill to add or update one human-readable entry in `release-log.md`. Do not use it as a technical changelog, PR description replacement, or milestone status source of truth.

## Required process

Before writing the release log entry:

1. If you have the ability to execute scripts and the file `$SKILLS_DIR/pr-description/scripts/pr-prep.mjs` exists, run it. Otherwise, skip to step 2.
2. Review the PR diff against the intended base branch.
3. Review the best available PR context:
   - finished PR description, when one exists
   - PR description draft
   - PR prep report
   - `pre-pr-adversary-review` findings and PR prep notes
4. Identify concrete user or maintainer value.
5. Identify who is affected and whether any action is required.
6. Add/update one entry in `release-log.md`.
7. If the release-log entry contradicts a specific claim in a source-of-truth doc (for example, a milestone marked complete that is now incomplete), flag it for manual review rather than silently updating.

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
- If another uncommitted entry already covers the same change, merge the information into the existing entry rather than adding a duplicate.

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
