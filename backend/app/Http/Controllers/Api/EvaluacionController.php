<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\BitacoraAuditoria;
use App\Models\CriterioEvaluacion;
use App\Models\EvaluacionDetalle;
use App\Models\EvaluacionPersonal;
use App\Models\User;
use Illuminate\Http\Request;

class EvaluacionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = EvaluacionPersonal::with(['usuario.cargo', 'supervisor', 'detalles.criterio']);

        if ($user->rol === 'colaborador' || $user->rol === 'practicante') {
            $query->where('usuario_id', $user->id);
        } elseif ($user->rol === 'supervisor') {
            $query->where('supervisor_id', $user->id);
        }

        if ($request->has('usuario_id') && $request->usuario_id) {
            $query->where('usuario_id', $request->usuario_id);
        } elseif ($request->has('user_id') && $request->user_id) {
            $query->where('usuario_id', $request->user_id);
        }

        return response()->json($query->latest()->get());
    }

    // Calcula automáticamente las métricas del personal según su historial de actividades
    public function calculateMetrics(Request $request)
    {
        $request->validate([
            'usuario_id' => 'nullable|exists:usuarios,id',
            'user_id' => 'nullable|exists:usuarios,id',
            'periodo_inicio' => 'nullable|date',
            'period_start' => 'nullable|date',
            'periodo_fin' => 'nullable|date',
            'period_end' => 'nullable|date',
        ]);

        $userId = $request->usuario_id ?? $request->user_id;
        $periodoInicio = $request->periodo_inicio ?? $request->period_start;
        $periodoFin = $request->periodo_fin ?? $request->period_end;

        $query = Actividad::where('usuario_asignado_id', $userId);

        if ($periodoInicio && $periodoFin) {
            $query->whereBetween('created_at', [$periodoInicio, $periodoFin]);
        }

        $actividades = $query->get();
        $total = $actividades->count();
        $aprobadas = $actividades->where('estado', 'aprobada')->count();
        $observadas = $actividades->where('estado', 'observada')->count();
        $retrasadas = $actividades->where('fecha_limite', '<', now()->toDateString())
                                  ->where('estado', '!=', 'aprobada')
                                  ->count();

        $avgProgress = $total > 0 ? $actividades->avg('porcentaje_avance') : 0;
        $complianceRate = $total > 0 ? ($aprobadas / $total) * 100 : 0;

        return response()->json([
            'usuario' => User::with('cargo')->find($userId),
            'metricas' => [
                'total_actividades' => $total,
                'total_activities' => $total,
                'actividades_completadas' => $aprobadas,
                'completed_activities' => $aprobadas,
                'actividades_aprobadas' => $aprobadas,
                'approved_activities' => $aprobadas,
                'actividades_observadas' => $observadas,
                'observed_activities' => $observadas,
                'actividades_retrasadas' => $retrasadas,
                'delayed_activities' => $retrasadas,
                'promedio_avance' => round($avgProgress, 1),
                'average_progress' => round($avgProgress, 1),
                'tasa_cumplimiento' => round($complianceRate, 1),
                'compliance_rate' => round($complianceRate, 1),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'usuario_id' => 'nullable|exists:usuarios,id',
            'user_id' => 'nullable|exists:usuarios,id',
            'periodo' => 'nullable|string|max:255',
            'period' => 'nullable|string|max:255',
            'periodo_inicio' => 'nullable|date',
            'period_start' => 'nullable|date',
            'periodo_fin' => 'nullable|date',
            'period_end' => 'nullable|date',
            'total_actividades' => 'nullable|integer|min:0',
            'total_activities' => 'nullable|integer|min:0',
            'actividades_completadas' => 'nullable|integer|min:0',
            'completed_activities' => 'nullable|integer|min:0',
            'actividades_aprobadas' => 'nullable|integer|min:0',
            'approved_activities' => 'nullable|integer|min:0',
            'actividades_observadas' => 'nullable|integer|min:0',
            'observed_activities' => 'nullable|integer|min:0',
            'actividades_retrasadas' => 'nullable|integer|min:0',
            'delayed_activities' => 'nullable|integer|min:0',
            'promedio_avance' => 'nullable|numeric|min:0|max:100',
            'average_progress' => 'nullable|numeric|min:0|max:100',
            'tasa_cumplimiento' => 'nullable|numeric|min:0|max:100',
            'compliance_rate' => 'nullable|numeric|min:0|max:100',
            'observacion_supervisor' => 'nullable|string',
            'supervisor_observation' => 'nullable|string',
            'puntaje' => 'nullable|integer|min:0|max:100',
            'score' => 'nullable|integer|min:0|max:100',
            'estado' => 'nullable|in:borrador,finalizada',
            'status' => 'nullable|in:borrador,finalizada',
            'detalles' => 'nullable|array',
            'detalles.*.criterio_id' => 'required_with:detalles|exists:criterios_evaluacion,id',
            'detalles.*.calificacion' => 'required_with:detalles|integer|min:1|max:5',
            'detalles.*.comentario' => 'nullable|string',
        ]);

        $evaluacion = EvaluacionPersonal::create([
            'usuario_id' => $validated['usuario_id'] ?? $validated['user_id'],
            'supervisor_id' => $request->user()->id,
            'periodo' => $validated['periodo'] ?? $validated['period'] ?? 'Período sin nombre',
            'periodo_inicio' => $validated['periodo_inicio'] ?? $validated['period_start'] ?? null,
            'periodo_fin' => $validated['periodo_fin'] ?? $validated['period_end'] ?? null,
            'total_actividades' => $validated['total_actividades'] ?? $validated['total_activities'] ?? 0,
            'actividades_completadas' => $validated['actividades_completadas'] ?? $validated['completed_activities'] ?? 0,
            'actividades_aprobadas' => $validated['actividades_aprobadas'] ?? $validated['approved_activities'] ?? 0,
            'actividades_observadas' => $validated['actividades_observadas'] ?? $validated['observed_activities'] ?? 0,
            'actividades_retrasadas' => $validated['actividades_retrasadas'] ?? $validated['delayed_activities'] ?? 0,
            'promedio_avance' => $validated['promedio_avance'] ?? $validated['average_progress'] ?? 0,
            'tasa_cumplimiento' => $validated['tasa_cumplimiento'] ?? $validated['compliance_rate'] ?? 0,
            'observacion_supervisor' => $validated['observacion_supervisor'] ?? $validated['supervisor_observation'] ?? null,
            'puntaje' => $validated['puntaje'] ?? $validated['score'] ?? null,
            'estado' => $validated['estado'] ?? $validated['status'] ?? 'finalizada',
        ]);

        // Guardar detalles de rúbrica si se enviaron
        if (!empty($validated['detalles'])) {
            foreach ($validated['detalles'] as $detalle) {
                EvaluacionDetalle::create([
                    'evaluacion_id' => $evaluacion->id,
                    'criterio_id' => $detalle['criterio_id'],
                    'calificacion' => $detalle['calificacion'],
                    'comentario' => $detalle['comentario'] ?? null,
                ]);
            }
        }

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'evaluaciones',
            'creacion',
            "Creación de evaluación '{$evaluacion->periodo}' para usuario ID {$evaluacion->usuario_id}",
            null,
            $evaluacion->toArray()
        );

        return response()->json($evaluacion->load(['usuario.cargo', 'supervisor', 'detalles.criterio']), 201);
    }

    public function show($id)
    {
        $evaluacion = EvaluacionPersonal::with(['usuario.cargo', 'supervisor', 'detalles.criterio'])->findOrFail($id);
        return response()->json($evaluacion);
    }

    public function update(Request $request, $id)
    {
        $evaluacion = EvaluacionPersonal::findOrFail($id);

        $validated = $request->validate([
            'periodo' => 'nullable|string|max:255',
            'period' => 'nullable|string|max:255',
            'observacion_supervisor' => 'nullable|string',
            'supervisor_observation' => 'nullable|string',
            'puntaje' => 'nullable|integer|min:0|max:100',
            'score' => 'nullable|integer|min:0|max:100',
            'estado' => 'nullable|in:borrador,finalizada',
            'status' => 'nullable|in:borrador,finalizada',
        ]);

        if (isset($validated['periodo']) || isset($validated['period'])) {
            $evaluacion->periodo = $validated['periodo'] ?? $validated['period'];
        }
        if (isset($validated['observacion_supervisor']) || isset($validated['supervisor_observation'])) {
            $evaluacion->observacion_supervisor = $validated['observacion_supervisor'] ?? $validated['supervisor_observation'];
        }
        if (isset($validated['puntaje']) || isset($validated['score'])) {
            $evaluacion->puntaje = $validated['puntaje'] ?? $validated['score'];
        }
        if (isset($validated['estado']) || isset($validated['status'])) {
            $evaluacion->estado = $validated['estado'] ?? $validated['status'];
        }

        $evaluacion->save();

        return response()->json($evaluacion->load(['usuario.cargo', 'supervisor', 'detalles.criterio']));
    }

    public function destroy(Request $request, $id)
    {
        $evaluacion = EvaluacionPersonal::findOrFail($id);
        $evaluacion->delete();
        return response()->json(['message' => 'Evaluación eliminada correctamente']);
    }
}
