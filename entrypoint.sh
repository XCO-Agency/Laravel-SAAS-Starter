#!/bin/sh

# Run database migrations
php artisan migrate --force

# Optimize the application
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# queue work in background
php artisan queue:work --daemon --queue=high,low &

# Start Reverb WebSocket server in background
php artisan reverb:start --host=0.0.0.0 --port=8080 &

# Start the server
exec php artisan octane:frankenphp --host=0.0.0.0 --port=8000
