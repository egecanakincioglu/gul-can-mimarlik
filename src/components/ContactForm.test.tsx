import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ContactForm from './ContactForm';

afterEach(cleanup);

// The label text also holds the error message once there is one, so match on its start.
const field = (label: string) => screen.getByLabelText(new RegExp(`^${label}`));
const fill = (label: string, value: string) => fireEvent.change(field(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: /Formu doğrula/ }));

function fillValid() {
  fill('Ad Soyad', 'Ayşe Yılmaz');
  fill('Telefon', '+90 212 000 00 00');
  fill('E-posta', 'ayse@example.com');
  fireEvent.click(screen.getByRole('button', { name: 'Mimari Proje' }));
  fill('Mesaj', 'Avlulu bir konut için görüşmek istiyoruz.');
}

describe('ContactForm', () => {
  it('shows an error for every required field on an empty submit', () => {
    render(<ContactForm />);
    submit();
    expect(screen.getAllByRole('alert')).toHaveLength(5);
    expect(field('Ad Soyad').getAttribute('aria-invalid')).toBe('true');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('rejects a malformed e-mail address and a short phone number', () => {
    render(<ContactForm />);
    fillValid();
    fill('E-posta', 'ayse@');
    fill('Telefon', '12345');
    submit();
    expect(screen.getByText('Geçerli bir e-posta adresi yazın.')).toBeTruthy();
    expect(screen.getByText('Geçerli bir telefon numarası yazın.')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('rejects a message shorter than 10 characters', () => {
    render(<ContactForm />);
    fillValid();
    fill('Mesaj', 'kısa');
    submit();
    expect(screen.getByText('Mesajınız en az 10 karakter olmalı.')).toBeTruthy();
  });

  it('requires a project type and marks the chosen one as pressed', () => {
    render(<ContactForm />);
    fillValid();
    fireEvent.click(screen.getByRole('button', { name: 'İç Mimarlık' }));
    expect(screen.getByRole('button', { name: 'İç Mimarlık' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Mimari Proje' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('flags a missing project type', () => {
    render(<ContactForm />);
    fill('Ad Soyad', 'Ayşe Yılmaz');
    submit();
    expect(screen.getByText('Bir proje türü seçin.')).toBeTruthy();
  });

  it('confirms a valid form without sending anything and clears earlier errors', () => {
    render(<ContactForm />);
    submit();
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    fillValid();
    submit();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('status').textContent).toContain('gerçek gönderim yapılmadı');
  });
});
