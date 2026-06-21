# Codex Skills

Custom global Codex skills for agent-first initiative work.

Use the lifecycle for initiative-sized changes. For small fixes, use only the
skills proportional to risk.

## Start Here

Ask for the phase or outcome you want:

- "Plan an initiative for this idea."
- "Review this copy or workflow for first-time user clarity."
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
  -> ux-copy-review
  -> initiative-adversary-review
  -> initiative-activation
  -> milestone-implementation
  -> milestone-conformance-review
  -> pr-readiness-gate
  -> ux-copy-review / pre-pr-adversary-review / release-log / pr-description
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
| UX Copy Reviewer | Full or focused | `ux-copy-review` |
| `adversarial-reviewer` | Clean | `initiative-adversary-review` |
| Activator | Main | `initiative-activation` |
| `builder` | Clean packet-only | `milestone-implementation`, `testing`, `refactoring`, `commit` |
| `conformance-auditor` | Clean | `milestone-conformance-review` |
| `adversarial-reviewer` | Clean | `pre-pr-adversary-review`, `code-review` |
| PR Publisher | Main | `pr-description`, `release-log`, `commit` |
| `light-gate` | Clean or focused | `pr-readiness-gate`, `copilot-feedback-gate` |
| Review Responder | Main | `review-comments`, `testing`, `commit` |
| Completion Agent | Main | `post-merge-cleanup`, `initiative-completion` |

## Clean Context

Use clean spawned agents when private conversation history would bias the result.

Best clean-context candidates:

- `ux-copy-review` when prior implementation context may bias the review
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

## Execution Profiles

Inherit the parent model by default. Delegate to a named custom agent when the
workflow benefits from clean context or a specific model/reasoning tier.

Invoking a skill that has a `Delegation Default` is an explicit request to use
that skill's named custom agent when multi-agent spawning is available. Do not
run those workflows locally merely because the user did not separately say
"use a subagent."

Custom agent source files live in `agents/` and should be installed to
`~/.codex/agents/` for Codex to load them.

| Agent | Model | Reasoning | Use |
| --- | --- | --- | --- |
| `light-gate` | `gpt-5.4-mini` | low | Quick readiness, existence, and routing checks |
| `builder` | `gpt-5.5` | medium | Focused implementation, tests, commits, and refactors |
| `conformance-auditor` | `gpt-5.5` | high | Milestone acceptance and evidence review |
| `adversarial-reviewer` | `gpt-5.5` | xhigh | Deep bug, contract, edge-case, and review-risk analysis |

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
- `ux-copy-review`
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

- `ux-copy-review`
- `pre-pr-adversary-review`
- `code-review`
- `pr-description`
- `release-log`
- `copilot-feedback-gate`
- `review-comments`

Post-merge:

- `post-merge-cleanup`
