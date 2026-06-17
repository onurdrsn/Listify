# Listify — Kişisel Takip & Hatırlatma Platformu

Listify, tüm takip etmek istediğiniz içerikleri (filmler, diziler, kitaplar, yemek tarifleri/restoranlar ve alışveriş) tek bir yerde yönetmenizi sağlayan modern ve premium bir web uygulamasıdır.

## 🌟 Özellikler

- **5 Farklı Liste Tipi:** Film, Dizi, Kitap, Yemek ve Alışveriş.
- **Akıllı Hatırlatmalar:** Size esprili ve motive edici hatırlatmalar (in-app ve e-posta).
- **Haftalık Özetler:** Her Pazartesi tamamlanan ve bekleyen listenizin özeti.
- **Dış API Entegrasyonları:** TMDB (Film/Dizi), OpenLibrary (Kitap) aramaları otomatik kapak ve meta veri çekme.

## 🚀 Teknolojiler

- **Frontend:** React 19, Tailwind CSS v4, Zustand, Vite, TanStack Query
- **Backend:** Cloudflare Workers, Hono, tRPC
- **Veritabanı:** Neon (Serverless Postgres), Drizzle ORM
- **Diğer:** Resend (E-posta), Cloudflare Durable Objects (Zamanlanmış Hatırlatmalar)

## 🛠️ Kurulum ve Çalıştırma

Projenin kurulumunu gerçekleştirmek için aşağıdaki komutları kullanabilirsiniz:

### 1. Bağımlılıkların Yüklenmesi
```bash
make install
# Veya manuel olarak: npm install
```

### 2. Çevresel Değişkenler (.env)
Aşağıdaki çevresel değişkenleri `apps/worker/.dev.vars` (geliştirme için) ve `apps/web/.env.local` dosyalarına eklemeniz gerekmektedir:

**apps/worker/.dev.vars:**
```env
DATABASE_URL="postgres://user:password@host/dbname"
JWT_SECRET="super-secret-key-123"
COOKIE_SECRET="cookie-secret-key"
RESEND_API_KEY="re_123456789"
TMDB_API_KEY="Sizin_TMDB_API_Keyiniz_Buraya" # (v3 API Key kullanılmalıdır!)
APP_URL="http://localhost:5173"
```

**apps/web/.env.local:**
```env
VITE_API_URL="http://localhost:8787"
```

### 3. Geliştirme Modu (Development)
Tüm projeyi (Frontend ve Backend aynı anda) çalıştırmak için:
```bash
make dev
# Veya: npm run dev
```

### 4. Build ve Deploy
Ayrıntılı Makefile komutları mevcuttur:

- Tüm projeyi derlemek: `make build`
- Sadece web derlemek: `make build-web`
- Sadece worker derlemek: `make build-worker`

- Tüm projeyi deploy etmek: `make deploy` (Önce worker, sonra web)
- Sadece web deploy etmek: `make deploy-web`
- Sadece worker deploy etmek: `make deploy-worker`

## ❓ Sıkça Sorulan Sorular

**TMDB API Anahtarı olarak hangisini kullanmalıyım?**
TMDB API için **API Key (v3 auth)** kullanmalısınız (örneğin 32 karakterlik uzunluğunda string). API Read Access Token (v4) sistemimiz tarafından doğrudan kullanılmamaktadır. `TMDB_API_KEY` değerine v3 anahtarınızı yazabilirsiniz.

## 📄 Lisans
Bu proje MIT lisansı ile lisanslanmıştır.
