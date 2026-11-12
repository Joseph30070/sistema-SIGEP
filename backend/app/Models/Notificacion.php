<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    use HasFactory;

    protected $table = 'notificaciones';

    protected $fillable = [
        'usuario_id',
        'titulo',
        'mensaje',
        'tipo', // 'actividad_asignada', 'observacion', 'aprobacion', 'revision_solicitada', 'actividad_actualizada'
        'actividad_id',
        'leida',
    ];

    protected function casts(): array
    {
        return [
            'leida' => 'boolean',
        ];
    }

    // Compatibilidad
    public function getTitleAttribute()
    {
        return $this->titulo;
    }

    public function getMessageAttribute()
    {
        return $this->mensaje;
    }

    public function getTypeAttribute()
    {
        return $this->tipo;
    }

    public function getIsReadAttribute()
    {
        return $this->leida;
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function actividad()
    {
        return $this->belongsTo(Actividad::class, 'actividad_id');
    }
}
