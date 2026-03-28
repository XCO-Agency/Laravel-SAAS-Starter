<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomFieldDefinition extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'name',
        'key',
        'type',
        'options',
        'required',
        'default_value',
        'order',
    ];

    protected $casts = [
        'options' => 'array',
        'required' => 'boolean',
        'order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function values(): HasMany
    {
        return $this->hasMany(CustomFieldValue::class);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('name');
    }

    public function scopeForWorkspace($query, int $workspaceId)
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function isSelect(): bool
    {
        return $this->type === 'select';
    }

    public function isBoolean(): bool
    {
        return $this->type === 'boolean';
    }

    public function getSelectOptions(): array
    {
        return $this->options ?? [];
    }

    public function validateValue(mixed $value): bool
    {
        if ($this->required && (is_null($value) || $value === '')) {
            return false;
        }

        return match ($this->type) {
            'text', 'textarea' => is_string($value),
            'number' => is_numeric($value),
            'date' => strtotime($value) !== false,
            'boolean' => is_bool($value),
            'select' => in_array($value, $this->getSelectOptions()),
            'url' => filter_var($value, FILTER_VALIDATE_URL) !== false,
            default => true,
        };
    }

    public static function getFieldTypes(): array
    {
        return [
            'text' => 'Text (Single Line)',
            'textarea' => 'Text (Multi Line)',
            'number' => 'Number',
            'date' => 'Date',
            'boolean' => 'Yes/No Toggle',
            'select' => 'Dropdown Select',
            'url' => 'URL/Link',
        ];
    }

    public function getCastedValue(mixed $value): mixed
    {
        return match ($this->type) {
            'number' => (float) $value,
            'boolean' => (bool) $value,
            'date' => $value ? date('Y-m-d', strtotime($value)) : null,
            default => $value,
        };
    }
}
