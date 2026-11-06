'use client';

import { useState } from 'react';
import Button from '../../ui/Button';
import Dialog from '../../ui/Dialog';
import Toggle from '../../ui/Toggle';
import type { TabProps } from './tab-props';

export default function ConceptTab({ w, set, draft }: TabProps) {
  const { labels, projectPage, site } = draft;
  const [confirm, setConfirm] = useState(false);

  const turnOn = () => {
    set({ concept: true, location: '', year: '' });
    setConfirm(false);
  };

  return (
    <div className="pj-body">
      <Toggle
        checked={w.concept}
        label="Konsept çalışma"
        onChange={(concept) => {
          if (!concept) set({ concept });
          else if (w.location.trim() || w.year.trim()) setConfirm(true);
          else turnOn();
        }}
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

      <Dialog open={confirm} onClose={() => setConfirm(false)} title="Konsept çalışma açılsın mı?">
        <p>Konum ve yıl boşaltılır. Kapatsanız bile bu bilgiler geri gelmez.</p>
        <div className="adm-dialog-actions">
          <Button onClick={() => setConfirm(false)}>Vazgeç</Button>
          <Button variant="primary" onClick={turnOn}>
            Konsepti aç
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
