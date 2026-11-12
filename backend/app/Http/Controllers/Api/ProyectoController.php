<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BitacoraAuditoria;
use App\Models\Proyecto;
use Illuminate\Http\Request;

class ProyectoController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Proyecto::with(['supervisor', 'equipo', 'departamento', 'actividades']);

        if ($user->rol === 'supervisor') {
            $query->where('supervisor_id', $user->id);
        } elseif ($user->rol === 'colaborador' || $user->rol === 'practicante') {
            $query->where(function ($q) use ($user) {
                $q->whereHas('equipo.miembros', function ($m) use ($user) {
                    $m->where('usuarios.id', $user->id);
                })->orWhereHas('actividades', function ($a) use ($user) {
                    $a->where('usuario_asignado_id', $user->id);
                });
            });
        }

        if ($request->has('estado') && $request->estado) {
            $query->where('estado', $request->estado);
        } elseif ($request->has('status') && $request->status) {
            $query->where('estado', $request->status);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string',
            'description' => 'nullable|string',
            'estado' => 'nullable|in:planificado,en_progreso,pausado,completado,cancelado',
            'status' => 'nullable|in:planificado,en_progreso,pausado,completado,cancelado',
            'prioridad' => 'nullable|in:baja,media,alta,urgente',
            'priority' => 'nullable|in:baja,media,alta,urgente',
            'fecha_inicio' => 'nullable|date',
            'start_date' => 'nullable|date',
            'fecha_fin_estimada' => 'nullable|date',
            'estimated_end_date' => 'nullable|date',
            'supervisor_id' => 'required|exists:usuarios,id',
            'equipo_id' => 'nullable|exists:equipos,id',
            'departamento_id' => 'nullable|exists:departamentos,id',
        ]);

        $proyecto = Proyecto::create([
            'nombre' => $validated['nombre'] ?? $validated['name'] ?? 'Nuevo Proyecto',
            'descripcion' => $validated['descripcion'] ?? $validated['description'] ?? null,
            'estado' => $validated['estado'] ?? $validated['status'] ?? 'en_progreso',
            'prioridad' => $validated['prioridad'] ?? $validated['priority'] ?? 'media',
            'fecha_inicio' => $validated['fecha_inicio'] ?? $validated['start_date'] ?? null,
            'fecha_fin_estimada' => $validated['fecha_fin_estimada'] ?? $validated['estimated_end_date'] ?? null,
            'supervisor_id' => $validated['supervisor_id'],
            'equipo_id' => $validated['equipo_id'] ?? null,
            'departamento_id' => $validated['departamento_id'] ?? null,
        ]);

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'proyectos',
            'creacion',
            "Creación del proyecto: {$proyecto->nombre}",
            null,
            $proyecto->toArray()
        );

        return response()->json($proyecto->load(['supervisor', 'equipo', 'departamento']), 201);
    }

    public function show($id)
    {
        $proyecto = Proyecto::with(['supervisor', 'equipo.miembros', 'departamento', 'actividades.responsable'])->findOrFail($id);
        return response()->json($proyecto);
    }

    public function update(Request $request, $id)
    {
        $proyecto = Proyecto::findOrFail($id);
        $datosPrevios = $proyecto->toArray();

        $validated = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string',
            'description' => 'nullable|string',
            'estado' => 'nullable|in:planificado,en_progreso,pausado,completado,cancelado',
            'status' => 'nullable|in:planificado,en_progreso,pausado,completado,cancelado',
            'prioridad' => 'nullable|in:baja,media,alta,urgente',
            'priority' => 'nullable|in:baja,media,alta,urgente',
            'fecha_inicio' => 'nullable|date',
            'start_date' => 'nullable|date',
            'fecha_fin_estimada' => 'nullable|date',
            'estimated_end_date' => 'nullable|date',
            'fecha_fin_real' => 'nullable|date',
            'actual_end_date' => 'nullable|date',
            'supervisor_id' => 'sometimes|exists:usuarios,id',
            'equipo_id' => 'nullable|exists:equipos,id',
            'departamento_id' => 'nullable|exists:departamentos,id',
        ]);

        if (isset($validated['nombre']) || isset($validated['name'])) {
            $proyecto->nombre = $validated['nombre'] ?? $validated['name'];
        }
        if (isset($validated['descripcion']) || isset($validated['description'])) {
            $proyecto->descripcion = $validated['descripcion'] ?? $validated['description'];
        }
        if (isset($validated['estado']) || isset($validated['status'])) {
            $proyecto->estado = $validated['estado'] ?? $validated['status'];
        }
        if (isset($validated['prioridad']) || isset($validated['priority'])) {
            $proyecto->prioridad = $validated['prioridad'] ?? $validated['priority'];
        }
        if (isset($validated['fecha_inicio']) || isset($validated['start_date'])) {
            $proyecto->fecha_inicio = $validated['fecha_inicio'] ?? $validated['start_date'];
        }
        if (isset($validated['fecha_fin_estimada']) || isset($validated['estimated_end_date'])) {
            $proyecto->fecha_fin_estimada = $validated['fecha_fin_estimada'] ?? $validated['estimated_end_date'];
        }
        if (isset($validated['fecha_fin_real']) || isset($validated['actual_end_date'])) {
            $proyecto->fecha_fin_real = $validated['fecha_fin_real'] ?? $validated['actual_end_date'];
        }
        if (isset($validated['supervisor_id'])) {
            $proyecto->supervisor_id = $validated['supervisor_id'];
        }
        if (array_key_exists('equipo_id', $validated)) {
            $proyecto->equipo_id = $validated['equipo_id'];
        }
        if (array_key_exists('departamento_id', $validated)) {
            $proyecto->departamento_id = $validated['departamento_id'];
        }

        $proyecto->save();

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'proyectos',
            'actualizacion',
            "Actualización del proyecto: {$proyecto->nombre}",
            $datosPrevios,
            $proyecto->toArray()
        );

        return response()->json($proyecto->load(['supervisor', 'equipo', 'departamento']));
    }

    public function destroy(Request $request, $id)
    {
        $proyecto = Proyecto::findOrFail($id);
        $nombre = $proyecto->nombre;
        $proyecto->delete();

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'proyectos',
            'eliminacion',
            "Eliminación del proyecto: {$nombre}"
        );

        return response()->json(['message' => 'Proyecto eliminado correctamente']);
    }
}
