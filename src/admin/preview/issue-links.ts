import type { Issue } from '@/content/validate';
import type { SiteContent } from '@/content/types';
import { describeIssue } from '../shell/issues';

/** Turkish message and the panel screen that owns the issue's content path. */
export const issueLink = (content: SiteContent, issue: Issue): { text: string; href: string } => {
  const described = describeIssue(issue);
  const project = /^projects\[(\d+)\]/.exec(issue.path);
  const slug = project ? content.projects[Number(project[1])]?.slug : undefined;
  return slug ? { ...described, href: `/yonetim/projeler/${slug}` } : described;
};
