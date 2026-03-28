<?php

namespace Database\Factories;

use App\Models\CustomFieldDefinition;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CustomFieldDefinitionFactory extends Factory
{
    protected $model = CustomFieldDefinition::class;

    public function definition(): array
    {
        $name = $this->faker->words(2, true);
        $type = $this->faker->randomElement(array_keys(CustomFieldDefinition::getFieldTypes()));

        return [
            'workspace_id' => Workspace::factory(),
            'name' => $name,
            'key' => Str::slug($name, '_'),
            'type' => $type,
            'options' => $type === 'select' ? ['Option 1', 'Option 2', 'Option 3'] : null,
            'required' => false,
            'default_value' => null,
            'order' => 0,
        ];
    }

    public function type(string $type): self
    {
        return $this->state(fn (array $attributes) => [
            'type' => $type,
            'options' => $type === 'select' ? ['Option 1', 'Option 2', 'Option 3'] : null,
        ]);
    }

    public function required(): self
    {
        return $this->state(fn (array $attributes) => [
            'required' => true,
        ]);
    }

    public function forWorkspace(Workspace $workspace): self
    {
        return $this->state(fn (array $attributes) => [
            'workspace_id' => $workspace->id,
        ]);
    }

    public function withDefaultValue(string $value): self
    {
        return $this->state(fn (array $attributes) => [
            'default_value' => $value,
        ]);
    }
}
