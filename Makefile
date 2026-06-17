.PHONY: install dev dev-web dev-worker build build-web build-worker deploy deploy-web deploy-worker migrate clean

# Varsayılan hedef
all: install build

# Bağımlılıkların kurulması
install:
	npm install

# Geliştirme (Tüm projeyi aynı anda çalıştırır)
dev:
	npm run dev

# Sadece Web arayüzünü geliştirme modunda çalıştırır
dev-web:
	npm run dev --filter @listify/web

# Sadece Worker (Backend) geliştirme modunda çalıştırır
dev-worker:
	npm run dev --filter @listify/worker

# Tüm projenin derlenmesi (TypeScript + Vite)
build:
	npm run build

# Sadece Web projesinin derlenmesi
build-web:
	npm run build --filter @listify/web

# Sadece Worker projesinin derlenmesi
build-worker:
	npm run build --filter @listify/worker

# Tüm projenin Cloudflare'e deploy edilmesi
deploy: deploy-worker deploy-web

# Sadece Web projesinin Cloudflare Pages'e deploy edilmesi
deploy-web: build-web
	cd apps/web && npx wrangler pages deploy dist --project-name listify

# Sadece Worker projesinin Cloudflare Workers'a deploy edilmesi
deploy-worker: build-worker
	cd apps/worker && npx wrangler deploy

# Veritabanı şemasını (tabloları) veritabanına uygular (Drizzle Push)
migrate:
	cd apps/worker && npm run migrate

# Derleme dosyalarının temizlenmesi
clean:
	find . -name "dist" -type d -prune -exec rm -rf '{}' +
	find . -name ".turbo" -type d -prune -exec rm -rf '{}' +
