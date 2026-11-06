'use client';

import { LongField, Screen, TextField, useContent } from './common';

export default function ProjectsPageScreen() {
  const { draft, update } = useContent();
  const page = draft.projectsPage;
  const set = (p: Partial<typeof page>) => update((d) => ({ ...d, projectsPage: { ...d.projectsPage, ...p } }));

  return (
    <Screen title="Projeler sayfası" preview="/yonetim/onizleme/projeler">
      <TextField label="Başlık" value={page.title} onChange={(title) => set({ title })} />
      <LongField label="Kısa tanıtım cümlesi" value={page.lead} max={220} rows={3} onChange={(lead) => set({ lead })} />
    </Screen>
  );
}
