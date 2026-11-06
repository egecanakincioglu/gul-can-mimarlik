'use client';

import type { NavItem } from '@/content/types';
import { useAdminStore } from '../../store/AdminStoreProvider';
import Field from '../../ui/Field';
import SortableList from '../../ui/SortableList';
import Toggle from '../../ui/Toggle';
import EmptyState from '../../ui/EmptyState';
import Notice from '../../ui/Notice';
import { ScreenFrame, Section } from './Frame';
import { hrefError, requiredText } from './rules';

const LABEL_MAX = 16;

export default function NavigationScreen() {
  const { draft, updateDraft } = useAdminStore();
  const items = draft.navigation;

  const patch = (id: string, change: Partial<NavItem>) =>
    updateDraft((c) => ({ ...c, navigation: c.navigation.map((n) => (n.id === id ? { ...n, ...change } : n)) }));

  return (
    <ScreenFrame
      title="Gezinme"
      intro="Üst menüde ve alt bilgide görünen bağlantılar. Sıra, sayfadaki sırayı belirler."
    >
      <Section title="Bağlantılar">
        <SortableList
          items={items}
          getId={(n) => n.id}
          getLabel={(n) => n.label || n.href}
          onChange={(navigation) => updateDraft((c) => ({ ...c, navigation }))}
          renderItem={(n, i) => (
            <div className="adm-site-row">
              <Field
                boxed
                label={`Etiket (${i + 1}. öğe)`}
                value={n.label}
                max={LABEL_MAX}
                error={requiredText(n.label, LABEL_MAX)}
                onChange={(label) => patch(n.id, { label })}
              />
              <Field
                boxed
                label={`Bağlantı (${i + 1}. öğe)`}
                value={n.href}
                helper="Örnek: /projeler veya https://…"
                error={hrefError(n.href)}
                onChange={(href) => patch(n.id, { href })}
              />
              <Toggle
                checked={n.visible}
                label={`Görünür: ${n.label || n.href}`}
                onChange={(visible) => patch(n.id, { visible })}
              />
            </div>
          )}
        />
        {items.length === 0 && (
          <EmptyState
            message="Henüz bağlantı yok."
            description="Menüde gösterilecek bir bağlantı olmadığı için menü boş kalır."
          />
        )}
        {items.length > 0 && items.every((n) => !n.visible) && (
          <Notice variant="warning">Hiçbir bağlantı görünür değil; menü boş kalır.</Notice>
        )}
      </Section>

      <Section title="Mobil menü">
        <Field
          boxed
          label="Ana sayfa bağlantısı"
          value={draft.ui.menuHome}
          max={LABEL_MAX}
          error={requiredText(draft.ui.menuHome, LABEL_MAX)}
          helper="Mobil menünün ilk satırı; listedeki bağlantılardan ayrıdır."
          onChange={(menuHome) => updateDraft((c) => ({ ...c, ui: { ...c.ui, menuHome } }))}
        />
      </Section>
    </ScreenFrame>
  );
}
