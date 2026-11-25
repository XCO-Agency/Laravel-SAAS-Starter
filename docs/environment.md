# Environment variables

Names only. Nothing in this file is a credential, host, or example secret. Copy `.env.example` to `.env` and set values locally or in the host. Do not commit `.env`.

`phpunit.xml` overrides a subset of these during tests (in-memory SQLite, sync queue, array cache, array session, log mailer disabled in favor of `array`, null broadcaster). Those overrides are not listed again here.

## Keys assigned in `.env.example`

56 keys are assigned (not merely commented) in `.env.example`.

| Name | Meaning |
| --- | --- |
| `APP_NAME` | Display name. Also the default for `VITE_APP_NAME` and `MAIL_FROM_NAME` when those reference it. |
| `APP_ENV` | Runtime environment name (`local`, `testing`, `production`, …). |
| `APP_KEY` | Application encryption key. Generate with `php artisan key:generate`. |
| `APP_DEBUG` | When true, error pages show debug detail. Keep off in production. |
| `APP_URL` | Root URL used to build absolute links. |
| `APP_LOCALE` | Default translation locale. |
| `APP_FALLBACK_LOCALE` | Locale used when a translation key is missing. |
| `APP_FAKER_LOCALE` | Faker locale for factories and seeders. |
| `APP_MAINTENANCE_DRIVER` | Where `php artisan down` stores maintenance mode (`file` or `cache`). |
| `BCRYPT_ROUNDS` | bcrypt cost for password hashes. |
| `LOG_CHANNEL` | Default log channel (`stack` uses `LOG_STACK`). |
| `LOG_STACK` | Comma-separated channels included in the `stack` channel. |
| `LOG_DEPRECATIONS_CHANNEL` | Channel for PHP and library deprecation warnings. |
| `LOG_LEVEL` | Minimum log level for the single, daily, and stderr channels. |
| `DB_CONNECTION` | Default database driver. `sqlite` uses `database/database.sqlite` unless `DB_DATABASE` is set. |
| `SESSION_DRIVER` | Session store. The session UI expects the `database` driver and the `sessions` table. |
| `SESSION_LIFETIME` | Session idle lifetime, in minutes. |
| `SESSION_ENCRYPT` | Encrypt session payload before storage. |
| `SESSION_PATH` | Cookie path for the session cookie. |
| `SESSION_DOMAIN` | Cookie domain for the session cookie. Empty or null keeps the current host. |
| `BROADCAST_CONNECTION` | Broadcast driver. The example selects Reverb. `null` disables broadcasting. |
| `FILESYSTEM_DISK` | Default filesystem disk (`local`, `public`, or `s3`). |
| `QUEUE_CONNECTION` | Queue backend. The example uses the `database` driver and the `jobs` table. |
| `CACHE_STORE` | Default cache store. The example uses the `database` store. |
| `MEMCACHED_HOST` | Memcached host, used only if the cache store is `memcached`. |
| `REDIS_CLIENT` | Redis client extension (`phpredis` or `predis`). |
| `REDIS_HOST` | Redis host for the default and cache connections. |
| `REDIS_PASSWORD` | Redis password. Empty or null means no password. |
| `REDIS_PORT` | Redis port. |
| `MAIL_MAILER` | Mail transport. `log` writes messages to the log and sends nothing. |
| `MAIL_SCHEME` | Scheme for the SMTP transport (`smtp` or `smtps`). |
| `MAIL_HOST` | SMTP host. |
| `MAIL_PORT` | SMTP port. |
| `MAIL_USERNAME` | SMTP username. |
| `MAIL_PASSWORD` | SMTP password. |
| `MAIL_FROM_ADDRESS` | Default From address. |
| `MAIL_FROM_NAME` | Default From name. The example interpolates `APP_NAME`. |
| `AWS_ACCESS_KEY_ID` | Key for the `s3` filesystem disk and the SQS queue connection. |
| `AWS_SECRET_ACCESS_KEY` | Secret for the `s3` disk and the SQS queue connection. |
| `AWS_DEFAULT_REGION` | Region for the `s3` disk and the SQS queue connection. |
| `AWS_BUCKET` | Bucket for the `s3` disk. |
| `AWS_USE_PATH_STYLE_ENDPOINT` | Use path-style S3 URLs (needed by some S3-compatible stores). |
| `REVERB_APP_ID` | Reverb application id (server-side). |
| `REVERB_APP_KEY` | Reverb key shared with the browser via `VITE_REVERB_APP_KEY`. |
| `REVERB_APP_SECRET` | Reverb secret. Server only. |
| `REVERB_HOST` | Hostname browsers and the broadcaster use to reach Reverb. |
| `REVERB_PORT` | Port browsers and the broadcaster use to reach Reverb. |
| `REVERB_SCHEME` | `http` or `https` for the Reverb client connection. |
| `VITE_APP_NAME` | App name inlined into the Vite client bundle. The example interpolates `APP_NAME`. |
| `VITE_REVERB_APP_KEY` | Reverb key inlined into the client bundle. |
| `VITE_REVERB_HOST` | Reverb host inlined into the client bundle. |
| `VITE_REVERB_PORT` | Reverb port inlined into the client bundle. |
| `VITE_REVERB_SCHEME` | Reverb scheme inlined into the client bundle. |
| `SENTRY_LARAVEL_DSN` | Sentry DSN for the PHP SDK (`sentry/sentry-laravel`). Empty disables PHP reporting. |
| `VITE_SENTRY_DSN_PUBLIC` | Sentry DSN inlined into the browser SDK in `resources/js/app.tsx`. Use a public client DSN. |
| `AUTH_PASSWORD_EXPIRY_DAYS` | Password age, in days, after which `EnsurePasswordNotExpired` forces a change. `config/auth.php` key `password_expiry_days`. |

