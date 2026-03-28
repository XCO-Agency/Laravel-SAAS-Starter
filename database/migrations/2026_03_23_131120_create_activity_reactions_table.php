<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_reactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('activity_id');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reaction', 10);
            $table->timestamps();

            // activity_log.id is unsignedBigInteger, not a foreign key
            $table->index(['activity_id']);
            $table->unique(['activity_id', 'user_id', 'reaction']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_reactions');
    }
};
