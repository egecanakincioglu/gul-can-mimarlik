import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NotFound from './not-found';
import SiteLayout from './(site)/layout';

vi.mock('next/navigation', () => ({ usePathname: () => '/olmayan-sayfa' }));

beforeEach(() => {
  document.elementsFromPoint = () => [];
});

afterEach(cleanup);

describe('NotFound', () => {
  it('shows the site header navigation and the 404 text', async () => {
    // The layout reads the content on the server, so it is resolved before the client render.
    render(await SiteLayout(NotFound().props));
    expect(screen.getAllByRole('navigation').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('404');
    expect(screen.getByText('This page could not be found.')).toBeTruthy();
    expect(document.querySelector('main#icerik')).not.toBeNull();
  });
});
