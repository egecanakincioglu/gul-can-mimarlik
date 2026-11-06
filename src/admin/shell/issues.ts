import type { Issue } from '@/content/validate';

const SCREENS: [prefix: string, href: string][] = [
  ['media', '/yonetim/medya'],
  ['projectFilters', '/yonetim/kategoriler'],
  ['projectCategories', '/yonetim/kategoriler'],
  ['projectsPage', '/yonetim/projeler-sayfasi'],
  ['projectPage', '/yonetim/metinler'],
  ['projects', '/yonetim/projeler'],
  ['home', '/yonetim/ana-sayfa'],
  ['serviceCategories', '/yonetim/hizmetler'],
  ['servicesPage', '/yonetim/hizmetler'],
  ['processSteps', '/yonetim/surec-adimlari'],
  ['studioPage', '/yonetim/studyo'],
  ['contactPage', '/yonetim/iletisim-sayfasi'],
  ['contact', '/yonetim/iletisim-bilgileri'],
  ['navigation', '/yonetim/gezinme'],
  ['seo', '/yonetim/seo'],
  ['redirects', '/yonetim/yonlendirmeler'],
  ['footer', '/yonetim/alt-bilgi'],
  ['site', '/yonetim/site-ayarlari'],
  ['ui', '/yonetim/metinler'],
  ['labels', '/yonetim/metinler'],
  ['demo', '/yonetim/metinler'],
];

const TEXT = new Map<string, string>([
  ['empty-alt', 'Görsel açıklaması boş'],
  ['missing-media', 'Görsel bulunamadı'],
  ['missing-category', 'Kategori bulunamadı'],
  ['missing-service', 'Hizmet bulunamadı'],
  ['missing-project', 'Proje bulunamadı'],
  ['aspect-mismatch', 'Görsel oranı alana uymuyor'],
  ['featured-count', 'Seçili çalışmalarda 4 alan dolu olmalı'],
  ['featured-unpublished', 'Seçili çalışmalardaki proje yayında değil'],
  ['before-after-missing', 'Seçilen projede önce/sonra çifti yok'],
  ['real-project-needs-location-year', 'Gerçek projede konum ve yıl gerekli'],
  ['concept-has-location-year', 'Konsept projede konum ve yıl olmaz'],
  ['title-template-missing-placeholder', 'Başlık şablonunda %s yok'],
  ['unknown-token', 'Bilinmeyen yer tutucu'],
  ['rich-empty-segment', 'Vurgulu metinde boş parça var'],
  ['redirect-duplicate-from', 'Yönlendirme kaynağı tekrar ediyor'],
  ['redirect-self', 'Yönlendirme kendine gidiyor'],
  ['redirect-shadows-project', 'Yönlendirme yayındaki bir projeyi gölgeliyor'],
  ['redirect-dangling', 'Yönlendirme hedefi yayında değil'],
  ['redirect-chain', 'Yönlendirme zincirleniyor'],
]);

/** Turkish message and the panel screen that fixes the issue. */
export const describeIssue = (issue: Issue): { text: string; href: string } => {
  const root = issue.path.split(/[.[]/)[0];
  const href = SCREENS.find(([prefix]) => prefix === root)?.[1] ?? '/yonetim';
  const text = issue.code.startsWith('duplicate-')
    ? 'Tekrarlanan kayıt'
    : (TEXT.get(issue.code) ?? 'Düzeltilmesi gereken bir alan var');
  return { text, href };
};
