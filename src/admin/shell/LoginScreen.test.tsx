import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LoginScreen from './LoginScreen';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

afterEach(cleanup);

describe('LoginScreen', () => {
  it('wraps the form in main and uses boxed fields', () => {
    const { container } = render(<LoginScreen />);
    expect(screen.getByRole('main')).toBeTruthy();
    expect(container.querySelectorAll('.adm-boxed')).toHaveLength(2);
  });

  it('navigates to the admin home after login', () => {
    render(<LoginScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Giriş' }));
    expect(push).toHaveBeenCalledWith('/yonetim');
  });
});
