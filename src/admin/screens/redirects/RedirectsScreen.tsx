'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { PUBLIC_PATHS } from '@/content/select';
import type { Redirect } from '@/content/types';
import { useAdminStore } from '../../store/AdminStoreProvider';
import Button from '../../ui/Button';
import Dialog from '../../ui/Dialog';
import EmptyState from '../../ui/EmptyState';
import Field from '../../ui/Field';
import Table from '../../ui/Table';
import { checkRedirect, isAuto } from './redirect-rules';
import type { RedirectErrors } from './redirect-rules';
import './redirects.css';

type Mode = { kind: 'add' } | { kind: 'edit'; entry: Redirect } | { kind: 'remove'; entry: Redirect } | null;

function RedirectForm({ entry, onDone }: { entry?: Redirect; onDone: () => void }) {
  const { draft, updateDraft } = useAdminStore();
  const [from, setFrom] = useState(entry?.from ?? '');
  const [to, setTo] = useState(entry?.to ?? '');
  const [errors, setErrors] = useState<RedirectErrors>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Redirect = { id: entry?.id ?? `manual-${Date.now().toString(36)}`, from: from.trim(), to: to.trim() };
    const found = checkRedirect(draft, next, entry?.id);
    setErrors(found);
    if (found.from || found.to) return;
    updateDraft((c) => ({
      ...c,
      redirects: entry ? c.redirects.map((r) => (r.id === entry.id ? next : r)) : [...c.redirects, next],
    }));
    onDone();
  };

  return (
    <form onSubmit={submit} noValidate>
      {(errors.from || errors.to) && (
        <p role="alert" className="err">
          Düzeltilmesi gereken alanlar var.
        </p>
      )}
      <Field
        label="Eski adres"
        value={from}
        onChange={setFrom}
        boxed
        error={errors.from}
        helper="Örnek: /projeler/eski-ad"
      />
      <Field
        label="Yeni adres"
        value={to}
        onChange={setTo}
        boxed
        error={errors.to}
        helper="Herhangi bir herkese açık sayfa veya yayındaki proje adresi olabilir."
      />
      <div className="adm-redirects-actions" role="group" aria-label="Önerilen adresler">
        {PUBLIC_PATHS.map((p) => (
          <Button key={p} onClick={() => setTo(p)}>
            {p}
          </Button>
        ))}
      </div>
      <div className="adm-dialog-actions">
        <Button onClick={onDone}>Vazgeç</Button>
        <Button variant="primary" type="submit">
          Kaydet
        </Button>
      </div>
    </form>
  );
}

export default function RedirectsScreen() {
  const { draft, updateDraft } = useAdminStore();
  const [mode, setMode] = useState<Mode>(null);
  const close = () => setMode(null);
  const rows = draft.redirects;

  return (
    <div>
      <h1 className="adm-title">Yönlendirmeler</h1>
      {rows.length === 0 ? (
        <EmptyState
          message="Yönlendirme yok"
          actionLabel="Yönlendirme ekle"
          onAction={() => setMode({ kind: 'add' })}
        />
      ) : (
        <>
          <div className="adm-redirects-bar">
            <Button onClick={() => setMode({ kind: 'add' })}>Yönlendirme ekle</Button>
          </div>
          <Table
            caption="Yönlendirmeler"
            rows={rows}
            getKey={(r) => r.id}
            columns={[
              { id: 'from', header: 'Eski adres', render: (r) => <code>{r.from}</code> },
              { id: 'to', header: 'Yeni adres', render: (r) => <code>{r.to}</code> },
              {
                id: 'kind',
                header: 'Tür',
                render: (r) => (isAuto(r) ? <span className="badge">Otomatik</span> : 'Elle eklendi'),
              },
              {
                id: 'actions',
                header: 'İşlemler',
                render: (r) => (
                  <span className="adm-redirects-actions">
                    {isAuto(r) ? (
                      <span className="caption">Adres değişikliğiyle oluştu</span>
                    ) : (
                      <Button
                        onClick={() => setMode({ kind: 'edit', entry: r })}
                        aria-label={`${r.from} yönlendirmesini düzenle`}
                      >
                        Düzenle
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => setMode({ kind: 'remove', entry: r })}
                      aria-label={`${r.from} yönlendirmesini sil`}
                    >
                      Sil
                    </Button>
                  </span>
                ),
              },
            ]}
          />
        </>
      )}

      <Dialog
        open={mode?.kind === 'add' || mode?.kind === 'edit'}
        onClose={close}
        title={mode?.kind === 'edit' ? 'Yönlendirmeyi düzenle' : 'Yönlendirme ekle'}
      >
        <RedirectForm entry={mode?.kind === 'edit' ? mode.entry : undefined} onDone={close} />
      </Dialog>

      <Dialog open={mode?.kind === 'remove'} onClose={close} title="Yönlendirmeyi sil">
        {mode?.kind === 'remove' && (
          <>
            <p>
              <code>{mode.entry.from}</code> adresi artık yönlendirilmeyecek.
            </p>
            {isAuto(mode.entry) && (
              <p>
                Bu kayıt adres değişikliğiyle kendiliğinden oluştu. Silerseniz eski bağlantılar çalışmayı bırakır ve
                ziyaretçiler sayfa bulunamadı ekranını görür.
              </p>
            )}
            <div className="adm-dialog-actions">
              <Button onClick={close}>Vazgeç</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const id = mode.entry.id;
                  updateDraft((c) => ({ ...c, redirects: c.redirects.filter((r) => r.id !== id) }));
                  close();
                }}
              >
                Sil
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}
