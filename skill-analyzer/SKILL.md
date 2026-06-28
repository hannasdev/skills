---
name: skill-analyzer
description: Review Codex skills for scope creep, oversized instructions, weak trigger descriptions, poor progressive disclosure, stale UI metadata, unnecessary files, and unclear or brittle workflows. Use when auditing one skill, sweeping a skills directory, reviewing skill changes before commit, or setting up recurring quality checks for personal or team skills.
---

# Skill Analyzer

## Workflow

1. Resolve the skill path or skills directory from the user request. If the user says "my skills" or asks for a sweep, review each immediate child directory that contains `SKILL.md`.
2. Run `scripts/analyze_skill.py` on the target path before doing qualitative review:

```bash
python3 /Users/hanna/.codex/skills/skill-analyzer/scripts/analyze_skill.py <skill-or-skills-dir>
```

3. Read `references/rubric.md`, then inspect the reported `SKILL.md`, `agents/openai.yaml`, and any relevant `references/`, `scripts/`, or `assets/` files.
4. Report findings first, ordered by severity. Use `P1` for broken or misleading skills, `P2` for quality issues likely to degrade future Codex behavior, and `P3` for cleanup or polish.
5. Recommend concrete edits. If the user asks you to fix the skill, make the smallest focused changes and rerun this analyzer plus the system skill validator.

## Review Focus

Check whether the skill:

- Has one coherent job and a clear boundary.
- Uses the frontmatter `description` as the trigger source of truth.
- Keeps `SKILL.md` concise, procedural, and under 500 lines.
- Moves long examples, schemas, variants, and domain details into `references/`.
- Uses scripts for deterministic or repeatedly rewritten operations.
- Avoids extra documentation files that are not loaded or used by Codex.
- Gives enough validation guidance to keep future edits honest.

## Continuous Use

For ongoing hygiene, run this skill whenever a skill is created, substantially edited, or starts feeling hard to follow. For a full sweep, review all skill directories, summarize the highest-risk skills first, and include a short watchlist of skills that are close to size or scope limits.

When the user wants automation, propose a lightweight recurring review that invokes this skill against the relevant skills directory and reports only new or worsened issues.
