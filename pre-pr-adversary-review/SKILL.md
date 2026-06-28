---
name: pre-pr-adversary-review
description: Use before preparing a pull request description, opening or updating a PR, publishing changes, or running other PR-related skills. Delegates to adversarial-reviewer when available. Performs an adversarial pre-review of the branch diff to catch contract drift, missing edge-case validation, weak tests, documentation/release-log gaps, migration risks, and side-effect ordering problems before reviewers see the PR.
---

# Pre-PR Adversary Review

## Purpose

Find likely reviewer comments before the PR exists. This is a hostile-but-helpful pass over the intended branch diff, focused on correctness, contract alignment, missing edge cases, and review churn.

Run this skill before:

- `pr-description`
- publishing/opening/updating a PR
- marking a PR ready for review
- asking for final PR prep after implementation

If another PR-related skill is also relevant, run this skill first, then continue to that skill with the findings.

## Delegation Default

Invoking this skill is an explicit request to use `adversarial-reviewer` when
multi-agent spawning is available. Do not run this review locally merely
because the user did not separately say "use a subagent."

When this skill is invoked from a conversation that is not already running
inside a spawned/delegated agent and a multi-agent spawn tool is available,
spawn a clean `adversarial-reviewer` agent with the repository guidance, branch
boundary, intended contract, branch diff, relevant durable artifacts, and any
available validation evidence.

If delegation is unavailable, perform the adversarial review in the current
context and note that the delegation fallback was used.

If this skill is already running inside a spawned/delegated adversarial review
agent, perform the review locally and do not spawn another review agent.

## Required Process

1. Establish scope.
   - Read repository guidance such as `AGENTS.md` and the product/source-of-truth docs it names.
   - Identify the base branch from the user request, current PR metadata, repository defaults, or local contribution guidance.
   - Fetch or otherwise confirm base freshness before judging the diff. Prefer reviewing against `origin/<base>` after `git fetch origin <base>` when `origin` is the target remote.
   - Inspect `git status --short`, changed file groups, and unstaged/staged diffs.
   - If the branch has no commits ahead of the base branch, report that there is nothing to review and skip the adversarial checklist.
2. Identify the intended contract.
   - Summarize what changed in user-facing, maintainer-facing, tool/API, data, migration, generated artifact, and test behavior.
   - Note any public schemas, tool descriptions, docs, release notes, generated files, or examples that should match the implementation.
3. Run test-quality review when the branch changes test evidence.
   - If the branch adds or changes tests, fixtures, snapshots/golden outputs, generated reports, schemas/contracts, CLI behavior, CSV/JSON/Markdown assertions, or validation helpers, use `test-quality-review` before declaring there are no weak-test findings.
   - The sub-check must answer whether the tests prove the risky behavior, not merely whether tests exist or pass.
   - Carry any `Should Fix` or `Needs Better Evidence` result into this review's findings unless it is fixed before the final verdict.
4. Run the adversarial checklist below.
5. Classify findings.
   - **Blocking:** likely correctness, safety, migration, contract, or data-loss issue.
   - **Should fix before PR:** likely reviewer comment or avoidable churn.
   - **Consider:** optional cleanup, extra coverage, or tradeoff worth naming in the PR.
   - **No action:** checked and acceptable.
6. Recommend fixes before PR prep.
   - Prefer small, targeted changes and tests.
   - Do not expand scope unless the issue threatens correctness, safety, or the advertised contract.
7. Record adversarial-review lifecycle state.
   - If no `Blocking` or `Should Fix Before PR` findings remain and the initiative has `initiative.json`, run the lifecycle transition before PR prep:
     `node $SKILLS_DIR/initiative-completion/scripts/initiative-lifecycle.mjs record-adversarial-review --repo <repo> --initiative <initiative-path> --milestone <milestone-id>`
   - Treat the lifecycle transition as scoped commit authorization through lifecycle-transition tooling. Commit only the resulting lifecycle/bookkeeping diff with `commit` before PR prep.
   - If unrelated local changes prevent a clean lifecycle commit, report the blocker instead of leaving the transition uncommitted.
   - Do not record adversarial review when `test-quality-review` returns `Should Fix` or `Needs Better Evidence`.
8. After fixes, rerun the relevant checks and update the PR description inputs with remaining risks/tradeoffs.

## Adversarial Checklist

### Contract Drift

- Do implementation, tool schema, generated docs, README/product docs, release log, examples, and PR description draft all say the same thing?
- Do schema constraints match planner/runtime constraints?
- Do success and error response envelopes have consistent fields and action names?
- Are behavior-changing defaults called out as behavior changes?
- Are generated docs regenerated when source tool descriptions changed?

