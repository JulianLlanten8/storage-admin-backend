<?php

use App\Http\Controllers\Admin\ForbiddenExtensionController;
use App\Http\Controllers\Admin\GroupController;
use App\Http\Controllers\Admin\StorageSettingsController;
use App\Http\Controllers\Admin\UserAdminController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\File\FileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Información del usuario autenticado.
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rutas protegidas de autenticación
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware(['auth:sanctum'])->post('/logout', [AuthController::class, 'logout']);
});

// Rutas para la gestión de archivos
Route::middleware(['auth:sanctum'])->prefix('files')->group(function () {
    // Lista de archivos del usuario autenticado
    Route::get('/', [FileController::class, 'index']);
    // Subir un nuevo archivo
    Route::post('/upload', [FileController::class, 'upload']);
    // Descargar un archivo
    Route::get('/{id}/download', [FileController::class, 'download']);
    // Eliminar un archivo
    Route::delete('/{id}', [FileController::class, 'destroy']);
});

// Rutas administrativas protegidas por middleware de autenticación y rol de administrador
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::prefix('forbidden-extensions')->group(function () {
        // Lista de extensiones prohibidas
        Route::get('/', [ForbiddenExtensionController::class, 'index']);
        // Agregar una nueva extensión prohibida
        Route::post('/', [ForbiddenExtensionController::class, 'store']);
        // Eliminar una extensión prohibida
        Route::delete('/{extension}', [ForbiddenExtensionController::class, 'destroy']);
    });

    Route::prefix('groups')->group(function () {
        // Lista de grupos
        Route::get('/', [GroupController::class, 'index']);
        // Crear un nuevo grupo
        Route::post('/', [GroupController::class, 'store']);
        // Actualizar un grupo existente
        Route::put('/{group}', [GroupController::class, 'update']);
        // Eliminar un grupo
        Route::delete('/{group}', [GroupController::class, 'destroy']);
    });

    Route::prefix('quota')->group(function () {
        Route::get('/global', [StorageSettingsController::class, 'getGlobal']);
        Route::put('/global', [StorageSettingsController::class, 'setGlobal']);
        Route::put('/group/{group}', [StorageSettingsController::class, 'setGroupQuota']);
        Route::put('/user/{user}', [StorageSettingsController::class, 'setUserQuota']);
    });

    Route::prefix('users')->group(function () {
        Route::get('/', [UserAdminController::class, 'index']);
        Route::post('/', [UserAdminController::class, 'store']);
        Route::put('/{user}', [UserAdminController::class, 'update']);
        Route::delete('/{user}', [UserAdminController::class, 'destroy']);
        // Asignaciones
        Route::put('/{user}/group', [UserAdminController::class, 'assignGroup']);
        Route::put('/{user}/role', [UserAdminController::class, 'assignRole']);
    });
});
