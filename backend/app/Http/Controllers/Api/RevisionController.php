<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\BitacoraAuditoria;
use App\Models\Notificacion;
use App\Models\RevisionHistorial;
use Illuminate\Http\Request;

class RevisionController extends Controller
{
    // 1. Colaborador / Practicante envía a revisión la actividad
    public function solicitarRevision(Request $request, $actividadId)
    {
        $actividad = Actividad::findOrFail($actividadId);

        $request->validate([
            'comentario' => 'nullable|string',
            'comment' => 'nullable|string',
            'archivo_evidencia' => 'nullable|file|max:10240',
            'evidence_file' => 'nullable|file|max:10240',
        ]);

        $filePath = null;
        $archivoInput = $request->hasFile('archivo_evidencia')
            ? $request->file('archivo_evidencia')
            : ($request->hasFile('evidence_file') ? $request->file('evidence_file') : null);
        if ($archivoInput) {
            $filePath = $archivoInput->store('revisiones', 'public');
        }

        $accion = ($actividad->estado === 'observada') ? 'correccion' : 'solicitud_revision';

        $actividad->estado = 'en_revision';
        $actividad->save();

        $comentario = $request->comentario ?? $request->comment
            ?? 'El responsable ha finalizado el trabajo y solicitado la revisión.';

        // Registro inmutable en el historial
        $revision = RevisionHistorial::create([
            'actividad_id' => $actividad->id,
            'usuario_id' => $request->user()->id,
            'accion' => $accion,
            'comentario' => $comentario,
            'porcentaje_asignado' => $actividad->porcentaje_avance,
            'archivo_evidencia' => $filePath,
        ]);

        // Notificar al supervisor
        Notificacion::create([
            'usuario_id' => $actividad->supervisor_id,
            'titulo' => 'Actividad lista para revisión',
            'mensaje' => 'El colaborador ' . $request->user()->nombre . ' ha enviado a revisión la actividad: "' . $actividad->titulo . '".',
            'tipo' => 'revision_solicitada',
            'actividad_id' => $actividad->id,
        ]);

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'actividades',
            'revision',
            "Solicitud de revisión de actividad: {$actividad->titulo}"
        );

        return response()->json([
            'message' => 'Actividad enviada a revisión exitosamente.',
            'actividad' => $actividad->fresh(['proyecto', 'responsable', 'supervisor']),
            'revision' => $revision,
        ]);
    }

    // 2. Supervisor aprueba la actividad
    public function aprobar(Request $request, $actividadId)
    {
        $actividad = Actividad::findOrFail($actividadId);

        $request->validate([
            'comentario' => 'nullable|string',
            'comment' => 'nullable|string',
            'porcentaje_asignado' => 'nullable|integer|min:0|max:100',
            'assigned_percentage' => 'nullable|integer|min:0|max:100',
        ]);

        $porcentajeOficial = $request->porcentaje_asignado ?? $request->assigned_percentage ?? 100;
        $comentario = $request->comentario ?? $request->comment ?? 'Actividad revisada y aprobada.';

        $actividad->estado = 'aprobada';
        $actividad->porcentaje_avance = $porcentajeOficial;
        $actividad->save();

        // Historial inmutable
        $revision = RevisionHistorial::create([
            'actividad_id' => $actividad->id,
            'usuario_id' => $request->user()->id,
            'accion' => 'aprobacion',
            'comentario' => $comentario,
            'porcentaje_asignado' => $porcentajeOficial,
        ]);

        // Notificar al responsable
        Notificacion::create([
            'usuario_id' => $actividad->usuario_asignado_id,
            'titulo' => '¡Actividad Aprobada!',
            'mensaje' => 'Tu actividad "' . $actividad->titulo . '" ha sido revisada y aprobada por el supervisor.',
            'tipo' => 'aprobacion',
            'actividad_id' => $actividad->id,
        ]);

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'actividades',
            'aprobacion',
            "Aprobación de actividad: {$actividad->titulo} al {$porcentajeOficial}%"
        );

        return response()->json([
            'message' => 'Actividad aprobada correctamente.',
            'actividad' => $actividad->fresh(['proyecto', 'responsable', 'supervisor']),
            'revision' => $revision,
        ]);
    }

    // 3. Supervisor observa la actividad con requerimientos de corrección
    public function observar(Request $request, $actividadId)
    {
        $actividad = Actividad::findOrFail($actividadId);

        $request->validate([
            'comentario' => 'nullable|string',
            'comment' => 'nullable|string',
            'requerimientos_correccion' => 'nullable|string',
            'correction_requirements' => 'nullable|string',
            'porcentaje_asignado' => 'nullable|integer|min:0|max:100',
            'assigned_percentage' => 'nullable|integer|min:0|max:100',
            'archivo_evidencia' => 'nullable|file|max:10240',
            'evidence_file' => 'nullable|file|max:10240',
        ]);

        $filePath = null;
        $archivoInput = $request->hasFile('archivo_evidencia')
            ? $request->file('archivo_evidencia')
            : ($request->hasFile('evidence_file') ? $request->file('evidence_file') : null);
        if ($archivoInput) {
            $filePath = $archivoInput->store('observaciones', 'public');
        }

        $comentario = $request->comentario ?? $request->comment ?? '';
        $requerimientos = $request->requerimientos_correccion ?? $request->correction_requirements ?? '';
        $porcentaje = $request->porcentaje_asignado ?? $request->assigned_percentage;

        $actividad->estado = 'observada';
        if ($porcentaje !== null) {
            $actividad->porcentaje_avance = $porcentaje;
        }
        $actividad->save();

        // Guardar en el historial de revisiones
        $revision = RevisionHistorial::create([
            'actividad_id' => $actividad->id,
            'usuario_id' => $request->user()->id,
            'accion' => 'observacion',
            'comentario' => $comentario,
            'requerimientos_correccion' => $requerimientos,
            'porcentaje_asignado' => $actividad->porcentaje_avance,
            'archivo_evidencia' => $filePath,
        ]);

        // Notificar al responsable
        Notificacion::create([
            'usuario_id' => $actividad->usuario_asignado_id,
            'titulo' => 'Actividad Observada',
            'mensaje' => 'El supervisor ha formulado observaciones a tu actividad: "' . $actividad->titulo . '". Revisa los requerimientos a corregir.',
            'tipo' => 'observacion',
            'actividad_id' => $actividad->id,
        ]);

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'actividades',
            'observacion',
            "Observación emitida sobre actividad: {$actividad->titulo}"
        );

        return response()->json([
            'message' => 'Observación registrada correctamente en el historial.',
            'actividad' => $actividad->fresh(['proyecto', 'responsable', 'supervisor']),
            'revision' => $revision,
        ]);
    }
}