### Inputs and Edge Cases

- Empty, missing, null, whitespace-only, duplicate, reordered, wrong-type, too-large, and stale inputs.
- Set-like filters are deduped/sorted before manifests, fingerprints, checksums, or generated provenance.
- CLI flags reject unknown tokens and surface actionable errors.
- Optional-but-present values are validated when downstream behavior depends on them.
- Limits are explicit for SQL host parameters, pagination, file size, or list length.

### Boundaries and Authority

- Paths are canonicalized through existing boundary helpers before reading or writing.
- Symlinks, stale indexed paths, relative escapes, and out-of-root paths are refused or diagnosed.
- Canonical state, generated artifacts, sidecars, and imports keep their distinct ownership rules.
- Managed/canonical state cannot be overwritten by observational sync or compatibility fields.

### Migration and Compatibility

- Existing databases, files, config, or generated artifacts still work after upgrade.
- Backfills cover old data, not only newly synced data.
- Stable identities survive renames, reorders, folder moves, and source-tool restructuring.
- Compatibility aliases behave as documented and have tests.

### Side Effects and Failure Modes

- DB transactions do not include non-transactional filesystem writes unless partial failure is intentionally handled.
- Post-commit side effects report warning diagnostics instead of silently diverging.
- Diagnostics fail closed and return structured diagnostics rather than crashing or ignoring failures.
- Logging and CI failure paths preserve useful output.

### Tests

- Tests cover the changed success path and at least one meaningful failure/edge path.
- Tests prove the behavior, not just text that could appear for unrelated reasons.
- Changed assertions bind to exact values, parsed fields, structured output, or observable behavior rather than generic truthiness or substring presence.
- For rendered artifacts, assertions exercise the actual rendering path and page/layout state when relevant.
- For docs/examples, examples do not mask `{ ok: false }` responses as empty results.

### Release and Review Hygiene

- Release-log entries have real PR links, not `TBD`, `pending`, or inconsistent link style.
- User-facing or maintainer-facing behavior changes include release-log coverage when repo policy expects it.
- The branch is scoped to one concern, with unrelated changes excluded or called out.
- Validation commands are known and feasible before PR prep.

### Initiative Lifecycle Drift

For initiative-based work, especially after `milestone-conformance-review` returns or appears likely to return `Pass`:

- Prefer `initiative.json` and lifecycle tooling over Markdown status inference. Markdown summaries must not contradict JSON state.
- If the branch completes the final milestone, `initiative.json`, PRD, milestones, product/source-of-truth docs, and release/completion notes must agree with `complete_on_merge` or completed lifecycle state before PR prep.
- If all milestones are complete, stable initiative paths are acceptable when `initiative.json` records `state: "complete"` or `state: "complete_on_merge"` with PR/date evidence. Do not require a routine `done/` folder move unless local policy explicitly does.
- If the branch completes a non-final milestone, the initiative should remain active and identify the next milestone; it should not churn between active/backlog/done locations.
- If the docs still say the completed milestone is `in implementation`, `pending`, `TBD`, or active without an explicit deferral, classify it as **Should fix before PR**.
- When available, run the lifecycle checker and include its result:
  `node $SKILLS_DIR/initiative-completion/scripts/check-initiative-lifecycle.mjs --repo <repo> --initiative <initiative-path> --milestone <milestone-id> --strict`

## Output Format

Return this structure:

```md
## Pre-PR Adversary Review

Scope: <base and changed area>

## Blocking
- <finding, impact, file/path if known, suggested fix>

## Should Fix Before PR
- <finding, impact, suggested fix>

## Consider
- <tradeoff or optional improvement>

## Checked / No Action
- <important areas reviewed that looked acceptable>

## Suggested Validation
- `<command>`
- Manual: <specific artifact/workflow to inspect>

## PR Prep Notes
- Risks/tradeoffs to mention:
- Follow-up candidates:
```

Omit empty sections. Keep the result concise enough that it can feed directly into PR description preparation.

## Next Skill

End by recommending the next skill:

- If `Blocking` or `Should Fix Before PR` findings remain, recommend `milestone-implementation` for initiative-based work or implementation with `testing` otherwise, then rerun `pre-pr-adversary-review`.
- If the branch changes materially while fixing findings, recommend rerunning `milestone-conformance-review` before PR prep when the work is initiative-based.
- If no blocking or should-fix findings remain, recommend `pr-description`.
