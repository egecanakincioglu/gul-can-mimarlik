'use client';

import Button from '../../ui/Button';
import SelectField from '../../ui/SelectField';
import { LongField, TextField } from '../pages/common';
import KeyedList from './KeyedList';
import type { TabProps } from './tab-props';
import { slugify } from './slug';

export default function InfoTab({ w, set, draft, errors }: TabProps) {
  return (
    <div className="pj-body">
      <div data-pj-field="title">
        <TextField label="Başlık" value={w.title} error={errors.title} max={80} onChange={(title) => set({ title })} />
      </div>
      <div data-pj-field="slug">
        <TextField
          label="Sayfa adresi (URL)"
          value={w.slug}
          error={errors.slug}
          helper={`Sitede görünen adres: /projeler/${w.slug || '…'}. Yayındaki bir projede değiştirmek eski adrese yönlendirme ekler.`}
          onChange={(slug) => set({ slug })}
        />
        <Button onClick={() => set({ slug: slugify(w.title) })} disabled={!w.title.trim()}>
          Başlıktan üret
        </Button>
      </div>
      <div data-pj-field="category">
        <SelectField
          label="Kategori"
          value={w.categoryId}
          placeholder="Kategori seçin"
          options={[...draft.projectCategories.map((c) => ({ value: c.id, label: c.name }))]}
          onChange={(categoryId) => set({ categoryId })}
        />
      </div>
      <TextField
        label="Proje türü (örn. Konut)"
        value={w.kind}
        helper="Sayfada kategorinin yanında görünür."
        onChange={(kind) => set({ kind })}
      />

      <fieldset className="pj-scope">
        <legend className="label">Yapılan hizmetler</legend>
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
        accusative="paragrafı"
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
        accusative="malzemeyi"
        items={w.materials}
        onChange={(materials) => set({ materials })}
        make={() => ''}
        renderRow={(value, i, setValue) => <TextField label={`Malzeme ${i + 1}`} value={value} onChange={setValue} />}
      />
      <KeyedList
        title="Notlar"
        noun="Not"
        accusative="notu"
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

      {w.concept ? (
        <p className="caption">
          Konsept çalışmada konum ve yıl gösterilmez. Gerçek proje için Konsept sekmesinden kapatın.
        </p>
      ) : (
        <>
          <div data-pj-field="location">
            <TextField label="Konum" value={w.location} onChange={(location) => set({ location })} />
          </div>
          <div data-pj-field="year">
            <TextField label="Yıl" value={w.year} error={errors.year} onChange={(year) => set({ year })} />
          </div>
        </>
      )}
    </div>
  );
}
