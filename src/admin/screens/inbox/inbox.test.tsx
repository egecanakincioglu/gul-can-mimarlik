import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AdminStoreProvider } from '../../store/AdminStoreProvider';
import type { StorageLike } from '../../store/admin-store';
import InboxScreen from './InboxScreen';
import MessageScreen from './MessageScreen';

afterEach(cleanup);

const memory = (): StorageLike => {
  const data = new Map<string, string>();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
};

const show = async (ui: React.ReactNode, storage = memory()) => {
  render(<AdminStoreProvider storage={storage}>{ui}</AdminStoreProvider>);
  await screen.findByRole('heading', { level: 1 });
  return storage;
};

describe('InboxScreen', () => {
  it('lists inbox messages with sample labels and unread markers only on new ones', async () => {
    await show(<InboxScreen />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(screen.getAllByText('Örnek mesaj')).toHaveLength(3);
    expect(screen.getAllByTestId('unread-marker')).toHaveLength(2);
    expect(screen.getByText('6 Kasım 2026')).toBeTruthy();
    expect(within(items[0]).getByRole('link').getAttribute('href')).toBe('/yonetim/gelen-kutusu/sample-3');
  });

  it('filters the archive and shows the empty state', async () => {
    await show(<InboxScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Arşiv' }));
    expect(screen.getByText('Mesaj yok')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Arşiv' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Gelen' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});

describe('MessageScreen', () => {
  it('toggles read and unread', async () => {
    await show(<MessageScreen id="sample-1" />);
    expect(await screen.findByText('Okunmadı')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Okundu olarak işaretle' }));
    expect(await screen.findByText('Okundu')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Okunmadı olarak işaretle' }));
    expect(await screen.findByText('Okunmadı')).toBeTruthy();
  });

  it('archives and restores, and offers no delete', async () => {
    await show(<MessageScreen id="sample-2" />);
    expect(screen.queryByRole('button', { name: /sil/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Arşivle' }));
    expect(await screen.findByText('Arşivde')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /işaretle/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Gelen kutusuna taşı' }));
    expect(await screen.findByText('Okundu')).toBeTruthy();
  });

  it('archived messages appear under the archive filter', async () => {
    const storage = await show(<MessageScreen id="sample-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Arşivle' }));
    cleanup();
    await show(<InboxScreen />, storage);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Arşiv' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('builds the reply link and shows every field', async () => {
    await show(<MessageScreen id="sample-2" />);
    const link = screen.getByRole('link', { name: 'E-posta ile yanıtla' });
    expect(link.getAttribute('href')).toBe(
      `mailto:ornek2@example.com?subject=${encodeURIComponent('Mesajınız hakkında: İç Mimarlık')}`,
    );
    for (const text of ['Örnek gönderen 2', '0000 000 00 00', 'İç Mimarlık', 'Örnek konum']) {
      expect(screen.getAllByText(text).length).toBeGreaterThan(0);
    }
  });

  it('reports an unknown message', async () => {
    await show(<MessageScreen id="missing" />);
    expect(screen.getByText('Mesaj bulunamadı')).toBeTruthy();
  });
});
