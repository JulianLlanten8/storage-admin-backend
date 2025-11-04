<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class File extends Model
{
    protected $fillable = [
        'user_id',
        'filename',
        'original_name',
        'size',
    ];

    /**
     * Obtiene las conversiones de tipos de datos para los atributos del modelo.
     *
     * @return array{size: string, user_id: string}
     */
    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'size' => 'integer',
        ];
    }

    /**
     * Relación: Un archivo pertenece a un usuario.
     *
     * @return BelongsTo<User>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Boot del modelo para manejar cascadas.
     */
    protected static function boot()
    {
        parent::boot();

        // Al eliminar un archivo, eliminar el archivo físico
        static::deleting(function ($file) {
            Storage::delete($file->filename);
        });
    }

    /**
     * Obtener tamaño en formato legible.
     */
    public function getHumanSizeAttribute(): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->size;
        $unitIndex = 0;

        while ($size >= 1024 && $unitIndex < count($units) - 1) {
            $size /= 1024;
            $unitIndex++;
        }

        return round($size, 2).' '.$units[$unitIndex];
    }
}
