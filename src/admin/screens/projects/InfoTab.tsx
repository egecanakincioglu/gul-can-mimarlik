'use client';

import Button from '../../ui/Button';
import Toggle from '../../ui/Toggle';
import { LongField, SelectField, TextField } from '../pages/common';
import KeyedList from './KeyedList';
import type { TabProps } from './tab-props';
import { slugify } from './slug';

export default function InfoTab({ w, set, draft, errors, gaps, blockedPublish }: TabProps) {
  return (
    <div className="pg-section-body">
      <TextField label="Başlık" value={w.title} error={errors.title} max={80} onChange={(title) => set({ title })} />
      <TextField
        label="Adres (slug)"
        value={w.slug}
        error={errors.slug}
        helper={`Sayfa adresi: /projeler/${w.slug || '…'}`}
        onChange={(slug) => set({ slug })}
      />
      <Button onClick={() => set({ slug: slugify(w.title) })} disabled={!w.title.trim()}>
        Başlıktan üret
      </Button>
      <SelectField
        label="Kategori"
        value={w.categoryId}
        options={[
          { value: '', label: 'Seçin', disabled: true },
          ...draft.projectCategories.map((c) => ({ value: c.id, label: c.name })),
        ]}
        onChange={(categoryId) => set({ categoryId })}
      />
      <TextField
        label="Tür"
        value={w.kind}
        helper="Örneğin Konut. Sayfada kategorinin yanında görünür."
        onChange={(kind) => set({ kind })}
      />

      <fieldset className="pj-scope">
        <legend className="label">Kapsam (hizmetler)</legend>
        {draft.serviceCategories.map((cat) => (
          <div key={cat.id} className="pj-scope-group">
            <p className="caption">{cat.name}</p>
            {cat.services.map((s) => (
              <label key={s.id} className="pj-check">
                <input
                  type="checkbox"
                  checked={w.scope.includes(s.id)}
                  onChange={(e) =>
                    set({ scope: e.target.checked ? [...w.scope, s.id] : w.scope.filter((x) => x !== s.id) })
                  }
                />
                {s.name}
              </label>
            ))}
          </div>
        ))}
      </fieldset>

      <LongField label="Özet" value={w.summary} rows={3} max={220} onChange={(summary) => set({ summary })} />

      <KeyedList
        title="Anlatım"
        noun="Paragraf"
        items={w.narrative}
        onChange={(narrative) => set({ narrative })}
        make={() => ''}
        renderRow={(value, i, setValue) => (
          <LongField label={`Paragraf ${i + 1}`} value={value} rows={3} onChange={setValue} />
        )}
      />
      <KeyedList
        title="Malzemeler"
        noun="Malzeme"
        items={w.materials}
        onChange={(materials) => set({ materials })}
        make={() => ''}
        renderRow={(value, i, setValue) => <TextField label={`Malzeme ${i + 1}`} value={value} onChange={setValue} />}
      />
      <KeyedList
        title="Notlar"
        noun="Not"
        items={w.notes}
        onChange={(notes) => set({ notes })}
        make={() => ({ title: '', text: '' })}
        renderRow={(value, i, setValue) => (
          <>
            <TextField
              label={`Not ${i + 1}: başlık`}
              value={value.title}
              onChange={(title) => setValue({ ...value, title })}
            />
            <LongField
              label={`Not ${i + 1}: metin`}
              value={value.text}
              rows={2}
              onChange={(text) => setValue({ ...value, text })}
            />
          </>
        )}
      />

      {!w.concept && (
        <>
          <TextField label="Konum" value={w.location} onChange={(location) => set({ location })} />
          <TextField label="Yıl" value={w.year} error={errors.year} onChange={(year) => set({ year })} />
        </>
      )}

      <div className="pj-publish">
        <Toggle checked={w.published} label="Yayında" onChange={(published) => set({ published })} />
        {gaps.length > 0 && (
          <p className="pg-warning" role={blockedPublish ? 'alert' : 'status'}>
            <strong>{blockedPublish ? 'Hata: ' : 'Uyarı: '}</strong>
            Yayınlamak için eksik: {gaps.join(', ')}.
          </p>
        )}
      </div>
    </div>
  );
}
