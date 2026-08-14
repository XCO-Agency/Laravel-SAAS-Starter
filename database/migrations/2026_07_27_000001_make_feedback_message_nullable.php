<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('feedback', function (Blueprint $table) {
            $table->text('message')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Backfill nullable rows (e.g. experience-survey responses without a message)
        // so restoring the NOT NULL constraint does not fail.
        DB::table('feedback')->whereNull('message')->update(['message' => '']);

        Schema::table('feedback', function (Blueprint $table) {
            $table->text('message')->nullable(false)->change();
        });
    }
};
