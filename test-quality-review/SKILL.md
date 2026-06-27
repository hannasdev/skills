---
name: test-quality-review
description: Review whether tests, fixtures, snapshots, generated outputs, schemas, CLI/report assertions, or validation evidence actually prove a branch's claimed behavior. Use before PR prep, during pre-pr-adversary-review, or when changed tests could create false confidence through weak assertions, overbroad snapshots, mocks that bypass behavior, or missing edge/failure coverage.
---

# Test Quality Review

## Purpose

Judge proof quality, not test style. This skill answers: "Would these tests fail if the claimed behavior were broken?"

Use it after inspecting the branch diff, intended contract, changed tests, and validation output. Do not replace `testing`; use `testing` to create or repair tests after this review finds gaps.

## Required Process

1. Establish the claim.
   - Identify the behavior, contract, CLI output, generated artifact, or bug fix the branch says is covered.
   - Identify the relevant changed tests, fixtures, snapshots, schemas, reports, or validation commands.
2. Trace each claim to assertions.
   - Prefer assertions that bind to structured fields, parsed output, observable side effects, or explicit errors.
   - Treat headings, labels, generic substrings, and snapshot bulk as weak evidence unless they are the behavior.
3. Look for false confidence patterns.
   - `assert(value, expected)` where the second argument is only a message, not an expected value.
   - Truthiness assertions when exact values, errors, counts, dates, paths, or IDs matter.
   - Substring checks for JSON, CSV, URLs, paths, command output, or Markdown sections that should be parsed or structurally matched.
   - Tests that only assert headings, labels, existence, or no-throw behavior.
   - Golden or snapshot tests that can pass despite wrong important values.
   - Mocks that skip the behavior being claimed.
   - Missing failure-path, edge-case, compatibility, or stale-input coverage for the risky behavior.
   - Assertions of implementation details without user-visible or contract-visible proof.
   - Report/output tests that do not parse or bind to named fields.
4. Calibrate the verdict.
   - **Pass:** changed tests would plausibly fail for the important broken behaviors.
   - **Should Fix:** a concrete weak-test pattern could let a likely bug through before PR review.
   - **Needs Better Evidence:** the diff or validation output is insufficient to judge proof quality.
5. Suggest targeted fixes.
   - Name the missing assertion or test case.
   - Prefer one focused assertion improvement over broad snapshot churn.
   - Recommend parsing structured artifacts when possible.

## Output Format

```md
## Test Quality Review

Verdict: Pass | Should Fix | Needs Better Evidence

## Findings
- <specific false-confidence risk, with file/path when known>

## Suggested Fixes
- <targeted assertion or test improvement>

## Evidence Checked
- <test files, fixtures, snapshots, changed behavior, and validation output reviewed>
```

Omit empty sections. Keep the review short enough to paste into a pre-PR finding or PR prep note.

## Next Skill

- Verdict `Pass`: continue the parent review or PR readiness flow.
- Verdict `Should Fix`: recommend `testing`, then rerun `test-quality-review` or `pre-pr-adversary-review`.
- Verdict `Needs Better Evidence`: ask for the missing diff, test files, or validation output before declaring the PR test evidence clean.
