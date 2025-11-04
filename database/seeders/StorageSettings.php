<?php

namespace Database\Seeders;

use App\Models\StorageSetting;
use Illuminate\Database\Seeder;

class StorageSettings extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'global_quota',
                'value' => '10', // 10 GB en MB
                'description' => 'Cuota global de almacenamiento en MB para todos los usuarios que no tienen una cuota específica.',
            ],
            [
                'key' => 'default_file_expiration_days',
                'value' => '30',
                'description' => 'Número de días después de los cuales los archivos se consideran expirados y pueden ser eliminados automáticamente.',
            ],
            [
                'key' => 'max_upload_size_mb',
                'value' => '5120', // 5 GB en MB
                'description' => 'Tamaño máximo permitido para subir un solo archivo en MB.',
            ],
        ];

        foreach ($settings as $setting) {
            StorageSetting::updateOrCreate(
                ['key' => $setting['key']],
                ['value' => $setting['value'], 'description' => $setting['description']]
            );
        }
    }
}
