import { describe, expect, it } from 'vitest';
import { plain } from './rich';

describe('plain', () => {
  it('joins the segment texts, spaces included', () => {
    expect(plain([{ text: 'Önce ' }, { text: '/', weight: 300 }, { text: ' ' }, { text: 'Sonra', weight: 800 }])).toBe(
      'Önce / Sonra',
    );
  });

  it('returns an empty string for no segments', () => {
    expect(plain([])).toBe('');
  });
});
