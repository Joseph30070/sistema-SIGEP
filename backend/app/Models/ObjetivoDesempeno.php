<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ObjetivoDesempeno extends Model
{
    use HasFactory;

    protected $table = 'objetivos_desempeno';

    protected $fillable = [
        'usuario_id',
        'supervisor_id',
        'titulo',
        'descripcion',
        'meta_cuantitativa',
        'progreso_actual',
        'unidad_medida',
        'fecha_limite',
        'estado', // 'en_progreso', 'cumplido', 'no_cumplido', 'cancelado'
    ];

    protected function casts(): array
    {
        return [
            'fecha_limite' => 'date',
            'meta_cuantitativa' => 'float',
            'progreso_actual' => 'float',
        ];
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }
}

