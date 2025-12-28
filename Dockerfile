FROM xcoagency/laravel-frankenphp-octane:latest

WORKDIR /app
COPY . /app

# Install Node.js and pnpm
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install PHP dependencies (with dev deps for wayfinder)
RUN composer install --optimize-autoloader --ignore-platform-reqs --no-scripts --no-interaction

# Build frontend assets
ENV CI=true
RUN pnpm install && pnpm run build

# Remove dev dependencies after build
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Add entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

RUN echo "upload_max_filesize = 400M" >> /usr/local/etc/php/php.ini && \
    echo "post_max_size = 500M" >> /usr/local/etc/php/php.ini

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
