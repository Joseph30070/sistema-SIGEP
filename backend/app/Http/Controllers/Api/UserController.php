<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BitacoraAuditoria;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['cargo', 'departamento']);

        // Filtro por rol (admite tanto español como nombres anteriores)
        if ($request->has('role') && $request->role) {
            $rol = match ($request->role) {
                'admin' => 'administrador',
                'worker' => 'colaborador',
                'intern' => 'practicante',
                default => $request->role,
            };
            $query->where('rol', $rol);
        }

        if ($request->has('rol') && $request->rol) {
            $query->where('rol', $request->rol);
        }

        if ($request->has('status') && $request->status) {
            $estado = match ($request->status) {
                'active' => 'activo',
                'inactive' => 'inactivo',
                default => $request->status,
            };
            $query->where('estado', $estado);
        }

        if ($request->has('estado') && $request->estado) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('departamento_id') && $request->departamento_id) {
            $query->where('departamento_id', $request->departamento_id);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('dni', 'like', "%{$search}%")
                  ->orWhereHas('cargo', function ($cq) use ($search) {
                      $cq->where('nombre', 'like', "%{$search}%");
                  });
            });
        }

        $usuarios = $query->orderBy('nombre')->get();

        return response()->json($usuarios);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:usuarios,email',
            'password' => 'required|string|min:6',
            'rol' => 'nullable|in:administrador,supervisor,colaborador,practicante,admin,worker,intern',
            'role' => 'nullable|in:administrador,supervisor,colaborador,practicante,admin,worker,intern',
            'telefono' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'dni' => 'nullable|string|max:20',
            'departamento_id' => 'nullable|exists:departamentos,id',
            'cargo_id' => 'nullable|exists:cargos,id',
            'estado' => 'nullable|in:activo,inactivo,active,inactive',
            'status' => 'nullable|in:activo,inactivo,active,inactive',
        ]);

        $nombre = $validated['nombre'] ?? $validated['name'] ?? '';
        $rolRaw = $validated['rol'] ?? $validated['role'] ?? 'colaborador';
        $rol = match ($rolRaw) {
            'admin' => 'administrador',
            'worker' => 'colaborador',
            'intern' => 'practicante',
            default => $rolRaw,
        };

        $estadoRaw = $validated['estado'] ?? $validated['status'] ?? 'activo';
        $estado = match ($estadoRaw) {
            'active' => 'activo',
            'inactive' => 'inactivo',
            default => $estadoRaw,
        };

        $user = User::create([
            'nombre' => $nombre,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'rol' => $rol,
            'telefono' => $validated['telefono'] ?? $validated['phone'] ?? null,
            'dni' => $validated['dni'] ?? null,
            'departamento_id' => $validated['departamento_id'] ?? null,
            'cargo_id' => $validated['cargo_id'] ?? null,
            'estado' => $estado,
        ]);

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'usuarios',
            'creacion',
            "Creación del usuario {$user->nombre} con rol {$user->rol}",
            null,
            $user->toArray()
        );

        return response()->json($user->load(['cargo', 'departamento']), 201);
    }

    public function show($id)
    {
        $user = User::with([
            'cargo',
            'departamento',
            'equipos',
            'actividadesAsignadas.proyecto',
            'evaluacionesRecibidas.detalles.criterio',
            'objetivos',
        ])->findOrFail($id);

        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $datosPrevios = $user->toArray();

        $validated = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'email' => 'sometimes|email|unique:usuarios,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'rol' => 'nullable|in:administrador,supervisor,colaborador,practicante,admin,worker,intern',
            'role' => 'nullable|in:administrador,supervisor,colaborador,practicante,admin,worker,intern',
            'telefono' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'dni' => 'nullable|string|max:20',
            'departamento_id' => 'nullable|exists:departamentos,id',
            'cargo_id' => 'nullable|exists:cargos,id',
            'estado' => 'nullable|in:activo,inactivo,active,inactive',
            'status' => 'nullable|in:activo,inactivo,active,inactive',
        ]);

        if (isset($validated['nombre']) || isset($validated['name'])) {
            $user->nombre = $validated['nombre'] ?? $validated['name'];
        }

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        if (isset($validated['rol']) || isset($validated['role'])) {
            $rolRaw = $validated['rol'] ?? $validated['role'];
            $user->rol = match ($rolRaw) {
                'admin' => 'administrador',
                'worker' => 'colaborador',
                'intern' => 'practicante',
                default => $rolRaw,
            };
        }

        if (isset($validated['telefono']) || isset($validated['phone'])) {
            $user->telefono = $validated['telefono'] ?? $validated['phone'];
        }

        if (isset($validated['dni'])) {
            $user->dni = $validated['dni'];
        }

        if (array_key_exists('departamento_id', $validated)) {
            $user->departamento_id = $validated['departamento_id'];
        }

        if (array_key_exists('cargo_id', $validated)) {
            $user->cargo_id = $validated['cargo_id'];
        }

        if (isset($validated['estado']) || isset($validated['status'])) {
            $estadoRaw = $validated['estado'] ?? $validated['status'];
            $user->estado = match ($estadoRaw) {
                'active' => 'activo',
                'inactive' => 'inactivo',
                default => $estadoRaw,
            };
        }

        $user->save();

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'usuarios',
            'actualizacion',
            "Actualización de datos del usuario {$user->nombre}",
            $datosPrevios,
            $user->toArray()
        );

        return response()->json($user->load(['cargo', 'departamento']));
    }

    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->estado = 'inactivo';
        $user->save();

        BitacoraAuditoria::registrar(
            $request->user()?->id,
            'usuarios',
            'desactivacion',
            "Desactivación lógica del usuario {$user->nombre}"
        );

        return response()->json(['message' => 'Usuario desactivado correctamente']);
    }
}
