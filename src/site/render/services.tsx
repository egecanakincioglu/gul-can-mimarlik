import Link from 'next/link';
import Photo from '@/components/Photo';
import InView from '@/components/InView';
import { FooterView } from '@/components/Footer';
import RichText from '@/components/RichText';
import type { SiteContent } from '@/content/types';
import { captionOf, demoText, getProjectById, resolveImage, text } from '@/content/select';

/* Alternating mass / void; never two dark floors in a row. */
const TONE = ['light', 'dark', 'light', 'paper'] as const;

export function renderServices(content: SiteContent) {
  const { serviceCategories, processSteps, servicesPage } = content;
  const total = String(serviceCategories.length).padStart(2, '0');
  const demo = demoText(content, 'servicesFootnote');
  return (
    <>
      <section className="pt-[var(--hdr)]">
        <div className="wrap sec-b !pb-[clamp(64px,8vw,120px)] grid grid-cols-4 gap-x-4 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <h1 className="d-xl col-span-4 md:col-span-8 xl:col-span-9">
            <RichText value={servicesPage.heading} />
          </h1>
          <p className="lead col-span-4 mt-10 max-w-[36ch] md:col-span-5 md:col-start-1 xl:col-span-4 xl:col-start-3">
            {text(content, servicesPage.lead)}
          </p>
        </div>
      </section>

      {serviceCategories.map((c, i) => {
        const tone = TONE[i];
        const dark = tone === 'dark';
        const cls = dark ? 'sec-k on-dark' : tone === 'paper' ? 'sec-b bg-siva' : 'sec-b bg-kagit';
        const edge = dark
          ? i % 2
            ? 'mass-in-l'
            : 'mass-in-r'
          : serviceCategories[i - 1] && TONE[i - 1] === 'dark'
            ? 'mass-out-r'
            : '';
        const flip = i % 2 === 1;
        const project = c.projectId ? getProjectById(content, c.projectId) : undefined;
        return (
          <section key={c.slug} id={c.slug} className={`${cls} ${edge}`} aria-labelledby={`${c.slug}-h`}>
            <div className="wrap grid grid-cols-4 gap-x-4 gap-y-12 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
              <div className={`col-span-4 md:col-span-8 xl:col-span-7 ${flip ? 'xl:col-start-6 xl:order-2' : ''}`}>
                <p className="label muted">
                  {String(i + 1).padStart(2, '0')} / {total}
                </p>
                <h2 id={`${c.slug}-h`} className="d-l mt-4">
                  {c.name}
                </h2>
                <p className="lead mt-6 max-w-[30ch]">{c.sentence}</p>
                <ul className="mt-12 list-none border-t border-current">
                  {c.services.map((s) => (
                    <li
                      key={s.id}
                      className="grid gap-1 border-b border-current/30 py-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-8"
                    >
                      <h3 className="d-s">{s.name}</h3>
                      <p className={dark ? 'text-siva' : 'muted'}>{s.desc}</p>
                    </li>
                  ))}
                </ul>
                {project && (
                  <Link href={`/projeler/${project.slug}`} className="tlink mt-8">
                    {content.ui.related} →
                  </Link>
                )}
              </div>
              <div
                className={`col-span-4 md:col-span-5 xl:col-span-4 ${flip ? 'xl:col-start-2 xl:order-1' : 'xl:col-start-9'} ${i === 0 ? 'xl:mt-24' : 'xl:mt-40'}`}
              >
                <InView className="wipe" from={flip ? 'right' : 'left'}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-beton">
                    <Photo
                      img={resolveImage(content, c.image)}
                      sizes="(min-width:1280px) 30vw, (min-width:768px) 60vw, 100vw"
                    />
                  </div>
                </InView>
                <p className="caption mt-3">
                  {captionOf(content, { image: c.image, slot: 'wide', caption: content.labels.concept })}
                </p>
              </div>
            </div>
          </section>
        );
      })}
      <section className="sec-b" aria-labelledby="sur-h">
        <div className="wrap">
          <h2 id="sur-h" className="d-l">
            <RichText value={servicesPage.processHeading} />
          </h2>
          <p className="lead mt-6 max-w-[34ch]">{text(content, servicesPage.processLead)}</p>
          <InView className="proc mt-16 md:mt-24">
            {processSteps.map((s, i) => (
              <div key={s.id} className="proc-step" style={{ '--i': i } as React.CSSProperties}>
                <div className="proc-bar" />
                <p className="label">{String(i + 1).padStart(2, '0')}</p>
                <p className="d-s mt-2 max-w-[16ch]">{s.title}</p>
              </div>
            ))}
          </InView>
          <p className="caption mt-14 max-w-[52ch]">
            {demo ? `${servicesPage.footnote} ${demo}` : servicesPage.footnote}
          </p>
        </div>
      </section>
      <FooterView c={content} step="l" />
    </>
  );
}
