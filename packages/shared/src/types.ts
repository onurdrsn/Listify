export type ListType =
  | "movie"
  | "series"
  | "book"
  | "food_restaurant"
  | "food_recipe"
  | "shopping";

export type ItemStatus = "pending" | "in_progress" | "completed" | "skipped";

export type ReminderType = "manual" | "weekly_digest" | "smart_idle";

export type NotificationChannel = "in_app" | "email" | "both";

export type ShoppingCategory =
  | "produce"
  | "meat_fish"
  | "dairy"
  | "bakery"
  | "frozen"
  | "beverages"
  | "cleaning"
  | "personal_care"
  | "electronics"
  | "clothing"
  | "other";
