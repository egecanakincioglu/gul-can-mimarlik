import type { Metadata } from 'next';
import ProjectArchive from '@/components/ProjectArchive';
import Footer from '@/components/Footer';

export const metadata: Metadata = { title: 'Projeler' };

export default function ProjelerPage() {
  return (
    <>
      <section className="dark-bg on-dark pt-[var(--hdr)]">
        <div className="wrap flex min-h-[32svh] flex-col justify-end gap-6 pb-10 pt-16 md:pb-14">
          <h1 className="d-xl">Projeler</h1>
          <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
            <p className="lead max-w-[36ch] text-siva">
              Konuttan ticari mekâna, çizimden uygulamaya seçilmiş çalışmalar.
            </p>
            <p className="caption">Konsept çalışmalar — illüstratif görseller.</p>
          </div>
        </div>
      </section>
      <ProjectArchive />
      <Footer step="r" />
    </>
  );
}
