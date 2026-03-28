<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('tags')) {
            Schema::create('tags', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug');
                $table->string('color')->default('#3b82f6');
                $table->text('description')->nullable();
                $table->foreignId('workspace_id')->nullable()->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->timestamps();

                $table->unique(['workspace_id', 'slug']);
                $table->index(['workspace_id', 'name']);
            });
        }

        if (! Schema::hasTable('taggables')) {
            Schema::create('taggables', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
                $table->morphs('taggable');
                $table->timestamps();

                $table->unique(['tag_id', 'taggable_type', 'taggable_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('taggables');
        Schema::dropIfExists('tags');
    }
};
