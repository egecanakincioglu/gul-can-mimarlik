import type { Redirect, SiteContent } from '@/content/types';
import { validate } from '@/content/validate';

export type RedirectErrors = { from?: string; to?: string };

const PATH = /^\/\S*$/;
const PATH_MESSAGE = 'Adres "/" ile başlamalı ve boşluk içermemeli.';

const MESSAGES: Record<string, { field: keyof RedirectErrors; text: string }> = {
  'redirect-duplicate-from': { field: 'from', text: 'Bu adres için zaten bir yönlendirme var.' },
  'redirect-shadows-project': { field: 'from', text: 'Bu adres yayındaki bir projeye ait.' },
  'redirect-self': { field: 'to', text: 'Eski ve yeni adres aynı olamaz (döngü).' },
  'redirect-dangling': {
    field: 'to',
    text: 'Yeni adres herkese açık bir sayfa veya yayındaki bir proje adresi olmalı.',
  },
  'redirect-chain': { field: 'to', text: 'Zincir oluşur: bir yönlendirme başka bir yönlendirmeye bağlanamaz.' },
};

/** Entries made by a slug rename use the `redirect-` id prefix; manual ones do not. */
export const isAuto = (r: Redirect) => r.id.startsWith('redirect-');

const keys = (c: SiteContent) =>
  new Set(
    validate(c)
      .filter((i) => i.path.startsWith('redirects['))
      .map((i) => `${i.path}|${i.code}`),
  );

/**
 * Checks a redirect against the content rules and returns only the problems the change introduces.
 * `editing` is the id of the entry being replaced, if any.
 */
export const checkRedirect = (c: SiteContent, next: Redirect, editing?: string): RedirectErrors => {
  const errors: RedirectErrors = {};
  if (!PATH.test(next.from)) errors.from = PATH_MESSAGE;
  if (!PATH.test(next.to)) errors.to = PATH_MESSAGE;
  if (errors.from || errors.to) return errors;

  const redirects = editing ? c.redirects.map((r) => (r.id === editing ? next : r)) : [...c.redirects, next];
  const before = keys(c);
  for (const key of keys({ ...c, redirects })) {
    if (before.has(key)) continue;
    const found = MESSAGES[key.split('|')[1]];
    // Self-reference is the root of a loop and wins; a chain is clearer than a dangling target.
    const taken = errors[found?.field ?? 'to'];
    const wins =
      key.endsWith('redirect-self') || (key.endsWith('redirect-chain') && taken !== MESSAGES['redirect-self'].text);
    if (found && (!taken || wins)) errors[found.field] = found.text;
  }
  return errors;
};
