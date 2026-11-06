import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOTS = ['src/app', 'src/components'];

// ServicesBands renders small thumbnails (18vw on every width), so a narrow fallback is correct.
const NARROW_ON_PURPOSE = new Set(['src/components/ServicesBands.tsx']);

type Hint = { file: string; value: string };

function tsxFiles(root: string): string[] {
  return readdirSync(root, { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => join(root, f).replaceAll('\\', '/'));
}

function hintsIn(file: string): Hint[] {
  const source = readFileSync(file, 'utf8');
  const values: string[] = [];
  // sizes="..." attributes, `sizes: '...'` properties and `sizes = '...'` defaults.
  for (const m of source.matchAll(/\bsizes\s*[=:]\s*["']([^"']+)["']/g)) values.push(m[1]);
  // Values of the SIZES lookup table in ProjectGallery.
  const table = /const SIZES\b[^{]*\{([^}]*)\}/.exec(source);
  if (table) for (const m of table[1].matchAll(/:\s*'([^']+)'/g)) values.push(m[1]);
  return values.map((value) => ({ file, value }));
}

const hints = ROOTS.flatMap(tsxFiles).flatMap(hintsIn);

describe('image sizes hints', () => {
  it('finds the hints in the source', () => {
    // Guards the parser: a lower count means the extraction broke, not that images were removed.
    expect(hints.length).toBeGreaterThanOrEqual(20);
  });

  it('ends every hint with a phone fallback of at least 88vw', () => {
    for (const { file, value } of hints) {
      if (NARROW_ON_PURPOSE.has(file)) continue;
      const fallback = value.split(',').at(-1)!.trim();
      const match = /^(\d+(?:\.\d+)?)vw$/.exec(fallback);
      expect(match, `${file}: "${value}" must end with a vw fallback`).not.toBeNull();
      expect(Number(match![1]), `${file}: "${value}"`).toBeGreaterThanOrEqual(88);
    }
  });
});
