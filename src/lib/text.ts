const ONES = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
const TENS = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
const MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

export const trNumberWord = (n: number): string => {
  if (!Number.isInteger(n) || n < 0 || n > 99) throw new RangeError(`trNumberWord supports 0..99, got ${n}`);
  if (n < 10) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : '');
};

export const trCapital = (word: string): string => word.charAt(0).toLocaleUpperCase('tr') + word.slice(1);

export const trMonth = (month: number): string => {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError(`month must be 1..12, got ${month}`);
  return MONTHS[month - 1];
};

// Vowel harmony of the spoken last syllable: yirmi -> de, beş -> te, altı -> da.
const AFTER_DIGIT: Record<number, string> = {
  1: 'de',
  2: 'de',
  3: 'te',
  4: 'te',
  5: 'te',
  6: 'da',
  7: 'de',
  8: 'de',
  9: 'da',
};
const AFTER_TENS: Record<number, string> = {
  1: 'da',
  2: 'de',
  3: 'da',
  4: 'ta',
  5: 'de',
  6: 'ta',
  7: 'te',
  8: 'de',
  9: 'da',
};

/** Locative suffix of a year read aloud ("2020" -> "de", "2015" -> "te"). */
export const trLocative = (year: number): string => {
  if (!Number.isInteger(year) || year < 1000 || year > 2999) {
    throw new RangeError(`year must be 1000..2999, got ${year}`);
  }
  const last = year % 10;
  if (last) return AFTER_DIGIT[last];
  const tens = Math.floor(year / 10) % 10;
  return tens ? AFTER_TENS[tens] : 'de'; // round hundreds and thousands end in "yüz" / "bin"
};

const TOKEN = /\{(\w+)\}/g;

export const tokensIn = (template: string): string[] => Array.from(template.matchAll(TOKEN), (m) => m[1]);

/** Replaces `{name}`; unknown tokens stay visible so they are noticed (and reported by validation). */
export const fill = (template: string, vars: Record<string, string>): string =>
  template.replace(TOKEN, (whole, name: string) => (Object.hasOwn(vars, name) ? vars[name] : whole));
