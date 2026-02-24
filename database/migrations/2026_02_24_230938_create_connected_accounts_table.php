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
        Schema::create('connected_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider'); // 'github', 'google'
            $table->string('provider_id');
            $table->string('name')->nullable();
            $table->string('nickname')->nullable();
            $table->string('email')->nullable();
            $table->text('avatar')->nullable();
            $table->text('token')->nullable();
            $table->text('secret')->nullable();
            $table->text('refresh_token')->nullable();
            $table->dateTime('expires_at')->nullable();
            $table->timestamps();

            // A user can only have one connected account per provider
            $table->unique(['user_id', 'provider']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('connected_accounts');
    }
};
