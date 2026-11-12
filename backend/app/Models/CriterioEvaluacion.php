<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CriterioEvaluacion extends Model
{
    use HasFactory;

    protected $table = 'criterios_evaluacion';

    protected $fillable = [
        'nombre',
        'descripcion',
        'categoria',
        'peso_porcentaje',
        'estado',
    ];

    public function detalles()
    {
        return $this->hasMany(EvaluacionDetalle::class, 'criterio_id');
    }
}

