<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

trait ApiResponse
{
    /**
     * Genera una respuesta de éxito (códigos HTTP 2xx).
     * La data se fusiona en el objeto JSON principal junto a 'message' y 'error: null'.
     *
     * @param  mixed  $data  Datos a incluir en la respuesta
     * @param  string  $message  Mensaje de éxito
     * @param  int  $code  Código HTTP de la respuesta
     */
    protected function successResponse($data = [], string $message = 'Operación completada con éxito.', int $code = Response::HTTP_OK): JsonResponse
    {
        $response = [
            'data' => $data,
            'message' => $message,
            'error' => null, // El error es nulo en caso de éxito
        ];

        return response()->json($response, $code);
    }

    /**
     * Genera una respuesta de error HTTP 4xx o 5xx.
     * Asegura que el campo 'data' esté ausente y que 'error' contenga detalles.
     *
     * @param  string  $error  Detalles del error
     * @param  string  $message  Mensaje general del error
     * @param  int  $code  Código HTTP de la respuesta
     * @param  mixed  $data  Datos adicionales opcionales
     */
    protected function errorResponse(string $error, string $message = 'Ha ocurrido un error en el servidor.', int $code = Response::HTTP_INTERNAL_SERVER_ERROR, $data = null): JsonResponse
    {
        $response = [
            'message' => $message,
            'error' => $error,
        ];

        // Si se necesita, agrega datos adicionales a la respuesta.
        if (! is_null($data)) {
            $response['data'] = $data;
        }

        return response()->json($response, $code);
    }
}
