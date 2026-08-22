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
        Schema::create('service_items', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('service_id', 100);
            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
            $table->string('label', 500)->nullable();
            $table->string('to_path', 500)->nullable();
            $table->string('department', 500)->nullable();
            $table->text('eligibility')->nullable();
            $table->text('description')->nullable();
            $table->json('documents')->nullable();
            $table->text('procedure')->nullable();
            $table->string('fees', 500)->nullable();
            $table->string('contact', 500)->nullable();
            $table->string('helpline', 500)->nullable();
            $table->string('official_link', 500)->nullable();
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_items');
    }
};
