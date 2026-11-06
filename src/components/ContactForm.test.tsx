import { renderToStaticMarkup } from 'react-dom/server';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { contactPage } from '@/content/seed/contact';
import { demo, ui } from '@/content/seed/strings';
import ContactForm from './ContactForm';
import type { ContactFormTexts } from './ContactForm';

const { form } = contactPage;
const texts: ContactFormTexts = {
  ariaLabel: ui.contactFormAria,
  badge: demo.form,
  fields: form.fields,
  locationEnabled: form.locationEnabled,
  projectTypes: form.projectTypes,
  errors: form.errors,
  submit: demo.formSubmit,
  success: form.success,
};

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
    render(<ContactForm texts={texts} />);
    submit();
    expect(screen.getAllByRole('alert')).toHaveLength(5);
    expect(field('Ad Soyad').getAttribute('aria-invalid')).toBe('true');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('moves focus to the first invalid field after a failed submit', () => {
    render(<ContactForm texts={texts} />);
    submit();
    expect(document.activeElement).toBe(field('Ad Soyad'));
    fill('Ad Soyad', 'Ayşe Yılmaz');
    submit();
    expect(document.activeElement).toBe(field('Telefon'));
    fill('Telefon', '+90 212 000 00 00');
    fill('E-posta', 'ayse@example.com');
    submit();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Mimari Proje' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mimari Proje' }));
    submit();
    expect(document.activeElement).toBe(field('Mesaj'));
  });

  it('rejects a malformed e-mail address and a short phone number', () => {
    render(<ContactForm texts={texts} />);
    fillValid();
    fill('E-posta', 'ayse@');
    fill('Telefon', '12345');
    submit();
    expect(screen.getByText('Geçerli bir e-posta adresi yazın.')).toBeTruthy();
    expect(screen.getByText('Geçerli bir telefon numarası yazın.')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('rejects a message shorter than 10 characters', () => {
    render(<ContactForm texts={texts} />);
    fillValid();
    fill('Mesaj', 'kısa');
    submit();
    expect(screen.getByText('Mesajınız en az 10 karakter olmalı.')).toBeTruthy();
  });

  it('requires a project type and marks the chosen one as pressed', () => {
    render(<ContactForm texts={texts} />);
    fillValid();
    fireEvent.click(screen.getByRole('button', { name: 'İç Mimarlık' }));
    expect(screen.getByRole('button', { name: 'İç Mimarlık' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Mimari Proje' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('flags a missing project type', () => {
    render(<ContactForm texts={texts} />);
    fill('Ad Soyad', 'Ayşe Yılmaz');
    submit();
    expect(screen.getByText('Bir proje türü seçin.')).toBeTruthy();
  });

  it('confirms a valid form without sending anything and clears earlier errors', () => {
    render(<ContactForm texts={texts} />);
    submit();
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    fillValid();
    submit();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('status').textContent).toContain('gerçek gönderim yapılmadı');
  });
});

describe('ContactForm markup', () => {
  it('keeps its markup', () => {
    expect(renderToStaticMarkup(<ContactForm texts={texts} />)).toMatchSnapshot();
  });
});

describe('ContactForm texts', () => {
  it('removes the location field when it is disabled', () => {
    const { container } = render(<ContactForm texts={{ ...texts, locationEnabled: false }} />);
    expect(container.querySelector('#location')).toBeNull();
    expect(screen.queryByText(form.fields.location)).toBeNull();
  });

  it('takes the error messages from its props', () => {
    render(<ContactForm texts={{ ...texts, errors: { ...texts.errors, name: 'Name is required.' } }} />);
    submit();
    expect(screen.getByText('Name is required.')).toBeTruthy();
  });

  it('shows the plain submit label and no badge when the demo texts are off', () => {
    const { container } = render(<ContactForm texts={{ ...texts, badge: null, submit: form.submit }} />);
    expect(screen.getByRole('button', { name: form.submit })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Formu doğrula/ })).toBeNull();
    expect(container.querySelector('.badge')).toBeNull();
  });
});
