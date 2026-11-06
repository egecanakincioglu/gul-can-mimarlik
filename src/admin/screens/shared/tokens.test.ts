import { describe, expect, it } from 'vitest';
import { allowedTokens, tokenError, tokenHelper } from './tokens.ts';

describe('allowedTokens', () => {
  it('lists each token of the default text once', () => {
    expect(allowedTokens('{Steps} adım, {Steps} kez, {foundedIn}')).toEqual(['Steps', 'foundedIn']);
    expect(allowedTokens('düz metin')).toEqual([]);
  });
});

describe('tokenHelper', () => {
  it('lists the allowed tokens', () => {
    expect(tokenHelper(['n', 'year'])).toBe('Bu metinde şu ifadeler otomatik doldurulur: {n}, {year}');
  });

  it('is silent without tokens', () => {
    expect(tokenHelper([])).toBeUndefined();
  });
});

describe('tokenError', () => {
  it('accepts allowed tokens and plain text', () => {
    expect(tokenError(['n', 'year'], '{n} proje, {year}')).toBeUndefined();
    expect(tokenError([], 'düz')).toBeUndefined();
  });

  it('names the unknown token and lists the usable ones', () => {
    expect(tokenError(['n'], '{nope}')).toBe('Bilinmeyen ifade: {nope}. Kullanılabilenler: {n}');
  });

  it('says so when no token is usable', () => {
    expect(tokenError([], '{n}')).toBe('Bilinmeyen ifade: {n}. Kullanılabilenler: Bu metinde ifade kullanılamaz');
  });
});
