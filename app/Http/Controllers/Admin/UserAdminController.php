<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\{AssignRequest, PostUserRequest, PutUserRequest};
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Hash;

class UserAdminController extends Controller
{
    use ApiResponse;

    /**
     * Listar todos los usuarios con sus roles y grupo.
     *
     * @return \Illuminate\Http\JsonResponse - Lista de usuarios
     */
    public function index()
    {
        return $this->successResponse(
            User::with(['roles:name', 'group:id,name'])->get()
        );
    }

    /**
     * Crear un nuevo usuario.
     *
     * @param  User  $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(PostUserRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'group_id' => $request->group_id,
        ]);

        return $this->successResponse(
            $user,
            'Usuario creado con éxito.',
            201
        );
    }

    /**
     * Actualizar datos básicos del usuario.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(PutUserRequest $request, User $user)
    {

        $user->update($request->only('name', 'email', 'group_id'));

        return $this->successResponse(
            $user,
            'Usuario actualizado con éxito.'
        );
    }

    /**
     * Eliminar usuario.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(User $user)
    {
        $user->delete();

        return $this->successResponse(
            null,
            'Usuario eliminado con éxito.'
        );
    }

    /**
     * Asignar usuario a un grupo.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function assignGroup(AssignRequest $request, User $user)
    {
        $user->update(['group_id' => $request->group_id]);

        return $this->successResponse(
            $user,
            "Usuario asignado al grupo con ID '{$request->group_id}' con éxito."
        );
    }

    /**
     * Asignar rol al usuario (Spatie Permission).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function assignRole(AssignRequest $request, User $user)
    {
        $user->syncRoles([$request->role]);

        return $this->successResponse(
            $user,
            "Rol '{$request->role}' asignado al usuario con éxito."
        );
    }
}
