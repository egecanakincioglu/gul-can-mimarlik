import type { Rich } from '@/content/types';

export type Plain = 300 | undefined;

/** `*word*` is weight 800, `_word_` is weight 300; unmarked text takes the heading's own weight. */
export const toMarked = (rich: Rich, plain?: Plain): string =>
  rich
    .map((s) => {
      if (s.weight === 800) return `*${s.text}*`;
      if (s.weight === 300 && plain === undefined) return `_${s.text}_`;
      return s.text;
    })
    .join('');

const MARK = /\*([^*]+)\*|_([^_]+)_/g;

/** Stray, unpaired markers are dropped so they never reach the stored text. */
export const fromMarked = (input: string, plain?: Plain): Rich => {
  const out: { text: string; weight?: 300 | 800 }[] = [];
  const push = (text: string, weight: 300 | 800 | undefined) => {
    if (text) out.push(weight === undefined ? { text } : { text, weight });
  };
  let last = 0;
  for (const m of input.matchAll(MARK)) {
    push(input.slice(last, m.index).replace(/[*_]/g, ''), plain);
    push(m[1] ?? m[2], m[1] !== undefined ? 800 : 300);
    last = m.index + m[0].length;
  }
  push(input.slice(last).replace(/[*_]/g, ''), plain);
  return out;
};

/** True when every marker has a partner. */
export const isBalanced = (input: string): boolean =>
  (input.match(/\*/g)?.length ?? 0) % 2 === 0 && (input.match(/_/g)?.length ?? 0) % 2 === 0;

/** True when the caret sits inside a `*...*` pair. */
export const insideBold = (text: string, caret: number): boolean =>
  (text.slice(0, caret).match(/\*/g)?.length ?? 0) % 2 === 1;

export const sameRich = (a: Rich, b: Rich): boolean =>
  a.length === b.length && a.every((s, i) => s.text === b[i].text && s.weight === b[i].weight);
