import Link from 'next/link';
import Photo from './Photo';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import { captionOf, resolveImage } from '@/content/select';

/* "Kat kesiti": four stacked floors. Desktop (hover devices) expands one band at a time; elsewhere everything stays open. */
export default async function ServicesBands() {
  return <ServicesBandsView c={await getContent()} />;
}

export function ServicesBandsView({ c: content }: { c: SiteContent }) {
  return (
    <ul className="list-none">
      {content.serviceCategories.map((c, i) => (
        <li key={c.slug} className="band">
          <Link href={`/hizmetler#${c.slug}`} className="block py-8 md:py-10">
            <div className="grid grid-cols-4 gap-x-4 gap-y-4 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
              <p className="label muted col-span-4 md:col-span-1 xl:pt-5">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="d-l col-span-4 md:col-span-7 xl:col-span-6">{c.name}</h3>
              <ul className="col-span-4 list-none md:col-span-4 md:col-start-2 md:grid md:grid-cols-2 md:gap-x-6 xl:col-span-5 xl:col-start-8 xl:block xl:pt-3">
                {c.services.map((s) => (
                  <li key={s.id} className="py-1 text-[17px] text-siva">
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="band-more">
              <div>
                <div className="grid grid-cols-4 gap-x-4 pt-6 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
                  <div className="relative hidden aspect-[4/5] xl:col-span-2 xl:col-start-8 xl:block">
                    <Photo img={resolveImage(content, c.image)} sizes="18vw" />
                  </div>
                  <div className="col-span-4 md:col-span-6 md:col-start-2 xl:col-span-3 xl:col-start-10 xl:self-end">
                    <p className="lead text-kirec">{c.sentence}</p>
                    <p className="caption mt-3">
                      {captionOf(content, { image: c.image, slot: 'wide', caption: content.labels.concept })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
