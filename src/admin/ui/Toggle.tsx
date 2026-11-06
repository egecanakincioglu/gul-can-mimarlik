'use client';

export default function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <span className="adm-toggle-row">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className="adm-toggle"
        onClick={() => onChange(!checked)}
      >
        <span className="adm-toggle-knob" aria-hidden="true" />
      </button>
      <span aria-hidden="true">{label}</span>
    </span>
  );
}
