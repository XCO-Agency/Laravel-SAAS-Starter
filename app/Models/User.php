<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, \Laravel\Scout\Searchable, LogsActivity, Notifiable, SoftDeletes, TwoFactorAuthenticatable;

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
            'email' => $this->email,
        ];
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_superadmin',
        'current_workspace_id',
        'locale',
        'onboarded_at',
        'avatar_url',
        'bio',
        'timezone',
        'date_format',
        'notification_preferences',
        'onboarding_checklist_dismissed_at',
        'password_updated_at',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'avatar_url',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_superadmin' => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
            'onboarded_at' => 'datetime',
            'notification_preferences' => 'array',
            'onboarding_checklist_dismissed_at' => 'datetime',
            'password_updated_at' => 'datetime',
        ];
    }

    /**
     * Get all workspaces the user belongs to.
     */
    public function workspaces(): BelongsToMany
    {
        return $this->belongsToMany(Workspace::class, 'workspace_user')
            ->withPivot('role', 'permissions')
            ->withTimestamps();
    }

    /**
     * Get all workspaces owned by the user.
     */
    public function ownedWorkspaces(): HasMany
    {
        return $this->hasMany(Workspace::class, 'owner_id');
    }

    /**
     * Get all connected accounts for the user.
     */
    public function connectedAccounts(): HasMany
    {
        return $this->hasMany(ConnectedAccount::class);
    }

    /**
     * Get the user's login activity history.
     */
    public function loginActivities(): HasMany
    {
        return $this->hasMany(LoginActivity::class);
    }

    /**
     * Get the user's password change history.
     */
    public function passwordHistories(): HasMany
    {
        return $this->hasMany(PasswordHistory::class);
    }

    /**
     * Get the user's current workspace.
     */
    public function currentWorkspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class, 'current_workspace_id');
    }

    /**
     * Get the user's personal workspace.
     */
    public function personalWorkspace(): ?Workspace
    {
        return $this->ownedWorkspaces()->where('personal_workspace', true)->first();
    }

    /**
     * Switch the user's current workspace.
     */
    public function switchWorkspace(Workspace $workspace): bool
    {
        if (! $workspace->hasUser($this)) {
            return false;
        }

        $this->forceFill([
            'current_workspace_id' => $workspace->id,
        ])->save();

        return true;
    }

    /**
     * Get the user's avatar URL with fallback.
     */
    public function getAvatarUrlAttribute($value): ?string
    {
        if ($value) {
            return str_starts_with($value, 'http') ? $value : Storage::url($value);
        }

        return null; // The frontend should handle fallback avatars
    }

    /**
     * Determine if the user belongs to the given workspace.
     */
    public function belongsToWorkspace(Workspace $workspace): bool
    {
        return $this->workspaces()->where('workspace_id', $workspace->id)->exists();
    }

    /**
     * Get the user's role in a workspace.
     */
    public function roleInWorkspace(Workspace $workspace): ?string
    {
        $membership = $this->workspaces()->where('workspace_id', $workspace->id)->first();

        return $membership?->pivot->role;
    }

    /**
     * Determine if the user owns the given workspace.
     */
    public function ownsWorkspace(Workspace $workspace): bool
    {
        return $this->id === $workspace->owner_id;
    }

    public function userIsAdmin(Workspace $workspace): bool
    {
        $role = $this->roleInWorkspace($workspace);

        return in_array($role, [Workspace::ROLE_OWNER, Workspace::ROLE_ADMIN]);
    }

    /**
     * Determine if the user is a member (or higher) of the workspace.
     */
    public function userIsMember(Workspace $workspace): bool
    {
        $role = $this->roleInWorkspace($workspace);

        return in_array($role, [Workspace::ROLE_OWNER, Workspace::ROLE_ADMIN, Workspace::ROLE_MEMBER]);
    }

    /**
     * Determine if the user is a viewer of the workspace.
     */
    public function userIsViewer(Workspace $workspace): bool
    {
        return $this->roleInWorkspace($workspace) === Workspace::ROLE_VIEWER;
    }

    /**
     * Get normalized notification preferences with channel and category defaults.
     *
     * @return array{
     *     channels: array{email: bool, in_app: bool},
     *     categories: array{marketing: bool, security: bool, team: bool, billing: bool}
     * }
     */
    public function normalizedNotificationPreferences(): array
    {
        $defaults = [
            'channels' => [
                'email' => true,
                'in_app' => true,
            ],
            'categories' => [
                'marketing' => true,
                'security' => true,
                'team' => true,
                'billing' => true,
            ],
        ];

        $preferences = $this->notification_preferences ?? [];

        if (isset($preferences['channels']) || isset($preferences['categories'])) {
            return [
                'channels' => array_merge($defaults['channels'], $preferences['channels'] ?? []),
                'categories' => array_merge($defaults['categories'], $preferences['categories'] ?? []),
            ];
        }

        return [
            'channels' => $defaults['channels'],
            'categories' => array_merge($defaults['categories'], array_intersect_key($preferences, $defaults['categories'])),
        ];
    }

    /**
     * Determine whether the given notification channel is enabled for the user.
     */
    public function notificationChannelEnabled(string $channel): bool
    {
        return $this->normalizedNotificationPreferences()['channels'][$channel] ?? true;
    }

    /**
     * Determine whether the given notification category is enabled for the user.
     */
    public function notificationCategoryEnabled(string $category): bool
    {
        return $this->normalizedNotificationPreferences()['categories'][$category] ?? true;
    }

    /**
     * Get the support tickets created by the user.
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
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
            ->useLogName('user');
    }
}
