'use client';

import { useId } from 'react';
import { useAdminStore } from '../../store/AdminStoreProvider';
import Table from '../../ui/Table';
import { ScreenFrame, Section } from './Frame';
import { requiredText, tokenError } from './rules';
import { GROUPS, textRows } from './texts';
import type { TextRow } from './texts';

function TextInput({ row, error, onChange }: { row: TextRow; error?: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="adm-site-cell">
      <input
        type="text"
        aria-label={row.name}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? true : undefined}
        value={row.value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p id={`${id}-error`} className="err">
          {error}
        </p>
      )}
    </div>
  );
}

export default function TextsScreen() {
  const { draft, updateDraft } = useAdminStore();
  const rows = textRows(draft);

  return (
    <ScreenFrame
      title="Metinler"
      intro="Sitede tekrar eden kısa metinler. {n}, {year} gibi yer tutucular korunmalıdır."
    >
      {GROUPS.map((group) => (
        <Section key={group} title={group}>
          <Table
            caption={`${group} metinleri`}
            rows={rows.filter((r) => r.group === group)}
            getKey={(r) => r.id}
            columns={[
              { key: 'name', header: 'Ad', render: (r) => r.name },
              {
                key: 'value',
                header: 'Metin',
                render: (r) => (
                  <TextInput
                    row={r}
                    error={requiredText(r.value) ?? tokenError(draft, r.value)}
                    onChange={(v) => updateDraft((c) => r.set(c, v))}
                  />
                ),
              },
              {
                key: 'impact',
                header: 'Etki',
                render: (r) => (
                  <span className="adm-site-impact">{r.impact > 0 ? `${r.impact} yerde` : 'Kullanılmıyor'}</span>
                ),
              },
            ]}
          />
        </Section>
      ))}
    </ScreenFrame>
  );
}
