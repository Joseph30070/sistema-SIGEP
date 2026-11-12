<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Avance;
use App\Models\Actividad;
use Illuminate\Http\Request;

class AvanceController extends Controller
{
    public function store(Request $request, $actividadId)
    {
        $actividad = Actividad::findOrFail($actividadId);

        $request->validate([
            'descripcion' => 'nullable|string',
            'description' => 'nullable|string',
            'porcentaje_reportado' => 'nullable|integer|min:0|max:100',
            'reported_percentage' => 'nullable|integer|min:0|max:100',
            'archivo_evidencia' => 'nullable|file|max:10240',
            'evidence_file' => 'nullable|file|max:10240',
        ]);

        $filePath = null;
        $fileName = null;

        $archivoInput = $request->hasFile('archivo_evidencia')
            ? $request->file('archivo_evidencia')
            : ($request->hasFile('evidence_file') ? $request->file('evidence_file') : null);

        if ($archivoInput) {
            $fileName = $archivoInput->getClientOriginalName();
            $filePath = $archivoInput->store('evidencias', 'public');
        }

        $descripcion = $request->descripcion ?? $request->description ?? '';
        $porcentaje = $request->porcentaje_reportado ?? $request->reported_percentage ?? null;

        // Crear registro inmutable de avance
        $avance = Avance::create([
            'actividad_id' => $actividad->id,
            'usuario_id' => $request->user()->id,
            'descripcion' => $descripcion,
            'porcentaje_reportado' => $porcentaje,
            'archivo_evidencia' => $filePath,
            'nombre_original_archivo' => $fileName,
        ]);

        // Si la actividad estaba en estado 'pendiente' o 'observada', pasa a 'en_proceso'
        if (in_array($actividad->estado, ['pendiente', 'observada'])) {
            $actividad->estado = 'en_proceso';
            $actividad->save();
        }

        return response()->json([
            'message' => 'Avance registrado correctamente en el historial inmutable.',
            'avance' => $avance->load('usuario'),
            'actividad' => $actividad->fresh(),
        ], 201);
    }
}
