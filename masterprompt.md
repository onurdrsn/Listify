cat > /mnt/user-data/outputs/listify-master-prompt.md << 'MASTER_PROMPT'
# Listify — Kişisel Takip & Hatırlatma Platformu
## Master Implementation Prompt v1.0
### Cloudflare Workers + Pages + Vite + React 19 + Hono + tRPC v11 + Neon PostgreSQL + Drizzle ORM + Resend + i18n

---

> **Kodlama ajanına:** Bu prompt'u sıfırdan, production-ready, deploy edilebilir hâlde uygula.
> Hiçbir stub, placeholder, "TODO" veya eksik implementasyon bırakma.
> Her fonksiyon tam ve çalışır olacak. Tüm environment variable referansları
> `wrangler.toml` ve `.dev.vars` dosyalarında yer alacak.

---

## 1. Ürün Vizyonu

**Listify** — tek platformda beş farklı liste tipi: Film, Dizi, Kitap, Yemek
(restoran + tarif), Alışveriş. Kullanıcı hangi listeyi seçerse o liste türünün
akışına girer. Tüm listeler tek dashboard'dan yönetilir.

**Ayırt edici özellik:** Esprili, kişisel hatırlatmalar — hem Resend üzerinden
mail, hem de site içi gerçek zamanlı bildirim. Üç mod: manuel tarih/saat,
haftalık otomatik özet (Pazartesi 09:00), akıllı "X gündür bekliyor" tetikleyici.

---

## 2. Monorepo Yapısı

```
listify/
├── apps/
│   ├── web/                              # Vite + React 19 → Cloudflare Pages
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── index.css                 # Tailwind v4 @theme {}
│   │   │   ├── i18n/
│   │   │   │   ├── index.ts
│   │   │   │   ├── locales/
│   │   │   │   │   ├── tr.json
│   │   │   │   │   └── en.json
│   │   │   ├── components/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Textarea.tsx
│   │   │   │   │   ├── Badge.tsx
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   ├── Toast.tsx
│   │   │   │   │   ├── Skeleton.tsx
│   │   │   │   │   ├── StarRating.tsx
│   │   │   │   │   ├── Tabs.tsx
│   │   │   │   │   ├── Select.tsx
│   │   │   │   │   ├── DateTimePicker.tsx
│   │   │   │   │   ├── Checkbox.tsx
│   │   │   │   │   └── LanguageSwitcher.tsx
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Shell.tsx
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   └── TopBar.tsx
│   │   │   │   ├── notifications/
│   │   │   │   │   ├── NotificationBell.tsx
│   │   │   │   │   └── NotificationDropdown.tsx
│   │   │   │   ├── lists/
│   │   │   │   │   ├── MediaList.tsx         # Film + Dizi
│   │   │   │   │   ├── BookList.tsx
│   │   │   │   │   ├── FoodList.tsx          # Restoran + Tarif sekmeli
│   │   │   │   │   └── ShoppingList.tsx      # Kategorili alışveriş
│   │   │   │   ├── cards/
│   │   │   │   │   ├── MediaCard.tsx
│   │   │   │   │   ├── BookCard.tsx
│   │   │   │   │   ├── FoodCard.tsx
│   │   │   │   │   └── ShoppingCard.tsx
│   │   │   │   ├── panels/
│   │   │   │   │   ├── AddItemPanel.tsx      # Tip bazlı dinamik form
│   │   │   │   │   ├── DetailPanel.tsx
│   │   │   │   │   └── ReminderPanel.tsx
│   │   │   │   └── search/
│   │   │   │       ├── TMDBSearch.tsx
│   │   │   │       ├── OpenLibrarySearch.tsx
│   │   │   │       └── ProductSearch.tsx
│   │   │   ├── pages/
│   │   │   │   ├── Landing.tsx
│   │   │   │   ├── Auth.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Movies.tsx
│   │   │   │   ├── Series.tsx
│   │   │   │   ├── Books.tsx
│   │   │   │   ├── Food.tsx
│   │   │   │   ├── Shopping.tsx
│   │   │   │   ├── Reminders.tsx
│   │   │   │   ├── Stats.tsx
│   │   │   │   └── Settings.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useNotifications.ts
│   │   │   │   └── useToast.ts
│   │   │   ├── store/
│   │   │   │   ├── authStore.ts
│   │   │   │   ├── uiStore.ts
│   │   │   │   └── notificationStore.ts
│   │   │   ├── lib/
│   │   │   │   ├── trpc.ts
│   │   │   │   └── utils.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   └── worker/                           # Cloudflare Worker → Hono + tRPC
│       ├── src/
│       │   ├── index.ts
│       │   ├── router/
│       │   │   ├── index.ts
│       │   │   ├── context.ts
│       │   │   ├── auth.ts
│       │   │   ├── items.ts              # Tüm liste tipleri tek router
│       │   │   ├── shopping.ts
│       │   │   ├── reminders.ts
│       │   │   ├── notifications.ts
│       │   │   ├── stats.ts
│       │   │   └── user.ts
│       │   ├── durable-objects/
│       │   │   └── ReminderScheduler.ts  # Per-user alarm DO
│       │   ├── services/
│       │   │   ├── tmdb.ts
│       │   │   ├── openLibrary.ts
│       │   │   ├── resend.ts
│       │   │   └── wittyMessages.ts      # Esprili mesaj üretici
│       │   ├── db/
│       │   │   ├── schema.ts
│       │   │   └── migrations/
│       │   │       └── 0001_init.sql
│       │   └── lib/
│       │       ├── crypto.ts
│       │       ├── jwt.ts
│       │       └── kvkk.ts
│       └── wrangler.toml
├── packages/
│   └── shared/
│       └── src/
│           ├── types.ts
│           └── validators.ts
├── package.json
└── turbo.json
```

---

## 3. Tasarım Sistemi

### Konsept: "Koyu Keten Defter"

Kullanıcının tüm listelerini tuttuğu fiziksel bir defterin dijital karşılığı.
Her liste tipi kendi renk kimliğiyle ayrışır ama arka plan sistemi birleşik kalır.
Minimal, cesur tipografi; sıcak nötr arka plan; liste tipine göre renk aksanları.

Üç generic default'dan bilinçli kaçınılır:
- Cream+terracotta → hayır
- Near-black+acid-green → hayır
- Broadsheet dense → hayır

**Seçim:** Koyu lacivert/antrasit zeminli, her liste tipinin kendi sıcak rengine
sahip olduğu "color-coded defter" sistemi. İmza element: sol kenarda ince dikey
renkli şerit (liste tipini gösterir) + defter spiral efekti üst borderde.

### `src/index.css`

```css
@import "tailwindcss";

@theme {
  /* Zemin */
  --color-slate-950: #0A0C10;
  --color-slate-900: #0F1117;
  --color-slate-800: #161820;
  --color-slate-700: #1E2130;
  --color-slate-600: #272A3A;

  /* Metin */
  --color-text-primary:   #ECEAF4;
  --color-text-secondary: #9896A8;
  --color-text-muted:     #555368;

  /* Liste renkleri — her tipin kimliği */
  --color-film:    #E8B04B;   /* Amber — Film */
  --color-series:  #7C6FE8;   /* Violet — Dizi */
  --color-book:    #4BA8E8;   /* Sky — Kitap */
  --color-food:    #E8574B;   /* Coral — Yemek */
  --color-shop:    #4BE8A8;   /* Mint — Alışveriş */

  /* Sistem renkleri */
  --color-success: #4BE8A8;
  --color-error:   #E8574B;
  --color-warning: #E8B04B;
  --color-info:    #4BA8E8;

  /* Sınırlar */
  --color-border:       rgba(255,255,255,0.06);
  --color-border-hover: rgba(255,255,255,0.12);

  /* Tipografi */
  --font-display: "Syne", sans-serif;
  --font-body:    "Inter", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", monospace;

  /* Radius / Shadow */
  --radius-card: 10px;
  --radius-sm:   6px;
  --shadow-card: 0 4px 32px rgba(0,0,0,0.5);
  --shadow-glow-film:   0 0 24px rgba(232,176,75,0.18);
  --shadow-glow-series: 0 0 24px rgba(124,111,232,0.18);
  --shadow-glow-book:   0 0 24px rgba(75,168,232,0.18);
  --shadow-glow-food:   0 0 24px rgba(232,87,75,0.18);
  --shadow-glow-shop:   0 0 24px rgba(75,232,168,0.18);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  font-family: var(--font-body);
  background: var(--color-slate-950);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  scrollbar-width: thin;
  scrollbar-color: var(--color-slate-700) transparent;
}

/* Animasyonlar */
@keyframes slide-up   { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
@keyframes slide-in-r { from { opacity:0; transform:translateX(16px) } to { opacity:1; transform:translateX(0) } }
@keyframes fade-in    { from { opacity:0 } to { opacity:1 } }
@keyframes pulse-dot  { 0%,100% { opacity:1 } 50% { opacity:.4 } }

.anim-up   { animation: slide-up   .25s ease-out forwards; }
.anim-r    { animation: slide-in-r .25s ease-out forwards; }
.anim-fade { animation: fade-in    .2s  ease-out forwards; }
.pulse-dot { animation: pulse-dot  1.5s ease-in-out infinite; }

/* Defter spiral üst borderi */
.notebook-spiral {
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 28px,
    var(--color-slate-700) 28px,
    var(--color-slate-700) 30px
  );
  height: 6px;
}
```

### Google Fonts (`index.html`)
```
Syne: 700, 800 — Logo, başlıklar
Inter: 400, 500, 600 — UI
```

### Liste Tipi Renk Haritası

| Tip | Renk değişkeni | Emoji |
|-----|---------------|-------|
| Film | `--color-film` | 🎬 |
| Dizi | `--color-series` | 📺 |
| Kitap | `--color-book` | 📖 |
| Yemek (restoran) | `--color-food` | 🍽️ |
| Yemek (tarif) | `--color-food` | 👨‍🍳 |
| Alışveriş | `--color-shop` | 🛒 |

---

## 4. Veritabanı Şeması (Neon PostgreSQL + Drizzle ORM)

```typescript
// apps/worker/src/db/schema.ts
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
}, (t) => [
  index("idx_items_user_type").on(t.userId, t.type),
  index("idx_items_user_status").on(t.userId, t.status),
  index("idx_items_added").on(t.userId, t.addedAt),
]);

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
}, (t) => [
  index("idx_shop_list").on(t.listId),
  index("idx_shop_user").on(t.userId),
]);

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
}, (t) => [
  index("idx_reminders_user").on(t.userId),
  index("idx_reminders_scheduled").on(t.scheduledAt),
  index("idx_reminders_active").on(t.isActive, t.scheduledAt),
]);

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
}, (t) => [
  index("idx_notif_user").on(t.userId, t.isRead),
  index("idx_notif_created").on(t.userId, t.createdAt),
]);
```

### Migration `0001_init.sql`

```sql
CREATE TYPE list_type AS ENUM (
  'movie','series','book',
  'food_restaurant','food_recipe','shopping'
);
CREATE TYPE item_status AS ENUM ('pending','in_progress','completed','skipped');
CREATE TYPE reminder_type AS ENUM ('manual','weekly_digest','smart_idle');
CREATE TYPE notif_channel AS ENUM ('in_app','email','both');
CREATE TYPE shopping_category AS ENUM (
  'produce','meat_fish','dairy','bakery','frozen',
  'beverages','cleaning','personal_care','electronics','clothing','other'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'tr',
  notif_channel notif_channel NOT NULL DEFAULT 'both',
  weekly_digest BOOLEAN NOT NULL DEFAULT TRUE,
  smart_idle_days SMALLINT NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  scheduled_purge_at TIMESTAMPTZ
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT
);
CREATE INDEX idx_sessions_token ON sessions(token_hash);

CREATE TABLE list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type list_type NOT NULL,
  status item_status NOT NULL DEFAULT 'pending',
  title TEXT NOT NULL,
  notes TEXT,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  cover_url TEXT,
  external_id TEXT,
  external_source TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  -- film/dizi
  year SMALLINT,
  genre TEXT[],
  poster_url TEXT,
  season_count SMALLINT,
  -- kitap
  author TEXT,
  isbn TEXT,
  page_count INTEGER,
  -- yemek-restoran
  restaurant_name TEXT,
  cuisine TEXT,
  location TEXT,
  price_range SMALLINT CHECK (price_range BETWEEN 1 AND 4),
  maps_url TEXT,
  -- yemek-tarif
  recipe_url TEXT,
  cook_time_min INTEGER,
  difficulty SMALLINT CHECK (difficulty BETWEEN 1 AND 3),
  -- genel
  meta JSONB
);
CREATE INDEX idx_items_user_type ON list_items(user_id, type);
CREATE INDEX idx_items_user_status ON list_items(user_id, status);
CREATE INDEX idx_items_added ON list_items(user_id, added_at DESC);

CREATE TABLE shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES list_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT NOT NULL DEFAULT '1',
  unit TEXT,
  category shopping_category NOT NULL DEFAULT 'other',
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  price INTEGER,
  barcode TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_at TIMESTAMPTZ
);
CREATE INDEX idx_shop_list ON shopping_items(list_id);

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES list_items(id) ON DELETE CASCADE,
  type reminder_type NOT NULL,
  channel notif_channel NOT NULL DEFAULT 'both',
  scheduled_at TIMESTAMPTZ,
  fired_at TIMESTAMPTZ,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  interval_days SMALLINT,
  title TEXT,
  witty_key TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reminders_user ON reminders(user_id);
CREATE INDEX idx_reminders_active ON reminders(is_active, scheduled_at);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reminder_id UUID REFERENCES reminders(id) ON DELETE SET NULL,
  item_id UUID REFERENCES list_items(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);
CREATE INDEX idx_notif_user ON notifications(user_id, is_read);
CREATE INDEX idx_notif_created ON notifications(user_id, created_at DESC);
```

---

## 5. Worker — Hono + tRPC

### `apps/worker/wrangler.toml`

```toml
name = "listify-api"
main = "src/index.ts"
compatibility_date = "2024-11-01"
compatibility_flags = ["nodejs_compat"]

[vars]
ENVIRONMENT = "production"
APP_URL = "https://listify.pages.dev"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "REPLACE_KV_ID"

[[kv_namespaces]]
binding = "SESSION_KV"
id = "REPLACE_SESSION_KV_ID"

[[durable_objects.bindings]]
name = "REMINDER_SCHEDULER"
class_name = "ReminderScheduler"

[[migrations]]
tag = "v1"
new_classes = ["ReminderScheduler"]

[triggers]
crons = [
  "0 3 * * *",   # KVKK hard-delete purge (03:00 UTC)
  "0 6 * * 1"    # Haftalık özet trigger (Pazartesi 06:00 UTC = Türkiye 09:00)
]

# .dev.vars (git'e EKLEME):
# DATABASE_URL=postgresql://...
# JWT_SECRET=64-char-random-string
# RESEND_API_KEY=re_...
# TMDB_API_KEY=...
# COOKIE_SECRET=32-char-random-string
```

### `apps/worker/src/index.ts`

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./router/index";
import { createContext } from "./router/context";
import { ReminderScheduler } from "./durable-objects/ReminderScheduler";
import { purgeDeletedUsers } from "./lib/kvkk";
import { fireWeeklyDigests } from "./services/resend";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./db/schema";

export { ReminderScheduler };

