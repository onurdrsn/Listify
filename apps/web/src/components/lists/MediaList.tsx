import { GenericListPage } from "./GenericListPage";

export function MediaList({ type, icon, color }: { type: "movie" | "series"; icon: string; color: string }) {
  return <GenericListPage type={type} icon={icon} color={color} />;
}
