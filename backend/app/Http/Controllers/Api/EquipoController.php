<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BitacoraAuditoria;
use App\Models\Equipo;
use App\Models\User;
use Illuminate\Http\Request;

class EquipoController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Equipo::with(['supervisor', 'miembros.cargo', 'departamento', 'proyectos']);

        if ($user->rol === 'supervisor') {
            $query->where('supervisor_id', $user->id);
        } elseif ($user->rol === 'colaborador' || $user->rol === 'practicante') {
            $query->whereHas('miembros', function ($q) use ($user) {
                $q->where('usuarios.id', $user->id);
            });
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
            'departamento_id' => 'nullable|exists:departamentos,id',
            'supervisor_id' => 'required|exists:usuarios,id',
            'miembros' => 'nullable|array',
            'members' => 'nullable|array',
        ]);

        $nombre = $validated['nombre'] ?? $validated['name'] ?? 'Nuevo Equipo';
        $descripcion = $validated['descripcion'] ?? $validated['description'] ?? null;

        $equipo = Equipo::create([
            'nombre' => $nombre,
            'descripcion' => $descripcion,
            'departamento_id' => $validated['departamento_id'] ?? null,
            'supervisor_id' => $validated['supervisor_id'],
        ]);

        $syncData = [
            $validated['supervisor_id'] => ['rol_en_equipo' => 'supervisor']
        ];

        $rawMembers = $validated['miembros'] ?? $validated['members'] ?? [];
        foreach ($rawMembers as $member) {
            $userId = $member['usuario_id'] ?? $member['user_id'] ?? null;
            $rolRaw = $member['rol_en_equipo'] ?? $member['role_in_team'] ?? 'colaborador';
            $rol = match ($rolRaw) {
                'worker' => 'colaborador',
                'intern' => 'practicante',
                default => $rolRaw,
            };
            if ($userId) {
                $syncData[$userId] = ['rol_en_equipo' => $rol];
            }
        }

        $equipo->miembros()->sync($syncData);

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'equipos',
            'creacion',
            "Creación del equipo: {$equipo->nombre}",
            null,
            $equipo->toArray()
        );

        return response()->json($equipo->load(['supervisor', 'miembros', 'departamento']), 201);
    }

    public function show($id)
    {
        $equipo = Equipo::with(['supervisor', 'miembros.cargo', 'departamento', 'proyectos.actividades'])->findOrFail($id);
        return response()->json($equipo);
    }

    public function update(Request $request, $id)
    {
        $equipo = Equipo::findOrFail($id);
        $datosPrevios = $equipo->toArray();

        $validated = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string',
            'description' => 'nullable|string',
            'departamento_id' => 'nullable|exists:departamentos,id',
            'supervisor_id' => 'sometimes|exists:usuarios,id',
            'miembros' => 'nullable|array',
            'members' => 'nullable|array',
        ]);

        if (isset($validated['nombre']) || isset($validated['name'])) {
            $equipo->nombre = $validated['nombre'] ?? $validated['name'];
        }
        if (isset($validated['descripcion']) || isset($validated['description'])) {
            $equipo->descripcion = $validated['descripcion'] ?? $validated['description'];
        }
        if (array_key_exists('departamento_id', $validated)) {
            $equipo->departamento_id = $validated['departamento_id'];
        }
        if (isset($validated['supervisor_id'])) {
            $equipo->supervisor_id = $validated['supervisor_id'];
        }

        $equipo->save();

        if ($request->has('miembros') || $request->has('members')) {
            $syncData = [
                $equipo->supervisor_id => ['rol_en_equipo' => 'supervisor']
            ];

            $rawMembers = $validated['miembros'] ?? $validated['members'] ?? [];
            foreach ($rawMembers as $member) {
                $userId = $member['usuario_id'] ?? $member['user_id'] ?? null;
                $rolRaw = $member['rol_en_equipo'] ?? $member['role_in_team'] ?? 'colaborador';
                $rol = match ($rolRaw) {
                    'worker' => 'colaborador',
                    'intern' => 'practicante',
                    default => $rolRaw,
                };
                if ($userId) {
                    $syncData[$userId] = ['rol_en_equipo' => $rol];
                }
            }

            $equipo->miembros()->sync($syncData);
        }

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'equipos',
            'actualizacion',
            "Actualización del equipo: {$equipo->nombre}",
            $datosPrevios,
            $equipo->toArray()
        );

        return response()->json($equipo->load(['supervisor', 'miembros', 'departamento']));
    }

    public function destroy(Request $request, $id)
    {
        $equipo = Equipo::findOrFail($id);
        $nombre = $equipo->nombre;
        $equipo->delete();

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'equipos',
            'eliminacion',
            "Eliminación del equipo: {$nombre}"
        );

        return response()->json(['message' => 'Equipo eliminado correctamente']);
    }
}
