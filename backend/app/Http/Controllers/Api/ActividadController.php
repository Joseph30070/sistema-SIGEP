<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\BitacoraAuditoria;
use App\Models\Notificacion;
use Illuminate\Http\Request;

class ActividadController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Actividad::with(['proyecto', 'responsable', 'supervisor']);

        // Filtrado por rol
        if ($user->rol === 'colaborador' || $user->rol === 'practicante') {
            $query->where('usuario_asignado_id', $user->id);
        } elseif ($user->rol === 'supervisor') {
            $query->where(function ($q) use ($user) {
                $q->where('supervisor_id', $user->id)
                  ->orWhere('usuario_asignado_id', $user->id);
            });
        }

        // Filtros opcionales
        if ($request->has('estado') && $request->estado) {
            $query->where('estado', $request->estado);
        } elseif ($request->has('status') && $request->status) {
            $query->where('estado', $request->status);
        }

        if ($request->has('prioridad') && $request->prioridad) {
            $query->where('prioridad', $request->prioridad);
        } elseif ($request->has('priority') && $request->priority) {
            $query->where('prioridad', $request->priority);
        }

        if ($request->has('proyecto_id') && $request->proyecto_id) {
            $query->where('proyecto_id', $request->proyecto_id);
        }

        if ($request->has('usuario_asignado_id') && $request->usuario_asignado_id) {
            $query->where('usuario_asignado_id', $request->usuario_asignado_id);
        } elseif ($request->has('assigned_to') && $request->assigned_to) {
            $query->where('usuario_asignado_id', $request->assigned_to);
        }

        $actividades = $query->orderBy('fecha_limite', 'asc')->get();

        return response()->json($actividades);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'proyecto_id' => 'required|exists:proyectos,id',
            'titulo' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string',
            'description' => 'nullable|string',
            'planteamiento_problema' => 'nullable|string',
            'problem_statement' => 'nullable|string',
            'trabajo_a_realizar' => 'nullable|string',
            'work_to_do' => 'nullable|string',
            'usuario_asignado_id' => 'nullable|exists:usuarios,id',
            'assigned_to' => 'nullable|exists:usuarios,id',
            'fecha_limite' => 'nullable|date',
            'due_date' => 'nullable|date',
            'prioridad' => 'nullable|in:baja,media,alta,urgente',
            'priority' => 'nullable|in:baja,media,alta,urgente',
        ]);

        $actividad = Actividad::create([
            'proyecto_id' => $validated['proyecto_id'],
            'titulo' => $validated['titulo'] ?? $validated['title'] ?? 'Nueva actividad',
            'descripcion' => $validated['descripcion'] ?? $validated['description'] ?? null,
            'planteamiento_problema' => $validated['planteamiento_problema'] ?? $validated['problem_statement'] ?? null,
            'trabajo_a_realizar' => $validated['trabajo_a_realizar'] ?? $validated['work_to_do'] ?? null,
            'usuario_asignado_id' => $validated['usuario_asignado_id'] ?? $validated['assigned_to'],
            'supervisor_id' => $request->user()->id,
            'fecha_asignacion' => now()->toDateString(),
            'fecha_limite' => $validated['fecha_limite'] ?? $validated['due_date'] ?? null,
            'prioridad' => $validated['prioridad'] ?? $validated['priority'] ?? 'media',
            'estado' => 'pendiente',
            'porcentaje_avance' => 0,
        ]);

        // Notificar al responsable
        $responsableId = $actividad->usuario_asignado_id;
        Notificacion::create([
            'usuario_id' => $responsableId,
            'titulo' => 'Nueva actividad asignada',
            'mensaje' => 'Se te ha asignado la actividad: "' . $actividad->titulo . '". Fecha límite: ' . $actividad->fecha_limite,
            'tipo' => 'actividad_asignada',
            'actividad_id' => $actividad->id,
        ]);

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'actividades',
            'creacion',
            "Creación de actividad: {$actividad->titulo}",
            null,
            $actividad->toArray()
        );

        return response()->json($actividad->load(['proyecto', 'responsable', 'supervisor']), 201);
    }

    public function show($id)
    {
        $actividad = Actividad::with([
            'proyecto',
            'responsable',
            'supervisor',
            'avances.usuario',
            'revisiones.usuario',
        ])->findOrFail($id);

        return response()->json($actividad);
    }

    public function update(Request $request, $id)
    {
        $actividad = Actividad::findOrFail($id);
        $datosPrevios = $actividad->toArray();

        $validated = $request->validate([
            'titulo' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string',
            'description' => 'nullable|string',
            'planteamiento_problema' => 'nullable|string',
            'problem_statement' => 'nullable|string',
            'trabajo_a_realizar' => 'nullable|string',
            'work_to_do' => 'nullable|string',
            'usuario_asignado_id' => 'nullable|exists:usuarios,id',
            'assigned_to' => 'nullable|exists:usuarios,id',
            'fecha_limite' => 'nullable|date',
            'due_date' => 'nullable|date',
            'prioridad' => 'nullable|in:baja,media,alta,urgente',
            'priority' => 'nullable|in:baja,media,alta,urgente',
            'estado' => 'nullable|in:pendiente,en_proceso,terminada,en_revision,aprobada,observada',
            'status' => 'nullable|in:pendiente,en_proceso,terminada,en_revision,aprobada,observada',
            'porcentaje_avance' => 'nullable|integer|min:0|max:100',
            'progress_percentage' => 'nullable|integer|min:0|max:100',
        ]);

        if (isset($validated['titulo']) || isset($validated['title'])) {
            $actividad->titulo = $validated['titulo'] ?? $validated['title'];
        }
        if (isset($validated['descripcion']) || isset($validated['description'])) {
            $actividad->descripcion = $validated['descripcion'] ?? $validated['description'];
        }
        if (isset($validated['planteamiento_problema']) || isset($validated['problem_statement'])) {
            $actividad->planteamiento_problema = $validated['planteamiento_problema'] ?? $validated['problem_statement'];
        }
        if (isset($validated['trabajo_a_realizar']) || isset($validated['work_to_do'])) {
            $actividad->trabajo_a_realizar = $validated['trabajo_a_realizar'] ?? $validated['work_to_do'];
        }
        if (isset($validated['usuario_asignado_id']) || isset($validated['assigned_to'])) {
            $actividad->usuario_asignado_id = $validated['usuario_asignado_id'] ?? $validated['assigned_to'];
        }
        if (isset($validated['fecha_limite']) || isset($validated['due_date'])) {
            $actividad->fecha_limite = $validated['fecha_limite'] ?? $validated['due_date'];
        }
        if (isset($validated['prioridad']) || isset($validated['priority'])) {
            $actividad->prioridad = $validated['prioridad'] ?? $validated['priority'];
        }
        if (isset($validated['estado']) || isset($validated['status'])) {
            $actividad->estado = $validated['estado'] ?? $validated['status'];
        }
        if (isset($validated['porcentaje_avance']) || isset($validated['progress_percentage'])) {
            $actividad->porcentaje_avance = $validated['porcentaje_avance'] ?? $validated['progress_percentage'];
        }

        $actividad->save();

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'actividades',
            'actualizacion',
            "Actualización de actividad: {$actividad->titulo}",
            $datosPrevios,
            $actividad->toArray()
        );

        return response()->json($actividad->load(['proyecto', 'responsable', 'supervisor']));
    }

    public function destroy(Request $request, $id)
    {
        $actividad = Actividad::findOrFail($id);
        $titulo = $actividad->titulo;
        $actividad->delete();

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'actividades',
            'eliminacion',
            "Eliminación de actividad: {$titulo}"
        );

        return response()->json(['message' => 'Actividad eliminada correctamente']);
    }
}