type Env = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
  TMDB_API_KEY: string;
  COOKIE_SECRET: string;
  APP_URL: string;
  RATE_LIMIT_KV: KVNamespace;
  SESSION_KV: KVNamespace;
  REMINDER_SCHEDULER: DurableObjectNamespace;
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", secureHeaders());
app.use("*", cors({
  origin: (origin) => {
    const allowed = [
      "https://listify.pages.dev",
      "http://localhost:5173",
    ];
    return allowed.includes(origin) ? origin : null;
  },
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

app.use("/trpc/*", trpcServer({
  router: appRouter,
  createContext: (opts, c) => createContext(opts, c.env),
}));

app.get("/health", (c) => c.json({ status: "ok", ts: Date.now() }));

export default {
  fetch: app.fetch,

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const db = drizzle(neon(env.DATABASE_URL), { schema });
    if (event.cron === "0 3 * * *") {
      ctx.waitUntil(purgeDeletedUsers(db));
    }
    if (event.cron === "0 6 * * 1") {
      ctx.waitUntil(fireWeeklyDigests(db, env));
    }
  },
};
```

### `apps/worker/src/router/context.ts`

```typescript
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { verifyJWT } from "../lib/jwt";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";

type Env = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
  TMDB_API_KEY: string;
  APP_URL: string;
  RATE_LIMIT_KV: KVNamespace;
  REMINDER_SCHEDULER: DurableObjectNamespace;
};

export async function createContext(opts: FetchCreateContextFnOptions, env: Env) {
  const db = drizzle(neon(env.DATABASE_URL), { schema });
  let userId: string | null = null;

  const authHeader = opts.req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = await verifyJWT(token, env.JWT_SECRET);
    if (payload) userId = payload.sub;
  }

  return { db, userId, env, req: opts.req };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

### `apps/worker/src/router/index.ts`

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import { authRouter } from "./auth";
import { itemsRouter } from "./items";
import { shoppingRouter } from "./shopping";
import { remindersRouter } from "./reminders";
import { notificationsRouter } from "./notifications";
import { statsRouter } from "./stats";
import { userRouter } from "./user";

export const t = initTRPC.context<Context>().create();

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Giriş yapmanız gerekiyor" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

export const appRouter = t.router({
  auth: authRouter,
  items: itemsRouter,
  shopping: shoppingRouter,
  reminders: remindersRouter,
  notifications: notificationsRouter,
  stats: statsRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
```

### `apps/worker/src/router/auth.ts`

```typescript
import { z } from "zod";
import { t, publicProcedure, protectedProcedure } from "./index";
import { users, sessions } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { hashPassword, verifyPassword, sha256Hex } from "../lib/crypto";
import { signJWT } from "../lib/jwt";
import { TRPCError } from "@trpc/server";

export const authRouter = t.router({
  register: publicProcedure
    .input(z.object({
      email:  z.string().email("Geçersiz e-posta"),
      password: z.string().min(8, "En az 8 karakter"),
      name:   z.string().min(2).max(64),
      locale: z.enum(["tr", "en"]).default("tr"),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.db.query.users.findFirst({
        where: and(eq(users.email, input.email.toLowerCase()), isNull(users.deletedAt)),
      });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Bu e-posta zaten kayıtlı" });

      const passwordHash = await hashPassword(input.password);
      const [user] = await ctx.db.insert(users)
        .values({ email: input.email.toLowerCase(), passwordHash, name: input.name, locale: input.locale })
        .returning({ id: users.id, email: users.email, name: users.name, locale: users.locale });

      const token = await signJWT({ sub: user.id }, ctx.env.JWT_SECRET, "30d");
      await ctx.db.insert(sessions).values({
        userId: user.id,
        tokenHash: await sha256Hex(token),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      return { token, user };
    }),

  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.query.users.findFirst({
        where: and(eq(users.email, input.email.toLowerCase()), isNull(users.deletedAt)),
      });
      if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "E-posta veya şifre hatalı" });
      }

      const token = await signJWT({ sub: user.id }, ctx.env.JWT_SECRET, "30d");
      await ctx.db.insert(sessions).values({
        userId: user.id,
        tokenHash: await sha256Hex(token),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userAgent: ctx.req.headers.get("user-agent") ?? undefined,
      });

      return {
        token,
        user: { id: user.id, email: user.email, name: user.name, locale: user.locale,
                notifChannel: user.notifChannel, weeklyDigest: user.weeklyDigest,
                smartIdleDays: user.smartIdleDays },
      };
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const token = ctx.req.headers.get("Authorization")?.slice(7);
    if (token) {
      await ctx.db.delete(sessions).where(eq(sessions.tokenHash, await sha256Hex(token)));
    }
    return { success: true };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: and(eq(users.id, ctx.userId), isNull(users.deletedAt)),
      columns: { id: true, email: true, name: true, locale: true,
                 notifChannel: true, weeklyDigest: true, smartIdleDays: true, createdAt: true },
    });
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    return user;
  }),
});
```

### `apps/worker/src/router/items.ts`

```typescript
import { z } from "zod";
import { t, protectedProcedure } from "./index";
import { listItems } from "../db/schema";
import { eq, and, desc, ilike, inArray, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { searchTMDB } from "../services/tmdb";
import { searchOpenLibrary } from "../services/openLibrary";

const LIST_TYPES = ["movie","series","book","food_restaurant","food_recipe","shopping"] as const;
const STATUSES   = ["pending","in_progress","completed","skipped"] as const;

export const itemsRouter = t.router({
  list: protectedProcedure
    .input(z.object({
      type:   z.enum(LIST_TYPES).optional(),
      status: z.enum(STATUSES).optional(),
      search: z.string().max(200).optional(),
      page:   z.number().int().min(1).default(1),
      limit:  z.number().int().min(1).max(100).default(24),
    }))
    .query(async ({ input, ctx }) => {
      const { type, status, search, page, limit } = input;
      const offset = (page - 1) * limit;

      const conditions = [eq(listItems.userId, ctx.userId)];
      if (type)   conditions.push(eq(listItems.type, type));
      if (status) conditions.push(eq(listItems.status, status));
      if (search) conditions.push(ilike(listItems.title, `%${search}%`));

      const [items, countResult] = await Promise.all([
        ctx.db.query.listItems.findMany({
          where: and(...conditions),
          orderBy: [desc(listItems.addedAt)],
          limit, offset,
        }),
        ctx.db.select({ count: sql<number>`count(*)::int` })
          .from(listItems).where(and(...conditions)),
      ]);

      return { items, total: countResult[0].count, page, limit };
    }),

  add: protectedProcedure
    .input(z.object({
      type:           z.enum(LIST_TYPES),
      title:          z.string().min(1).max(255),
      status:         z.enum(STATUSES).default("pending"),
      notes:          z.string().max(2000).optional(),
      coverUrl:       z.string().url().optional(),
      externalId:     z.string().optional(),
      externalSource: z.string().optional(),
      // film/dizi
      year:           z.number().int().min(1900).max(2100).optional(),
      genre:          z.array(z.string()).optional(),
      posterUrl:      z.string().url().optional(),
      seasonCount:    z.number().int().min(1).optional(),
      // kitap
      author:         z.string().max(255).optional(),
      isbn:           z.string().optional(),
      pageCount:      z.number().int().min(1).optional(),
      // yemek-restoran
      restaurantName: z.string().optional(),
      cuisine:        z.string().optional(),
      location:       z.string().optional(),
      priceRange:     z.number().int().min(1).max(4).optional(),
      mapsUrl:        z.string().url().optional(),
      // yemek-tarif
      recipeUrl:      z.string().url().optional(),
      cookTimeMin:    z.number().int().min(1).optional(),
      difficulty:     z.number().int().min(1).max(3).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const [item] = await ctx.db.insert(listItems)
        .values({ ...input, userId: ctx.userId })
        .returning();
      return item;
    }),

  update: protectedProcedure
    .input(z.object({
      id:          z.string().uuid(),
      status:      z.enum(STATUSES).optional(),
      rating:      z.number().int().min(1).max(5).nullable().optional(),
      notes:       z.string().max(2000).optional(),
      title:       z.string().min(1).max(255).optional(),
      startedAt:   z.string().datetime().optional(),
      completedAt: z.string().datetime().optional(),
      // yemek/alışveriş güncelleme alanları
      priceRange:  z.number().int().min(1).max(4).optional(),
      mapsUrl:     z.string().url().optional(),
      recipeUrl:   z.string().url().optional(),
      difficulty:  z.number().int().min(1).max(3).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;
      const existing = await ctx.db.query.listItems.findFirst({
        where: and(eq(listItems.id, id), eq(listItems.userId, ctx.userId)),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      const updateData: Record<string, unknown> = { ...updates, updatedAt: new Date() };
      if (updates.status === "completed" && !existing.completedAt) {
        updateData.completedAt = new Date();
      }

      const [updated] = await ctx.db.update(listItems)
        .set(updateData)
        .where(and(eq(listItems.id, id), eq(listItems.userId, ctx.userId)))
        .returning();
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.db.delete(listItems)
        .where(and(eq(listItems.id, input.id), eq(listItems.userId, ctx.userId)));
      return { success: true };
    }),

  markComplete: protectedProcedure
    .input(z.object({
      id:     z.string().uuid(),
      rating: z.number().int().min(1).max(5).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const [updated] = await ctx.db.update(listItems)
        .set({ status: "completed", completedAt: new Date(), rating: input.rating ?? null, updatedAt: new Date() })
        .where(and(eq(listItems.id, input.id), eq(listItems.userId, ctx.userId)))
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
      return updated;
    }),

  tmdbSearch: protectedProcedure
    .input(z.object({ query: z.string().min(1), type: z.enum(["movie","series"]) }))
    .query(async ({ input, ctx }) => searchTMDB(input.query, input.type, ctx.env.TMDB_API_KEY)),

  openLibrarySearch: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => searchOpenLibrary(input.query)),
});
```

### `apps/worker/src/router/shopping.ts`

```typescript
import { z } from "zod";
import { t, protectedProcedure } from "./index";
import { listItems, shoppingItems } from "../db/schema";
import { eq, and, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const CATEGORIES = [
  "produce","meat_fish","dairy","bakery","frozen",
  "beverages","cleaning","personal_care","electronics","clothing","other"
] as const;

export const shoppingRouter = t.router({
  /* Alışveriş listesi oluştur (list_items'a "shopping" kaydı) */
  createList: protectedProcedure
    .input(z.object({ title: z.string().min(1).max(100).default("Alışveriş Listesi") }))
    .mutation(async ({ input, ctx }) => {
      const [list] = await ctx.db.insert(listItems)
        .values({ userId: ctx.userId, type: "shopping", title: input.title, status: "pending" })
        .returning();
      return list;
    }),

  /* Listedeki ürünler */
  getItems: protectedProcedure
    .input(z.object({ listId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      // Önce liste sahibi mi doğrula
      const list = await ctx.db.query.listItems.findFirst({
        where: and(eq(listItems.id, input.listId), eq(listItems.userId, ctx.userId)),
      });
      if (!list) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.query.shoppingItems.findMany({
        where: eq(shoppingItems.listId, input.listId),
        orderBy: [asc(shoppingItems.category), asc(shoppingItems.addedAt)],
      });
    }),

  addItem: protectedProcedure
    .input(z.object({
      listId:   z.string().uuid(),
      name:     z.string().min(1).max(200),
      quantity: z.string().default("1"),
      unit:     z.string().max(20).optional(),
      category: z.enum(CATEGORIES).default("other"),
      price:    z.number().int().min(0).optional(),
      barcode:  z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Sahiplik doğrula
      const list = await ctx.db.query.listItems.findFirst({
        where: and(eq(listItems.id, input.listId), eq(listItems.userId, ctx.userId)),
      });
      if (!list) throw new TRPCError({ code: "NOT_FOUND" });

      const [item] = await ctx.db.insert(shoppingItems)
        .values({ ...input, userId: ctx.userId })
        .returning();
      return item;
    }),

  toggleItem: protectedProcedure
    .input(z.object({ id: z.string().uuid(), checked: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const [updated] = await ctx.db.update(shoppingItems)
        .set({
          checked: input.checked,
          checkedAt: input.checked ? new Date() : null,
        })
        .where(and(eq(shoppingItems.id, input.id), eq(shoppingItems.userId, ctx.userId)))
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
      return updated;
    }),

  deleteItem: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.delete(shoppingItems)
        .where(and(eq(shoppingItems.id, input.id), eq(shoppingItems.userId, ctx.userId)));
      return { success: true };
    }),

  clearChecked: protectedProcedure
    .input(z.object({ listId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Sahiplik doğrula
      const list = await ctx.db.query.listItems.findFirst({
        where: and(eq(listItems.id, input.listId), eq(listItems.userId, ctx.userId)),
      });
      if (!list) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.delete(shoppingItems)
        .where(and(
          eq(shoppingItems.listId, input.listId),
          eq(shoppingItems.checked, true)
        ));
      return { success: true };
    }),

  /* Barkod arama — Open Food Facts ücretsiz API */
  barcodeSearch: protectedProcedure
    .input(z.object({ barcode: z.string().min(8).max(14) }))
    .query(async ({ input }) => {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${input.barcode}.json`
      );
      const data = await res.json() as any;
      if (data.status !== 1 || !data.product) return null;
      return {
        name: data.product.product_name ?? data.product.product_name_tr ?? "Bilinmiyor",
        brand: data.product.brands ?? "",
        imageUrl: data.product.image_url ?? null,
        category: "other" as const,
      };
    }),
});
```

### `apps/worker/src/router/reminders.ts`

```typescript
import { z } from "zod";
import { t, protectedProcedure } from "./index";
import { reminders, notifications, listItems, users } from "../db/schema";
import { eq, and, desc, lte, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getWittyMessage } from "../services/wittyMessages";
import { sendReminderEmail } from "../services/resend";
import { createInAppNotification } from "./notifications";

const REMINDER_TYPES = ["manual","weekly_digest","smart_idle"] as const;
const CHANNELS       = ["in_app","email","both"] as const;

export const remindersRouter = t.router({
  list: protectedProcedure
    .input(z.object({ active: z.boolean().optional() }))
    .query(async ({ input, ctx }) => {
      const conditions = [eq(reminders.userId, ctx.userId)];
      if (input.active !== undefined) conditions.push(eq(reminders.isActive, input.active));
      return ctx.db.query.reminders.findMany({
        where: and(...conditions),
        orderBy: [desc(reminders.createdAt)],
      });
    }),

  create: protectedProcedure
    .input(z.object({
      itemId:       z.string().uuid().optional(),
      type:         z.enum(REMINDER_TYPES),
      channel:      z.enum(CHANNELS).default("both"),
      scheduledAt:  z.string().datetime().optional(),
      isRecurring:  z.boolean().default(false),
      intervalDays: z.number().int().min(1).max(365).optional(),
      title:        z.string().max(200).optional(),
      wittyKey:     z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (input.type === "manual" && !input.scheduledAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Manuel hatırlatma için tarih/saat zorunludur" });
      }

      const [reminder] = await ctx.db.insert(reminders)
        .values({ ...input, userId: ctx.userId })
        .returning();

      // Durable Object Alarm kur (manual için)
      if (input.type === "manual" && input.scheduledAt) {
        const doId = ctx.env.REMINDER_SCHEDULER.idFromName(ctx.userId);
        const stub = ctx.env.REMINDER_SCHEDULER.get(doId);
        await stub.fetch("https://do/schedule", {
          method: "POST",
          body: JSON.stringify({ reminderId: reminder.id, scheduledAt: input.scheduledAt }),
          headers: { "Content-Type": "application/json" },
        });
      }

      return reminder;
    }),

  update: protectedProcedure
    .input(z.object({
      id:           z.string().uuid(),
      isActive:     z.boolean().optional(),
      scheduledAt:  z.string().datetime().optional(),
      channel:      z.enum(CHANNELS).optional(),
      title:        z.string().max(200).optional(),
      intervalDays: z.number().int().min(1).max(365).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;
      const existing = await ctx.db.query.reminders.findFirst({
        where: and(eq(reminders.id, id), eq(reminders.userId, ctx.userId)),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      const [updated] = await ctx.db.update(reminders)
        .set(updates)
        .where(eq(reminders.id, id))
        .returning();
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.delete(reminders)
        .where(and(eq(reminders.id, input.id), eq(reminders.userId, ctx.userId)));
      return { success: true };
    }),

  /* Smart idle — Worker cron bu endpoint'i tetikler (iç kullanım) */
  fireSmartIdle: protectedProcedure
    .mutation(async ({ ctx }) => {
      const user = await ctx.db.query.users.findFirst({ where: eq(users.id, ctx.userId) });
      if (!user || user.smartIdleDays === 0) return { fired: 0 };

      const cutoff = new Date(Date.now() - user.smartIdleDays * 24 * 60 * 60 * 1000);
      const pendingItems = await ctx.db.query.listItems.findMany({
        where: and(
          eq(listItems.userId, ctx.userId),
          eq(listItems.status, "pending"),
          lte(listItems.addedAt, cutoff)
        ),
      });

      let fired = 0;
      for (const item of pendingItems.slice(0, 3)) { // Max 3 aynı anda
        const message = getWittyMessage("smart_idle", item.type, user.locale);
        if (user.notifChannel !== "email") {
          await createInAppNotification(ctx.db, {
            userId: ctx.userId,
            itemId: item.id,
            title: message.title,
            body: message.body,
          });
        }
        if (user.notifChannel !== "in_app") {
          await sendReminderEmail(ctx.env.RESEND_API_KEY, {
            to: user.email,
            name: user.name,
            subject: message.title,
            body: message.body,
            itemTitle: item.title,
            itemType: item.type,
            appUrl: ctx.env.APP_URL,
            locale: user.locale,
          });
        }
        fired++;
      }
      return { fired };
    }),
});
```

### `apps/worker/src/router/notifications.ts`

```typescript
import { z } from "zod";
import { t, protectedProcedure } from "./index";
import { notifications } from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

export async function createInAppNotification(
  db: any,
  data: { userId: string; itemId?: string; reminderId?: string; title: string; body: string }
) {
  const [notif] = await db.insert(notifications).values(data).returning();
  return notif;
}

export const notificationsRouter = t.router({
  list: protectedProcedure
    .input(z.object({
      unreadOnly: z.boolean().default(false),
      limit:      z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ input, ctx }) => {
      const conditions = [eq(notifications.userId, ctx.userId)];
      if (input.unreadOnly) conditions.push(eq(notifications.isRead, false));

      const [items, unreadCount] = await Promise.all([
        ctx.db.query.notifications.findMany({
          where: and(...conditions),
          orderBy: [desc(notifications.createdAt)],
          limit: input.limit,
        }),
        ctx.db.select({ count: sql<number>`count(*)::int` })
          .from(notifications)
          .where(and(eq(notifications.userId, ctx.userId), eq(notifications.isRead, false))),
      ]);

      return { items, unreadCount: unreadCount[0].count };
    }),

  markRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.userId)));
      return { success: true };
    }),

  markAllRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      await ctx.db.update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(and(eq(notifications.userId, ctx.userId), eq(notifications.isRead, false)));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.delete(notifications)
        .where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.userId)));
      return { success: true };
    }),
});
```

### `apps/worker/src/router/stats.ts`

```typescript
import { z } from "zod";
import { t, protectedProcedure } from "./index";
import { listItems, shoppingItems } from "../db/schema";
import { eq, sql, and } from "drizzle-orm";

export const statsRouter = t.router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.db.query.listItems.findMany({
      where: eq(listItems.userId, ctx.userId),
      columns: { type: true, status: true, rating: true, completedAt: true },
    });

    const types = ["movie","series","book","food_restaurant","food_recipe","shopping"] as const;
    const byType: Record<string, Record<string, number>> = {};
    for (const type of types) {
      byType[type] = { pending: 0, in_progress: 0, completed: 0, skipped: 0 };
    }

    let totalRating = 0, ratingCount = 0;
    const byMonth: Record<string, number> = {};

    for (const item of items) {
      byType[item.type][item.status]++;
      if (item.rating) { totalRating += item.rating; ratingCount++; }
      if (item.completedAt) {
        const k = new Date(item.completedAt).toISOString().slice(0, 7);
        byMonth[k] = (byMonth[k] ?? 0) + 1;
      }
    }

    return {
      byType,
      averageRating: ratingCount > 0 ? +(totalRating / ratingCount).toFixed(1) : null,
      byMonth,
      total: items.length,
    };
  }),
});
```

### `apps/worker/src/router/user.ts`

```typescript
import { z } from "zod";
import { t, protectedProcedure } from "./index";
import { users, sessions } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../lib/crypto";
import { TRPCError } from "@trpc/server";

export const userRouter = t.router({
  updateProfile: protectedProcedure
    .input(z.object({
      name:          z.string().min(2).max(64).optional(),
      locale:        z.enum(["tr","en"]).optional(),
      notifChannel:  z.enum(["in_app","email","both"]).optional(),
      weeklyDigest:  z.boolean().optional(),
      smartIdleDays: z.number().int().min(0).max(30).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const [updated] = await ctx.db.update(users)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(users.id, ctx.userId))
        .returning({ id: users.id, email: users.email, name: users.name,
                     locale: users.locale, notifChannel: users.notifChannel,
                     weeklyDigest: users.weeklyDigest, smartIdleDays: users.smartIdleDays });
      return updated;
    }),

  changePassword: protectedProcedure
    .input(z.object({ currentPassword: z.string(), newPassword: z.string().min(8) }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.query.users.findFirst({ where: eq(users.id, ctx.userId) });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Mevcut şifre hatalı" });
      }
      await ctx.db.update(users)
        .set({ passwordHash: await hashPassword(input.newPassword), updatedAt: new Date() })
        .where(eq(users.id, ctx.userId));
      return { success: true };
    }),

  requestDeletion: protectedProcedure.mutation(async ({ ctx }) => {
    const purgeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await ctx.db.update(users)
      .set({ deletedAt: new Date(), scheduledPurgeAt: purgeDate, updatedAt: new Date() })
      .where(eq(users.id, ctx.userId));
    await ctx.db.delete(sessions).where(eq(sessions.userId, ctx.userId));
    return { success: true, purgeDate: purgeDate.toISOString() };
  }),

  cancelDeletion: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.update(users)
      .set({ deletedAt: null, scheduledPurgeAt: null, updatedAt: new Date() })
      .where(eq(users.id, ctx.userId));
    return { success: true };
  }),
});
```

---

## 6. Durable Object — Hatırlatma Zamanlayıcı

### `apps/worker/src/durable-objects/ReminderScheduler.ts`

```typescript
import { DurableObject } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";
import { eq, and, lte, isNull } from "drizzle-orm";
import { reminders, notifications, listItems, users } from "../db/schema";
import { getWittyMessage } from "../services/wittyMessages";
import { sendReminderEmail } from "../services/resend";
import { createInAppNotification } from "../router/notifications";

type Env = {
  DATABASE_URL: string;
  RESEND_API_KEY: string;
  APP_URL: string;
};

export class ReminderScheduler extends DurableObject {
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/schedule" && request.method === "POST") {
      const { reminderId, scheduledAt } = await request.json() as {
        reminderId: string; scheduledAt: string;
      };
      const ts = new Date(scheduledAt).getTime();
      if (ts > Date.now()) {
        // Mevcut alarmı iptal edip yenisini kur
        await this.ctx.storage.put(`reminder:${reminderId}`, scheduledAt);
        const earliest = await this.getEarliestAlarm();
        if (!this.ctx.storage.getAlarm || earliest === null || ts < earliest) {
          await this.ctx.storage.setAlarm(ts);
        }
      }
      return new Response("ok");
    }

    if (url.pathname === "/cancel" && request.method === "POST") {
      const { reminderId } = await request.json() as { reminderId: string };
      await this.ctx.storage.delete(`reminder:${reminderId}`);
      return new Response("ok");
    }

    return new Response("Not found", { status: 404 });
  }

  async alarm() {
    const now = Date.now();
    const db = drizzle(neon(this.env.DATABASE_URL), { schema });

    // Süresi gelmiş tüm hatırlatmaları bul
    const dueReminders = await db.query.reminders.findMany({
      where: and(
        eq(reminders.isActive, true),
        lte(reminders.scheduledAt, new Date(now)),
        isNull(reminders.firedAt),
      ),
    });

    for (const reminder of dueReminders) {
      try {
        await this.fireReminder(db, reminder);
      } catch (err) {
        console.error("Reminder fire error:", err);
      }
    }

    // Bir sonraki alarmı ayarla
    const nextAlarm = await this.getEarliestScheduled(db);
    if (nextAlarm) {
      await this.ctx.storage.setAlarm(nextAlarm.getTime());
    }
  }

  private async fireReminder(db: any, reminder: typeof reminders.$inferSelect) {
    const user = await db.query.users.findFirst({ where: eq(users.id, reminder.userId) });
    if (!user) return;

    let item: typeof listItems.$inferSelect | undefined;
    if (reminder.itemId) {
      item = await db.query.listItems.findFirst({ where: eq(listItems.id, reminder.itemId) });
    }

    const wittyKey = reminder.wittyKey ?? (item ? item.type : "general");
    const message = getWittyMessage(reminder.type, wittyKey as any, user.locale);
    const title = reminder.title ?? message.title;
    const body  = message.body;

    if (user.notifChannel !== "email") {
      await createInAppNotification(db, {
        userId: reminder.userId,
        reminderId: reminder.id,
        itemId: reminder.itemId ?? undefined,
        title,
        body,
      });
    }

    if (user.notifChannel !== "in_app") {
      await sendReminderEmail(this.env.RESEND_API_KEY, {
        to: user.email,
        name: user.name,
        subject: title,
        body,
        itemTitle: item?.title,
        itemType: item?.type,
        appUrl: this.env.APP_URL,
        locale: user.locale,
      });
    }

    // firedAt güncelle
    await db.update(reminders)
      .set({ firedAt: new Date(), isActive: reminder.isRecurring })
      .where(eq(reminders.id, reminder.id));

    // Recurring ise bir sonraki zamanı hesapla
    if (reminder.isRecurring && reminder.intervalDays && reminder.scheduledAt) {
      const next = new Date(reminder.scheduledAt);
      next.setDate(next.getDate() + reminder.intervalDays);
      await db.update(reminders)
        .set({ scheduledAt: next, firedAt: null, isActive: true })
        .where(eq(reminders.id, reminder.id));
    }
  }

  private async getEarliestAlarm(): Promise<number | null> {
    const alarm = await this.ctx.storage.getAlarm();
    return alarm ?? null;
  }

  private async getEarliestScheduled(db: any): Promise<Date | null> {
    const next = await db.query.reminders.findFirst({
      where: and(eq(reminders.isActive, true), isNull(reminders.firedAt)),
      orderBy: [reminders.scheduledAt],
    });
    return next?.scheduledAt ?? null;
  }
}
```

---

## 7. Servisler

### `apps/worker/src/services/wittyMessages.ts`

```typescript
type ListType = "movie" | "series" | "book" | "food_restaurant" | "food_recipe" | "shopping" | "general";
type ReminderType = "manual" | "weekly_digest" | "smart_idle";
type Locale = "tr" | "en";

interface WittyMessage { title: string; body: string; }

const messages: Record<Locale, Record<ReminderType, Record<ListType | "default", WittyMessage[]>>> = {
  tr: {
    manual: {
      movie: [
        { title: "🎬 Popcorn hazır mı?", body: "Hatırladın mı? O film hâlâ seni bekliyor. Popcorn yaparken değil, izlerken bulun sizi." },
        { title: "🎞️ Film vakti!", body: "Listenize aldığınız film sizi özlüyor. Bu gece kaçmayın!" },
      ],
      series: [
        { title: "📺 Binge-watch zamanı!", body: "O dizinin konusu ne miydi? Tam hatırlamadan önce ilk bölümü açın." },
        { title: "🍿 Dizi maratonuna ne dersin?", body: "Ekrana uzanıyorsunuz zaten, o diziyi neden izlemiyorsunuz?" },
      ],
      book: [
        { title: "📖 Kitap seni bekliyor!", body: "Kitap rafında toz toplarken içiniz sıkışıyor mu? İşte tam zamanı." },
        { title: "🔖 Okumak mı, kaçmak mı?", body: "Listenize eklediğiniz kitap hâlâ ilk sayfasında." },
      ],
      food_restaurant: [
        { title: "🍽️ Rezervasyon zamanı!", body: "O restoranı ne zaman denediniz? Spoiler: hiç. Bu gece değişsin." },
        { title: "🍴 Açsın mı mideniz?", body: "Denemek istediğiniz restoran hâlâ bekliyor. Masayı kapmadan önce deneyin!" },
      ],
      food_recipe: [
        { title: "👨‍🍳 Mutfak sizi çağırıyor!", body: "O tarif hâlâ ekranda duruyor. Mutfağınız boş, vaktiniz var, bahaneniz yok." },
        { title: "🥘 Pişirme zamanı!", body: "\"Bir gün pişireceğim\" diye eklediğiniz tarif size bakıyor." },
      ],
      shopping: [
        { title: "🛒 Alışveriş günü!", body: "Listeyi oluşturdunuz, şimdi markete gitme vakti." },
        { title: "🏪 Market kapanmadan önce!", body: "Alışveriş listeniz hazır, sadece market bekliyor." },
      ],
      general: [
        { title: "⏰ Hatırlatma!", body: "Kendiniz için ayarladığınız hatırlatma vakti geldi." },
      ],
      default: [
        { title: "⏰ Hatırlatma zamanı!", body: "Listenizde bekleyen bir şey var." },
      ],
    },
    weekly_digest: {
      movie: [{ title: "🎬 Haftalık Film Özetiniz", body: "Bu hafta izleme listenizde neler var bir bakalım..." }],
      series: [{ title: "📺 Haftalık Dizi Özetiniz", body: "Dizi listeniz büyümeye devam ediyor!" }],
      book: [{ title: "📚 Haftalık Kitap Özetiniz", body: "Okumak isteyip ertelediğiniz kitaplar sizi bekliyor." }],
      food_restaurant: [{ title: "🍽️ Haftalık Restoran Özetiniz", body: "Denemek istediğiniz restoranlar hâlâ listede!" }],
      food_recipe: [{ title: "👨‍🍳 Haftalık Tarif Özetiniz", body: "Bu hafta mutfağa girdiniz mi?" }],
      shopping: [{ title: "🛒 Haftalık Alışveriş Özetiniz", body: "Alınacaklar listeniz güncellendi mi?" }],
      general: [{ title: "📋 Haftalık Listelerin Özeti", body: "Tüm listelerinize bir göz atalım!" }],
      default: [{ title: "📋 Haftalık Özet", body: "Bu haftaki listelerinize bakma vakti." }],
    },
    smart_idle: {
      movie: [
        { title: "🎬 Hâlâ izlemediniz mi?", body: "O film listenize gireli bir süre oldu. Tarih yazmayalım ama biraz uzun..." },
        { title: "🍿 Film bekliyor, siz neredesiniz?", body: "Ekrana oturduğunuzda ne olacak biliyor musunuz? O film izlenecek." },
      ],
      series: [
        { title: "📺 Dizi toz tutuyor!", body: "O dizi ekleneli epey vakit geçti. Artık izlenme hakkını kazandı." },
      ],
      book: [
        { title: "📖 Kitap sinirlendi!", body: "Bakın, kitap sabırlıdır ama sınırsız değil. Okumaya ne zaman başlıyorsunuz?" },
        { title: "🔖 Kitap çok bekledi", body: "Listenizdeki kitap 'beni bekliyorsan neden okumuyorsun?' diye bakıyor." },
      ],
      food_restaurant: [
        { title: "🍴 Restoran sizi unuttu!", body: "O restoranı listeye ekleyeli kaç gün oldu? Gitmeden menüsü değişir." },
      ],
      food_recipe: [
        { title: "👨‍🍳 Tarif ağlıyor!", body: "O tarifi ekleyeli çok oldu. Malzemeler alınmadı, ocak açılmadı." },
      ],
      shopping: [
        { title: "🛒 Liste uzuyor!", body: "Alışveriş listeniz giderek büyüyor. Markete gitme vakti geldi." },
      ],
      general: [
        { title: "⚡ Uzun süredir bekleniyor", body: "Listenizde bekleyip bekleyip beklenen bir şey var." },
      ],
      default: [
        { title: "📌 Bekleme süresi doldu!", body: "Listenizde uzun süredir bekleyen bir öğe var." },
      ],
    },
  },
  en: {
    manual: {
      movie: [
        { title: "🎬 Popcorn ready?", body: "That movie is still waiting for you. Don't keep it waiting any longer!" },
      ],
      series: [
        { title: "📺 Binge time!", body: "That show on your list won't watch itself." },
      ],
      book: [
        { title: "📖 Your book misses you!", body: "The book on your list is collecting dust. Time to open it!" },
      ],
      food_restaurant: [
        { title: "🍽️ Time to book a table!", body: "That restaurant you've been meaning to try is still waiting." },
      ],
      food_recipe: [
        { title: "👨‍🍳 The kitchen is calling!", body: "That recipe is still saved. No more excuses — the stove is right there!" },
      ],
      shopping: [
        { title: "🛒 Shopping day!", body: "Your list is ready, the store is waiting." },
      ],
      general: [{ title: "⏰ Reminder!", body: "You set a reminder for yourself — here it is!" }],
      default: [{ title: "⏰ It's reminder time!", body: "Something on your list is waiting." }],
    },
    weekly_digest: {
      movie: [{ title: "🎬 Your Weekly Movie Digest", body: "Let's check what's on your watchlist this week..." }],
      series: [{ title: "📺 Your Weekly Series Digest", body: "Your series list keeps growing!" }],
      book: [{ title: "📚 Your Weekly Book Digest", body: "Books you meant to read are still waiting." }],
      food_restaurant: [{ title: "🍽️ Your Weekly Restaurant Digest", body: "Still haven't tried those restaurants?" }],
      food_recipe: [{ title: "👨‍🍳 Your Weekly Recipe Digest", body: "Did you cook anything this week?" }],
      shopping: [{ title: "🛒 Your Weekly Shopping Digest", body: "Time to update your shopping list!" }],
      general: [{ title: "📋 Weekly List Summary", body: "Let's take a look at all your lists!" }],
      default: [{ title: "📋 Weekly Digest", body: "Time to check your lists for this week." }],
    },
    smart_idle: {
      movie: [{ title: "🎬 Still haven't watched it?", body: "That movie has been sitting on your list for a while now..." }],
      series: [{ title: "📺 Your series is collecting dust!", body: "It's been a while since you added that show. Time to watch!" }],
      book: [{ title: "📖 Your book is getting impatient!", body: "Books are patient, but yours is starting to wonder if you'll ever read it." }],
      food_restaurant: [{ title: "🍴 The restaurant forgot you!", body: "It's been a while — go before the menu changes!" }],
      food_recipe: [{ title: "👨‍🍳 The recipe is crying!", body: "You saved that recipe ages ago. The ingredients aren't going to buy themselves." }],
      shopping: [{ title: "🛒 List getting long!", body: "Your shopping list is growing. Time to hit the store." }],
      general: [{ title: "⚡ Long wait over!", body: "Something on your list has been waiting for too long." }],
      default: [{ title: "📌 Overdue!", body: "An item on your list has been waiting a long time." }],
    },
  },
};

export function getWittyMessage(
  reminderType: ReminderType,
  listType: ListType,
  locale: Locale = "tr"
): WittyMessage {
  const pool = messages[locale][reminderType][listType]
    ?? messages[locale][reminderType]["default"]
    ?? [{ title: "⏰ Hatırlatma", body: "Listenizde bir şey bekliyor." }];
  return pool[Math.floor(Math.random() * pool.length)];
}
```

### `apps/worker/src/services/resend.ts`

```typescript
type Locale = "tr" | "en";

interface ReminderEmailParams {
  to: string;
  name: string;
  subject: string;
  body: string;
  itemTitle?: string;
  itemType?: string;
  appUrl: string;
  locale: Locale;
}

export async function sendReminderEmail(
  apiKey: string,
  params: ReminderEmailParams
): Promise<void> {
  const { to, name, subject, body, itemTitle, itemType, appUrl, locale } = params;

  const cta = locale === "tr" ? "Listemi Aç" : "Open My List";
  const greeting = locale === "tr" ? `Merhaba ${name},` : `Hi ${name},`;
  const itemLabel = locale === "tr" ? "Öğe:" : "Item:";
  const unsubLabel = locale === "tr" ? "Bildirimleri yönet" : "Manage notifications";

  const typeEmojis: Record<string, string> = {
    movie: "🎬", series: "📺", book: "📖",
    food_restaurant: "🍽️", food_recipe: "👨‍🍳", shopping: "🛒",
  };
  const emoji = itemType ? (typeEmojis[itemType] ?? "📋") : "📋";

  const html = `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin:0; padding:0; background:#0A0C10; font-family:'Inter',sans-serif; color:#ECEAF4; }
    .container { max-width:520px; margin:40px auto; background:#0F1117; border:1px solid rgba(255,255,255,0.06); border-radius:12px; overflow:hidden; }
    .header { background:#161820; padding:28px 32px; border-bottom:1px solid rgba(255,255,255,0.06); }
    .logo { font-size:22px; font-weight:800; color:#E8B04B; letter-spacing:-0.5px; }
    .body { padding:32px; }
    .greeting { font-size:15px; color:#9896A8; margin-bottom:16px; }
    .message-box { background:#161820; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:20px 24px; margin:20px 0; }
    .message-title { font-size:18px; font-weight:600; color:#ECEAF4; margin-bottom:8px; }
    .message-body { font-size:14px; color:#9896A8; line-height:1.6; }
    .item-chip { display:inline-flex; align-items:center; gap:6px; background:#1E2130; border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:6px 12px; font-size:13px; color:#ECEAF4; margin:16px 0; }
    .cta { display:block; width:fit-content; background:#E8B04B; color:#0A0C10; font-weight:600; font-size:14px; padding:12px 24px; border-radius:6px; text-decoration:none; margin:24px 0 8px; }
    .footer { padding:20px 32px; border-top:1px solid rgba(255,255,255,0.06); font-size:12px; color:#555368; text-align:center; }
    .footer a { color:#555368; text-decoration:underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><span class="logo">Listify</span></div>
    <div class="body">
      <p class="greeting">${greeting}</p>
      <div class="message-box">
        <div class="message-title">${emoji} ${subject}</div>
        <div class="message-body">${body}</div>
      </div>
      ${itemTitle ? `<div class="item-chip">${emoji} <span>${itemLabel} ${itemTitle}</span></div>` : ""}
      <a href="${appUrl}/dashboard" class="cta">${cta} →</a>
    </div>
    <div class="footer">
      <a href="${appUrl}/ayarlar">${unsubLabel}</a>
    </div>
  </div>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Listify <bildirim@listify.app>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    throw new Error(`Resend failed: ${res.status}`);
  }
}

export async function sendWeeklyDigestEmail(
  apiKey: string,
  params: {
    to: string;
    name: string;
    locale: Locale;
    appUrl: string;
    stats: {
      pendingMovies: number;
      pendingSeries: number;
      pendingBooks: number;
      pendingFood: number;
      pendingShopping: number;
      completedThisWeek: number;
    };
  }
): Promise<void> {
  const { to, name, locale, appUrl, stats } = params;
  const subject = locale === "tr"
    ? "📋 Listify — Haftalık Özet"
    : "📋 Listify — Weekly Digest";

  const rows = locale === "tr"
    ? [
        { label: "🎬 Bekleyen Filmler",      value: stats.pendingMovies },
        { label: "📺 Bekleyen Diziler",      value: stats.pendingSeries },
        { label: "📖 Bekleyen Kitaplar",     value: stats.pendingBooks },
        { label: "🍽️ Bekleyen Yemekler",    value: stats.pendingFood },
        { label: "🛒 Bekleyen Alışveriş",   value: stats.pendingShopping },
        { label: "✅ Bu Hafta Tamamlanan",  value: stats.completedThisWeek },
      ]
    : [
        { label: "🎬 Pending Movies",        value: stats.pendingMovies },
        { label: "📺 Pending Series",        value: stats.pendingSeries },
        { label: "📖 Pending Books",         value: stats.pendingBooks },
        { label: "🍽️ Pending Food",         value: stats.pendingFood },
        { label: "🛒 Pending Shopping",     value: stats.pendingShopping },
        { label: "✅ Completed This Week",  value: stats.completedThisWeek },
      ];

  const tableRows = rows
    .filter(r => r.value > 0)
    .map(r => `<tr><td style="padding:8px 0;color:#9896A8;font-size:14px;">${r.label}</td><td style="padding:8px 0;color:#ECEAF4;font-size:14px;font-weight:600;text-align:right;">${r.value}</td></tr>`)
    .join("");

  const cta = locale === "tr" ? "Listelerimi Gör" : "View My Lists";
  const greeting = locale === "tr" ? `Merhaba ${name},` : `Hi ${name},`;
  const intro = locale === "tr"
    ? "Bu haftaki liste özetiniz hazır. Tamamlamak için tıklayın!"
    : "Here's your weekly list summary. Click to get things done!";

  const html = `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <style>
    body { margin:0; padding:0; background:#0A0C10; font-family:'Inter',sans-serif; color:#ECEAF4; }
    .container { max-width:520px; margin:40px auto; background:#0F1117; border:1px solid rgba(255,255,255,0.06); border-radius:12px; overflow:hidden; }
    .header { background:#161820; padding:28px 32px; border-bottom:1px solid rgba(255,255,255,0.06); }
    .logo { font-size:22px; font-weight:800; color:#E8B04B; }
    .body { padding:32px; }
    .greeting { font-size:15px; color:#9896A8; margin-bottom:8px; }
    .intro { font-size:15px; color:#ECEAF4; margin-bottom:24px; }
    table { width:100%; border-collapse:collapse; }
    .cta { display:block; width:fit-content; background:#E8B04B; color:#0A0C10; font-weight:600; font-size:14px; padding:12px 24px; border-radius:6px; text-decoration:none; margin-top:24px; }
    .footer { padding:20px 32px; border-top:1px solid rgba(255,255,255,0.06); font-size:12px; color:#555368; text-align:center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><span class="logo">Listify</span></div>
    <div class="body">
      <p class="greeting">${greeting}</p>
      <p class="intro">${intro}</p>
      <table>${tableRows}</table>
      <a href="${appUrl}/dashboard" class="cta">${cta} →</a>
    </div>
    <div class="footer">Listify • <a href="${appUrl}/ayarlar" style="color:#555368;">Bildirimleri yönet</a></div>
  </div>
</body>
</html>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Listify <bildirim@listify.app>", to: [to], subject, html }),
  });
}

/* Cron tetikleyici: tüm aktif kullanıcılara haftalık özet */
export async function fireWeeklyDigests(db: any, env: any): Promise<void> {
  const { users, listItems } = await import("../db/schema");
  const { eq, and, isNull, gte } = await import("drizzle-orm");

  const activeUsers = await db.query.users.findMany({
    where: and(eq(users.weeklyDigest, true), isNull(users.deletedAt)),
  });

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  for (const user of activeUsers) {
    const [pending, completed] = await Promise.all([
      db.query.listItems.findMany({
        where: and(eq(listItems.userId, user.id), eq(listItems.status, "pending")),
        columns: { type: true },
      }),
      db.query.listItems.findMany({
        where: and(
          eq(listItems.userId, user.id),
          eq(listItems.status, "completed"),
          gte(listItems.completedAt, oneWeekAgo)
        ),
        columns: { id: true },
      }),
    ]);

    const countByType = (type: string) => pending.filter((p: any) => p.type === type).length;

    await sendWeeklyDigestEmail(env.RESEND_API_KEY, {
      to: user.email,
      name: user.name,
      locale: user.locale as "tr" | "en",
      appUrl: env.APP_URL,
      stats: {
        pendingMovies:   countByType("movie"),
        pendingSeries:   countByType("series"),
        pendingBooks:    countByType("book"),
        pendingFood:     countByType("food_restaurant") + countByType("food_recipe"),
        pendingShopping: countByType("shopping"),
        completedThisWeek: completed.length,
      },
    });
  }
}
```

### `apps/worker/src/services/tmdb.ts`

```typescript
const TMDB_BASE = "https://api.themoviedb.org/3";
const genreCache: Record<string, Record<number, string>> = {};

export interface TMDBResult {
  id: number; title: string; originalTitle: string;
  year: string; posterUrl: string | null;
  overview: string; genre: string[]; voteAverage: number;
}

export async function searchTMDB(query: string, type: "movie" | "series", apiKey: string): Promise<TMDBResult[]> {
  const endpoint = type === "movie" ? "search/movie" : "search/tv";
  const res = await fetch(`${TMDB_BASE}/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=tr-TR`);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  const data = await res.json() as { results: any[] };
  const gmap = await getGenreMap(apiKey, type === "movie" ? "movie" : "tv");
  return data.results.slice(0, 10).map(item => ({
    id: item.id,
    title:         type === "movie" ? item.title : item.name,
    originalTitle: type === "movie" ? item.original_title : item.original_name,
    year:          (type === "movie" ? item.release_date : item.first_air_date)?.slice(0, 4) ?? "",
    posterUrl:     item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
    overview:      item.overview ?? "",
    genre:         (item.genre_ids as number[]).map(id => gmap[id] ?? "").filter(Boolean),
    voteAverage:   item.vote_average ?? 0,
  }));
}

async function getGenreMap(apiKey: string, mediaType: "movie" | "tv"): Promise<Record<number, string>> {
  if (genreCache[mediaType]) return genreCache[mediaType];
  const res = await fetch(`${TMDB_BASE}/genre/${mediaType}/list?api_key=${apiKey}&language=tr-TR`);
  const data = await res.json() as { genres: { id: number; name: string }[] };
  const map: Record<number, string> = {};
  for (const g of data.genres) map[g.id] = g.name;
  genreCache[mediaType] = map;
  return map;
}
```

### `apps/worker/src/services/openLibrary.ts`

```typescript
export interface OLResult {
  key: string; title: string; author: string;
  year: number | null; coverUrl: string | null;
  isbn: string | null; pageCount: number | null; subjects: string[];
}

export async function searchOpenLibrary(query: string): Promise<OLResult[]> {
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10&fields=key,title,author_name,first_publish_year,cover_i,isbn,number_of_pages_median,subject`
  );
  if (!res.ok) throw new Error(`OpenLibrary ${res.status}`);
  const data = await res.json() as { docs: any[] };
  return data.docs.map(doc => ({
    key:       doc.key ?? "",
    title:     doc.title ?? "",
    author:    doc.author_name?.[0] ?? "Bilinmiyor",
    year:      doc.first_publish_year ?? null,
    coverUrl:  doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
    isbn:      doc.isbn?.[0] ?? null,
    pageCount: doc.number_of_pages_median ?? null,
    subjects:  (doc.subject ?? []).slice(0, 5),
  }));
}
```

---

## 8. Kriptografi & JWT

### `apps/worker/src/lib/crypto.ts`

```typescript
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 310_000, hash: "SHA-256" }, keyMaterial, 256
  );
  const saltHex = [...salt].map(b => b.toString(16).padStart(2, "0")).join("");
  const hashHex = [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, "0")).join("");
  return `pbkdf2:${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "pbkdf2") return false;
  const salt = Uint8Array.from(parts[1].match(/.{2}/g)!.map(b => parseInt(b, 16)));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 310_000, hash: "SHA-256" }, keyMaterial, 256
  );
  const hashHex = [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex === parts[2];
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf  = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}
```

### `apps/worker/src/lib/jwt.ts`

```typescript
export interface JWTPayload { sub: string; exp: number; iat: number; }

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
}
function b64dec(str: string): Uint8Array {
  return Uint8Array.from(atob(str.replace(/-/g,"+").replace(/_/g,"/")), c => c.charCodeAt(0));
}
function parseExpiry(s: string): number {
  const m = s.match(/^(\d+)([smhd])$/);
  return m ? parseInt(m[1]) * ({s:1,m:60,h:3600,d:86400}[m[2] as "s"]!) : 86400;
}

export async function signJWT(payload: { sub: string }, secret: string, expiresIn: string): Promise<string> {
  const now = Math.floor(Date.now()/1000);
  const full = { sub: payload.sub, iat: now, exp: now + parseExpiry(expiresIn) };
  const header  = btoa(JSON.stringify({ alg:"HS256", typ:"JWT" })).replace(/=/g,"");
  const body    = btoa(JSON.stringify(full)).replace(/=/g,"");
  const input   = `${header}.${body}`;
  const key     = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name:"HMAC", hash:"SHA-256" }, false, ["sign"]);
  const sig     = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input));
  return `${input}.${b64url(sig)}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const [h, p, s] = token.split(".");
    if (!h || !p || !s) return null;
    const key   = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name:"HMAC", hash:"SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, b64dec(s), new TextEncoder().encode(`${h}.${p}`));
    if (!valid) return null;
    const payload: JWTPayload = JSON.parse(atob(p));
    if (payload.exp < Math.floor(Date.now()/1000)) return null;
    return payload;
  } catch { return null; }
}
```

### `apps/worker/src/lib/kvkk.ts`

```typescript
export async function purgeDeletedUsers(db: any): Promise<void> {
  const { users } = await import("../db/schema");
  const { and, isNotNull, lte } = await import("drizzle-orm");
  await db.delete(users).where(
    and(isNotNull(users.deletedAt), isNotNull(users.scheduledPurgeAt), lte(users.scheduledPurgeAt, new Date()))
  );
}
```

---

## 9. i18n Sistemi

### `apps/web/src/i18n/index.ts`

```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import tr from "./locales/tr.json";
import en from "./locales/en.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { tr: { translation: tr }, en: { translation: en } },
    fallbackLng: "tr",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "listify_lang",
    },
  });

export default i18n;
```

### `apps/web/src/i18n/locales/tr.json` (kısaltılmış — tüm anahtarlar eklenecek)

```json
{
  "app": { "name": "Listify", "tagline": "Tüm listeleriniz tek yerde." },
  "nav": {
    "dashboard": "Genel Bakış",
    "movies": "Filmler",
    "series": "Diziler",
    "books": "Kitaplar",
    "food": "Yemek",
    "shopping": "Alışveriş",
    "reminders": "Hatırlatmalar",
    "stats": "İstatistikler",
    "settings": "Ayarlar",
    "logout": "Çıkış Yap"
  },
  "auth": {
    "login": "Giriş Yap",
    "register": "Kayıt Ol",
    "email": "E-posta",
    "password": "Şifre",
    "name": "Adınız",
    "loginTitle": "Tekrar hoş geldiniz",
    "registerTitle": "Listenizi oluşturun",
    "noAccount": "Hesabınız yok mu?",
    "hasAccount": "Hesabınız var mı?",
    "invalidEmail": "Geçersiz e-posta",
    "passwordMin": "En az 8 karakter",
    "wrongCredentials": "E-posta veya şifre hatalı",
    "emailTaken": "Bu e-posta zaten kayıtlı"
  },
  "landing": {
    "hero": "Tüm listeleriniz,\nbir arada.",
    "heroSub": "Film, dizi, kitap, yemek, alışveriş — hepsini takip edin. Esprili hatırlatmalarla unutturmayız.",
    "cta": "Ücretsiz Başla",
    "ctaLogin": "Giriş Yap",
    "feature1Title": "5 Liste Tipi",
    "feature1Desc": "Film, dizi, kitap, yemek ve alışveriş listesi tek platformda.",
    "feature2Title": "Esprili Hatırlatmalar",
    "feature2Desc": "Mail ve site içi bildirimlerle sizi asla sıkmadan hatırlatırız.",
    "feature3Title": "İki Dil",
    "feature3Desc": "Türkçe ve İngilizce — istediğiniz dilde kullanın."
  },
  "status": {
    "pending": "Bekliyor",
    "in_progress": "Devam Ediyor",
    "completed": "Tamamlandı",
    "skipped": "Geçildi"
  },
  "listType": {
    "movie": "Film",
    "series": "Dizi",
    "book": "Kitap",
    "food_restaurant": "Restoran",
    "food_recipe": "Tarif",
    "shopping": "Alışveriş"
  },
  "actions": {
    "add": "Ekle",
    "save": "Kaydet",
    "delete": "Sil",
    "cancel": "İptal",
    "markDone": "Tamamlandı",
    "markWatched": "İzledim",
    "markRead": "Okudum",
    "markVisited": "Gittim",
    "markCooked": "Pişirdim",
    "search": "Ara",
    "filter": "Filtrele",
    "edit": "Düzenle",
    "close": "Kapat"
  },
  "empty": {
    "movie": "Henüz film eklemediniz. İzlemek istediğiniz filmleri ekleyin!",
    "series": "Dizi listeniz boş. Başlamak istediğiniz bir dizi var mı?",
    "book": "Kitap listeniz boş. Okunmayı bekleyen kitaplar ekleyin.",
    "food_restaurant": "Restoran listeniz boş. Denemek istediğiniz yerleri ekleyin!",
    "food_recipe": "Tarif listeniz boş. Pişirmek istediğiniz tarifleri ekleyin.",
    "shopping": "Alışveriş listeniz boş. Alınacakları ekleyin."
  },
  "reminder": {
    "title": "Hatırlatmalar",
    "create": "Hatırlatma Ekle",
    "type": {
      "manual": "Belirli Tarih/Saat",
      "weekly_digest": "Haftalık Özet",
      "smart_idle": "Akıllı (X Gündür Bekliyor)"
    },
    "channel": {
      "in_app": "Sadece Uygulama İçi",
      "email": "Sadece E-posta",
      "both": "Her İkisi"
    },
    "scheduledAt": "Tarih ve Saat",
    "recurring": "Tekrarlansın",
    "intervalDays": "Her kaç günde bir?",
    "noReminders": "Henüz hatırlatma eklemediniz.",
    "active": "Aktif",
    "inactive": "Pasif"
  },
  "notification": {
    "title": "Bildirimler",
    "markAllRead": "Tümünü Okundu İşaretle",
    "noNotifications": "Yeni bildirim yok.",
    "unread": "{{count}} okunmamış"
  },
  "shopping": {
    "addItem": "Ürün Ekle",
    "category": {
      "produce": "Meyve & Sebze",
      "meat_fish": "Et & Balık",
      "dairy": "Süt Ürünleri",
      "bakery": "Fırın",
      "frozen": "Dondurulmuş",
      "beverages": "İçecekler",
      "cleaning": "Temizlik",
      "personal_care": "Kişisel Bakım",
      "electronics": "Elektronik",
      "clothing": "Giyim",
      "other": "Diğer"
    },
    "quantity": "Miktar",
    "unit": "Birim",
    "price": "Fiyat (TL)",
    "barcode": "Barkod Ara",
    "clearChecked": "Alındıları Temizle",
    "newList": "Yeni Liste"
  },
  "food": {
    "restaurant": "Restoran",
    "recipe": "Tarif",
    "cuisine": "Mutfak",
    "location": "Konum",
    "priceRange": "Fiyat Aralığı",
    "mapsUrl": "Harita Linki",
    "recipeUrl": "Tarif Linki",
    "cookTime": "Pişirme Süresi (dk)",
    "difficulty": { "1": "Kolay", "2": "Orta", "3": "Zor" }
  },
  "settings": {
    "title": "Ayarlar",
    "profile": "Profil",
    "notifications": "Bildirimler",
    "language": "Dil",
    "weeklyDigest": "Haftalık Özet E-postası",
    "smartIdleDays": "Akıllı Hatırlatma (gün)",
    "smartIdleDesc": "0 = kapalı. Bir öğe bu kadar gün bekledikten sonra hatırlatılır.",
    "notifChannel": "Bildirim Kanalı",
    "deleteAccount": "Hesabı Sil",
    "deleteAccountDesc": "Hesabınız 30 gün sonra kalıcı olarak silinir. Bu süre içinde geri alabilirsiniz.",
    "saved": "Kaydedildi!"
  },
  "stats": {
    "title": "İstatistikler",
    "totalItems": "Toplam Öğe",
    "completed": "Tamamlanan",
    "averageRating": "Ortalama Puan",
    "byMonth": "Aylık Tamamlanan",
    "byType": "Tipe Göre"
  },
  "errors": {
    "generic": "Bir şeyler ters gitti. Tekrar deneyin.",
    "notFound": "Bulunamadı.",
    "unauthorized": "Bu işlem için giriş yapmanız gerekiyor."
  },
  "toast": {
    "added": "Eklendi!",
    "updated": "Güncellendi!",
    "deleted": "Silindi!",
    "completed": "Tamamlandı!",
    "reminderSet": "Hatırlatma kuruldu!",
    "settingsSaved": "Ayarlar kaydedildi!"
  }
}
```

### `apps/web/src/i18n/locales/en.json` (aynı yapı, İngilizce değerlerle)

```json
{
  "app": { "name": "Listify", "tagline": "All your lists in one place." },
  "nav": {
    "dashboard": "Overview",
    "movies": "Movies",
    "series": "Series",
    "books": "Books",
    "food": "Food",
    "shopping": "Shopping",
    "reminders": "Reminders",
    "stats": "Stats",
    "settings": "Settings",
    "logout": "Log Out"
  },
  "auth": {
    "login": "Log In",
    "register": "Sign Up",
    "email": "Email",
    "password": "Password",
    "name": "Your Name",
    "loginTitle": "Welcome back",
    "registerTitle": "Create your list",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "invalidEmail": "Invalid email",
    "passwordMin": "At least 8 characters",
    "wrongCredentials": "Invalid email or password",
    "emailTaken": "Email already in use"
  },
  "landing": {
    "hero": "All your lists,\nin one place.",
    "heroSub": "Movies, series, books, food, shopping — track them all. We'll remind you with a smile.",
    "cta": "Get Started Free",
    "ctaLogin": "Log In",
    "feature1Title": "5 List Types",
    "feature1Desc": "Movies, series, books, food, and shopping — all in one platform.",
    "feature2Title": "Witty Reminders",
    "feature2Desc": "Email and in-app notifications that actually make you smile.",
    "feature3Title": "Two Languages",
    "feature3Desc": "Turkish and English — use it however you like."
  },
  "status": {
    "pending": "Pending",
    "in_progress": "In Progress",
    "completed": "Completed",
    "skipped": "Skipped"
  },
  "listType": {
    "movie": "Movie",
    "series": "Series",
    "book": "Book",
    "food_restaurant": "Restaurant",
    "food_recipe": "Recipe",
    "shopping": "Shopping"
  },
  "actions": {
    "add": "Add",
    "save": "Save",
    "delete": "Delete",
    "cancel": "Cancel",
    "markDone": "Done",
    "markWatched": "Watched",
    "markRead": "Read",
    "markVisited": "Visited",
    "markCooked": "Cooked",
    "search": "Search",
    "filter": "Filter",
    "edit": "Edit",
    "close": "Close"
  },
  "empty": {
    "movie": "No movies yet. Add movies you want to watch!",
    "series": "Your series list is empty. Any shows you want to start?",
    "book": "No books yet. Add books you want to read.",
    "food_restaurant": "No restaurants yet. Add places you want to try!",
    "food_recipe": "No recipes yet. Add recipes you want to cook.",
    "shopping": "Shopping list is empty. Add items to get started."
  },
  "reminder": {
    "title": "Reminders",
    "create": "Add Reminder",
    "type": {
      "manual": "Specific Date/Time",
      "weekly_digest": "Weekly Digest",
      "smart_idle": "Smart (Idle for X days)"
    },
    "channel": {
      "in_app": "In-App Only",
      "email": "Email Only",
      "both": "Both"
    },
    "scheduledAt": "Date and Time",
    "recurring": "Recurring",
    "intervalDays": "Every how many days?",
    "noReminders": "No reminders yet.",
    "active": "Active",
    "inactive": "Inactive"
  },
  "notification": {
    "title": "Notifications",
    "markAllRead": "Mark All as Read",
    "noNotifications": "No new notifications.",
    "unread": "{{count}} unread"
  },
  "shopping": {
    "addItem": "Add Item",
    "category": {
      "produce": "Produce",
      "meat_fish": "Meat & Fish",
      "dairy": "Dairy",
      "bakery": "Bakery",
      "frozen": "Frozen",
      "beverages": "Beverages",
      "cleaning": "Cleaning",
      "personal_care": "Personal Care",
      "electronics": "Electronics",
      "clothing": "Clothing",
      "other": "Other"
    },
    "quantity": "Quantity",
    "unit": "Unit",
    "price": "Price",
    "barcode": "Barcode Search",
    "clearChecked": "Clear Checked",
    "newList": "New List"
  },
  "food": {
    "restaurant": "Restaurant",
    "recipe": "Recipe",
    "cuisine": "Cuisine",
    "location": "Location",
    "priceRange": "Price Range",
    "mapsUrl": "Maps Link",
    "recipeUrl": "Recipe Link",
    "cookTime": "Cook Time (min)",
    "difficulty": { "1": "Easy", "2": "Medium", "3": "Hard" }
  },
  "settings": {
    "title": "Settings",
    "profile": "Profile",
    "notifications": "Notifications",
    "language": "Language",
    "weeklyDigest": "Weekly Digest Email",
    "smartIdleDays": "Smart Reminder (days)",
    "smartIdleDesc": "0 = off. Reminded after an item has been pending this many days.",
    "notifChannel": "Notification Channel",
    "deleteAccount": "Delete Account",
    "deleteAccountDesc": "Your account will be permanently deleted after 30 days. You can cancel during this period.",
    "saved": "Saved!"
  },
  "stats": {
    "title": "Stats",
    "totalItems": "Total Items",
    "completed": "Completed",
    "averageRating": "Average Rating",
    "byMonth": "Completed by Month",
    "byType": "By Type"
  },
  "errors": {
    "generic": "Something went wrong. Please try again.",
    "notFound": "Not found.",
    "unauthorized": "You need to be logged in to do this."
  },
  "toast": {
    "added": "Added!",
    "updated": "Updated!",
    "deleted": "Deleted!",
    "completed": "Completed!",
    "reminderSet": "Reminder set!",
    "settingsSaved": "Settings saved!"
  }
}
```

---

## 10. Frontend — Ana Bileşenler

### `apps/web/src/main.tsx`

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./lib/trpc";
import App from "./App";
import "./index.css";
import "./i18n/index";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 2 } },
});

const trpcClient = trpc.createClient({
  links: [httpBatchLink({
    url: `${import.meta.env.VITE_API_URL}/trpc`,
    headers: () => {
      const token = localStorage.getItem("listify_token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
  })],
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>
);
```

### `apps/web/src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { Shell } from "./components/layout/Shell";
import { Landing } from "./pages/Landing";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { Movies } from "./pages/Movies";
import { Series } from "./pages/Series";
import { Books } from "./pages/Books";
import { Food } from "./pages/Food";
import { Shopping } from "./pages/Shopping";
import { Reminders } from "./pages/Reminders";
import { Stats } from "./pages/Stats";
import { Settings } from "./pages/Settings";
import { Toast } from "./components/ui/Toast";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore as useAuth } from "./store/authStore";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token);
  if (!token) return <Navigate to="/giris" replace />;
  return <>{children}</>;
}

export default function App() {
  const { i18n } = useTranslation();
  const user = useAuth(s => s.user);

  // Kullanıcı dil tercihini i18n'e yansıt
  useEffect(() => {
    if (user?.locale) i18n.changeLanguage(user.locale);
  }, [user?.locale]);

  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/"       element={<Landing />} />
        <Route path="/giris"  element={<Auth mode="login" />} />
        <Route path="/kayit"  element={<Auth mode="register" />} />
        <Route element={<ProtectedRoute><Shell /></ProtectedRoute>}>
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/filmler"        element={<Movies />} />
          <Route path="/diziler"        element={<Series />} />
          <Route path="/kitaplar"       element={<Books />} />
          <Route path="/yemek"          element={<Food />} />
          <Route path="/alisveris"      element={<Shopping />} />
          <Route path="/hatirlatmalar"  element={<Reminders />} />
          <Route path="/istatistikler"  element={<Stats />} />
          <Route path="/ayarlar"        element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### `apps/web/src/store/authStore.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string; email: string; name: string; locale: "tr" | "en";
  notifChannel: "in_app" | "email" | "both";
  weeklyDigest: boolean; smartIdleDays: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem("listify_token", token);
        set({ token, user });
      },
      updateUser: (updates) => set(s => ({ user: s.user ? { ...s.user, ...updates } : null })),
      clearAuth: () => {
        localStorage.removeItem("listify_token");
        set({ token: null, user: null });
      },
    }),
    { name: "listify_auth" }
  )
);
```

### `apps/web/src/store/notificationStore.ts`

```typescript
import { create } from "zustand";

interface NotifState {
  unreadCount: number;
  setUnreadCount: (n: number) => void;
  decrement: () => void;
  reset: () => void;
}

export const useNotifStore = create<NotifState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: n }),
  decrement: () => set(s => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  reset: () => set({ unreadCount: 0 }),
}));
```

### `apps/web/src/components/layout/Shell.tsx`

```typescript
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function Shell() {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### `apps/web/src/components/layout/TopBar.tsx`

```typescript
import { useTranslation } from "react-i18next";
import { NotificationBell } from "../notifications/NotificationBell";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";

export function TopBar() {
  return (
    <header className="h-14 border-b border-border flex items-center justify-end px-6 gap-3 shrink-0 bg-slate-900">
      <LanguageSwitcher />
      <NotificationBell />
    </header>
  );
}
```

### `apps/web/src/components/layout/Sidebar.tsx`

```typescript
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { trpc } from "../../lib/trpc";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";

const LIST_COLOR: Record<string, string> = {
  "/filmler":   "var(--color-film)",
  "/diziler":   "var(--color-series)",
  "/kitaplar":  "var(--color-book)",
  "/yemek":     "var(--color-food)",
  "/alisveris": "var(--color-shop)",
};

export function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore(s => s.clearAuth);
  const user = useAuthStore(s => s.user);
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => { clearAuth(); navigate("/"); },
  });

  const NAV = [
    { to: "/dashboard",     icon: "⊞",  label: t("nav.dashboard")  },
    { to: "/filmler",       icon: "🎬", label: t("nav.movies")      },
    { to: "/diziler",       icon: "📺", label: t("nav.series")      },
    { to: "/kitaplar",      icon: "📖", label: t("nav.books")       },
    { to: "/yemek",         icon: "🍽️", label: t("nav.food")        },
    { to: "/alisveris",     icon: "🛒", label: t("nav.shopping")    },
    { to: "/hatirlatmalar", icon: "🔔", label: t("nav.reminders")   },
    { to: "/istatistikler", icon: "◈",  label: t("nav.stats")       },
  ];

  return (
    <aside className="w-56 flex flex-col border-r border-border bg-slate-900 shrink-0">
      {/* Logo + spiral dekorasyon */}
      <div className="px-5 py-5 border-b border-border">
        <div className="notebook-spiral mb-3 -mx-5" />
        <span className="text-xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--color-film)" }}>
          Listify
        </span>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-sm transition-colors relative",
              isActive
                ? "bg-slate-800 text-text-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-slate-800/60"
            )}
          >
            {({ isActive }) => (
              <>
                {/* Aktif sol şerit — liste rengi */}
                {isActive && LIST_COLOR[item.to] && (
                  <span
                    className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
                    style={{ background: LIST_COLOR[item.to] }}
                  />
                )}
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-border pt-3 space-y-0.5">
        <NavLink
          to="/ayarlar"
          className={({ isActive }) => cn(
            "flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-sm transition-colors",
            isActive ? "bg-slate-800 text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-slate-800/60"
          )}
        >
          <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-text-primary">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="truncate text-sm">{user?.name}</span>
        </NavLink>
        <button
          onClick={() => logout.mutate()}
          className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm text-text-muted hover:text-color-error rounded-sm transition-colors"
        >
          <span className="w-5 text-center">↩</span>
          <span>{t("nav.logout")}</span>
        </button>
      </div>
    </aside>
  );
}
```

### `apps/web/src/components/notifications/NotificationBell.tsx`

```typescript
import { useState, useRef, useEffect } from "react";
import { trpc } from "../../lib/trpc";
import { useNotifStore } from "../../store/notificationStore";
import { NotificationDropdown } from "./NotificationDropdown";
import { useTranslation } from "react-i18next";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const setUnread = useNotifStore(s => s.setUnreadCount);

  const { data, refetch } = trpc.notifications.list.useQuery(
    { unreadOnly: false, limit: 20 },
    { refetchInterval: 30_000 } // 30 saniyede bir polling
  );

  useEffect(() => {
    if (data) setUnread(data.unreadCount);
  }, [data]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-sm text-text-secondary hover:text-text-primary hover:bg-slate-800 transition-colors"
        aria-label={t("notification.title")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-color-food pulse-dot" />
        )}
      </button>
      {open && (
        <NotificationDropdown
          notifications={data?.items ?? []}
          unreadCount={unreadCount}
          onClose={() => setOpen(false)}
          onRefetch={refetch}
        />
      )}
    </div>
  );
}
```

### `apps/web/src/components/notifications/NotificationDropdown.tsx`

```typescript
import { trpc } from "../../lib/trpc";
import { useTranslation } from "react-i18next";
import { useToastStore } from "../ui/Toast";
import { cn } from "../../lib/utils";
import { formatRelative } from "../../lib/utils";

interface NotifItem {
  id: string; title: string; body: string;
  isRead: boolean; createdAt: string;
}

interface Props {
  notifications: NotifItem[];
  unreadCount: number;
  onClose: () => void;
  onRefetch: () => void;
}

export function NotificationDropdown({ notifications, unreadCount, onClose, onRefetch }: Props) {
  const { t } = useTranslation();
  const { add: toast } = useToastStore();

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: onRefetch,
  });
  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => { onRefetch(); toast("success", t("notification.markAllRead")); },
  });

  return (
    <div className={cn(
      "absolute right-0 top-11 w-80 bg-slate-900 border border-border rounded-card shadow-card z-50",
      "anim-r overflow-hidden"
    )}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold text-text-primary">{t("notification.title")}</span>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            {t("notification.markAllRead")}
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-border">
        {notifications.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">{t("notification.noNotifications")}</p>
        ) : notifications.map(notif => (
          <div
            key={notif.id}
            onClick={() => { if (!notif.isRead) markRead.mutate({ id: notif.id }); }}
            className={cn(
              "px-4 py-3 cursor-pointer transition-colors",
              notif.isRead
                ? "hover:bg-slate-800/40"
                : "bg-slate-800/60 hover:bg-slate-800"
            )}
          >
            <div className="flex items-start gap-2">
              {!notif.isRead && (
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-color-food shrink-0" />
              )}
              <div className={!notif.isRead ? "" : "pl-3.5"}>
                <p className="text-sm font-medium text-text-primary">{notif.title}</p>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{notif.body}</p>
                <p className="text-xs text-text-muted mt-1">{formatRelative(notif.createdAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### `apps/web/src/components/ui/LanguageSwitcher.tsx`

```typescript
import { useTranslation } from "react-i18next";
import { trpc } from "../../lib/trpc";
import { useAuthStore } from "../../store/authStore";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const updateUser = useAuthStore(s => s.updateUser);
  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: (data) => updateUser({ locale: data.locale as "tr" | "en" }),
  });

  const toggle = () => {
    const next = i18n.language === "tr" ? "en" : "tr";
    i18n.changeLanguage(next);
    localStorage.setItem("listify_lang", next);
    updateProfile.mutate({ locale: next });
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-slate-800 transition-colors border border-border"
    >
      <span>{i18n.language === "tr" ? "🇹🇷 TR" : "🇬🇧 EN"}</span>
      <span className="text-text-muted">→</span>
      <span>{i18n.language === "tr" ? "EN" : "TR"}</span>
    </button>
  );
}
```

---

## 11. Sayfa Implementasyonları

### `pages/Landing.tsx`

```typescript
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";

