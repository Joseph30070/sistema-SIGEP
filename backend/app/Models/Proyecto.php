<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proyecto extends Model
{
    use HasFactory;

    protected $table = 'proyectos';

    protected $fillable = [
        'nombre',
        'descripcion',
        'estado', // 'planificado', 'en_progreso', 'pausado', 'completado', 'cancelado'
        'prioridad', // 'baja', 'media', 'alta', 'urgente'
        'fecha_inicio',
        'fecha_fin_estimada',
        'fecha_fin_real',
        'supervisor_id',
        'equipo_id',
        'departamento_id',
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

    public function getStatusAttribute()
    {
        return $this->estado;
    }

    public function getPriorityAttribute()
    {
        return $this->prioridad;
    }

    public function getStartDateAttribute()
    {
        return $this->fecha_inicio;
    }

    public function getEstimatedEndDateAttribute()
    {
        return $this->fecha_fin_estimada;
    }

    public function getActualEndDateAttribute()
    {
        return $this->fecha_fin_real;
    }

    public function departamento()
    {
        return $this->belongsTo(Departamento::class, 'departamento_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    public function actividades()
    {
        return $this->hasMany(Actividad::class, 'proyecto_id');
    }
}
