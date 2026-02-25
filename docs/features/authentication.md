# Authentication & Access Control

## Overview

The application handles authentication using **Laravel Fortify** as a headless authentication backend, coupled with a custom React/Inertia frontend. It provides a robust, secure, and fully-featured authentication flow.

## Core Features

- **Registration & Login**: Standard email/password authentication.
- **Email Verification**: Users must verify their email addresses before accessing the core dashboard (enforced via the `verified` middleware).
- **Password Reset**: Secure forgot password and reset flows.
- **Two-Factor Authentication (2FA)**: High-security TOTP (Time-based One-Time Password) implementation via Laravel Fortify, complete with recovery codes.
- **Profile Management**: Users can update their name, email, and password from the `/settings/profile` page.
- **Global Auth State**: The authenticated user object is shared globally via `HandleInertiaRequests` middleware (`$page.props.auth.user`), providing immediate access to user state across all React components.

## Technical Implementation

- **Backend:** `config/fortify.php` controls enabled features. Core logic is handled by Fortify's configurable action classes in `app/Actions/Fortify`.
- **Frontend:** Auth pages (Login, Register, Forgot Password, Two Factor Challenge) are built using Inertia `useForm` hooks and reside in `resources/js/pages/auth/`.
- **Protection:** All internal routes are protected by the `auth` and `verified` middleware groups in `routes/web.php`.

## Two-Factor Authentication Flow

1. User navigates to Settings > Security.
2. User clicks "Enable 2FA" and confirms their password.
3. User scans the generated QR code with an authenticator app (e.g., Google Authenticator, Authy).
4. User enters the OTP code to confirm and finalize 2FA enablement.
5. User boundary is presented with recovery codes to store securely.
6. Subsequent logins will prompt for the OTP or a recovery code after password verification.
