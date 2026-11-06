import type { SiteContent } from '@/content/types';
import type { FieldErrors, Working } from './model';

export type TabProps = {
  w: Working;
  set: (patch: Partial<Working>) => void;
  draft: SiteContent;
  errors: FieldErrors;
};
