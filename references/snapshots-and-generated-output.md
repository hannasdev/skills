# Snapshot Principles

Snapshots are useful for large structured outputs, but dangerous when treated as approval magic.

Use snapshots when:

* The output is large enough that direct assertions would be noisy.
* The output structure matters.
* Reviewing diffs gives meaningful confidence.
* The project already uses snapshots for similar cases.

Avoid snapshots when:

* A direct assertion would be clearer.
* The output contains unstable ordering, timestamps, random IDs, or environment-specific values.
* The snapshot would be updated frequently for unrelated reasons.
* The test failure would be hard to interpret.

## Updating Snapshots

Before updating a snapshot:

1. Inspect the diff.
2. Confirm the changed output is intentional.
3. Explain why the snapshot changed.
4. Avoid broad snapshot updates unless the change is mechanical and clearly understood.

Never update snapshots only to make tests pass.

## Generated Output

Generated output includes files such as:

* Schemas.
* Type definitions.
* API clients.
* Lockfiles.
* Documentation generated from source.
* Build artifacts checked into the repository.
* Protocol or tool manifests.

When generated output changes:

1. Identify the source input that caused the generated change.
2. Regenerate using the project-approved command.
3. Inspect the generated diff.
4. Confirm the generated output matches the intended source change.
5. Run the relevant validation or test command.

Do not hand-edit generated files unless the project explicitly expects that workflow.

## Schemas and Contracts

For schemas, contracts, protocols, or public interfaces, test both acceptance and rejection behavior.

Include tests for:

* Valid minimal input.
* Valid realistic input.
* Missing required fields.
* Invalid field types.
* Unknown or unsupported values when relevant.
* Backward compatibility if existing users depend on the interface.
* Error messages when they are part of the developer experience.

Prefer contract tests when behavior crosses a boundary, such as:

* HTTP APIs.
* CLI output.
* MCP tools.
* Webhooks.
* File formats.
* Generated configuration.
* Serialized metadata.

## Stable Output

Make generated and snapshot output stable where possible.

Control or normalize:

* Timestamps.
* Random IDs.
* Object key ordering.
* Absolute paths.
* Environment-specific values.
* Locale-sensitive formatting.
* Non-deterministic collection ordering.

A snapshot that changes for irrelevant reasons is noise, not safety.

## Reporting Snapshot or Generated Changes

When reporting snapshot or generated output changes, include:

* What changed.
* Why it changed.
* What command regenerated or updated it.
* What validation was run.
* Whether the diff was inspected.

Example:

```text
Updated the workflow schema snapshot after adding the optional `scenePurpose` field. Regenerated with `pnpm generate:schema`, inspected the snapshot diff, and ran `pnpm test workflow-schema.test.ts`; passed.
```
