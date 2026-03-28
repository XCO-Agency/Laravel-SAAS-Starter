<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('custom_field_definitions')) {
            Schema::create('custom_field_definitions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
                $table->string('name');
                $table->string('key')->unique();
                $table->enum('type', ['text', 'textarea', 'number', 'date', 'boolean', 'select', 'url']);
                $table->json('options')->nullable();
                $table->boolean('required')->default(false);
                $table->text('default_value')->nullable();
                $table->unsignedInteger('order')->default(0);
                $table->timestamps();

                $table->index(['workspace_id', 'order']);
                $table->index(['key']);
            });
        }

        if (! Schema::hasTable('custom_field_values')) {
            Schema::create('custom_field_values', function (Blueprint $table) {
                $table->id();
                $table->foreignId('custom_field_definition_id')->constrained()->cascadeOnDelete();
                $table->morphs('customizable');
                $table->json('value');
                $table->timestamps();

                $table->unique(['custom_field_definition_id', 'customizable_type', 'customizable_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_field_values');
        Schema::dropIfExists('custom_field_definitions');
    }
};
