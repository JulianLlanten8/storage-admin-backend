<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    protected $fillable = [
        'name',
        'quota_mb',
        'description',
    ];

    /**
     * Obtiene las conversiones de atributos para el modelo.
     *
     * @return array{quota_mb: string}
     */
    protected function casts(): array
    {
        return [
            'quota_mb' => 'integer',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Obtener el total de usuarios en el grupo.
     */
    public function getUserCountAttribute(): int
    {
        return $this->users()->count();
    }
}
