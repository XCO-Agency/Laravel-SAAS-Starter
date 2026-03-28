<?php

namespace Database\Factories;

use App\Models\CustomFieldDefinition;
use App\Models\CustomFieldValue;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomFieldValueFactory extends Factory
{
    protected $model = CustomFieldValue::class;

    public function definition(): array
    {
        return [
            'custom_field_definition_id' => CustomFieldDefinition::factory(),
            'customizable_type' => 'App\Models\Workspace',
            'customizable_id' => 1,
            'value' => $this->faker->word(),
        ];
    }

    public function forDefinition(CustomFieldDefinition $definition): self
    {
        return $this->state(fn (array $attributes) => [
            'custom_field_definition_id' => $definition->id,
            'value' => match ($definition->type) {
                'number' => $this->faker->randomFloat(2, 0, 100),
                'boolean' => $this->faker->boolean(),
                'date' => $this->faker->date(),
                'select' => $definition->options[0] ?? 'Option 1',
                default => $this->faker->word(),
            },
        ]);
    }

    public function forCustomizable(string $type, int $id): self
    {
        return $this->state(fn (array $attributes) => [
            'customizable_type' => $type,
            'customizable_id' => $id,
        ]);
    }

    public function withValue(mixed $value): self
    {
        return $this->state(fn (array $attributes) => [
            'value' => $value,
        ]);
    }
}
