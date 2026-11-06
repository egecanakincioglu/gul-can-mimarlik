/*
  Logo UI treatment — kaynak dosya (public/images/gulcan-logo.svg) değiştirilmez.
  Ondan türetilmiş, tuval boşluğu kırpılmış şeffaf PNG varyantları kullanılır:
  logo-dark.png (Poşe, açık zeminler) ve logo-light.png (Kireç, koyu zeminler).
  Varyant seçimi CSS'te yapılır (.hdr[data-tone], .on-dark).
*/
export default function Logo({ height = 34, className = '' }: { height?: number; className?: string }) {
  return <span role="img" aria-label="Gül CAN Mimarlık" className={`logo ${className}`} style={{ height }} />;
}

export function LogoWide({ width = 320 }: { width?: number }) {
  return <span role="img" aria-label="Gül CAN Mimarlık" className="logo" style={{ width, maxWidth: '100%' }} />;
}
