import type { Metadata } from 'next';
import ProjectArchive from '@/components/ProjectArchive';
import { archiveProps } from '@/components/archive-props';
import Footer from '@/components/Footer';
import { getContent } from '@/content';
import { demoText, seoForPage } from '@/content/select';

export async function generateMetadata(): Promise<Metadata> {
  return seoForPage(await getContent(), 'projects');
}

export default async function ProjelerPage() {
  const c = await getContent();
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
      <Footer step="r" />
    </>
  );
}
