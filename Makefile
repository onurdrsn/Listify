.PHONY: install build deploy dev clean \
        build-web build-worker build-shared \
        dev-web dev-worker \
        deploy-web deploy-worker

# ==========================================
# 1. Genel / Monorepo Komutları
# ==========================================

# Tüm monorepo için bağımlılıkları yükler (npm workspaces tüm alt paketleri otomatik bağlar)
install:
	npm install

# Tüm projeleri derler
build:
	npx turbo run build

# Tüm servisleri canlıya alır
deploy:
	npx turbo run deploy

# Yerel geliştirme ortamını başlatır (Frontend ve Backend'i aynı anda çalıştırır)
dev:
	npx turbo run dev

# Geçici derleme dosyalarını temizler
clean:
	find . -name "*.js" -not -path "*/node_modules/*" -not -path "*/.turbo/*" -not -path "*/dist/*" -delete

# ==========================================
# 2. Web (Frontend) Komutları
# ==========================================

# Sadece Frontend uygulamasını derler (Vite + TS Kontrolü)
build-web:
	npx turbo run build --filter=@listify/web

# Sadece Frontend uygulamasını yerel modda çalıştırır
dev-web:
	npx turbo run dev --filter=@listify/web

# Sadece Frontend uygulamasını Cloudflare Pages'e yükler
deploy-web:
	npx turbo run deploy --filter=@listify/web

# ==========================================
# 3. Worker (Backend) Komutları
# ==========================================

# Worker backend projesinin tip doğruluğunu kontrol eder (Derleme adımı wrangler içinde gömülüdür)
build-worker:
	npx tsc --noEmit -p apps/worker/tsconfig.json

# Sadece Worker backend projesini yerel Wrangler dev modunda çalıştırır
dev-worker:
	npx turbo run dev --filter=@listify/worker

# Sadece Worker backend projesini Cloudflare Workers'a yükler
deploy-worker:
	npx turbo run deploy --filter=@listify/worker

# ==========================================
# 4. Shared (Ortak Kütüphane) Komutları
# ==========================================

# Ortak kütüphanenin tip kontrolünü yapar
build-shared:
	npx tsc --noEmit -p packages/shared/tsconfig.json
