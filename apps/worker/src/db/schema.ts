import {
  pgTable, text, timestamp, integer, boolean,
  pgEnum, uuid, smallint, jsonb, index
} from "drizzle-orm/pg-core";

/* ── Enum'lar ── */
export const listTypeEnum = pgEnum("list_type", [
  "movie", "series", "book",
  "food_restaurant", "food_recipe",
  "shopping"
]);

export const itemStatusEnum = pgEnum("item_status", [
  "pending",       // Bekliyor / Okunacak / Alınmadı
  "in_progress",   // Devam ediyor / Okunuyor
  "completed",     // Tamamlandı / İzlendi / Alındı
  "skipped"        // Geçildi / İptal
]);

export const reminderTypeEnum = pgEnum("reminder_type", [
  "manual",        // Kullanıcı tarih/saat seçti
  "weekly_digest", // Her Pazartesi 09:00
  "smart_idle"     // X gündür bekliyor tetikleyici
]);

export const notifChannelEnum = pgEnum("notif_channel", ["in_app", "email", "both"]);

/* ── Kullanıcılar ── */
export const users = pgTable("users", {
  id:               uuid("id").defaultRandom().primaryKey(),
  email:            text("email").notNull().unique(),
  passwordHash:     text("password_hash").notNull(),
  name:             text("name").notNull(),
  locale:           text("locale").notNull().default("tr"),          // "tr" | "en"
  notifChannel:     notifChannelEnum("notif_channel").notNull().default("both"),
  weeklyDigest:     boolean("weekly_digest").notNull().default(true),
  smartIdleDays:    smallint("smart_idle_days").notNull().default(7), // 0 = kapalı
  createdAt:        timestamp("created_at").defaultNow().notNull(),
  updatedAt:        timestamp("updated_at").defaultNow().notNull(),
  deletedAt:        timestamp("deleted_at"),
  scheduledPurgeAt: timestamp("scheduled_purge_at"),
});

/* ── Oturumlar ── */
export const sessions = pgTable("sessions", {
  id:        uuid("id").defaultRandom().primaryKey(),
  userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
});

/* ── Liste Öğeleri (tek tablo, tip bazlı alanlar) ── */
export const listItems = pgTable("list_items", {
  id:             uuid("id").defaultRandom().primaryKey(),
  userId:         uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:           listTypeEnum("type").notNull(),
  status:         itemStatusEnum("status").notNull().default("pending"),

  /* Ortak alanlar */
  title:          text("title").notNull(),
  notes:          text("notes"),
  rating:         smallint("rating"),                 // 1-5, null = puanlanmamış
  coverUrl:       text("cover_url"),
  externalId:     text("external_id"),                // "tmdb:12345" | "ol:OL123W"
  externalSource: text("external_source"),            // "tmdb" | "openlibrary" | "manual"
  addedAt:        timestamp("added_at").defaultNow().notNull(),
  updatedAt:      timestamp("updated_at").defaultNow().notNull(),
  completedAt:    timestamp("completed_at"),
  startedAt:      timestamp("started_at"),

  /* Film / Dizi */
  year:           smallint("year"),
  genre:          text("genre").array(),
  posterUrl:      text("poster_url"),
  seasonCount:    smallint("season_count"),

  /* Kitap */
  author:         text("author"),
  isbn:           text("isbn"),
  pageCount:      integer("page_count"),

  /* Yemek — restoran */
  restaurantName: text("restaurant_name"),
  cuisine:        text("cuisine"),
  location:       text("location"),
  priceRange:     smallint("price_range"),            // 1-4 (₺, ₺₺, ₺₺₺, ₺₺₺₺)
  mapsUrl:        text("maps_url"),

  /* Yemek — tarif */
  recipeUrl:      text("recipe_url"),
  cookTimeMin:    integer("cook_time_min"),
  difficulty:     smallint("difficulty"),             // 1-3

  /* extra — JSON blob for future fields */
  meta:           jsonb("meta"),
}, (t) => ({
  idxItemsUserType: index("idx_items_user_type").on(t.userId, t.type),
  idxItemsUserStatus: index("idx_items_user_status").on(t.userId, t.status),
  idxItemsAdded: index("idx_items_added").on(t.userId, t.addedAt),
}));

/* ── Alışveriş Kalemleri (ayrı tablo — checkbox davranışı farklı) ── */
export const shoppingCategories = pgEnum("shopping_category", [
  "produce", "meat_fish", "dairy", "bakery", "frozen",
  "beverages", "cleaning", "personal_care", "electronics",
  "clothing", "other"
]);

export const shoppingItems = pgTable("shopping_items", {
  id:         uuid("id").defaultRandom().primaryKey(),
  userId:     uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  listId:     uuid("list_id").notNull().references(() => listItems.id, { onDelete: "cascade" }),
                                                       // list_items'daki "shopping" kaydı
  name:       text("name").notNull(),
  quantity:   text("quantity").notNull().default("1"),
  unit:       text("unit"),                            // "kg", "adet", "L" vb.
  category:   shoppingCategories("category").notNull().default("other"),
  checked:    boolean("checked").notNull().default(false),
  price:      integer("price"),                        // kuruş cinsinden
  barcode:    text("barcode"),
  addedAt:    timestamp("added_at").defaultNow().notNull(),
  checkedAt:  timestamp("checked_at"),
}, (t) => ({
  idxShopList: index("idx_shop_list").on(t.listId),
  idxShopUser: index("idx_shop_user").on(t.userId),
}));

/* ── Hatırlatmalar ── */
export const reminders = pgTable("reminders", {
  id:           uuid("id").defaultRandom().primaryKey(),
  userId:       uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemId:       uuid("item_id").references(() => listItems.id, { onDelete: "cascade" }),
                                                       // null = genel (haftalık özet)
  type:         reminderTypeEnum("type").notNull(),
  channel:      notifChannelEnum("channel").notNull().default("both"),
  scheduledAt:  timestamp("scheduled_at"),             // manuel & smart için
  firedAt:      timestamp("fired_at"),
  isRecurring:  boolean("is_recurring").notNull().default(false),
  intervalDays: smallint("interval_days"),             // recurring için
  title:        text("title"),                         // özel başlık (opsiyonel)
  wittyKey:     text("witty_key"),                     // hangi esprili mesaj seti
  isActive:     boolean("is_active").notNull().default(true),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  idxRemindersUser: index("idx_reminders_user").on(t.userId),
  idxRemindersScheduled: index("idx_reminders_scheduled").on(t.scheduledAt),
  idxRemindersActive: index("idx_reminders_active").on(t.isActive, t.scheduledAt),
}));

/* ── Site İçi Bildirimler ── */
export const notifications = pgTable("notifications", {
  id:        uuid("id").defaultRandom().primaryKey(),
  userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reminderId: uuid("reminder_id").references(() => reminders.id, { onDelete: "set null" }),
  itemId:    uuid("item_id").references(() => listItems.id, { onDelete: "set null" }),
  title:     text("title").notNull(),
  body:      text("body").notNull(),
  isRead:    boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt:    timestamp("read_at"),
}, (t) => ({
  idxNotifUser: index("idx_notif_user").on(t.userId, t.isRead),
  idxNotifCreated: index("idx_notif_created").on(t.userId, t.createdAt),
}));
