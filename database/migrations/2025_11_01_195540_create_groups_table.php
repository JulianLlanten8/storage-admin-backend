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
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique()->comment('Nombre del grupo');
            $table->unsignedInteger('quota_mb')->nullable()->comment('Límite de almacenamiento en MB para el grupo');
            $table->text('description')->nullable()->comment('Descripción del grupo');
            $table->timestamps();

            // Índice para búsquedas
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('groups');
    }
};
