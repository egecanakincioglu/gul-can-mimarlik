import type { Issue } from '@/content/validate';
import type { SiteContent } from '@/content/types';
import { describeIssue } from '../shell/issues';
import { AREA_NAMES } from './changes';

const indexOf = (path: string, key: 'projects' | 'media') => {
  const m = (key === 'projects' ? /^projects\[(\d+)\]/ : /^media\[(\d+)\]/).exec(path);
  return m ? Number(m[1]) : null;
};

/** Message and the panel screen that owns the issue's content path; project issues open the project editor. */
export const issueLink = (content: SiteContent, issue: Issue): { text: string; href: string } => {
  const described = describeIssue(issue);
  const index = indexOf(issue.path, 'projects');
  const slug = index === null ? undefined : content.projects[index]?.slug;
  return slug ? { ...described, href: `/yonetim/projeler/${slug}` } : described;
};

/** "<area or item name>: <message>"; the raw content path is never shown. */
export const issueLabel = (issue: Issue, content: SiteContent): string => {
  const { text } = describeIssue(issue);
  const project = indexOf(issue.path, 'projects');
  const media = indexOf(issue.path, 'media');
  const root = issue.path.split(/[.[]/)[0];
  const title = project === null ? undefined : content.projects[project]?.title;
  const file = media === null ? undefined : content.media[media]?.file.split('/').pop();
  const name =
    title !== undefined
      ? `${title} projesi`
      : file !== undefined
        ? `Görsel ${file}`
        : root === 'projects'
          ? 'Projeler'
          : root === 'media'
            ? 'Medya'
            : (AREA_NAMES[root] ?? 'Site');
  return `${name}: ${text}`;
};
