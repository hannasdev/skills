#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const systemSkillValidator = path.join(root, ".system", "skill-creator", "scripts", "quick_validate.py");
const maxSkillLines = 500;
const maxSkillWords = 5000;
const issues = [];

function addIssue(message) {
  issues.push(message);
}

function walk(dir, entries = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".system", "node_modules", ".cache", "tmp"].includes(entry.name)) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, entries);
    } else {
      entries.push(fullPath);
    }
  }
  return entries;
}

function toRepoPath(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

function skillDirs() {
  return walk(root)
    .filter((file) => path.basename(file) === "SKILL.md")
    .map((file) => path.dirname(file))
    .sort();
}

function validateSkill(skillDir) {
  const display = toRepoPath(skillDir);
  try {
    execFileSync("python3", [systemSkillValidator, skillDir], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const output = String(error.stdout || error.stderr || error.message).trim();
    addIssue(`${display}: skill validation failed: ${output}`);
  }
}

function checkSkillSize(skillDir) {
  const skillPath = path.join(skillDir, "SKILL.md");
  const text = fs.readFileSync(skillPath, "utf8");
  const lines = text.split("\n").length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  if (lines > maxSkillLines) {
    addIssue(`${toRepoPath(skillPath)}: ${lines} lines exceeds ${maxSkillLines}; move details into references.`);
  }
  if (words > maxSkillWords) {
    addIssue(`${toRepoPath(skillPath)}: ${words} words exceeds ${maxSkillWords}; move details into references.`);
  }
}

function checkAgentMetadata(skillDir) {
  const metadataPath = path.join(skillDir, "agents", "openai.yaml");
  if (!fs.existsSync(metadataPath)) {
    addIssue(`${toRepoPath(skillDir)}: missing agents/openai.yaml.`);
  }
}

function checkBundledReferences(skillDir) {
  const skillPath = path.join(skillDir, "SKILL.md");
  const text = fs.readFileSync(skillPath, "utf8");
  const codeSpanPattern = /`([^`\n]*(?:references|scripts)\/[^`\n]+)`/g;
  const markdownLinkPattern = /\[[^\]]+\]\(([^)\n]*(?:references|scripts)\/[^)\n]+)\)/g;

  for (const pattern of [codeSpanPattern, markdownLinkPattern]) {
    for (const match of text.matchAll(pattern)) {
      const raw = match[1].trim();
      if (/^https?:\/\//.test(raw) || raw.includes("<") || raw.includes(">")) {
        continue;
      }

      const candidate = raw.startsWith("/")
        ? raw
        : path.resolve(skillDir, raw.replace(/^skills\//, ""));

      if (!fs.existsSync(candidate)) {
        addIssue(`${toRepoPath(skillPath)}: referenced bundled path does not exist: ${raw}`);
      }
    }
  }
}

function checkRepoSpecificStrings(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const personalRepoPattern = new RegExp(["hannasdev", "mcp-writing"].join("\\/"));
  if (personalRepoPattern.test(text)) {
    addIssue(`${toRepoPath(filePath)}: contains a hard-coded personal repository.`);
  }
}

function checkSkillFolderClutter(skillDir) {
  const allowedRootDocs = new Set(["SKILL.md"]);
  for (const entry of fs.readdirSync(skillDir, { withFileTypes: true })) {
    if (entry.isFile() && /^readme\.md$/i.test(entry.name) && !allowedRootDocs.has(entry.name)) {
      addIssue(`${toRepoPath(path.join(skillDir, entry.name))}: skill folders should not include README files.`);
    }
  }
}

function checkWorkspaceClutter() {
  for (const file of walk(root)) {
    if (path.basename(file) === ".DS_Store") {
      addIssue(`${toRepoPath(file)}: remove .DS_Store from the skills repo.`);
    }
    checkRepoSpecificStrings(file);
  }
}

for (const skillDir of skillDirs()) {
  validateSkill(skillDir);
  checkSkillSize(skillDir);
  checkAgentMetadata(skillDir);
  checkBundledReferences(skillDir);
  checkSkillFolderClutter(skillDir);
}
checkWorkspaceClutter();

if (issues.length > 0) {
  console.error("Skill lint failed:");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log(`Skill lint passed for ${skillDirs().length} skills.`);
