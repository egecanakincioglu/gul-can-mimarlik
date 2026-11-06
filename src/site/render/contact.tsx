import ContactForm from '@/components/ContactForm';
import type { ContactFormTexts } from '@/components/ContactForm';
import { FooterView } from '@/components/Footer';
import RichText from '@/components/RichText';
import type { SiteContent } from '@/content/types';
import { demoText, emailHref, phoneHref } from '@/content/select';

export function renderContact(c: SiteContent) {
  const { contactPage: page, contact, ui } = c;
  const phone = phoneHref(c);
  const mail = emailHref(c);
  const { form } = page;
  const texts: ContactFormTexts = {
    ariaLabel: ui.contactFormAria,
    badge: demoText(c, 'form'),
    fields: form.fields,
    locationEnabled: form.locationEnabled,
    projectTypes: form.projectTypes,
    errors: form.errors,
    submit: demoText(c, 'formSubmit') ?? form.submit,
    success: form.success,
  };
  return (
    <>
      <section className="grid min-h-[100svh] pt-[var(--hdr)] xl:grid-cols-12">
        {/* Kütle: doğrudan iletişim */}
        <div className="on-dark dark-bg px-[var(--pad)] py-14 md:py-20 xl:col-span-5 xl:flex xl:flex-col xl:justify-between xl:py-24">
          <div>
            <h1 className="d-l max-w-[12ch]">
              <RichText value={page.heading} />
            </h1>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:hidden">
              <a href={phone} className="btn btn-day">
                <span>{page.callLabel}</span>
                <span className="arr" aria-hidden>
                  →
                </span>
              </a>
              <a href={mail} className="btn btn-ghost">
                <span>{page.mailLabel}</span>
                <span className="arr" aria-hidden>
                  →
                </span>
              </a>
            </div>
          </div>
          <div className="mt-14 grid gap-8 xl:mt-0">
            <div>
              <p className="label muted">{ui.phone}</p>
              <a href={phone} className="d-m big-link mt-2 inline-flex min-h-[44px] items-center">
                {contact.phone}
              </a>
            </div>
            <div>
              <p className="label muted">{ui.email}</p>
              <a href={mail} className="d-m big-link mt-2 inline-flex min-h-[44px] items-center break-all">
                {contact.email}
              </a>
            </div>
            <div>
              <p className="label muted">{ui.address}</p>
              <address className="mt-2 not-italic">
                {contact.address.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </address>
            </div>
            <div className="hidden gap-3 sm:grid-cols-2 xl:grid">
              <a href={phone} className="btn btn-day">
                <span>{page.callLabel}</span>
                <span className="arr" aria-hidden>
                  →
                </span>
              </a>
              <a href={mail} className="btn btn-ghost">
                <span>{page.mailLabel}</span>
                <span className="arr" aria-hidden>
                  →
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Boşluk: form */}
        <div className="bg-kirec px-[var(--pad)] py-14 md:py-20 xl:col-span-7 xl:py-24 xl:pl-[clamp(48px,6vw,112px)]">
          <h2 className="d-m">{form.heading}</h2>
          <p className="muted mt-3 max-w-[44ch]">{form.note}</p>
          <div className="mt-10 max-w-[720px]">
            <ContactForm texts={texts} />
          </div>
        </div>
      </section>
      <FooterView c={c} cta={false} step="r" />
    </>
  );
}
