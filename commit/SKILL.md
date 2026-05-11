---
name: commit
description: Use this skill when preparing, reviewing, or creating git commits. Enforces semantic commit messages using the Conventional Commits format and requires commits to be focused, reviewable, and based on inspected diffs.
---

# Commit Writing Skill

## Purpose

Create clean, focused git commits with semantic commit messages.

A good commit should explain the intent of one coherent change. It should be easy to review, easy to revert, and useful for changelogs or release automation.

Use Conventional Commits syntax:

```text
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

Examples:

```text
feat(router): add fallback model selection
fix(api): preserve manual route overrides
docs(readme): clarify local setup steps
refactor(config): extract provider normalization
feat(router)!: remove legacy routing policy
```

## Hard Rules

* Commit creation: Do not create a commit unless the user has directly requested it using one of these explicit commands: "commit", "prepare a commit", "stage and commit", or similar direct requests.
* Diff inspection: Always inspect the working tree before proposing or creating commits.
* Staged diff inspection: Always inspect the staged diff before writing the final commit message.
* Staging safety: Never stage unrelated changes just to make the working tree clean.
* Scope safety: Never hide unrelated changes inside a broad commit such as `chore: update files`.
* Commit grouping: Split unrelated changes into separate commits, and prefer one commit per logical change.
* History safety: Do not rewrite existing commit history unless the user explicitly asks for history rewriting.
* Amend safety: Do not amend a commit unless the user explicitly asks for an amend.
* Message quality: Do not use vague descriptions such as `update stuff`, `fix bug`, `changes`, `cleanup`, or `wip`.
* Attribution: Do not mention the agent, AI assistant, or tool that generated the commit unless the project explicitly requires it.

## Hard Rules Summary

| Action | Constraint |
|--------|-----------|
| Commit creation | Only on explicit request |
| Inspection | Always inspect working tree and staged diff |
| Staging | Use precise staging; never hide unrelated changes |
| Scope | One logical change per commit; split unrelated changes |
| History | No rewrites or amends without explicit user request |
| Messages | Be specific; avoid vague descriptions |
| Attribution | Omit agent/tool mention unless required |

## Workflow

### 1. Inspect the repository state

Run:

```bash
git status --short
git diff --stat
git diff
```

If files are already staged, also run:

```bash
git diff --cached --stat
git diff --cached
```

Understand what changed before deciding how many commits are needed.

### 2. Identify logical change groups

Group changes by intent, not by file type.

Good commit boundaries:

* A bug fix and its tests.
* A new feature and its documentation.
* A refactor that does not change behavior.
* A test-only improvement.
* A dependency or build configuration change.

Bad commit boundaries:

* A feature mixed with unrelated formatting.
* A bug fix mixed with drive-by cleanup.
* Generated files mixed with hand-written source changes without explanation.
* Multiple unrelated fixes because they happened in the same session.

If there are unrelated changes, recommend or create multiple commits.

### 3. Stage deliberately

Use precise staging.

Prefer:

```bash
git add <specific-files>
git add -p
```

Avoid:

```bash
git add .
git add -A
```

Only use broad staging when the diff has already been inspected and all changes belong in the same commit.

### 4. Choose the commit type

Use one of these types:

* `feat`: Adds or changes product behavior in a user-visible or API-visible way.
* `fix`: Fixes incorrect behavior.
* `docs`: Documentation-only changes.
* `style`: Formatting or style changes that do not affect behavior.
* `refactor`: Code restructuring that does not change behavior.
* `perf`: Performance improvement without changing intended behavior.
* `test`: Adds or updates tests without changing production behavior.
* `build`: Build system, package manager, dependency, or artifact generation changes.
* `ci`: CI/CD pipeline or automation configuration changes.
* `chore`: Maintenance work that does not fit another type.
* `revert`: Reverts a previous commit.

Prefer the most specific type.

Do not use `chore` as a junk drawer. If the change modifies runtime behavior, it is probably not `chore`.

### 5. Choose the optional scope

Use a scope when it makes the affected area clearer.

Good scopes are short, lowercase, and project-specific:

```text
router
api
config
cli
docs
tests
auth
workflow
```

Avoid vague scopes:

```text
misc
stuff
changes
update
```

If no clear scope exists, omit it.

### 6. Write the description

The description must be:

* Lowercase unless using a proper noun.
* Imperative or outcome-focused.
* Specific enough to distinguish the commit from nearby commits.
* No trailing period.
* Ideally 72 characters or fewer.

Good:

```text
fix(router): preserve manual override precedence
feat(cli): add config validation command
docs(setup): explain local environment variables
```

Bad:

```text
fix: bug
feat: added stuff
docs: update docs.
chore: cleanup
```

### 7. Add a body when the title is not enough

Use a body when the commit needs context, trade-offs, or explanation.

The body should explain why the change exists and what decision was made. Do not merely repeat the diff.

Good body:

```text
fix(router): preserve manual override precedence

