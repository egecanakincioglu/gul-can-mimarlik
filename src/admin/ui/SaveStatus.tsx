import type { SaveState } from '../store/admin-store';

const hhmm = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** `dirty` means the draft differs from the published site, not that a save is pending. */
export default function SaveStatus({ state, dirty }: { state: SaveState; dirty: boolean }) {
  let text: string;
  if (state.kind === 'saving') text = 'Kaydediliyor';
  else if (state.kind === 'error') text = state.message;
  else {
    text = dirty ? 'Yayınlanmamış değişiklikler var' : 'Yayında, değişiklik yok';
    if (state.kind === 'saved') text += ` · Kaydedildi ${hhmm(state.at)}`;
  }

  return (
    <p role="status" aria-live="polite" className="adm-save-status">
      {text}
    </p>
  );
}
