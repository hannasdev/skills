#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

function parseArgs(argv) {
  const args = {
    base: "main",
    json: false,
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
        throw new Error("Provide --base <ref>.");
      }
      args.base = value;
      i += 1;
      continue;
    }

    if (token === "--json") {
      args.json = true;
      continue;
    }

    throw new Error(`Unknown argument: ${token}`);
  }

  return args;
}

function run(cmd, args, options = {}) {
  return execFileSync(cmd, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
}

function runSoft(cmd, args, options = {}) {
  try {
    return { ok: true, output: run(cmd, args, options) };
  } catch (error) {
    const stderr = error?.stderr ? String(error.stderr).trim() : "";
    const stdout = error?.stdout ? String(error.stdout).trim() : "";
    const message = [stderr, stdout, error?.message].filter(Boolean).join("\n");
    return { ok: false, output: message };
  }
}

function printHelp() {
  console.log([
    "pr-prep.mjs",
    "",
    "Usage:",
    "  node /Users/hanna/.codex/skills/pr-description/scripts/pr-prep.mjs [--base main] [--json]",
    "",
    "Reports read-only PR preparation context for PR descriptions, release-log entries, reviews, and commit planning.",
  ].join("\n"));
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function splitLines(text) {
  return String(text ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
}

function parseNameStatus(text) {
  return splitLines(text).map((line) => {
    const [status, ...rest] = line.split(/\s+/);
    return { status, file: rest.join(" ") };
  });
}

function classifyFile(file) {
  const normalized = file.replaceAll("\\", "/");
  const lower = normalized.toLowerCase();

  if (lower.includes("/test/") || lower.includes("/tests/") || lower.endsWith(".test.mjs") || lower.endsWith(".test.js") || lower.endsWith(".spec.js")) {
    return "tests";
  }
  if (lower.endsWith(".md") || lower.startsWith("docs/") || lower === "readme.md" || lower === "product.md" || lower === "maintainers.md") {
    return "docs";
  }
  if (lower.startsWith(".github/")) {
    return "ci";
  }
  if (lower === "package.json" || lower === "package-lock.json" || lower === "pnpm-lock.yaml" || lower === "yarn.lock") {
    return "package";
  }
  if (lower.endsWith(".js") || lower.endsWith(".mjs") || lower.endsWith(".ts") || lower.endsWith(".tsx") || lower.endsWith(".jsx")) {
    return "source";
  }
  return "other";
}

function groupChangedFiles(files) {
  const groups = {
    source: [],
    tests: [],
    docs: [],
    ci: [],
    package: [],
    other: [],
  };

  for (const entry of files) {
    groups[classifyFile(entry.file)].push(entry);
  }

  return groups;
}

function discoverPackageScripts(root) {
  const pkg = readJsonFile(path.join(root, "package.json"));
  if (!pkg?.scripts || typeof pkg.scripts !== "object") {
    return [];
  }

  const preferred = [
    "check:pr",
    "check:static",
    "test",
    "test:unit",
    "test:integration",
    "lint",
    "docs",
    "check:docs",
  ];

  return preferred
    .filter((name) => Object.hasOwn(pkg.scripts, name))
    .map((name) => ({ name, command: `npm run ${name}` }));
}

function detectPrNumber() {
  const result = runSoft("gh", ["pr", "view", "--json", "number,url,title", "--jq", "{number: .number, url: .url, title: .title}"]);
  if (!result.ok || !result.output) {
    return null;
  }

  try {
    return JSON.parse(result.output);
  } catch {
    return null;
  }
}

function safeFileExists(root, relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function buildReport(args) {
  const root = run("git", ["rev-parse", "--show-toplevel"]);
  const branch = run("git", ["branch", "--show-current"]);
  const mergeBaseResult = runSoft("git", ["merge-base", "HEAD", args.base]);
  const diffBase = mergeBaseResult.ok && mergeBaseResult.output ? mergeBaseResult.output : args.base;

  const statusShort = runSoft("git", ["status", "--short"]).output;
  const diffStat = runSoft("git", ["diff", "--stat", `${diffBase}...HEAD`]).output;
  const nameStatus = runSoft("git", ["diff", "--name-status", `${diffBase}...HEAD`]).output;
  const commits = runSoft("git", ["log", "--oneline", `${diffBase}..HEAD`]).output;
  const stagedStat = runSoft("git", ["diff", "--cached", "--stat"]).output;

  const changedFiles = parseNameStatus(nameStatus);
  const groups = groupChangedFiles(changedFiles);
  const changedPaths = changedFiles.map((entry) => entry.file);
  const packageScripts = discoverPackageScripts(root);
  const pr = detectPrNumber();

  const releaseLogTouched = changedPaths.includes("release-log.md") || changedPaths.includes("CHANGELOG.md");
  const productTouched = changedPaths.some((file) => ["PRODUCT.md", "README.md", "MAINTAINERS.md"].includes(file) || file.startsWith("docs/foundations/") || file.startsWith("docs/initiatives/"));
  const userFacingLikely = groups.docs.length > 0 || groups.source.length > 0 || groups.package.length > 0 || productTouched;

  return {
    root,
    branch,
    base: args.base,
    diffBase,
    pr,
    statusShort: splitLines(statusShort),
    diffStat: splitLines(diffStat),
    stagedStat: splitLines(stagedStat),
    commits: splitLines(commits),
    changedFiles,
    groups,
    packageScripts,
    repositoryDocs: {
      product: safeFileExists(root, "PRODUCT.md"),
      readme: safeFileExists(root, "README.md"),
      maintainers: safeFileExists(root, "MAINTAINERS.md"),
      releaseLog: safeFileExists(root, "release-log.md") || safeFileExists(root, "CHANGELOG.md"),
    },
    prompts: {
      releaseLogLikelyNeeded: userFacingLikely && !releaseLogTouched,
      productAlignmentCheck: productTouched || userFacingLikely,
      stagedChangesPresent: splitLines(stagedStat).length > 0,
    },
  };
}

function formatList(items, empty = "None") {
  if (!items || items.length === 0) {
    return [`- ${empty}`];
  }
  return items.map((item) => `- ${item}`);
}

function formatFileEntries(entries) {
  if (!entries || entries.length === 0) {
    return ["- None"];
  }
  return entries.map((entry) => `- ${entry.status} ${entry.file}`);
}

function printMarkdown(report) {
  const lines = [];
  lines.push("# PR Prep Report");
  lines.push("");
  lines.push(`- Repository: ${report.root}`);
  lines.push(`- Branch: ${report.branch || "(detached)"}`);
  lines.push(`- Base: ${report.base}`);
  if (report.pr) {
    lines.push(`- Current PR: #${report.pr.number} ${report.pr.title}`);
    lines.push(`- PR URL: ${report.pr.url}`);
  } else {
    lines.push("- Current PR: not detected");
  }
  lines.push("");

  lines.push("## Working Tree");
  lines.push(...formatList(report.statusShort, "Clean"));
  lines.push("");

  lines.push("## Branch Diff Stat");
  lines.push(...formatList(report.diffStat, "No branch diff against base"));
  lines.push("");

  lines.push("## Changed Files");
  for (const [name, entries] of Object.entries(report.groups)) {
    if (entries.length === 0) continue;
    lines.push(`### ${name}`);
    lines.push(...formatFileEntries(entries));
    lines.push("");
  }
  if (report.changedFiles.length === 0) {
    lines.push("- None");
    lines.push("");
  }

  lines.push("## Commits Since Base");
  lines.push(...formatList(report.commits, "None"));
  lines.push("");

  lines.push("## Staged Diff");
  lines.push(...formatList(report.stagedStat, "No staged changes"));
  lines.push("");

  lines.push("## Suggested Validation Commands");
  if (report.packageScripts.length === 0) {
    lines.push("- No package scripts detected");
  } else {
    for (const script of report.packageScripts) {
      lines.push(`- \`${script.command}\``);
    }
  }
  lines.push("");

  lines.push("## Follow-up Prompts");
  lines.push(`- Release-log likely needed: ${report.prompts.releaseLogLikelyNeeded ? "yes" : "no"}`);
  lines.push(`- Product/doc alignment check: ${report.prompts.productAlignmentCheck ? "yes" : "no"}`);
  lines.push(`- Staged changes present: ${report.prompts.stagedChangesPresent ? "yes" : "no"}`);

  console.log(lines.join("\n"));
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const report = buildReport(args);
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printMarkdown(report);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`pr-prep failed: ${message}`);
  process.exit(1);
}
