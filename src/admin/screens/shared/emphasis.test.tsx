import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import type { Rich } from '@/content/types';
import EmphasisField from './EmphasisField';
import { fromMarked, insideBold, isBalanced, sameRich, toMarked } from './emphasis.ts';

afterEach(cleanup);

describe('emphasis markers', () => {
  it('round-trips segments with a light base', () => {
    const rich = [
      { text: 'Işığa', weight: 300 as const },
      { text: 'yer açan', weight: 800 as const },
    ];
    const marked = toMarked(rich, 300);
    expect(marked).toBe('Işığa*yer açan*');
    expect(fromMarked(marked, 300)).toEqual(rich);
  });

  it('keeps 300 segments visible when the heading inherits its weight', () => {
    const rich = [{ text: 'Fikirden ' }, { text: 'yapıya.', weight: 300 as const }];
    expect(toMarked(rich, undefined)).toBe('Fikirden _yapıya._');
    expect(fromMarked('Fikirden _yapıya._', undefined)).toEqual(rich);
  });

  it('round-trips bold text', () => {
    const rich: Rich = [{ text: 'Bir sonraki mekânı ' }, { text: 'birlikte', weight: 800 }, { text: ' çizelim.' }];
    expect(toMarked(rich)).toBe('Bir sonraki mekânı *birlikte* çizelim.');
    expect(fromMarked(toMarked(rich))).toEqual(rich);
  });

  it('drops unpaired markers and empty segments', () => {
    expect(fromMarked('a*b', undefined)).toEqual([{ text: 'ab' }]);
    expect(fromMarked('**', undefined)).toEqual([]);
    expect(fromMarked('a**b')).toEqual([{ text: 'ab' }]);
  });

  it('reports unpaired markers', () => {
    expect(isBalanced('a *b* _c_')).toBe(true);
    expect(isBalanced('a *b')).toBe(false);
    expect(isBalanced('a _b')).toBe(false);
  });

  it('knows when the caret is inside a bold pair', () => {
    expect(insideBold('a *b* c', 4)).toBe(true);
    expect(insideBold('a *b* c', 6)).toBe(false);
  });

  it('compares segments by text and weight', () => {
    expect(sameRich([{ text: 'a' }], [{ text: 'a', weight: 800 }])).toBe(false);
    expect(sameRich([{ text: 'a' }], [{ text: 'a' }, { text: 'b' }])).toBe(false);
    expect(sameRich([{ text: 'a', weight: 300 }], [{ text: 'a', weight: 300 }])).toBe(true);
  });
});

describe('EmphasisField', () => {
  const Harness = ({ initial, plain, max }: { initial: Rich; plain?: 300; max?: number }) => {
    const [value, setValue] = useState<Rich>(initial);
    return (
      <>
        <EmphasisField label="Başlık" value={value} baseWeight={300} onChange={setValue} plain={plain} max={max} />
        <p data-testid="out">{JSON.stringify(value)}</p>
      </>
    );
  };
  const out = () => JSON.parse(screen.getByTestId('out').textContent ?? '[]') as Rich;
  const input = () => screen.getByLabelText('Başlık') as HTMLInputElement;
  const select = (start: number, end: number) => {
    input().setSelectionRange(start, end);
    fireEvent.select(input());
  };

  it('shows the marks and the weighted preview', () => {
    render(<Harness initial={[{ text: 'Bir ' }, { text: 'iki', weight: 800 }, { text: ' üç', weight: 300 }]} />);
    expect(input().value).toBe('Bir *iki*_ üç_');
    const preview = screen.getByLabelText('Başlık önizlemesi');
    expect(preview.querySelector('.w8')?.textContent).toBe('iki');
    expect(preview.querySelector('.w3')?.textContent).toBe(' üç');
  });

  it('stores segments when the text is typed', () => {
    render(<Harness initial={[{ text: 'Bir' }]} />);
    fireEvent.change(input(), { target: { value: 'Bir *iki*_üç_' } });
    expect(out()).toEqual([{ text: 'Bir ' }, { text: 'iki', weight: 800 }, { text: 'üç', weight: 300 }]);
  });

  it('treats unmarked text as light when plain is 300', () => {
    render(<Harness initial={[{ text: 'Işığa', weight: 300 }]} plain={300} />);
    expect(input().value).toBe('Işığa');
    expect(screen.getByLabelText('Başlık önizlemesi').querySelector('.w3')?.textContent).toBe('Işığa');
  });

  it('wraps the selection with the toolbar button and reports it as pressed', () => {
    render(<Harness initial={[{ text: 'Bir iki' }]} />);
    const button = screen.getByRole('button', { name: 'Vurgu' });
    expect(button.getAttribute('aria-pressed')).toBe('false');
    select(4, 7);
    fireEvent.click(button);
    expect(input().value).toBe('Bir *iki*');
    expect(out()).toEqual([{ text: 'Bir ' }, { text: 'iki', weight: 800 }]);
    select(6, 6);
    expect(screen.getByRole('button', { name: 'Vurgu' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('removes the marks when pressed inside a marked span', () => {
    render(<Harness initial={[{ text: 'Bir ' }, { text: 'iki', weight: 800 }]} />);
    select(6, 6);
    fireEvent.click(screen.getByRole('button', { name: 'Vurgu' }));
    expect(input().value).toBe('Bir iki');
    expect(out()).toEqual([{ text: 'Bir iki' }]);
  });

  it('strips marks from a selection that already contains one', () => {
    render(<Harness initial={[{ text: 'Bir ' }, { text: 'iki', weight: 800 }]} />);
    select(0, 9);
    fireEvent.click(screen.getByRole('button', { name: 'Vurgu' }));
    expect(input().value).toBe('Bir iki');
  });

  it('inserts an empty pair at a collapsed caret', () => {
    render(<Harness initial={[{ text: 'Bir' }]} />);
    select(3, 3);
    fireEvent.click(screen.getByRole('button', { name: 'Vurgu' }));
    expect(input().value).toBe('Bir**');
    expect(out()).toEqual([{ text: 'Bir' }]);
  });

  it('flags an unpaired mark and shows the length', () => {
    render(<Harness initial={[{ text: 'Bir' }]} max={10} />);
    fireEvent.change(input(), { target: { value: 'Bir *iki' } });
    expect(screen.getByText('Vurgu işaretleri (* ve _) çift olmalıdır.')).toBeTruthy();
    expect(input().getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText(/7\/10/)).toBeTruthy();
  });

  it('follows an outside change of the value', () => {
    const view = render(
      <EmphasisField label="Başlık" baseWeight={300} value={[{ text: 'ilk' }]} onChange={() => {}} />,
    );
    view.rerender(
      <EmphasisField label="Başlık" baseWeight={300} value={[{ text: 'yeni', weight: 800 }]} onChange={() => {}} />,
    );
    expect(input().value).toBe('*yeni*');
  });
});

describe('EmphasisField preview', () => {
  it('gives unmarked text the heading weight and light text the w3 class', () => {
    render(
      <EmphasisField
        label="Başlık"
        baseWeight={600}
        value={[{ text: 'Fikirden ' }, { text: 'yapıya.', weight: 300 }]}
        onChange={() => {}}
      />,
    );
    const preview = screen.getByLabelText('Başlık önizlemesi');
    expect(preview.style.fontWeight).toBe('600');
    expect(screen.getByText('yapıya.').className).toBe('w3');
    expect(screen.getByText(/Fikirden/).className).toBe('');
    expect(screen.getByText(/işaretsiz metin başlığın kendi kalınlığındadır/)).toBeTruthy();
  });
});
