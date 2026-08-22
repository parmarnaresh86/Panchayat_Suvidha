FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --ignore-platform-reqs
COPY . .
RUN composer dump-autoload --optimize --no-dev

FROM php:8.2-cli
RUN docker-php-ext-install pdo pdo_sqlite
WORKDIR /var/www/html
COPY --from=vendor /app .
RUN chmod +x docker-entrypoint.sh \
    && mkdir -p database storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache database

EXPOSE 10000
ENTRYPOINT ["./docker-entrypoint.sh"]
