#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const args = parseArgs(process.argv.slice(2));
const repo = path.resolve(args.repo || process.cwd());
const strict = Boolean(args.strict);
const jsonOnly = Boolean(args.json);

const result = {
  repo,
  initiative: null,
  milestone: null,
  finalMilestone: false,
  status: "pass",
  findings: [],
  facts: {},
};

main();

function main() {
  try {
    const initiativePath = resolveInitiativePath(repo, args.initiative);
    result.initiative = initiativePath ? path.relative(repo, initiativePath) : null;

    if (!initiativePath) {
      addFinding("blocking", "Could not identify an initiative path. Pass --initiative or ensure PRODUCT.md names one active initiative.");
      finish();
      return;
    }

    const lifecyclePath = path.join(initiativePath, "initiative.json");
    if (fs.existsSync(lifecyclePath)) {
      const lifecycleScript = path.join(path.dirname(fileURLToPath(import.meta.url)), "initiative-lifecycle.mjs");
      const lifecycleArgs = [
        lifecycleScript,
        "check",
        "--repo",
        repo,
        "--initiative",
        initiativePath,
      ];
      if (args.milestone) lifecycleArgs.push("--milestone", args.milestone);
      if (args.pr) lifecycleArgs.push("--pr", args.pr);
      if (strict) lifecycleArgs.push("--strict");
      if (jsonOnly) lifecycleArgs.push("--json");
      const lifecycleResult = spawnSync(process.execPath, lifecycleArgs, { stdio: "inherit" });
      process.exit(lifecycleResult.status ?? 1);
    }

    const prdPath = path.join(initiativePath, "prd.md");
    const milestonesPath = path.join(initiativePath, "milestones.md");
    const productPath = path.join(repo, "PRODUCT.md");
    const prdText = readMaybe(prdPath);
    const milestonesText = readMaybe(milestonesPath);
    const productText = readMaybe(productPath);

    result.facts.paths = {
      product: fs.existsSync(productPath) ? "PRODUCT.md" : null,
      prd: fs.existsSync(prdPath) ? path.relative(repo, prdPath) : null,
      milestones: fs.existsSync(milestonesPath) ? path.relative(repo, milestonesPath) : null,
    };

    if (!prdText) addFinding("blocking", `Missing ${path.relative(repo, prdPath)}.`);
    if (!milestonesText) addFinding("blocking", `Missing ${path.relative(repo, milestonesPath)}.`);
    if (!milestonesText) {
      finish();
      return;
    }

    const milestones = parseMilestones(milestonesText);
    result.facts.milestones = milestones.map((milestone) => ({
      id: milestone.id,
      title: milestone.title,
      status: milestone.status,
    }));

    const target = findTargetMilestone(milestones, args.milestone);
    if (!target) {
      addFinding("blocking", `Could not find target milestone ${args.milestone || "(last milestone)"} in milestones.md.`);
      finish();
      return;
    }

    result.milestone = target.id;
    result.finalMilestone = target.index === milestones.length - 1;
    result.facts.targetStatus = target.status || null;
    result.facts.prdStatus = extractStatus(prdText);
    result.facts.productMentionsTarget = productText ? mentionsMilestone(productText, target.id) : false;
    result.facts.productMentionsInProgress = productText ? hasInProgressLanguage(productText) : false;
    result.facts.inDoneDirectory = splitPath(initiativePath).includes("done");
    result.facts.inActiveDirectory = splitPath(initiativePath).includes("active");

    if (!result.finalMilestone) {
      if (result.facts.inDoneDirectory) {
        addFinding("warning", `Milestone ${target.id} is not final, but the initiative is already under a done directory.`);
      }
      finish();
      return;
    }

    const targetLooksComplete = hasCompleteLanguage(target.status);
    const targetLooksOpen = hasInProgressLanguage(target.status);
    const prdLooksOpen = hasInProgressLanguage(result.facts.prdStatus);
    const productLooksOpen = result.facts.productMentionsTarget && result.facts.productMentionsInProgress;
    const lifecycleDone = result.facts.inDoneDirectory || hasCompleteLanguage(result.facts.prdStatus);

    if (targetLooksOpen) {
      addFinding("blocking", `Final milestone ${target.id} still has open status: ${target.status || "(none)"}.`);
    }

    if (!targetLooksComplete) {
      addFinding("warning", `Final milestone ${target.id} does not clearly say accepted/completed.`);
    }

    if (prdLooksOpen) {
      addFinding("blocking", `Initiative PRD status still appears open: ${result.facts.prdStatus || "(none)"}.`);
    }

    if (productLooksOpen) {
      addFinding("blocking", `PRODUCT.md still appears to describe ${target.id} as active or in implementation.`);
    }

    if (!lifecycleDone) {
      addFinding("blocking", "Final milestone is targeted, but initiative lifecycle is not clearly completed or moved to done.");
    }

    if (args.pr && !mentionsPr(prdText + "\n" + milestonesText, args.pr)) {
      addFinding("warning", `Could not find PR ${normalizePr(args.pr)} in initiative docs.`);
    }

    finish();
  } catch (error) {
    addFinding("blocking", error instanceof Error ? error.message : String(error));
    finish();
  }
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const token = rawArgs[index];
    if (!token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2);
    if (["strict", "json"].includes(key)) {
      parsed[key] = true;
      continue;
    }
    const value = rawArgs[index + 1];
    if (!value || value.startsWith("--")) {
      parsed[key] = "";
      continue;
    }
    parsed[key] = value;
    index += 1;
  }
  return parsed;
}