`VITE_*` values are baked in when Vite runs (`pnpm run build` or `pnpm run dev`). Changing them later does not update an already built bundle. On Coolify they must be available at image build time. See [deploy-coolify.md](deploy-coolify.md).

## Commented keys in `.env.example`

These lines exist but are commented, so a copied `.env` will not set them.

| Name | Meaning |
| --- | --- |
| `APP_MAINTENANCE_STORE` | Cache store used when `APP_MAINTENANCE_DRIVER` is `cache`. |
| `PHP_CLI_SERVER_WORKERS` | Worker count for PHP’s built-in server. `composer run dev` does not pass this through. |
| `DB_HOST` | Database host for MySQL, MariaDB, PostgreSQL, and SQL Server. |
| `DB_PORT` | Database port for those drivers. |
| `DB_DATABASE` | Database name, or an absolute path when `DB_CONNECTION` is `sqlite`. |
| `DB_USERNAME` | Database user. |
| `DB_PASSWORD` | Database password. |
| `CACHE_PREFIX` | Prefix for cache keys. The default is derived from `APP_NAME`. |

## Read by this app, not assigned in `.env.example`

Set these when you use the feature. Defaults in `config/` apply when the variable is absent.

### Application

| Name | Meaning |
| --- | --- |
| `APP_VERSION` | Reported by `config('app.version')` and `php artisan app:version`. |
| `APP_PREVIOUS_KEYS` | Comma-separated previous `APP_KEY` values kept during key rotation. |
| `DB_URL` | Single URL that overrides the split database settings. |
| `DB_FOREIGN_KEYS` | Toggle SQLite foreign keys. |
| `DB_SOCKET` | MySQL or MariaDB unix socket. |
| `DB_CHARSET` | Connection charset. |
| `DB_COLLATION` | Connection collation. |
| `MYSQL_ATTR_SSL_CA` | CA path for MySQL TLS. |

### Billing

| Name | Meaning |
| --- | --- |
| `STRIPE_KEY` | Stripe publishable key (`config/cashier.php` and `config/services.php`). |
| `STRIPE_SECRET` | Stripe secret key. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for `POST /stripe/webhook`. |
| `STRIPE_WEBHOOK_TOLERANCE` | Allowed timestamp skew, in seconds, for Stripe signatures. |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Stripe price id for the Pro monthly plan. |
| `STRIPE_PRO_YEARLY_PRICE_ID` | Stripe price id for the Pro yearly plan. |
| `STRIPE_BUSINESS_MONTHLY_PRICE_ID` | Stripe price id for the Business monthly plan. |
| `STRIPE_BUSINESS_YEARLY_PRICE_ID` | Stripe price id for the Business yearly plan. |
| `CASHIER_PATH` | URI prefix for Cashier’s payment pages. |
| `CASHIER_CURRENCY` | Currency code Cashier uses. |
| `CASHIER_CURRENCY_LOCALE` | Locale Cashier uses when formatting money. |
| `CASHIER_PAYMENT_NOTIFICATION` | Notification class Cashier sends when a payment needs extra confirmation. |
| `CASHIER_INVOICE_RENDERER` | Invoice PDF renderer class. |
| `CASHIER_PAPER` | Paper size for invoice PDFs. |
| `CASHIER_REMOTE_ENABLED` | Allow remote images in invoice PDFs. |
| `CASHIER_LOGGER` | Logger channel Cashier writes to. |

