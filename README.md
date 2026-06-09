# Codex Skills

Custom global Codex skills for agent-first initiative work.

Use the lifecycle for initiative-sized changes. For small fixes, use only the
skills proportional to risk.

## Start Here

Ask for the phase or outcome you want:

- "Plan an initiative for this idea."
- "Review this initiative before activation."
- "Activate this initiative and prepare the first milestone."
- "Implement the current milestone."
- "Run conformance review."
- "Prepare the PR."
- "Handle PR feedback."
- "Finish post-merge cleanup."

Individual skills can still be named directly when you want exact control.

## Initiative Workflow

```text
concept
  -> initiative-planning
  -> initiative-adversary-review
  -> initiative-activation
  -> milestone-implementation
  -> milestone-conformance-review
  -> pr-readiness-gate
  -> pre-pr-adversary-review / release-log / pr-description
  -> copilot-feedback-gate / review-comments
  -> post-merge-cleanup
  -> initiative-completion
  -> next milestone or done
```

## Agent Roles

| Agent | Context | Skills |
| --- | --- | --- |
| Orchestrator | Full conversation | Chooses next step, integrates results, owns decisions |
| Initiative Planner | Full or focused | `initiative-planning` |
| Initiative Auditor | Clean | `initiative-adversary-review` |
| Activator | Main | `initiative-activation` |
| Builder | Clean packet-only | `milestone-implementation`, `testing`, `refactoring` |
| Conformance Auditor | Clean | `milestone-conformance-review` |
| Adversarial Reviewer | Clean | `pre-pr-adversary-review`, `code-review` |
| PR Publisher | Main | `pr-description`, `release-log`, `commit` |
| Feedback Triage Agent | Clean or focused | `copilot-feedback-gate` |
| Review Responder | Main | `review-comments`, `testing`, `commit` |
| Completion Agent | Main | `post-merge-cleanup`, `initiative-completion` |

## Clean Context

Use clean spawned agents when private conversation history would bias the result.

Best clean-context candidates:

- `initiative-adversary-review`
- `milestone-implementation`
- `milestone-conformance-review`
- `pre-pr-adversary-review`
- `code-review`
- `copilot-feedback-gate`

Usually keep stateful/action workflows in the main context:

- `initiative-planning`
- `initiative-activation`
- `pr-description`
- `release-log`
- `review-comments`
- `post-merge-cleanup`
- `initiative-completion`

## Model Guidance

Inherit the parent model by default. Override only when the task clearly
benefits from it.

| Agent | Suggested model |
| --- | --- |
| Initiative Auditor | `gpt-5.5`, high reasoning |
| Builder | `gpt-5.3-codex` or inherit |
| Conformance Auditor | `gpt-5.5`, high reasoning |
| Adversarial Reviewer | `gpt-5.5`, high reasoning |
| Feedback Triage Agent | `gpt-5.4`, medium/high reasoning |

## Durable Artifacts

Treat durable artifacts as the source of truth:

- initiative PRD, milestones, and optional architecture notes
- implementation packet and implementation report
- branch diff against `main`
- conformance report and adversarial review findings
- PR description, release notes, review comments, and completion report

If a justification matters, put it in an artifact: PRD, milestone,
architecture note, code comment, test, commit message, PR description, or review
reply.

## Skill Groups

Planning and lifecycle:

- `initiative-planning`
- `initiative-adversary-review`
- `initiative-activation`
- `milestone-implementation`
- `milestone-conformance-review`
- `initiative-completion`

Implementation support:

- `testing`
- `refactoring`
- `commit`

Review and PR:

- `pre-pr-adversary-review`
- `code-review`
- `pr-description`
- `release-log`
- `copilot-feedback-gate`
- `review-comments`

Post-merge:

- `post-merge-cleanup`
