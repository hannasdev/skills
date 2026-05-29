# PR Body Examples

Use these examples only when a concrete PR body needs a model for tone,
specificity, or section content. Do not load this reference for routine PR
prep when the default template is enough.

## Good summary examples

Good:

```markdown
## Summary

- Adds a reusable PR description skill.
- Documents the required structure for summary, motivation, implementation, testing, risks, and follow-up.
- Aligns PR descriptions with the repo's existing PR-only workflow.
```

Bad:

```markdown
## Summary

Updated some docs and improved workflow.
```

## Testing section examples

If tests were run:

```markdown
## Testing

- `npm test`
- `npm run lint`
```

If tests were not run:

```markdown
## Testing

- Not run: documentation-only change.
```

If validation was manual:

```markdown
## Testing

- Manually reviewed generated PR description against the branch diff.
```

## Reusable PR bodies

For docs-heavy changes:

```markdown
## Summary

- Clarifies contributor-facing documentation for the targeted workflow.
- Keeps the change scoped to docs and alignment updates only.

## Motivation

The current docs leave room for inconsistent reviewer expectations and repeated follow-up comments.

## Implementation

- Updated the relevant skill and supporting docs.
- Kept behavior changes out of scope.

## Testing

- Not run: documentation-only change.

## Risks and tradeoffs

- Low risk: the main risk is wording drift if related docs are updated separately later.

## Follow-up

- None.
```

For code-heavy changes:

```markdown
## Summary

- Tightens validation for the targeted workflow.
- Adds or updates tests for the affected edge cases.

## Motivation

The previous behavior accepted ambiguous or malformed input, which made failures harder to diagnose during review.

## Implementation

- Added explicit validation for the affected input path.
- Updated tests to cover both successful and failing cases.

## Testing

- `node --test src/test/unit/example.test.mjs`

## Risks and tradeoffs

- Validation is stricter than before, so previously tolerated malformed input now fails fast.

## Follow-up

- None.
```
