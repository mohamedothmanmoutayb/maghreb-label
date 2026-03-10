<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LastMileController;
use App\Http\Controllers\RequestLabelController;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
});

// Authenticated routes
Route::middleware('jwt.auth')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);

    // User profile
    Route::get('user/profile', [UserController::class, 'profile']);
    Route::put('user/profile', [UserController::class, 'updateProfile']);

    // Wallet
    Route::get('wallet/balance', [WalletController::class, 'balance']);
    Route::get('wallet/history', [WalletController::class, 'history']);
    Route::post('wallet/recharge', [WalletController::class, 'requestRecharge']);

    // Products (read)
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{id}', [ProductController::class, 'show']);
    Route::get('categories', [ProductController::class, 'categories']);

    // Leads (MediaBuyer)
    Route::get('leads', [LeadController::class, 'index']);
    Route::post('leads', [LeadController::class, 'store']);
    Route::get('leads/dashboard', [LeadController::class, 'dashboardStats']);
    Route::get('leads/{id}', [LeadController::class, 'show']);

    // Last Mile
    Route::get('last-miles', [LastMileController::class, 'index']);
    Route::get('last-miles/my-integrations', [LastMileController::class, 'myIntegrations']);
    Route::post('last-miles/integrations', [LastMileController::class, 'storeIntegration']);

    // Label Requests
    Route::get('requests', [RequestLabelController::class, 'index']);
    Route::post('requests', [RequestLabelController::class, 'store']);

    // Admin routes
    Route::middleware('jwt.auth:admin')->prefix('admin')->group(function () {
        // Dashboard
        Route::get('dashboard', [LeadController::class, 'adminDashboardStats']);

        // Users management
        Route::get('users', [UserController::class, 'adminIndex']);
        Route::post('users', [UserController::class, 'adminCreate']);
        Route::get('users/{id}', [UserController::class, 'adminShow']);
        Route::put('users/{id}', [UserController::class, 'adminUpdate']);
        Route::delete('users/{id}', [UserController::class, 'adminDelete']);

        // Wallets management
        Route::get('wallets', [WalletController::class, 'adminListWallets']);
        Route::get('wallets/pending', [WalletController::class, 'adminPendingRecharges']);
        Route::post('wallets/{userId}/add-funds', [WalletController::class, 'adminAddFunds']);
        Route::get('wallets/user/{userId}', [WalletController::class, 'adminUserWallet']);
        Route::post('wallets/recharge/{id}/validate', [WalletController::class, 'adminValidateRecharge']);

        // Products management
        Route::get('products', [ProductController::class, 'allProducts']);
        Route::post('products', [ProductController::class, 'store']);
        Route::put('products/{id}', [ProductController::class, 'update']);
        Route::delete('products/{id}', [ProductController::class, 'destroy']);

        // Categories management
        Route::post('categories', [ProductController::class, 'storeCategory']);
        Route::put('categories/{id}', [ProductController::class, 'updateCategory']);
        Route::delete('categories/{id}', [ProductController::class, 'destroyCategory']);

        // Leads management
        Route::get('leads', [LeadController::class, 'adminIndex']);
        Route::get('leads/{id}', [LeadController::class, 'adminShow']);
        Route::put('leads/{id}/status', [LeadController::class, 'updateStatus']);
        Route::put('leads/{id}/production', [LeadController::class, 'updateProductionStatus']);
        Route::put('leads/{id}/print', [LeadController::class, 'updatePrintStatus']);
        Route::put('leads/{id}/shipping', [LeadController::class, 'updateShippingStatus']);

        // Last Miles management
        Route::get('last-miles', [LastMileController::class, 'adminIndex']);
        Route::post('last-miles', [LastMileController::class, 'adminStore']);
        Route::put('last-miles/{id}', [LastMileController::class, 'adminUpdate']);
        Route::delete('last-miles/{id}', [LastMileController::class, 'adminDelete']);

        // Label Requests management
        Route::get('requests', [RequestLabelController::class, 'adminIndex']);
        Route::put('requests/{id}/validate', [RequestLabelController::class, 'adminValidate']);
    });

    // Printer routes
    Route::middleware('jwt.auth:printer,admin')->prefix('printer')->group(function () {
        Route::get('queue', [LeadController::class, 'printerQueue']);
        Route::put('leads/{id}/print', [LeadController::class, 'updatePrintStatus']);
    });
});
