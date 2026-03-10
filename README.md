# 🏷️ MaghrebLabel — SaaS Platform for Media Buyers

> **Plateforme SaaS complète** de gestion de commandes COD (Cash on Delivery) pour les media buyers au Maroc.  
> Backend : **Laravel 12** | Frontend : **React 18 + TypeScript + Tailwind CSS**

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture technique](#architecture-technique)
3. [Fonctionnalités implémentées](#fonctionnalités-implémentées)
4. [Comptes de test](#comptes-de-test)
5. [Guide utilisateur](#guide-utilisateur)
6. [API endpoints](#api-endpoints)
7. [Modèles de données](#modèles-de-données)
8. [Installation & développement](#installation--développement)
9. [Déploiement](#déploiement)
10. [Prochaines étapes](#prochaines-étapes)

---

## Vue d'ensemble

MaghrebLabel est une plateforme SaaS permettant aux **media buyers** de :
- Commander des produits en COD via un **catalogue centralisé**
- Gérer leur **wallet prépayé** (recharge, historique)
- Suivre leurs **leads/commandes** du traitement à la livraison
- Imprimer leurs **étiquettes de livraison**

Les **admins** gèrent les utilisateurs, les produits, les portefeuilles et valident les opérations.  
Les **imprimeurs** voient leur file d'impression et marquent les commandes comme imprimées.

---

## Architecture technique

```
webapp/
├── backend/          # Laravel 12 REST API (PHP 8.2)
│   ├── app/
│   │   ├── Http/Controllers/   # AuthController, LeadController, WalletController, ...
│   │   ├── Http/Middleware/    # JwtMiddleware
│   │   └── Models/             # User, Lead, Wallet, Product, Client, ...
│   ├── database/
│   │   ├── migrations/         # Schéma de la base de données
│   │   └── seeders/            # Données de démonstration
│   └── routes/
│       └── api.php             # Toutes les routes API REST
│
├── frontend/         # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── api/                # Services Axios (authApi, walletApi, leadApi, ...)
│   │   ├── components/         # Layout, composants partagés
│   │   ├── context/            # AuthContext (JWT + state global)
│   │   └── pages/
│   │       ├── auth/           # Login, Register, VerifyOtp
│   │       ├── mediabuyer/     # Dashboard, Leads, NewLead, Products, Wallet
│   │       ├── admin/          # Dashboard, Users, Wallets, Products, Leads, Requests
│   │       └── printer/        # PrinterDashboard, PrinterQueue
│   └── dist/                   # Build de production (servi par `serve`)
│
└── ecosystem.config.cjs        # Configuration PM2 (API + Frontend)
```

---

## Fonctionnalités implémentées

### ✅ Authentification & Accès
- [x] Inscription avec vérification OTP par email
- [x] Connexion JWT (tymon/jwt-auth)
- [x] Rôles : `admin`, `mediabuyer`, `printer`
- [x] Middleware JWT sur toutes les routes protégées
- [x] Récupération de mot de passe par OTP
- [x] Déconnexion avec invalidation du token

### ✅ Wallet Prépayé
- [x] Solde en temps réel
- [x] Historique des transactions paginé
- [x] Demande de recharge (admin valide/rejette)
- [x] Débit automatique à la création de commande
- [x] Admin : ajouter des fonds directement
- [x] Admin : liste de tous les wallets

### ✅ Catalogue Produits
- [x] Liste des produits avec catégories et filtres
- [x] Gestion CRUD complète (admin)
- [x] Gestion des catégories (admin)
- [x] Prix de vente + jours de production

### ✅ Commandes / Leads
- [x] Création d'une commande (avec débit automatique du wallet)
- [x] Gestion client (nom, téléphone, ville, adresse)
- [x] Statuts : `pending` → `confirmed` → `shipped` → `delivered` / `returned`
- [x] Statut de production : `pending` → `in_production` → `ready`
- [x] Statut d'impression : `pending` → `printed`
- [x] Historique des changements de statut
- [x] Dashboard stats (total leads, revenue, taux de livraison)
- [x] Admin : vue globale de toutes les commandes

### ✅ Last Mile (Transporteurs)
- [x] Liste des transporteurs disponibles
- [x] Admin CRUD (créer, éditer, supprimer)

### ✅ Demandes Label
- [x] Mediabuyer peut demander des étiquettes
- [x] Admin voit toutes les demandes

### ✅ Imprimeur
- [x] Dashboard avec statistiques d'impression
- [x] File d'impression (leads en attente d'impression)
- [x] Marquer une commande comme imprimée

### ✅ Interface utilisateur
- [x] Design responsive (mobile + desktop)
- [x] Sidebar avec navigation par rôle
- [x] Notifications toast (succès / erreur)
- [x] Tableau de bord avec statistiques visuelles
- [x] Formulaires avec validation

---

## Comptes de test

| Rôle       | Email                      | Mot de passe | Solde wallet |
|------------|----------------------------|--------------|--------------|
| Admin      | admin@maghreblabel.com     | Admin@2024!  | 0 DH         |
| MediaBuyer | amine@test.com             | Test@123     | ~4700 DH     |
| Printer    | printer@test.com           | Test@123     | 0 DH         |

---

## Guide utilisateur

### 📦 Media Buyer
1. **Connexion** → vérification OTP
2. **Wallet** → demander une recharge → attendre validation admin
3. **Produits** → parcourir le catalogue
4. **Nouvelle commande** → choisir le produit, renseigner le client → le wallet est débité automatiquement
5. **Commandes** → suivre le statut de chaque commande

### 🔧 Admin
1. **Dashboard** → statistiques globales (commandes, CA, taux livraison)
2. **Mediabuyers** → gérer les comptes (activer/désactiver)
3. **Wallets** → voir les soldes, valider les recharges, ajouter des fonds
4. **Produits** → créer/modifier/supprimer des produits et catégories
5. **Commandes** → gérer les statuts (confirmation, production, expédition)
6. **Last Mile** → gérer les transporteurs

### 🖨️ Imprimeur
1. **File d'impression** → voir les commandes à imprimer
2. **Marquer comme imprimé** → mettre à jour le statut

---

## API endpoints

### Auth
| Méthode | Route                        | Description               |
|---------|------------------------------|---------------------------|
| POST    | `/api/auth/register`         | Inscription               |
| POST    | `/api/auth/verify-otp`       | Vérification OTP          |
| POST    | `/api/auth/login`            | Connexion → JWT token     |
| GET     | `/api/auth/me`               | Profil utilisateur        |
| POST    | `/api/auth/logout`           | Déconnexion               |
| POST    | `/api/auth/forgot-password`  | Récupération mot de passe |
| POST    | `/api/auth/reset-password`   | Réinitialisation          |

### Wallet
| Méthode | Route                                    | Description              |
|---------|------------------------------------------|--------------------------|
| GET     | `/api/wallet/balance`                    | Solde du wallet          |
| GET     | `/api/wallet/history`                    | Historique transactions  |
| POST    | `/api/wallet/recharge`                   | Demande de recharge      |
| GET     | `/api/admin/wallets`                     | Liste tous les wallets   |
| GET     | `/api/admin/wallets/pending`             | Recharges en attente     |
| POST    | `/api/admin/wallets/{userId}/add-funds`  | Ajouter des fonds        |
| POST    | `/api/admin/wallets/recharge/{id}/validate` | Valider/rejeter recharge |

### Leads / Commandes
| Méthode | Route                                   | Description               |
|---------|-----------------------------------------|---------------------------|
| GET     | `/api/leads`                            | Mes commandes             |
| POST    | `/api/leads`                            | Créer une commande        |
| GET     | `/api/leads/{id}`                       | Détail commande           |
| GET     | `/api/leads/dashboard`                  | Stats media buyer         |
| GET     | `/api/admin/leads`                      | Toutes les commandes      |
| PUT     | `/api/admin/leads/{id}/status`          | Changer statut commande   |
| PUT     | `/api/admin/leads/{id}/production`      | Statut production         |
| PUT     | `/api/admin/leads/{id}/print`           | Statut impression         |
| PUT     | `/api/admin/leads/{id}/shipping`        | Statut expédition         |

### Produits & Catégories
| Méthode | Route                          | Description             |
|---------|--------------------------------|-------------------------|
| GET     | `/api/products`                | Liste produits          |
| GET     | `/api/categories`              | Liste catégories        |
| POST    | `/api/admin/products`          | Créer produit           |
| PUT     | `/api/admin/products/{id}`     | Modifier produit        |
| DELETE  | `/api/admin/products/{id}`     | Supprimer produit       |
| POST    | `/api/admin/categories`        | Créer catégorie         |
| PUT     | `/api/admin/categories/{id}`   | Modifier catégorie      |

---

## Modèles de données

### Users
```sql
id, nom, email, telephone, mot_de_passe (hashed), role (admin|mediabuyer|printer),
statut (active|inactive), email_verified, otp_code, otp_expires,
reset_token, reset_expires, created_at
```

### Wallets
```sql
id, user_id (FK), balance (decimal), created_at
```

### Wallet Transactions
```sql
id, wallet_id (FK), type (credit|debit|recharge_request|recharge_approved|recharge_rejected|admin_add),
montant, description, statut (pending|approved|rejected),
reference_id, created_at
```

### Products
```sql
id, nom, description, prix, category_id (FK), jours_production,
image_url, actif (boolean), created_at
```

### Leads (Commandes)
```sql
id, reference, mediabuyer_id (FK), client_id (FK), product_id (FK),
last_mile_id (FK), montant_total, statut (pending|confirmed|shipped|delivered|returned|cancelled),
statut_production (pending|in_production|ready), statut_impression (pending|printed),
notes, created_at
```

### Clients
```sql
id, nom, telephone, ville, adresse, mediabuyer_id (FK), created_at
```

---

## Installation & développement

### Prérequis
- PHP 8.2+, Composer
- Node.js 18+, npm
- SQLite (inclus dans PHP)

### Backend Laravel
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan jwt:secret
php artisan migrate:fresh --seed
php artisan serve --port=8000
```

### Frontend React
```bash
cd frontend
npm install
# Créer .env
echo "VITE_API_URL=http://localhost:8000/api" > .env
npm run dev    # dev server port 5173
npm run build  # build de production
```

### PM2 (production)
```bash
cd /home/user/webapp
pm2 start ecosystem.config.cjs
pm2 list
```

---

## Déploiement

### Services actifs (sandbox)
| Service        | URL                                                              | Port |
|----------------|------------------------------------------------------------------|------|
| Laravel API    | https://8000-i3o32hjoo5adgwpczpf1p-02b9cc79.sandbox.novita.ai   | 8000 |
| React Frontend | https://5173-i3o32hjoo5adgwpczpf1p-02b9cc79.sandbox.novita.ai   | 5173 |

### Stack de déploiement
- **Backend** : Laravel 12 (PHP 8.2) + SQLite
- **Frontend** : React 18 + TypeScript + Vite + TailwindCSS + Lucide React
- **Auth** : JWT (tymon/jwt-auth)
- **Serveur** : PM2 process manager
- **Status** : ✅ Actif (sandbox)

---

## Prochaines étapes

### 🔧 À améliorer (priorité haute)
- [ ] Notifications email réelles (SMTP / Mailtrap)
- [ ] Upload d'images pour les produits (stockage S3/local)
- [ ] Export PDF des étiquettes (génération label)
- [ ] Pagination côté serveur pour toutes les listes
- [ ] Tests unitaires et d'intégration (PHPUnit + Vitest)

### 🚀 Nouvelles fonctionnalités
- [ ] Système de notification temps réel (Pusher / WebSockets)
- [ ] Intégration tracking transporteurs (Amana, Chronopost)
- [ ] Dashboard analytics avancé (graphiques, exports Excel)
- [ ] Module de facturation (PDF invoices)
- [ ] API webhook pour les mises à jour de statut

### 🔒 Sécurité & Robustesse
- [ ] Rate limiting sur les routes API
- [ ] Validation plus stricte des données
- [ ] Logs d'audit (qui a changé quoi)
- [ ] Double authentification (2FA)
- [ ] Déploiement VPS/Cloud avec HTTPS (Nginx + SSL)

---

*Dernière mise à jour : Mars 2026 — MaghrebLabel MVP v1.0*
