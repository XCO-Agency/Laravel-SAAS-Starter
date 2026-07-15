# Changelog

## [0.1.5](https://github.com/XCO-Agency/Laravel-SAAS-Starter/compare/v0.1.4...v0.1.5) (2026-07-15)


### Features

* add "Send test notification" button to notification settings ([9c6db59](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/9c6db59f0aaedf4be112586c295f9de2d50737ca))
* add app:version artisan command ([9924578](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/99245787e4e30bcbb2da41eded5236357373695f))
* add app:version artisan command, closes [#87](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/87) ([059134b](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/059134ba642749614ef53214d0497e704f28fcd8))
* add owner close/reopen actions for support tickets, closes [#103](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/103) ([3f592ac](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/3f592ac5d5534b543ae9fba94360e3af63b3c632))
* add resolve/unresolve to workspace comments, closes [#97](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/97) ([8d7262f](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/8d7262f08cc7fa98f00174fd197623cd34b075db))
* add send test notification button to notification settings, closes [#113](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/113) ([1f41dcd](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/1f41dcda74118e3f6559a23c8e62879286ddb0c3))
* **admin:** add average first-response time metric to dashboard, closes [#95](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/95) ([d2f708a](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/d2f708a697015f8164a124b0b4d3e7e9af638174))
* **admin:** average first-response time metric on dashboard ([6bf2d20](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/6bf2d20376e1c63bd58cb57b3582375310f69ba6))
* allow ticket owner to close and reopen their support ticket ([d25048d](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/d25048d2100ea41f70a332d5df867b833d417b90))
* allow ticket owner to close and reopen their support ticket, closes [#103](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/103) ([39e9e5e](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/39e9e5e66f474963a372543b489c74b3a34b15f5))
* owner close/reopen actions for support tickets ([9098fce](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/9098fce793d18ca813a8b39485e9ba0a71a1ab5b))
* render dates in user's saved timezone and date format ([521fc0e](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/521fc0ea2703c7d97da355f92eed5fef34c26db1))
* render dates in user's saved timezone and date format, closes [#85](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/85) ([ca28695](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/ca28695270788afecf6299835a2dba936f6a9901))
* resolve/unresolve workspace comments ([#97](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/97)) ([9b742e5](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/9b742e5732b068c09b3a182a27fae6f26643f763))
* **settings:** add CSV export for user login history ([4944c76](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/4944c762d80601ea3a9e54dc6552f0bda00f6c9d))
* **settings:** add CSV export for user login history, closes [#100](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/100) ([df8491b](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/df8491b6d1c5748372adc6080dedaab4769e4ece))
* **tickets:** add status filter tabs to user support tickets index ([c1d9a0d](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/c1d9a0d72e420ee88290b543e8a1b7c5d0930f89))
* **tickets:** add status filter to user support tickets index ([b73d0cf](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/b73d0cfaf451624a5dee421e3323a975d913c10e))
* **tickets:** add status filter to user support tickets index, closes [#104](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/104) ([b58c1ad](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/b58c1adf717dbb27d1f94d98a998035e1bf92216))


### Bug Fixes

* add explicit return types and align rollup lockfile pin on [#112](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/112) ([e5b0abc](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/e5b0abc38b3f19de01f7d3cb9159b0a9292e61b5))
* address review + CI on [#101](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/101) ([f3c5661](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/f3c56612545583b8a260f3c67e8c665a7e8e3298))
* align rollup win32 lockfile specifier and use gap spacing on [#116](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/116) ([b8ecae0](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/b8ecae0eaf44258bee6b6c77c0d81c2cd815b0a5))
* **deps:** align @rollup/rollup-win32-x64-msvc pin to 4.62.2 to match lockfile ([563e622](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/563e622458a777873139672b9120990f4509f788))
* guard admin ticket status filter against array input ([3420666](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/34206660fe40c762e55bfff2de50d66b44dd0453))
* honour user locale for date month names, address review on [#86](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/86) ([e494e78](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/e494e780212d8d02b9b26600babcec4eaed8501f))
* mount sonner Toaster so close/reopen toasts render ([df5d40f](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/df5d40fdce0af63f121990f72948f0af51e19ddd))
* replace lucide-react brand icons removed in v1 ([8b92ac0](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/8b92ac04437512d2153b1c4bf2ced3fd76be37f1))
* sanitize ticket status filter and repair frozen-lockfile CI ([9aefc93](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/9aefc933248a4765880e738670982669adf6105f))
* **ui:** align rollup lockfile drift and finish dark-mode token standardization ([5d732f6](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/5d732f61759943687041d18faadc3923bd771c52))
* **ui:** dark-mode contrast — flip light-only literals to semantic tokens ([9193e5c](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/9193e5ca83641f044fe2892c842d5c365e3d6155))
* **ui:** flip light-only literals to semantic tokens for dark mode, closes [#105](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/105) ([40fbe1a](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/40fbe1abd3edad02d4bef8d3f1e0a08b48ba7dcb))
* **ui:** flip light-only literals to semantic tokens for dark mode, closes [#105](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/105) ([321faac](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/321faac705587c54c5c1d14bf47483787788ef77))
* **ui:** standardize dark mode styling across pages and shared components ([60d4295](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/60d42959cc770681f6481c3fbb2849c7cd4f445e))
* use Wayfinder for tickets filter URL and align rollup lockfile pin ([d8b749e](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/d8b749e45feaf1b7f7d9849b8d19ae6058a5364d))


### Performance Improvements

* stream first-response average with a cursor to bound memory ([b0452fe](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/b0452fe417980738587c369fa67760fa38a1e6c3))

## [0.1.6](https://github.com/XCO-Agency/Laravel-SAAS-Starter/compare/v0.1.5...v0.1.6) (2026-07-13)


### Features

* **tickets:** allow ticket owner to close and reopen their support ticket ([#108](https://github.com/XCO-Agency/Laravel-SAAS-Starter/pull/108))
* **tickets:** add status filter tabs to the user-facing support tickets index ([#107](https://github.com/XCO-Agency/Laravel-SAAS-Starter/pull/107))

## [0.1.5](https://github.com/XCO-Agency/Laravel-SAAS-Starter/compare/v0.1.4...v0.1.5) (2026-07-10)


### Features

* **settings:** add CSV export for user login history ([#101](https://github.com/XCO-Agency/Laravel-SAAS-Starter/pull/101))
* **tickets:** add status filter to user support tickets index ([#111](https://github.com/XCO-Agency/Laravel-SAAS-Starter/pull/111))
* **tickets:** add owner close/reopen actions for support tickets ([#112](https://github.com/XCO-Agency/Laravel-SAAS-Starter/pull/112))
* **notifications:** add "Send test notification" button to notification settings ([#116](https://github.com/XCO-Agency/Laravel-SAAS-Starter/pull/116))


### Bug Fixes

* **ui:** standardize dark mode styling across pages and shared components ([#106](https://github.com/XCO-Agency/Laravel-SAAS-Starter/pull/106))
* **ui:** fix dark-mode contrast by flipping light-only literals to semantic tokens ([#110](https://github.com/XCO-Agency/Laravel-SAAS-Starter/pull/110))

## [0.1.4](https://github.com/XCO-Agency/Laravel-SAAS-Starter/compare/v0.1.3...v0.1.4) (2026-07-04)


### Features

* **tickets:** priority enum cast and urgent-first ticket sorting ([6e7ef7b](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/6e7ef7ba887bc2c3116b0da4a744be7923a09218))


### Bug Fixes

* guard priority sort column and expose request_id attribute ([04ff439](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/04ff4391de140e83e3c736aa86a6fcc783de80e5))

## [0.1.3](https://github.com/XCO-Agency/Laravel-SAAS-Starter/compare/v0.1.2...v0.1.3) (2026-07-04)


### Features

* add RequestId middleware (X-Request-Id) with log context ([601f5ba](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/601f5ba9f5244e97c5de2d4ee0487d7911c9facb))
* add RequestId middleware for request correlation ([fd8fea2](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/fd8fea2bafc1ddca3cb82c426a435f029701e83a))
* add RequestId middleware for request correlation, closes [#74](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/74) ([f8448b4](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/f8448b486759f984dc3c5f3b640d703c1f1aa12f))
* add RequestId middleware for request correlation, closes [#75](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/75) ([91a3a8e](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/91a3a8e414bceb2dcfd6b1e3c30f106c1151238f))
* add unauthenticated GET /api/health endpoint ([b4e2fa6](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/b4e2fa66b699efeab0d0db755827a88e3bd72090))
* add unauthenticated GET /api/health endpoint, closes [#72](https://github.com/XCO-Agency/Laravel-SAAS-Starter/issues/72) ([f583e6a](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/f583e6a3770e4126c272d711421556f6eb329bb5))


### Bug Fixes

* echo X-Request-Id on error responses and use Context facade ([596cfe6](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/596cfe6c5602a6429615e433f659f2d8494fe17f))

## [0.1.2](https://github.com/XCO-Agency/Laravel-SAAS-Starter/compare/v0.1.1...v0.1.2) (2026-04-04)


### Features

* add product tour component to dashboard and implement tour completion endpoint ([78c9ebe](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/78c9ebe6869c77fc0bd86cd5f4a17df1902c0633))
* **billing:** add usage trend chart component and integrate into billing pages ([8d2fa77](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/8d2fa77c56109d8227fe58b629389fbfd15bbdbc))
* **config:** add serializable_classes option to cache configuration ([3060ddb](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/3060ddbe9c591341a1c3f876494665fe0a82dcdf))
* create public status page to display system status and incidents ([78c9ebe](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/78c9ebe6869c77fc0bd86cd5f4a17df1902c0633))
* **docs:** update README and feature documentation; add global announcements, connected accounts, and workspace retention insights; remove user session management and update related links ([8b355ef](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/8b355ef9710eea5b78a0fd51965d26061ac8626b))
* enhance workspace security settings with allowed email domains restriction ([78c9ebe](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/78c9ebe6869c77fc0bd86cd5f4a17df1902c0633))
* implement weekly workspace activity digest notifications ([78c9ebe](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/78c9ebe6869c77fc0bd86cd5f4a17df1902c0633))
* **settings:** update security routes and components for two-factor authentication ([24d1c04](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/24d1c04fd01b38143d31d556ade935737239f))


### Bug Fixes

* **sanctum:** replace ValidateCsrfToken middleware with PreventRequestForgery ([3060ddb](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/3060ddbe9c591341a1c3f876494665fe0a82dcdf))
* **workflows:** downgrade actions versions to v4 for consistency ([dea21b0](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/dea21b0932ae60b7b882aefa2a088384817b8d20))

## [0.1.1](https://github.com/XCO-Agency/Laravel-SAAS-Starter/compare/v0.1.0...v0.1.1) (2026-03-12)


### Features

* add a complete support ticket system with dedicated admin and user interfaces. ([5a81cc0](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/5a81cc0b76fbf112fbae3f81609ea2c5e120c537))
* add accent color customization for workspaces ([8df5c7f](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/8df5c7face282050f20da39360d006065b5234fe))
* Add admin audit log feature with dedicated controller, frontend page, and tests for viewing, searching, and filtering activities. ([c9d466c](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/c9d466c488b7dce36555c25c955f24d9fbd40a03))
* Add admin workspace management and audit log features, and enhance the dashboard with new SaaS metrics. ([acfd89c](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/acfd89c699636e9c6348ae3f2b74268afa0329a1))
* add AI continuous development roadmap with workflow instructions and tasks ([9d076fc](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/9d076fc153a8d177e0d60b66478b43354b979397))
* Add billing notification preference and enhance the security notification UI with a tooltip. ([f2abedd](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/f2abedd9c2272520ee2d5310a36eec7edbcc8445))
* add comprehensive feature tests for the `EnsurePasswordNotExpired` middleware. ([5b6c39f](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/5b6c39fe0cd0617cc28b1ddd18e62d69ccde9d45))
* Add data retention management with admin UI and implement seat-based billing limits. ([12b747f](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/12b747f819c2237fb6a8786adaa8b8de3bc3f5a2))
* Add Docker support and Octane configuration for improved performance ([f8a349b](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/f8a349bf7296645d60682ba8ac0c8ce18e554651))
* add documentation for login activity, maintenance mode, and workspace branding, update roadmap, and seed related data. ([4505f01](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/4505f01d90a4d5faa44c454eeb5ccde534b4fdf3))
* Add fade-in-up animation and enhance styling for the billing period toggle on the plans page. ([5e1e560](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/5e1e560fff56d69b7598d5a1c48bb24bb90ceefe))
* Add mandatory 2FA enforcement for super-admins and enhance the admin dashboard with new analytics widgets. ([6893581](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/6893581c47c4c5e90c7194bfe5aeea4483557ca0))
* add notification delivery analytics feature with logging, metrics, and admin interface ([c27c52c](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/c27c52c59e22e13779132e980afc50b3932d6342))
* add optional billing step to onboarding process ([bb652ea](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/bb652ea038247ad59d8843fe8dc392dccfe70ddf))
* Add PHP and required extensions for wayfinder plugin in Dockerfile ([10d16a2](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/10d16a28036646a01d91d80feecded6504814913))
* add super-admin localization management portal (Task 93) ([f83a702](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/f83a702559b08daf08abcb8fd18e7e6ededbee98))
* add superadmin user impersonation functionality with UI and tests ([e9142c2](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/e9142c21a9be8486d9eba370bbf72de9b85ccba1))
* Allow updating user bio and timezone in profile settings. ([00039e4](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/00039e4fbff18d49ba49a68c512f06a19163af7f))
* Conditionally initialize Laravel Echo and Pusher only if `VITE_REVERB_APP_KEY` is defined. ([495cfa5](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/495cfa53a37b5bda3d721aee3aef2c017dc3dcb2))
* Display developer quick login in all environments by removing the development environment condition. ([5b25508](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/5b25508d622be7363d1ee362d2f5013cfe7e2d5f))
* Enhance database seeding to include superadmin users, API tokens, webhook endpoints, and historical activity logs. ([4a77949](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/4a7794925f99f337e0b910d6fe19b46a0dcc4b7b))
* Enhance DatabaseSeeder for comprehensive user and workspace setup ([093ea29](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/093ea2949044c846f7d747ccf8982c9e1cab1982))
* Enhance workspace API responses with direct JSON, add new seed data for announcements, feature flags, and webhook logs, and expand documentation. ([340bc33](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/340bc334f35ea51fb5f631c41c174865aead2b4c))
* Implement a comprehensive notification system with API, UI, database, and dedicated tests. ([53a812c](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/53a812cd63d0479ac99eb1af20cb99f46328da8a))
* implement admin broadcast messaging system with UI, database, and notification dispatch. ([086507a](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/086507a0a18d634d97b043e66702a37bb4fb0320))
* Implement admin user API token management ([746535e](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/746535e627d1bf1aa1cf6852043b5795bc2cdb53))
* implement an announcement management system with an admin interface, API, database migration, and a user-facing banner component. ([7f37680](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/7f37680245327e0b70312fb9c8a6c33e5f50b230))
* Implement API token management using Laravel Sanctum, including UI, backend, and database migrations. ([961aeb0](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/961aeb045c9fed14bf028f41da8afb948c895365))
* Implement avatar upload functionality with a new React component and refactor image URL accessors in models. ([6aba16c](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/6aba16cf4c8a7225454c43d55857c0ec7d9a12ce))
* Implement comprehensive impersonation logging with a dedicated admin interface, database migration, and feature tests. ([2d12dbc](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/2d12dbc8f6e24bdbb294dfd0b0e79a94c49fae01))
* Implement comprehensive SEO metadata management with dedicated admin UI and add documentation for account deletion, impersonation, and usage dashboard. ([9de4284](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/9de4284d5648a50ac2c152ceac941986f9e96c83))
* Implement feature flag management with Laravel Pennant and an administrative UI. ([8e5e4c7](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/8e5e4c7e7f728c005cee094665644cfabe3c456e))
* Implement global search functionality using Laravel Scout for various models. ([2d08b78](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/2d08b783282832b05e8358740c50b6b587b9c416))
* implement granular roles and permissions for team management ([bb652ea](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/bb652ea038247ad59d8843fe8dc392dccfe70ddf))
* Implement granular workspace roles including Owner, Admin, Member, and Viewer. ([b7ded13](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/b7ded134f3b5b6b389ff91f545f5b9b9032910d1))
* implement in-app user feedback widget with submission types and an admin review panel with filtering and actions. ([e7de3ef](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/e7de3ef0567062f6295b14331236073640a41484))
* Implement invoice PDF download functionality and update billing invoice links to use the new route. ([f69d743](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/f69d7438fee3035278485a8ec2e016e85d4e7ccb))
* Implement magic link authentication, workspace IP allowlist, and a cookie consent banner. ([dda1035](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/dda1035479b6187b3c54f56d8c019005e557bd4c))
* Implement new feature tests for workspace management, plan limits, and invitations, and update workspace owner when role changes. ([08b6153](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/08b6153da72d1ec3e62a2616ed9786fca8fa93a8))
* Implement password expiry functionality with middleware, configuration, and password update timestamping. ([4c7eaec](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/4c7eaec5d5bd4f08936e26c84302c92157268a38))
* Implement session management, API key authentication, and an onboarding checklist. ([694983c](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/694983cc5172a4cec1756e711fbbf95e61e3b7a1))
* Implement social login with GitHub and Google, and add comprehensive workspace activity logging. ([651a459](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/651a459aec745634458152ffbbe208d12baa3e2f))
* Implement soft deletion for users and workspaces, including admin panel management and restoration. ([55a2912](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/55a2912cfe08d93939bb598322d6fb2fe4bbca69))
* Implement team invite-link capacity UX synchronization and backend member-limit checks ([f1b9d3c](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/f1b9d3c8a8ee363d25f5af09d564f04e77e15fb0))
* Implement usage dashboard with plan limits, add SEO metadata management, and enhance account deletion functionality. ([0843655](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/084365559b623b58ede4a134987a1064c754773c))
* Implement user avatar management and personal data export functionality. ([29dd355](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/29dd355dc36c41aa59d576f39418febefb316768))
* Implement user bio, timezone, and avatar management, alongside a new notification preferences system. ([0b26059](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/0b260593b391317898df5356cf38c2c4e289e2a4))
* Implement user onboarding wizard with `onboarded_at` timestamp and dedicated middleware, deferring initial workspace creation. ([329e094](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/329e094159356a0e8da8291177bfe0964bf77120))
* Implement user preferences for date format and timezone, and introduce workspace suspension with dedicated routes and documentation. ([1d65151](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/1d65151bf28e5aa1e2ebc2a1dd6401b0db2e6c12))
* Implement webhook dispatching for workspace and subscription events, add maintenance mode IP whitelisting, and introduce password expiration. ([dfc2e02](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/dfc2e024c98715039df342de32aa754190c86454))
* Implement webhook logging and admin mail template management with dedicated UI and documentation. ([a0cbda9](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/a0cbda9cf14aa6c005ce22ed113893e0bc1cf7bc))
* Implement workspace API key management, admin system health monitoring, scheduled tasks monitoring, and public/admin changelog features. ([4f28620](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/4f286205834f9f64a80fba9fc866f211f64161f3))
* Implement workspace data export, API endpoints with Scribe documentation, and real-time broadcasting with Laravel Reverb. ([0a33a7b](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/0a33a7b732a5e87140c1c593406ae0a65661fba7))
* Implement workspace invite links, login activity logging, and an admin maintenance page. ([28a7e85](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/28a7e8591e937452bc11f549e937df155ab9fda8))
* Implement workspace suspension functionality including admin management, dedicated middleware, and feature tests. ([fecdaa1](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/fecdaa19289c15a1c67750e46bb666f059cf0225))
* Implement workspace trash, workspace suspension, and password history features. ([44d8797](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/44d8797b4d7a52a0e75592359147f46a7516e0bb))
* Implement workspace webhook endpoint management and Sentry integration. ([3532713](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/353271345c5bf39657f632222606697451bb1f22))
* Implement workspace-level 2FA enforcement with new settings, middleware, dedicated pages, and documentation. ([cba2549](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/cba2549f60eae4ca82c81cafa840777e28653f57))
* Integrate Laravel Reverb as the broadcasting driver and update frontend to use `@laravel/echo-react` for real-time notifications. ([ee143a8](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/ee143a86f126b3357d7537690493bd0d913ed5f3))
* Integrate Sentry for comprehensive frontend and backend error monitoring. ([1df8870](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/1df8870da3a5ab3dcea5bb0879c7342a5ad71787))
* Introduce a global command palette for quick navigation and actions, activated by Cmd+K or search buttons in the app header and sidebar. ([89929c5](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/89929c5a7c598f478c8c52ae9cdb86eebc8a310a))
* introduce a new help tooltip component, add admin user analytics, and enhance workspace activity filtering. ([58a9bda](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/58a9bdaaab49fa4b4d90f7c6cd622182f6f08c3e))
* Introduce admin panel for user management, including listing, promoting, and deleting users, and refine workspace invitation acceptance logic. ([753d5f7](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/753d5f7b8d5232d4a309557a7cfc8110523cce08))
* Introduce an admin dashboard, superadmin role, user locale management, and Stripe webhook testing. ([3575793](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/3575793d020d90f1ca1e850c094cd059e0d709e3))
* Introduce comprehensive feature tests for locale management, Stripe webhooks, and admin dashboard, alongside an AI development roadmap. ([5b8208e](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/5b8208e893b3554bbc5917c0980e0c4c0c1db22d))
* Introduce comprehensive landing page components and refine workspace, invitation, and billing logic. ([2fb5254](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/2fb52549ef26daeb9fe7a8f69c4a40b70ffdba0b))
* introduce dynamic email templates feature with new documentation and multi-language support. ([4afcb2b](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/4afcb2b09d8830e271c79e28dc4872dfb2d5d094))
* Introduce granular permissions for workspace members and implement authorization policies. ([c79ba65](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/c79ba65c3b3b0a4b044a795ae0959f14182f0c1a))
* Introduce Laravel AI and MCP packages, adding agent stubs, conversation migration, and AI configuration. ([a92d7bc](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/a92d7bc66527c377cd80783b97e4f42da4eecefd))
* normalize notification preferences with channel controls ([bb652ea](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/bb652ea038247ad59d8843fe8dc392dccfe70ddf))
* Update Dockerfile to include dev dependencies and environment setup for wayfinder plugin ([809b139](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/809b139d617eabfcced0d7b5d854448728952470))


### Bug Fixes

* Update database configuration for SSL compatibility ([575e894](https://github.com/XCO-Agency/Laravel-SAAS-Starter/commit/575e89456f94195b6a6c0e24c755bd5a1b3f2bce))
