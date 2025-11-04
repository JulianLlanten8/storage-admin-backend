<?php

namespace App\Services;

use App\Models\File;

/**
 * Calcula uso actual de espacio | compara contra cuota disponible (global/grupo/usuario)
 */
class QuotaService
{
    /**
     * Obtiene el uso actual de espacio en bytes para un usuario dado.
     */
    public function getUserUsage(int $userId): int
    {
        return File::where('user_id', $userId)->sum('size');
    }

    /**
     * Determina si "puede" subir un nuevo archivo según la cuota máxima (bytes).
     */
    public function canUpload(int $userId, int $maxQuota, int $newFileSize): bool
    {
        $currentUsage = $this->getUserUsage($userId);

        return ($currentUsage + $newFileSize) <= $maxQuota;
    }
}
