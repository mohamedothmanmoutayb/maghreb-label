<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('solde', 12, 2)->default(0);
            $table->timestamps();
        });
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['credit','debit']);
            $table->decimal('montant', 12, 2);
            $table->string('reference_commande')->nullable();
            $table->string('description')->nullable();
            $table->enum('statut', ['pending','completed','failed'])->default('completed');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
    }
};
