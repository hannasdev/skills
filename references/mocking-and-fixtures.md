# Mocking Principles

Use mocks when they reduce complexity without hiding the behavior being tested.

Good mock targets include:

* Network APIs.
* File system boundaries when the file contents are not the point of the test.
* Clocks and time.
* Randomness.
* Slow external services.
* Authentication or credential providers.
* Third-party SDKs where the project already uses test doubles.

Avoid mocks that replace the logic under test. A test should not prove only that a mock returns what the mock was told to return.

## Prefer Determinism

Tests should be repeatable.

Avoid:

* Real sleeps.
* Timing assumptions.
* Test-order dependency.
* Shared mutable global state.
* Real network calls.
* Real credentials.
* Random values without fixed seeds.
* System time without clock control.

Prefer:

* Fake timers.
* Injected clocks.
* Temporary directories.
* Local in-memory services.
* Stable fixture data.
* Explicit setup and teardown.

## Fixture Guidance

Fixtures should be:

* Minimal.
* Named clearly.
* Close to the tests that use them unless shared broadly.
* Updated deliberately.
* Structured around behavior, not arbitrary production examples.

Do not copy large production payloads into fixtures. Keep only the fields needed to prove the behavior.

## Test Data and Privacy

Do not introduce:

* Real secrets.
* Production tokens.
* Customer data.
* Private logs.
* Personal data.
* Internal incident data unless explicitly sanitized and appropriate for the repository.

Use synthetic data. If realistic shape is needed, anonymize it and remove irrelevant fields.

## Assertions

Prefer specific assertions over broad truthiness checks.

Assert the exact behavior that matters:

* Returned value.
* Status code.
* Error type or message.
* Emitted event.
* Written file contents.
* API response shape.
* Validation result.
* Side effect.

Avoid assertions that only prove the code ran without checking meaningful output.

## Anti-Patterns

Avoid:

* Mocking the function being tested.
* Testing private implementation details when public behavior is available.
* Building large fixtures where a small object would do.
* Using snapshots for small values better checked with direct assertions.
* Adding sleeps to fix race conditions.
* Sharing mutable fixtures across tests.
* Allowing tests to pass only when run in a specific order.

## When A Mock Is Suspicious

Reconsider the mock if:

* The mock duplicates the implementation logic.
* The assertion only checks that the mock was called.
* The test would still pass if the real behavior were broken.
* The mock setup is more complex than the behavior being tested.
* The test fails after harmless internal refactoring.

Prefer testing through a stable public boundary when practical.
