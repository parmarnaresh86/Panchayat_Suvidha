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
