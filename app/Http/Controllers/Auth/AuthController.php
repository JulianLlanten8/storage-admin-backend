<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\{JsonResponse, Request};
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    use ApiResponse;

    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
            return $this->errorResponse(
                'Credenciales incorrectas, por favor verifica tu email y contraseña',
                'Credenciales incorrectas',
                401
            );
        }

        $user = $request->user();
        // Cargar las relaciones necesarias
        $user->load(['roles', 'permissions']);

        $token = $user->createToken('api-token')->plainTextToken;

        return $this->successResponse([
            'token' => $token,
            'user' => $user,
            'abilities' => [
                'roles' => $user->roles->pluck('name'),
                'permissions' => $user->permissions->pluck('name'),
            ]
        ], 'Inicio de sesión exitoso', 200);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return $this->successResponse(null, 'Sesión cerrada');
    }
}
