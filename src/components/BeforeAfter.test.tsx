import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BeforeAfter from './BeforeAfter';

const texts = {
  before: 'Önce',
  after: 'Sonra',
  compare: 'Karşılaştır',
  sliderAria: 'Önce ve sonra karşılaştırması',
  valueText: 'Önce görseli %{n} görünür',
  groupAria: 'Görünüm',
  caption: 'İllüstratif karşılaştırma.',
};

const img = (name: string) => ({ src: `/images/${name}.png`, alt: name, focalX: 50, focalY: 50 });

beforeEach(() => {
  // Reduced motion: the one-time entrance hint is skipped, so the divider starts at a known value.
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  Element.prototype.setPointerCapture = () => undefined;
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const slider = () => screen.getByRole('slider');
const value = () => Number(slider().getAttribute('aria-valuenow'));

describe('BeforeAfter slider', () => {
  it('starts in the middle', () => {
    render(<BeforeAfter texts={texts} before={img('a')} after={img('b')} />);
    expect(value()).toBe(50);
  });

  it('moves 5 points per arrow key and 10 with Shift', () => {
    render(<BeforeAfter texts={texts} before={img('a')} after={img('b')} />);
    fireEvent.keyDown(slider(), { key: 'ArrowRight' });
    expect(value()).toBe(55);
    fireEvent.keyDown(slider(), { key: 'ArrowLeft', shiftKey: true });
    expect(value()).toBe(45);
  });

  it('jumps to the ends with Home and End and never leaves 0..100', () => {
    render(<BeforeAfter texts={texts} before={img('a')} after={img('b')} />);
    fireEvent.keyDown(slider(), { key: 'Home' });
    expect(value()).toBe(0);
    fireEvent.keyDown(slider(), { key: 'ArrowLeft' });
    expect(value()).toBe(0);
    fireEvent.keyDown(slider(), { key: 'End' });
    expect(value()).toBe(100);
    fireEvent.keyDown(slider(), { key: 'ArrowRight' });
    expect(value()).toBe(100);
  });

  it('ignores other keys', () => {
    render(<BeforeAfter texts={texts} before={img('a')} after={img('b')} />);
    fireEvent.keyDown(slider(), { key: 'a' });
    expect(value()).toBe(50);
  });

  it('follows a mouse pointer drag across the stage', () => {
    const { container } = render(<BeforeAfter texts={texts} before={img('a')} after={img('b')} />);
    const stage = container.querySelector('.ba-stage') as HTMLElement;
    stage.getBoundingClientRect = () => ({ left: 100, width: 200 }) as DOMRect;
    const point = (type: 'pointerDown' | 'pointerMove' | 'pointerUp', clientX: number) =>
      act(() => {
        fireEvent[type](stage, { clientX, pointerId: 1, pointerType: 'mouse' });
      });
    point('pointerDown', 250);
    expect(value()).toBe(75);
    point('pointerMove', 120);
    expect(value()).toBe(10);
    point('pointerUp', 120);
    point('pointerMove', 200);
    expect(value()).toBe(10);
  });

  it('the Önce, Karşılaştır and Sonra buttons set the divider', () => {
    render(<BeforeAfter texts={texts} before={img('a')} after={img('b')} />);
    fireEvent.click(screen.getByRole('button', { name: 'Önce' }));
    expect(value()).toBe(100);
    fireEvent.click(screen.getByRole('button', { name: 'Sonra' }));
    expect(value()).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Karşılaştır' }));
    expect(value()).toBe(50);
  });
});

describe('BeforeAfter timers', () => {
  it('leaves no timer running after unmount', () => {
    vi.useFakeTimers();
    const { unmount } = render(<BeforeAfter texts={texts} before={img('a')} after={img('b')} />);
    fireEvent.keyDown(slider(), { key: 'ArrowRight' });
    fireEvent.click(screen.getByRole('button', { name: 'Sonra' }));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
  });

  it('restarts the smooth timer instead of stacking timers', () => {
    vi.useFakeTimers();
    render(<BeforeAfter texts={texts} before={img('a')} after={img('b')} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sonra' }));
    fireEvent.click(screen.getByRole('button', { name: 'Önce' }));
    expect(vi.getTimerCount()).toBe(1);
  });
});

describe('BeforeAfter toggle mode', () => {
  it('has no slider handle and shows the before image', () => {
    const { container } = render(<BeforeAfter texts={texts} before={img('a')} after={img('b')} mode="toggle" />);
    expect(screen.queryByRole('slider')).toBeNull();
    expect(container.querySelector('.ba-stage')?.getAttribute('style')).toContain('--pos: 100%');
  });

  it('fills the value text of the slider', () => {
    render(<BeforeAfter texts={texts} before={img('a')} after={img('b')} />);
    expect(slider().getAttribute('aria-valuetext')).toBe('Önce görseli %50 görünür');
  });

  it('shows the illustrative caption', () => {
    render(<BeforeAfter texts={texts} before={img('a')} after={img('b')} />);
    expect(screen.getByText('İllüstratif karşılaştırma.').textContent).toBe('İllüstratif karşılaştırma.');
  });
});
