#!/usr/bin/env node
/**
 * check-backbone.mjs — enforces that backbone.yml is an accurate map.
 *
 * "A backbone.yml only works if it's true. Structure that rots is worse
 *  than no structure."
 *
 * Walks every string value in backbone.yml, extracts path-like references
 * (apps/..., packages/..., and root files listed in known sections), and
 * fails if any of them don't exist on disk.
 *
 * Skipped:
 *  - tokens containing '{', '|' (patterns/alternations, not literal paths)
 *  - paths in ALLOWED_MISSING (gitignored files that legitimately don't
 *    exist in a fresh clone)
 *
 * Run:  pnpm check:backbone      (wired into lefthook pre-commit and CI)
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const BACKBONE = resolve(ROOT, 'backbone.yml');

/** Gitignored paths the map may reference but a fresh clone won't have. */
const ALLOWED_MISSING = new Set(['.env', 'apps/web/.env']);

const PATH_TOKEN = /(?:apps|packages|scripts)\/[\w./\-{}|]+/g;

/** Sections whose leaf values are root-relative file paths (no prefix). */
const ROOT_FILE_SECTIONS = [
  ['agents', 'instruction_files'],
  ['structure', 'tooling'],
];

const doc = parse(readFileSync(BACKBONE, 'utf8'));

const missing = [];
let checked = 0;

function checkPath(token) {
  if (token.includes('{') || token.includes('|')) return; // pattern, not a path
  const clean = token.replace(/[.,;:]+$/, '');
  checked += 1;
  if (ALLOWED_MISSING.has(clean)) return;
  if (!existsSync(resolve(ROOT, clean))) missing.push(clean);
}

function walk(node) {
  if (typeof node === 'string') {
    for (const token of node.match(PATH_TOKEN) ?? []) checkPath(token);
  } else if (Array.isArray(node)) {
    node.forEach(walk);
  } else if (node && typeof node === 'object') {
    Object.values(node).forEach(walk);
  }
}

walk(doc);

for (const [a, b] of ROOT_FILE_SECTIONS) {
  const section = doc?.[a]?.[b];
  if (!section) continue;
  for (const value of Object.values(section)) {
    if (typeof value === 'string' && !value.includes(' ')) checkPath(value);
  }
}

const unique = [...new Set(missing)];
if (unique.length > 0) {
  console.error(
    `\n✖ backbone.yml is stale — ${unique.length} referenced path(s) do not exist:\n`,
  );
  for (const p of unique) console.error(`   - ${p}`);
  console.error(
    '\n  Fix the paths in backbone.yml (or add intentionally-gitignored files',
  );
  console.error('  to ALLOWED_MISSING in scripts/check-backbone.mjs).\n');
  process.exit(1);
}

console.log(`✓ backbone.yml is accurate (${checked} path references verified)`);