### Login providers

| Name | Meaning |
| --- | --- |
| `GITHUB_CLIENT_ID` | GitHub OAuth client id. |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret. |
| `GOOGLE_CLIENT_ID` | Google OAuth client id. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret. |

### Octane, flags, search, retention

| Name | Meaning |
| --- | --- |
| `OCTANE_SERVER` | Octane binary: `frankenphp`, `swoole`, or `roadrunner`. The image uses FrankenPHP. |
| `OCTANE_HTTPS` | When true, Octane generates absolute URLs with HTTPS. Set this behind a TLS-terminating proxy. |
| `PENNANT_STORE` | Pennant store. Default `database`. |
| `SCOUT_DRIVER` | Scout engine. Default `collection` (database, no external cluster). |
| `SCOUT_PREFIX` | Index name prefix. |
| `SCOUT_QUEUE` | Queue Scout sync operations. |
| `SCOUT_IDENTIFY` | Send Scout identify calls (Algolia). |
| `RETENTION_NOTIFICATIONS_DAYS` | Age before read notifications are pruned. |
| `RETENTION_ACTIVITY_DAYS` | Age before activity-log rows are pruned. |
| `RETENTION_WEBHOOK_LOGS_DAYS` | Age before webhook logs are pruned. |
| `RETENTION_FEEDBACK_DAYS` | Age before archived feedback is pruned. |

### Inertia SSR

| Name | Meaning |
| --- | --- |
| `INERTIA_SSR_ENABLED` | Render pages through the Inertia SSR server. |
| `INERTIA_SSR_URL` | SSR server URL. |
| `INERTIA_SSR_ENSURE_BUNDLE_EXISTS` | Fail when the SSR bundle is missing. |
| `INERTIA_SSR_THROW_ON_ERROR` | Surface SSR failures instead of falling back. |
| `INERTIA_ENCRYPT_HISTORY` | Encrypt Inertia history state. |

### AI providers (`config/ai.php`)

The default text, audio, transcription, and embeddings provider is `openai`. Images default to `gemini`. Reranking defaults to `cohere`. Leave keys empty until you call that provider.

| Name | Meaning |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI API key. |
| `ANTHROPIC_API_KEY` | Anthropic API key. |
| `GEMINI_API_KEY` | Gemini API key. |
| `COHERE_API_KEY` | Cohere API key. |
| `GROQ_API_KEY` | Groq API key. |
| `MISTRAL_API_KEY` | Mistral API key. |
| `DEEPSEEK_API_KEY` | DeepSeek API key. |
| `XAI_API_KEY` | xAI API key. |
| `OPENROUTER_API_KEY` | OpenRouter API key. |
| `ELEVENLABS_API_KEY` | ElevenLabs API key. |
| `JINA_API_KEY` | Jina API key. |
| `VOYAGEAI_API_KEY` | Voyage AI API key. |
| `OLLAMA_API_KEY` | Ollama API key, when the server requires one. |
| `OLLAMA_BASE_URL` | Ollama server URL. |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI key. |
| `AZURE_OPENAI_URL` | Azure OpenAI endpoint. |
| `AZURE_OPENAI_API_VERSION` | Azure OpenAI API version. |
| `AZURE_OPENAI_DEPLOYMENT` | Azure chat deployment name. |
| `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` | Azure embeddings deployment name. |

### Queues, sessions, and mail (only if you change the driver)

