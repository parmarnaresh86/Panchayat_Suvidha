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
        Schema::create('education_announcements', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('module_id', 100);
            $table->foreign('module_id')->references('module_id')->on('education_modules')->onDelete('cascade');
            $table->string('type', 100)->nullable();
            $table->string('date', 50)->nullable();
            $table->text('message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('education_announcements');
    }
};
