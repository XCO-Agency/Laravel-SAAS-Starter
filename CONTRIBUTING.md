# Contributing to Laravel SAAS Starter

Thank you for your interest in contributing to Laravel SAAS Starter! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/laravel-saas-starter.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Submit a pull request

## Development Setup

Follow the installation instructions in the [README.md](README.md) to set up your local development environment.

## Code Style

### PHP (Backend)

We use [Laravel Pint](https://laravel.com/docs/pint) for PHP code formatting. Before committing, run:

```bash
vendor/bin/pint
```

Or use the composer script:

```bash
composer pint
```

**PHP Guidelines:**
- Use PHP 8.2+ features
- Follow PSR-12 coding standards
- Use type hints for all method parameters and return types
- Use constructor property promotion when appropriate
- Prefer Eloquent relationships over raw queries
- Use Form Request classes for validation

### JavaScript/TypeScript (Frontend)

We use [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) for code formatting and linting.

**Format code:**
```bash
npm run format
# or
pnpm format
```

**Lint code:**
```bash
npm run lint
# or
pnpm lint
```

**Type checking:**
```bash
npm run types
# or
pnpm types
```

**JavaScript/TypeScript Guidelines:**
- Use TypeScript for all new files
- Follow React best practices
- Use functional components with hooks
- Prefer named exports
- Use Inertia.js patterns for navigation and forms
- Add translations for all user-facing text

## Testing

We use [Pest PHP](https://pestphp.com/) for testing. All new features should include tests.

**Run all tests:**
```bash
php artisan test
```

**Run specific test file:**
```bash
php artisan test tests/Feature/YourTest.php
```

**Run tests with filter:**
```bash
php artisan test --filter=testName
```

**Testing Guidelines:**
- Write feature tests for all new functionality
- Test happy paths, failure paths, and edge cases
- Use factories for creating test data
- Use `RefreshDatabase` trait when needed
- Mock external services

## Pull Request Process

1. **Update Documentation**: If you're adding features, update the README.md
2. **Add Tests**: Ensure all new features have test coverage
3. **Run Tests**: Make sure all tests pass locally
4. **Format Code**: Run Pint, Prettier, and ESLint before committing
5. **Write Clear Commit Messages**: Use descriptive commit messages
6. **Update CHANGELOG**: If applicable, add an entry to CHANGELOG.md
7. **Create Pull Request**: Provide a clear description of your changes

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Tested manually

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

## Commit Messages

Use clear, descriptive commit messages:

**Good:**
```
Add workspace invitation email notification
Fix Stripe webhook validation issue
Update README with installation instructions
```

**Bad:**
```
fix stuff
updates
WIP
```

## Project Structure

- `app/` - Laravel application code
- `database/` - Migrations, factories, seeders
- `resources/js/` - React/TypeScript frontend code
- `routes/` - Application routes
- `tests/` - Pest test files
- `config/` - Configuration files

## Questions?

If you have questions or need help:
- Open an issue on GitHub
- Contact us at support@xco.agency

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Laravel SAAS Starter! 🚀

