export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(
    typeof window !== "undefined" ? navigator.language : "tr-TR",
    { day: "numeric", month: "long", year: "numeric" }
  ).format(new Date(iso));
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (m < 1)  return "Az önce";
  if (m < 60) return `${m} dk önce`;
  if (h < 24) return `${h} sa önce`;
  return `${d} gün önce`;
}

export function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}