function resolveInitiativePath(repoRoot, explicitPath) {
  if (explicitPath) {
    const absolute = path.isAbsolute(explicitPath) ? explicitPath : path.join(repoRoot, explicitPath);
    return fs.existsSync(absolute) ? absolute : null;
  }

  const productText = readMaybe(path.join(repoRoot, "PRODUCT.md"));
  if (productText) {
    const match = productText.match(/docs\/initiatives\/(?:active|backlog|done)\/[A-Za-z0-9._/-]+/);
    if (match) {
      const matchedPath = path.join(repoRoot, match[0]);
      const candidate = fs.existsSync(matchedPath) && fs.statSync(matchedPath).isFile()
        ? path.dirname(matchedPath)
        : matchedPath;
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        return candidate;
      }
    }
  }

  const activeRoot = path.join(repoRoot, "docs", "initiatives", "active");
  if (!fs.existsSync(activeRoot)) {
    return null;
  }
  const candidates = fs.readdirSync(activeRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(activeRoot, entry.name));
  return candidates.length === 1 ? candidates[0] : null;
}

function parseMilestones(text) {
  const headingPattern = /^##\s+(M\d+)\b(.*)$/gim;
  const headings = [...text.matchAll(headingPattern)].map((match) => ({
    id: match[1],
    title: match[2].trim(),
    start: match.index,
  }));

  return headings.map((heading, index) => {
    const next = headings[index + 1];
    const section = text.slice(heading.start, next ? next.start : text.length);
    return {
      ...heading,
      index,
      section,
      status: extractStatus(section),
    };
  });
}

function findTargetMilestone(milestones, targetId) {
  if (!milestones.length) {
    return null;
  }
  if (!targetId) {
    return milestones[milestones.length - 1];
  }
  const normalized = targetId.toUpperCase();
  return milestones.find((milestone) => milestone.id.toUpperCase() === normalized) || null;
}

function extractStatus(text) {
  if (!text) {
    return "";
  }
  const statusMatch = text.match(/(?:^|\n)\s*(?:[-*]\s*)?(?:\*\*)?Status(?:\*\*)?\s*:\s*([^\n]+)/i);
  if (statusMatch) return stripMarkdown(statusMatch[1]);
  const stateMatch = text.match(/(?:^|\n)\s*(?:[-*]\s*)?(?:\*\*)?State(?:\*\*)?\s*:\s*([^\n]+)/i);
  return stateMatch ? stripMarkdown(stateMatch[1]) : "";
}

function stripMarkdown(text) {
  return text.replace(/[*_`]/g, "").trim();
}

function hasInProgressLanguage(text) {
  return /\b(active|in implementation|implementing|in progress|pending|not started|todo|tbd|open)\b/i.test(text || "");
}

function hasCompleteLanguage(text) {
  return /\b(done|complete|completed|accepted|implemented|merged|closed)\b/i.test(text || "");
}

function mentionsMilestone(text, milestoneId) {
  return new RegExp(`\\b${escapeRegExp(milestoneId)}\\b`, "i").test(text || "");
}

function mentionsPr(text, pr) {
  const normalized = normalizePr(pr);
  return new RegExp(`(?:#|pull/|PR\\s*)${escapeRegExp(normalized)}\\b`, "i").test(text || "");
}

function normalizePr(pr) {
  return String(pr).replace(/^#/, "").replace(/^.*\/pull\//, "");
}

function splitPath(filePath) {
  return filePath.split(path.sep).filter(Boolean);
}

function readMaybe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function addFinding(severity, message) {
  result.findings.push({ severity, message });
  if (severity === "blocking") {
    result.status = "blocking";
  } else if (severity === "warning" && result.status === "pass") {
    result.status = "warning";
  }
}

function finish() {
  if (jsonOnly) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    printHumanSummary();
  }
  process.exit(strict && result.status === "blocking" ? 1 : 0);
}

function printHumanSummary() {
  const lines = [
    "Initiative lifecycle check",
    `- Repo: ${result.repo}`,
    `- Initiative: ${result.initiative || "(unknown)"}`,
    `- Milestone: ${result.milestone || "(unknown)"}`,
    `- Final milestone: ${result.finalMilestone ? "yes" : "no"}`,
    `- Status: ${result.status}`,
  ];

  if (result.findings.length) {
    lines.push("", "Findings:");
    for (const finding of result.findings) {
      lines.push(`- ${finding.severity}: ${finding.message}`);
    }
  } else {
    lines.push("", "Findings: none");
  }

  process.stdout.write(`${lines.join("\n")}\n`);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
