'use client';

import SortableList from '../../ui/SortableList';
import { ReadOnly, Screen, TextField, replaceAt, useContent } from './common';

export default function ProcessStepsScreen() {
  const { draft, update } = useContent();
  const steps = draft.processSteps;

  return (
    <Screen title="Süreç adımları">
      <ReadOnly label="Adım sayısı" value={String(steps.length)} />
      <SortableList
        items={steps}
        getId={(s) => s.id}
        getLabel={(s) => s.title}
        onChange={(processSteps) => update((d) => ({ ...d, processSteps }))}
        renderItem={(s, i) => (
          <TextField
            label={`${i + 1}. adım`}
            value={s.title}
            onChange={(title) =>
              update((d) => ({ ...d, processSteps: replaceAt(d.processSteps, i, { ...d.processSteps[i], title }) }))
            }
          />
        )}
      />
    </Screen>
  );
}
