interface TabsProps {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  color?: string;
}

export function Tabs({ tabs, active, onChange, color = "var(--color-film)" }: TabsProps) {
  return (
    <div className="flex gap-1 bg-slate-900 border border-border rounded-sm p-1 w-fit">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="px-4 py-2 text-sm rounded-sm transition-colors cursor-pointer"
          style={active === tab.id
            ? { background: "var(--color-slate-700)", color: "#ECEAF4" }
            : { color: "var(--color-text-muted)" }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
