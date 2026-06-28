#!/usr/bin/env python3
"""Analyze Codex skill folders for objective quality signals."""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


NAME_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,62}$")
FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n?", re.DOTALL)
TODO_RE = re.compile(r"\bTODO\b|\[TODO:", re.IGNORECASE)
WHEN_TO_USE_RE = re.compile(r"^#{2,4}\s+.*when\s+to\s+use", re.IGNORECASE | re.MULTILINE)
DESCRIPTION_TRIGGER_RE = re.compile(
    r"\buse\s+(when|for|to|after|before|during|if|with|on|once|immediately)\b",
    re.IGNORECASE,
)
AUX_DOC_NAMES = {
    "README.md",
    "INSTALLATION_GUIDE.md",
    "QUICK_REFERENCE.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
}


@dataclass
class Finding:
    severity: str
    path: str
    line: int | None
    message: str


@dataclass
class SkillReport:
    skill_path: str
    metrics: dict[str, int | str | bool] = field(default_factory=dict)
    findings: list[Finding] = field(default_factory=list)

    def add(self, severity: str, path: Path, message: str, line: int | None = None) -> None:
        self.findings.append(Finding(severity, str(path), line, message))


def parse_frontmatter(text: str) -> tuple[dict[str, str], list[str], int]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}, [], 1

    values: dict[str, str] = {}
    keys: list[str] = []
    for raw_line in match.group(1).splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        keys.append(key)
        values[key] = value.strip().strip('"').strip("'")
    body_start = text[: match.end()].count("\n") + 1
    return values, keys, body_start


def line_number(text: str, pattern: re.Pattern[str]) -> int | None:
    match = pattern.search(text)
    if not match:
        return None
    return text[: match.start()].count("\n") + 1


def has_toc(text: str) -> bool:
    first_lines = "\n".join(text.splitlines()[:45]).lower()
    return "table of contents" in first_lines or re.search(r"^\s*-\s+\[.+\]\(#.+\)", first_lines, re.MULTILINE) is not None


def skill_dirs(path: Path) -> list[Path]:
    if (path / "SKILL.md").is_file():
        return [path]
    return sorted(child for child in path.iterdir() if child.is_dir() and (child / "SKILL.md").is_file())


def iter_files(path: Path, folder: str) -> Iterable[Path]:
    root = path / folder
    if root.is_dir():
        yield from sorted(item for item in root.rglob("*") if item.is_file())


