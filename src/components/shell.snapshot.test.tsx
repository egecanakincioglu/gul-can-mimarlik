import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import BeforeAfter from './BeforeAfter';
import Footer from './Footer';
import Header from './Header';
import { beforeAfterTexts, headerTexts } from './shell-texts';
import { rootMetadata } from './shell.test-helpers';
import { getContent } from '@/content';

vi.mock('next/navigation', () => ({ usePathname: () => '/hizmetler' }));
vi.mock('next/font/google', () => ({
  Funnel_Display: () => ({ variable: 'v-display' }),
  Funnel_Sans: () => ({ variable: 'v-sans' }),
}));

const img = (name: string) => ({ src: `/images/${name}.png`, alt: name, focalX: 50, focalY: 50 });

// The footer prints the current year; freeze it so the snapshot stays valid in later years.
beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-06T12:00:00Z'));
});

afterAll(() => {
  vi.useRealTimers();
});

describe('shell markup', () => {
  it('Footer with the call to action', async () => {
    expect(renderToStaticMarkup(await Footer({ cta: true, step: 'l' }))).toMatchSnapshot();
  });
  it('Footer without the call to action', async () => {
    expect(renderToStaticMarkup(await Footer({ cta: false, step: 'r' }))).toMatchSnapshot();
  });
  it('Header', async () => {
    expect(renderToStaticMarkup(await headerEl())).toMatchSnapshot();
  });
  it('BeforeAfter slider', async () => {
    expect(renderToStaticMarkup(await baEl('slider'))).toMatchSnapshot();
  });
  it('BeforeAfter toggle', async () => {
    expect(renderToStaticMarkup(await baEl('toggle'))).toMatchSnapshot();
  });
  it('root metadata', async () => {
    expect(await rootMetadata()).toMatchSnapshot();
  });
});

async function headerEl() {
  return <Header texts={headerTexts(await getContent())} />;
}
async function baEl(mode: 'slider' | 'toggle') {
  return <BeforeAfter texts={beforeAfterTexts(await getContent())} before={img('a')} after={img('b')} mode={mode} />;
}
