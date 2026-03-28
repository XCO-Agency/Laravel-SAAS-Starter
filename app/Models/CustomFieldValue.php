<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomFieldValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_field_definition_id',
        'customizable_type',
        'customizable_id',
        'value',
    ];

    protected $casts = [
        'value' => 'json',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function definition(): BelongsTo
    {
        return $this->belongsTo(CustomFieldDefinition::class, 'custom_field_definition_id');
    }

    public function customizable()
    {
        return $this->morphTo();
    }

    public function scopeForDefinition($query, int $definitionId)
    {
        return $query->where('custom_field_definition_id', $definitionId);
    }

    public function scopeForCustomizable($query, string $type, int $id)
    {
        return $query->where('customizable_type', $type)
            ->where('customizable_id', $id);
    }

    public function getDisplayValue(): mixed
    {
        $value = $this->value;

        return match ($this->definition->type) {
            'boolean' => $value ? 'Yes' : 'No',
            'date' => $value ? date('M j, Y', strtotime($value)) : null,
            default => $value,
        };
    }
}
