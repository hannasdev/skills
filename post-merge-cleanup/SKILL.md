---
name: post-merge-cleanup
description: Use after a PR merge to standardize local cleanup and post-merge verification.
---

# Post-Merge Cleanup Skill

## Purpose

Run the same post-merge checklist every time so local state stays clean and predictable.

This skill is for actions after a PR is merged into `main`.

## Required process

1. Pre-checks: Confirm the PR is merged and ensure local `main` is checked out.
2. Sync: Fast-forward local `main` from `origin/main`; if fast-forward fails because local `main` has diverged, stop and resolve the divergence manually before continuing.
3. Branch cleanup: Delete the merged feature branch locally.
4. Branch cleanup: Delete the remote feature branch only when it is no longer needed for collaboration.
5. Verification and report: Verify no unresolved review threads remain on the merged PR, then report final state (branch, sync, thread count).

## Non-negotiable rules

- Do not delete a branch before the PR is confirmed merged.
- Do not force-delete local branches by default.
- Do not hard reset local branches in this workflow.
- If cleanup checks fail, stop and report the exact blocker.

## Helper script

Script path:

`skills/post-merge-cleanup/scripts/post-merge-cleanup.mjs`

Usage:

```bash
node skills/post-merge-cleanup/scripts/post-merge-cleanup.mjs --pr 185 --branch fix/example
```

Optional repository selection (for non-default checkout context):

```bash
node skills/post-merge-cleanup/scripts/post-merge-cleanup.mjs --pr 185 --branch fix/example --repo owner/repo
```

Optional remote branch deletion:

```bash
node skills/post-merge-cleanup/scripts/post-merge-cleanup.mjs --pr 185 --branch fix/example --delete-remote
```

What it does:

1. Validates PR merged state with `gh pr view`.
2. Switches to `main`, fetches `origin/main`, then fast-forwards from `origin/main`.
3. Deletes local branch with `git branch -d`.
4. Optionally deletes remote branch.
5. Runs the review thread status helper for the PR.
