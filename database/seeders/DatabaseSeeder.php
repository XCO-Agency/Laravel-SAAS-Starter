<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\WebhookEndpoint;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Services\WorkspaceService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $workspaceService = app(WorkspaceService::class);

            // 1. Create admin and demo users
            $admin = User::firstOrCreate(
                ['email' => 'admin@example.com'],
                [
                    'name' => 'Admin User',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'locale' => 'en',
                ]
            );

            $demo = User::firstOrCreate(
                ['email' => 'demo@example.com'],
                [
                    'name' => 'Demo User',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'locale' => 'en',
                ]
            );

            // 1.5. Create Superadmin User
            $superadmin = User::firstOrCreate(
                ['email' => 'superadmin@example.com'],
                [
                    'name' => 'Superadmin System',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'locale' => 'en',
                    'is_superadmin' => true,
                ]
            );

            // 1.6 Generate API Tokens for Core Users
            $admin->createToken('Desktop App Token')->plainTextToken;
            $demo->createToken('CLI Access Token')->plainTextToken;
            $demo->createToken('Mobile Client', ['read'])->plainTextToken;
            $superadmin->createToken('Integration Agent')->plainTextToken;

            // 2. Create additional users (20+ users) for team memberships
            $users = collect([$admin, $demo, $superadmin]);

            // Create users with different locales and verification statuses
            $locales = ['en', 'fr', 'es', 'de'];
            $additionalUsers = User::factory(20)->create([
                'password' => Hash::make('password'),
            ]);

            // Set varied attributes for additional users
            $additionalUsers->each(function (User $user, int $index) use ($locales) {
                // Mix of verified and unverified
                if ($index % 3 === 0) {
                    $user->update(['email_verified_at' => null]);
                }

                // Set different locales
                $user->update(['locale' => $locales[$index % count($locales)]]);

                // Some users without 2FA
                if ($index % 4 === 0) {
                    $user->update([
                        'two_factor_secret' => null,
                        'two_factor_recovery_codes' => null,
                        'two_factor_confirmed_at' => null,
                    ]);
                }
            });

            $users = $users->merge($additionalUsers);

            // 3. Create personal workspaces for all users
            $users->each(function (User $user) use ($workspaceService) {
                $workspaceService->createPersonalWorkspace($user);
            });

            // 4. DEMO ACCOUNT: Create multiple workspaces owned by demo user
            $demoWorkspaceNames = [
                'Acme Corporation', // Free plan workspace
                'Tech Startup Inc', // Pro plan workspace (with trial)
                'Digital Solutions LLC', // Business plan workspace
                'Creative Agency', // Small team workspace
                'Global Enterprises', // Large team workspace
            ];

            $demoWorkspaces = collect();
            $otherUsers = $users->reject(fn (User $user) => $user->id === $demo->id);

            foreach ($demoWorkspaceNames as $index => $name) {
                $workspace = $workspaceService->create($demo, [
                    'name' => $name,
                ]);

                // Set different trial/plan scenarios for demo workspaces
                match ($index) {
                    0 => null, // Free plan - no trial
                    1 => $workspace->update(['trial_ends_at' => now()->addDays(10)]), // Pro plan with active trial
                    2 => $workspace->update(['trial_ends_at' => now()->addDays(5)]), // Business plan with shorter trial
                    default => $workspace->update(['trial_ends_at' => now()->addDays(14)]), // Others with full trial
                };

                // Add sample Webhooks to some Demo Workspaces
                if ($index % 2 === 0) {
                    WebhookEndpoint::create([
                        'workspace_id' => $workspace->id,
                        'url' => 'https://webhook.site/'.fake()->uuid(),
                        'events' => ['workspace.updated', 'member.added'],
                        'is_active' => true,
                        'secret' => \Illuminate\Support\Str::random(32),
                    ]);

                    if ($index === 2) {
                        // Add a disabled secondary hook
                        WebhookEndpoint::create([
                            'workspace_id' => $workspace->id,
                            'url' => 'https://legacy-crm.example.com/ingest',
                            'events' => ['member.removed'],
                            'is_active' => false,
                            'secret' => \Illuminate\Support\Str::random(32),
                        ]);
                    }
                }

                // Append historical Activity Logs demonstrating tracking timeline
                activity()
                    ->performedOn($workspace)
                    ->causedBy($demo)
                    ->createdAt(now()->subDays(rand(1, 30)))
                    ->log('created');

                activity()
                    ->performedOn($workspace)
                    ->causedBy($demo)
                    ->createdAt(now()->subDays(rand(1, 15)))
                    ->log('updated');

                $demoWorkspaces->push($workspace);
            }

            // 5. DEMO ACCOUNT: Add team members to demo workspaces with different configurations
            foreach ($demoWorkspaces as $index => $workspace) {
                $availableUsers = $otherUsers->shuffle();

                // Different team configurations for each workspace
                $teamConfig = match ($index) {
                    0 => ['size' => 2, 'admins' => 0], // Free plan - just 2 members (at limit)
                    1 => ['size' => 5, 'admins' => 1], // Pro plan - 5 members with 1 admin
                    2 => ['size' => 12, 'admins' => 2], // Business plan - 12 members with 2 admins
                    3 => ['size' => 3, 'admins' => 0], // Small team - 3 members
                    4 => ['size' => 15, 'admins' => 3], // Large team - 15 members with 3 admins
                    default => ['size' => 6, 'admins' => 1], // Default - 6 members with 1 admin
                };

                $membersToAdd = min($teamConfig['size'], $availableUsers->count());
                $selectedMembers = $availableUsers->take($membersToAdd);

                foreach ($selectedMembers as $memberIndex => $member) {
                    $role = match (true) {
                        $memberIndex < $teamConfig['admins'] => 'admin',
                        default => 'member',
                    };

                    $workspace->addUser($member, $role);
                }
            }

            // 6. DEMO ACCOUNT: Create workspace invitations for demo workspaces
            foreach ($demoWorkspaces as $index => $workspace) {
                // Create multiple invitations per workspace
                $invitationCount = match ($index) {
                    4 => 5, // Global Enterprises - many invitations
                    2 => 4, // Business workspace - several invitations
                    default => rand(2, 3), // Others - 2-3 invitations
                };

                $usedEmails = [];

                for ($i = 0; $i < $invitationCount; $i++) {
                    do {
                        $email = $i % 2 === 0
                            ? $otherUsers->random()->email
                            : fake()->unique()->safeEmail();
                    } while (in_array($email, $usedEmails));

                    $usedEmails[] = $email;

                    $role = match (true) {
                        $i === 0 && $index > 2 => 'admin', // First invitation in larger workspaces can be admin
                        default => 'member',
                    };

                    // Mix of active and expired invitations
                    $isExpired = $i === 1 && rand(0, 1) === 1;

                    WorkspaceInvitation::create([
                        'workspace_id' => $workspace->id,
                        'email' => $email,
                        'role' => $role,
                        'expires_at' => $isExpired ? now()->subDay() : now()->addDays(7),
                    ]);
                }
            }

            // 7. Create additional team workspaces owned by other users (for variety)
            $otherWorkspaceNames = [
                'Startup Hub',
                'Design Studio',
                'Marketing Agency',
                'Consulting Group',
            ];

            $otherWorkspaces = collect();
            $otherOwners = $otherUsers->random(min(4, $otherUsers->count()));

            foreach ($otherWorkspaceNames as $index => $name) {
                if ($index < $otherOwners->count()) {
                    $owner = $otherOwners->get($index);
                    $workspace = $workspaceService->create($owner, [
                        'name' => $name,
                    ]);

                    // Add some members to these workspaces too
                    $members = $users->reject(fn (User $user) => $user->id === $owner->id)->random(rand(2, 5));
                    foreach ($members as $member) {
                        $workspace->addUser($member, 'member');
                    }

                    $otherWorkspaces->push($workspace);
                }
            }

            // 8. DEMO ACCOUNT: Add demo user as member to some other workspaces (not owner)
            $workspacesForDemo = $otherWorkspaces->random(min(2, $otherWorkspaces->count()));
            foreach ($workspacesForDemo as $workspace) {
                $workspace->addUser($demo, 'member');
            }

            // 9. DEMO ACCOUNT: Set demo user's current workspace to first team workspace
            if ($demoWorkspaces->isNotEmpty()) {
                $demo->switchWorkspace($demoWorkspaces->first());
            }

            // 10. Create some invitations for other workspaces too
            foreach ($otherWorkspaces->take(2) as $workspace) {
                WorkspaceInvitation::create([
                    'workspace_id' => $workspace->id,
                    'email' => fake()->unique()->safeEmail(),
                    'role' => 'member',
                    'expires_at' => now()->addDays(7),
                ]);
            }
            // 11. DEMO ACCOUNT: Seed dummy real-time notifications for the primary demo user
            $demo->notifications()->create([
                'id' => \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\SystemMessage',
                'data' => [
                    'title' => 'Welcome to the Platform',
                    'message' => 'Thanks for signing up! Your workspace is ready. Click here to invite your team members.',
                    'action_url' => '/team',
                ],
                'read_at' => null,
            ]);
            $demo->notifications()->create([
                'id' => \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\BillingAlert',
                'data' => [
                    'title' => 'Trial Expiring Soon',
                    'message' => 'Your workspace trial will safely expire in a few days. Pick a plan to guarantee continued access.',
                    'action_url' => '/billing',
                ],
                'read_at' => null,
            ]);
            $demo->notifications()->create([
                'id' => \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\SecurityAlert',
                'data' => [
                    'title' => 'New Login Detected',
                    'message' => 'We detected a login from a new device (Mac OS X - Chrome).',
                    'action_url' => null,
                ],
                'read_at' => now()->subDay(), // Already read
            ]);

            // Seed one for Admin just to have coverage
            $admin->notifications()->create([
                'id' => \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\SystemMessage',
                'data' => [
                    'title' => 'Admin Credentials Provisioned',
                    'message' => 'Your administrative scopes have been successfully hydrated.',
                ],
                'read_at' => null,
            ]);
            // Seed email templates for the admin panel
            (new EmailTemplateSeeder)->run();

            // Seed demo feedback submissions
            $feedbackSamples = [
                ['user' => $demo,  'type' => 'bug',     'message' => 'The workspace settings page scrolls unexpectedly after saving changes on mobile.', 'status' => 'new'],
                ['user' => $demo,  'type' => 'idea',    'message' => 'It would be helpful to have bulk actions for managing team members (e.g., bulk remove or role change).', 'status' => 'reviewed'],
                ['user' => $demo,  'type' => 'general', 'message' => 'Overall the UI is clean and fast. Really enjoying the dark mode!', 'status' => 'reviewed'],
                ['user' => $demo,  'type' => 'bug',     'message' => 'Notification badge count does not reset after clicking "Mark all as read".', 'status' => 'new'],
                ['user' => $demo,  'type' => 'idea',    'message' => 'Would love a CSV export of audit log entries for compliance reporting.', 'status' => 'new'],
                ['user' => $demo,  'type' => 'general', 'message' => 'The onboarding flow is very intuitive. Took me under 2 minutes to set up.', 'status' => 'archived'],
                ['user' => $admin, 'type' => 'bug',     'message' => 'Email template editor loses formatting when switching between HTML and plain text tabs.', 'status' => 'new'],
                ['user' => $admin, 'type' => 'idea',    'message' => 'Add support for Slack/Discord webhook notifications in addition to HTTP endpoints.', 'status' => 'reviewed'],
                ['user' => $admin, 'type' => 'general', 'message' => 'Feature flags integration with Pennant is seamless. Nice work!', 'status' => 'archived'],
                ['user' => $admin, 'type' => 'bug',     'message' => 'The impersonation banner sometimes overlaps the announcement banner on smaller screens.', 'status' => 'reviewed'],
                ['user' => $admin, 'type' => 'idea',    'message' => 'Allow workspace admins to configure their own webhook signing secrets.', 'status' => 'new'],
                ['user' => $admin, 'type' => 'general', 'message' => 'The command palette (⌘K) is a game changer. Very fast to navigate.', 'status' => 'reviewed'],
            ];

            foreach ($feedbackSamples as $sample) {
                \App\Models\Feedback::create([
                    'user_id' => $sample['user']->id,
                    'type' => $sample['type'],
                    'message' => $sample['message'],
                    'status' => $sample['status'],
                    'created_at' => now()->subDays(rand(1, 30)),
                    'updated_at' => now()->subDays(rand(0, 5)),
                ]);
            }

            // Seed public changelog entries
            $changelogSamples = [
                ['version' => '1.0.0', 'title' => 'Initial Release', 'body' => "Workspaces, team management, Stripe billing, and authentication are all live.\n\nThis is the foundation of the platform.", 'type' => 'feature', 'days_ago' => 60],
                ['version' => '1.1.0', 'title' => 'Dark Mode & Internationalization', 'body' => 'Full dark mode support across all pages. Added i18n with English, French, Spanish, and German translations.', 'type' => 'feature', 'days_ago' => 45],
                ['version' => '1.2.0', 'title' => 'Admin Panel & Audit Logs', 'body' => 'Super admin dashboard with user/workspace management, impersonation, and a complete audit log system powered by Spatie Activity Log.', 'type' => 'feature', 'days_ago' => 35],
                ['version' => '1.3.0', 'title' => 'Feature Flags & Announcements', 'body' => 'Laravel Pennant integration for targeted feature rollouts. Global announcement banners with scheduling and dismissal.', 'type' => 'feature', 'days_ago' => 25],
                ['version' => '1.3.1', 'title' => 'Command Palette Performance', 'body' => 'Improved the command palette (⌘K) search speed and added keyboard navigation hints.', 'type' => 'improvement', 'days_ago' => 20],
                ['version' => '1.4.0', 'title' => 'Webhook Delivery Logs', 'body' => 'Track every outbound webhook delivery with status codes, payloads, and response bodies. Retry failed deliveries from the UI.', 'type' => 'feature', 'days_ago' => 15],
                ['version' => '1.4.1', 'title' => 'Notification Badge Fix', 'body' => 'Fixed an issue where the notification badge count did not update after marking all notifications as read.', 'type' => 'fix', 'days_ago' => 12],
                ['version' => '1.5.0', 'title' => 'Seat-Based Billing & 2FA Enforcement', 'body' => 'Workspaces now support seat-based billing with Stripe quantity sync. Admins can enforce two-factor authentication for all workspace members.', 'type' => 'feature', 'days_ago' => 5],
                ['version' => '1.5.1', 'title' => 'System Health Monitor', 'body' => 'New admin page to monitor queue health, failed jobs, storage usage, and infrastructure drivers.', 'type' => 'improvement', 'days_ago' => 1],
            ];

            foreach ($changelogSamples as $sample) {
                \App\Models\ChangelogEntry::create([
                    'version' => $sample['version'],
                    'title' => $sample['title'],
                    'body' => $sample['body'],
                    'type' => $sample['type'],
                    'is_published' => true,
                    'published_at' => now()->subDays($sample['days_ago']),
                ]);
            }

            // Seed SEO metadata entries
            \App\Models\SeoMetadata::create([
                'path' => null,
                'title' => 'Laravel SaaS Starter - Build Your SaaS Faster',
                'description' => 'A production-ready Laravel SaaS starter kit with billing, teams, workspaces, and more.',
                'keywords' => 'laravel, saas, starter, billing, teams, workspaces',
                'og_title' => 'Laravel SaaS Starter',
                'og_description' => 'Build your next SaaS product faster with our production-ready starter kit.',
                'og_type' => 'website',
                'twitter_card' => 'summary_large_image',
                'is_global' => true,
            ]);

            \App\Models\SeoMetadata::create([
                'path' => '/',
                'title' => 'Home - Laravel SaaS Starter',
                'description' => 'Welcome to the Laravel SaaS Starter. Get started with authentication, billing, and team management out of the box.',
                'keywords' => 'homepage, laravel, saas',
                'og_title' => 'Welcome to Laravel SaaS Starter',
                'og_description' => 'Everything you need to launch your SaaS product.',
                'og_type' => 'website',
                'twitter_card' => 'summary_large_image',
                'is_global' => false,
            ]);

            \App\Models\SeoMetadata::create([
                'path' => '/changelog',
                'title' => 'Changelog - Laravel SaaS Starter',
                'description' => 'See what\'s new in the Laravel SaaS Starter. Latest features, improvements, and bug fixes.',
                'keywords' => 'changelog, updates, releases',
                'og_title' => 'Changelog',
                'og_description' => 'Track the latest updates and improvements.',
                'og_type' => 'website',
                'twitter_card' => 'summary',
                'is_global' => false,
            ]);

            // Seed workspace API keys for demo workspaces
            if ($demoWorkspaces->isNotEmpty()) {
                $first = $demoWorkspaces->first();
                \App\Models\WorkspaceApiKey::generateKey($first, $demo, 'Production API', ['read', 'write']);
                \App\Models\WorkspaceApiKey::generateKey($first, $demo, 'CI/CD Pipeline', ['read', 'webhooks']);
                \App\Models\WorkspaceApiKey::generateKey($first, $demo, 'Analytics Reader', ['read', 'billing:read'], now()->addMonths(3));
            }

        });
    }
}
