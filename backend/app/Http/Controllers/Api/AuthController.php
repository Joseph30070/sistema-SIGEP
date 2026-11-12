<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BitacoraAuditoria;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::with(['cargo', 'departamento'])->where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        if ($user->estado !== 'activo') {
            return response()->json([
                'message' => 'Tu cuenta se encuentra inactiva. Contacta con el administrador.',
            ], 403);
        }

        // Generar token Bearer de Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        // Registrar en bitácora de auditoría
        BitacoraAuditoria::registrar(
            $user->id,
            'auth',
            'login',
            "Inicio de sesión exitoso del usuario {$user->nombre} ({$user->rol})"
        );

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'nombre' => $user->nombre,
                'name' => $user->nombre,
                'email' => $user->email,
                'rol' => $user->rol,
                'role' => $user->rol,
                'cargo' => $user->cargo?->nombre,
                'position' => $user->cargo?->nombre,
                'departamento' => $user->departamento?->nombre,
                'telefono' => $user->telefono,
                'phone' => $user->telefono,
                'dni' => $user->dni,
                'estado' => $user->estado,
                'status' => $user->estado,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            BitacoraAuditoria::registrar(
                $user->id,
                'auth',
                'logout',
                "Cierre de sesión del usuario {$user->nombre}"
            );
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Sesión cerrada correctamente',
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load(['cargo', 'departamento']);
        $unreadCount = $user->notificaciones()->where('leida', false)->count();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'nombre' => $user->nombre,
                'name' => $user->nombre,
                'email' => $user->email,
                'rol' => $user->rol,
                'role' => $user->rol,
                'cargo' => $user->cargo?->nombre,
                'position' => $user->cargo?->nombre,
                'departamento' => $user->departamento?->nombre,
                'telefono' => $user->telefono,
                'phone' => $user->telefono,
                'dni' => $user->dni,
                'estado' => $user->estado,
                'status' => $user->estado,
            ],
            'unread_notifications' => $unreadCount,
        ]);
    }
}
