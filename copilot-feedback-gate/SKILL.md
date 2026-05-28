---
name: copilot-feedback-gate
description: Assess GitHub Copilot or reviewer feedback after a PR review to decide whether ordinary review-comment handling is enough or whether milestone conformance and adversarial review gates must be rerun. Use when PR feedback includes multiple functionality comments, missed acceptance criteria, architecture concerns, systemic test gaps, scope drift, or repeated back-and-forth risk.
---

# Copilot Feedback Gate

## Purpose

Prevent PR feedback loops from turning into piecemeal patching. This skill classifies GitHub Copilot or reviewer feedback and decides whether to route through normal review-comment handling or return to local review gates.

Use `review-comments` for collecting, implementing, replying to, and resolving PR threads. Use this skill to decide whether the feedback means the branch needs another milestone conformance or adversarial review pass.

## Required Process

1. Gather feedback.
   - Fetch unresolved PR review comments/threads when possible.
   - Include Copilot comments, human reviewer comments, check annotations, and CI failures if they are part of the feedback loop.
   - Group comments by topic and severity.
2. Classify comments.
   - **Functionality:** behavior, acceptance criteria, API/output shape, data, workflow, migration, compatibility, failure path.
   - **Architecture:** ownership boundary, source-of-truth drift, layering, contracts, persistence, security/safety.
   - **Testing:** missing proof, weak assertion, false confidence, CI gap.
   - **Docs/bookkeeping:** PRD/milestone status, release log, user/maintainer docs, generated docs.
   - **Style/nit/opinion:** local readability or preference without behavior impact.
3. Apply escalation rules.
   - Rerun milestone conformance review when feedback suggests a missed acceptance criterion, under-implementation, scope creep, or stale milestone bookkeeping.
   - Rerun adversarial implementation review when feedback exposes a likely bug, edge case, unsafe assumption, architecture drift, or systemic test weakness.
   - Rerun both when there are more than two functionality-related comments.
   - Rerun both when one comment reveals a deeper category error, even if it is the only comment.
   - Use ordinary `review-comments` handling when feedback is isolated, local, and does not challenge milestone satisfaction or branch risk.
4. Produce a routing decision.
   - **Handle normally:** process comments with `review-comments`.
   - **Patch then rerun conformance:** fix focused scope/evidence issue, then run `milestone-conformance-review`.
   - **Patch then rerun adversarial review:** fix risk/bug/test issue, then run `pre-pr-adversary-review` or `code-review`.
   - **Return to milestone implementation:** feedback shows the branch is not milestone-complete.
   - **Ask human decision:** feedback conflicts with accepted scope or requires product/architecture choice.

## Guardrails

- Do not blindly apply every suggestion.
- Do not resolve threads before fixes are pushed and validated.
- Do not treat Copilot comments as authoritative; verify against code, docs, and milestone scope.
- Do not keep patching locally if feedback reveals that the milestone promise itself is wrong or incomplete.
- Do not rerun heavy gates for pure style nits unless they reveal broader maintainability risk.

## Output Format

```md
## Copilot Feedback Gate

PR: <number or URL>
Decision: Handle normally | Patch then rerun conformance | Patch then rerun adversarial review | Return to milestone implementation | Ask human decision

## Feedback Classification

- Functionality: <count and themes>
- Architecture: <count and themes>
- Testing: <count and themes>
- Docs/bookkeeping: <count and themes>
- Style/nit/opinion: <count and themes>

## Escalation Triggers

- <trigger that fired, or None>

## Recommended Route

- <next skill/workflow to run>
- <focused patch request or decision needed>

## Notes For Review Comments

- <which threads can be handled directly>
- <which threads should wait for rerun results>
```

## Next Skill

End by recommending the next skill:

- Decision `Handle normally`: recommend `review-comments`.
- Decision `Patch then rerun conformance`: recommend `milestone-implementation`, then `milestone-conformance-review`.
- Decision `Patch then rerun adversarial review`: recommend `milestone-implementation`, then `pre-pr-adversary-review`.
- Decision `Return to milestone implementation`: recommend `milestone-implementation`, then rerunning both `milestone-conformance-review` and `pre-pr-adversary-review`.
- Decision `Ask human decision`: ask for the decision before applying more PR feedback.