const FEATURES = [
  { key: "feature1", icon: "📚" },
  { key: "feature2", icon: "🔔" },
  { key: "feature3", icon: "🌍" },
] as const;

const LIST_PREVIEWS = [
  { icon: "🎬", color: "var(--color-film)",   label: "Film" },
  { icon: "📺", color: "var(--color-series)", label: "Dizi" },
  { icon: "📖", color: "var(--color-book)",   label: "Kitap" },
  { icon: "🍽️", color: "var(--color-food)",   label: "Yemek" },
  { icon: "🛒", color: "var(--color-shop)",   label: "Alışveriş" },
];

export function Landing() {
  const { t } = useTranslation();
  const token = useAuthStore(s => s.token);
  const navigate = useNavigate();
  useEffect(() => { if (token) navigate("/dashboard"); }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Spiral dekorasyon */}
      <div className="notebook-spiral" />

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <span className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--color-film)" }}>
          Listify
        </span>
        <div className="flex items-center gap-3">
          <Link to="/giris"><Button variant="ghost" size="sm">{t("auth.login")}</Button></Link>
          <Link to="/kayit"><Button size="sm">{t("landing.cta")}</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-8 py-24 flex flex-col items-center text-center">
        {/* Liste tipi renk noktaları */}
        <div className="flex items-center gap-3 mb-12">
          {LIST_PREVIEWS.map(lp => (
            <div
              key={lp.label}
              className="w-14 h-14 rounded-card flex flex-col items-center justify-center gap-1 border border-border bg-slate-900 hover:-translate-y-1 transition-transform"
            >
              <span className="text-xl">{lp.icon}</span>
              <span className="text-xs" style={{ color: lp.color }}>{lp.label}</span>
            </div>
          ))}
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-text-primary mb-6 leading-tight whitespace-pre-line" style={{ fontFamily: "var(--font-display)" }}>
          {t("landing.hero")}
        </h1>
        <p className="text-lg text-text-secondary mb-10 max-w-xl">{t("landing.heroSub")}</p>

        <div className="flex items-center gap-4">
          <Link to="/kayit"><Button size="lg">{t("landing.cta")}</Button></Link>
          <Link to="/giris"><Button variant="outline" size="lg">{t("landing.ctaLogin")}</Button></Link>
        </div>

        {/* Özellikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full text-left">
          {FEATURES.map(f => (
            <div key={f.key} className="bg-slate-900 border border-border rounded-card p-6">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="text-base font-semibold text-text-primary mt-3 mb-2" style={{ fontFamily: "var(--font-display)" }}>
                {t(`landing.${f.key}Title`)}
              </h3>
              <p className="text-sm text-text-secondary">{t(`landing.${f.key}Desc`)}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
```

### `pages/Auth.tsx`

```typescript
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { trpc } from "../lib/trpc";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function Auth({ mode }: { mode: "login" | "register" }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const locale = (i18n.language === "en" ? "en" : "tr") as "tr" | "en";

  const login = trpc.auth.login.useMutation({
    onSuccess: ({ token, user }) => { setAuth(token, user as any); navigate("/dashboard"); },
    onError: (e) => setError(e.message),
  });
  const register = trpc.auth.register.useMutation({
    onSuccess: ({ token, user }) => { setAuth(token, user as any); navigate("/dashboard"); },
    onError: (e) => setError(e.message),
  });

  const handleSubmit = () => {
    setError("");
    if (mode === "login") login.mutate({ email, password });
    else register.mutate({ email, password, name, locale });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-slate-900 border border-border rounded-card p-8 shadow-card anim-up">
        <div className="notebook-spiral -mx-8 -mt-8 mb-8 rounded-t-card" />
        <div className="text-center mb-8">
          <span className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--color-film)" }}>
            Listify
          </span>
          <p className="text-sm text-text-secondary mt-2">
            {mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle")}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {mode === "register" && (
            <Input label={t("auth.name")} value={name} onChange={e => setName(e.target.value)} placeholder="Ada Lovelace" />
          )}
          <Input label={t("auth.email")} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ada@example.com" />
          <Input label={t("auth.password")} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          {error && <p className="text-sm text-color-food">{error}</p>}
          <Button className="mt-2 w-full" onClick={handleSubmit} loading={login.isPending || register.isPending}>
            {mode === "login" ? t("auth.login") : t("auth.register")}
          </Button>
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
          <Link to={mode === "login" ? "/kayit" : "/giris"} className="text-color-film hover:underline">
            {mode === "login" ? t("auth.register") : t("auth.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### `pages/Dashboard.tsx`

```typescript
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { trpc } from "../lib/trpc";
import { useAuthStore } from "../store/authStore";
import { Skeleton } from "../components/ui/Skeleton";

const QUICK_LINKS = [
  { to: "/filmler",   icon: "🎬", color: "var(--color-film)",   tk: "nav.movies"   },
  { to: "/diziler",   icon: "📺", color: "var(--color-series)", tk: "nav.series"   },
  { to: "/kitaplar",  icon: "📖", color: "var(--color-book)",   tk: "nav.books"    },
  { to: "/yemek",     icon: "🍽️", color: "var(--color-food)",   tk: "nav.food"     },
  { to: "/alisveris", icon: "🛒", color: "var(--color-shop)",   tk: "nav.shopping" },
];

export function Dashboard() {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const stats = trpc.stats.overview.useQuery();
  const recent = trpc.items.list.useQuery({ limit: 12, page: 1 });

  const s = stats.data;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

      {/* Karşılama */}
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          {user?.locale === "en" ? `Hello, ${user.name?.split(" ")[0]} 👋` : `Merhaba, ${user?.name?.split(" ")[0]} 👋`}
        </h1>
        <p className="text-text-secondary mt-1 text-sm">
          {t("app.tagline")}
        </p>
      </div>

      {/* Hızlı Erişim Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {QUICK_LINKS.map(ql => {
          const typeKey = ql.to.replace("/","") as string;
          const pending = s ? (
            typeKey === "filmler" ? s.byType["movie"]?.pending :
            typeKey === "diziler" ? s.byType["series"]?.pending :
            typeKey === "kitaplar" ? s.byType["book"]?.pending :
            typeKey === "yemek" ? (s.byType["food_restaurant"]?.pending ?? 0) + (s.byType["food_recipe"]?.pending ?? 0) :
            typeKey === "alisveris" ? s.byType["shopping"]?.pending : 0
          ) : null;

          return (
            <Link key={ql.to} to={ql.to}
              className="bg-slate-900 border border-border rounded-card p-4 hover:border-border-hover transition-all hover:-translate-y-0.5 group"
            >
              <div className="text-2xl mb-3">{ql.icon}</div>
              <p className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                {t(ql.tk)}
              </p>
              {pending !== null && pending !== undefined && (
                <p className="text-xs mt-1" style={{ color: ql.color }}>
                  {pending} {t("status.pending").toLowerCase()}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {/* Özet İstatistikler */}
      {s && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t("stats.totalItems"),    value: s.total,                              color: "text-text-primary" },
            { label: t("status.completed"),    value: Object.values(s.byType).reduce((acc, v) => acc + (v.completed ?? 0), 0), color: "var(--color-shop)" },
            { label: t("stats.averageRating"), value: s.averageRating ? `${s.averageRating}/5` : "—", color: "var(--color-film)" },
            { label: t("reminder.title"),      value: "→", color: "var(--color-series)", link: "/hatirlatmalar" },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-900 border border-border rounded-card p-4">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">{stat.label}</p>
              {"link" in stat ? (
                <Link to={stat.link!} className="text-2xl font-bold" style={{ color: stat.color, fontFamily: "var(--font-display)" }}>
                  {stat.value}
                </Link>
              ) : (
                <p className="text-2xl font-bold" style={{ color: typeof stat.color === "string" && stat.color.startsWith("var") ? stat.color : undefined, fontFamily: "var(--font-display)" }}>
                  {stat.value}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Son Eklenenler */}
      <section>
        <h2 className="text-base font-semibold text-text-primary mb-4" style={{ fontFamily: "var(--font-display)" }}>
          {user?.locale === "en" ? "Recently Added" : "Son Eklenenler"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {recent.isLoading
            ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-card" />)
            : recent.data?.items.map(item => (
                <div key={item.id} className="bg-slate-900 border border-border rounded-card p-3 text-sm">
                  <div className="text-lg mb-1">
                    {item.type === "movie" ? "🎬" : item.type === "series" ? "📺" : item.type === "book" ? "📖" : item.type === "food_restaurant" ? "🍽️" : item.type === "food_recipe" ? "👨‍🍳" : "🛒"}
                  </div>
                  <p className="text-text-primary font-medium line-clamp-2 text-xs">{item.title}</p>
                </div>
              ))
          }
        </div>
      </section>
    </div>
  );
}
```

### `pages/Movies.tsx` / `pages/Series.tsx` / `pages/Books.tsx`

Her üç sayfa aynı `GenericListPage` component'ından türer:

```typescript
// components/lists/GenericListPage.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "../../lib/trpc";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Skeleton } from "../ui/Skeleton";
import { AddItemPanel } from "../panels/AddItemPanel";
import { DetailPanel } from "../panels/DetailPanel";
import { cn } from "../../lib/utils";
import type { ListType, ItemStatus, ListItem } from "../../types";

