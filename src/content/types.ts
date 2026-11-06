type MediaId = string;
export type ProjectId = string;
type CategoryId = string;
type ServiceCategoryId = string;
type ServiceId = string;
type FilterId = string;

type Focal = { x: number; y: number }; // percent 0..100
type Weight = 300 | 800;
type Seg = { text: string; weight?: Weight }; // no weight = inherit
export type Rich = readonly Seg[];
type Cta = { label: string; href: string };
type IllustrativeKind = 'visual' | 'visual3d' | 'animation3d' | 'comparison';

export type MediaItem = {
  id: MediaId;
  file: string;
  width: number;
  height: number;
  alt: string;
  focal: Focal;
  illustrative: IllustrativeKind | null;
  /** Purely decorative picture: alt must stay empty. */
  decorative?: boolean;
  bytes?: number;
};
export type ImageRef = { media: MediaId; alt?: string; focal?: Focal };

/** Shape the Photo component reads. */
export type Img = { src: string; alt: string; focalX: number; focalY: number };

export type SiteSettings = { name: string; founded: { year: number; month: number }; demoMode: boolean };
export type Contact = { phone: string; email: string; address: string[] }; // hrefs derived; no city field
export type NavItem = { id: string; label: string; href: string; visible: boolean };

export type PageKey = 'home' | 'services' | 'studio' | 'contact' | 'projects';
export type PageSeo = { title: string; description?: string };
export type SeoContent = {
  titleTemplate: string;
  description: string;
  demoSuffix: string;
  ogImage?: ImageRef;
  pages: Record<PageKey, PageSeo>;
};

type UiKey =
  | 'skipLink'
  | 'menu'
  | 'menuClose'
  | 'menuHome'
  | 'homeLinkAria'
  | 'mainNavAria'
  | 'mobileNavAria'
  | 'footerNavAria'
  | 'viewProject'
  | 'nextProject'
  | 'allProjects'
  | 'filterAria'
  | 'projectsShown'
  | 'phone'
  | 'email'
  | 'address'
  | 'pages'
  | 'copyright'
  | 'before'
  | 'after'
  | 'compare'
  | 'beforeAfterAria'
  | 'beforeValueText'
  | 'viewGroupAria'
  | 'contactFormAria'
  | 'galleryAria'
  | 'enlargeImage'
  | 'prevImage'
  | 'nextImage'
  | 'closeImage'
  | 'spaceSequence'
  | 'kind'
  | 'scope'
  | 'status'
  | 'location'
  | 'year'
  | 'materials'
  | 'related';
export type UiStrings = Record<UiKey, string>;

export type ContentLabels = {
  concept: string;
  illustrative: Record<IllustrativeKind, string>;
  video: string;
  statusConcept: string;
  locationConcept: string;
};
/** Shown only while `site.demoMode` is on. */
export type DemoTexts = {
  footer: string;
  listing: string;
  servicesFootnote: string;
  studioTeaser: string;
  form: string;
  formSubmit: string;
};
export type FooterContent = { ctaHeading: Rich; cta: Cta; showCta: Record<PageKey | 'project', boolean> };

type Service = { id: ServiceId; name: string; desc: string };
export type ServiceCategory = {
  id: ServiceCategoryId;
  slug: string;
  name: string;
  sentence: string;
  image: ImageRef;
  projectId: ProjectId | null;
  services: Service[];
}; // the displayed number is derived from the position
export type ProcessStep = { id: string; title: string };

