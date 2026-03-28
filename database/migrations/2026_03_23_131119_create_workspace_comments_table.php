<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workspace_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('workspace_comments')->cascadeOnDelete();
            $table->morphs('commentable');
            $table->text('content');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['workspace_id', 'commentable_type', 'commentable_id']);
            $table->index(['parent_id']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workspace_comments');
    }
};
