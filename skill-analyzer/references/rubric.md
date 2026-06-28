# Skill Review Rubric

Use this rubric after running `scripts/analyze_skill.py`. The script finds measurable risks; this rubric turns them into judgment.

## Severity

- `P1`: The skill may not trigger, may trigger for the wrong task, contains TODO/template text, has invalid required metadata, or gives instructions that can cause incorrect/destructive behavior.
- `P2`: The skill is likely to degrade Codex behavior: unclear scope, oversized `SKILL.md`, duplicated reference material, weak workflow, missing validation, stale UI metadata, or brittle hand-written steps where a script is warranted.
- `P3`: The skill works but should be tightened: wording polish, minor resource organization, missing examples, small metadata improvements, or near-threshold size warnings.

## Frontmatter

The YAML frontmatter should contain only `name` and `description`.

The `description` must:

- Say what the skill does.
- Include when to use it, because this is the trigger signal.
- Mention important file types, systems, or task phrases that should invoke the skill.
- Avoid vague wording like "helps with" without specific trigger context.
- Stay specific enough that the skill does not steal unrelated work.

Flag body sections named "When to use" or similar when they contain trigger information that belongs in the description.

## Scope

Prefer one coherent job per skill. A skill is probably too broad when:

- It combines unrelated domains, such as GitHub triage, release notes, and deployment.
- It has many independent workflows that do not share resources or validation.
- The user would naturally ask for only one slice of it most of the time.
- Fixing one workflow requires loading references for unrelated workflows.

Recommend splitting only when it reduces real cognitive load or improves trigger precision.

## Progressive Disclosure

`SKILL.md` should be a compact router and operating procedure. Move details out when they are large, variant-specific, or rarely needed.

Good candidates for `references/`:

- Long examples
- Domain policies
- API details
- Schemas
- Provider-specific instructions
- Framework-specific variants

For reference files over 100 lines, expect a table of contents or obvious section map near the top. For very large references, expect search hints in `SKILL.md`.

## Scripts

Recommend scripts when Codex would otherwise rewrite fragile code, repeat a mechanical procedure, or need deterministic parsing/validation.

Scripts should be:

- Small enough to inspect when needed.
- Runnable without hidden environment assumptions.
- Tested at least once after edits.
- Referenced from `SKILL.md` with a concrete invocation.

Do not require scripts for judgment-heavy work where prose instructions are clearer.

## Assets

Assets are files used in output, not documentation to read. Check that templates, images, fonts, or boilerplate are actually referenced by the workflow. Flag unused or unexplained assets.

## Instruction Quality

Prefer imperative, procedural guidance. Good skill instructions tell Codex what to do, in what order, with what validation.

Watch for:

- Passive descriptions instead of actions.
- Long background essays.
- Repeated information across `SKILL.md` and references.
- Unclear stopping conditions.
- Missing validation commands.
- Hidden assumptions about paths, credentials, or installed tools.

## Output Format

For reviews, lead with findings:

```text
Findings
- [P2] SKILL.md is 720 lines, which defeats progressive disclosure. Move provider-specific examples to references/provider.md.
- [P2] The description says "Use for documents" but the body handles PDFs, DOCX, and slides. Narrow the trigger or split the skill.

Open Questions
- Should the deployment workflow be its own skill?

Summary
- Reviewed 4 files. Main risk is scope creep, not correctness.
```

If no issues are found, say that clearly and mention any residual risk, such as scripts not exercised against real artifacts.
