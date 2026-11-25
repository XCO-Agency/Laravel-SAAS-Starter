# Tests

Tests are Pest 4 on PHPUnit 12. Feature tests extend the Laravel test case and use `RefreshDatabase` (`tests/Pest.php`). Unit tests do not.

## Run

```bash
php artisan test --compact
php artisan test --compact tests/Feature/Auth/AuthenticationTest.php
php artisan test --compact --filter=AuthenticationTest
composer test
```

`composer test` clears config, then runs the suite. CI (`.github/workflows/tests.yml`) installs pnpm dependencies with a frozen lockfile, installs Composer dependencies, runs `pnpm run build`, copies `.env.example` to `.env`, generates `APP_KEY`, and then runs `php artisan test --compact`. The workflow is `workflow_dispatch` only. Its PHP matrix is `8.4`.

`phpunit.xml` forces the suite onto SQLite in memory, the sync queue, the array cache, the array session driver, the array mailer, and a null broadcaster. It also sets `APP_ENV` to `testing` and lowers `BCRYPT_ROUNDS`. You do not need a running MySQL, Redis, Stripe, or Reverb to run the suite.

## Layout

- `tests/Feature` holds the HTTP, job, command, and model coverage. Feature tests migrate a fresh database per test.
- `tests/Unit` holds a small number of unit cases.
- There is no `tests/Browser` directory, so Pest’s browser runner is not part of this suite.
- `tests/Feature/tests/Feature/` contains a handful of extra cases (about 16) whose paths repeat `tests/Feature`. They are picked up by PHPUnit because `phpunit.xml` includes the whole `tests/Feature` directory. They look accidental. Count them until someone removes that tree.

A count of `it(` and `test(` calls under `tests/` is about 1,490, of which about 1,470 sit outside that nested tree. The old “1,400+” figure is still in the right range. Re-count after adding tests; do not treat this paragraph as a badge.

Factories live in `database/factories`. Prefer them to hand-built models. `DatabaseSeeder` is for a local demo database, not for tests.

## What CI does not prove

Lint (`.github/workflows/lint.yml`) runs Pint, Prettier, and ESLint on `workflow_dispatch`, with PHP 8.4, pnpm, and Node 22. Dependency audit and CodeQL are also manual. CodeQL’s language matrix is `javascript-typescript` only. `release.yml` runs release-please. `stale.yml` marks inactive issues and pull requests. None of these run on push.

`.actrc` pins `ubuntu-latest` to `act-ubuntu-22.04:amd64` and sets `--pull=false`. Running the workflows with `act` was not part of this documentation pass.
