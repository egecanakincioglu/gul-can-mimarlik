import Link from 'next/link';
import { LogoWide } from './Logo';
import InView from './InView';
import RichText from './RichText';
import { visibleNav } from './shell-texts';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import { demoText, emailHref, phoneHref, text } from '@/content/select';

/* Contact CTA + footer: one continuous dark mass. */
type FooterProps = { cta?: boolean; step?: 'l' | 'r' };

export default async function Footer(props: FooterProps) {
  return <FooterView c={await getContent()} {...props} />;
}

export function FooterView({ c, cta = true, step = 'l' }: FooterProps & { c: SiteContent }) {
  const demo = demoText(c, 'footer');
  return (
    <footer
      className={`sec-k on-dark ${step === 'l' ? 'mass-in-l' : 'mass-in-r'}`}
      style={{ paddingTop: cta ? undefined : 'clamp(64px,7vw,112px)' }}
    >
      <div className="wrap">
        {cta && (
          <div className="pb-[clamp(64px,8vw,128px)]">
            <InView className="rise">
              <h2 className="d-xl max-w-[14ch] xl:max-w-none">
                <RichText value={c.footer.ctaHeading} />
              </h2>
            </InView>
            <InView className="rise mt-12 flex flex-col gap-3 md:mt-16" delay={0.1}>
              <a href={phoneHref(c)} className="d-m big-link inline-flex min-h-[44px] items-center self-start">
                {c.contact.phone}
              </a>
              <a
                href={emailHref(c)}
                className="d-m big-link inline-flex min-h-[44px] items-center self-start break-all"
              >
                {c.contact.email}
              </a>
            </InView>
            <InView className="rise mt-10" delay={0.2}>
              <Link href={c.footer.cta.href} className="btn btn-day w-full sm:w-auto">
                <span>{c.footer.cta.label}</span>
                <span className="arr" aria-hidden>
                  →
                </span>
              </Link>
            </InView>
          </div>
        )}

        <div className="grid grid-cols-4 gap-x-4 gap-y-10 border-t border-golge pt-12 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <div className="col-span-4 md:col-span-4 xl:col-span-4">
            <LogoWide width={320} />
          </div>
          <div className="col-span-4 md:col-span-2 xl:col-span-3 xl:col-start-6">
            <p className="label muted">{c.ui.address}</p>
            <address className="mt-3 not-italic">
              {c.contact.address.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
          </div>
          <nav aria-label={c.ui.footerNavAria} className="col-span-4 md:col-span-2 xl:col-span-3 xl:col-start-10">
            <p className="label muted">{c.ui.pages}</p>
            <ul className="mt-3 flex flex-col">
              {visibleNav(c).map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="big-link inline-flex min-h-[44px] items-center">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-golge pt-6 text-[14px] text-siva md:flex-row md:justify-between">
          <p>{text(c, c.ui.copyright)}</p>
          {demo && <p>{demo}</p>}
        </div>
      </div>
    </footer>
  );
}
