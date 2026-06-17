# Listify — Kişisel Takip & Hatırlatma Platformu

Listify; film, dizi, kitap, yemek ve alışveriş listelerinizi tek bir çatı altında tutmanızı sağlayan ve sizi esprili/iğneleyici bildirimlerle sürekli tetikte tutan modern bir kişisel takip platformudur.

Bu proje, yüksek performanslı ve sunucusuz (serverless) Cloudflare ekosisteminde çalışmak üzere tasarlanmış **monorepo** yapısına sahiptir.

---

## 🚀 Proje Yapısı (Monorepo)

Proje, hızlı ve izole edilmiş geliştirme süreçleri için `turbo` ve npm workspaces kullanır:

*   **`packages/shared`**: Backend ve Frontend arasında ortak kullanılan veri tipleri ve Zod doğrulama (validation) şemaları.
*   **`apps/worker`**: Cloudflare Workers üzerinde çalışan Hono tabanlı API backend'i. tRPC sunucusu, Neon PostgreSQL (Drizzle ORM) entegrasyonu, Durable Objects tabanlı hatırlatıcı zamanlayıcısı ve Resend e-posta servisi bu katmandadır.
*   **`apps/web`**: React 19, Vite, Tailwind CSS v4 ve tRPC istemcisi kullanılarak geliştirilmiş, çoklu dil destekli (TR/EN) ve son derece akıcı arayüze sahip web uygulaması.

---

## 🛠️ Kullanılan Teknolojiler

### Backend (`apps/worker`)
*   **Çalışma Ortamı:** Cloudflare Workers & Durable Objects
*   **Web Framework:** [Hono](https://hono.dev/)
*   **API Katmanı:** [tRPC](https://trpc.io/) (Tip güvenli istemci-sunucu iletişimi)
*   **Veritabanı & ORM:** Neon Serverless PostgreSQL & [Drizzle ORM](https://orm.drizzle.team/)
*   **E-posta Servisi:** [Resend](https://resend.com/)
*   **Güvenlik:** Web Crypto API (PBKDF2 şifreleme ve JWT yetkilendirme)

### Frontend (`apps/web`)
*   **Çatı:** React 19 & Vite
*   **Stil:** Tailwind CSS v4 (Özel renk paletleri, pürüzsüz geçişler ve esnek yerleşimler)
*   **Durum Yönetimi:** Zustand (Auth, UI ve Bildirim yönetimi)
*   **Yerelleştirme:** i18next (Tam Türkçe ve İngilizce dil desteği)
*   **Servis Entegrasyonları:**
    *   **TMDB API:** Popüler film ve dizileri arama ve ekleme.
    *   **OpenLibrary API:** Kitapları başlık veya yazara göre arama.
    *   **Barkod Arama:** Alışveriş listelerinde hızlı ürün ekleme.

---

## ✨ Temel Özellikler

1.  **5 Farklı Takip Listesi:**
    *   🎬 **Filmler:** İzleme durumu, kişisel puanlama ve TMDB entegrasyonu.
    *   📺 **Diziler:** Sezon/bölüm takibi ve TMDB entegrasyonu.
    *   📚 **Kitaplar:** Okunan sayfa takibi ve OpenLibrary entegrasyonu.
    *   🍔 **Yemekler:** Mutfak türleri, restoran ve sipariş/pişirme tercihleri.
    *   🛒 **Alışveriş:** Adet, birim, barkod (EAN/UPC) ve sepet durumu takibi.
2.  **Esprili & İğneleyici Hatırlatıcılar (Witty Reminders):**
    *   Eğer bir kitabı uzun süre okumadıysanız ya da izlemek istediğiniz filmi ertelediyseniz, sistem size esprili ve tatlı-sert iğneleyici bildirimler atar.
    *   **Haftalık Özet E-postası (Weekly Digest):** Tamamlanmamış görevlerinizi hatırlatan e-postalar.
    *   **Zamanlanmış Hatırlatıcılar:** Durable Objects ile tetiklenen hassas alarmlar.
3.  **Performans odaklı Arayüz:** Modern Glassmorphism efektleri, şık karanlık tema ve micro-animasyonlar.

---

## 📦 Kurulum ve Çalıştırma

Projede komutları basitleştirmek ve hem monorepo genelinde hem de alt paketler (Web / Worker) özelinde kolay yönetim sağlamak adına gelişmiş bir `Makefile` bulunmaktadır.

### 1. Bağımlılıkları Yükleme
Tüm monorepo genelinde (tüm alt paketlerin bağımlılıkları dahil) kurulum yapar:
```bash
make install
```

### 2. Yerel Geliştirme (Development)
*   **Tüm Sistemi Çalıştır (Web + Worker):**
    ```bash
    make dev
    ```
*   **Sadece Web Arayüzünü Çalıştır:**
    ```bash
    make dev-web
    ```
*   **Sadece Worker Backend'ini Çalıştır:**
    ```bash
    make dev-worker
    ```

### 3. Projeyi Derleme (Build & Typecheck)
*   **Tüm Sistemi Derle:**
    ```bash
    make build
    ```
*   **Sadece Web (Frontend) Uygulamasını Derle:**
    ```bash
    make build-web
    ```
*   **Sadece Worker (Backend) Tip Kontrolü Yap:**
    ```bash
    make build-worker
    ```
*   **Ortak Kütüphane (Shared) Tip Kontrolü Yap:**
    ```bash
    make build-shared
    ```

### 4. Canlı Ortama Dağıtım (Deployment)
*   **Tüm Sistemi Dağıt (Web + Worker):**
    ```bash
    make deploy
    ```
*   **Sadece Web Arayüzünü Dağıt (Cloudflare Pages):**
    ```bash
    make deploy-web
    ```
*   **Sadece Worker Backend'ini Dağıt (Cloudflare Workers):**
    ```bash
    make deploy-worker
    ```

### 5. Temizlik
Derleme sırasında yanlışlıkla oluşabilecek geçici `.js` uzantılı artık dosyaları temizler:
```bash
make clean
```

---

## ⚙️ Yapılandırma ve Ortam Değişkenleri

### Backend (`apps/worker/wrangler.toml`)
Backend çalışması için aşağıdaki ortam değişkenlerine (vars veya secrets) ihtiyaç duyar:

```toml
[vars]
DATABASE_URL = "postgres://username:password@host/database"
JWT_SECRET = "super-secret-jwt-key"
RESEND_API_KEY = "re_your_resend_api_key"
TMDB_API_KEY = "your_tmdb_api_key"
FRONTEND_URL = "http://localhost:5173" # veya canlı adresiniz
```

### Frontend (`apps/web/.env`)
Vite istemcisinin backend API'sine bağlanabilmesi için:

```env
VITE_API_URL=http://localhost:8787
```
