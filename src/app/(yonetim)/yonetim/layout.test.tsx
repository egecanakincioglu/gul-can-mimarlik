import { describe, expect, it } from 'vitest';
import AdminFrame from '@/admin/shell/AdminFrame';
import Layout, { metadata } from './layout.tsx';

describe('admin layout', () => {
  it('is not indexable', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('wraps its children in the admin frame', () => {
    const el = Layout({ children: 'x' });
    expect(el.type).toBe(AdminFrame);
    expect(el.props.children).toBe('x');
  });
});
