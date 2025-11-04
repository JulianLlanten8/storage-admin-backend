<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('forbidden_extensions', function (Blueprint $table) {
            $table->id();
            $table->string('extension', 20)->unique()->comment('Extensión prohibida');
            $table->timestamps();

            // Índice para búsquedas rápidas
            $table->index('extension');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forbidden_extensions');
    }
};
