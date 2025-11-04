<?php

use Illuminate\Support\Facades\Route;

// Sirve los archivos HTML estáticos
Route::get('/', function () {
    return file_get_contents(public_path('index.html'));
});

Route::get('/user', function () {
    return file_get_contents(public_path('user.html'));
});

Route::get('/admin', function () {
    return file_get_contents(public_path('admin.html'));
});

// Ruta de fallback para archivos estáticos (CSS, JS, etc.)
Route::get('/{file}', function ($file) {
    $path = public_path($file);

    if (file_exists($path) && is_file($path)) {
        return response()->file($path);
    }

    abort(404);
})->where('file', '.*');
