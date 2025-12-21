<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\OrderController;
use App\Http\Controllers\Api\Admin\TableController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\MenuItemController;
use App\Http\Controllers\Api\Admin\ModifierGroupController;
use App\Http\Controllers\Api\Admin\ModifierItemController;

// Public Routes (No Version Prefix)
Route::get('/menu', [MenuController::class, 'index']);
Route::get('/menu/{id}', [MenuController::class, 'show']);
Route::get('/tables/list', [TableController::class, 'publicList']);

// Public Routes (V1)
Route::prefix('v1')->group(function () {
    // Auth
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

    // Customer Menu (Public)
    Route::get('/tables/list', [TableController::class, 'publicList']);
    Route::get('/menu', [MenuController::class, 'index']);
    Route::get('/menu/{id}', [MenuController::class, 'show']);

    // Checkout (Public)
    Route::post('/checkout', [CheckoutController::class, 'store']);

    // Payment Callback (Midtrans Webhook)
    Route::post('/payment/callback', [PaymentController::class, 'callback']);

    // Payment Redirect Routes (From Midtrans UI)
    Route::get('/payment/finish', [PaymentController::class, 'finish'])->name('payment.finish');
    Route::get('/payment/unfinish', [PaymentController::class, 'unfinish'])->name('payment.unfinish');
    Route::get('/payment/error', [PaymentController::class, 'error'])->name('payment.error');
});

// Admin Routes (Protected)
// Prefix 'admin' results in '/api/admin/...'
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/search/{orderNumber}', [OrderController::class, 'searchByOrderNumber']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::post('/orders/{id}/confirm-payment', [OrderController::class, 'confirmPayment']);

    // Tables
    Route::apiResource('tables', TableController::class);
    Route::get('/tables/{id}/qr-code', [TableController::class, 'generateQrCode']);
    Route::get('/tables/{id}/qr-code/download', [TableController::class, 'downloadQrCode']);

    // Categories
    Route::apiResource('categories', CategoryController::class);
    Route::post('/categories/{id}/toggle-active', [CategoryController::class, 'toggleActive']);

    // Menu Items
    Route::apiResource('menu-items', MenuItemController::class);
    Route::post('/menu-items/{id}/toggle-availability', [MenuItemController::class, 'toggleAvailable']);
    Route::delete('/menu-items/{id}/image', [MenuItemController::class, 'deleteImage']);

    // Modifier Groups
    Route::apiResource('modifier-groups', ModifierGroupController::class);

    // Modifier Items (nested under modifier groups)
    Route::get('/modifier-groups/{modifierGroupId}/modifier-items', [ModifierItemController::class, 'index']);
    Route::post('/modifier-groups/{modifierGroupId}/modifier-items', [ModifierItemController::class, 'store']);
    Route::get('/modifier-groups/{modifierGroupId}/modifier-items/{id}', [ModifierItemController::class, 'show']);
    Route::put('/modifier-groups/{modifierGroupId}/modifier-items/{id}', [ModifierItemController::class, 'update']);
    Route::delete('/modifier-groups/{modifierGroupId}/modifier-items/{id}', [ModifierItemController::class, 'destroy']);
    Route::post('/modifier-groups/{modifierGroupId}/modifier-items/{id}/toggle-available', [ModifierItemController::class, 'toggleAvailable']);
});
