#!/usr/bin/env node
/**
 * Claude Code PostToolUse hook: auto-formats every file the agent edits.
 *
 * Formatting is a solved, mechanical problem — running Biome after each
 * Write/Edit means the agent never spends context on style and never
 * commits unformatted code. Non-blocking: always exits 0.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const filePath = input.tool_input?.file_path ?? input.tool_input?.path ?? '';
if (!/\.(ts|tsx|js|jsx|mjs|json)$/.test(filePath)) process.exit(0);

try {
  execFileSync(
    'pnpm',
    ['exec', 'biome', 'check', '--write', '--no-errors-on-unmatched', filePath],
    { stdio: 'ignore', timeout: 10_000 },
  );
} catch {
  // formatting failures must never break the agent's edit loop
}
process.exit(0);
