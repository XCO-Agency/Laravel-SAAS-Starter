# Architecture & Security

## Overview

The SaaS starter prioritizes strict security architectures right out of the box, mitigating common web vulnerabilities, spam, and unauthenticated breaches.

## Core Security Features

1. **Robust Middlewares**: Routes are strictly guarded.
   - `EnsureUserIsOnboarded`: Prevents users from abusing APIs or viewing active dashboards if they haven't verified their email or established a workspace.
   - `EnsureWorkspaceAccess`: Authenticates that the user actually belongs to exactly the Workspace ID they are trying to manipulate.
2. **CSRF Protection:** Provided natively by Inertia.js resolving Laravel's internal XSRF tokens on every single `useForm` and `router.visit()` permutation.
3. **Rate Limiting:** Heavy throttling applied to authentication routes (e.g. Fortify Login) and custom strict throttling on workspace invites (`AppServiceProvider::boot()`) to mitigate email dispatching spam.
4. **Secure Sessions:** Sessions are mapped strongly to the database or Redis (as defined in `.env`), tracking precise cookie parameters (`SameSite=Lax`, `Secure` when HTTPS is present).

## Authorization Flow

The application aggressively defaults to closed-access unless specifically opened.

- APIs inside `routes/web.php` are structured into nested middleware groups:

  ```php
  Route::middleware(['auth', 'verified'])->group(function() {
      // General protected endpoints

      Route::middleware(['workspace.access'])->group(function() {
          // Endpoint requiring the user to belong to the workspace in context
      });
  });
  ```

## Impersonation Threat Model

The built-in Super Admin Impersonation deliberately leaves an immutable trace via the `admin:impersonator` session key. Impersonation automatically suspends highly sensitive operations (like updating passwords or billing details) if the application logic catches the impersonation state.
