import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import AdminFrame from '@/admin/shell/AdminFrame';
import Page from './page.tsx';

let seed: SiteContent;
let received: SiteContent | null = null;
let pathname = '/yonetim/onizleme';
let yol: string[] | undefined;

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useParams: () => ({ yol }),
  useRouter: () => ({ push: () => {} }),
}));
vi.mock('@/admin/preview/usePreviewBridge', () => ({ usePreviewReceiver: () => received }));

beforeAll(async () => {
  seed = await getContent();
  // jsdom lacks the browser APIs the public header and scroll reveals rely on.
  document.elementsFromPoint = () => [];
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
});
afterEach(cleanup);

const open = (segments?: string[]) => {
  yol = segments;
  render(
    <AdminFrame>
      <Page />
    </AdminFrame>,
  );
};

describe('preview route', () => {
  it('renders the home page from the posted draft without the admin shell', async () => {
    received = { ...seed, site: { ...seed.site, name: 'Taslak Adı' } };
    pathname = '/yonetim/onizleme';
    open();
    expect(await screen.findByRole('heading', { level: 1 })).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Yönetim' })).toBeNull();
    expect(document.querySelector('#icerik')).toBeTruthy();
  });

  it('renders a project page by slug and reports an unknown address', async () => {
    received = seed;
    pathname = '/yonetim/onizleme/projeler/x';
    const slug = seed.projects.find((p) => p.published)!.slug;
    open(['projeler', slug]);
    expect(await screen.findByRole('heading', { level: 1 })).toBeTruthy();
    cleanup();
    open(['projeler', 'yok-boyle-bir-proje']);
    expect(await screen.findByText('Bu adres için önizleme yok.')).toBeTruthy();
  });

  it('waits for a draft before rendering', async () => {
    received = null;
    open(['studyo']);
    expect(await screen.findByText('Önizleme hazırlanıyor')).toBeTruthy();
  });
});
