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

### Commit Creation and Inspection
* Do not create a commit unless the user has directly requested it using explicit commands like "commit", "prepare a commit", "stage and commit", "create a commit", or equivalent phrases that unmistakably indicate intent to create a commit. Ambiguous requests like "save this" or "finalize" do not qualify.
* Higher-level workflow skills may grant scoped commit authorization in their own instructions. `initiative-activation`, `milestone-implementation`, `review-comments`, and lifecycle-transition tooling count as explicit authorization only for the focused commit required by that workflow.
* Always inspect the working tree before proposing or creating commits.
* Always inspect the staged diff before writing the final commit message.

### Staging and Scope
* Never stage unrelated changes just to make the working tree clean.
* Never hide unrelated changes inside a broad commit such as `chore: update files`.
* Split unrelated changes into separate commits, and prefer one commit per logical change.

### History and Message Quality
* Do not rewrite existing commit history unless the user explicitly asks for history rewriting.
* Do not amend a commit unless the user explicitly asks for an amend.
* Do not use vague descriptions such as `update stuff`, `fix bug`, `changes`, `cleanup`, or `wip`.

### Attribution and Sign-off
* Do not mention the agent, AI assistant, or tool that generated the commit unless the project explicitly requires it.
* By default, create commits with DCO sign-off (`Signed-off-by:`) using `git commit -s`. Only skip sign-off if the repository explicitly uses a different legal attestation model (for example CLA-only) or the user explicitly requests otherwise.

## Quick Rules

| |
|-|
| Explicit request only, except scoped commits authorized by workflow skills |
| Inspect working tree and staged diff always |
| Precise staging; never hide unrelated changes |
| One logical change per commit; split unrelated changes |
| No rewrites or amends without explicit user request |
| Be specific; avoid vague descriptions |
| Omit agent/tool mention unless required |
| Default to `git commit -s`; skip only if CLA/different model |
| Check for detached HEAD or merge conflicts |
| Separate submodules and binary/large files |
| Mark breaking changes with `!` and footer |

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

Check for error conditions:
- Detached HEAD state: notify user and guide to checkout a branch.
- Conflicted working tree (merge in progress): notify user to resolve conflicts.

Understand what changed before deciding how many commits are needed.

### 2. Identify logical change groups

Group by intent, not file type.

**Good:** bug fix + tests, new feature + docs, refactor, test-only, or dependency update.
**Bad:** feature + unrelated formatting, fix + cleanup, generated files + source, multiple unrelated fixes.

**Special:** For submodules, use `git diff --submodule` and document changes in commit body. For large/binary files, separate from logical feature commits and explain in body.

### 3. Stage deliberately

Use precise staging: `git add <specific-files>` or `git add -p`. Avoid `git add .` or `git add -A` unless diff is fully inspected and all changes belong in one commit.

When creating the commit: `git commit -s -m "<type>(<scope>): <description>"`

### 4. Choose the commit type

Choose by primary intent:

* `feat`: Adds or changes user-visible behavior. Example: `feat(router): add fallback model selection`
* `fix`: Fixes incorrect behavior. Example: `fix(api): preserve manual route overrides`
* `refactor`: Restructures code without changing behavior. Example: `refactor(config): extract provider normalization`
* `perf`: Improves speed or resource use. Example: `perf(router): cache model aliases`
* `test`: Adds or updates tests only. Example: `test(router): cover fallback precedence`
* `docs`: Documentation only. Example: `docs(readme): clarify setup steps`
* `build`: Dependencies, build system, artifacts. Example: `build(deps): update TypeScript to 5.8`
* `ci`: CI/CD or automation. Example: `ci(github): run tests before release`
* `style`: Formatting only. Example: `style: reformat comments`
* `chore`: Maintenance that doesn't fit above. Don't use as junk drawer.
* `revert`: Reverts a commit. Example: `revert: <original subject>` with body `This reverts commit <sha>.`

**When multiple types fit, classify by production code change, not test/docs.**

If the user provides invalid type or scope, list valid options and ask for clarification.

### 5. Choose the optional scope

Use a scope when it clarifies the affected area. Good: `router`, `api`, `config`, `cli`, `docs`, `tests`, `auth`. Avoid vague scopes: `misc`, `stuff`, `changes`, `update`. Omit if unclear.

### 6. Write the description

Must be: lowercase (except proper nouns), imperative, specific, no period, ~72 chars or fewer.

✓ `fix(router): preserve manual override precedence`
✗ `fix: bug` or `feat: added stuff` or `docs: update docs.`

### 7. Add a body when needed

Use a body to explain **why** the change exists and **what decision** was made (not merely repeating the diff). Skip for simple self-explanatory commits.

### 8. Mark breaking changes

Use `!` after type/scope: `feat(router)!: remove legacy routing policy`. Include footer: `BREAKING CHANGE: legacy routing policy fields are no longer read.` (Any type can be breaking, not just `feat`.)

### 9. Add footers

Use footers for issue references and metadata: `Fixes #123`, `Refs #456`, `BREAKING CHANGE: <description>`. Keep tokens machine-readable (hyphens, not spaces).

### 10. Validate before committing

- Staged diff matches intent (one logical change only).
- Type and scope are accurate and specific.
- Description is concrete and distinctive.
- Breaking change marked with `!` and footer.
- `Signed-off-by:` included (default).
- Tests run or reason documented.

If misleading, explain the issue and propose a better split or message.

## Output Format

**When proposing (not creating):**
```text
Suggested commits:
1. <message> — Files: <files> — Reason: <why>
2. <message> — Files: <files> — Reason: <why>
```

**When creating:** State what was committed and show the final message.

## When to Ask for Direction

Stop only if:
- Unrelated changes can't be safely staged separately.
- Repository has conflicts/merge/rebase state.
- Staged changes appear to belong to someone else or different task.
- User wants one commit, but changes are clearly unrelated.

Otherwise, make a best-effort semantic commit from the diff.

## Next Skill

End by recommending the next skill:

- After an implementation commit, recommend `milestone-conformance-review` for initiative-based work.
- After a conformance/adversarial fix commit, recommend rerunning the review skill that requested the fix.
- Before opening or updating a PR, recommend `pre-pr-adversary-review`, then `pr-description`.