interface GenericListPageProps {
  type: ListType;
  icon: string;
  color: string;
}

const STATUS_KEYS: ItemStatus[] = ["pending", "in_progress", "completed", "skipped"];

export function GenericListPage({ type, icon, color }: GenericListPageProps) {
  const { t } = useTranslation();
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<ListItem | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ItemStatus | "all">("all");

  const { data, isLoading, refetch } = trpc.items.list.useQuery({
    type,
    search: search || undefined,
    status: status === "all" ? undefined : status,
    page: 1,
    limit: 48,
  });

  const typeLabel = t(`listType.${type}`);
  const emptyMsg  = t(`empty.${type}`);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Dikey renkli şerit */}
          <span className="w-1 h-8 rounded-full" style={{ background: color }} />
          <div>
            <h1 className="text-2xl font-extrabold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
              {icon} {typeLabel}
            </h1>
            <p className="text-xs text-text-muted">{data?.total ?? 0} {typeLabel.toLowerCase()}</p>
          </div>
        </div>
        <Button onClick={() => setAddOpen(true)} style={{ background: color, color: "#0A0C10" }}>
          + {t("actions.add")}
        </Button>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder={`${typeLabel} ${t("actions.search").toLowerCase()}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-1 bg-slate-900 border border-border rounded-sm p-1">
          <button
            onClick={() => setStatus("all")}
            className={cn("px-3 py-1.5 text-xs rounded-sm transition-colors",
              status === "all" ? "bg-slate-700 text-text-primary" : "text-text-muted hover:text-text-secondary")}
          >
            {t("actions.filter")} ∙ Tümü
          </button>
          {STATUS_KEYS.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn("px-3 py-1.5 text-xs rounded-sm transition-colors",
                status === s ? "bg-slate-700 text-text-primary" : "text-text-muted hover:text-text-secondary")}
            >
              {t(`status.${s}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-card" />)
          : data?.items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                color={color}
                onClick={() => setSelected(item)}
                onComplete={refetch}
              />
            ))
        }
      </div>

      {/* Boş durum */}
      {!isLoading && data?.items.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">{icon}</p>
          <p className="text-text-secondary">{emptyMsg}</p>
          {!search && (
            <Button className="mt-6" onClick={() => setAddOpen(true)} style={{ background: color, color: "#0A0C10" }}>
              {t("actions.add")}
            </Button>
          )}
        </div>
      )}

      <AddItemPanel open={addOpen} onClose={() => setAddOpen(false)} type={type} onSuccess={refetch} />
      <DetailPanel item={selected} onClose={() => setSelected(null)} onUpdate={() => { refetch(); setSelected(null); }} color={color} />
    </div>
  );
}

