export type ListType =
  | "movie"
  | "series"
  | "book"
  | "food_restaurant"
  | "food_recipe"
  | "shopping";

export type ItemStatus = "pending" | "in_progress" | "completed" | "skipped";

export interface ListItem {
  id: string;
  userId: string;
  type: ListType;
  status: ItemStatus;
  title: string;
  notes?: string | null;
  rating?: number | null;
  coverUrl?: string | null;
  externalId?: string | null;
  externalSource?: string | null;
  addedAt: string;
  updatedAt: string;
  completedAt?: string | null;
  startedAt?: string | null;
  // Film/dizi
  year?: number | null;
  genre?: string[] | null;
  posterUrl?: string | null;
  seasonCount?: number | null;
  // Kitap
  author?: string | null;
  isbn?: string | null;
  pageCount?: number | null;
  // Yemek
  restaurantName?: string | null;
  cuisine?: string | null;
  location?: string | null;
  priceRange?: number | null;
  mapsUrl?: string | null;
  recipeUrl?: string | null;
  cookTimeMin?: number | null;
  difficulty?: number | null;
  meta?: Record<string, unknown> | null;
}
