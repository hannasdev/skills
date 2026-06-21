---
name: initiative-planning
description: Create or update durable initiative planning artifacts from a concept discussion, including a user-perspective UX preview and human approval checkpoint before activation or implementation. Use when turning an idea, product change, architecture change, roadmap item, or implementation plan into repository initiative documents such as PRDs, milestones, and optional architecture notes; when reviewing or revising those planning artifacts before activation; or when replacing ad hoc PRD/issue planning with milestone-based initiative documentation.
---

# Initiative Planning

## Purpose

Turn conceptual discussion into durable initiative artifacts that can drive implementation, review, and PR work without depending on chat history.

Default to the repository's local convention. If none exists, use:

```text
docs/initiatives/backlog/<initiative-slug>/prd.md
docs/initiatives/backlog/<initiative-slug>/milestones.md
docs/initiatives/backlog/<initiative-slug>/architecture.md
```

Create `architecture.md` only when the initiative changes architecture, ownership boundaries, persistence, APIs, workflow contracts, external integrations, security posture, migration behavior, or operational responsibilities.

## Required Process

1. Gather source-of-truth context.
   - Read `AGENTS.md` if it exists. Also check `CONTRIBUTING.md`, `docs/README.md`, or other top-level guidance files. If none exist, proceed without repository-specific guidance.
   - Read product or architecture source-of-truth docs named by repository guidance.
   - Inspect existing initiative folders to match naming, structure, milestone style, and bookkeeping.
   - Prefer existing repository templates when present.
2. Clarify only blocking ambiguity.
   - If the concept is underspecified but a reasonable draft can preserve ambiguity as an open question, draft it.
   - Stop for user input when scope, user value, architectural direction, or acceptance criteria would otherwise be invented.
3. Create or update the initiative folder under backlog.
   - Use a short kebab-case slug.
   - If an initiative folder with the same slug already exists, update the existing artifacts rather than creating duplicates. Summarize what changed compared to the previous version.
   - Keep the initiative in `backlog/` unless the user explicitly asks to activate it.
   - Do not move an initiative to `active/` as part of planning unless activation is requested.
4. Write the PRD.
   - Focus on problem, value, scope, non-goals, design alignment, risks, and acceptance criteria.
   - Preserve important rationale from the discussion as durable text.
   - Include a user-perspective preview that explains what the result will look and feel like to the affected user, maintainer, or operator before implementation begins.
   - Include an explicit human approval checkpoint. Approval is pending by default unless the user has already approved the preview in clear terms.
   - Do not include implementation chatter that will age quickly.
5. Write milestones.
   - Break work into independently reviewable gates.
   - Each milestone must have a concrete outcome, acceptance criteria, required validation, and explicit non-goals.
   - Prefer vertical slices that leave the repository in a coherent state after each milestone.
   - Add a scope budget for each milestone. Treat the budget as a planning tripwire, not a hard rule: prefer 3-5 acceptance criteria, no more than 2 major subsystem boundaries, an estimated non-generated diff under 800 changed lines, and one focused validation story.
   - If a milestone exceeds any tripwire, either split it or record why the larger milestone is still the most reviewable shape.
6. Add architecture notes when needed.
   - Capture decisions, constraints, ownership boundaries, data/API contracts, migration strategy, failure modes, and alternatives considered.
   - Keep architecture notes tied to the initiative; promote to global architecture docs only when the repository's durable design contract changes.
7. Prepare the UX and human approval review.
   - Summarize the user-visible outcome in concrete terms: primary users, visible surfaces, expected workflow, changed copy or commands, generated artifacts, error states, and what intentionally will not change.
   - For UI-heavy work, include a low-fidelity sketch, screen inventory, state list, or screenshot/mockup requirement when that would expose misunderstandings before implementation.
   - For non-UI work, describe the maintainer/operator experience: commands, config, logs, diagnostics, documentation, migration flow, or API behavior.
   - Call out assumptions and gaps that could change the user experience.
   - Do not activate the initiative, recommend implementation, or treat the plan as accepted until the human approval checkpoint is approved, unless the user explicitly overrides this gate.
8. Self-review the artifacts.
   - Check alignment with product/design principles and target architecture.
   - Check that acceptance criteria are testable.
   - Check that non-goals prevent obvious scope creep.
   - Check that every milestone's scope budget is plausible and that any exceeded tripwire has a clear split rationale.
   - Check that risks have validation or decision paths.
   - Check that the user-perspective preview is specific enough for a human to notice gaps before implementation.
   - Check that the approval state is explicit and not implied by the existence of planning docs.
9. Report the result.
   - List created/updated files.
   - Summarize the user-perspective preview and approval status.
   - Summarize milestone gates.
   - Call out open questions, risks, and recommended next review.

## Template Reference

Use `references/initiative-templates.md` for the default `prd.md`, `milestones.md`, and `architecture.md` structures when the repository does not provide a stronger local template.

## Planning Guidance

When drafting initiative artifacts:

- synthesize from existing conversation and repository context;
- identify affected modules or ownership boundaries without overfitting to exact file paths;
- record implementation decisions that are already settled;
- record testing strategy and prior art;
- keep explicit out-of-scope decisions;
- make the expected user, maintainer, or operator experience reviewable before implementation;
- keep human approval state visible and separate from technical readiness;
- use durable repository files as the source of truth.

## Quality Bar

Good initiative planning:

- makes the next implementation packet obvious;
- lets a cold conformance reviewer compare branch diff to milestone promise;
- names risks before implementation starts;
- shows the human what the delivered experience is expected to be before committing to implementation;
- prevents activation from being treated as a purely technical handoff when product or UX understanding is still unapproved;
- keeps milestones small enough to review and merge;
- makes likely review burden visible before activation;
- separates product promise from implementation notes;
- leaves unresolved decisions visible instead of burying them in chat.

Avoid:

- vague milestones such as "implement backend";
- milestones that exceed scope tripwires without split rationale;
- acceptance criteria that cannot be tested or reviewed;
- architecture decisions hidden only in prose summaries;
- scope expansion disguised as "cleanup";
- approval implied only by draft creation or lack of objections;
- moving work to `active/` before the initiative has been accepted.

## Next Skill

End by recommending the next skill:

- If the initiative docs are ready for critique, recommend `initiative-adversary-review`.
- If open questions block a useful review, recommend continuing `initiative-planning` after the user decides.
- If the UX preview or human approval checkpoint is pending, recommend human review before `initiative-adversary-review` or activation.
- If the user wants implementation immediately, still recommend human approval and `initiative-adversary-review` before `initiative-activation` unless they explicitly accept the risk.
