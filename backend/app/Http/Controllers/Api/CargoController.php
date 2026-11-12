<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BitacoraAuditoria;
use App\Models\Cargo;
use Illuminate\Http\Request;

class CargoController extends Controller
{
    public function index(Request $request)
    {
        $query = Cargo::with('departamento');

        if ($request->has('departamento_id') && $request->departamento_id) {
            $query->where('departamento_id', $request->departamento_id);
        }

        if ($request->has('nivel_jerarquico') && $request->nivel_jerarquico) {
            $query->where('nivel_jerarquico', $request->nivel_jerarquico);
        }

        if ($request->has('estado') && $request->estado) {
            $query->where('estado', $request->estado);
        }

        return response()->json($query->orderBy('nombre')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'departamento_id' => 'required|exists:departamentos,id',
            'nivel_jerarquico' => 'nullable|in:directivo,supervision,operativo,practicas',
            'salario_base' => 'nullable|numeric|min:0',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|in:activo,inactivo',
        ]);

        $cargo = Cargo::create($validated);

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'estructura',
            'creacion',
            "Creación de cargo: {$cargo->nombre}",
            null,
            $cargo->toArray()
        );

        return response()->json($cargo->load('departamento'), 201);
    }

    public function show($id)
    {
        $cargo = Cargo::with(['departamento', 'usuarios'])->findOrFail($id);
        return response()->json($cargo);
    }

    public function update(Request $request, $id)
    {
        $cargo = Cargo::findOrFail($id);
        $datosPrevios = $cargo->toArray();

        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'departamento_id' => 'sometimes|exists:departamentos,id',
            'nivel_jerarquico' => 'nullable|in:directivo,supervision,operativo,practicas',
            'salario_base' => 'nullable|numeric|min:0',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|in:activo,inactivo',
        ]);

        $cargo->update($validated);

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'estructura',
            'actualizacion',
            "Actualización de cargo: {$cargo->nombre}",
            $datosPrevios,
            $cargo->toArray()
        );

        return response()->json($cargo->load('departamento'));
    }

    public function destroy(Request $request, $id)
    {
        $cargo = Cargo::findOrFail($id);
        $nombre = $cargo->nombre;
        $cargo->delete();

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'estructura',
            'eliminacion',
            "Eliminación de cargo: {$nombre}"
        );

        return response()->json(['message' => 'Cargo eliminado correctamente']);
    }
}

