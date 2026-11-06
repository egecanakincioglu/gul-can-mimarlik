import { tokensIn } from '@/lib/text';

const braced = (names: string[]) => names.map((t) => `{${t}}`).join(', ');

/** The `{...}` tokens a text may use: only the ones its default text already contains. */
export const allowedTokens = (defaultText: string): string[] => [...new Set(tokensIn(defaultText))];

/** Tells the editor which tokens the site fills in; undefined when the text has none. */
export const tokenHelper = (allowed: string[]): string | undefined =>
  allowed.length ? `Bu metinde şu ifadeler otomatik doldurulur: ${braced(allowed)}` : undefined;

/** Names the first token in `value` that is not allowed and lists the ones that are. */
export const tokenError = (allowed: string[], value: string): string | undefined => {
  const bad = tokensIn(value).find((t) => !allowed.includes(t));
  if (!bad) return undefined;
  const list = allowed.length ? braced(allowed) : 'Bu metinde ifade kullanılamaz';
  return `Bilinmeyen ifade: {${bad}}. Kullanılabilenler: ${list}`;
};
