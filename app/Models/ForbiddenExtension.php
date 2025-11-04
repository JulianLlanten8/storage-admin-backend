<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForbiddenExtension extends Model
{
    protected $fillable = [
        'extension',
    ];

    /**
     * Verificar si una extensión está prohibida.
     */
    public static function isForbidden(string $extension): bool
    {
        return self::where('extension', strtolower($extension))->exists();
    }

    /**
     * Obtener todas las extensiones prohibidas.
     */
    public static function getAllExtensions(): array
    {
        return self::pluck('extension')->toArray();
    }

    /**
     * Boot del modelo. Siempre convertir a minúsculas
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->extension = strtolower($model->extension);
        });

        static::updating(function ($model) {
            $model->extension = strtolower($model->extension);
        });
    }
}