Manual overrides were previously evaluated after capability defaults,
which allowed automatic routing to replace an explicit user choice.
The router now treats manual overrides as hard constraints before
fallback selection runs.
```

Do not add a body for simple self-explanatory commits.

### 8. Mark breaking changes explicitly

If the change breaks compatibility, mark it with `!` after the type or scope:

```text
feat(router)!: remove legacy routing policy
```

For breaking changes, include a footer explaining the impact:

```text
BREAKING CHANGE: legacy routing policy fields are no longer read from PRD.md.
```

Breaking changes can use any type, not only `feat`.

### 9. Add footers when useful

Use footers for issue references, breaking changes, or structured metadata.

Examples:

```text
Fixes #123
Refs #456
BREAKING CHANGE: environment variables now override local config files.
```

Footer tokens should be machine-readable. Use hyphens instead of spaces, except for `BREAKING CHANGE`.

### 10. Validate before committing

Before creating the commit, check:

* The staged diff contains only the intended logical change.
* The commit type matches the purpose of the change.
* The scope is useful and not vague.
* The description is concrete.
* Any breaking change is marked with `!` and/or `BREAKING CHANGE:`.
* Tests or validation were run when appropriate, or the reason they were not run is known.

If the commit would be misleading, do not create it. Explain the issue and propose a better split or message.

## Message Selection Rules

When multiple types seem possible, choose by primary intent:

* Behavior added: `feat`.
* Behavior corrected: `fix`.
* Behavior unchanged but structure improved: `refactor`.
* Behavior unchanged but speed or resource use improved: `perf`.
* Tests changed only: `test`.
* Documentation changed only: `docs`.
* Build or dependency metadata changed: `build`.
* CI workflow changed: `ci`.
* Formatting only: `style`.
* Repository maintenance only: `chore`.

If a commit includes production code and tests for that code, classify by the production change, not `test`.

If a commit includes code and documentation for the same feature or fix, classify by the code change, not `docs`.

## Revert Commits

For reverts, use:

```text
revert: <original commit subject>
```

The body should identify the reverted commit when possible:

```text
This reverts commit <sha>.
```

Do not use `fix` for a direct revert unless the repository convention explicitly prefers that.

## Examples

### Feature

```text
feat(router): support provider-specific model aliases
```

### Fix

```text
fix(config): keep explicit approval mode during reload
```

### Refactor

```text
refactor(router): extract route scoring into pure function
```

### Tests

```text
test(router): cover fallback selection precedence
```

### Documentation

```text
docs(skill): add commit writing workflow
```

### Build

```text
build(deps): update TypeScript to 5.8
```

### CI

```text
ci(github): run tests before release workflow
```

### Breaking change

```text
feat(config)!: replace route defaults schema

BREAKING CHANGE: `routes.defaultModel` has been replaced by `routing.defaults.model`.
```

## Output Format When Preparing Commits

When asked to propose commits but not create them, respond with:

```text
Suggested commit split:

1. <commit message>
   - Files: <files>
   - Reason: <why these changes belong together>

2. <commit message>
   - Files: <files>
   - Reason: <why these changes belong together>
```

When asked to create commits, state what was committed and include the final commit message. Do not include unnecessary command logs unless they are relevant.

## Failure Modes

Stop and ask for direction only when required:

* The diff contains unrelated changes and staging them safely is not possible.
* The repository has conflicts, merge state, or rebase state.
* Existing staged changes appear to belong to someone else or to a different task.
* The user asked for one commit, but the changes are clearly unrelated and would create a misleading history.

Otherwise, make a best-effort semantic commit based on the inspected diff.
