#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = parseArgs(process.argv.slice(2));
const command = args._[0] || "status";
const repo = path.resolve(args.repo || process.cwd());
const strict = Boolean(args.strict);
const jsonOnly = Boolean(args.json);

const milestoneStates = new Set([
  "not_started",
  "active",
  "implemented",
  "conformance_reviewed",
  "adversarially_reviewed",
  "pr_opened",
  "complete_on_merge",
  "merged",
  "deferred",
]);
const initiativeStates = new Set(["backlog", "active", "complete_on_merge", "complete", "deferred"]);

main();

function main() {
  try {
    if (command === "help" || args.help) {
      printHelp();
      return;
    }

    const initiativePath = resolveInitiativePath(repo, args.initiative);
    if (!initiativePath) {
      fail("Could not identify an initiative path. Pass --initiative <path>.");
      return;
    }

    const lifecyclePath = path.join(initiativePath, "initiative.json");
    const lifecycle = loadOrCreateLifecycle(lifecyclePath, initiativePath);

    switch (command) {
      case "activate":
        activate(lifecycle, initiativePath);
        saveAndReport(lifecyclePath, lifecycle, "activated");
        break;
      case "start-milestone":
        startMilestone(lifecycle);
        saveAndReport(lifecyclePath, lifecycle, "milestone started");
        break;
      case "mark-implemented":
        updateMilestone(lifecycle, targetMilestone(lifecycle), {
          state: "implemented",
          implemented: true,
        });
        saveAndReport(lifecyclePath, lifecycle, "milestone implemented");
        break;
      case "record-conformance":
        updateMilestone(lifecycle, targetMilestone(lifecycle), {
          state: nextState(lifecycle, "conformance_reviewed"),
          conformanceReviewed: true,
          conformanceReviewedAt: args.date || today(),
        });
        saveAndReport(lifecyclePath, lifecycle, "conformance recorded");
        break;
      case "record-adversarial-review":
        updateMilestone(lifecycle, targetMilestone(lifecycle), {
          state: nextState(lifecycle, "adversarially_reviewed"),
          adversariallyReviewed: true,
          adversariallyReviewedAt: args.date || today(),
        });
        saveAndReport(lifecyclePath, lifecycle, "adversarial review recorded");
        break;
      case "record-pr-opened":
        requirePr(args.pr, "--pr is required for record-pr-opened.");
        updateMilestone(lifecycle, targetMilestone(lifecycle), {
          state: args["complete-on-merge"] ? "complete_on_merge" : "pr_opened",
          pr: parsePrNumber(args.pr),
          openedAt: args.date || today(),
        });
        if (args["complete-on-merge"]) {
          lifecycle.state = "complete_on_merge";
          lifecycle.completedByPr = parsePrNumber(args.pr);
        }
        saveAndReport(lifecyclePath, lifecycle, "PR opened");
        break;
      case "mark-complete-on-merge":
        requirePr(args.pr, "--pr is required for mark-complete-on-merge.");
        updateMilestone(lifecycle, targetMilestone(lifecycle), {
          state: "complete_on_merge",
          pr: parsePrNumber(args.pr),
        });
        lifecycle.state = "complete_on_merge";
        lifecycle.completedByPr = parsePrNumber(args.pr);
        saveAndReport(lifecyclePath, lifecycle, "marked complete on merge");
        break;
      case "record-merged":
        recordMerged(lifecycle);
        saveAndReport(lifecyclePath, lifecycle, "merge recorded");
        break;
      case "defer-milestone":
        updateMilestone(lifecycle, targetMilestone(lifecycle), {
          state: "deferred",
          deferredAt: args.date || today(),
          deferredReason: args.reason || "Deferred by workflow decision.",
        });
        if (args.milestone === lifecycle.currentMilestone) {
          lifecycle.currentMilestone = nextOpenMilestone(lifecycle);
        }
        saveAndReport(lifecyclePath, lifecycle, "milestone deferred");
        break;
      case "status":
        report(statusPayload(lifecyclePath, lifecycle, checkLifecycle(lifecyclePath, lifecycle)));
        break;
      case "check": {
        const checked = checkLifecycle(lifecyclePath, lifecycle);
        report(statusPayload(lifecyclePath, lifecycle, checked));
        process.exit(strict && checked.status === "blocking" ? 1 : 0);
        break;
      }
      default:
        fail(`Unknown command: ${command}`);
    }
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}

function activate(lifecycle, initiativePath) {
  lifecycle.slug = args.slug || lifecycle.slug || path.basename(initiativePath);
  lifecycle.state = "active";
  lifecycle.currentMilestone = args.milestone || args["current-milestone"] || lifecycle.currentMilestone || firstMilestoneId(lifecycle);
  ensureMilestonesFromMarkdown(lifecycle, initiativePath);
  if (lifecycle.currentMilestone) {
    updateMilestone(lifecycle, lifecycle.currentMilestone, { state: "active", startedAt: args.date || today() });
  }
}

function startMilestone(lifecycle) {
  const id = args.milestone || args["current-milestone"];
  requireValue(id, "--milestone is required for start-milestone.");
  lifecycle.state = lifecycle.state === "complete" ? "active" : lifecycle.state || "active";
  lifecycle.currentMilestone = id;
  updateMilestone(lifecycle, id, { state: "active", startedAt: args.date || today() });
}

function recordMerged(lifecycle) {
  const id = targetMilestone(lifecycle);
  const existing = milestone(lifecycle, id);
  const pr = args.pr || existing.pr || lifecycle.completedByPr;
  requirePr(pr, "--pr is required for record-merged unless already recorded.");
  const mergedAt = args.date || args["merged-at"] || today();
  updateMilestone(lifecycle, id, {
    state: "merged",
    implemented: true,
    pr: parsePrNumber(pr),
    mergedAt,
  });

  if (args.complete || lifecycle.state === "complete_on_merge") {
    lifecycle.state = "complete";
    lifecycle.completedByPr = parsePrNumber(pr);
    lifecycle.completedAt = mergedAt;
    lifecycle.currentMilestone = id;
  } else {
    lifecycle.currentMilestone = nextOpenMilestone(lifecycle);
  }
}

function loadOrCreateLifecycle(lifecyclePath, initiativePath) {
  if (fs.existsSync(lifecyclePath)) {
    return JSON.parse(fs.readFileSync(lifecyclePath, "utf8"));
  }

  const lifecycle = {
    schemaVersion: 1,
    slug: args.slug || path.basename(initiativePath),
    state: "backlog",
    currentMilestone: args.milestone || args["current-milestone"] || null,
    milestones: {},
  };

  ensureMilestonesFromMarkdown(lifecycle, initiativePath);
  return lifecycle;
}

function ensureMilestonesFromMarkdown(lifecycle, initiativePath) {
  lifecycle.milestones ||= {};
  const milestoneIds = parseMilestoneIds(readMaybe(path.join(initiativePath, "milestones.md")));
  for (const id of milestoneIds) {
    lifecycle.milestones[id] ||= { state: "not_started" };
  }
  if (!lifecycle.currentMilestone && milestoneIds.length) {
    lifecycle.currentMilestone = milestoneIds[0];
  }
}

function checkLifecycle(lifecyclePath, lifecycle) {
  const findings = [];
  const initiativePath = path.dirname(lifecyclePath);
  const milestonesText = readMaybe(path.join(initiativePath, "milestones.md"));
  const prdText = readMaybe(path.join(initiativePath, "prd.md"));
  const milestoneSections = parseMilestoneSections(milestonesText);

  if (args.pr && !isPrNumber(args.pr)) {
    add(findings, "blocking", `Invalid PR number supplied to check: ${args.pr}.`);
  }
  if (lifecycle.schemaVersion !== 1) {
    add(findings, "warning", "initiative.json should include schemaVersion: 1.");
  }
  if (!lifecycle.slug) {
    add(findings, "blocking", "initiative.json must include slug.");
  }
  if (!initiativeStates.has(lifecycle.state)) {
    add(findings, "blocking", `Invalid initiative state: ${lifecycle.state || "(missing)"}.`);
  }
  if (!lifecycle.milestones || typeof lifecycle.milestones !== "object") {
    add(findings, "blocking", "initiative.json must include a milestones object.");
  }

  for (const [id, entry] of Object.entries(lifecycle.milestones || {})) {
    if (!milestoneStates.has(entry.state)) {
      add(findings, "blocking", `Milestone ${id} has invalid state: ${entry.state || "(missing)"}.`);
    }
    if (["pr_opened", "complete_on_merge", "merged"].includes(entry.state) && !isPrNumber(entry.pr)) {
      add(findings, "blocking", `Milestone ${id} has state ${entry.state} but is missing a valid numeric pr.`);
    }
    if (entry.state === "merged") {
      if (!entry.mergedAt) add(findings, "blocking", `Merged milestone ${id} is missing mergedAt.`);
    }
    if (args.pr && isPrNumber(entry.pr) && isPrNumber(args.pr) && parsePrNumber(entry.pr) !== parsePrNumber(args.pr) && (!args.milestone || args.milestone === id)) {
      add(findings, "blocking", `Milestone ${id} records PR ${entry.pr}, but --pr ${args.pr} was supplied.`);
    }
    if (entry.state === "deferred" && (entry.implemented || entry.mergedAt)) {
      add(findings, "warning", `Deferred milestone ${id} also has implemented or merged evidence.`);
    }

    const section = milestoneSections.get(id) || "";
    const markdownStatus = extractStatus(section);
    if (entry.state === "merged" && hasOpenLanguage(markdownStatus)) {
      add(findings, "blocking", `milestones.md contradicts JSON: ${id} is merged in JSON but status appears open.`);
    }
    if (entry.state === "deferred" && hasUncheckedLifecycleBox(section)) {
      add(findings, "warning", `milestones.md represents deferred milestone ${id} as an unchecked lifecycle box.`);
    }
  }

  if (lifecycle.currentMilestone) {
    const current = lifecycle.milestones?.[lifecycle.currentMilestone];
    if (!current) {
      add(findings, "blocking", `currentMilestone ${lifecycle.currentMilestone} is not present in milestones.`);
    } else if (current.state === "merged" && lifecycle.state !== "complete") {
      add(findings, "blocking", "currentMilestone cannot point to a merged milestone unless the initiative is complete.");
    }
  } else if (lifecycle.state !== "complete") {
    add(findings, "warning", "Non-complete initiative has no currentMilestone.");
  }

  if (lifecycle.state === "complete") {
    if (!isPrNumber(lifecycle.completedByPr)) add(findings, "blocking", "Complete initiative is missing a valid numeric completedByPr.");
    if (!lifecycle.completedAt) add(findings, "blocking", "Complete initiative is missing completedAt.");
    if (args.pr && isPrNumber(lifecycle.completedByPr) && isPrNumber(args.pr) && parsePrNumber(lifecycle.completedByPr) !== parsePrNumber(args.pr)) {
      add(findings, "blocking", `Initiative completedByPr is ${lifecycle.completedByPr}, but --pr ${args.pr} was supplied.`);
    }
    const incomplete = Object.entries(lifecycle.milestones || {})
      .filter(([, entry]) => !["merged", "deferred"].includes(entry.state))
      .map(([id]) => id);
    if (incomplete.length) {
      add(findings, "blocking", `Complete initiative has incomplete milestones: ${incomplete.join(", ")}.`);
    }
    if (hasOpenLanguage(extractStatus(prdText))) {
      add(findings, "blocking", "prd.md contradicts JSON: initiative is complete in JSON but status appears open.");
    }
  }

  if (lifecycle.state === "complete_on_merge" && !isPrNumber(lifecycle.completedByPr)) {
    add(findings, "blocking", "complete_on_merge initiative is missing a valid numeric completedByPr.");
  }

  const allClosed = Object.values(lifecycle.milestones || {}).length > 0
    && Object.values(lifecycle.milestones || {}).every((entry) => ["merged", "deferred"].includes(entry.state));
  if (allClosed && lifecycle.state !== "complete") {
    add(findings, "blocking", "All milestones are merged or deferred, but initiative state is not complete.");
  }

  return {
    status: findings.some((finding) => finding.severity === "blocking")
      ? "blocking"
      : findings.some((finding) => finding.severity === "warning")
        ? "warning"
        : "pass",
    findings,
  };
}

function statusPayload(lifecyclePath, lifecycle, checked) {
  return {
    lifecycle: path.relative(repo, lifecyclePath),
    slug: lifecycle.slug,
    state: lifecycle.state,
    currentMilestone: lifecycle.currentMilestone || null,
    milestones: lifecycle.milestones || {},
    status: checked.status,
    findings: checked.findings,
  };
}

function updateMilestone(lifecycle, id, patch) {
  requireValue(id, "A milestone is required. Pass --milestone or set currentMilestone.");
  lifecycle.milestones ||= {};
  lifecycle.milestones[id] = {
    state: "not_started",
    ...lifecycle.milestones[id],
    ...patch,
  };
}

function nextState(lifecycle, proposed) {
  const current = milestone(lifecycle, targetMilestone(lifecycle)).state;
  const order = ["not_started", "active", "implemented", "conformance_reviewed", "adversarially_reviewed", "pr_opened", "complete_on_merge", "merged"];
  return order.indexOf(current) > order.indexOf(proposed) ? current : proposed;
}

function targetMilestone(lifecycle) {
  return args.milestone || lifecycle.currentMilestone || firstMilestoneId(lifecycle);
}

function milestone(lifecycle, id) {
  return lifecycle.milestones?.[id] || { state: "not_started" };
}

function firstMilestoneId(lifecycle) {
  return Object.keys(lifecycle.milestones || {})[0] || null;
}

function nextOpenMilestone(lifecycle) {
  const entry = Object.entries(lifecycle.milestones || {})
    .find(([, value]) => !["merged", "deferred"].includes(value.state));
  return entry ? entry[0] : lifecycle.currentMilestone || null;
}

function saveAndReport(lifecyclePath, lifecycle, action) {
  fs.writeFileSync(lifecyclePath, `${JSON.stringify(lifecycle, null, 2)}\n`);
  report({ action, ...statusPayload(lifecyclePath, lifecycle, checkLifecycle(lifecyclePath, lifecycle)) });
}

function report(payload) {
  if (jsonOnly) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  const lines = [
    "Initiative lifecycle",
    `- File: ${payload.lifecycle}`,
    `- Slug: ${payload.slug || "(missing)"}`,
    `- State: ${payload.state || "(missing)"}`,
    `- Current milestone: ${payload.currentMilestone || "(none)"}`,
    `- Check: ${payload.status}`,
  ];
  if (payload.action) lines.splice(1, 0, `- Action: ${payload.action}`);
  if (payload.findings.length) {
    lines.push("", "Findings:");
    for (const finding of payload.findings) {
      lines.push(`- ${finding.severity}: ${finding.message}`);
    }
  } else {
    lines.push("", "Findings: none");
  }
  process.stdout.write(`${lines.join("\n")}\n`);
}

function fail(message) {
  if (jsonOnly) {
    process.stdout.write(`${JSON.stringify({ status: "blocking", findings: [{ severity: "blocking", message }] }, null, 2)}\n`);
  } else {
    process.stderr.write(`${message}\n`);
  }
  process.exit(1);
}

function printHelp() {
  process.stdout.write(`Usage: initiative-lifecycle.mjs <command> --initiative <path> [options]

Commands:
  activate
  start-milestone
  mark-implemented
  record-conformance
  record-adversarial-review
  record-pr-opened
  mark-complete-on-merge
  record-merged
  defer-milestone
  status
  check
`);
}

function parseArgs(rawArgs) {
  const parsed = { _: [] };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const token = rawArgs[index];
    if (!token.startsWith("--")) {
      parsed._.push(token);
      continue;
    }
    const key = token.slice(2);
    if (["strict", "json", "complete", "complete-on-merge", "help"].includes(key)) {
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
  const activeRoot = path.join(repoRoot, "docs", "initiatives", "active");
  if (!fs.existsSync(activeRoot)) return null;
  const candidates = fs.readdirSync(activeRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(activeRoot, entry.name));
  return candidates.length === 1 ? candidates[0] : null;
}

function parseMilestoneIds(text) {
  return [...text.matchAll(/^##\s+(M\d+)\b/gim)].map((match) => match[1]);
}

function parseMilestoneSections(text) {
  const headings = [...text.matchAll(/^##\s+(M\d+)\b.*$/gim)].map((match) => ({
    id: match[1],
    start: match.index,
  }));
  const sections = new Map();
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const next = headings[index + 1];
    sections.set(heading.id, text.slice(heading.start, next ? next.start : text.length));
  }
  return sections;
}

function extractStatus(text) {
  if (!text) return "";
  const statusMatch = text.match(/(?:^|\n)\s*(?:[-*]\s*)?(?:\*\*)?Status(?:\*\*)?\s*:\s*([^\n]+)/i);
  if (statusMatch) return stripMarkdown(statusMatch[1]);
  const stateMatch = text.match(/(?:^|\n)\s*(?:[-*]\s*)?(?:\*\*)?State(?:\*\*)?\s*:\s*([^\n]+)/i);
  return stateMatch ? stripMarkdown(stateMatch[1]) : "";
}

function hasOpenLanguage(text) {
  return /\b(active|in implementation|implementing|in progress|pending|not started|todo|tbd|open)\b/i.test(text || "");
}

function hasUncheckedLifecycleBox(text) {
  return /^\s*[-*]\s+\[\s\].*\b(status|lifecycle|complete|done|accepted|implemented|merged|deferred)\b/im.test(text || "");
}

function stripMarkdown(text) {
  return text.replace(/[*_`]/g, "").trim();
}

function readMaybe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function add(findings, severity, message) {
  findings.push({ severity, message });
}

function requireValue(value, message) {
  if (value === undefined || value === null || value === "") {
    throw new Error(message);
  }
}

function requirePr(value, message) {
  requireValue(value, message);
  if (!isPrNumber(value)) {
    throw new Error(`Invalid PR number: ${value}.`);
  }
}

function parsePrNumber(value) {
  return Number.parseInt(String(value), 10);
}

function isPrNumber(value) {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value > 0;
  }
  return /^[1-9]\d*$/.test(String(value || ""));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
