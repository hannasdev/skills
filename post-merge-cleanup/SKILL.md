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
3. Branch cleanup: Delete the merged feature branch locally; if `git branch -d` fails due to unmerged changes, stop and report that the branch contains commits not in `main`.
4. Branch cleanup: Delete the remote feature branch only when the user explicitly passes `--delete-remote` or confirms deletion when prompted.
5. Lifecycle verification: If the PR belongs to an initiative with `initiative.json`, verify the merged PR's lifecycle state with read-only tooling before reporting:
   `node $SKILLS_DIR/initiative-completion/scripts/initiative-lifecycle.mjs check --repo <repo> --initiative <initiative-path> --milestone <milestone-id> --pr <number> --strict`
6. Optional lifecycle recording: Record merge state only when the user explicitly requests it or passes `--record-lifecycle`, because this writes `initiative.json` on local `main` and may require a scoped follow-up commit.
7. Verification and report: Verify no unresolved review threads remain on the merged PR, then report final state (branch, sync, thread count, lifecycle result when applicable).

## Non-negotiable rules

- Do not delete a branch before the PR is confirmed merged.
- Do not force-delete local branches by default.
- Do not hard reset local branches in this workflow.
- Do not create a follow-up docs PR only to move an initiative to `done/`; prefer verifying `complete_on_merge` or explicitly recording `complete` in `initiative.json`.
- Do not silently dirty local `main` with lifecycle recording; make merge recording explicit and report whether it created a local diff.
- If cleanup checks fail, stop and report the exact blocker.

## Helper script

Script path:

`$SKILLS_DIR/post-merge-cleanup/scripts/post-merge-cleanup.mjs`

Usage:

```bash
node $SKILLS_DIR/post-merge-cleanup/scripts/post-merge-cleanup.mjs --pr 185 --branch fix/example
```

Optional repository selection (for non-default checkout context):

```bash
node $SKILLS_DIR/post-merge-cleanup/scripts/post-merge-cleanup.mjs --pr 185 --branch fix/example --repo owner/repo
```

Optional remote branch deletion:

```bash
node $SKILLS_DIR/post-merge-cleanup/scripts/post-merge-cleanup.mjs --pr 185 --branch fix/example --delete-remote
```

What it does:

1. Validates PR merged state with `gh pr view`.
2. Switches to `main`, fetches `origin/main`, then fast-forwards from `origin/main`.
3. Deletes local branch with `git branch -d`.
4. Optionally deletes remote branch.
5. Runs the review thread status helper for the PR.
6. For initiative PRs, checks lifecycle state when the initiative path and milestone are known.
7. Records merge/completion state in `initiative.json` only with `--record-lifecycle`.

## Next Skill

End by recommending the next skill:

- If the PR belongs to an initiative, recommend `initiative-completion`.
- If there is no initiative bookkeeping, recommend `initiative-planning` for the next idea when needed.
- If cleanup is blocked, recommend resolving the blocker before starting new implementation work.
