import { beforeAll, describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import { emailError, hrefError, phoneError, rangeWarning, requiredText, tokenError } from './rules';
import { GROUPS, textRows } from './texts';

let seed: SiteContent;
beforeAll(async () => {
  seed = await getContent();
});

describe('field rules', () => {
  it('requires text and limits length', () => {
    expect(requiredText(' ')).toBeTruthy();
    expect(requiredText('abc', 2)).toBe('En çok 2 karakter olabilir.');
    expect(requiredText('ab', 2)).toBeUndefined();
  });

  it('accepts digits and spaces for phone numbers only', () => {
    expect(phoneError('0212 000 00 00')).toBeUndefined();
    expect(phoneError('')).toBeTruthy();
    expect(phoneError('0212-000')).toBeTruthy();
    expect(phoneError('0212 00')).toBeTruthy();
  });

  it('checks e-mail addresses simply', () => {
    expect(emailError('ad@example.com')).toBeUndefined();
    expect(emailError('ad@example')).toBeTruthy();
    expect(emailError('')).toBeTruthy();
  });

  it('accepts site paths and https links', () => {
    expect(hrefError('/iletisim')).toBeUndefined();
    expect(hrefError('https://example.com')).toBeUndefined();
    expect(hrefError('iletisim')).toBeTruthy();
    expect(hrefError('')).toBeTruthy();
  });

  it('warns outside the range and stays quiet inside it', () => {
    expect(rangeWarning('a'.repeat(5), 10, 60)).toContain('10-60');
    expect(rangeWarning('a'.repeat(70), 10, 60)).toContain('kesilebilir');
    expect(rangeWarning('a'.repeat(30), 10, 60)).toBeUndefined();
  });

  it('rejects unknown placeholders and allows the known ones', () => {
    expect(tokenError(seed, '{n} proje, {year}')).toBeUndefined();
    expect(tokenError(seed, '{nope}')).toBe('Bilinmeyen yer tutucu: {nope}');
  });
});

describe('text rows', () => {
  it('places every string in exactly one group', () => {
    const rows = textRows(seed);
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
    expect(rows.every((r) => GROUPS.includes(r.group))).toBe(true);
    expect(Object.keys(seed.ui).every((k) => rows.some((r) => r.id === `ui.${k}`))).toBe(true);
  });

  it('writes a value without touching the input', () => {
    const row = textRows(seed).find((r) => r.id === 'ui.menu');
    const next = row?.set(seed, 'Yeni');
    expect(next?.ui.menu).toBe('Yeni');
    expect(seed.ui.menu).not.toBe('Yeni');
  });
});
