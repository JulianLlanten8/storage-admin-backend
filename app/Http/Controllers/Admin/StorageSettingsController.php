<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorageSettingsRequest;
use App\Models\{Group, User};
use App\Services\SettingsService;
use App\Traits\ApiResponse;

class StorageSettingsController extends Controller
{
    use ApiResponse;

    protected SettingsService $settings;

    public function __construct(SettingsService $settings)
    {
        $this->settings = $settings;
    }

    // Límite global
    public function getGlobal()
    {
        return $this->successResponse(
            ['global_quota_mb' => $this->settings->getUserQuota(new User) / 1024 / 1024],
            'Límite global',
            200
        );
    }

    public function setGlobal(StorageSettingsRequest $request)
    {
        $this->settings->updateGlobalQuota($request->quota_mb);

        return $this->successResponse(
            data: null,
            message: 'Límite global actualizado',
        );
    }

    // Límite por grupo
    public function setGroupQuota(StorageSettingsRequest $request, Group $group)
    {
        $group->update(['quota_mb' => $request->quota_mb]);

        return $this->successResponse(
            data: null,
            message: 'Límite del grupo actualizado',
        );
    }

    // Límite por usuario
    public function setUserQuota(StorageSettingsRequest $request, User $user)
    {
        $user->update(['quota_mb' => $request->quota_mb]);

        return $this->successResponse(
            data: null,
            message: 'Límite del usuario actualizado',
        );
    }
}
