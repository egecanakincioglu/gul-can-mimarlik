import type { Rich } from '@/content/types';

export const plain = (r: Rich): string => r.map((s) => s.text).join('');
