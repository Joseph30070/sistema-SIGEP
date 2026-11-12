<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    public function index(Request $request)
    {
        $notificaciones = $request->user()->notificaciones()->take(30)->get();
        return response()->json($notificaciones);
    }

    public function markAsRead(Request $request, $id)
    {
        $notif = Notificacion::where('usuario_id', $request->user()->id)->findOrFail($id);
        $notif->leida = true;
        $notif->save();

        return response()->json(['message' => 'Notificación marcada como leída']);
    }

    public function markAllAsRead(Request $request)
    {
        Notificacion::where('usuario_id', $request->user()->id)->update(['leida' => true]);
        return response()->json(['message' => 'Todas las notificaciones marcadas como leídas']);
    }
}
