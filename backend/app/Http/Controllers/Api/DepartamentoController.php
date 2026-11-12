<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BitacoraAuditoria;
use App\Models\Departamento;
use Illuminate\Http\Request;

class DepartamentoController extends Controller
{
    public function index(Request $request)
    {
        $query = Departamento::with(['responsable', 'cargos']);

        if ($request->has('estado') && $request->estado) {
            $query->where('estado', $request->estado);
        }

        return response()->json($query->orderBy('nombre')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'codigo' => 'required|string|max:20|unique:departamentos,codigo',
            'descripcion' => 'nullable|string',
            'responsable_id' => 'nullable|exists:usuarios,id',
            'estado' => 'nullable|in:activo,inactivo',
        ]);

        $depto = Departamento::create([
            'nombre' => $validated['nombre'],
            'codigo' => strtoupper($validated['codigo']),
            'descripcion' => $validated['descripcion'] ?? null,
            'responsable_id' => $validated['responsable_id'] ?? null,
            'estado' => $validated['estado'] ?? 'activo',
        ]);

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'estructura',
            'creacion',
            "Creación de departamento: {$depto->nombre} ({$depto->codigo})",
            null,
            $depto->toArray()
        );

        return response()->json($depto->load(['responsable', 'cargos']), 201);
    }

    public function show($id)
    {
        $depto = Departamento::with(['responsable', 'cargos', 'usuarios.cargo', 'proyectos', 'equipos'])->findOrFail($id);
        return response()->json($depto);
    }

    public function update(Request $request, $id)
    {
        $depto = Departamento::findOrFail($id);
        $datosPrevios = $depto->toArray();

        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'codigo' => 'sometimes|string|max:20|unique:departamentos,codigo,' . $depto->id,
            'descripcion' => 'nullable|string',
            'responsable_id' => 'nullable|exists:usuarios,id',
            'estado' => 'nullable|in:activo,inactivo',
        ]);

        $depto->update($validated);

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'estructura',
            'actualizacion',
            "Actualización de departamento: {$depto->nombre}",
            $datosPrevios,
            $depto->toArray()
        );

        return response()->json($depto->load(['responsable', 'cargos']));
    }

    public function destroy(Request $request, $id)
    {
        $depto = Departamento::findOrFail($id);
        $nombre = $depto->nombre;
        $depto->delete();

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'estructura',
            'eliminacion',
            "Eliminación de departamento: {$nombre}"
        );

        return response()->json(['message' => 'Departamento eliminado correctamente']);
    }
}

