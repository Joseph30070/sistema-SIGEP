<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluacionPersonal extends Model
{
    use HasFactory;

    protected $table = 'evaluaciones_personal';

    protected $fillable = [
        'usuario_id',
        'supervisor_id',
        'periodo',
        'periodo_inicio',
        'periodo_fin',
        'total_actividades',
        'actividades_completadas',
        'actividades_aprobadas',
        'actividades_observadas',
        'actividades_retrasadas',
        'promedio_avance',
        'tasa_cumplimiento',
        'observacion_supervisor',
        'puntaje',
        'estado', // 'borrador', 'finalizada'
    ];

    protected function casts(): array
    {
        return [
            'periodo_inicio' => 'date',
            'periodo_fin' => 'date',
            'promedio_avance' => 'float',
            'tasa_cumplimiento' => 'float',
        ];
    }

    // Compatibilidad con frontend que aún usa nombres en inglés
    public function getPeriodAttribute()
    {
        return $this->periodo;
    }

    public function getPeriodStartAttribute()
    {
        return $this->periodo_inicio;
    }

    public function getPeriodEndAttribute()
    {
        return $this->periodo_fin;
    }

    public function getUserIdAttribute()
    {
        return $this->usuario_id;
    }

    public function getTotalActivitiesAttribute()
    {
        return $this->total_actividades;
    }

    public function getCompletedActivitiesAttribute()
    {
        return $this->actividades_completadas;
    }

    public function getApprovedActivitiesAttribute()
    {
        return $this->actividades_aprobadas;
    }

    public function getObservedActivitiesAttribute()
    {
        return $this->actividades_observadas;
    }

    public function getDelayedActivitiesAttribute()
    {
        return $this->actividades_retrasadas;
    }

    public function getAverageProgressAttribute()
    {
        return $this->promedio_avance;
    }

    public function getComplianceRateAttribute()
    {
        return $this->tasa_cumplimiento;
    }

    public function getSupervisorObservationAttribute()
    {
        return $this->observacion_supervisor;
    }

    public function getScoreAttribute()
    {
        return $this->puntaje;
    }

    public function getStatusAttribute()
    {
        return $this->estado;
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function detalles()
    {
        return $this->hasMany(EvaluacionDetalle::class, 'evaluacion_id');
    }
}
