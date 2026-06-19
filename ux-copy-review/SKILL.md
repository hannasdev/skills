---
name: ux-copy-review
description: Review actual user-facing product copy, docs, UI text, onboarding flows, release notes, PR descriptions, README sections, CLI/help output, errors, empty states, screenshots, and product wording for first-time user clarity, hidden assumptions, information structure, tone, concision, actionability, and documentation quality. Use before shipping or publishing text-heavy UX, docs, or workflow changes; after implementation when product surfaces exist; after initiative planning to identify intended user-facing surfaces and UX-copy risks, not just to edit PRD prose; and when copy feels verbose, unclear, overly internal, or unfriendly to new users.
---

# UX Copy Review

## Purpose

Review text and flows from a first-time user perspective. Find places where the
copy assumes context the user does not have, hides important decisions, buries
the next action, over-explains, under-explains, or uses structure that makes the
experience harder than it needs to be.

This is a review skill by default. Do not rewrite large sections unless the user
asks for rewriting or a focused rewrite is the clearest way to explain the fix.

## Required Process

1. Identify the audience and moment.
   - Who is reading this: new user, returning user, maintainer, reviewer,
     operator, buyer, admin, developer, or end customer?
   - What are they trying to do right now?
   - What do they already know, and what does the text wrongly assume?
2. Select the right review artifact.
   - Prefer the actual user-facing surface over planning text: implemented UI,
     screenshots, rendered pages, CLI output, help text, docs, onboarding flows,
     release notes, errors, empty states, configuration prompts, or API/tool
     messages.
   - Use PRDs, milestones, and planning docs primarily to understand intended
     users, jobs-to-be-done, acceptance criteria, and promised workflow impact.
   - Do not treat the PRD's wording as the main UX-copy target when the product
     surface exists or can be inspected from the branch.
   - If no product copy exists yet, review the planning docs for UX assumptions
     and produce a **Future Surface Checklist** naming the copy/UI/doc surfaces
     that must be reviewed after implementation.
   - If the artifact is ambiguous, first look for likely user-facing files and
     generated outputs before falling back to the planning document itself.
3. Inspect the artifact in context.
   - For UI copy, review nearby labels, headings, empty states, errors,
     confirmation text, primary actions, and navigation.
   - For docs, review heading structure, task order, prerequisites, examples,
     callouts, and whether the first useful action appears early enough.
   - For planning docs, review whether user-facing value, workflow assumptions,
     onboarding impact, and acceptance criteria are visible and testable.
   - For release notes or PR descriptions, review whether value, impact, action
     needed, and risks are clear to the intended reader.
4. Run the review lenses below.
5. Classify findings by impact.
   - **Blocking:** likely to mislead users, cause failed setup/action, hide a
     required decision, or ship a confusing first-run experience.
   - **Should fix:** likely to create support burden, review friction, or user
     hesitation.
   - **Consider:** improves polish, tone, or scanability without blocking.
6. Give concrete fixes.
   - Prefer small edits, reordered sections, clearer headings, explicit
     prerequisites, better labels, and sharper examples.
   - Provide short replacement copy for high-impact issues.
   - Avoid broad style rewrites that do not change user understanding.

## Review Lenses

### First-Time User Clarity

- Does the text explain what the thing is before asking the user to act?
- Are prerequisites, permissions, setup state, account state, or environment
  assumptions explicit?
- Can the user tell what happens next after clicking, running, accepting,
  skipping, saving, merging, or publishing?
- Are irreversible, destructive, paid, or privacy-relevant actions clear before
  the user commits?

### Information Architecture

- Is the most common user goal visible early?
- Are headings task-oriented instead of abstract when the reader is trying to
  do something?
- Are steps in the order a user needs them?
- Are advanced caveats separated from the happy path?
- Does the text support scanning with meaningful headings, bullets, examples,
  and summaries?

### Assumptions And Missing Context

- Does the copy rely on internal jargon, implementation detail, project history,
  or implied product decisions?
- Are terms introduced before they are used?
- Are examples representative of real usage?
- Are edge cases, limitations, and unsupported states named where a user would
  otherwise make a wrong assumption?

### Concision And Density

- Is the text too verbose for the user's moment?
- Is it too terse to be actionable?
- Can repeated concepts be collapsed without losing clarity?
- Are warnings, notes, and caveats overused?
- Does every sentence help the user decide, act, or understand?

### Tone And Trust

- Is the tone calm, direct, and respectful?
- Does it avoid blame, scolding, exaggerated marketing claims, and false
  certainty?
- Does it acknowledge uncertainty or limitations where that affects user trust?
- Are error messages specific about what happened and how to recover?

### UX Fit

- For UI labels and buttons, is the action named from the user's point of view?
- Are primary and secondary actions distinct?
- Do empty states teach the next useful action?
- Do confirmations make the consequence clear?
- Does help text explain why a field matters, not merely restate the label?

## Output Format

Use this structure:

```md
## UX Copy Review

Audience/moment: <who this is for and what they are trying to do>
Artifact reviewed: <files, UI area, doc section, or text snippet>
Source of intent: <PRD/milestone/user request/product doc, if used>

## Blocking
- <issue, user impact, specific location, suggested fix>

## Should Fix
- <issue, user impact, specific location, suggested fix>

## Consider
- <polish or tradeoff>

## Suggested Copy
- Before: <short excerpt or description>
- After: <replacement>

## Checked / Looks Good
- <important areas that already work well>

## Future Surface Checklist
- <only include when no actual product surface exists yet>

## Next Skill
- <recommended next skill or workflow>
```

Omit empty sections. Keep findings concrete and tied to the user outcome, not
personal preference.

## Guardrails

- Do not optimize for cleverness over clarity.
- Do not turn task documentation into marketing copy.
- Do not remove necessary caveats just to make text shorter.
- Do not rewrite established product terminology unless it harms comprehension
  or contradicts nearby source-of-truth docs.
- Do not invent product promises. If a missing promise matters, flag it as a
  decision or documentation gap.
- Do not judge copy in isolation when surrounding UI, docs, or workflow context
  changes the meaning.
- Do not spend the whole review editing PRD prose when the user's goal is to
  review the product experience. Use planning docs to locate product surfaces
  and user assumptions, then review what users will actually see.

## Next Skill

End by recommending the next skill:

- For planning docs with no implemented user-facing surface yet, recommend
  carrying the Future Surface Checklist into `milestone-implementation`, then
  rerun `ux-copy-review` after implementation.
- For planning docs with unclear user value, assumptions, or acceptance
  criteria, recommend `initiative-planning`, then rerun `ux-copy-review`.
- For implementation branches where copy changes affect milestone acceptance,
  recommend `milestone-conformance-review`.
- Before PR prep, recommend `pre-pr-adversary-review` if behavior or risk also
  changed; otherwise recommend `pr-readiness-gate`.
- For release-note wording, recommend `release-log` after copy issues are fixed.
- For PR description wording, recommend `pr-description` after copy issues are
  fixed.
