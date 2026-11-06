import { describe, expect, it } from 'vitest';
import Layout, { metadata } from './layout.tsx';

describe('admin layout', () => {
  it('is not indexable', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('renders its children', () => {
    expect(Layout({ children: 'x' }).props.children).toBe('x');
  });
});
