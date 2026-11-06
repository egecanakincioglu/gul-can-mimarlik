import ProjectArchive from '@/components/ProjectArchive';
import { archiveProps } from '@/components/archive-props';
import { FooterView } from '@/components/Footer';
import type { SiteContent } from '@/content/types';
import { demoText } from '@/content/select';

export function renderProjects(c: SiteContent) {
  const listing = demoText(c, 'listing');
  return (
    <>
      <section className="dark-bg on-dark pt-[var(--hdr)]">
        <div className="wrap flex min-h-[32svh] flex-col justify-end gap-6 pb-10 pt-16 md:pb-14">
          <h1 className="d-xl">{c.projectsPage.title}</h1>
          <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
            <p className="lead max-w-[36ch] text-siva">{c.projectsPage.lead}</p>
            {listing && <p className="caption">{listing}</p>}
          </div>
        </div>
      </section>
      <ProjectArchive {...archiveProps(c)} />
      <FooterView c={c} step="r" />
    </>
  );
}
