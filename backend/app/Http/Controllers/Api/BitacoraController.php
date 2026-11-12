<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BitacoraAuditoria;
use Illuminate\Http\Request;

class BitacoraController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = BitacoraAuditoria::with('usuario');

        // Solo admin ve toda la bitácora; supervisores ven su propio historial
        if ($user->rol !== 'administrador') {
            $query->where('usuario_id', $user->id);
        }

        if ($request->has('modulo') && $request->modulo) {
            $query->where('modulo', $request->modulo);
        }

        if ($request->has('accion') && $request->accion) {
            $query->where('accion', $request->accion);
        }

        if ($request->has('usuario_id') && $request->usuario_id) {
            $query->where('usuario_id', $request->usuario_id);
        }

        if ($request->has('fecha_desde') && $request->fecha_desde) {
            $query->where('created_at', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta') && $request->fecha_hasta) {
            $query->where('created_at', '<=', $request->fecha_hasta . ' 23:59:59');
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate(50)
        );
    }

    public function show($id)
    {
        $registro = BitacoraAuditoria::with('usuario')->findOrFail($id);
        return response()->json($registro);
    }
}

