<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipo extends Model
{
    use HasFactory;

    protected $table = 'equipos';

    protected $fillable = [
        'nombre',
        'descripcion',
        'departamento_id',
        'supervisor_id',
    ];

    // Compatibilidad
    public function getNameAttribute()
    {
        return $this->nombre;
    }

    public function getDescriptionAttribute()
    {
        return $this->descripcion;
    }

    public function departamento()
    {
        return $this->belongsTo(Departamento::class, 'departamento_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function miembros()
    {
        return $this->belongsToMany(User::class, 'equipo_usuario', 'equipo_id', 'usuario_id')
                    ->withPivot('rol_en_equipo')
                    ->withTimestamps();
    }

    public function proyectos()
    {
        return $this->hasMany(Proyecto::class, 'equipo_id');
    }
}
