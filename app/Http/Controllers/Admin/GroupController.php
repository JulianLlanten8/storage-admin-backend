<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GroupRequest;
use App\Models\Group;
use App\Traits\ApiResponse;

class GroupController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->successResponse(Group::withCount('users')->get());
    }

    public function store(GroupRequest $request)
    {
        $group = Group::create($request->only('name', 'quota_mb'));

        return $this->successResponse($group, 'Grupo creado');
    }

    public function update(GroupRequest $request, Group $group)
    {
        $group->update($request->only('name', 'quota_mb'));

        return $this->successResponse($group, 'Grupo actualizado');
    }

    public function destroy(Group $group)
    {
        if ($group->users()->count() > 0) {
            return $this->errorResponse(
                'No se puede eliminar un grupo con usuarios asignados, revoque los primero',
                message: 'No se puede eliminar un grupo con usuarios asignados',
                code: 400
            );
        }
        $group->delete();

        return $this->successResponse($group, 'Grupo eliminado');
    }
}
