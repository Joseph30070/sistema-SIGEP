<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RevisionHistorial extends Model
{
    use HasFactory;

    protected $table = 'revisiones_historial';

    protected $fillable = [
        'actividad_id',
        'usuario_id',
        'accion', // 'solicitud_revision', 'observacion', 'correccion', 'aprobacion'
        'comentario',
        'requerimientos_correccion',
        'porcentaje_asignado',
        'archivo_evidencia',
    ];

    // Compatibilidad
    public function getActionAttribute()
    {
        return $this->accion;
    }

    public function getCommentAttribute()
    {
        return $this->comentario;
    }

    public function getCorrectionRequirementsAttribute()
    {
        return $this->requerimientos_correccion;
    }

    public function getAssignedPercentageAttribute()
    {
        return $this->porcentaje_asignado;
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
