import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
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
  // Mount effects (such as marking a message read) run after the heading is found; flush them first.
  await act(async () => {});
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

  it('shows a text status badge on every row', async () => {
    await show(<InboxScreen />);
    expect(screen.getAllByText('Yeni')).toHaveLength(2);
    expect(screen.getAllByText('Okundu')).toHaveLength(1);
  });

  it('teaches in the empty inbox', async () => {
    const storage = await show(<MessageScreen id="sample-1" />);
    for (const id of ['sample-1', 'sample-2', 'sample-3']) {
      cleanup();
      await show(<MessageScreen id={id} />, storage);
      fireEvent.click(screen.getByRole('button', { name: 'Yanıtlandı, arşive taşı' }));
      await screen.findByRole('status');
    }
    cleanup();
    await show(<InboxScreen />, storage);
    expect(screen.getByText('Gelen kutusu boş.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Arşiv' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('filters the archive and shows the empty state', async () => {
    await show(<InboxScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Arşiv' }));
    expect(screen.getByText('Arşivde mesaj yok.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Arşiv' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Gelen' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});

describe('MessageScreen', () => {
  it('marks a new message read when opened', async () => {
    const storage = await show(<MessageScreen id="sample-1" />);
    expect(await screen.findByText('Okundu')).toBeTruthy();
    cleanup();
    await show(<InboxScreen />, storage);
    expect(screen.getAllByTestId('unread-marker')).toHaveLength(1);
  });

  it('toggles read and unread', async () => {
    await show(<MessageScreen id="sample-1" />);
    expect(await screen.findByText('Okundu')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Okunmadı olarak işaretle' }));
    expect(await screen.findByText('Yeni')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Okundu olarak işaretle' }));
    expect(await screen.findByText('Okundu')).toBeTruthy();
  });

  it('archives with an inline status line and undoes it', async () => {
    await show(<MessageScreen id="sample-2" />);
    expect(screen.queryByRole('button', { name: /sil/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Yanıtlandı, arşive taşı' }));
    expect((await screen.findByRole('status')).textContent).toContain('Arşive taşındı.');
    expect(screen.getAllByText('Arşivde').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /işaretle/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Geri al' }));
    expect(await screen.findByText('Okundu')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('moves an archived message back to the inbox', async () => {
    const storage = await show(<MessageScreen id="sample-2" />);
    fireEvent.click(screen.getByRole('button', { name: 'Yanıtlandı, arşive taşı' }));
    cleanup();
    await show(<MessageScreen id="sample-2" />, storage);
    fireEvent.click(screen.getByRole('button', { name: 'Gelen kutusuna taşı' }));
    expect(await screen.findByText('Okundu')).toBeTruthy();
  });

  it('archived messages appear under the archive filter', async () => {
    const storage = await show(<MessageScreen id="sample-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Yanıtlandı, arşive taşı' }));
    await screen.findByRole('status');
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
