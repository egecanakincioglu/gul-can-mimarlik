'use client';

import Toggle from '../../ui/Toggle';
import type { TabProps } from './tab-props';

export default function ConceptTab({ w, set, draft }: TabProps) {
  const { labels, projectPage, site } = draft;
  return (
    <div className="pg-section-body">
      <Toggle
        checked={w.concept}
        label="Konsept çalışma"
        onChange={(concept) => set(concept ? { concept, location: '', year: '' } : { concept })}
      />
      <p className="caption">
        Açıkken projede &ldquo;{labels.concept}&rdquo; etiketi ve şu not görünür: &ldquo;{projectPage.conceptNote}
        &rdquo;. Konum ve yıl gösterilmez; Bilgiler sekmesindeki alanlar gizlenir ve boşaltılır. Kapalıyken konum ve yıl
        zorunludur.
      </p>
      <p className="caption">
        Demo modu şu an {site.demoMode ? 'açık' : 'kapalı'}. Demo metinleri Site ayarları ekranından yönetilir; konsept
        işareti demo moduna bağlı değildir.
      </p>
    </div>
  );
}
