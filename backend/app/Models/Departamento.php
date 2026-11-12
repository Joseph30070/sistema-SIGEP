<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Departamento extends Model
{
    use HasFactory;

    protected $table = 'departamentos';

    protected $fillable = [
        'nombre',
        'codigo',
        'descripcion',
        'responsable_id',
        'estado',
    ];

    public function responsable()
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }

    public function cargos()
    {
        return $this->hasMany(Cargo::class, 'departamento_id');
    }

    public function usuarios()
    {
        return $this->hasMany(User::class, 'departamento_id');
    }

    public function proyectos()
    {
        return $this->hasMany(Proyecto::class, 'departamento_id');
    }

    public function equipos()
    {
        return $this->hasMany(Equipo::class, 'departamento_id');
    }
}

