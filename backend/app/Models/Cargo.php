<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cargo extends Model
{
    use HasFactory;

    protected $table = 'cargos';

    protected $fillable = [
        'nombre',
        'departamento_id',
        'nivel_jerarquico', // 'directivo', 'supervision', 'operativo', 'practicas'
        'salario_base',
        'descripcion',
        'estado',
    ];

    public function departamento()
    {
        return $this->belongsTo(Departamento::class, 'departamento_id');
    }

    public function usuarios()
    {
        return $this->hasMany(User::class, 'cargo_id');
    }
}

