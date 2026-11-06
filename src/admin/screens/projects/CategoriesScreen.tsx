'use client';

import { useState } from 'react';
import { useAdminStore } from '../../store/AdminStoreProvider';
import Button from '../../ui/Button';
import Dialog from '../../ui/Dialog';
import SortableList from '../../ui/SortableList';
import Section from '../../ui/Section';
import { Screen, TextField } from '../pages/common';
import { categoryUsage, filterUsage, newCategoryId, ruleText } from './categories';
import { SLUG_PATTERN } from './slug';
import './projects.css';

type Target = { kind: 'category' | 'filter'; id: string };

export default function CategoriesScreen() {
  const { draft, updateDraft } = useAdminStore();
  const [confirm, setConfirm] = useState<Target | null>(null);
  const [blocked, setBlocked] = useState<{ name: string; usage: string[] } | null>(null);

  const askedName =
    confirm?.kind === 'category'
      ? draft.projectCategories.find((x) => x.id === confirm.id)?.name
      : draft.projectFilters.find((x) => x.id === confirm?.id)?.label;

  const request = (target: Target, name: string, usage: string[]) => {
    if (usage.length) {
      setBlocked({ name, usage });
      return;
    }
    setBlocked(null);
    setConfirm(target);
  };

  const remove = () => {
    if (!confirm) return;
    updateDraft((c) =>
      confirm.kind === 'category'
        ? { ...c, projectCategories: c.projectCategories.filter((x) => x.id !== confirm.id) }
        : { ...c, projectFilters: c.projectFilters.filter((x) => x.id !== confirm.id) },
    );
    setConfirm(null);
  };

  const slugError = (id: string, slug: string) => {
    if (!SLUG_PATTERN.test(slug)) return 'Yalnız küçük harf, rakam ve tire kullanın.';
    if (draft.projectFilters.some((f) => f.id !== id && f.slug === slug)) return 'Bu adres başka bir filtrede var.';
    return undefined;
  };

  return (
    <Screen title="Kategoriler">
      <Section title="Proje kategorileri" defaultOpen>
        {draft.projectCategories.length === 0 && <p className="caption">Henüz kategori yok.</p>}
        <SortableList
          items={draft.projectCategories}
          getId={(x) => x.id}
          getLabel={(x) => x.name || x.id}
          onChange={(projectCategories) => updateDraft((c) => ({ ...c, projectCategories }))}
          renderItem={(x, i) => (
            <span className="pg-stack">
              <TextField
                label={`${i + 1}. kategori adı`}
                value={x.name}
                error={x.name.trim() ? undefined : 'Ad boş bırakılamaz.'}
                onChange={(name) =>
                  updateDraft((c) => ({
                    ...c,
                    projectCategories: c.projectCategories.map((y) => (y.id === x.id ? { ...y, name } : y)),
                  }))
                }
              />
              <Button
                variant="destructive"
                aria-label={`Kategoriyi sil: ${x.name || x.id}`}
                onClick={() => request({ kind: 'category', id: x.id }, x.name || x.id, categoryUsage(draft, x))}
              >
                Sil
              </Button>
            </span>
          )}
        />
        <Button
          onClick={() =>
            updateDraft((c) => ({
              ...c,
              projectCategories: [...c.projectCategories, { id: newCategoryId(c), name: '' }],
            }))
          }
        >
          Kategori ekle
        </Button>
      </Section>

      <Section title="Arşiv filtreleri" defaultOpen>
        <p className="caption">
          Projeler sayfasındaki filtre düğmeleri. Kural, hangi projelerin gösterileceğini belirler.
        </p>
        <SortableList
          items={draft.projectFilters}
          getId={(f) => f.id}
          getLabel={(f) => f.label || f.id}
          onChange={(projectFilters) => updateDraft((c) => ({ ...c, projectFilters }))}
          renderItem={(f, i) => (
            <span className="pg-stack">
              <TextField
                label={`${i + 1}. filtre adı`}
                value={f.label}
                error={f.label.trim() ? undefined : 'Ad boş bırakılamaz.'}
                onChange={(label) =>
                  updateDraft((c) => ({
                    ...c,
                    projectFilters: c.projectFilters.map((y) => (y.id === f.id ? { ...y, label } : y)),
                  }))
                }
              />
              <TextField
                label={`${i + 1}. filtre sayfa adresi (URL)`}
                value={f.slug}
                error={slugError(f.id, f.slug)}
                onChange={(slug) =>
                  updateDraft((c) => ({
                    ...c,
                    projectFilters: c.projectFilters.map((y) => (y.id === f.id ? { ...y, slug } : y)),
                  }))
                }
              />
              <p>
                <span className="label">Kural</span> {ruleText(draft, f)}
              </p>
              <Button
                variant="destructive"
                aria-label={`Filtreyi sil: ${f.label || f.id}`}
                onClick={() => request({ kind: 'filter', id: f.id }, f.label || f.id, filterUsage(f))}
              >
                Sil
              </Button>
            </span>
          )}
        />
      </Section>

      {blocked && (
        <div role="alert" className="adm-error">
          <p className="label">Hata</p>
          <p>{blocked.name} silinemez:</p>
          <ul>
            {blocked.usage.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={confirm !== null} onClose={() => setConfirm(null)} title="Silinsin mi?">
        <p>{askedName} kalıcı olarak silinir.</p>
        <div className="adm-dialog-actions">
          <Button onClick={() => setConfirm(null)}>Vazgeç</Button>
          <Button variant="destructive" onClick={remove}>
            Sil
          </Button>
        </div>
      </Dialog>
    </Screen>
  );
}
