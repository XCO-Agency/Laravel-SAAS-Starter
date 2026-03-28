<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('workspace_templates')) {
            Schema::create('workspace_templates', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('workspace_id')->nullable()->constrained()->nullOnDelete();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('icon')->default('building');
                $table->boolean('is_public')->default(false);
                $table->json('configuration');
                $table->string('category')->default('general');
                $table->unsignedInteger('usage_count')->default(0);
                $table->timestamps();
                $table->softDeletes();

                $table->index(['is_public', 'category']);
                $table->index(['user_id']);
                $table->index(['usage_count']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('workspace_templates');
    }
};
