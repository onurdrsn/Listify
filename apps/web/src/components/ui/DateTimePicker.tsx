interface DateTimePickerProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
}

export function DateTimePicker({ label, value, onChange }: DateTimePickerProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs text-text-secondary">{label}</label>}
      <input
        type="datetime-local"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={new Date().toISOString().slice(0, 16)}
        className="bg-slate-800 border border-border rounded-sm px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-color-series/40 transition-colors [color-scheme:dark] w-full"
      />
    </div>
  );
}
