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
