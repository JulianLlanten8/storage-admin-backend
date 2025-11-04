<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RolesAndAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // Crear usuario administrador para administrar los Posts de documentos.
        $admin = User::firstOrCreate(
            ['email' => 'admin@storage.local'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123'),
            ]
        );
        $user = User::firstOrCreate(
            ['email' => 'user@storage.local'],
            [
                'name' => 'user',
                'password' => Hash::make('user123'),
            ]
        );

        // Asignar rol admin
        $admin->assignRole($adminRole);
        $user->assignRole($userRole);
    }
}
