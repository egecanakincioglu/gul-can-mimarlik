import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdminFrame from './AdminFrame';

let pathname = '/yonetim';
const push = vi.fn();
vi.mock('next/navigation', () => ({ usePathname: () => pathname, useRouter: () => ({ push }) }));

afterEach(cleanup);

describe('AdminFrame', () => {
  it('shows the shell on admin routes', async () => {
    pathname = '/yonetim';
    render(
      <AdminFrame>
        <p>content</p>
      </AdminFrame>,
    );
    expect(await screen.findByRole('navigation', { name: 'Yönetim' })).toBeTruthy();
    expect(screen.getByText('content')).toBeTruthy();
  });

  it('sends Çıkış to the login page', async () => {
    pathname = '/yonetim';
    render(
      <AdminFrame>
        <p>content</p>
      </AdminFrame>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Çıkış' }));
    expect(push).toHaveBeenCalledWith('/yonetim/giris');
  });

  it('renders the login route without the shell', () => {
    pathname = '/yonetim/giris';
    render(
      <AdminFrame>
        <p>login</p>
      </AdminFrame>,
    );
    expect(screen.getByText('login')).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Yönetim' })).toBeNull();
  });

  it.each(['/yonetim/onizleme', '/yonetim/onizleme/projeler/ornek'])('renders %s without the shell', (path) => {
    pathname = path;
    render(
      <AdminFrame>
        <p>preview</p>
      </AdminFrame>,
    );
    expect(screen.getByText('preview')).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Yönetim' })).toBeNull();
  });
});
