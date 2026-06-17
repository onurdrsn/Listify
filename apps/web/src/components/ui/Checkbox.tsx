interface CheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  color?: string;
}

export function Checkbox({ checked, onChange, label, color = "var(--color-film)" }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className="w-4 h-4 rounded-sm border transition-colors flex items-center justify-center shrink-0"
        style={{
          background: checked ? color : "transparent",
          borderColor: checked ? color : "var(--color-border-hover)",
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 2.5" stroke="#0A0C10" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>
      {label && <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>}
    </label>
  );
}
