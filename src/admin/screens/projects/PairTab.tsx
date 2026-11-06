'use client';

import { useState } from 'react';
import ImagePicker from '../media/ImagePicker';
import { RATIOS } from '../media/ratios';
import { LongField, SelectField } from '../pages/common';
import type { TabProps } from './tab-props';

export default function PairTab({ w, set, draft, errors }: TabProps) {
  const { media } = draft;
  const [pos, setPos] = useState(50);
  const [side, setSide] = useState<'before' | 'after'>('before');
  const { before, after, mode } = w.pair;
  const file = (ref: typeof before) => media.find((m) => m.id === ref?.media)?.file;
  const beforeFile = file(before);
  const afterFile = file(after);
  const setPair = (patch: Partial<typeof w.pair>) => set({ pair: { ...w.pair, ...patch } });

  return (
    <div className="pg-section-body">
      <p className="caption">
        İkisi birlikte seçilmeli ya da ikisi de boş kalmalı. Başlık sayfa metinlerinden gelir; burada yalnız giriş
        cümlesi yazılır.
      </p>
      <ImagePicker
        label="Önce görseli"
        slot={RATIOS.compare}
        media={media}
        value={before}
        onChange={(v) => setPair({ before: v })}
      />
      <ImagePicker
        label="Sonra görseli"
        slot={RATIOS.compare}
        media={media}
        value={after}
        onChange={(v) => setPair({ after: v })}
      />
      {errors.pair && (
        <p className="err" role="alert">
          {errors.pair}
        </p>
      )}
      <LongField label="Giriş cümlesi" value={w.pair.lead} rows={2} max={220} onChange={(lead) => setPair({ lead })} />

      <SelectField
        label="Biçim"
        value={mode}
        onChange={(v) => setPair({ mode: v === 'toggle' ? 'toggle' : 'slider' })}
        options={[
          { value: 'slider', label: 'Kaydırıcı' },
          { value: 'toggle', label: 'Geçiş' },
        ]}
        helper="Geçiş: görseller tam hizalı değilse"
      />

      {beforeFile && afterFile && (
        <div className="pj-ba">
          <div className="pj-ba-stage" style={{ aspectRatio: String(RATIOS.compare.aspect) }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs cannot go through the image optimizer */}
            <img src={afterFile} alt="" />
            {mode === 'slider' ? (
              // eslint-disable-next-line @next/next/no-img-element -- local object URLs cannot go through the image optimizer
              <img src={beforeFile} alt="" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
            ) : (
              side === 'before' && (
                // eslint-disable-next-line @next/next/no-img-element -- local object URLs cannot go through the image optimizer
                <img src={beforeFile} alt="" />
              )
            )}
          </div>
          {mode === 'slider' ? (
            <label className="pj-range">
              <span className="label">Konum</span>
              <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} />
            </label>
          ) : (
            <div className="seg">
              <button type="button" aria-pressed={side === 'before'} onClick={() => setSide('before')}>
                Önce
              </button>
              <button type="button" aria-pressed={side === 'after'} onClick={() => setSide('after')}>
                Sonra
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
