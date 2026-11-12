<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';

    protected $fillable = [
        'nombre',
        'email',
        'password',
        'rol', // 'administrador', 'supervisor', 'colaborador', 'practicante'
        'telefono',
        'dni',
        'departamento_id',
        'cargo_id',
        'estado', // 'activo', 'inactivo'
        'foto_perfil',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Accesorios de compatibilidad para facilitar interoperabilidad con el frontend
    public function getNameAttribute()
    {
        return $this->nombre;
    }

    public function getRoleAttribute()
    {
        return $this->rol;
    }

    public function getPhoneAttribute()
    {
        return $this->telefono;
    }

    public function getPositionAttribute()
    {
        return $this->cargo ? $this->cargo->nombre : null;
    }

    public function getStatusAttribute()
    {
        return $this->estado;
    }

    public function getAvatarAttribute()
    {
        return $this->foto_perfil;
    }

    // Relaciones
    public function departamento()
    {
        return $this->belongsTo(Departamento::class, 'departamento_id');
    }

    public function cargo()
    {
        return $this->belongsTo(Cargo::class, 'cargo_id');
    }

    public function equiposSupervisados()
    {
        return $this->hasMany(Equipo::class, 'supervisor_id');
    }

    public function equipos()
    {
        return $this->belongsToMany(Equipo::class, 'equipo_usuario', 'usuario_id', 'equipo_id')
                    ->withPivot('rol_en_equipo')
                    ->withTimestamps();
    }

    public function proyectosSupervisados()
    {
        return $this->hasMany(Proyecto::class, 'supervisor_id');
    }

    public function actividadesAsignadas()
    {
        return $this->hasMany(Actividad::class, 'usuario_asignado_id');
    }

    public function actividadesSupervisadas()
    {
        return $this->hasMany(Actividad::class, 'supervisor_id');
    }

    public function avances()
    {
        return $this->hasMany(Avance::class, 'usuario_id');
    }

    public function revisiones()
    {
        return $this->hasMany(RevisionHistorial::class, 'usuario_id');
    }

    public function notificaciones()
    {
        return $this->hasMany(Notificacion::class, 'usuario_id')->latest();
    }

    public function evaluacionesRecibidas()
    {
        return $this->hasMany(EvaluacionPersonal::class, 'usuario_id');
    }

    public function evaluacionesRealizadas()
    {
        return $this->hasMany(EvaluacionPersonal::class, 'supervisor_id');
    }

    public function objetivos()
    {
        return $this->hasMany(ObjetivoDesempeno::class, 'usuario_id');
    }

    public function auditorias()
    {
        return $this->hasMany(BitacoraAuditoria::class, 'usuario_id');
    }
}
