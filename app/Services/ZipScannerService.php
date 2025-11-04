<?php

namespace App\Services;

use ZipArchive;

/**
 * Analiza .zip para detectar archivos prohibidos antes de guardar.
 */
class ZipScannerService
{
    protected ForbiddenExtensionsService $forbiddenService;

    public function __construct(ForbiddenExtensionsService $forbiddenService)
    {
        $this->forbiddenService = $forbiddenService;
    }

    /**
     * Revisa si un ZIP contiene archivos con extensiones prohibidas.
     *
     * @param  string  $zipPath  Ruta al archivo ZIP a escanear.
     * @return array Lista de archivos prohibidos encontrados.
     */
    public function containsForbiddenFiles(string $zipPath): array
    {
        $zip = new ZipArchive;
        // Abrir el archivo ZIP
        if ($zip->open($zipPath) === true) {
            // si abre correctamente, se itera sobre los archivos
            for ($i = 0; $i < $zip->numFiles; $i++) {
                // Se obtiene el nombre del archivo
                $stat = $zip->statIndex($i);
                $name = $stat['name'];
                $ext = pathinfo($name, PATHINFO_EXTENSION);

                // Si la extensión está prohibida, se retorna true, que indica presencia de archivo prohibido 🚨
                if ($this->forbiddenService->isForbidden($ext)) {
                    $zip->close();

                    return ['contains' => true, 'filename' => $name];
                }
            }
            $zip->close();
        }

        // Si no se encontraron archivos prohibidos, se retorna false ✅
        return ['contains' => false];
    }
}
