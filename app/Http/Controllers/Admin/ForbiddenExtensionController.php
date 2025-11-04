<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ForbiddenExtensionsService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ForbiddenExtensionController extends Controller
{
    use ApiResponse;

    protected ForbiddenExtensionsService $service;

    public function __construct(ForbiddenExtensionsService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return $this->successResponse($this->service->getAll());
    }

    public function store(Request $request)
    {
        $request->validate(['extension' => 'required|string|max:10']);
        $this->service->add($request->extension);

        return $this->successResponse([], 'Extensión agregada');
    }

    public function destroy(string $extension)
    {
        if (empty($extension)) {
            return $this->errorResponse('Extensión no proporcionada', 'Se requiere una extensión válida', 400);
        }

        if (! in_array(strtolower($extension), $this->service->getAll())) {
            return $this->errorResponse('La extensión no existe en la lista de prohibidas', 'Se requiere una extensión válida', 404);
        }

        $this->service->remove($extension);

        return $this->successResponse([], 'Extensión eliminada');
    }
}
