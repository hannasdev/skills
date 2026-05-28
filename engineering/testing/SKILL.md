---
name: testing
description: Use when adding, changing, reviewing, debugging, or validating tests; when fixing bugs; when refactoring behavior; or when changing CI, fixtures, snapshots, schemas, generated outputs, test commands, or test infrastructure.
---

# Testing

## Purpose

Use this skill to prove behavior with the smallest reliable test surface. Avoid false confidence from brittle tests, superficial assertions, selectively run commands, or invented test results.

When testing, establish:

1. What behavior should be true.
2. What could realistically break.
3. What evidence proves the behavior still works.

## Use This Skill When

- Implementing a feature.
- Fixing a bug.
- Refactoring behavior-preserving code.
- Reviewing runtime behavior changes.
- Investigating failing tests.
- Updating snapshots, fixtures, schemas, contracts, or generated outputs.
- Changing test infrastructure, CI, dependencies, or build tooling.

## Do Not Use This Skill As The Primary Guide For

- General code review unless tests or validation are part of the task.
- Performance benchmarking unless regression testing or reliability is the focus.
- Production incident response unless creating or validating a regression test.
- Security review unless the work includes security-focused tests.

## Core Workflow

Before writing or changing tests:

1. Identify the behavior being protected.
2. Inspect existing test structure before creating a new pattern.
3. Locate the nearest relevant tests.
4. Follow project conventions for naming, fixtures, helpers, mocks, and assertions.
5. Discover test commands from repository files instead of guessing.

Inspect likely sources:

- `package.json`
- `pyproject.toml`, `pytest.ini`, `tox.ini`
- `go.mod`
- `Cargo.toml`
- `.github/workflows/`
- `Makefile`
- Existing `test`, `tests`, `spec`, `__tests__`, or `fixtures` directories

## Test Selection Strategy

Prefer the smallest test that proves the behavior.

Use this order of preference:

1. Unit test for isolated logic.
2. Integration test for interactions between internal components.
3. Contract or schema test for API boundaries, generated output, protocol behavior, or external interfaces.
4. End-to-end test only when the behavior cannot be proven reliably at a lower level.

Do not add broad end-to-end coverage for behavior that a focused unit or integration test can prove.

## Non-Negotiables

Do not:

- Claim tests passed without running them.
- Delete failing tests without a clear reason.
- Weaken assertions to match broken behavior.
- Update snapshots blindly.
- Ignore flaky tests without reporting them.
- Add broad sleeps instead of controlling time deterministically.
- Depend on external network services in normal tests.
- Introduce real secrets, production tokens, customer data, private logs, or personal data into tests or fixtures.
- Hide uncertainty.

## Bug Fixes

For bug fixes, add or identify a regression test when practical.

A good regression test should fail before the fix and pass after the fix. If this cannot be demonstrated, explain why in the final report.

Use this sequence:

1. Reproduce the failure with an existing or new test.
2. Make the smallest code change that fixes it.
3. Re-run the failing test.
4. Run the relevant surrounding test set.

## Refactors

For refactors:

1. Identify behavior that must remain unchanged.
2. Run relevant existing tests before editing when practical.
3. Refactor without changing external behavior.
4. Run the same tests after editing.
5. Add focused tests only if the existing suite does not protect the risky behavior.

Do not rewrite tests simply to match the new implementation if externally visible behavior should not change.

## Reporting Results

When reporting testing work, include:

- What tests were added or changed.
- What commands were run.
- Whether each command passed or failed.
- Any tests that were skipped and why.
- Any remaining uncertainty.

Use plain language. Do not overstate confidence.

Example:

```text
Added a regression test for invalid schema input. Ran `pnpm test schema-validator.test.ts` and `pnpm test`; both passed. I did not run browser E2E tests because this change only affects server-side validation.
```

## Final Checklist

Before finishing testing work, verify:

The test protects meaningful behavior.
The test would fail if the bug or broken behavior returned.
The test follows existing project conventions.
The focused test was run.
The relevant broader test set was run, or the limitation was reported.
Any failures are explained honestly.
The final response includes exact commands and outcomes.
Reference Files

Use these files for deeper guidance when relevant:

skills/references/testing-examples.md — common workflows for bug fixes, refactors, CI failures, and snapshot updates.
skills/references/mocking-and-fixtures.md — guidance for mocks, fixtures, deterministic tests, and test data.
skills/references/snapshots-and-generated-output.md — guidance for snapshots, generated files, schemas, and contract validation.

## Next Skill

End by recommending the next skill:

- If tests now prove the milestone behavior, recommend `milestone-conformance-review` for initiative-based work.
- If tests expose implementation gaps, recommend `milestone-implementation` and rerunning the focused tests.
- If validation is complete and the work is not initiative-based, recommend `pre-pr-adversary-review` before PR prep.
