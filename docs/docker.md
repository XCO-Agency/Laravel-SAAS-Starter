# Docker

The production process is defined by `Dockerfile` and `entrypoint.sh`. Local development does not need Docker. `composer run dev` is the local path. There is no `docker-compose` file in the repo.

## Image

The image starts `FROM xcoagency/laravel-frankenphp-octane:latest`. This docs change did not pull or run that image, so the base tag’s availability and PHP version were not verified here. The rest of the Dockerfile is:

1. `WORKDIR /app` and `COPY . /app`.
2. Install curl, Node.js from NodeSource’s `setup_lts.x` script, and pnpm. The Node major version is whatever that script considers LTS at build time. CI pins Node 22 instead.
3. `composer install --optimize-autoloader --ignore-platform-reqs --no-scripts --no-interaction` (dev dependencies stay installed; a later `--no-dev` install is commented out).
4. `pnpm install` and `pnpm run build` with `CI=true`. Vite reads `VITE_*` at this step.
5. Copy `entrypoint.sh` to `/usr/local/bin/entrypoint.sh`.
6. Raise PHP `upload_max_filesize` to 400M and `post_max_size` to 500M.
7. `EXPOSE 8000`.

There is no `.dockerignore`. A local build context includes anything git does not ignore that is still on disk. `.env` is gitignored, but if you build on a machine where `.env` exists, Docker still sends it unless you exclude it. Do not bake secrets into the image. Prefer the host’s runtime environment.

Build:

```bash
docker build -t laravel-saas-starter .
```

`test-docker.sh` still runs `docker build --target composer-build` and `--target node-build`. The current Dockerfile has no stages and no those targets. Use the command above. The script was not updated in this docs change.

## Process

`entrypoint.sh` on every start:

1. `php artisan migrate --force`
2. `php artisan config:cache`, `route:cache`, `view:cache`, and `optimize`
3. Background: `php artisan queue:work --daemon --queue=high,low`
4. Background: `php artisan reverb:start --host=0.0.0.0 --port=8080`
5. Foreground: `php artisan octane:frankenphp --host=0.0.0.0 --port=8000`

Consequences:

- The container will not become healthy if the database is unreachable. Migrate runs before Octane listens.
- Config, routes, and views are cached from the environment present at container start. Changing an env var requires a new process so the cache is rebuilt.
- The queue worker does not listen on the `default` queue. See [queues-and-scheduler.md](queues-and-scheduler.md).
- The scheduler is not started.
- Reverb listens on port 8080 inside the network namespace. Only port 8000 is published by `EXPOSE` and by the Coolify app. Browsers cannot open Reverb unless you publish or proxy 8080 and the `VITE_REVERB_*` values baked at build time point at that public host.
- `OCTANE_HTTPS` should be true when a proxy terminates TLS and Octane still sees HTTP. Otherwise generated URLs stay on `http`.

Run locally only against a disposable database:

```bash
docker run --rm -p 8000:8000 --env-file .env laravel-saas-starter
```

`--env-file` is your local file. Do not point it at a production database. The entrypoint will migrate it.
