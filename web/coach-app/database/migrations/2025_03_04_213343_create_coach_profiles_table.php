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
        Schema::create('coach_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('bio')->nullable();
            $table->integer('years_of_experience')->default(0);
            $table->decimal('hourly_rate', 8, 2)->default(0);
            $table->text('education')->nullable();
            $table->text('work_experience')->nullable(); 
            $table->text('interests')->nullable();
            $table->string('languages')->nullable();
            $table->string('location')->nullable();
            $table->string('expertise')->nullable();
            $table->text('coaching_style')->nullable();
            $table->string('industry')->nullable();
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coach_profiles');
    }
};
