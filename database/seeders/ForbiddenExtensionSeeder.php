<?php

namespace Database\Seeders;

use App\Models\ForbiddenExtension;
use Illuminate\Database\Seeder;

class ForbiddenExtensionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $forbiddenExtensions = [
            'exe',
            'bat',
            'cmd',
            'sh',
            'js',
            'php',
            'pl',
            'rb',
            'jar',
            'com',
        ];

        foreach ($forbiddenExtensions as $extension) {
            ForbiddenExtension::firstOrCreate(['extension' => $extension]);
        }
    }
}
