<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BitacoraAuditoria extends Model
{
    use HasFactory;

    protected $table = 'bitacora_auditorias';

    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'modulo',
        'accion',
        'descripcion',
        'ip_origen',
        'datos_previos',
        'datos_posteriores',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'datos_previos' => 'array',
            'datos_posteriores' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public static function registrar($usuarioId, $modulo, $accion, $descripcion, $datosPrevios = null, $datosPosteriores = null)
    {
        return self::create([
            'usuario_id' => $usuarioId,
            'modulo' => $modulo,
            'accion' => $accion,
            'descripcion' => $descripcion,
            'ip_origen' => request()?->ip() ?? '127.0.0.1',
            'datos_previos' => $datosPrevios,
            'datos_posteriores' => $datosPosteriores,
            'created_at' => now(),
        ]);
    }
}

