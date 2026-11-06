import { imageRefs, publishedProjects } from '@/content/select';
import { labels as defaultLabels, ui as defaultUi } from '@/content/seed/strings';
import type { SiteContent, UiStrings } from '@/content/types';
import { allowedTokens } from '../shared/tokens.ts';

export type TextGroup = 'Genel' | 'Erişilebilirlik' | 'Proje' | 'Önce/Sonra' | 'Footer' | 'Etiketler';
export const GROUPS: TextGroup[] = ['Genel', 'Erişilebilirlik', 'Proje', 'Önce/Sonra', 'Footer', 'Etiketler'];

type Scope = 'site' | 'projects' | 'listing' | 'beforeAfter' | 'contact';
type UiKey = keyof UiStrings;

const UI_META: Record<UiKey, { name: string; group: TextGroup; scope: Scope }> = {
  skipLink: { name: 'İçeriğe geç bağlantısı', group: 'Erişilebilirlik', scope: 'site' },
  menu: { name: 'Menü düğmesi', group: 'Genel', scope: 'site' },
  menuClose: { name: 'Menüyü kapat', group: 'Genel', scope: 'site' },
  menuHome: { name: 'Mobil menüde ana sayfa', group: 'Genel', scope: 'site' },
  homeLinkAria: { name: 'Logo bağlantısı açıklaması', group: 'Erişilebilirlik', scope: 'site' },
  mainNavAria: { name: 'Ana menü açıklaması', group: 'Erişilebilirlik', scope: 'site' },
  mobileNavAria: { name: 'Mobil menü açıklaması', group: 'Erişilebilirlik', scope: 'site' },
  footerNavAria: { name: 'Alt menü açıklaması', group: 'Erişilebilirlik', scope: 'site' },
  viewProject: { name: 'Projeyi incele bağlantısı', group: 'Proje', scope: 'projects' },
  nextProject: { name: 'Sonraki proje', group: 'Proje', scope: 'projects' },
  allProjects: { name: 'Tüm projeler', group: 'Genel', scope: 'listing' },
  filterAria: { name: 'Kategori filtresi açıklaması', group: 'Erişilebilirlik', scope: 'listing' },
  projectsShown: { name: 'Gösterilen proje sayısı', group: 'Genel', scope: 'listing' },
  phone: { name: 'Telefon başlığı', group: 'Footer', scope: 'site' },
  email: { name: 'E-posta başlığı', group: 'Footer', scope: 'site' },
  address: { name: 'Adres başlığı', group: 'Footer', scope: 'site' },
  pages: { name: 'Sayfalar başlığı', group: 'Footer', scope: 'site' },
  copyright: { name: 'Telif satırı', group: 'Footer', scope: 'site' },
  before: { name: 'Önce', group: 'Önce/Sonra', scope: 'beforeAfter' },
  after: { name: 'Sonra', group: 'Önce/Sonra', scope: 'beforeAfter' },
  compare: { name: 'Karşılaştır', group: 'Önce/Sonra', scope: 'beforeAfter' },
  beforeAfterAria: { name: 'Karşılaştırma açıklaması', group: 'Önce/Sonra', scope: 'beforeAfter' },
  beforeValueText: { name: 'Karşılaştırma değer metni', group: 'Önce/Sonra', scope: 'beforeAfter' },
  viewGroupAria: { name: 'Görünüm grubu açıklaması', group: 'Erişilebilirlik', scope: 'listing' },
  contactFormAria: { name: 'İletişim formu açıklaması', group: 'Erişilebilirlik', scope: 'contact' },
  galleryAria: { name: 'Galeri açıklaması', group: 'Erişilebilirlik', scope: 'projects' },
  enlargeImage: { name: 'Görseli büyüt', group: 'Proje', scope: 'projects' },
  prevImage: { name: 'Önceki görsel', group: 'Proje', scope: 'projects' },
  nextImage: { name: 'Sonraki görsel', group: 'Proje', scope: 'projects' },
  closeImage: { name: 'Görseli kapat', group: 'Proje', scope: 'projects' },
  spaceSequence: { name: 'Mekân dizisi', group: 'Proje', scope: 'projects' },
  kind: { name: 'Tür', group: 'Proje', scope: 'projects' },
  scope: { name: 'Kapsam', group: 'Proje', scope: 'projects' },
  status: { name: 'Durum', group: 'Proje', scope: 'projects' },
  location: { name: 'Konum', group: 'Proje', scope: 'projects' },
  year: { name: 'Yıl', group: 'Proje', scope: 'projects' },
  materials: { name: 'Malzeme paleti', group: 'Proje', scope: 'projects' },
  related: { name: 'İlgili konsept proje', group: 'Proje', scope: 'projects' },
};

export type TextRow = {
  id: string;
  group: TextGroup;
  name: string;
  value: string;
  set: (c: SiteContent, value: string) => SiteContent;
  /** Number of places on the public site that show this text. */
  impact: number;
  /** Tokens such as `services` that the default text contains; no others are allowed. */
  tokens: string[];
};

const scopeImpact = (c: SiteContent, scope: Scope): number => {
  const live = publishedProjects(c);
  switch (scope) {
    case 'site':
      return Object.keys(c.seo.pages).length + live.length;
    case 'projects':
      return live.length;
    case 'listing':
    case 'contact':
      return 1;
    case 'beforeAfter':
      return (c.home.beforeAfter.projectId === null ? 0 : 1) + live.filter((p) => p.beforeAfter).length;
  }
};

const ILLUSTRATIVE_NAMES = {
  visual: 'İllüstratif görsel',
  visual3d: 'İllüstratif 3D görselleştirme',
  animation3d: 'İllüstratif 3D animasyon',
  comparison: 'İllüstratif karşılaştırma',
} as const;

export const textRows = (c: SiteContent): TextRow[] => {
  const rows: TextRow[] = (Object.keys(UI_META) as UiKey[]).map((key) => ({
    id: `ui.${key}`,
    group: UI_META[key].group,
    name: UI_META[key].name,
    value: c.ui[key],
    set: (s, value) => ({ ...s, ui: { ...s.ui, [key]: value } }),
    impact: scopeImpact(c, UI_META[key].scope),
    tokens: allowedTokens(defaultUi[key]),
  }));

  const mediaKind = new Map(c.media.map((m) => [m.id, m.illustrative]));
  const refs = imageRefs(c);
  (Object.keys(ILLUSTRATIVE_NAMES) as (keyof typeof ILLUSTRATIVE_NAMES)[]).forEach((kind) => {
    rows.push({
      id: `labels.illustrative.${kind}`,
      group: 'Etiketler',
      name: ILLUSTRATIVE_NAMES[kind],
      value: c.labels.illustrative[kind],
      set: (s, value) => ({ ...s, labels: { ...s.labels, illustrative: { ...s.labels.illustrative, [kind]: value } } }),
      impact: refs.filter((r) => mediaKind.get(r.ref.media) === kind).length,
      tokens: allowedTokens(defaultLabels.illustrative[kind]),
    });
  });
  rows.push({
    id: 'labels.video',
    group: 'Etiketler',
    name: 'Video rozeti',
    value: c.labels.video,
    set: (s, value) => ({ ...s, labels: { ...s.labels, video: value } }),
    impact: c.projects.filter((p) => p.video).length,
    tokens: allowedTokens(defaultLabels.video),
  });
  return rows;
};
