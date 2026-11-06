import { describe, expect, it } from 'vitest';
import { fill, tokensIn, trCapital, trLocative, trMonth, trNumberWord } from './text';

describe('trNumberWord', () => {
  it.each([
    [0, 'sıfır'],
    [2, 'iki'],
    [4, 'dört'],
    [6, 'altı'],
    [10, 'on'],
    [17, 'on yedi'],
    [20, 'yirmi'],
    [99, 'doksan dokuz'],
  ])('%i -> %s', (n, word) => {
    expect(trNumberWord(n)).toBe(word);
  });

  it('rejects numbers outside 0..99', () => {
    expect(() => trNumberWord(-1)).toThrow(RangeError);
    expect(() => trNumberWord(100)).toThrow(RangeError);
    expect(() => trNumberWord(1.5)).toThrow(RangeError);
  });
});

describe('trCapital', () => {
  it('uses Turkish casing for the dotted capital I', () => {
    expect(trCapital('iki')).toBe('İki');
    expect(trCapital('dört')).toBe('Dört');
  });
});

describe('trMonth', () => {
  it('names months 1..12', () => {
    expect(trMonth(1)).toBe('Ocak');
    expect(trMonth(12)).toBe('Aralık');
  });

  it('rejects other values', () => {
    expect(() => trMonth(0)).toThrow(RangeError);
    expect(() => trMonth(13)).toThrow(RangeError);
  });
});

describe('trLocative', () => {
  it.each([
    [2020, 'de'],
    [2015, 'te'],
    [2016, 'da'],
    [1990, 'da'],
    [2000, 'de'],
    [2021, 'de'],
    [2023, 'te'],
    [2027, 'de'],
    [2029, 'da'],
    [2010, 'da'],
    [2030, 'da'],
    [2040, 'ta'],
    [2050, 'de'],
    [2060, 'ta'],
    [2070, 'te'],
    [2080, 'de'],
    [1100, 'de'],
  ])('%i -> %s', (year, suffix) => {
    expect(trLocative(year)).toBe(suffix);
  });

  it('rejects years outside 1000..2999', () => {
    expect(() => trLocative(999)).toThrow(RangeError);
    expect(() => trLocative(3000)).toThrow(RangeError);
  });
});

describe('fill', () => {
  it('replaces known tokens', () => {
    expect(fill('{a} ve {b}', { a: 'x', b: 'y' })).toBe('x ve y');
  });

  it('leaves unknown tokens visible', () => {
    expect(fill('{a} {nope}', { a: 'x' })).toBe('x {nope}');
  });

  it('does not treat inherited object keys as tokens', () => {
    expect(fill('{toString}', {})).toBe('{toString}');
  });
});

describe('tokensIn', () => {
  it('lists the tokens of a template', () => {
    expect(tokensIn('{a} ve {b} %{n}')).toEqual(['a', 'b', 'n']);
    expect(tokensIn('düz metin')).toEqual([]);
  });
});
