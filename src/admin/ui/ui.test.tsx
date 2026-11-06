import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import Dialog from './Dialog';
import EmptyState from './EmptyState';
import ErrorBlock from './ErrorBlock';
import Field from './Field';
import SaveStatus from './SaveStatus';
import SortableList from './SortableList';
import Skeleton from './Skeleton';
import Table from './Table';
import Tabs from './Tabs';
import Toggle from './Toggle';

afterEach(cleanup);

beforeAll(() => {
  // jsdom has no modal dialog support.
  const proto = HTMLDialogElement.prototype;
  proto.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

describe('Field', () => {
  it('wires label, helper, counter and error to the input', () => {
    render(<Field label="Başlık" value="abc" onChange={() => {}} helper="Kısa tutun" max={10} error="Zorunlu" />);
    const input = screen.getByLabelText('Başlık');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const ids = (input.getAttribute('aria-describedby') ?? '').split(' ');
    expect(ids).toHaveLength(3);
    const texts = ids.map((id) => document.getElementById(id)?.textContent);
    expect(texts).toEqual(['Kısa tutun', '3/10', 'Zorunlu']);
  });

  it('has no invalid state or description without an error or hints', () => {
    render(<Field label="Ad" value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Ad');
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });

  it('reports changes and supports the boxed multiline variant', () => {
    const onChange = vi.fn();
    const { container } = render(<Field label="Not" value="" onChange={onChange} boxed multiline />);
    fireEvent.change(screen.getByLabelText('Not'), { target: { value: 'x' } });
    expect(onChange).toHaveBeenCalledWith('x');
    expect(container.querySelector('textarea')).not.toBeNull();
    expect(container.querySelector('.adm-boxed')).not.toBeNull();
  });
});

describe('Toggle', () => {
  const Harness = () => {
    const [on, setOn] = useState(false);
    return <Toggle label="Yayında" checked={on} onChange={setOn} />;
  };

  it('is a focusable switch that flips with activation', () => {
    render(<Harness />);
    const sw = screen.getByRole('switch', { name: 'Yayında' });
    sw.focus();
    expect(document.activeElement).toBe(sw);
    expect(sw.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(sw);
    expect(sw.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(sw);
    expect(sw.getAttribute('aria-checked')).toBe('false');
  });
});

describe('Tabs', () => {
  const tabs = [
    { id: 'a', label: 'Bilgiler', panel: <p>Birinci</p> },
    { id: 'b', label: 'Konsept', panel: <p>İkinci</p> },
    { id: 'c', label: 'Galeri', panel: <p>Üçüncü</p> },
  ];

  it('moves selection and focus with arrow keys, wrapping at the ends', () => {
    render(<Tabs label="Proje" tabs={tabs} />);
    const [a, b, c] = screen.getAllByRole('tab');
    expect(a.getAttribute('aria-selected')).toBe('true');
    expect(b.getAttribute('tabindex')).toBe('-1');
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    expect(b.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(b);
    expect(screen.getByRole('tabpanel').textContent).toBe('İkinci');
    fireEvent.keyDown(b, { key: 'ArrowLeft' });
    fireEvent.keyDown(a, { key: 'ArrowLeft' });
    expect(c.getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(c, { key: 'Home' });
    expect(a.getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(a, { key: 'End' });
    expect(c.getAttribute('aria-selected')).toBe('true');
  });

  it('labels the panel by its tab', () => {
    render(<Tabs label="Proje" tabs={tabs} />);
    const panel = screen.getByRole('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe(screen.getAllByRole('tab')[0].id);
  });
});

describe('SortableList', () => {
  const Harness = () => {
    const [items, setItems] = useState(['Mimari', 'İç mekân', 'Animasyon']);
    return (
      <>
        <SortableList items={items} getId={(x) => x} getLabel={(x) => x} onChange={setItems} />
        <p data-testid="order">{items.join(',')}</p>
      </>
    );
  };

  it('moves an item down with its button and announces the new position', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Aşağı taşı: Mimari' }));
    expect(screen.getByTestId('order').textContent).toBe('İç mekân,Mimari,Animasyon');
    expect(screen.getByRole('status').textContent).toBe('Öğe Mimari, 3 içinden 2. sıraya taşındı');
  });

  it('moves an item up with Alt+ArrowUp', () => {
    render(<Harness />);
    const row = screen.getByRole('button', { name: 'Yukarı taşı: Animasyon' });
    fireEvent.keyDown(row, { key: 'ArrowUp', altKey: true });
    expect(screen.getByTestId('order').textContent).toBe('Mimari,Animasyon,İç mekân');
    expect(screen.getByRole('status').textContent).toBe('Öğe Animasyon, 3 içinden 2. sıraya taşındı');
  });

  it('disables moves past the ends', () => {
    render(<Harness />);
    expect((screen.getByRole('button', { name: 'Yukarı taşı: Mimari' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Aşağı taşı: Animasyon' }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('Dialog', () => {
  const Harness = () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Aç</button>
        <Dialog open={open} onClose={() => setOpen(false)} title="Emin misiniz?">
          <p>Metin</p>
        </Dialog>
      </>
    );
  };

  it('opens with its title, closes on Escape and returns focus to the opener', () => {
    const { container } = render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Aç' });
    opener.focus();
    fireEvent.click(opener);
    const dialog = container.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(dialog.getAttribute('aria-labelledby')).toBe(screen.getByText('Emin misiniz?').id);
    // Escape reaches the page as a cancel event on the dialog.
    const cancel = new Event('cancel', { cancelable: true });
    act(() => {
      dialog.dispatchEvent(cancel);
    });
    expect(cancel.defaultPrevented).toBe(true);
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(document.activeElement).toBe(opener);
  });
});

describe('SaveStatus', () => {
  it('is a polite live region', () => {
    render(<SaveStatus state={{ kind: 'idle' }} dirty={false} />);
    const region = screen.getByRole('status');
    expect(region.getAttribute('aria-live')).toBe('polite');
  });

  it('shows the saved time, unsaved changes, saving and errors', () => {
    const at = new Date(2026, 10, 6, 14, 32).toISOString();
    const { rerender } = render(<SaveStatus state={{ kind: 'saved', at }} dirty={false} />);
    expect(screen.getByRole('status').textContent).toBe('Kaydedildi 14:32');
    rerender(<SaveStatus state={{ kind: 'saved', at }} dirty />);
    expect(screen.getByRole('status').textContent).toBe('Kaydedilmemiş değişiklikler');
    rerender(<SaveStatus state={{ kind: 'saving' }} dirty />);
    expect(screen.getByRole('status').textContent).toBe('Kaydediliyor');
    rerender(<SaveStatus state={{ kind: 'error', message: 'Hata oluştu' }} dirty={false} />);
    expect(screen.getByRole('status').textContent).toBe('Hata oluştu');
  });
});

describe('Table, EmptyState, ErrorBlock, Skeleton', () => {
  it('renders a captioned table with label-style headers and row cells', () => {
    render(
      <Table
        caption="Projeler"
        rows={[{ id: 'a', title: 'Avlulu konut' }]}
        getKey={(r) => r.id}
        columns={[{ key: 'title', header: 'Başlık', render: (r) => r.title }]}
      />,
    );
    expect(screen.getByRole('table', { name: 'Projeler' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Başlık' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'Avlulu konut' }).getAttribute('data-label')).toBe('Başlık');
  });

  it('shows one sentence and one action in the empty state', () => {
    const onAction = vi.fn();
    render(<EmptyState message="Henüz proje yok." actionLabel="Yeni proje" onAction={onAction} />);
    fireEvent.click(screen.getByRole('button', { name: 'Yeni proje' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('announces errors as an alert with a retry action', () => {
    const onRetry = vi.fn();
    render(<ErrorBlock message="Yüklenemedi." onRetry={onRetry} />);
    expect(screen.getByRole('alert').textContent).toContain('Yüklenemedi.');
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('hides skeleton rectangles from assistive technology', () => {
    const { container } = render(<Skeleton height={24} />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
