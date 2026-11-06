'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Project } from '@/content/types';
import { useAdminStore } from '../../store/AdminStoreProvider';
import SortableList from '../../ui/SortableList';
import { Screen, SelectField, TextField } from '../pages/common';
import { mergeOrder } from './model';
import './projects.css';

export default function ProjectsListScreen() {
  const { draft, updateDraft } = useAdminStore();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const needle = query.trim().toLocaleLowerCase('tr');
  const shown = draft.projects.filter(
    (p) => (!category || p.categoryId === category) && (!needle || p.title.toLocaleLowerCase('tr').includes(needle)),
  );
  const position = (p: Project) => draft.projects.findIndex((x) => x.id === p.id) + 1;

  return (
    <Screen title="Projeler">
      <p>
        <Link href="/yonetim/projeler/yeni" className="btn">
          Yeni proje
        </Link>
      </p>
      <p className="caption">
        Sıra, projelerin listedeki ve &ldquo;Sonraki proje&rdquo; bağlantısındaki sırasını belirler.
      </p>

      {draft.projects.length === 0 ? (
        <div className="adm-empty">
          <p>Henüz proje yok.</p>
        </div>
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
          {shown.length === 0 ? (
            <p>Aramaya uyan proje yok.</p>
          ) : (
            <SortableList
              items={shown}
              getId={(p) => p.id}
              getLabel={(p) => p.title}
              onChange={(next) => updateDraft((c) => ({ ...c, projects: mergeOrder(c.projects, next) }))}
              renderItem={(p) => {
                const cover = draft.media.find((m) => m.id === p.cover.media);
                return (
                  <span className="pj-row">
                    <span className="pj-thumb">
                      {cover && (
                        // eslint-disable-next-line @next/next/no-img-element -- local object URLs cannot go through the image optimizer
                        <img src={cover.file} alt="" />
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
                      <span className="badge">{p.published ? 'Yayında' : 'Taslak'}</span>
                      {p.concept && <span className="badge">Konsept</span>}
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
