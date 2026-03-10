<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('last_mile_integration_id')->nullable()->constrained('last_mile_integrations')->nullOnDelete();
            $table->string('n_lead')->unique();
            $table->integer('quantite_total')->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->enum('statut_confirmation', ['pending','confirmed','cancelled','refused'])->default('pending');
            $table->enum('status_shipping', ['pending','pret','expedie','livre','refuse'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
        Schema::create('lead_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('price', 10, 2);
            $table->integer('quantity')->default(1);
        });
        Schema::create('lead_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status');
            $table->text('note')->nullable();
            $table->timestamps();
        });
        Schema::create('production_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('statut')->default('pending');
            $table->timestamps();
        });
        Schema::create('print_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('statut')->default('pending');
            $table->timestamps();
        });
        Schema::create('shipping_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('statut')->default('pending');
            $table->string('tracking_number')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('shipping_statuses');
        Schema::dropIfExists('print_statuses');
        Schema::dropIfExists('production_statuses');
        Schema::dropIfExists('lead_histories');
        Schema::dropIfExists('lead_products');
        Schema::dropIfExists('leads');
    }
};
