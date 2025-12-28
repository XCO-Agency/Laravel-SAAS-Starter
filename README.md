# Laravel SAAS Starter

> A production-ready Laravel SaaS starter kit with authentication, billing, teams, and everything you need to launch faster.

**Built by [XCO Agency](https://xco.agency)**

## 🚀 Features

- **🔐 Authentication & 2FA** - Complete auth system with login, register, password reset, email verification, and two-factor authentication
- **🏢 Multi-tenant Workspaces** - Built-in workspace management allowing users to create and switch between multiple organizations
- **👥 Team Management** - Invite team members, assign roles (owner, admin, member), and manage permissions with ease
- **💳 Stripe Billing** - Full Stripe integration with subscriptions, invoices, billing portal, and multiple pricing tiers
- **🌍 Internationalization** - Multi-language support with RTL layouts. Easily add new languages and translations
- **🌙 Dark Mode** - Beautiful light and dark themes with system preference detection and manual toggle
- **🛡️ Security First** - Built with security best practices including CSRF protection, rate limiting, and secure sessions
- **⚡ Modern Stack** - Laravel 12, Inertia.js v2, React 19, and Tailwind CSS v4 for a blazing-fast developer experience
- **🎨 Beautiful UI** - Pre-built components with shadcn/ui design system. Fully customizable and accessible

## 📋 Requirements

- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm/pnpm
- SQLite, MySQL, or PostgreSQL
- Stripe account (for billing features)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xco-agency/laravel-saas-starter.git
   cd laravel-saas-starter
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Configure your `.env` file**
   ```env
   APP_NAME="Laravel SAAS Starter"
   APP_URL=http://localhost:8000
   
   DB_CONNECTION=sqlite
   # or use MySQL/PostgreSQL
   # DB_CONNECTION=mysql
   # DB_HOST=127.0.0.1
   # DB_PORT=3306
   # DB_DATABASE=your_database
   # DB_USERNAME=your_username
   # DB_PASSWORD=your_password
   
   # Stripe Configuration (required for billing)
   STRIPE_KEY=your_stripe_key
   STRIPE_SECRET=your_stripe_secret
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```

6. **Run migrations**
   ```bash
   php artisan migrate
   ```

7. **Build frontend assets**
   ```bash
   npm run build
   # or
   pnpm build
   ```

8. **Start the development server**
   ```bash
   composer run dev
   # or separately:
   php artisan serve
   npm run dev
   ```

## 🎯 Quick Start

After installation, you can:

1. Visit `http://localhost:8000` to see the landing page
2. Register a new account
3. Create your first workspace
4. Invite team members
5. Set up billing with Stripe

## 🧪 Testing

Run the test suite using Pest:

```bash
php artisan test
```

Run specific test files:

```bash
php artisan test tests/Feature/Auth/LoginTest.php
```

## 📚 Tech Stack

- **Backend**: Laravel 12
- **Frontend**: React 19 with Inertia.js v2
- **Styling**: Tailwind CSS v4
- **Authentication**: Laravel Fortify
- **Billing**: Laravel Cashier (Stripe)
- **Testing**: Pest PHP v4
- **Code Quality**: Laravel Pint, Prettier, ESLint

## 🏗️ Project Structure

```
├── app/
│   ├── Actions/          # Fortify actions
│   ├── Http/
│   │   ├── Controllers/   # Application controllers
│   │   ├── Middleware/    # Custom middleware
│   │   └── Requests/      # Form request validation
│   ├── Models/            # Eloquent models
│   ├── Services/          # Business logic services
│   └── Providers/         # Service providers
├── database/
│   ├── factories/         # Model factories
│   ├── migrations/        # Database migrations
│   └── seeders/           # Database seeders
├── resources/
│   ├── js/
│   │   ├── components/    # React components
│   │   ├── layouts/       # Page layouts
│   │   ├── pages/          # Inertia pages
│   │   └── locales/        # i18n translations
│   └── css/               # Global styles
└── tests/                 # Pest tests
```

## 🔧 Configuration

### Workspace Management

Workspaces are multi-tenant organizations. Users can:
- Create multiple workspaces
- Switch between workspaces
- Invite team members to workspaces
- Assign roles (owner, admin, member)

### Billing

Configure Stripe in your `.env` file. The application supports:
- Subscription management
- Multiple pricing tiers
- Billing portal access
- Webhook handling

### Internationalization

Add new languages by:
1. Creating translation files in `resources/js/locales/`
2. Adding the locale to your configuration
3. Updating the language selector component

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

This project is open-sourced software licensed under the [MIT license](LICENSE).

## 🙏 Credits

Built with ❤️ by [XCO Agency](https://xco.agency)

## 📞 Support

For support, please open an issue on GitHub or contact us at [support@xco.agency](mailto:support@xco.agency)

---

**Ready to build your SaaS?** Get started today and launch 10x faster! 🚀

