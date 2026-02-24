<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Laravel\Cashier\Billable;
use Laravel\Cashier\Subscription;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Workspace extends Model
{
    /** @use HasFactory<\Database\Factories\WorkspaceFactory> */
    use Billable, HasFactory, LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'logo',
        'owner_id',
        'personal_workspace',
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
            'trial_ends_at' => 'datetime',
        ];
    }

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
            ->withPivot('role')
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
     * Get the workspace's outbound webhook endpoints.
     */
    public function webhookEndpoints(): HasMany
    {
        return $this->hasMany(WebhookEndpoint::class);
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

        return in_array($role, ['owner', 'admin']);
    }

    /**
     * Determine if the given user is the owner of the workspace.
     */
    public function userIsOwner(User $user): bool
    {
        return $this->getUserRole($user) === 'owner';
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
    }

    /**
     * Get the count of team members (excluding owner).
     */
    public function getMemberCountAttribute(): int
    {
        return $this->users()->count();
    }

    /**
     * Get the current plan name for the workspace.
     */
    public function getPlanNameAttribute(): string
    {
        if ($this->subscribed('default')) {
            $subscription = $this->subscription('default');
            $priceId = $subscription->stripe_price;

            // Match the price ID to our configured plans
            $plans = config('billing.plans');

            foreach ($plans as $planKey => $plan) {
                if ($planKey === 'free') {
                    continue;
                }

                $monthlyPriceId = $plan['stripe_price_id']['monthly'] ?? null;
                $yearlyPriceId = $plan['stripe_price_id']['yearly'] ?? null;

                if ($priceId === $monthlyPriceId || $priceId === $yearlyPriceId) {
                    return $plan['name'];
                }
            }

            // Fallback: any active subscription defaults to Pro
            return 'Pro';
        }

        return 'Free';
    }

    /**
     * Get the current plan key (id) for the workspace.
     */
    public function getPlanKeyAttribute(): string
    {
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
                    return $planKey;
                }
            }

            return 'pro';
        }

        return 'free';
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
}
