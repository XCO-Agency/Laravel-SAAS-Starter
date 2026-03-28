<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('workspace_announcements')) {
            Schema::create('workspace_announcements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('title');
                $table->text('content');
                $table->enum('type', ['info', 'warning', 'success'])->default('info');
                $table->boolean('pinned')->default(false);
                $table->boolean('dismissible')->default(true);
                $table->timestamp('published_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->index(['workspace_id', 'pinned', 'published_at']);
                $table->index(['workspace_id', 'expires_at']);
            });
        }

        if (! Schema::hasTable('workspace_announcement_reads')) {
            Schema::create('workspace_announcement_reads', function (Blueprint $table) {
                $table->id();
                $table->foreignId('announcement_id')->constrained('workspace_announcements')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->timestamp('read_at')->nullable();
                $table->timestamps();

                $table->unique(['announcement_id', 'user_id']);
                $table->index(['user_id', 'read_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('workspace_announcement_reads');
        Schema::dropIfExists('workspace_announcements');
    }
};
