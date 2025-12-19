<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MenuController;

// Public Menu Route (React App Entry Point)
Route::get('/menu/{table}', function () {
    return view('welcome'); // Assuming 'welcome' is the React app view
})->name('menu.index');

// SPA Catch-all Route (Must be last)
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
