import type { Rich } from '@/content/types';

/** Unweighted segments render as bare text; weighted ones as the `w8` / `w3` spans. */
export default function RichText({ value }: { value: Rich }) {
  return (
    <>
      {value.map((s, i) =>
        s.weight ? (
          <span key={i} className={s.weight === 800 ? 'w8' : 'w3'}>
            {s.text}
          </span>
        ) : (
          s.text
        ),
      )}
    </>
  );
}