def analyze_skill(path: Path) -> SkillReport:
    report = SkillReport(str(path))
    skill_md = path / "SKILL.md"

    if not skill_md.is_file():
        report.add("P1", skill_md, "Missing required SKILL.md.")
        return report

    text = skill_md.read_text(encoding="utf-8")
    lines = text.splitlines()
    words = re.findall(r"\S+", text)
    frontmatter, keys, body_start = parse_frontmatter(text)
    body = "\n".join(lines[body_start - 1 :])

    report.metrics.update(
        {
            "skill_lines": len(lines),
            "skill_words": len(words),
            "body_lines": max(0, len(lines) - body_start + 1),
            "has_agents_openai_yaml": (path / "agents" / "openai.yaml").is_file(),
            "reference_files": sum(1 for _ in iter_files(path, "references")),
            "script_files": sum(1 for _ in iter_files(path, "scripts")),
            "asset_files": sum(1 for _ in iter_files(path, "assets")),
        }
    )

    if not frontmatter:
        report.add("P1", skill_md, "Missing YAML frontmatter with name and description.", 1)
    else:
        name = frontmatter.get("name", "")
        description = frontmatter.get("description", "")
        extra_keys = [key for key in keys if key not in {"name", "description"}]

        if not name:
            report.add("P1", skill_md, "Frontmatter is missing required `name`.")
        elif not NAME_RE.match(name):
            report.add("P1", skill_md, f"Skill name `{name}` must use lowercase letters, digits, and hyphens.")
        elif name != path.name:
            report.add("P2", skill_md, f"Skill name `{name}` does not match folder name `{path.name}`.")

        if not description:
            report.add("P1", skill_md, "Frontmatter is missing required `description`.")
        elif len(description) < 80:
            report.add("P2", skill_md, "Description is short; include what the skill does and concrete trigger contexts.")
        elif not DESCRIPTION_TRIGGER_RE.search(description):
            report.add("P2", skill_md, "Description should include concrete `Use ...` trigger guidance.")
        elif len(description) > 900:
            report.add("P3", skill_md, "Description is long; tighten it so trigger guidance stays scannable.")

        if extra_keys:
            report.add("P3", skill_md, f"Frontmatter has extra keys {extra_keys}; convention is only `name` and `description`.")

    if TODO_RE.search(text):
        report.add("P1", skill_md, "Template TODO text remains in the skill.", line_number(text, TODO_RE))

    if WHEN_TO_USE_RE.search(body):
        report.add("P2", skill_md, "Body has a `When to use` section; trigger guidance belongs in frontmatter.", line_number(text, WHEN_TO_USE_RE))

    if len(lines) > 750:
        report.add("P2", skill_md, "SKILL.md is over 750 lines; split detailed content into references.")
    elif len(lines) > 500:
        report.add("P3", skill_md, "SKILL.md is over the 500-line guidance threshold.")

    if len(words) > 3500:
        report.add("P2", skill_md, "SKILL.md is word-heavy; move long examples or reference material out.")
    elif len(words) > 2500:
        report.add("P3", skill_md, "SKILL.md is approaching a high token cost.")

    if not (path / "agents" / "openai.yaml").is_file():
        report.add("P3", path / "agents" / "openai.yaml", "Missing recommended UI metadata.")
    else:
        openai_yaml = (path / "agents" / "openai.yaml").read_text(encoding="utf-8")
        expected = f"${frontmatter.get('name', path.name)}"
        if expected not in openai_yaml:
            report.add("P3", path / "agents" / "openai.yaml", f"default_prompt should mention `{expected}`.")

    for aux_name in AUX_DOC_NAMES:
        aux_path = path / aux_name
        if aux_path.exists():
            report.add("P3", aux_path, f"`{aux_name}` is usually clutter inside a skill unless directly used by the workflow.")

    for folder in ("scripts", "references", "assets"):
        folder_path = path / folder
        if folder_path.is_dir() and not any(folder_path.iterdir()):
            report.add("P3", folder_path, f"`{folder}/` is empty; remove it unless the skill will use it soon.")

    for ref in iter_files(path, "references"):
        ref_text = ref.read_text(encoding="utf-8", errors="replace")
        ref_lines = ref_text.splitlines()
        if len(ref_lines) > 100 and not has_toc(ref_text):
            report.add("P3", ref, "Reference file is over 100 lines without a table of contents or section map.")
        if len(re.findall(r"\S+", ref_text)) > 10000:
            report.add("P2", ref, "Reference file is over 10k words; add search hints in SKILL.md or split it.")

    return report


def print_markdown(reports: list[SkillReport]) -> None:
    total_findings = sum(len(report.findings) for report in reports)
    print(f"# Skill Analyzer Report\n\nReviewed {len(reports)} skill(s); found {total_findings} issue(s).\n")
    for report in reports:
        print(f"## {Path(report.skill_path).name}\n")
        metrics = ", ".join(f"{key}={value}" for key, value in report.metrics.items())
        print(f"Metrics: {metrics}\n")
        if not report.findings:
            print("No objective issues found.\n")
            continue
        for finding in sorted(report.findings, key=lambda item: item.severity):
            location = finding.path
            if finding.line:
                location = f"{location}:{finding.line}"
            print(f"- [{finding.severity}] {location} - {finding.message}")
        print()


def main() -> int:
    parser = argparse.ArgumentParser(description="Analyze Codex skill folders.")
    parser.add_argument("paths", nargs="+", type=Path, help="Skill folder(s) or parent skill directories to analyze.")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON.")
    args = parser.parse_args()

    reports: list[SkillReport] = []
    for input_path in args.paths:
        for path in skill_dirs(input_path.expanduser().resolve()):
            reports.append(analyze_skill(path))

    if args.json:
        print(
            json.dumps(
                [
                    {
                        "skill_path": report.skill_path,
                        "metrics": report.metrics,
                        "findings": [finding.__dict__ for finding in report.findings],
                    }
                    for report in reports
                ],
                indent=2,
            )
        )
    else:
        print_markdown(reports)

    return 1 if any(finding.severity == "P1" for report in reports for finding in report.findings) else 0


if __name__ == "__main__":
    raise SystemExit(main())
