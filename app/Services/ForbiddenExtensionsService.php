<?php

namespace App\Services;

use App\Models\ForbiddenExtension;
use Illuminate\Support\Facades\Log;

/**
 * Obtiene lista de extensiones prohibidas y valida extensiones.
 */
class ForbiddenExtensionsService
{
    /**
     * Verifica si una extensión está prohibida.
     *
     * @param  string  $extension  La extensión a verificar.
     * @return bool True si está prohibida, false si no.
     */
    public function isForbidden(string $extension): bool
    {
        return ForbiddenExtension::where('extension', strtolower($extension))->exists();
    }

    /**
     * Devuelve todas las extensiones prohibidas.
     */
    public function getAll(): array
    {
        return ForbiddenExtension::pluck('extension')->toArray();
    }

    /**
     * Agrega una nueva extensión.
     */
    public function add(string $extension): void
    {
        ForbiddenExtension::firstOrCreate(['extension' => strtolower($extension)]);
    }

    /**
     * Elimina una extensión.
     *
     * @param  string  $extension  La extensión a eliminar.
     */
    public function remove(string $extension): void
    {
        ForbiddenExtension::where('extension', strtolower($extension))->delete();
        // Log::info("Extensión prohibida eliminada: {$e}, Por el usuario " . auth()->name());
    }
}
