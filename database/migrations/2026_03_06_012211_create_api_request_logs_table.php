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
        Schema::create('api_request_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('api_key_id')->constrained('workspace_api_keys')->cascadeOnDelete();
            $table->string('method', 10);
            $table->string('path');
            $table->integer('status_code');
            $table->integer('response_time_ms')->nullable();
            $table->boolean('was_throttled')->default(false);
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('requested_at');

            $table->index(['workspace_id', 'requested_at']);
            $table->index(['api_key_id', 'requested_at']);
            $table->index('requested_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_request_logs');
    }
};
