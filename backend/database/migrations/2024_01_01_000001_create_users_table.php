<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('email')->unique();
            $table->string('telephone')->nullable();
            $table->string('mot_de_passe');
            $table->enum('role', ['admin','mediabuyer','printer'])->default('mediabuyer');
            $table->enum('statut', ['active','inactive','pending'])->default('active');
            $table->boolean('email_verified')->default(false);
            $table->string('otp_code')->nullable();
            $table->bigInteger('otp_expires')->nullable();
            $table->string('reset_token')->nullable();
            $table->bigInteger('reset_expires')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('users'); }
};
