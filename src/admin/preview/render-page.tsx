import type { ReactNode } from 'react';
import { renderShell } from '@/site/render/shell';
import { renderContact } from '@/site/render/contact';
import { renderServices } from '@/site/render/services';
import { renderHome } from '@/site/render/home';
import { renderProjects } from '@/site/render/projects';
import { renderProject } from '@/site/render/project';
import { renderStudio } from '@/site/render/studio';
import type { SiteContent } from '@/content/types';

const page = (segments: string[], c: SiteContent): ReactNode | null => {
  const [first, second, ...rest] = segments;
  if (rest.length > 0) return null;
  if (!first) return renderHome(c);
  if (second !== undefined) return first === 'projeler' ? renderProject(c, second, { includeUnpublished: true }) : null;
  switch (first) {
    case 'hizmetler':
      return renderServices(c);
    case 'projeler':
      return renderProjects(c);
    case 'studyo':
      return renderStudio(c);
    case 'iletisim':
      return renderContact(c);
    default:
      return null;
  }
};

/** Public page for the path segments inside the public shell; each page already ends with its footer. */
export const renderPreviewPage = (segments: string[], c: SiteContent): ReactNode | null => {
  const body = page(segments, c);
  return body === null ? null : renderShell(c, body);
};
