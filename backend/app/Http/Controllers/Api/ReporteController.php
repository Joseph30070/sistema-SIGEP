<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\Equipo;
use App\Models\User;
use Illuminate\Http\Request;

class ReporteController extends Controller
{
    // Reporte general de equipos
    public function equipoReporte($equipoId)
    {
        $equipo = Equipo::with(['supervisor', 'miembros.cargo', 'departamento'])->findOrFail($equipoId);
        $miembroIds = $equipo->miembros->pluck('id');

        $actividades = Actividad::whereIn('usuario_asignado_id', $miembroIds)->get();

        $total = $actividades->count();
        $completadas = $actividades->where('estado', 'aprobada')->count();
        $retrasadas = $actividades->where('fecha_limite', '<', now()->toDateString())->where('estado', '!=', 'aprobada')->count();
        $observadas = $actividades->where('estado', 'observada')->count();
        $cumplimiento = $total > 0 ? round(($completadas / $total) * 100, 1) : 0;

        $desgloseMiembros = $equipo->miembros->map(function ($m) {
            $acts = Actividad::where('usuario_asignado_id', $m->id)->get();
            $tot = $acts->count();
            $comp = $acts->where('estado', 'aprobada')->count();
            $ret = $acts->where('fecha_limite', '<', now()->toDateString())->where('estado', '!=', 'aprobada')->count();
            $obs = $acts->where('estado', 'observada')->count();

            $userData = [
                'id' => $m->id,
                'nombre' => $m->nombre,
                'name' => $m->nombre,
                'rol' => $m->rol,
                'role' => $m->rol,
                'cargo' => $m->cargo?->nombre,
                'position' => $m->cargo?->nombre,
            ];

            return [
                'usuario' => $userData,
                'user' => $userData,
                'total' => $tot,
                'completadas' => $comp,
                'retrasadas' => $ret,
                'observadas' => $obs,
                'cumplimiento' => $tot > 0 ? round(($comp / $tot) * 100, 1) : 0,
            ];
        });

        return response()->json([
            'equipo' => $equipo->nombre,
            'departamento' => $equipo->departamento?->nombre,
            'supervisor' => $equipo->supervisor?->nombre ?? 'Sin asignar',
            'integrantes_count' => $equipo->miembros->count(),
            'total_actividades' => $total,
            'completadas' => $completadas,
            'retrasadas' => $retrasadas,
            'observadas' => $observadas,
            'cumplimiento_general' => $cumplimiento,
            'miembros' => $desgloseMiembros,
        ]);
    }

    // Reporte individual de personal
    public function personalReporte($userId)
    {
        $usuario = User::with([
            'cargo',
            'departamento',
            'equipos',
            'evaluacionesRecibidas.supervisor',
            'objetivos',
        ])->findOrFail($userId);

        $actividades = Actividad::where('usuario_asignado_id', $userId)->with('proyecto')->get();

        $total = $actividades->count();
        $aprobadas = $actividades->where('estado', 'aprobada')->count();
        $retrasadas = $actividades->where('fecha_limite', '<', now()->toDateString())->where('estado', '!=', 'aprobada')->count();
        $observadas = $actividades->where('estado', 'observada')->count();
        $enRevision = $actividades->where('estado', 'en_revision')->count();
        $enProceso = $actividades->where('estado', 'en_proceso')->count();
        $avgProgress = $total > 0 ? round($actividades->avg('porcentaje_avance'), 1) : 0;

        return response()->json([
            'usuario' => $usuario,
            'user' => $usuario,
            'resumen' => [
                'total_actividades' => $total,
                'aprobadas' => $aprobadas,
                'en_revision' => $enRevision,
                'en_proceso' => $enProceso,
                'observadas' => $observadas,
                'retrasadas' => $retrasadas,
                'avance_promedio' => $avgProgress,
                'cumplimiento' => $total > 0 ? round(($aprobadas / $total) * 100, 1) : 0,
            ],
            'actividades' => $actividades,
            'evaluaciones' => $usuario->evaluacionesRecibidas,
            'objetivos' => $usuario->objetivos,
        ]);
    }
}
