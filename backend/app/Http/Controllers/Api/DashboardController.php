<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\Departamento;
use App\Models\Equipo;
use App\Models\EvaluacionPersonal;
use App\Models\ObjetivoDesempeno;
use App\Models\Proyecto;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function getMetrics(Request $request)
    {
        $user = $request->user();

        if ($user->rol === 'administrador') {
            return $this->adminDashboard();
        } elseif ($user->rol === 'supervisor') {
            return $this->supervisorDashboard($user);
        } else {
            return $this->workerDashboard($user);
        }
    }

    private function adminDashboard()
    {
        $totalUsers = User::count();
        $totalEquipos = Equipo::count();
        $totalProyectos = Proyecto::count();
        $totalActividades = Actividad::count();
        $totalDepartamentos = Departamento::count();

        $distribucionEstados = [
            'pendiente' => Actividad::where('estado', 'pendiente')->count(),
            'en_proceso' => Actividad::where('estado', 'en_proceso')->count(),
            'en_revision' => Actividad::where('estado', 'en_revision')->count(),
            'observada' => Actividad::where('estado', 'observada')->count(),
            'aprobada' => Actividad::where('estado', 'aprobada')->count(),
        ];

        $retrasadas = Actividad::where('fecha_limite', '<', now()->toDateString())
                               ->where('estado', '!=', 'aprobada')
                               ->count();

        $promedioAvance = Actividad::avg('porcentaje_avance') ?? 0;

        $actividadesRecientes = Actividad::with(['proyecto', 'responsable', 'supervisor'])
                                         ->latest()
                                         ->take(6)
                                         ->get();

        $objetivosEnCurso = ObjetivoDesempeno::where('estado', 'en_progreso')->count();

        return response()->json([
            'role' => 'admin',
            'rol' => 'administrador',
            'summary' => [
                'total_users' => $totalUsers,
                'total_equipos' => $totalEquipos,
                'total_proyectos' => $totalProyectos,
                'total_actividades' => $totalActividades,
                'total_departamentos' => $totalDepartamentos,
                'actividades_retrasadas' => $retrasadas,
                'promedio_avance' => round($promedioAvance, 1),
                'objetivos_en_curso' => $objetivosEnCurso,
            ],
            'status_distribution' => $distribucionEstados,
            'recent_activities' => $actividadesRecientes,
        ]);
    }

    private function supervisorDashboard($user)
    {
        $misEquipos = Equipo::where('supervisor_id', $user->id)->with('miembros.cargo')->get();
        $misProyectos = Proyecto::where('supervisor_id', $user->id)->get();

        $actividadesQuery = Actividad::where('supervisor_id', $user->id);

        $totalActividades = (clone $actividadesQuery)->count();
        $pendientesRevision = (clone $actividadesQuery)->where('estado', 'en_revision')->count();
        $enProceso = (clone $actividadesQuery)->where('estado', 'en_proceso')->count();
        $observadas = (clone $actividadesQuery)->where('estado', 'observada')->count();
        $aprobadas = (clone $actividadesQuery)->where('estado', 'aprobada')->count();

        $retrasadas = (clone $actividadesQuery)->where('fecha_limite', '<', now()->toDateString())
                                               ->where('estado', '!=', 'aprobada')
                                               ->count();

        // Indicadores por integrante del equipo
        $equipoIds = $misEquipos->pluck('id');
        $miembros = User::whereHas('equipos', function ($q) use ($equipoIds) {
            $q->whereIn('equipos.id', $equipoIds);
        })->where('id', '!=', $user->id)->with('cargo')->get();

        $indicadoresPersonal = $miembros->map(function ($m) use ($user) {
            $acts = Actividad::where('usuario_asignado_id', $m->id)
                             ->where('supervisor_id', $user->id)
                             ->get();

            $total = $acts->count();
            $completadas = $acts->where('estado', 'aprobada')->count();
            $pendientes = $acts->whereIn('estado', ['pendiente', 'en_proceso'])->count();
            $enRev = $acts->where('estado', 'en_revision')->count();
            $obs = $acts->where('estado', 'observada')->count();
            $retraso = $acts->where('fecha_limite', '<', now()->toDateString())->where('estado', '!=', 'aprobada')->count();
            $avgProg = $total > 0 ? $acts->avg('porcentaje_avance') : 0;

            return [
                'usuario' => [
                    'id' => $m->id,
                    'nombre' => $m->nombre,
                    'name' => $m->nombre,
                    'rol' => $m->rol,
                    'role' => $m->rol,
                    'cargo' => $m->cargo?->nombre,
                    'position' => $m->cargo?->nombre,
                ],
                'metricas' => [
                    'total' => $total,
                    'completadas' => $completadas,
                    'pendientes' => $pendientes,
                    'en_revision' => $enRev,
                    'observadas' => $obs,
                    'retrasadas' => $retraso,
                    'avance_promedio' => round($avgProg, 1),
                ]
            ];
        });

        $actividadesRevision = Actividad::where('supervisor_id', $user->id)
                                        ->where('estado', 'en_revision')
                                        ->with(['proyecto', 'responsable'])
                                        ->get();

        return response()->json([
            'role' => 'supervisor',
            'rol' => 'supervisor',
            'summary' => [
                'total_actividades' => $totalActividades,
                'pendientes_revision' => $pendientesRevision,
                'en_proceso' => $enProceso,
                'observadas' => $observadas,
                'aprobadas' => $aprobadas,
                'retrasadas' => $retrasadas,
            ],
            'equipos' => $misEquipos,
            'proyectos' => $misProyectos,
            'indicadores_personal' => $indicadoresPersonal,
            'actividades_revision' => $actividadesRevision,
        ]);
    }

    private function workerDashboard($user)
    {
        $actividades = Actividad::where('usuario_asignado_id', $user->id)
                                ->with(['proyecto', 'supervisor'])
                                ->get();

        $total = $actividades->count();
        $pendientes = $actividades->where('estado', 'pendiente')->count();
        $enProceso = $actividades->where('estado', 'en_proceso')->count();
        $enRevision = $actividades->where('estado', 'en_revision')->count();
        $observadas = $actividades->where('estado', 'observada')->count();
        $aprobadas = $actividades->where('estado', 'aprobada')->count();
        $retrasadas = $actividades->where('fecha_limite', '<', now()->toDateString())
                                  ->where('estado', '!=', 'aprobada')
                                  ->count();

        $promedioAvance = $total > 0 ? $actividades->avg('porcentaje_avance') : 0;

        $objetivos = ObjetivoDesempeno::where('usuario_id', $user->id)->get();

        return response()->json([
            'role' => $user->rol,
            'rol' => $user->rol,
            'summary' => [
                'total' => $total,
                'pendientes' => $pendientes,
                'en_proceso' => $enProceso,
                'en_revision' => $enRevision,
                'observadas' => $observadas,
                'aprobadas' => $aprobadas,
                'retrasadas' => $retrasadas,
                'avance_promedio' => round($promedioAvance, 1),
            ],
            'actividades' => $actividades,
            'objetivos' => $objetivos,
        ]);
    }
}
