import { describe, expect, it } from 'vitest';
import { getContent } from './index';
import { createMemoryRepository } from './store';
import type { ContentRepository } from './store';

const make = async (): Promise<ContentRepository> => createMemoryRepository(await getContent());

describe('memory repository', () => {
  it('returns a copy of the seed at revision 1', async () => {
    const repo = await make();
    const { content, rev } = await repo.getContent();
    expect(rev).toBe(1);
    expect(content).toEqual(await getContent());
    expect(content).not.toBe(await getContent());
  });

  it('saves valid content and bumps the revision', async () => {
    const repo = await make();
    const { content } = await repo.getContent();
    content.site.name = 'Başka Ad';
    expect(await repo.saveContent(content, 1)).toEqual({ ok: true, rev: 2 });
    expect((await repo.getContent()).content.site.name).toBe('Başka Ad');
  });

  it('rejects a save on a stale revision', async () => {
    const repo = await make();
    const { content } = await repo.getContent();
    expect(await repo.saveContent(content, 7)).toEqual({ ok: false, reason: 'conflict', rev: 1 });
  });

  it('rejects invalid content and keeps the stored one', async () => {
    const repo = await make();
    const { content } = await repo.getContent();
    content.seo.titleTemplate = 'yok';
    const result = await repo.saveContent(content, 1);
    expect(result).toMatchObject({ ok: false, reason: 'invalid' });
    expect((await repo.getContent()).rev).toBe(1);
  });

  it('stores messages and changes their status', async () => {
    const repo = await make();
    const added = await repo.addMessage({
      name: 'Ad',
      phone: '0212 000 00 00',
      email: 'a@example.com',
      projectType: 'Diğer',
      message: 'Merhaba, bir sorum var.',
    });
    expect(added.status).toBe('new');
    expect(await repo.listMessages()).toHaveLength(1);
    expect(await repo.setMessageStatus(added.id, 'read')).toBe(true);
    expect((await repo.listMessages())[0].status).toBe('read');
    expect(await repo.setMessageStatus('yok', 'read')).toBe(false);
  });
});
