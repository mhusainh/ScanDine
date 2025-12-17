<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\MenuItemController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ModifierGroupController;
use App\Http\Controllers\Admin\ModifierItemController;
use App\Http\Controllers\Admin\TableController;

// API Routes for User
Route::get('/api/menu', [MenuController::class, 'index']);

// API Routes for Admin
Route::prefix('api/admin')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    
    // Menu Management
    Route::get('/menu-items', [MenuItemController::class, 'index']);
    Route::post('/menu-items', [MenuItemController::class, 'store']);
    Route::get('/menu-items/{id}', [MenuItemController::class, 'show']);
    Route::put('/menu-items/{id}', [MenuItemController::class, 'update']); // Note: Cloudinary upload might need POST with _method=PUT
    Route::delete('/menu-items/{id}', [MenuItemController::class, 'destroy']);
    Route::post('/menu-items/{id}/toggle-availability', [MenuItemController::class, 'toggleAvailable']);

    // Tables
    Route::get('/tables', [TableController::class, 'apiIndex']);
    Route::post('/tables', [TableController::class, 'apiStore']);
    Route::put('/tables/{id}', [TableController::class, 'apiUpdate']);
    Route::delete('/tables/{id}', [TableController::class, 'apiDestroy']);
});

// Admin Web Routes (Consumed by React via submitToBlade / Form Post)
Route::prefix('admin')->name('admin.')->group(function () {
    // Categories
    Route::resource('categories', CategoryController::class);
    Route::post('categories/{id}/toggle-active', [CategoryController::class, 'toggleActive'])->name('categories.toggle-active');

    // Modifier Groups
    Route::resource('modifier-groups', ModifierGroupController::class);

    // Modifier Items (Nested under Modifier Groups)
    Route::resource('modifier-groups.modifier-items', ModifierItemController::class)->shallow();
    Route::post('modifier-groups/{modifierGroup}/modifier-items/{modifierItem}/toggle-available', [ModifierItemController::class, 'toggleAvailable'])->name('modifier-items.toggle-available');

    // Tables
    Route::resource('tables', TableController::class);
    Route::get('tables/{id}/download-qr-code', [TableController::class, 'downloadQrCode'])->name('tables.download-qr-code');
    Route::get('tables/{id}/show-qr-code', [TableController::class, 'showQrCode'])->name('tables.show-qr-code');
});

// Public Menu Route
Route::get('/menu/{table}', [MenuController::class, 'index'])->name('menu.index');

// SPA Catch-all Route (Must be last)
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
