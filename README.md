# Codex Skills Workflow

This folder contains custom global Codex skills. The main workflow is
agent-first: agents own lifecycle roles, and skills are the procedures those
agents run.

You do not need to memorize every step. For initiative work, start by saying
what phase you are in or what outcome you want:

- "Plan an initiative for this idea."
- "Review this initiative before activation."
- "Activate this initiative and prepare the first milestone."
- "Implement the current milestone."
- "Run conformance review."
- "Prepare the PR."
- "Handle PR feedback."
- "Finish post-merge cleanup."

You can also name an individual skill directly when you want precise control.

## Target Initiative Workflow

```text
Concept discussion
  -> initiative-planning
  -> initiative-adversary-review
  -> initiative-activation
  -> milestone-implementation
  -> milestone-conformance-review
  -> pre-pr-adversary-review
  -> pr-description / release-log
  -> copilot-feedback-gate / review-comments
  -> post-merge-cleanup
  -> initiative-completion
  -> next milestone or done
```

## Agent Roles

| Agent | Owns | Context | Skills |
| --- | --- | --- | --- |
| Orchestrator | Sequencing, state, decisions, handoffs | Full conversation | Chooses the next skill and integrates results |
| Initiative Planner | Durable initiative docs | Full or focused context | `initiative-planning` |
| Initiative Auditor | Plan critique before activation | Clean context | `initiative-adversary-review` |
| Activator | Move accepted work into implementation | Main context | `initiative-activation` |
| Builder | Implement one milestone from packet | Clean packet-only context | `milestone-implementation`, `testing`, `refactoring` |
| Conformance Auditor | Compare branch to milestone promise | Clean context | `milestone-conformance-review` |
| Adversarial Reviewer | Find bugs, edge cases, review churn | Clean context | `pre-pr-adversary-review`, `code-review` |
| PR Publisher | PR body, release notes, commits | Main context | `pr-description`, `release-log`, `commit` |
| Feedback Triage Agent | Decide whether PR feedback needs rerun gates | Clean or focused context | `copilot-feedback-gate` |
| Review Responder | Apply fixes and resolve review threads | Main context | `review-comments`, `testing`, `commit` |
| Completion Agent | Post-merge cleanup and initiative state | Main context | `post-merge-cleanup`, `initiative-completion` |

## Clean-Context Rule

Use clean spawned agents when private conversation history would bias the result.

Good clean-context candidates:

- `initiative-adversary-review`
- `milestone-implementation`
- `milestone-conformance-review`
- `pre-pr-adversary-review`
- `code-review`
- `copilot-feedback-gate`

Usually keep these in the main context:

- `initiative-planning`
- `initiative-activation`
- `pr-description`
- `release-log`
- `review-comments`
- `post-merge-cleanup`
- `initiative-completion`

## Model Guidance

Default to inheriting the parent model unless there is a clear reason to
override. When spawning clean-context agents, a useful policy is:

| Agent | Suggested model |
| --- | --- |
| Initiative Auditor | `gpt-5.5`, high reasoning |
| Builder | `gpt-5.3-codex` or inherit |
| Conformance Auditor | `gpt-5.5`, high reasoning |
| Adversarial Reviewer | `gpt-5.5`, high reasoning |
| Feedback Triage Agent | `gpt-5.4`, medium/high reasoning |

## Durable Artifacts

The workflow should rely on artifacts, not chat memory:

- initiative PRD
- milestones
- optional architecture notes
- implementation packet
- branch diff against `main`
- implementation report
- conformance report
- adversarial review findings
- PR description
- review comments
- post-merge completion report

If a justification matters, put it in a durable artifact: PRD, milestone,
architecture note, code comment, test, commit message, PR description, or review
reply.

## Skill Inventory

Planning and initiative lifecycle:

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

## Practical Rule

Prefer the full lifecycle for initiative-sized work. For small fixes, use only
the skills proportional to risk, usually:

```text
testing -> pre-pr-adversary-review -> pr-description -> review-comments -> post-merge-cleanup
```
