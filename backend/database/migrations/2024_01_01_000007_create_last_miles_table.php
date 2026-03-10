<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('last_miles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('logo')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('last_mile_integrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('last_mile_id')->constrained()->cascadeOnDelete();
            $table->string('auth_type')->default('api_key');
            $table->string('api_key')->nullable();
            $table->string('api_secret')->nullable();
            $table->text('config')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('last_mile_integrations');
        Schema::dropIfExists('last_miles');
    }
};
