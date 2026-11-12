<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Actividad extends Model
{
    use HasFactory;

    protected $table = 'actividades';

    protected $fillable = [
        'proyecto_id',
        'titulo',
        'descripcion',
        'planteamiento_problema',
        'trabajo_a_realizar',
        'usuario_asignado_id',
        'supervisor_id',
        'fecha_asignacion',
        'fecha_limite',
        'prioridad', // 'baja', 'media', 'alta', 'urgente'
        'estado', // 'pendiente', 'en_proceso', 'terminada', 'en_revision', 'aprobada', 'observada'
        'porcentaje_avance',
    ];

    // Compatibilidad
    public function getTitleAttribute()
    {
        return $this->titulo;
    }

    public function getDescriptionAttribute()
    {
        return $this->descripcion;
    }

    public function getProblemStatementAttribute()
    {
        return $this->planteamiento_problema;
    }

    public function getWorkToDoAttribute()
    {
        return $this->trabajo_a_realizar;
    }

    public function getAssignedToAttribute()
    {
        return $this->usuario_asignado_id;
    }

    public function getAssignmentDateAttribute()
    {
        return $this->fecha_asignacion;
    }

    public function getDueDateAttribute()
    {
        return $this->fecha_limite;
    }

    public function getPriorityAttribute()
    {
        return $this->prioridad;
    }

    public function getStatusAttribute()
    {
        return $this->estado;
    }

    public function getProgressPercentageAttribute()
    {
        return $this->porcentaje_avance;
    }

    // Relaciones
    public function proyecto()
    {
        return $this->belongsTo(Proyecto::class, 'proyecto_id');
    }

    public function responsable()
    {
        return $this->belongsTo(User::class, 'usuario_asignado_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function avances()
    {
        return $this->hasMany(Avance::class, 'actividad_id')->orderBy('created_at', 'asc');
    }

    public function revisiones()
    {
        return $this->hasMany(RevisionHistorial::class, 'actividad_id')->orderBy('created_at', 'asc');
    }

    public function notificaciones()
    {
        return $this->hasMany(Notificacion::class, 'actividad_id');
    }
}
