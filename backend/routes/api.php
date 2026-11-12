<?php

use App\Http\Controllers\Api\ActividadController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AvanceController;
use App\Http\Controllers\Api\BitacoraController;
use App\Http\Controllers\Api\CargoController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepartamentoController;
use App\Http\Controllers\Api\EquipoController;
use App\Http\Controllers\Api\EvaluacionController;
use App\Http\Controllers\Api\NotificacionController;
use App\Http\Controllers\Api\ObjetivoController;
use App\Http\Controllers\Api\ProyectoController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\RevisionController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Rutas públicas de autenticación
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas con token Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'getMetrics']);

    // Usuarios y Personal
    Route::apiResource('users', UserController::class);

    // Estructura Organizacional
    Route::apiResource('departamentos', DepartamentoController::class);
    Route::apiResource('cargos', CargoController::class);

    // Equipos de trabajo
    Route::apiResource('equipos', EquipoController::class);

    // Proyectos
    Route::apiResource('proyectos', ProyectoController::class);

    // Actividades
    Route::apiResource('actividades', ActividadController::class);

    // Avances (Historial inmutable)
    Route::post('/actividades/{id}/avances', [AvanceController::class, 'store']);

    // Proceso de Revisión (Flujo: Solicitud → Observación / Aprobación → Corrección)
    Route::post('/actividades/{id}/solicitar-revision', [RevisionController::class, 'solicitarRevision']);
    Route::post('/actividades/{id}/aprobar', [RevisionController::class, 'aprobar']);
    Route::post('/actividades/{id}/observar', [RevisionController::class, 'observar']);

    // Notificaciones
    Route::get('/notificaciones', [NotificacionController::class, 'index']);
    Route::put('/notificaciones/{id}/read', [NotificacionController::class, 'markAsRead']);
    Route::put('/notificaciones/read-all', [NotificacionController::class, 'markAllAsRead']);

    // Evaluaciones de desempeño (con detalle de rúbricas)
    Route::get('/evaluaciones/calculate-metrics', [EvaluacionController::class, 'calculateMetrics']);
    Route::apiResource('evaluaciones', EvaluacionController::class);

    // Metas y Objetivos de Rendimiento (OKRs / KPIs)
    Route::apiResource('objetivos', ObjetivoController::class);

    // Reportes consolidados
    Route::get('/reportes/equipo/{id}', [ReporteController::class, 'equipoReporte']);
    Route::get('/reportes/personal/{id}', [ReporteController::class, 'personalReporte']);

    // Bitácora de Auditoría del Sistema (solo lectura)
    Route::get('/bitacora', [BitacoraController::class, 'index']);
    Route::get('/bitacora/{id}', [BitacoraController::class, 'show']);
});
