<?php

namespace App\Services;

use App\Models\StorageSetting;
use App\Models\User;

class SettingsService
{
    /**
     * Obtiene la cuota efectiva en bytes para un usuario.
     * Prioridad: usuario > grupo > global.
     */
    public function getUserQuota(User $user): int
    {
        // Usuario
        if ($user->quota_mb) {
            return $user->quota_mb * 1024 * 1024;
        }

        // Grupo (si tienes una tabla groups con relación user->group)
        if ($user->group?->quota_mb) {
            return $user->group->quota_mb * 1024 * 1024;
        }

        // Global
        $global = StorageSetting::where('key', 'global_quota')->value('value') ?? 10;

        return (int) $global * 1024 * 1024;
    }

    public function updateGlobalQuota(int $mb): void
    {
        StorageSetting::updateOrInsert(['key' => 'global_quota'], ['value' => $mb]);
    }
}
