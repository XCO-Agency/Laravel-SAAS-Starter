<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Services\WorkspaceService;
use App\Models\WebhookEndpoint;
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
            $additionalUsers->each(function ($user, $index) use ($locales) {
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
            $users->each(function ($user) use ($workspaceService) {
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
            $otherUsers = $users->reject(fn ($user) => $user->id === $demo->id);

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
                        'url' => 'https://webhook.site/' . fake()->uuid(),
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

                for ($i = 0; $i < $invitationCount; $i++) {
                    // Mix of existing users and new emails
                    $email = $i % 2 === 0
                        ? $otherUsers->random()->email
                        : fake()->unique()->safeEmail();

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
                    $members = $users->reject(fn ($user) => $user->id === $owner->id)->random(rand(2, 5));
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
        });
    }
}
