<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notification_delivery_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('notification_type');
            $table->string('channel'); // mail, database (in_app)
            $table->string('category')->nullable(); // security, billing, team, marketing
            $table->boolean('is_successful')->default(true);
            $table->timestamp('delivered_at');
            $table->timestamps();

            $table->index(['channel', 'delivered_at']);
            $table->index(['notification_type', 'delivered_at']);
            $table->index(['category', 'delivered_at']);
            $table->index('delivered_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_delivery_logs');
    }
};
