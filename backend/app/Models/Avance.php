<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Avance extends Model
{
    use HasFactory;

    protected $table = 'avances';

    // Inmutable: los avances nunca se sobreescriben ni alteran en su historial
    protected $fillable = [
        'actividad_id',
        'usuario_id',
        'descripcion',
        'porcentaje_reportado',
        'archivo_evidencia',
        'nombre_original_archivo',
    ];

    // Compatibilidad
    public function getDescriptionAttribute()
    {
        return $this->descripcion;
    }

    public function getReportedPercentageAttribute()
    {
        return $this->porcentaje_reportado;
    }

    public function getEvidenceFileAttribute()
    {
        return $this->archivo_evidencia;
    }

    public function actividad()
    {
        return $this->belongsTo(Actividad::class, 'actividad_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
