<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Category;
use App\Models\Product;
use App\Models\LastMile;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        $admin = User::firstOrCreate(['email' => 'admin@maghreblabel.com'], [
            'nom' => 'Admin MaghrebLabel',
            'telephone' => '+212600000000',
            'mot_de_passe' => Hash::make('Admin@2024!'),
            'role' => 'admin',
            'statut' => 'active',
            'email_verified' => true,
        ]);
        Wallet::firstOrCreate(['user_id' => $admin->id], ['solde' => 0]);

        // MediaBuyer
        $mb = User::firstOrCreate(['email' => 'amine@test.com'], [
            'nom' => 'Mohamed Amine',
            'telephone' => '+212612345678',
            'mot_de_passe' => Hash::make('Test@123'),
            'role' => 'mediabuyer',
            'statut' => 'active',
            'email_verified' => true,
        ]);
        Wallet::firstOrCreate(['user_id' => $mb->id], ['solde' => 5000]);

        // Printer
        $printer = User::firstOrCreate(['email' => 'printer@test.com'], [
            'nom' => 'Printer User',
            'telephone' => '+212623456789',
            'mot_de_passe' => Hash::make('Test@123'),
            'role' => 'printer',
            'statut' => 'active',
            'email_verified' => true,
        ]);
        Wallet::firstOrCreate(['user_id' => $printer->id], ['solde' => 0]);

        // Categories
        $cat1 = Category::firstOrCreate(['name' => 'Soins Visage'], ['description' => 'Produits de soin pour le visage', 'is_active' => true]);
        $cat2 = Category::firstOrCreate(['name' => 'Soins Corps'], ['description' => 'Produits de soin pour le corps', 'is_active' => true]);
        $cat3 = Category::firstOrCreate(['name' => 'Compléments Alimentaires'], ['description' => 'Suppléments nutritionnels', 'is_active' => true]);

        // Products
        $products = [
            ['nom' => 'Crème Anti-rides Premium', 'category_id' => $cat1->id, 'prix_unitaire' => 45, 'delai_production' => 3, 'statut' => 'active'],
            ['nom' => 'Huile Argan Pure Bio', 'category_id' => $cat2->id, 'prix_unitaire' => 30, 'delai_production' => 2, 'statut' => 'active'],
            ['nom' => 'Sérum Vitamine C', 'category_id' => $cat1->id, 'prix_unitaire' => 60, 'delai_production' => 4, 'statut' => 'active'],
            ['nom' => 'Miel Noir Fenouil', 'category_id' => $cat3->id, 'prix_unitaire' => 25, 'delai_production' => 1, 'statut' => 'active'],
            ['nom' => 'Gélules Collagène', 'category_id' => $cat3->id, 'prix_unitaire' => 55, 'delai_production' => 3, 'statut' => 'active'],
            ['nom' => 'Savon Argan Naturel', 'category_id' => $cat2->id, 'prix_unitaire' => 15, 'delai_production' => 1, 'statut' => 'active'],
        ];
        foreach ($products as $p) {
            Product::firstOrCreate(['nom' => $p['nom']], $p);
        }

        // Last Miles
        $lastMiles = [
            ['name' => 'Amana Express', 'description' => 'Service de livraison rapide', 'is_active' => true],
            ['name' => 'Chronopost Maroc', 'description' => 'Livraison express nationale', 'is_active' => true],
            ['name' => 'Al Barid Bank', 'description' => 'Service postal', 'is_active' => true],
        ];
        foreach ($lastMiles as $lm) {
            LastMile::firstOrCreate(['name' => $lm['name']], $lm);
        }

        echo "Seeder completed!\n";
        echo "Admin: admin@maghreblabel.com / Admin@2024!\n";
        echo "MediaBuyer: amine@test.com / Test@123\n";
        echo "Printer: printer@test.com / Test@123\n";
    }
}
