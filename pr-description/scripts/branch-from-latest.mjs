#!/usr/bin/env node

/* eslint-disable security/detect-possible-timing-attacks -- CLI option parsing does not compare secrets. */

import { execFileSync } from "node:child_process";

function run(cmd, args, options = {}) {
  return execFileSync(cmd, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
}

function runInherit(cmd, args) {
  execFileSync(cmd, args, { stdio: "inherit" });
}

function runSoft(cmd, args) {
  try {
    return { ok: true, output: run(cmd, args) };
  } catch (error) {
    const stderr = error?.stderr ? String(error.stderr).trim() : "";
    const stdout = error?.stdout ? String(error.stdout).trim() : "";
    const message = [stderr, stdout, error?.message].filter(Boolean).join("\n");
    return { ok: false, output: message };
  }
}

function usage() {
  return [
    "Usage: node branch-from-latest.mjs <branch-name> [--base <branch>] [--remote <remote>]",
    "",
    "Creates a new branch from the latest fetched remote base tip.",
    "",
    "Examples:",
    "  node ~/.codex/skills/pr-description/scripts/branch-from-latest.mjs docs/update-guide",
    "  node ~/.codex/skills/pr-description/scripts/branch-from-latest.mjs feat/new-workflow --base main",
  ].join("\n");
}

function parseArgs(argv) {
  const args = {
    branchName: null,
    base: null,
    remote: "origin",
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === "-h" || token === "--help") {
      args.help = true;
      continue;
    }

    if (token === "--base") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Provide --base <branch>.");
      }
      args.base = value;
      i += 1;
      continue;
    }

    if (token === "--remote") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Provide --remote <name>.");
      }
      args.remote = value;
      i += 1;
      continue;
    }

    if (token.startsWith("--")) {
      throw new Error(`Unknown option: ${token}`);
    }

    if (args.branchName) {
      throw new Error(`Unexpected extra argument: ${token}`);
    }

    args.branchName = token;
  }

  return args;
}

function currentBranch() {
  const result = runSoft("git", ["branch", "--show-current"]);
  return result.ok ? result.output : "";
}

function requireCleanWorkingTree() {
  const status = run("git", ["status", "--porcelain"]);
  if (status) {
    throw new Error([
      "Working tree is not clean. Commit, stash, or discard local changes before creating a branch.",
      "",
      status,
    ].join("\n"));
  }
}

function remoteExists(remote) {
  return runSoft("git", ["remote", "get-url", remote]).ok;
}

function defaultBase(remote) {
  const symbolic = runSoft("git", ["symbolic-ref", "--quiet", "--short", `refs/remotes/${remote}/HEAD`]);
  if (symbolic.ok && symbolic.output.startsWith(`${remote}/`)) {
    return symbolic.output.slice(remote.length + 1);
  }

  const remoteHead = runSoft("git", ["remote", "show", remote]);
  const match = remoteHead.output.match(/HEAD branch:\s*(\S+)/);
  if (remoteHead.ok && match) {
    return match[1];
  }

  return "main";
}

function validateBranchName(branchName) {
  if (!branchName) {
    throw new Error(`Missing branch name.\n\n${usage()}`);
  }

  const result = runSoft("git", ["check-ref-format", "--branch", branchName]);
  if (!result.ok) {
    throw new Error(`Invalid branch name: ${branchName}`);
  }
}

function assertBranchDoesNotExist(branchName, remote) {
  if (runSoft("git", ["show-ref", "--verify", "--quiet", `refs/heads/${branchName}`]).ok) {
    throw new Error(`Local branch already exists: ${branchName}`);
  }

  if (runSoft("git", ["show-ref", "--verify", "--quiet", `refs/remotes/${remote}/${branchName}`]).ok) {
    throw new Error(`Remote branch already exists: ${remote}/${branchName}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  validateBranchName(args.branchName);
  run("git", ["rev-parse", "--show-toplevel"]);
  requireCleanWorkingTree();

  if (!remoteExists(args.remote)) {
    throw new Error(`Remote does not exist: ${args.remote}`);
  }

  const base = args.base ?? defaultBase(args.remote);
  assertBranchDoesNotExist(args.branchName, args.remote);

  console.log(`Fetching ${args.remote}/${base}...`);
  runInherit("git", ["fetch", args.remote, base]);

  const remoteBaseRef = `${args.remote}/${base}`;
  const remoteBaseSha = run("git", ["rev-parse", "--short", remoteBaseRef]);
  const beforeBranch = currentBranch() || "(detached)";

  runInherit("git", ["switch", "-c", args.branchName, remoteBaseRef]);

  console.log(`Created ${args.branchName} from ${remoteBaseRef} (${remoteBaseSha}).`);
  console.log(`Previous branch: ${beforeBranch}`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
