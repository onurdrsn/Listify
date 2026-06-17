interface SelectProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

export function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs text-text-secondary">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-slate-800 border border-border rounded-sm px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-color-film/40 transition-colors cursor-pointer w-full"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
