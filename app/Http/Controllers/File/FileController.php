<?php

namespace App\Http\Controllers\File;

use App\Http\Controllers\Controller;
use App\Http\Requests\File\FilePostRequest;
use App\Services\FileUploadService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class FileController extends Controller
{
    use ApiResponse;

    /**
     * Lista los archivos del usuario autenticado.
     */
    public function index(Request $request)
    {
        $files = $request->user()->files()->latest()->get();

        return $this->successResponse($files);
    }

    /**
     * Subir un nuevo archivo
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function upload(FilePostRequest $request, FileUploadService $fileUploadService)
    {
        $user = $request->user();
        $file = $request->file('file');

        $result = $fileUploadService->uploadFile($file, $user);

        if (isset($result['error'])) {
            return $this->errorResponse($result['error'], 'Error al subir el archivo', 400);
        }

        return $this->successResponse($result, 201);
    }

    /**
     * Descargar un archivo
     *
     * @param  mixed  $id
     * @return \Illuminate\Http\JsonResponse|\Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function download(Request $request, $id)
    {
        $file = $request->user()->files()->find($id);

        if (! $file) {
            return $this->errorResponse('Archivo no encontrado', 'No se pudo encontrar el archivo', 404);
        }

        return response()->download(storage_path("app/private/{$file->filename}"), $file->original_name);
    }

    /**
     * Eliminar un archivo
     *
     * @param  mixed  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, $id)
    {
        $file = $request->user()->files()->find($id);
        if (! $file) {
            return $this->errorResponse('Archivo no encontrado', 'No se pudo encontrar el archivo', 404);
        }
        // Eliminar el archivo del almacenamiento
        $file->delete();

        return $this->successResponse(null, 'Archivo eliminado con éxito');
    }
}