| Name | Meaning |
| --- | --- |
| `DB_QUEUE` | Queue name the database driver pushes to. Jobs in this repo do not call `onQueue()`, so they use this name. |
| `DB_QUEUE_CONNECTION` | Database connection for the queue tables. |
| `DB_QUEUE_TABLE` | Jobs table name. |
| `DB_QUEUE_RETRY_AFTER` | Seconds before a reserved database job is retried. |
| `QUEUE_FAILED_DRIVER` | Failed-job store. Default `database-uuids`. |
| `REDIS_QUEUE` | Queue name when `QUEUE_CONNECTION` is `redis`. |
| `REDIS_QUEUE_CONNECTION` | Redis connection name for queues. |
| `REDIS_QUEUE_RETRY_AFTER` | Retry window for the Redis queue. |
| `SESSION_CONNECTION` | Database connection for the session table. |
| `SESSION_TABLE` | Session table name. |
| `SESSION_STORE` | Cache store when `SESSION_DRIVER` is `cache` or `redis`. |
| `SESSION_EXPIRE_ON_CLOSE` | Expire the session cookie when the browser closes. |
| `SESSION_SECURE_COOKIE` | Mark the session cookie `Secure`. |
| `SESSION_HTTP_ONLY` | Mark the session cookie `HttpOnly`. |
| `SESSION_SAME_SITE` | SameSite attribute for the session cookie. |
| `SESSION_PARTITIONED_COOKIE` | Partition the session cookie (CHIPS). |
| `MAIL_URL` | Full mailer URL, alternative to host and port. |
| `MAIL_EHLO_DOMAIN` | EHLO domain for SMTP. |
| `MAIL_LOG_CHANNEL` | Log channel used by the `log` mailer. |
| `MAIL_SENDMAIL_PATH` | Sendmail binary path. |
| `AWS_URL` | Public URL base for the `s3` disk. |
| `AWS_ENDPOINT` | Custom S3 endpoint. |

### Auth, cache, Redis, and Sanctum

| Name | Meaning |
| --- | --- |
| `AUTH_GUARD` | Default auth guard. |
| `AUTH_PASSWORD_BROKER` | Password broker name. |
| `AUTH_MODEL` | User model class. |
| `AUTH_PASSWORD_RESET_TOKEN_TABLE` | Password reset token table. |
| `AUTH_PASSWORD_TIMEOUT` | Seconds before a password confirmation expires. |
| `SANCTUM_STATEFUL_DOMAINS` | Comma-separated hosts that receive Sanctum’s SPA cookie. |
| `SANCTUM_TOKEN_PREFIX` | Prefix prepended to new Sanctum tokens. |
| `DB_CACHE_CONNECTION` | Database connection for the cache table. |
| `DB_CACHE_TABLE` | Cache table name. |
| `DB_CACHE_LOCK_CONNECTION` | Connection for database cache locks. |
| `DB_CACHE_LOCK_TABLE` | Lock table for the database cache. |
| `REDIS_URL` | Redis URL for the default connection. |
| `REDIS_USERNAME` | Redis ACL username. |
| `REDIS_DB` | Redis database index for the default connection. |
| `REDIS_CACHE_DB` | Redis database index for the cache connection. |
| `REDIS_CLUSTER` | Redis cluster mode name. |
| `REDIS_PREFIX` | Key prefix. |
| `REDIS_PERSISTENT` | Use a persistent Redis connection. |
| `REDIS_CACHE_CONNECTION` | Redis connection used as the cache store. |
| `REDIS_CACHE_LOCK_CONNECTION` | Redis connection used for cache locks. |
| `REDIS_MAX_RETRIES` | Redis command retries. |
| `REDIS_BACKOFF_ALGORITHM` | Redis retry backoff algorithm. |
| `REDIS_BACKOFF_BASE` | Redis backoff base delay. |
| `REDIS_BACKOFF_CAP` | Redis backoff cap. |
| `MEMCACHED_PORT` | Memcached port. |
| `MEMCACHED_PERSISTENT_ID` | Persistent Memcached connection id. |
| `MEMCACHED_USERNAME` | Memcached SASL username. |
| `MEMCACHED_PASSWORD` | Memcached SASL password. |

### Reverb process

The client-facing `REVERB_HOST`, `REVERB_PORT`, and `REVERB_SCHEME` are in the first table. These configure the Reverb server process itself.

| Name | Meaning |
| --- | --- |
| `REVERB_SERVER` | Reverb server name. |
| `REVERB_SERVER_HOST` | Interface the Reverb process binds. The image binds all interfaces. |
| `REVERB_SERVER_PORT` | Port the Reverb process binds. The image uses 8080. |
| `REVERB_SERVER_PATH` | Path prefix on the Reverb server. |
| `REVERB_MAX_REQUEST_SIZE` | Maximum Reverb request size. |
| `REVERB_APP_PING_INTERVAL` | Client ping interval. |
| `REVERB_APP_ACTIVITY_TIMEOUT` | Inactivity timeout. |
| `REVERB_APP_MAX_CONNECTIONS` | Connection cap for the app. |
| `REVERB_APP_MAX_MESSAGE_SIZE` | Maximum message size. |
| `REVERB_APP_ACCEPT_CLIENT_EVENTS_FROM` | Who may publish client events. |
| `REVERB_SCALING_ENABLED` | Share Reverb state across nodes through Redis. |
| `REVERB_SCALING_CHANNEL` | Redis channel used when scaling is on. |
| `REVERB_PULSE_INGEST_INTERVAL` | Pulse ingest interval, if Pulse is installed (it is not a direct dependency). |
| `REVERB_TELESCOPE_INGEST_INTERVAL` | Telescope ingest interval, if Telescope is installed (it is not). |

