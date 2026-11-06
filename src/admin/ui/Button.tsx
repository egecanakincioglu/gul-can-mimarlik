import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'destructive';

const CLASS: Record<Variant, string> = {
  primary: 'btn',
  secondary: 'adm-btn',
  destructive: 'adm-btn adm-btn-destructive',
};

export default function Button({
  variant = 'secondary',
  type = 'button',
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={[CLASS[variant], className].filter(Boolean).join(' ')} {...rest} />;
}
