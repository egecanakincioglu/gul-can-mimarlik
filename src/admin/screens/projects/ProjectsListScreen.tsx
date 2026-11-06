'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Project } from '@/content/types';
import { useAdminStore } from '../../store/AdminStoreProvider';
import EmptyState from '../../ui/EmptyState';
import Notice from '../../ui/Notice';
import SortableList from '../../ui/SortableList';
import SelectField from '../../ui/SelectField';
import { Screen, TextField } from '../pages/common';
import { fromProject, mergeOrder, publishGaps } from './model';
import './projects.css';

export default function ProjectsListScreen() {
  const { draft, updateDraft } = useAdminStore();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [refused, setRefused] = useState<{ project: Project; gaps: string[] } | null>(null);

  const needle = query.trim().toLocaleLowerCase('tr');
  const shown = draft.projects.filter(
    (p) => (!category || p.categoryId === category) && (!needle || p.title.toLocaleLowerCase('tr').includes(needle)),
  );
  const setPublished = (p: Project, published: boolean) => {
    if (published) {
      const gaps = publishGaps(draft, fromProject(p));
      if (gaps.length) {
        setRefused({ project: p, gaps });
        return;
      }
    }
    setRefused(null);
    updateDraft((c) => ({ ...c, projects: c.projects.map((x) => (x.id === p.id ? { ...x, published } : x)) }));
  };
  const position = (p: Project) => draft.projects.findIndex((x) => x.id === p.id) + 1;

  return (
    <Screen title="Projeler">
      {draft.projects.length > 0 && (
        <p className="pj-new">
          <Link href="/yonetim/projeler/yeni" className="adm-btn">
            Yeni proje
          </Link>
        </p>
      )}
      <p className="caption pj-order-note">
        Sıra, projelerin listedeki ve &ldquo;Sonraki proje&rdquo; bağlantısındaki sırasını belirler.
      </p>

      {draft.projects.length === 0 ? (
        <EmptyState
          message="Henüz proje yok."
          description="İlk projenizi ekleyince burada listelenir."
          actionLabel="Yeni proje"
          href="/yonetim/projeler/yeni"
        />
      ) : (
        <>
          <div className="pj-filters">
            <TextField label="Ara" value={query} onChange={setQuery} />
            <SelectField
              label="Kategori"
              value={category}
              options={[
                { value: '', label: 'Tümü' },
                ...draft.projectCategories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              onChange={setCategory}
            />
          </div>
          {refused && (
            <Notice variant="error">
              <p>
                {refused.project.title || refused.project.slug} yayınlanamadı. Eksik: {refused.gaps.join(', ')}.
              </p>
              <Link href={`/yonetim/projeler/${refused.project.slug}`} className="tlink">
                Projeyi düzenle
              </Link>
            </Notice>
          )}
          {shown.length === 0 ? (
            <EmptyState message="Aramaya uyan proje yok." description="Aramayı ya da kategori seçimini değiştirin." />
          ) : (
            <SortableList
              items={shown}
              getId={(p) => p.id}
              getLabel={(p) => p.title}
              onChange={(next) => updateDraft((c) => ({ ...c, projects: mergeOrder(c.projects, next) }))}
              renderItem={(p) => {
                const cover = draft.media.find((m) => m.id === p.cover.media);
                return (
                  <span className="adm-row">
                    <span className="pj-thumb">
                      {cover && (
                        // eslint-disable-next-line @next/next/no-img-element -- local object URLs cannot go through the image optimizer
                        <img src={cover.file} alt="" loading="lazy" decoding="async" />
                      )}
                    </span>
                    <span className="pj-row-main">
                      <Link href={`/yonetim/projeler/${p.slug}`} className="tlink">
                        {p.title || p.slug}
                      </Link>
                      <span className="caption">
                        {position(p)}. sıra ·{' '}
                        {draft.projectCategories.find((c) => c.id === p.categoryId)?.name ?? 'Kategori yok'}
                      </span>
                    </span>
                    <span className="pj-badges">
                      <span className={p.published ? 'badge pj-badge-on' : 'badge'}>
                        {p.published ? 'Yayında' : 'Taslak'}
                      </span>
                      {p.concept && <span className="pj-tag">Konsept</span>}
                    </span>
                    <span className="adm-toggle-row">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={p.published}
                        aria-label={`Yayında: ${p.title || p.slug}`}
                        className="adm-toggle"
                        onClick={() => setPublished(p, !p.published)}
                      >
                        <span className="adm-toggle-knob" aria-hidden="true" />
                      </button>
                      <span className="caption" aria-hidden="true">
                        Yayında
                      </span>
                    </span>
                  </span>
                );
              }}
            />
          )}
        </>
      )}
    </Screen>
  );
}
