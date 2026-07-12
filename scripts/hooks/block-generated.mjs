#!/usr/bin/env node
/**
 * Claude Code PreToolUse hook: hard-blocks writes to generated files.
 *
 * AGENTS.md boundaries are soft context — the model follows them until the
 * window fills up. This hook is the deterministic layer: it fires on every
 * Write/Edit regardless of context state. Exit code 2 blocks the tool call
 * and feeds stderr back to the agent.
 */
import { readFileSync } from 'node:fs';

const BLOCKED = [
  [/apps\/web\/src\/libs\/api\/generated\//, 'pnpm generate:api'],
  [/apps\/api\/openapi\.json$/, 'pnpm generate:api'],
  [/packages\/db\/drizzle\//, 'pnpm db:generate'],
  [/pnpm-lock\.yaml$/, 'pnpm install'],
];

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0); // malformed payload — do not break the session
}

const filePath = input.tool_input?.file_path ?? input.tool_input?.path ?? '';

for (const [pattern, regen] of BLOCKED) {
  if (pattern.test(filePath)) {
    console.error(
      `BLOCKED: ${filePath} is generated output. Never edit it by hand — ` +
        `change the source and run \`${regen}\` instead (see backbone.yml "generated").`,
    );
    process.exit(2);
  }
}

process.exit(0);
