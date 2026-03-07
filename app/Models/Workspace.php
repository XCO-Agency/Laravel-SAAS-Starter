<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Laravel\Cashier\Billable;
use Laravel\Cashier\Subscription;
use Laravel\Pennant\Concerns\HasFeatures;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Workspace extends Model
{
    /**
     * Role constants.
     */
    public const ROLE_OWNER = 'owner';

    public const ROLE_ADMIN = 'admin';

    public const ROLE_MEMBER = 'member';

    public const ROLE_VIEWER = 'viewer';

    /** @use HasFactory<\Database\Factories\WorkspaceFactory> */
    use Billable, HasFactory, HasFeatures, \Laravel\Scout\Searchable, LogsActivity, SoftDeletes;

    /**
     * Get the indexable data array for the model.
     *
     * @return array<string, mixed>
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => (int) $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
        ];
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'logo',
        'accent_color',
        'owner_id',
        'personal_workspace',
        'require_two_factor',
        'allowed_ips',
        'suspended_at',
        'suspension_reason',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'personal_workspace' => 'boolean',
            'require_two_factor' => 'boolean',
            'trial_ends_at' => 'datetime',
            'allowed_ips' => 'array',
            'suspended_at' => 'datetime',
        ];
    }

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'logo_url',
    ];

    /**
     * Get the options for recording activity.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('workspace');
    }

    /**
     * Scope a query to only include personal workspaces.
     */
    public function scopePersonal($query)
    {
        return $query->where('personal_workspace', true);
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Workspace $workspace) {
            if (empty($workspace->slug)) {
                $workspace->slug = static::generateUniqueSlug($workspace->name);
            }
        });
    }

    /**
     * Generate a unique slug for the workspace.
     */
    public static function generateUniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Get the workspace's logo URL with fallback.
     */
    public function getLogoUrlAttribute(): string
    {
        if ($this->logo) {
            return str_starts_with($this->logo, 'http') ? $this->logo : \Illuminate\Support\Facades\Storage::url($this->logo);
        }

        return 'https://ui-avatars.com/api/?name='.urlencode($this->name).'&color=7F9CF5&background=EBF4FF';
    }

    /**
     * Get the owner of the workspace.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get all users that belong to the workspace.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'workspace_user')
            ->withPivot('role', 'permissions')
            ->withTimestamps();
    }

    /**
     * Get the workspace's invitations.
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(WorkspaceInvitation::class);
    }

    /**
     * Get the workspace's shareable invite links.
     */
    public function inviteLinks(): HasMany
    {
        return $this->hasMany(WorkspaceInviteLink::class);
    }

    /**
     * Get the workspace's API keys.
     */
    public function apiKeys(): HasMany
    {
        return $this->hasMany(WorkspaceApiKey::class);
    }

    /**
     * Get the workspace's outbound webhook endpoints.
     */
    public function webhookEndpoints(): HasMany
    {
        return $this->hasMany(WebhookEndpoint::class);
    }

    /**
     * Get the webhook logs associated with the workspace.
     */
    public function webhookLogs(): HasMany
    {
        return $this->hasMany(WebhookLog::class);
    }

    /**
     * Determine if the given user belongs to the workspace.
     */
    public function hasUser(User $user): bool
    {
        return $this->users()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine if the given user is the owner of the workspace.
     */
    public function isOwnedBy(User $user): bool
    {
        return $this->owner_id === $user->id;
    }

    /**
     * Get the role of a user in the workspace.
     */
    public function getUserRole(User $user): ?string
    {
        $member = $this->users()->where('user_id', $user->id)->first();

        return $member?->pivot->role;
    }

    /**
     * Determine if the given user is an admin (or owner) of the workspace.
     */
    public function userIsAdmin(User $user): bool
    {
        $role = $this->getUserRole($user);

        return in_array($role, [self::ROLE_OWNER, self::ROLE_ADMIN]);
    }

    /**
     * Determine if the given user is a member (or higher) of the workspace.
     */
    public function userIsMember(User $user): bool
    {
        $role = $this->getUserRole($user);

        return in_array($role, [self::ROLE_OWNER, self::ROLE_ADMIN, self::ROLE_MEMBER]);
    }

    /**
     * Determine if the given user is a viewer of the workspace.
     */
    public function userIsViewer(User $user): bool
    {
        return $this->getUserRole($user) === self::ROLE_VIEWER;
    }

    /**
     * Get the explicit sub-tier permissions of a user in the workspace.
     */
    public function getUserPermissions(User $user): array
    {
        $member = $this->users()->where('user_id', $user->id)->first();

        if (! $member || empty($member->pivot->permissions)) {
            return [];
        }

        return json_decode($member->pivot->permissions, true) ?? [];
    }

    /**
     * Determine if a user has a specific granular capability.
     * Owners have all capabilities implicitly. Admins have most capabilities implicitly.
     */
    public function hasPermission(User $user, string $permission): bool
    {
        // 1. Owners can do anything natively
        if ($this->userIsOwner($user)) {
            return true;
        }

        // 2. Viewers have NO write permissions by default, ONLY read-only if we define any
        if ($this->userIsViewer($user)) {
            return in_array($permission, ['view_activity_logs']); // Only allow viewing logs for now if explicitly granted?
            // Actually, let's keep it simple: Viewers can ONLY view.
        }

        // 3. Evaluate the raw JSON permission array first so explicitly granted overrides work cleanly
        $permissions = $this->getUserPermissions($user);
        if (in_array($permission, $permissions)) {
            return true;
        }

        // 4. Admins pass cleanly for standard management capabilities, but NOT sensitive billing
        if ($this->userIsAdmin($user)) {
            return in_array($permission, ['manage_team', 'manage_webhooks', 'view_activity_logs']);
        }

        return false;
    }

    /**
     * Determine if the given user is the owner of the workspace.
     */
    public function userIsOwner(User $user): bool
    {
        return $this->getUserRole($user) === self::ROLE_OWNER;
    }

    /**
     * Add a user to the workspace with a given role.
     */
    public function addUser(User $user, string $role = 'member'): void
    {
        if (! $this->hasUser($user)) {
            $this->users()->attach($user->id, ['role' => $role]);
        }
    }

    /**
     * Remove a user from the workspace.
     */
    public function removeUser(User $user): void
    {
        $this->users()->detach($user->id);
    }

    /**
     * Update a user's role in the workspace.
     */
    public function updateUserRole(User $user, string $role): void
    {
        $this->users()->updateExistingPivot($user->id, ['role' => $role]);

        if ($role === 'owner' && $this->owner_id !== $user->id) {
            $this->update(['owner_id' => $user->id]);
        }
    }

    /**
     * Get the count of team members (excluding owner).
     */
    public function getMemberCountAttribute(): int
    {
        return $this->users()->count();
    }

    /**
     * Per-instance plan resolution cache.
     *
     * @var array{name?: string, key?: string}|null
     */
    private ?array $resolvedPlan = null;

    /**
     * Get the current plan name for the workspace.
     */
    public function getPlanNameAttribute(): string
    {
        return $this->getResolvedPlan()['name'];
    }

    /**
     * Get the current plan key (id) for the workspace.
     */
    public function getPlanKeyAttribute(): string
    {
        return $this->getResolvedPlan()['key'];
    }

    /**
     * Resolve and cache plan name and key from Stripe subscription.
     *
     * @return array{name: string, key: string}
     */
    protected function getResolvedPlan(): array
    {
        if ($this->resolvedPlan !== null) {
            return $this->resolvedPlan;
        }

        if ($this->subscribed('default')) {
            $subscription = $this->subscription('default');
            $priceId = $subscription->stripe_price;

            $plans = config('billing.plans');

            foreach ($plans as $planKey => $plan) {
                if ($planKey === 'free') {
                    continue;
                }

                $monthlyPriceId = $plan['stripe_price_id']['monthly'] ?? null;
                $yearlyPriceId = $plan['stripe_price_id']['yearly'] ?? null;

                if ($priceId === $monthlyPriceId || $priceId === $yearlyPriceId) {
                    return $this->resolvedPlan = ['name' => $plan['name'], 'key' => $planKey];
                }
            }

            return $this->resolvedPlan = ['name' => 'Pro', 'key' => 'pro'];
        }

        return $this->resolvedPlan = ['name' => 'Free', 'key' => 'free'];
    }

    /**
     * Get the billing period (monthly/yearly) for the workspace.
     */
    public function getBillingPeriodAttribute(): ?string
    {
        if (! $this->subscribed('default')) {
            return null;
        }

        $subscription = $this->subscription('default');
        $priceId = $subscription->stripe_price;
        $plans = config('billing.plans');

        foreach ($plans as $plan) {
            if (($plan['stripe_price_id']['monthly'] ?? null) === $priceId) {
                return 'monthly';
            }
            if (($plan['stripe_price_id']['yearly'] ?? null) === $priceId) {
                return 'yearly';
            }
        }

        return null;
    }

    /**
     * Check if workspace is on the free plan.
     */
    public function onFreePlan(): bool
    {
        return ! $this->subscribed('default');
    }

    /**
     * Check if workspace is on the pro plan.
     */
    public function onProPlan(): bool
    {
        return $this->subscribed('default') && $this->plan_name === 'Pro';
    }

    /**
     * Check if workspace is on the business plan.
     */
    public function onBusinessPlan(): bool
    {
        return $this->subscribed('default') && $this->plan_name === 'Business';
    }

    /**
     * Get the seat limit for this workspace's current plan.
     * Returns -1 for unlimited.
     */
    public function seatLimit(): int
    {
        $planKey = $this->plan_key;
        $config = config("billing.plans.{$planKey}.limits.team_members");

        return $config ?? 2;
    }

    /**
     * Get the current number of confirmed members in the workspace.
     */
    public function activeSeatCount(): int
    {
        return $this->users()->count();
    }

    /**
     * Determine if the workspace has at least one available seat.
     */
    public function hasAvailableSeat(): bool
    {
        $limit = $this->seatLimit();

        return $limit === -1 || $this->activeSeatCount() < $limit;
    }

    /**
     * Synchronise the Stripe subscription quantity to the current seat count.
     * No-op when not subscribed.
     */
    public function syncSubscriptionQuantity(): void
    {
        $subscription = $this->subscription('default');

        if (! $subscription || ! $subscription->active()) {
            return;
        }

        try {
            $subscription->updateQuantity($this->activeSeatCount());
        } catch (\Exception) {
            // Fail silently — Stripe sync is best-effort
        }
    }

    /**
     * Get a comprehensive usage overview for the workspace.
     *
     * @return array<string, array{label: string, count: int, limit: int|null, percentage: int}>
     */
    public function usageOverview(): array
    {
        $plan = $this->plan_key;
        $limits = config("billing.plans.{$plan}.limits");

        $usage = [];

        foreach ($limits as $key => $limit) {
            $count = match ($key) {
                'team_members' => $this->activeSeatCount(),
                'api_keys' => $this->apiKeys()->count(),
                'webhooks' => $this->webhookEndpoints()->count(),
                default => 0,
            };

            $label = match ($key) {
                'team_members' => 'Team Members',
                'api_keys' => 'API Keys',
                'webhooks' => 'Webhooks',
                default => ucfirst(str_replace('_', ' ', $key)),
            };

            $usage[$key] = [
                'label' => $label,
                'count' => $count,
                'limit' => $limit,
                'percentage' => $limit === -1 ? 0 : min(100, (int) round(($count / max(1, (int) $limit)) * 100)),
            ];
        }

        return $usage;
    }
}
