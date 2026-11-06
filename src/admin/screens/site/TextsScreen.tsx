'use client';

import { useId } from 'react';
import { useAdminStore } from '../../store/AdminStoreProvider';
import Table from '../../ui/Table';
import { ScreenFrame, Section } from './Frame';
import { tokenError, tokenHelper } from '../shared/tokens.ts';
import { requiredText } from './rules';
import { GROUPS, textRows } from './texts';
import type { TextRow } from './texts';

function TextInput({ row, error, onChange }: { row: TextRow; error?: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="adm-site-cell">
      <input
        type="text"
        aria-label={row.name}
        aria-describedby={
          [row.tokens.length > 0 && `${id}-helper`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
        }
        aria-invalid={error ? true : undefined}
        value={row.value}
        onChange={(e) => onChange(e.target.value)}
      />
      {row.tokens.length > 0 && (
        <p id={`${id}-helper`} className="caption">
          {tokenHelper(row.tokens)}
        </p>
      )}
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
      intro="Sitede tekrar eden kısa metinler. Süslü parantez içindeki ifadeler (örneğin {n}) otomatik doldurulur; olduğu gibi bırakın."
    >
      {GROUPS.map((group) => (
        <Section key={group} title={group}>
          <Table
            caption={`${group} metinleri`}
            rows={rows.filter((r) => r.group === group)}
            getKey={(r) => r.id}
            columns={[
              { id: 'name', header: 'Ad', render: (r) => r.name },
              {
                id: 'value',
                header: 'Metin',
                render: (r) => (
                  <TextInput
                    row={r}
                    error={requiredText(r.value) ?? tokenError(r.tokens, r.value)}
                    onChange={(v) => updateDraft((c) => r.set(c, v))}
                  />
                ),
              },
              {
                id: 'impact',
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
