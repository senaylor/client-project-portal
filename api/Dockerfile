FROM php:8.3-fpm-alpine AS base

WORKDIR /var/www/html

RUN apk add --no-cache \
    bash \
    curl \
    git \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    unzip \
    zip \
    && docker-php-ext-install \
    intl \
    mbstring \
    opcache \
    pdo \
    pdo_pgsql \
    zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --optimize-autoloader

COPY . .

RUN composer dump-autoload --optimize \
    && php artisan config:clear \
    && php artisan route:clear \
    && php artisan view:clear

RUN chown -R www-data:www-data storage bootstrap/cache

USER www-data

EXPOSE 9000

CMD ["php-fpm"]
