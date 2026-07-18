#!/usr/bin/env node
/**
 * check-instructions.mjs — deterministic linter for agent instruction files.
 *
 * Enforces the machine-formatting rules the AGENTS.md files rely on:
 *  1. Heading depth ≤ 3 — deeper nesting dilutes attention; an h4 means the
 *     content belongs in a separate file.
 *  2. Line budgets — length is the ceiling; every always-loaded line costs
 *     context in every session.
 *  3. Prohibition rationale — every "never / do not / don't" list item must
 *     carry an em-dash reason; the "why" lets the agent generalize the rule.
 *  4. Mermaid block sanity — fences must close and declare a known diagram
 *     type; a broken diagram silently degrades to noise.
 *
 * Run:  pnpm check:instructions   (wired into lefthook pre-commit and CI)
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');

/** [path, max lines] — budgets are ceilings, not targets. */
const TARGETS = [
  ['AGENTS.md', 100],
  ['apps/web/AGENTS.md', 130],
  ['apps/api/AGENTS.md', 130],
  ['packages/db/AGENTS.md', 130],
  ['packages/shared/AGENTS.md', 130],
  ['packages/auth/AGENTS.md', 130],
];
for (const dir of ['.claude/commands', '.claude/skills']) {
  const abs = resolve(ROOT, dir);
  if (!existsSync(abs)) continue;
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.md'))
      TARGETS.push([`${dir}/${entry.name}`, 120]);
    if (entry.isDirectory()) {
      const skill = `${dir}/${entry.name}/SKILL.md`;
      if (existsSync(resolve(ROOT, skill))) TARGETS.push([skill, 120]);
    }
  }
}

const MERMAID_TYPES =
  /^(flowchart|graph|sequenceDiagram|stateDiagram|erDiagram|classDiagram)\b/;
const PROHIBITION = /^(?:[-*]|\d+\.)\s+.*\b(never|do not|don't)\b/i;

// Non-fence content checks: heading depth and prohibition-rationale rules.
function checkContentLine(line, n, rel, problems) {
  const heading = line.match(/^(#{1,6})\s/);
  if (heading && heading[1].length > 3) {
    problems.push(
      `${rel}:${n}: heading depth ${heading[1].length} exceeds 3 — an h4 means this belongs in a separate file`,
    );
  }

  if (line.trimStart().startsWith('|')) return; // table rows: routing labels, not rules
  if (PROHIBITION.test(line.trim()) && !line.includes('—')) {
    problems.push(
      `${rel}:${n}: prohibition without an em-dash rationale — the "why" lets the agent generalize the rule`,
    );
  }
}

const problems = [];

for (const [rel, budget] of TARGETS) {
  const abs = resolve(ROOT, rel);
  if (!existsSync(abs)) {
    problems.push(`${rel}: listed in check-instructions targets but missing`);
    continue;
  }
  const lines = readFileSync(abs, 'utf8').split('\n');

  if (lines.length > budget) {
    problems.push(
      `${rel}: ${lines.length} lines exceeds the ${budget}-line budget — split or tighten (length is the ceiling)`,
    );
  }

  let inFence = false;
  let mermaidOpen = -1;
  let mermaidTyped = false;

  lines.forEach((line, i) => {
    const n = i + 1;

    if (line.startsWith('```')) {
      if (!inFence) {
        inFence = true;
        if (line.trim() === '```mermaid') {
          mermaidOpen = n;
          mermaidTyped = false;
        }
      } else {
        if (mermaidOpen !== -1 && !mermaidTyped) {
          problems.push(
            `${rel}:${mermaidOpen}: mermaid block missing a diagram type (flowchart/graph/sequenceDiagram/...)`,
          );
        }
        inFence = false;
        mermaidOpen = -1;
      }
      return;
    }

    if (inFence) {
      if (mermaidOpen !== -1 && !mermaidTyped && line.trim() !== '') {
        mermaidTyped = MERMAID_TYPES.test(line.trim());
      }
      return;
    }

    checkContentLine(line, n, rel, problems);
  });

  if (inFence) {
    problems.push(`${rel}: unclosed code fence at end of file`);
  }
}

if (problems.length > 0) {
  console.error(
    `\n✖ instruction files violate the formatting rules (${problems.length}):\n`,
  );
  for (const p of problems) console.error(`   - ${p}`);
  console.error('');
  process.exit(1);
}

console.log(
  `✓ instruction files pass formatting rules (${TARGETS.length} files checked)`,
);
