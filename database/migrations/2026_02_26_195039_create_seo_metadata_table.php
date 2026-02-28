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
        Schema::create('seo_metadata', function (Blueprint $table) {
            $table->id();
            $table->string('path')->unique()->index()->nullable(); // NULL means global fallback
            $table->string('title')->nullable();
            $table->string('description', 511)->nullable();
            $table->string('keywords')->nullable();
            
            // Open Graph
            $table->string('og_title')->nullable();
            $table->string('og_description', 511)->nullable();
            $table->string('og_image')->nullable();
            $table->string('og_type')->default('website');

            // Twitter
            $table->string('twitter_card')->default('summary_large_image');
            $table->string('twitter_site')->nullable();
            $table->string('twitter_creator')->nullable();
            $table->string('twitter_image')->nullable();

            $table->boolean('is_global')->default(false)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seo_metadata');
    }
};
