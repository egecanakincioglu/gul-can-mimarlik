import { emailHref, phoneHref } from '@/content/select';
import type { SiteContent } from '@/content/types';
import type { BeforeAfterTexts } from './BeforeAfter';
import type { HeaderTexts } from './Header';

export const visibleNav = (c: SiteContent) => c.navigation.filter((n) => n.visible);

/** Server side: turns the content into the plain strings the client components receive. */
export const headerTexts = (c: SiteContent): HeaderTexts => ({
  homeAria: c.ui.homeLinkAria,
  mainNavAria: c.ui.mainNavAria,
  mobileNavAria: c.ui.mobileNavAria,
  menu: c.ui.menu,
  menuClose: c.ui.menuClose,
  menuHome: c.ui.menuHome,
  nav: visibleNav(c).map((n) => ({ href: n.href, label: n.label })),
  phone: { label: c.contact.phone, href: phoneHref(c) },
  email: { label: c.contact.email, href: emailHref(c) },
});

export const beforeAfterTexts = (c: SiteContent): BeforeAfterTexts => ({
  before: c.ui.before,
  after: c.ui.after,
  compare: c.ui.compare,
  sliderAria: c.ui.beforeAfterAria,
  valueText: c.ui.beforeValueText,
  groupAria: c.ui.viewGroupAria,
  caption: c.labels.illustrative.comparison,
});
