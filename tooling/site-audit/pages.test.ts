import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { NOT_FOUND_PAGE, PAGES } from './pages.ts';

test('the audit list holds absolute addresses without duplicates', () => {
  assert.equal(new Set(PAGES).size, PAGES.length);
  for (const p of PAGES) assert.ok(p.startsWith('/'), p);
});

test('every project of the content has its page in the audit list', () => {
  const source = readFileSync(new URL('../../src/content/projects.ts', import.meta.url), 'utf8');
  const slugs = [...source.matchAll(/^\s{4}slug: '([^']+)'/gm)].map((m) => m[1]!);
  assert.ok(slugs.length > 0);
  assert.deepEqual(
    PAGES.filter((p) => p.startsWith('/projeler/')),
    slugs.map((s) => `/projeler/${s}`),
  );
});

test('the not-found address is not a listed page', () => {
  assert.ok(!PAGES.includes(NOT_FOUND_PAGE));
});
