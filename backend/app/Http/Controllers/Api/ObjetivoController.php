<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BitacoraAuditoria;
use App\Models\ObjetivoDesempeno;
use Illuminate\Http\Request;

class ObjetivoController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = ObjetivoDesempeno::with(['usuario.cargo', 'supervisor']);

        if ($user->rol === 'colaborador' || $user->rol === 'practicante') {
            $query->where('usuario_id', $user->id);
        } elseif ($user->rol === 'supervisor') {
            $query->where('supervisor_id', $user->id);
        }

        if ($request->has('usuario_id') && $request->usuario_id) {
            $query->where('usuario_id', $request->usuario_id);
        }

        if ($request->has('estado') && $request->estado) {
            $query->where('estado', $request->estado);
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'usuario_id' => 'required|exists:usuarios,id',
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'meta_cuantitativa' => 'required|numeric|min:0',
            'progreso_actual' => 'nullable|numeric|min:0',
            'unidad_medida' => 'nullable|string|max:50',
            'fecha_limite' => 'nullable|date',
            'estado' => 'nullable|in:en_progreso,cumplido,no_cumplido,cancelado',
        ]);

        $objetivo = ObjetivoDesempeno::create([
            'usuario_id' => $validated['usuario_id'],
            'supervisor_id' => $request->user()->id,
            'titulo' => $validated['titulo'],
            'descripcion' => $validated['descripcion'] ?? null,
            'meta_cuantitativa' => $validated['meta_cuantitativa'],
            'progreso_actual' => $validated['progreso_actual'] ?? 0,
            'unidad_medida' => $validated['unidad_medida'] ?? '%',
            'fecha_limite' => $validated['fecha_limite'] ?? null,
            'estado' => $validated['estado'] ?? 'en_progreso',
        ]);

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'objetivos',
            'creacion',
            "Creación de objetivo: {$objetivo->titulo} para usuario ID {$objetivo->usuario_id}",
            null,
            $objetivo->toArray()
        );

        return response()->json($objetivo->load(['usuario.cargo', 'supervisor']), 201);
    }

    public function show($id)
    {
        $objetivo = ObjetivoDesempeno::with(['usuario.cargo', 'supervisor'])->findOrFail($id);
        return response()->json($objetivo);
    }

    public function update(Request $request, $id)
    {
        $objetivo = ObjetivoDesempeno::findOrFail($id);
        $datosPrevios = $objetivo->toArray();

        $validated = $request->validate([
            'titulo' => 'sometimes|string|max:255',
            'descripcion' => 'nullable|string',
            'meta_cuantitativa' => 'sometimes|numeric|min:0',
            'progreso_actual' => 'nullable|numeric|min:0',
            'unidad_medida' => 'nullable|string|max:50',
            'fecha_limite' => 'nullable|date',
            'estado' => 'nullable|in:en_progreso,cumplido,no_cumplido,cancelado',
        ]);

        $objetivo->update($validated);

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'objetivos',
            'actualizacion',
            "Actualización de objetivo: {$objetivo->titulo}",
            $datosPrevios,
            $objetivo->toArray()
        );

        return response()->json($objetivo->load(['usuario.cargo', 'supervisor']));
    }

    public function destroy(Request $request, $id)
    {
        $objetivo = ObjetivoDesempeno::findOrFail($id);
        $titulo = $objetivo->titulo;
        $objetivo->delete();

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'objetivos',
            'eliminacion',
            "Eliminación de objetivo: {$titulo}"
        );

        return response()->json(['message' => 'Objetivo eliminado correctamente']);
    }
}