/* Evrensel kart */
function ItemCard({ item, color, onClick, onComplete }: {
  item: ListItem; color: string; onClick: () => void; onComplete: () => void;
}) {
  const { t } = useTranslation();
  const markComplete = trpc.items.markComplete.useMutation({ onSuccess: onComplete });

  const coverSrc = item.posterUrl ?? item.coverUrl ?? item.meta?.imageUrl as string ?? null;
  const typeEmoji: Record<string, string> = {
    movie:"🎬",series:"📺",book:"📖",food_restaurant:"🍽️",food_recipe:"👨‍🍳",shopping:"🛒"
  };

  const completedLabel: Record<string, string> = {
    movie:            t("actions.markWatched"),
    series:           t("actions.markWatched"),
    book:             t("actions.markRead"),
    food_restaurant:  t("actions.markVisited"),
    food_recipe:      t("actions.markCooked"),
    shopping:         t("actions.markDone"),
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col rounded-card overflow-hidden cursor-pointer bg-slate-900 border border-border hover:border-border-hover transition-all hover:-translate-y-1 hover:shadow-card anim-up"
    >
      {/* Durum şeridi — sol */}
      <span
        className="absolute left-0 top-0 bottom-0 w-0.5"
        style={{ background: item.status === "completed" ? color : "transparent" }}
      />

      <div className="aspect-[2/3] bg-slate-800 flex items-center justify-center overflow-hidden">
        {coverSrc ? (
          <img src={coverSrc} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <span className="text-4xl">{typeEmoji[item.type]}</span>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs font-medium text-text-primary line-clamp-2">{item.title}</p>
        {item.author && <p className="text-xs text-text-muted">{item.author}</p>}
        {item.year && <p className="text-xs text-text-muted">{item.year}</p>}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span
            className="text-xs px-1.5 py-0.5 rounded-sm border"
            style={item.status === "completed"
              ? { color, borderColor: `${color}40`, background: `${color}10` }
              : { color: "var(--color-text-muted)", borderColor: "var(--color-border)" }}
          >
            {t(`status.${item.status}`)}
          </span>
          {item.status !== "completed" && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); markComplete.mutate({ id: item.id }); }}
              className="text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

```typescript
// pages/Movies.tsx
import { GenericListPage } from "../components/lists/GenericListPage";
export function Movies() {
  return <GenericListPage type="movie" icon="🎬" color="var(--color-film)" />;
}

// pages/Series.tsx
import { GenericListPage } from "../components/lists/GenericListPage";
export function Series() {
  return <GenericListPage type="series" icon="📺" color="var(--color-series)" />;
}

// pages/Books.tsx
import { GenericListPage } from "../components/lists/GenericListPage";
export function Books() {
  return <GenericListPage type="book" icon="📖" color="var(--color-book)" />;
}
```

### `pages/Food.tsx`

```typescript
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GenericListPage } from "../components/lists/GenericListPage";
import { Tabs } from "../components/ui/Tabs";

export function Food() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"restaurant" | "recipe">("restaurant");

  return (
    <div>
      <div className="px-6 pt-6">
        <Tabs
          tabs={[
            { id: "restaurant", label: `🍽️ ${t("food.restaurant")}` },
            { id: "recipe",     label: `👨‍🍳 ${t("food.recipe")}` },
          ]}
          active={tab}
          onChange={(id) => setTab(id as "restaurant" | "recipe")}
          color="var(--color-food)"
        />
      </div>
      {tab === "restaurant"
        ? <GenericListPage type="food_restaurant" icon="🍽️" color="var(--color-food)" />
        : <GenericListPage type="food_recipe"     icon="👨‍🍳" color="var(--color-food)" />
      }
    </div>
  );
}
```

### `pages/Shopping.tsx`

```typescript
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Checkbox } from "../components/ui/Checkbox";
import { Skeleton } from "../components/ui/Skeleton";
import { useToastStore } from "../components/ui/Toast";
import { cn } from "../lib/utils";

const CATEGORIES = [
  "produce","meat_fish","dairy","bakery","frozen",
  "beverages","cleaning","personal_care","electronics","clothing","other"
] as const;

export function Shopping() {
  const { t } = useTranslation();
  const { add: toast } = useToastStore();

  // Aktif alışveriş listesi (en son oluşturulan "shopping" tipi öğe)
  const lists = trpc.items.list.useQuery({ type: "shopping", page: 1, limit: 10 });
  const activeList = lists.data?.items[0] ?? null;

  const items = trpc.shopping.getItems.useQuery(
    { listId: activeList?.id ?? "" },
    { enabled: !!activeList }
  );

  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState<typeof CATEGORIES[number]>("other");
  const [barcodeInput, setBarcodeInput] = useState("");

  const createList = trpc.shopping.createList.useMutation({
    onSuccess: () => lists.refetch(),
  });

  const addItem = trpc.shopping.addItem.useMutation({
    onSuccess: () => { items.refetch(); setName(""); setQty("1"); setUnit(""); toast("success", t("toast.added")); },
    onError: (e) => toast("error", e.message),
  });

  const toggleItem = trpc.shopping.toggleItem.useMutation({
    onSuccess: () => items.refetch(),
  });

  const clearChecked = trpc.shopping.clearChecked.useMutation({
    onSuccess: () => { items.refetch(); toast("info", t("toast.deleted")); },
  });

  const barcodeSearch = trpc.shopping.barcodeSearch.useQuery(
    { barcode: barcodeInput },
    { enabled: barcodeInput.length >= 8 }
  );

  // Kategoriye göre grupla
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catItems = items.data?.filter(i => i.category === cat) ?? [];
    if (catItems.length) acc[cat] = catItems;
    return acc;
  }, {} as Record<string, typeof items.data>);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-1 h-8 rounded-full" style={{ background: "var(--color-shop)" }} />
          <h1 className="text-2xl font-extrabold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            🛒 {t("nav.shopping")}
          </h1>
        </div>
        <div className="flex gap-2">
          {activeList && (
            <Button variant="ghost" size="sm" onClick={() => clearChecked.mutate({ listId: activeList.id })}>
              {t("shopping.clearChecked")}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => createList.mutate({ title: t("shopping.newList") })}
            style={{ background: "var(--color-shop)", color: "#0A0C10" }}
          >
            + {t("shopping.newList")}
          </Button>
        </div>
      </div>

      {!activeList ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-text-secondary">{t("empty.shopping")}</p>
          <Button
            className="mt-6"
            onClick={() => createList.mutate({ title: t("shopping.newList") })}
            style={{ background: "var(--color-shop)", color: "#0A0C10" }}
          >
            {t("shopping.newList")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sol: Ürün Ekleme */}
          <div className="bg-slate-900 border border-border rounded-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">{t("shopping.addItem")}</h3>

            {/* Barkod arama */}
            <Input
              placeholder={`${t("shopping.barcode")} (EAN/UPC)`}
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
            />
            {barcodeSearch.data && (
              <div
                className="flex items-center gap-2 p-2 bg-slate-800 rounded-sm cursor-pointer border border-border-hover"
                onClick={() => { setName(barcodeSearch.data!.name); setBarcodeInput(""); }}
              >
                <span className="text-xs text-text-secondary">{barcodeSearch.data.name}</span>
                <span className="text-xs text-text-muted ml-auto">← {t("actions.add")}</span>
              </div>
            )}

            <Input
              placeholder={t("shopping.addItem")}
              value={name}
              onChange={e => setName(e.target.value)}
              label={t("shopping.addItem")}
            />
            <div className="flex gap-2">
              <Input
                placeholder={t("shopping.quantity")}
                value={qty}
                onChange={e => setQty(e.target.value)}
                className="w-20"
              />
              <Input
                placeholder={t("shopping.unit")}
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-24"
              />
            </div>
            <Select
              label={t("shopping.category")}
              value={category}
              onChange={v => setCategory(v as typeof CATEGORIES[number])}
              options={CATEGORIES.map(c => ({ value: c, label: t(`shopping.category.${c}`) }))}
            />
            <Button
              className="w-full"
              onClick={() => {
                if (!name.trim()) return;
                addItem.mutate({ listId: activeList.id, name: name.trim(), quantity: qty, unit: unit || undefined, category });
              }}
              loading={addItem.isPending}
              style={{ background: "var(--color-shop)", color: "#0A0C10" }}
            >
              {t("actions.add")}
            </Button>
          </div>

          {/* Sağ: Liste */}
          <div className="md:col-span-2 space-y-4">
            {items.isLoading && <Skeleton className="h-40 rounded-card" />}
            {Object.entries(grouped).map(([cat, catItems]) => (
              <div key={cat} className="bg-slate-900 border border-border rounded-card overflow-hidden">
                <div className="px-4 py-2 border-b border-border bg-slate-800">
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    {t(`shopping.category.${cat}`)}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {catItems?.map(item => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 transition-opacity",
                        item.checked ? "opacity-50" : ""
                      )}
                    >
                      <Checkbox
                        checked={item.checked}
                        onChange={v => toggleItem.mutate({ id: item.id, checked: v })}
                        color="var(--color-shop)"
                      />
                      <span className={cn("text-sm flex-1", item.checked ? "line-through text-text-muted" : "text-text-primary")}>
                        {item.name}
                      </span>
                      <span className="text-xs text-text-muted">
                        {item.quantity}{item.unit ? ` ${item.unit}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {items.data?.length === 0 && (
              <p className="text-sm text-text-muted text-center py-8">{t("empty.shopping")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### `pages/Reminders.tsx`

```typescript
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { DateTimePicker } from "../components/ui/DateTimePicker";
import { Checkbox } from "../components/ui/Checkbox";
import { useToastStore } from "../components/ui/Toast";
import { cn } from "../lib/utils";
import { formatDate } from "../lib/utils";

const TYPES    = ["manual","weekly_digest","smart_idle"] as const;
const CHANNELS = ["both","in_app","email"] as const;

export function Reminders() {
  const { t } = useTranslation();
  const { add: toast } = useToastStore();
  const [addOpen, setAddOpen] = useState(false);
  const [type, setType] = useState<typeof TYPES[number]>("manual");
  const [channel, setChannel] = useState<typeof CHANNELS[number]>("both");
  const [scheduledAt, setScheduledAt] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [intervalDays, setIntervalDays] = useState(7);
  const [title, setTitle] = useState("");

  const { data: reminders, refetch } = trpc.reminders.list.useQuery({});

  const create = trpc.reminders.create.useMutation({
    onSuccess: () => {
      toast("success", t("toast.reminderSet"));
      refetch();
      setAddOpen(false);
      setTitle(""); setScheduledAt(""); setRecurring(false);
    },
    onError: (e) => toast("error", e.message),
  });

  const update = trpc.reminders.update.useMutation({ onSuccess: refetch });
  const del    = trpc.reminders.delete.useMutation({
    onSuccess: () => { toast("info", t("toast.deleted")); refetch(); },
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-1 h-8 rounded-full" style={{ background: "var(--color-series)" }} />
          <h1 className="text-2xl font-extrabold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            🔔 {t("reminder.title")}
          </h1>
        </div>
        <Button onClick={() => setAddOpen(true)} style={{ background: "var(--color-series)", color: "#fff" }}>
          + {t("reminder.create")}
        </Button>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {reminders?.length === 0 && (
          <p className="text-text-muted text-sm text-center py-12">{t("reminder.noReminders")}</p>
        )}
        {reminders?.map(r => (
          <div key={r.id} className={cn(
            "bg-slate-900 border rounded-card px-5 py-4 flex items-start gap-4",
            r.isActive ? "border-border" : "border-border opacity-60"
          )}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-text-primary">{r.title ?? t(`reminder.type.${r.type}`)}</p>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-sm border",
                  r.isActive
                    ? "text-color-series border-color-series/30 bg-color-series/10"
                    : "text-text-muted border-border"
                )}>
                  {r.isActive ? t("reminder.active") : t("reminder.inactive")}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                {t(`reminder.type.${r.type}`)} · {t(`reminder.channel.${r.channel}`)}
              </p>
              {r.scheduledAt && (
                <p className="text-xs text-text-muted">{formatDate(r.scheduledAt.toString())}</p>
              )}
              {r.isRecurring && r.intervalDays && (
                <p className="text-xs text-text-muted">
                  {t("reminder.intervalDays")}: {r.intervalDays}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => update.mutate({ id: r.id, isActive: !r.isActive })}
                className="text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                {r.isActive ? "⏸" : "▶"}
              </button>
              <button
                onClick={() => { if (confirm("Silinsin mi?")) del.mutate({ id: r.id }); }}
                className="text-xs text-text-muted hover:text-color-food transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t("reminder.create")} size="md">
        <div className="space-y-4">
          <Select
            label={t("reminder.type")}
            value={type}
            onChange={v => setType(v as typeof TYPES[number])}
            options={TYPES.map(tp => ({ value: tp, label: t(`reminder.type.${tp}`) }))}
          />
          <Select
            label={t("reminder.channel")}
            value={channel}
            onChange={v => setChannel(v as typeof CHANNELS[number])}
            options={CHANNELS.map(c => ({ value: c, label: t(`reminder.channel.${c}`) }))}
          />
          {type === "manual" && (
            <DateTimePicker
              label={t("reminder.scheduledAt")}
              value={scheduledAt}
              onChange={setScheduledAt}
            />
          )}
          <div>
            <input
              className="w-full bg-slate-800 border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-color-series/40 transition-colors"
              placeholder={`${t("reminder.title")} (opsiyonel)`}
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <Checkbox
            checked={recurring}
            onChange={setRecurring}
            label={t("reminder.recurring")}
            color="var(--color-series)"
          />
          {recurring && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">{t("reminder.intervalDays")}</span>
              <input
                type="number"
                min={1}
                max={365}
                value={intervalDays}
                onChange={e => setIntervalDays(parseInt(e.target.value) || 7)}
                className="w-20 bg-slate-800 border border-border rounded-sm px-2 py-1.5 text-sm text-text-primary focus:outline-none"
              />
            </div>
          )}
          <Button
            className="w-full"
            onClick={() => create.mutate({
              type, channel,
              scheduledAt: type === "manual" ? scheduledAt : undefined,
              isRecurring: recurring,
              intervalDays: recurring ? intervalDays : undefined,
              title: title || undefined,
            })}
            loading={create.isPending}
            style={{ background: "var(--color-series)", color: "#fff" }}
          >
            {t("actions.save")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
```

### `pages/Settings.tsx`

```typescript
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "../lib/trpc";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Checkbox } from "../components/ui/Checkbox";
import { useToastStore } from "../components/ui/Toast";

export function Settings() {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);
  const { add: toast } = useToastStore();

  const [name, setName] = useState(user?.name ?? "");
  const [weeklyDigest, setWeeklyDigest] = useState(user?.weeklyDigest ?? true);
  const [smartIdleDays, setSmartIdleDays] = useState(user?.smartIdleDays ?? 7);
  const [notifChannel, setNotifChannel] = useState(user?.notifChannel ?? "both");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: (data) => {
      updateUser(data as any);
      toast("success", t("settings.saved"));
    },
    onError: (e) => toast("error", e.message),
  });

  const changePw = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      toast("success", t("settings.saved"));
      setCurrentPw(""); setNewPw("");
    },
    onError: (e) => toast("error", e.message),
  });

  const requestDeletion = trpc.user.requestDeletion.useMutation({
    onSuccess: () => toast("info", "Hesabınız 30 gün içinde silinecek."),
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <span className="w-1 h-8 rounded-full bg-text-muted" />
        <h1 className="text-2xl font-extrabold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          ⚙ {t("settings.title")}
        </h1>
      </div>

      {/* Profil */}
      <section className="bg-slate-900 border border-border rounded-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{t("settings.profile")}</h2>
        <Input label={t("auth.name")} value={name} onChange={e => setName(e.target.value)} />
        <Button
          onClick={() => updateProfile.mutate({ name })}
          loading={updateProfile.isPending}
          style={{ background: "var(--color-film)", color: "#0A0C10" }}
        >
          {t("actions.save")}
        </Button>
      </section>

      {/* Bildirimler */}
      <section className="bg-slate-900 border border-border rounded-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{t("settings.notifications")}</h2>

        <Select
          label={t("settings.notifChannel")}
          value={notifChannel}
          onChange={v => setNotifChannel(v as any)}
          options={[
            { value: "both",   label: t("reminder.channel.both")   },
            { value: "in_app", label: t("reminder.channel.in_app") },
            { value: "email",  label: t("reminder.channel.email")  },
          ]}
        />

        <Checkbox
          checked={weeklyDigest}
          onChange={setWeeklyDigest}
          label={t("settings.weeklyDigest")}
          color="var(--color-film)"
        />

        <div>
          <label className="text-xs text-text-secondary block mb-1.5">{t("settings.smartIdleDays")}</label>
          <p className="text-xs text-text-muted mb-2">{t("settings.smartIdleDesc")}</p>
          <input
            type="number"
            min={0}
            max={30}
            value={smartIdleDays}
            onChange={e => setSmartIdleDays(parseInt(e.target.value) || 0)}
            className="w-24 bg-slate-800 border border-border rounded-sm px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-color-film/40"
          />
        </div>

        <Button
          onClick={() => updateProfile.mutate({ notifChannel: notifChannel as any, weeklyDigest, smartIdleDays })}
          loading={updateProfile.isPending}
          style={{ background: "var(--color-film)", color: "#0A0C10" }}
        >
          {t("actions.save")}
        </Button>
      </section>

      {/* Şifre */}
      <section className="bg-slate-900 border border-border rounded-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{t("auth.password")}</h2>
        <Input label="Mevcut şifre" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
        <Input label="Yeni şifre" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
        <Button
          onClick={() => changePw.mutate({ currentPassword: currentPw, newPassword: newPw })}
          loading={changePw.isPending}
          variant="outline"
        >
          {t("actions.save")}
        </Button>
      </section>

      {/* Hesap Silme (KVKK) */}
      <section className="bg-slate-900 border border-color-food/20 rounded-card p-6 space-y-3">
        <h2 className="text-sm font-semibold text-color-food uppercase tracking-wider">{t("settings.deleteAccount")}</h2>
        <p className="text-xs text-text-muted">{t("settings.deleteAccountDesc")}</p>
        <Button
          variant="danger"
          onClick={() => { if (confirm("Hesabınızı silmek istediğinize emin misiniz?")) requestDeletion.mutate(); }}
          loading={requestDeletion.isPending}
        >
          {t("settings.deleteAccount")}
        </Button>
      </section>
    </div>
  );
}
```

---

## 12. Yardımcı Bileşenler

### `components/ui/Input.tsx`

```typescript
import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; }

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs text-text-secondary">{label}</label>}
      <input
        ref={ref}
        className={cn(
          "bg-slate-800 border border-border rounded-sm px-3 py-2 text-sm text-text-primary",
          "placeholder:text-text-muted focus:outline-none focus:border-color-film/40 transition-colors w-full",
          className
        )}
        {...props}
      />
    </div>
  )
);
```

### `components/ui/Select.tsx`

```typescript
interface SelectProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

export function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs text-text-secondary">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-slate-800 border border-border rounded-sm px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-color-film/40 transition-colors cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
```

### `components/ui/Checkbox.tsx`

```typescript
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
```

### `components/ui/DateTimePicker.tsx`

```typescript
interface DateTimePickerProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
}

export function DateTimePicker({ label, value, onChange }: DateTimePickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs text-text-secondary">{label}</label>}
      <input
        type="datetime-local"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={new Date().toISOString().slice(0, 16)}
        className="bg-slate-800 border border-border rounded-sm px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-color-series/40 transition-colors [color-scheme:dark]"
      />
    </div>
  );
}
```

### `components/ui/Tabs.tsx`

```typescript
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
          className="px-4 py-2 text-sm rounded-sm transition-colors"
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
```

### `components/ui/Skeleton.tsx`

```typescript
import { cn } from "../../lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-slate-800 animate-pulse rounded-card", className)} />
  );
}
```

### `components/ui/Toast.tsx`

```typescript
import { create } from "zustand";
import { cn } from "../../lib/utils";

type ToastType = "success" | "error" | "info";

interface ToastItem { id: string; type: ToastType; message: string; }

interface ToastStore {
  toasts: ToastItem[];
  add: (type: ToastType, message: string) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (type, message) => {
    const id = crypto.randomUUID();
    set(s => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000);
  },
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

const typeStyle: Record<ToastType, string> = {
  success: "border-color-shop/40  bg-color-shop/10  text-color-shop",
  error:   "border-color-food/40  bg-color-food/10  text-color-food",
  info:    "border-color-book/40  bg-color-book/10  text-color-book",
};

export function Toast() {
  const { toasts } = useToastStore();
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={cn(
          "anim-up px-4 py-3 rounded-card border text-sm font-medium shadow-card pointer-events-auto",
          "backdrop-blur-sm min-w-[240px] max-w-xs",
          typeStyle[t.type]
        )}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
```

### `apps/web/src/lib/utils.ts`

```typescript
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
```

### `apps/web/src/types/index.ts`

```typescript
export type ListType =
  | "movie" | "series" | "book"
  | "food_restaurant" | "food_recipe" | "shopping";

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
```

---

## 13. Konfigürasyon & Build

### `apps/web/vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { target: "es2022", outDir: "dist" },
});
```

### `apps/web/package.json`

```json
{
  "name": "@listify/web",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.26.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.51.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "react-i18next": "^15.0.0",
    "i18next": "^23.0.0",
    "i18next-browser-languagedetector": "^8.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}
```

### `apps/worker/package.json`

```json
{
  "name": "@listify/worker",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "dependencies": {
    "hono": "^4.5.0",
    "@hono/trpc-server": "^0.3.0",
    "@trpc/server": "^11.0.0",
    "drizzle-orm": "^0.33.0",
    "@neondatabase/serverless": "^0.9.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.24.0",
    "wrangler": "^3.70.0",
    "typescript": "^5.5.0"
  }
}
```

### `package.json` (kök)

```json
{
  "name": "listify",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev":   "turbo run dev",
    "build": "turbo run build",
    "deploy":"turbo run deploy"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.5.0"
  }
}
```

---

## 14. Environment Variables

| Değişken | Yer | Açıklama |
|----------|-----|----------|
| `DATABASE_URL` | Worker secret | Neon PostgreSQL bağlantı string |
| `JWT_SECRET` | Worker secret | 64 karakter random string |
| `RESEND_API_KEY` | Worker secret | `re_...` |
| `TMDB_API_KEY` | Worker secret | TMDB v3 |
| `COOKIE_SECRET` | Worker secret | 32 karakter random |
| `APP_URL` | wrangler.toml var | `https://listify.pages.dev` |
| `RATE_LIMIT_KV` | KV binding | Rate limit için |
| `SESSION_KV` | KV binding | Session cache için |
| `REMINDER_SCHEDULER` | DO binding | Per-user alarm DO |
| `VITE_API_URL` | Pages env | `https://listify-api.workers.dev` |

---

## 15. Deploy Sırası

```bash
# 1. KV Namespace oluştur
wrangler kv:namespace create RATE_LIMIT_KV
wrangler kv:namespace create SESSION_KV
# ID'leri wrangler.toml'a yaz

# 2. Secret'ları set et
wrangler secret put DATABASE_URL
wrangler secret put JWT_SECRET
wrangler secret put RESEND_API_KEY
wrangler secret put TMDB_API_KEY
wrangler secret put COOKIE_SECRET

# 3. DB Migration (Neon dashboard veya psql)
psql $DATABASE_URL -f apps/worker/src/db/migrations/0001_init.sql

# 4. Worker deploy
cd apps/worker && wrangler deploy

# 5. Pages deploy (GitHub bağlantısı veya)
cd apps/web && npm run build
# Build output: apps/web/dist
# Root dir: /
# Build command: cd apps/web && npm run build
# Pages env: VITE_API_URL=https://listify-api.workers.dev

# 6. Resend domain doğrulama
# resend.com → Domains → "listify.app" veya subdomain ekle
# DNS TXT kaydını ekle
# "bildirim@listify.app" from adresi çalışmaya başlar
```

---

## 16. Kalite Kontrol Listesi

Ajan tamamlamadan önce her maddeyi doğrula:

- [ ] PBKDF2 Web Crypto API ile hashlenmiş şifreler (bcrypt yok)
- [ ] JWT imzalama/doğrulama Web Crypto HMAC-SHA256 (jsonwebtoken yok)
- [ ] Tüm DB sorguları Drizzle ORM (raw SQL yok)
- [ ] TMDB & OpenLibrary API çağrısı Worker'da (API key frontend'e sızmıyor)
- [ ] Open Food Facts barkod araması Worker'da
- [ ] `protectedProcedure` tüm veri endpoint'lerini kapsıyor
- [ ] Her listItems sorgusunda `userId` filtresi mevcut (veri izolasyonu)
- [ ] `ReminderScheduler` DO `alarm()` handler'ı hem mail hem in-app gönderiyor
- [ ] Haftalık digest cron `wrangler.toml`'da tanımlı ve `fireWeeklyDigests` çağırıyor
- [ ] KVKK purge cron `wrangler.toml`'da tanımlı
- [ ] i18n: TR ve EN json dosyaları eksiksiz, tüm anahtarlar karşılıklı eşleşiyor
- [ ] `LanguageSwitcher` hem localStorage'ı hem DB'yi güncelliyor
- [ ] `NotificationBell` 30sn polling ile unread count güncel tutuyor
- [ ] `Shopping` sayfası liste yoksa "Yeni Liste" ile başlıyor, sonra ürün eklemeye geçiyor
- [ ] `Food` sayfası iki sekme: food_restaurant ve food_recipe
- [ ] `GenericListPage` tüm liste tipleri için çalışıyor (movie/series/book/food_*/shopping)
- [ ] Tailwind v4 CSS-first: `@theme {}` sadece `index.css`'te, JS config yok
- [ ] `wrangler.toml`'da DO migration tag mevcut
- [ ] Resend `from` domain production'da doğrulanmış olmalı
- [ ] Tüm toast mesajları i18n anahtarı kullanıyor
- [ ] Empty state her liste sayfasında eksiksiz

---

