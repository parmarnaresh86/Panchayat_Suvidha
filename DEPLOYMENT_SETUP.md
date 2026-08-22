# GitHub + Render Setup Reference

Everything we configured today for this project. Copy the relevant pieces into your
main project to replicate the same GitHub + Render setup there.

## 1. GitHub

- Repo: https://github.com/parmarnaresh86/Panchayat_Suvidha
- Account: parmarnaresh86
- Visibility: Public
- Default branch: master

### .gitignore used at project root

```
# Dependencies
node_modules/
vendor/

# Environment files
.env
.env.local
.env.production
.env.*.local

# Databases
*.sqlite
*.sqlite3

# Laravel
/panchayat-laravel/storage/*.key
/panchayat-laravel/bootstrap/cache/*.php
/laravel-backend/storage/*.key
/laravel-backend/bootstrap/cache/*.php

# Build output
dist/
build/
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/*
!.vscode/extensions.json
```

### Commands to init a new repo the same way

```bash
cd /path/to/main-project
git init
git add -A
git commit -m "Initial commit"
gh repo create <REPO_NAME> --public --source=. --remote=origin --push
```

## 2. Render account

- Owner/team ID: `tea-da0qmnflk1mc738ijhn0`
- API key: get a fresh one from https://dashboard.render.com/u/settings#api-keys
  (never store the key itself in a repo file — pass it only via the `Authorization: Bearer`
  header when calling the Render API, or paste it directly to me when needed)

## 3. Backend service (Laravel + SQLite, deployed via Docker)

- Service name: `panchayat-suvidha-backend`
- Type: `web_service`, env: `docker`
- Root dir in repo: `panchayat-laravel`
- URL: https://panchayat-suvidha-backend.onrender.com
- Service ID: `srv-da4ot9bbc2fs73bslkvg`
- Plan: free (no persistent disk — SQLite data resets on every redeploy/spin-down)

### panchayat-laravel/Dockerfile

```dockerfile
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --ignore-platform-reqs
COPY . .
RUN composer dump-autoload --optimize --no-dev

FROM php:8.2-cli
RUN apt-get update && apt-get install -y libsqlite3-dev sqlite3 \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install pdo pdo_sqlite
WORKDIR /var/www/html
COPY --from=vendor /app .
RUN chmod +x docker-entrypoint.sh \
    && mkdir -p database storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache database

EXPOSE 10000
ENTRYPOINT ["./docker-entrypoint.sh"]
```

### panchayat-laravel/docker-entrypoint.sh

```sh
#!/bin/sh
set -e

mkdir -p database
touch database/database.sqlite

if [ -z "$APP_KEY" ]; then
  export APP_KEY=$(php artisan key:generate --show)
fi

php artisan config:clear
php artisan migrate --force
php artisan db:seed --force || true

exec php artisan serve --host 0.0.0.0 --port "${PORT:-10000}"
```

### config/cors.php change

Made `allowed_origins` read an extra env var so the frontend domain can be allow-listed
without editing code:

```php
'allowed_origins' => array_filter(array_merge(
    ['http://localhost:5173'],
    explode(',', env('CORS_ALLOWED_ORIGINS', ''))
)),
```

### Backend env vars (set via Render dashboard or API)

| Key | Value |
|---|---|
| APP_ENV | production |
| APP_DEBUG | false |
| DB_CONNECTION | sqlite |
| DB_DATABASE | /var/www/html/database/database.sqlite |
| CORS_ALLOWED_ORIGINS | https://panchayat-suvidha-frontend.onrender.com |
| SANCTUM_STATEFUL_DOMAINS | panchayat-suvidha-frontend.onrender.com |
| APP_URL | https://panchayat-suvidha-backend.onrender.com |

## 4. Frontend service (Vite/React static site)

- Service name: `panchayat-suvidha-frontend`
- Type: `static_site`
- Root dir in repo: `frontend`
- URL: https://panchayat-suvidha-frontend.onrender.com
- Service ID: `srv-da4otcmk1f9s73f194qg`
- Build command: `npm install && npm run build`
- Publish path: `dist`

### Frontend env vars

| Key | Value |
|---|---|
| VITE_API_URL | https://panchayat-suvidha-backend.onrender.com/api |

## 5. Render API calls used (for reference / repeating on a new project)

Get owner id:
```bash
curl -s -H "Authorization: Bearer $RENDER_API_KEY" https://api.render.com/v1/owners
```

Create a Docker-based web service:
```bash
curl -s -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "web_service",
    "name": "<name>",
    "ownerId": "<owner-id>",
    "repo": "https://github.com/<user>/<repo>",
    "branch": "master",
    "autoDeploy": "yes",
    "rootDir": "<backend-folder>",
    "serviceDetails": {
      "env": "docker",
      "dockerfilePath": "./Dockerfile",
      "dockerContext": "./",
      "plan": "free",
      "region": "oregon"
    },
    "envVars": [ { "key": "...", "value": "..." } ]
  }'
```

Create a static site:
```bash
curl -s -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "static_site",
    "name": "<name>",
    "ownerId": "<owner-id>",
    "repo": "https://github.com/<user>/<repo>",
    "branch": "master",
    "autoDeploy": "yes",
    "rootDir": "<frontend-folder>",
    "serviceDetails": {
      "buildCommand": "npm install && npm run build",
      "publishPath": "dist"
    },
    "envVars": [ { "key": "VITE_API_URL", "value": "<backend-url>/api" } ]
  }'
```

Update env vars on an existing service (replaces the full list):
```bash
curl -s -X PUT https://api.render.com/v1/services/<service-id>/env-vars \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[ { "key": "...", "value": "..." } ]'
```

Trigger a manual deploy:
```bash
curl -s -X POST https://api.render.com/v1/services/<service-id>/deploys \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":"clear"}'
```