export type GallerySlot = 'wide' | 'landscape' | 'portrait' | 'square';
export type GalleryItem = { image: ImageRef; slot: GallerySlot; caption?: string };
type BeforeAfterPair = { before: ImageRef; after: ImageRef; lead: string };
type ProjectNote = { title: string; text: string };
export type Project = {
  id: ProjectId;
  slug: string;
  title: string;
  categoryId: CategoryId;
  kind: string;
  scope: ServiceId[];
  summary: string;
  narrative: string[];
  materials: string[];
  notes: ProjectNote[];
  concept: boolean;
  location?: string;
  year?: number;
  cover: ImageRef;
  hero: ImageRef;
  gallery: GalleryItem[];
  galleryNote?: string;
  beforeAfter?: BeforeAfterPair;
  video?: { file: string; poster: ImageRef };
  published: boolean;
  seo?: PageSeo;
};
export type ProjectCategory = { id: CategoryId; name: string };
export type ProjectFilter = {
  id: FilterId;
  slug: string;
  label: string;
  rule: { kind: 'all' } | { kind: 'category'; categoryId: CategoryId } | { kind: 'service'; serviceId: ServiceId };
};

type FeaturedSlot = { projectId: ProjectId; image: 'cover' | 'hero'; caption?: string };
export type HomeContent = {
  hero: {
    lines: Rich[];
    lead: string;
    primary: Cta;
    secondary: Cta;
    band: string[];
    anchor: string;
    posterDesktop: ImageRef;
    posterMobile: ImageRef;
  };
  intro: { sentence: Rich; paragraph: string; foundedLabel: string; servicesLabel: string; servicesLine: string };
  featured: { heading: string; link: string; slots: readonly [FeaturedSlot, FeaturedSlot, FeaturedSlot, FeaturedSlot] };
  beforeAfter: { projectId: ProjectId | null; heading: Rich; lead: string; hint: string; link: string }; // null hides the section
  materials: {
    heading: Rich;
    lead: string;
    items: { id: string; image: ImageRef; label: string; projectId: ProjectId }[];
  };
  services: { heading: Rich; button: string };
  process: { heading: Rich; text: string };
  studioTeaser: { heading: Rich; paragraphs: string[]; link: string; image: ImageRef };
};
export type ServicesPageContent = {
  heading: Rich;
  lead: string;
  processHeading: Rich;
  processLead: string;
  footnote: string;
};
export type StudioPageContent = {
  heading: Rich;
  lead: string;
  sentence: Rich;
  paragraph: string;
  image: ImageRef;
  imageCaption?: string;
  principles: { id: string; title: string; text: string }[];
  servicesHeading: Rich;
  officeHeading: string;
  contactLabel: string;
};
type ContactFormContent = {
  notifyTo: string;
  heading: string;
  note: string;
  fields: Record<'name' | 'phone' | 'email' | 'type' | 'location' | 'message', string>;
  locationEnabled: boolean;
  projectTypes: { id: string; label: string }[];
  errors: Record<'name' | 'phone' | 'email' | 'type' | 'message', string>;
  submit: string;
  success: string;
};
export type ContactPageContent = { heading: Rich; callLabel: string; mailLabel: string; form: ContactFormContent };
export type ProjectsPageContent = { title: string; lead: string };
export type ProjectPageContent = {
  notesHeading: Rich;
  notesHeadingReal: Rich;
  beforeAfterHeading: Rich;
  conceptNote: string;
};
export type Redirect = { id: string; from: string; to: string };

export type SiteContent = {
  version: 1;
  site: SiteSettings;
  contact: Contact;
  navigation: NavItem[];
  seo: SeoContent;
  ui: UiStrings;
  labels: ContentLabels;
  demo: DemoTexts;
  footer: FooterContent;
  home: HomeContent;
  serviceCategories: ServiceCategory[];
  processSteps: ProcessStep[];
  servicesPage: ServicesPageContent;
  studioPage: StudioPageContent;
  contactPage: ContactPageContent;
  projectsPage: ProjectsPageContent;
  projectPage: ProjectPageContent;
  projectCategories: ProjectCategory[];
  projectFilters: ProjectFilter[];
  projects: Project[];
  media: MediaItem[];
  redirects: Redirect[];
};

/** Mock only; not part of SiteContent. */
export type InboxMessage = {
  id: string;
  receivedAt: string;
  name: string;
  phone: string;
  email: string;
  projectType: string;
  location?: string;
  message: string;
  status: 'new' | 'read' | 'archived';
};
