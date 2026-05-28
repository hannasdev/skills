# Bug Fix Workflow

Use this workflow when fixing a confirmed or suspected bug.

1. Reproduce the bug with an existing or new test.
2. Confirm the test fails before the fix when practical.
3. Apply the smallest fix that corrects the behavior.
4. Re-run the focused failing test.
5. Run the containing test file, package, or suite.
6. Report the exact commands and outcomes.

A useful regression test should fail if the same bug returns. Do not add a test that merely exercises the code path without asserting the broken behavior.

## Refactor Workflow

Use this workflow when changing structure without intending to change behavior.

1. Identify the externally visible behavior that must remain unchanged.
2. Run relevant existing tests before editing when practical.
3. Make the refactor.
4. Run the same tests after editing.
5. Add tests only if the existing suite does not protect the behavior at risk.

Avoid rewriting tests around private implementation details unless the existing tests are genuinely coupled to internals and blocking a useful refactor.

## Feature Workflow

Use this workflow when adding new behavior.

1. Identify the observable behavior the user, caller, API, CLI, or system should see.
2. Add focused tests for the normal case.
3. Add edge case or validation tests for likely failure paths.
4. Add contract or integration tests when the feature changes a boundary.
5. Run the focused tests first, then the relevant broader suite.

Do not test every implementation branch mechanically. Test meaningful behavior and realistic risks.

## CI Failure Workflow

Use this workflow when a test or build fails in CI.

1. Read the failing command and error output.
2. Identify whether the failure is likely caused by code, test logic, environment, dependency versions, configuration, or ordering/flakiness.
3. Reproduce locally if practical.
4. Fix the narrowest cause.
5. Re-run the failed command or the closest available equivalent.
6. Report any difference between the local environment and CI.

Do not silence CI failures by skipping tests unless there is a clear, documented reason.

## Test Command Discovery

Prefer project-defined commands over raw tool invocations.

Look in:

* `package.json` scripts.
* Make targets.
* CI workflow files.
* Language-specific config files.
* Existing contributor documentation.

When possible, run tests in this sequence:

1. The most focused relevant test.
2. The containing file, package, or module.
3. The affected suite.
4. The full suite when the change is risky, broad, or release-adjacent.

If the full suite is too slow or unavailable, say so directly.

## Reporting Examples

Good report:

```text
Added a regression test for missing required fields in workflow metadata. Ran `pnpm test workflow-schema.test.ts`; passed. Ran `pnpm test`; passed. No E2E tests were run because this change only affects schema validation.
```

Acceptable report with limitation:

```text
Added a focused parser test for malformed frontmatter. Ran `pytest tests/test_parser.py -k malformed_frontmatter`; passed. I did not run the full suite because the repository requires a local service that is not available in this environment.
```

Bad report:

```text
Tests should pass now.
```

The bad report is unacceptable because it does not say what was run, what passed, or what remains uncertain.