### Other published config

These are stock options in `config/`. They do nothing until you switch the related driver. Scribe’s key is only for generated API docs.

| Name | Meaning |
| --- | --- |
| `SCRIBE_AUTH_KEY` | Example bearer token Scribe prints in generated docs. |
| `LOG_DEPRECATIONS_TRACE` | Include stack traces with deprecation logs. |
| `LOG_DAILY_DAYS` | Days of `daily` log files to keep. |
| `LOG_SLACK_WEBHOOK_URL` | Slack webhook for the `slack` log channel. |
| `LOG_SLACK_USERNAME` | Username for that Slack message. |
| `LOG_SLACK_EMOJI` | Emoji for that Slack message. |
| `LOG_PAPERTRAIL_HANDLER` | Handler class for the Papertrail channel. |
| `PAPERTRAIL_URL` | Papertrail host. |
| `PAPERTRAIL_PORT` | Papertrail port. |
| `LOG_STDERR_FORMATTER` | Formatter class for the stderr channel. |
| `LOG_SYSLOG_FACILITY` | Syslog facility. |
| `POSTMARK_API_KEY` | Postmark mailer key. |
| `POSTMARK_MESSAGE_STREAM_ID` | Present only inside a comment in `config/mail.php`. |
| `RESEND_API_KEY` | Resend mailer key. |
| `SLACK_BOT_USER_OAUTH_TOKEN` | Slack bot token in `config/services.php`. |
| `SLACK_BOT_USER_DEFAULT_CHANNEL` | Default Slack channel. |
| `PUSHER_APP_ID` | Pusher app id, if you switch the broadcaster off Reverb. |
| `PUSHER_APP_KEY` | Pusher key. |
| `PUSHER_APP_SECRET` | Pusher secret. |
| `PUSHER_APP_CLUSTER` | Pusher cluster. |
| `PUSHER_HOST` | Custom Pusher host. |
| `PUSHER_PORT` | Custom Pusher port. |
| `PUSHER_SCHEME` | Custom Pusher scheme. |
| `ABLY_KEY` | Ably key for the `ably` broadcaster. |
| `SQS_PREFIX` | SQS queue URL prefix. |
| `SQS_QUEUE` | SQS queue name. |
| `SQS_SUFFIX` | SQS queue suffix. |
| `BEANSTALKD_QUEUE_HOST` | Beanstalkd host. |
| `BEANSTALKD_QUEUE` | Beanstalkd tube. |
| `BEANSTALKD_QUEUE_RETRY_AFTER` | Beanstalkd retry window. |
| `DYNAMODB_CACHE_TABLE` | DynamoDB table for the `dynamodb` cache store. |
| `DYNAMODB_ENDPOINT` | DynamoDB endpoint. |
| `ALGOLIA_APP_ID` | Algolia app id, if `SCOUT_DRIVER` is `algolia`. |
| `ALGOLIA_SECRET` | Algolia secret. |
| `MEILISEARCH_HOST` | Meilisearch host. |
| `MEILISEARCH_KEY` | Meilisearch key. |
| `TYPESENSE_API_KEY` | Typesense API key. |
| `TYPESENSE_HOST` | Typesense host. |
| `TYPESENSE_PORT` | Typesense port. |
| `TYPESENSE_PATH` | Typesense path. |
| `TYPESENSE_PROTOCOL` | Typesense protocol. |
| `TYPESENSE_CONNECTION_TIMEOUT_SECONDS` | Typesense connection timeout. |
| `TYPESENSE_HEALTHCHECK_INTERVAL_SECONDS` | Typesense healthcheck interval. |
| `TYPESENSE_NUM_RETRIES` | Typesense retries. |
| `TYPESENSE_RETRY_INTERVAL_SECONDS` | Typesense retry interval. |
| `TYPESENSE_IMPORT_ACTION` | Typesense import action. |

`DB_ENCRYPT` and `DB_TRUST_SERVER_CERTIFICATE` appear only inside comments in `config/database.php`.

## Present on the Coolify app, unused by this code

The staging Coolify application also has `APP_TIMEZONE` and `JWT_SECRET`. `config/app.php` sets `timezone` to the string `UTC` and does not read `APP_TIMEZONE`. No PHP or JS in this repo reads `JWT_SECRET`.
