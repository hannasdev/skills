---
name: refactoring
description: Safely improve existing code structure without changing external behavior. Use when the user asks to refactor, simplify, clean up, untangle, rename, move, deduplicate, extract, inline, modularize, or prepare code for a later feature through behavior-preserving structural change.
argument-hint: "[target files/modules and refactoring goal]"
---

# Refactoring Skill

Refactoring means changing the internal structure of existing code without changing its externally observable behavior.

The purpose of this skill is to make code easier to understand, safer to change, and cheaper to maintain while preserving behavior.

Do not treat refactoring as a synonym for rewriting, redesigning, optimizing, fixing bugs, or adding features. Those may be valid tasks, but they are not pure refactoring unless behavior stays the same.

## Core rules

**Behavior preservation**
1. Preserve behavior unless the user explicitly asks for behavior change.
2. Separate structural changes from behavioral changes.

**Incremental work**
3. Work in small, reviewable steps.
4. Keep the system passing after each meaningful step.

**Safety and scope**
5. Prefer local, high-confidence improvements over broad speculative redesign.
6. Add or strengthen tests before touching risky or under-tested behavior.
7. Stop when the code is sufficiently clear to meet the stated refactoring goal; do not keep polishing because more cleanup is possible.

## Before editing

First understand the task and classify it:

* Pure refactor: behavior must remain identical.
* Preparatory refactor: structure changes make a planned feature or fix safer.
* Mixed change: the request includes both behavior and structure changes.
* Migration/modernization: a larger architectural shift that needs staged execution.
* Rewrite request: likely not refactoring; call out the risk and propose an incremental alternative.

Then inspect the relevant code path:

* Identify public inputs, outputs, side effects, errors, data contracts, persistence behavior, network calls, and UI-visible behavior.
* Find the smallest safe change surface.
* Locate existing tests that cover the behavior.
* Run the most relevant tests before editing when practical.
* If tests are absent or weak, add characterization tests for the existing behavior before changing structure.

If the behavior is unclear, do not invent intent. Preserve observed behavior and name the uncertainty.

## Planning the refactor

State a short plan before making non-trivial edits:

* Target area.
* Refactoring goal.
* Safety mechanism: existing tests, new characterization tests, type checks, build, lint, or manual verification.
* Expected sequence of small changes.
* What is intentionally out of scope.

For very small local cleanup, proceed directly but still preserve behavior.

## Safe refactoring workflow

Use this loop:

1. Establish baseline: inspect current behavior and run relevant checks if available.
2. Add safety net: add or improve tests when behavior is important and not covered.
3. Make one structural change.
4. Run the narrowest relevant verification.
5. Review the diff for accidental behavior changes.
6. Repeat only while each step has clear value.
7. Run broader verification before finishing.
8. Summarize exactly what changed and what was verified.

A good refactor should be boring to review. If the diff is exciting, it is probably too large.

## Choosing refactorings

Prefer simple, mechanical refactorings first:

* Rename unclear variables, functions, classes, files, or modules.
* Extract function or method.
* Inline unnecessary indirection.
* Move code closer to where it belongs.
* Split long functions by responsibility.
* Remove duplication after confirming duplicated behavior is truly equivalent.
* Replace complex conditionals with clearer guard clauses or named predicates.
* Introduce types or interfaces where they clarify existing contracts.
* Encapsulate repeated data access or side-effect boundaries.
* Simplify imports, dead branches, or unreachable code only when verified.

Avoid high-risk refactorings unless specifically justified:

* Broad rewrites.
* Framework migrations.
* Changing persistence schemas.
* Changing public APIs.
* Changing error behavior.
* Changing async/concurrency behavior.
* Changing caching, batching, or transaction boundaries.
* Reformatting large files unrelated to the refactor.
* Combining cleanup with performance optimization.

## Tests and verification

Pure refactoring should normally pass the same tests before and after.

If tests already exist:

* Run the narrowest relevant tests first.
* Run broader tests after significant edits.
* Do not update assertions merely to match changed behavior unless the user requested a behavior change.

If tests are missing:

* Add characterization tests around the behavior being protected.
* Prefer tests at the level where behavior is observable.
* Cover edge cases currently handled by the code, even if the behavior looks odd.
* Avoid overbuilding a full test suite before a small refactor; protect the change surface.

For UI, CLI, API, persistence, or integration behavior, include at least one verification path that observes the external contract.

## Handling mixed requests

When a request mixes refactoring with feature work or bug fixing:

1. Split the work into phases.
2. Do structural changes first only when they clearly reduce risk or make the behavior change simpler.
3. Keep structural commits separate from behavioral commits when possible.
4. If both must happen in one patch, keep the diff organized and explain which parts are structural and which parts change behavior.

Do not hide behavior changes inside a refactoring summary. That is how small dragons become production incidents.

## Large-scale refactoring

For changes touching many files, APIs, modules, packages, or services:

* Prefer incremental migration over big-bang replacement.
* Introduce an abstraction seam when old and new implementations must coexist.
* Migrate callers gradually.
* Keep the system buildable and releasable throughout.
* Use automated transforms where the change is repetitive and mechanical.
* Split into reviewable slices by module, call site group, or dependency direction.
* Track remaining migration work explicitly.
* Remove temporary abstractions, compatibility layers, or dual paths when the migration is complete.

If a large refactor cannot be made safe incrementally, pause and explain the risk instead of charging into the fog with a lantern and vibes.

## Guardrails

Stop and ask or clearly flag the issue before proceeding when:

* The requested change would alter external behavior.
* The public contract is unclear and cannot be characterized.
* Tests fail before editing and the failure is relevant.
* The refactor requires deleting code whose usage is uncertain.
* The change crosses service, package, schema, or API boundaries.
* The safest path requires a behavior change, migration, or deprecation plan.

Do not ask for clarification when the safe path is obvious. Make the smallest safe assumption and state it.

## Diff review checklist

Before finishing, review the diff and check:

* No unintended changes to inputs, outputs, side effects, errors, persistence, network behavior, permissions, timing-sensitive behavior, or user-visible text.
* No unrelated formatting churn.
* Names are clearer, not merely different.
* Extracted functions have cohesive responsibilities.
* Indirection was reduced or justified.
* Removed code is actually unused or unreachable.
* Tests either already covered the behavior or were added where needed.
* Verification commands were run, or limitations are stated honestly.

## Output format

When reporting back, include:

* What was refactored.
* What behavior was preserved.
* What tests or checks were run.
* Any risks, gaps, or follow-up work.

Use concise language. Do not oversell cleanliness. The goal is safer change, not architectural perfume.

## Commit guidance

When committing refactoring work:

* Keep pure refactors separate from feature or bug-fix commits when practical.
* Use commit messages that describe the structural change, not vague cleanup.
* Good examples:

  * `refactor: extract invoice normalization helper`
  * `refactor: move route validation into request parser`
  * `refactor: replace duplicated retry logic with shared utility`
* Avoid vague messages:

  * `cleanup`
  * `misc fixes`
  * `make code better`

## What not to do

Do not:

* Rewrite working code because it offends aesthetic sensibilities.
* Introduce new abstractions without immediate use.
* Refactor code unrelated to the requested task.
* Change behavior and call it refactoring.
* Remove tests because they are inconvenient.
* Ignore failing tests.
* Update snapshots blindly without understanding why they changed.
* Use broad search-and-replace when language-aware tooling is needed.
* Create clever code. Clear code is better; clever code is just technical debt wearing a tiny crown.
