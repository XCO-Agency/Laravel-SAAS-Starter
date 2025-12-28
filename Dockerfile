# Step 1: Use a Composer image to install PHP dependencies
FROM composer:latest AS composer-build

WORKDIR /app
COPY . /app

# Install PHP dependencies
RUN composer install --optimize-autoloader --ignore-platform-reqs --no-scripts --no-interaction

# Step 2: Use a Node.js image to install pnpm, install dependencies, and build
FROM node:lts-alpine AS node-build

WORKDIR /app
COPY . /app

# Copy the vendor folder from the Composer build stage
COPY --from=composer-build /app/vendor /app/vendor

# Install pnpm
RUN npm install -g pnpm

# Install Node.js dependencies and build the project
RUN pnpm install && pnpm run build

# Step 3: Use dunglas/frankenphp as the final base image
FROM xcoagency/laravel-frankenphp-octane:latest

# Copy built files from the Node.js image
COPY --from=node-build /app /app
WORKDIR /app

# Ensure vendor directory is present in the final image
COPY --from=composer-build /app/vendor /app/vendor

# Install PHP dependencies (if needed again for safety)
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Add entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

RUN echo "upload_max_filesize = 400M" >> /usr/local/etc/php/php.ini && \
    echo "post_max_size = 500M" >> /usr/local/etc/php/php.ini

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
