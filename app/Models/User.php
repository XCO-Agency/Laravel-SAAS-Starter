<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

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
        ];
    }

    /**
     * Get all workspaces the user belongs to.
     */
    public function workspaces(): BelongsToMany
    {
        return $this->belongsToMany(Workspace::class, 'workspace_user')
            ->withPivot('role')
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

    /**
     * Determine if the user is an admin of the given workspace.
     */
    public function isAdminOfWorkspace(Workspace $workspace): bool
    {
        $role = $this->roleInWorkspace($workspace);

        return in_array($role, ['owner', 'admin']);
    }
}
