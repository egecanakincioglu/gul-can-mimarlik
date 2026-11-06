import { contactPage } from './seed/contact';
import { home } from './seed/home';
import { media } from './seed/media';
import { projectCategories, projectFilters, projectPage, projects, projectsPage } from './seed/projects';
import { seo } from './seed/seo';
import { processSteps, serviceCategories, servicesPage } from './seed/services';
import { contact, footer, navigation, redirects, site } from './seed/site';
import { studioPage } from './seed/studio';
import { demo, labels, ui } from './seed/strings';
import type { SiteContent } from './types';

const seed: SiteContent = {
  version: 1,
  site,
  contact,
  navigation,
  seo,
  ui,
  labels,
  demo,
  footer,
  home,
  serviceCategories,
  processSteps,
  servicesPage,
  studioPage,
  contactPage,
  projectsPage,
  projectPage,
  projectCategories,
  projectFilters,
  projects,
  media,
  redirects,
};

/** Pages read the content through this call; the source can change without touching them. */
export async function getContent(): Promise<SiteContent> {
  return seed;
}
