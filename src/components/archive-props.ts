import type { ArchiveChip, ArchiveProject, ArchiveTexts } from './ProjectArchive';
import {
  conceptBadge,
  filterCount,
  filterProjects,
  illustrativeLabel,
  publishedProjects,
  resolveImage,
} from '@/content/select';
import type { SiteContent } from '@/content/types';

/** Prepares the archive's data on the server; the client component never imports content. */
export function archiveProps(c: SiteContent): {
  chips: ArchiveChip[];
  projects: ArchiveProject[];
  texts: ArchiveTexts;
} {
  const serviceName = (id: string) => c.serviceCategories.flatMap((cat) => cat.services).find((s) => s.id === id)?.name;
  const chips: ArchiveChip[] = c.projectFilters.map((f) => ({
    id: f.id,
    slug: f.slug,
    label: f.label,
    count: f.rule.kind === 'all' ? filterCount(c, f.id) : null,
  }));
  const projects: ArchiveProject[] = publishedProjects(c).map((p) => ({
    slug: p.slug,
    title: p.title,
    cover: resolveImage(c, p.cover),
    meta: [c.projectCategories.find((x) => x.id === p.categoryId)?.name, serviceName(p.scope[0])]
      .filter(Boolean)
      .join(' · '),
    badge: conceptBadge(c, p),
    caption: illustrativeLabel(c, p.cover),
    filterIds: c.projectFilters.filter((f) => filterProjects(c, f.id).some((x) => x.id === p.id)).map((f) => f.id),
  }));
  return {
    chips,
    projects,
    texts: { filterAria: c.ui.filterAria, shown: c.ui.projectsShown, viewProject: c.ui.viewProject },
  };
}
