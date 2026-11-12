<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Equipos de trabajo
        Schema::create('equipos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->foreignId('departamento_id')->nullable()->constrained('departamentos')->nullOnDelete();
            $table->foreignId('supervisor_id')->constrained('usuarios')->onDelete('cascade');
            $table->timestamps();
        });

        // 2. Miembros del equipo (Tabla pivote)
        Schema::create('equipo_usuario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipo_id')->constrained('equipos')->onDelete('cascade');
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->enum('rol_en_equipo', ['supervisor', 'colaborador', 'practicante'])->default('colaborador');
            $table->timestamps();
            $table->unique(['equipo_id', 'usuario_id']);
        });

        // 3. Proyectos
        Schema::create('proyectos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['planificado', 'en_progreso', 'pausado', 'completado', 'cancelado'])->default('en_progreso');
            $table->enum('prioridad', ['baja', 'media', 'alta', 'urgente'])->default('media');
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin_estimada')->nullable();
            $table->date('fecha_fin_real')->nullable();
            $table->foreignId('supervisor_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('equipo_id')->nullable()->constrained('equipos')->nullOnDelete();
            $table->foreignId('departamento_id')->nullable()->constrained('departamentos')->nullOnDelete();
            $table->timestamps();
        });

        // 4. Actividades
        Schema::create('actividades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proyecto_id')->constrained('proyectos')->onDelete('cascade');
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->text('planteamiento_problema')->nullable();
            $table->text('trabajo_a_realizar')->nullable();
            $table->foreignId('usuario_asignado_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('supervisor_id')->constrained('usuarios')->onDelete('cascade');
            $table->date('fecha_asignacion')->nullable();
            $table->date('fecha_limite')->nullable();
            $table->enum('prioridad', ['baja', 'media', 'alta', 'urgente'])->default('media');
            $table->enum('estado', ['pendiente', 'en_proceso', 'terminada', 'en_revision', 'aprobada', 'observada'])->default('pendiente');
            $table->integer('porcentaje_avance')->default(0); // Porcentaje oficial otorgado por el supervisor
            $table->timestamps();
        });

        // 5. Registro de Avances (Historial Inmutable)
        Schema::create('avances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actividad_id')->constrained('actividades')->onDelete('cascade');
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->text('descripcion');
            $table->integer('porcentaje_reportado')->nullable();
            $table->string('archivo_evidencia')->nullable();
            $table->string('nombre_original_archivo')->nullable();
            $table->timestamps();
        });

        // 6. Historial de Revisiones (Observaciones y Aprobaciones)
        Schema::create('revisiones_historial', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actividad_id')->constrained('actividades')->onDelete('cascade');
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->enum('accion', ['solicitud_revision', 'observacion', 'correccion', 'aprobacion']);
            $table->text('comentario')->nullable();
            $table->text('requerimientos_correccion')->nullable();
            $table->integer('porcentaje_asignado')->nullable();
            $table->string('archivo_evidencia')->nullable();
            $table->timestamps();
        });

        // 7. Notificaciones del sistema
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->string('titulo');
            $table->text('mensaje');
            $table->string('tipo'); // actividad_asignada, observacion, aprobacion, revision_solicitada, etc.
            $table->foreignId('actividad_id')->nullable()->constrained('actividades')->nullOnDelete();
            $table->boolean('leida')->default(false);
            $table->timestamps();
        });

        // 8. Evaluaciones de Desempeño
        Schema::create('evaluaciones_personal', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('supervisor_id')->constrained('usuarios')->onDelete('cascade');
            $table->string('periodo'); // Ej: Evaluación Octubre 2026
            $table->date('periodo_inicio')->nullable();
            $table->date('periodo_fin')->nullable();
            $table->integer('total_actividades')->default(0);
            $table->integer('actividades_completadas')->default(0);
            $table->integer('actividades_aprobadas')->default(0);
            $table->integer('actividades_observadas')->default(0);
            $table->integer('actividades_retrasadas')->default(0);
            $table->decimal('promedio_avance', 5, 2)->default(0.00);
            $table->decimal('tasa_cumplimiento', 5, 2)->default(0.00);
            $table->text('observacion_supervisor')->nullable();
            $table->integer('puntaje')->nullable(); // 0 a 100
            $table->enum('estado', ['borrador', 'finalizada'])->default('finalizada');
            $table->timestamps();
        });

        // 9. Criterios de Evaluación por Competencias
        Schema::create('criterios_evaluacion', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->enum('categoria', ['calidad_tecnica', 'cumplimiento', 'proactividad', 'trabajo_equipo', 'comunicacion'])->default('calidad_tecnica');
            $table->integer('peso_porcentaje')->default(20);
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');
            $table->timestamps();
        });

        // 10. Detalles de Evaluación (Rúbricas individuales)
        Schema::create('evaluacion_detalles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluacion_id')->constrained('evaluaciones_personal')->onDelete('cascade');
            $table->foreignId('criterio_id')->constrained('criterios_evaluacion')->onDelete('cascade');
            $table->integer('calificacion'); // Calificación 1 a 5
            $table->text('comentario')->nullable();
            $table->timestamps();
        });

        // 11. Metas y Objetivos de Rendimiento (OKRs / KPIs)
        Schema::create('objetivos_desempeno', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('supervisor_id')->constrained('usuarios')->onDelete('cascade');
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->decimal('meta_cuantitativa', 10, 2);
            $table->decimal('progreso_actual', 10, 2)->default(0.00);
            $table->string('unidad_medida')->default('%'); // '%', 'tareas', 'horas', 'puntos'
            $table->date('fecha_limite')->nullable();
            $table->enum('estado', ['en_progreso', 'cumplido', 'no_cumplido', 'cancelado'])->default('en_progreso');
            $table->timestamps();
        });

        // 12. Bitácora de Auditoría del Sistema
        Schema::create('bitacora_auditorias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('modulo'); // usuarios, actividades, evaluaciones, proyectos, equipos, auth
            $table->string('accion'); // creacion, actualizacion, eliminacion, revision, login
            $table->text('descripcion');
            $table->string('ip_origen')->nullable();
            $table->json('datos_previos')->nullable();
            $table->json('datos_posteriores')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bitacora_auditorias');
        Schema::dropIfExists('objetivos_desempeno');
        Schema::dropIfExists('evaluacion_detalles');
        Schema::dropIfExists('criterios_evaluacion');
        Schema::dropIfExists('evaluaciones_personal');
        Schema::dropIfExists('notificaciones');
        Schema::dropIfExists('revisiones_historial');
        Schema::dropIfExists('avances');
        Schema::dropIfExists('actividades');
        Schema::dropIfExists('proyectos');
        Schema::dropIfExists('equipo_usuario');
        Schema::dropIfExists('equipos');
    }
};
