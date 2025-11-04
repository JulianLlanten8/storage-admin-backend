<?php

namespace App\Services;

class FileUploadService
{
    public function __construct(
        private QuotaService $quota,
        private ForbiddenExtensionsService $forbidden,
        private ZipScannerService $zip,
        private SettingsService $settings
    ) {}

    /**
     * Subir un archivo con todas las validaciones necesarias
     *
     * @param  $file  - Archivo a analizar y subir
     * @param  mixed  $user  - Usuario que sube el archivo
     * @return array{error?: string, success?: bool, message?: string, file?: array{filename: mixed, original_name: mixed, size: mixed}}
     */
    public function uploadFile($file, $user)
    {
        $maxQuota = $this->settings->getUserQuota($user);

        $extension = $file->getClientOriginalExtension();

        // Extensión prohibida
        if ($this->forbidden->isForbidden($extension)) {
            return ['error' => "La extensión .{$extension} no está permitida"];
        }

        // Si es zip, revisarlo
        if (strtolower($extension) === 'zip' && $file->isValid()) {
            $scanResult = $this->zip->containsForbiddenFiles($file->getPathname());

            // Si contiene archivos prohibidos, retornar el error
            if ($scanResult['contains'] === true) {
                $forbiddenFileName = $scanResult['filename'];

                return ['error' => "El archivo '{$forbiddenFileName}' dentro del .zip no está permitido"];
            }
        }

        // Verificar cuota (espacio disponible)
        if (! $this->quota->canUpload($user->id, $maxQuota, $file->getSize())) {
            return ['error' => 'No tienes suficiente espacio para subir este archivo'];
        }

        // Guardar archivo finalmente
        $path = $file->storeAs("files/{$user->id}", $file->hashName());

        $newFile = [
            'filename' => $path,
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
        ];

        $user->files()->create($newFile);

        return [
            'success' => true,
            'message' => 'Archivo subido con éxito.',
            'file' => $newFile,
        ];
    }
}
