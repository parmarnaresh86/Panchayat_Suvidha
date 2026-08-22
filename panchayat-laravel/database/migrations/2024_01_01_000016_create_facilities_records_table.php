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
        Schema::create('facilities_records', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('module_id', 100);
            $table->foreign('module_id')->references('module_id')->on('facilities_modules')->onDelete('cascade');
            $table->string('record_type', 100)->nullable();
            $table->json('record_data');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facilities_records');
    }
};
