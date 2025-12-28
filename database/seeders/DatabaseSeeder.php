<?php

namespace Database\Seeders;

use App\Models\User;
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

            // 2. Create additional users (15-18 more) with varied attributes
            $users = collect([$admin, $demo]);

            // Create users with different locales and verification statuses
            $locales = ['en', 'fr', 'es', 'de'];
            $additionalUsers = User::factory(16)->create([
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

            // 4. Create team workspaces with realistic names
            $teamWorkspaceNames = [
                'Acme Corporation',
                'Tech Startup Inc',
                'Digital Solutions LLC',
                'Creative Agency',
                'Global Enterprises',
                'Innovation Labs',
                'Future Systems',
            ];

            $teamWorkspaces = collect();
            $workspaceOwners = $users->random(min(7, $users->count()));

            foreach ($teamWorkspaceNames as $index => $name) {
                if ($index < $workspaceOwners->count()) {
                    $owner = $workspaceOwners->get($index);
                    $workspace = $workspaceService->create($owner, [
                        'name' => $name,
                    ]);

                    // Set some workspaces with trial periods
                    if ($index % 2 === 0) {
                        $workspace->update(['trial_ends_at' => now()->addDays(14)]);
                    }

                    $teamWorkspaces->push($workspace);
                }
            }

            // 5. Add members to team workspaces with different roles
            foreach ($teamWorkspaces as $workspace) {
                $owner = $workspace->owner;
                $availableUsers = $users->reject(fn ($user) => $user->id === $owner->id);

                // Determine team size based on workspace index
                $teamSize = match ($teamWorkspaces->search($workspace) % 4) {
                    0 => 1, // Just owner
                    1 => 3, // Small team (2-3 members)
                    2 => 6, // Medium team (5-6 members)
                    default => 10, // Large team (9-10 members)
                };

                $membersToAdd = min($teamSize - 1, $availableUsers->count());
                $selectedMembers = $availableUsers->random($membersToAdd);

                foreach ($selectedMembers as $index => $member) {
                    $role = match (true) {
                        $index === 0 && $teamSize > 3 => 'admin', // First member in larger teams gets admin
                        $index === 1 && $teamSize > 6 => 'admin', // Second member in large teams gets admin
                        default => 'member',
                    };

                    $workspace->addUser($member, $role);
                }
            }

            // 6. Create workspace invitations (mix of active and expired, different roles)
            $invitations = collect();

            foreach ($teamWorkspaces->take(5) as $workspace) {
                // Create 2-3 invitations per workspace
                $invitationCount = rand(2, 3);

                for ($i = 0; $i < $invitationCount; $i++) {
                    // Mix of existing users and new emails
                    $email = $i % 2 === 0
                        ? $users->random()->email
                        : fake()->unique()->safeEmail();

                    $role = $i === 0 ? 'admin' : 'member';
                    $isExpired = $i === 1 && rand(0, 1) === 1; // Some expired invitations

                    $invitation = WorkspaceInvitation::create([
                        'workspace_id' => $workspace->id,
                        'email' => $email,
                        'role' => $role,
                        'expires_at' => $isExpired ? now()->subDay() : now()->addDays(7),
                    ]);

                    $invitations->push($invitation);
                }
            }

            // 7. Set some users' current workspace to team workspaces (for variety)
            $usersToSwitch = $users->random(min(5, $users->count()));

            foreach ($usersToSwitch as $user) {
                $availableWorkspaces = $teamWorkspaces->filter(function ($workspace) use ($user) {
                    return $workspace->hasUser($user);
                });

                if ($availableWorkspaces->isNotEmpty()) {
                    $user->switchWorkspace($availableWorkspaces->random());
                }
            }
        });
    }
}
