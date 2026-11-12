<?php

namespace Database\Seeders;

use App\Models\Actividad;
use App\Models\Avance;
use App\Models\BitacoraAuditoria;
use App\Models\Cargo;
use App\Models\CriterioEvaluacion;
use App\Models\Departamento;
use App\Models\Equipo;
use App\Models\EvaluacionDetalle;
use App\Models\EvaluacionPersonal;
use App\Models\Notificacion;
use App\Models\ObjetivoDesempeno;
use App\Models\Proyecto;
use App\Models\RevisionHistorial;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Estructura Organizacional: Departamentos
        $deptoTI = Departamento::create([
            'nombre' => 'Tecnología e Innovación',
            'codigo' => 'DEP-TI',
            'descripcion' => 'Área responsable de desarrollo de software, arquitectura en la nube e infraestructura de TI.',
            'estado' => 'activo',
        ]);

        $deptoQA = Departamento::create([
            'nombre' => 'Calidad y Aseguramiento QA',
            'codigo' => 'DEP-QA',
            'descripcion' => 'Área dedicada a pruebas de software, auditoría de código y estándares de entrega.',
            'estado' => 'activo',
        ]);

        $deptoOperaciones = Departamento::create([
            'nombre' => 'Operaciones y Gestión de Proyectos',
            'codigo' => 'DEP-OPS',
            'descripcion' => 'Área encargada de la coordinación metodológica, seguimiento y entrega de valor al negocio.',
            'estado' => 'activo',
        ]);

        // 2. Estructura Organizacional: Cargos
        $cargoAdmin = Cargo::create([
            'nombre' => 'Gerente de TI / Administrador General',
            'departamento_id' => $deptoTI->id,
            'nivel_jerarquico' => 'directivo',
            'salario_base' => 7500.00,
            'descripcion' => 'Responsable de la dirección estratégica, asignación de recursos y supervisión global.',
        ]);

        $cargoSupervisor = Cargo::create([
            'nombre' => 'Líder Técnico & Supervisor de Desarrollo',
            'departamento_id' => $deptoTI->id,
            'nivel_jerarquico' => 'supervision',
            'salario_base' => 5200.00,
            'descripcion' => 'Coordina equipos técnicos, revisa entregables, valida porcentajes oficiales y emite evaluaciones.',
        ]);

        $cargoDevFullStack = Cargo::create([
            'nombre' => 'Desarrollador Full Stack Senior',
            'departamento_id' => $deptoTI->id,
            'nivel_jerarquico' => 'operativo',
            'salario_base' => 3800.00,
            'descripcion' => 'Construcción de módulos frontend/backend, bases de datos y optimización de arquitectura.',
        ]);

        $cargoDevFrontend = Cargo::create([
            'nombre' => 'Desarrollador Frontend React',
            'departamento_id' => $deptoTI->id,
            'nivel_jerarquico' => 'operativo',
            'salario_base' => 3400.00,
            'descripcion' => 'Implementación de interfaces de usuario modernas, integración de APIs y rendimiento web.',
        ]);

        $cargoPracticante = Cargo::create([
            'nombre' => 'Practicante Preprofesional de Software',
            'departamento_id' => $deptoTI->id,
            'nivel_jerarquico' => 'practicas',
            'salario_base' => 1200.00,
            'descripcion' => 'Apoyo en desarrollo de funcionalidades asistidas, reporte continuo de avances y pruebas.',
        ]);

        // 3. Usuarios con roles 100% en español
        $admin = User::create([
            'nombre' => 'Alejandro Ramos',
            'email' => 'admin@empresa.com',
            'password' => Hash::make('123456'),
            'rol' => 'administrador',
            'telefono' => '+51 987654321',
            'dni' => '10203040',
            'departamento_id' => $deptoTI->id,
            'cargo_id' => $cargoAdmin->id,
            'estado' => 'activo',
        ]);

        $supervisor = User::create([
            'nombre' => 'Mateo Silva',
            'email' => 'supervisor@empresa.com',
            'password' => Hash::make('123456'),
            'rol' => 'supervisor',
            'telefono' => '+51 987654322',
            'dni' => '20304050',
            'departamento_id' => $deptoTI->id,
            'cargo_id' => $cargoSupervisor->id,
            'estado' => 'activo',
        ]);

        $colaborador1 = User::create([
            'nombre' => 'Daniel Navarro',
            'email' => 'daniel@empresa.com',
            'password' => Hash::make('123456'),
            'rol' => 'colaborador',
            'telefono' => '+51 987654323',
            'dni' => '30405060',
            'departamento_id' => $deptoTI->id,
            'cargo_id' => $cargoDevFullStack->id,
            'estado' => 'activo',
        ]);

        $colaborador2 = User::create([
            'nombre' => 'Andrés Salazar',
            'email' => 'andres@empresa.com',
            'password' => Hash::make('123456'),
            'rol' => 'colaborador',
            'telefono' => '+51 987654324',
            'dni' => '40506070',
            'departamento_id' => $deptoTI->id,
            'cargo_id' => $cargoDevFrontend->id,
            'estado' => 'activo',
        ]);

        $practicante = User::create([
            'nombre' => 'Rodrigo Flores',
            'email' => 'rodrigo@empresa.com',
            'password' => Hash::make('123456'),
            'rol' => 'practicante',
            'telefono' => '+51 987654325',
            'dni' => '50607080',
            'departamento_id' => $deptoTI->id,
            'cargo_id' => $cargoPracticante->id,
            'estado' => 'activo',
        ]);

        // Vincular responsables de departamentos
        $deptoTI->update(['responsable_id' => $admin->id]);
        $deptoQA->update(['responsable_id' => $supervisor->id]);
        $deptoOperaciones->update(['responsable_id' => $admin->id]);

        // 4. Equipos de trabajo
        $equipo = Equipo::create([
            'nombre' => 'Equipo de Desarrollo Web Alfa',
            'descripcion' => 'Equipo técnico dedicado al core de plataformas web empresariales y APIs.',
            'departamento_id' => $deptoTI->id,
            'supervisor_id' => $supervisor->id,
        ]);

        $equipo->miembros()->attach([
            $supervisor->id => ['rol_en_equipo' => 'supervisor'],
            $colaborador1->id => ['rol_en_equipo' => 'colaborador'],
            $colaborador2->id => ['rol_en_equipo' => 'colaborador'],
            $practicante->id => ['rol_en_equipo' => 'practicante'],
        ]);

        // 5. Proyectos
        $proyecto1 = Proyecto::create([
            'nombre' => 'Sistema Integral de Gestión y Evaluación de Personal',
            'descripcion' => 'Plataforma para centralizar el organigrama, auditoría, seguimiento de tareas y rúbricas de desempeño.',
            'estado' => 'en_progreso',
            'prioridad' => 'alta',
            'fecha_inicio' => now()->subDays(25)->toDateString(),
            'fecha_fin_estimada' => now()->addDays(35)->toDateString(),
            'supervisor_id' => $supervisor->id,
            'equipo_id' => $equipo->id,
            'departamento_id' => $deptoTI->id,
        ]);

        $proyecto2 = Proyecto::create([
            'nombre' => 'Portal de Servicios Internos y Autoservicio',
            'descripcion' => 'Módulo corporativo para metas individuales, consultas de perfil y seguimiento institucional.',
            'estado' => 'planificado',
            'prioridad' => 'media',
            'fecha_inicio' => now()->addDays(5)->toDateString(),
            'fecha_fin_estimada' => now()->addDays(60)->toDateString(),
            'supervisor_id' => $supervisor->id,
            'equipo_id' => $equipo->id,
            'departamento_id' => $deptoTI->id,
        ]);

        // 6. Actividades con ciclo completo
        // Actividad 1: Aprobada (Daniel)
        $act1 = Actividad::create([
            'proyecto_id' => $proyecto1->id,
            'titulo' => 'Implementar módulo de estructura organizacional y usuarios',
            'descripcion' => 'Crear modelos, controladores y migraciones para departamentos, cargos y usuarios en español.',
            'planteamiento_problema' => 'Se requiere que el sistema soporte organigrama jerárquico y nomenclatura corporativa completa.',
            'trabajo_a_realizar' => 'Desarrollar esquema relacional, validaciones y servicios REST con auditoría activa.',
            'usuario_asignado_id' => $colaborador1->id,
            'supervisor_id' => $supervisor->id,
            'fecha_asignacion' => now()->subDays(18)->toDateString(),
            'fecha_limite' => now()->subDays(3)->toDateString(),
            'prioridad' => 'alta',
            'estado' => 'aprobada',
            'porcentaje_avance' => 100,
        ]);

        Avance::create([
            'actividad_id' => $act1->id,
            'usuario_id' => $colaborador1->id,
            'descripcion' => 'Diseño de la estructura relacional de departamentos y cargos.',
            'porcentaje_reportado' => 40,
            'created_at' => now()->subDays(15),
        ]);
        Avance::create([
            'actividad_id' => $act1->id,
            'usuario_id' => $colaborador1->id,
            'descripcion' => 'Implementación de autenticación y endpoints en español.',
            'porcentaje_reportado' => 80,
            'created_at' => now()->subDays(10),
        ]);
        Avance::create([
            'actividad_id' => $act1->id,
            'usuario_id' => $colaborador1->id,
            'descripcion' => 'Pruebas completas de integración y documentación API finalizada.',
            'porcentaje_reportado' => 100,
            'created_at' => now()->subDays(4),
        ]);

        RevisionHistorial::create([
            'actividad_id' => $act1->id,
            'usuario_id' => $colaborador1->id,
            'accion' => 'solicitud_revision',
            'comentario' => 'Módulo completado y probado localmente, solicito validación técnica.',
            'created_at' => now()->subDays(4)->addHours(1),
        ]);
        RevisionHistorial::create([
            'actividad_id' => $act1->id,
            'usuario_id' => $supervisor->id,
            'accion' => 'aprobacion',
            'comentario' => 'Excelente trabajo. La arquitectura cumple con los requerimientos.',
            'porcentaje_asignado' => 100,
            'created_at' => now()->subDays(3),
        ]);

        // Actividad 2: En Revisión (Andrés)
        $act2 = Actividad::create([
            'proyecto_id' => $proyecto1->id,
            'titulo' => 'Diseño y maquetación del tablero de control ejecutivo',
            'descripcion' => 'Implementar widgets de estado de actividades, gráficos y alertas de vencimiento.',
            'planteamiento_problema' => 'Los supervisores necesitan visibilidad en tiempo real de atrasos y aprobaciones.',
            'trabajo_a_realizar' => 'Construir vistas React, componentes Tailwind y consumo de métricas.',
            'usuario_asignado_id' => $colaborador2->id,
            'supervisor_id' => $supervisor->id,
            'fecha_asignacion' => now()->subDays(10)->toDateString(),
            'fecha_limite' => now()->addDays(2)->toDateString(),
            'prioridad' => 'media',
            'estado' => 'en_revision',
            'porcentaje_avance' => 90,
        ]);

        Avance::create([
            'actividad_id' => $act2->id,
            'usuario_id' => $colaborador2->id,
            'descripcion' => 'Maquetación base de tarjetas de indicadores y diseño responsivo.',
            'porcentaje_reportado' => 50,
            'created_at' => now()->subDays(7),
        ]);
        Avance::create([
            'actividad_id' => $act2->id,
            'usuario_id' => $colaborador2->id,
            'descripcion' => 'Conexión con el backend y filtros dinámicos por rol.',
            'porcentaje_reportado' => 90,
            'created_at' => now()->subDays(1),
        ]);

        RevisionHistorial::create([
            'actividad_id' => $act2->id,
            'usuario_id' => $colaborador2->id,
            'accion' => 'solicitud_revision',
            'comentario' => 'Vistas listas con datos mock y reales. Pendiente feedback del supervisor.',
            'created_at' => now()->subDays(1)->addHours(2),
        ]);

        // Actividad 3: Observada (Rodrigo)
        $act3 = Actividad::create([
            'proyecto_id' => $proyecto1->id,
            'titulo' => 'Desarrollar bitácora de auditoría y captura de eventos',
            'descripcion' => 'Registrar en base de datos cada acción relevante realizada por los usuarios.',
            'planteamiento_problema' => 'Faltaba registrar la dirección IP y datos previos ante modificaciones.',
            'trabajo_a_realizar' => 'Crear migración, middleware o helper de auditoría y vista de consulta.',
            'usuario_asignado_id' => $practicante->id,
            'supervisor_id' => $supervisor->id,
            'fecha_asignacion' => now()->subDays(8)->toDateString(),
            'fecha_limite' => now()->subDays(2)->toDateString(),
            'prioridad' => 'media',
            'estado' => 'observada',
            'porcentaje_avance' => 65,
        ]);

        Avance::create([
            'actividad_id' => $act3->id,
            'usuario_id' => $practicante->id,
            'descripcion' => 'Creación de tabla bitacora_auditorias y modelo Eloquent.',
            'porcentaje_reportado' => 40,
            'created_at' => now()->subDays(5),
        ]);
        Avance::create([
            'actividad_id' => $act3->id,
            'usuario_id' => $practicante->id,
            'descripcion' => 'Captura de eventos de creación y edición básica.',
            'porcentaje_reportado' => 70,
            'created_at' => now()->subDays(2),
        ]);

        RevisionHistorial::create([
            'actividad_id' => $act3->id,
            'usuario_id' => $practicante->id,
            'accion' => 'solicitud_revision',
            'comentario' => 'Avance listo para revisión preliminar.',
            'created_at' => now()->subDays(2)->addHours(3),
        ]);
        RevisionHistorial::create([
            'actividad_id' => $act3->id,
            'usuario_id' => $supervisor->id,
            'accion' => 'observacion',
            'comentario' => 'Se requiere asegurar que la IP se guarde en formato string seguro y que los datos JSON no queden vacíos.',
            'requerimientos_correccion' => '1. Capturar request()->ip(). 2. Registrar json de datos_posteriores en actualizaciones.',
            'porcentaje_asignado' => 65,
            'created_at' => now()->subDays(1),
        ]);

        // Actividad 4: En Proceso (Daniel)
        $act4 = Actividad::create([
            'proyecto_id' => $proyecto1->id,
            'titulo' => 'Módulo de metas y objetivos cuantitativos por colaborador',
            'descripcion' => 'Permitir registrar KPIs con unidad de medida y cálculo de progreso acumulativo.',
            'planteamiento_problema' => 'Se requiere evaluar el rendimiento en base a metas medibles más allá de tareas.',
            'trabajo_a_realizar' => 'CRUD de objetivos y vinculación al perfil del colaborador.',
            'usuario_asignado_id' => $colaborador1->id,
            'supervisor_id' => $supervisor->id,
            'fecha_asignacion' => now()->subDays(3)->toDateString(),
            'fecha_limite' => now()->addDays(7)->toDateString(),
            'prioridad' => 'alta',
            'estado' => 'en_proceso',
            'porcentaje_avance' => 40,
        ]);

        Avance::create([
            'actividad_id' => $act4->id,
            'usuario_id' => $colaborador1->id,
            'descripcion' => 'Diseño de la tabla de objetivos y endpoints iniciales.',
            'porcentaje_reportado' => 40,
            'created_at' => now()->subDays(1),
        ]);

        // 7. Criterios de Evaluación Multidimensional
        $crit1 = CriterioEvaluacion::create([
            'nombre' => 'Calidad Técnica y Arquitectura Limpia',
            'descripcion' => 'Evalúa las buenas prácticas de desarrollo, legibilidad y estándares técnicos.',
            'categoria' => 'calidad_tecnica',
            'peso_porcentaje' => 25,
            'estado' => 'activo',
        ]);

        $crit2 = CriterioEvaluacion::create([
            'nombre' => 'Cumplimiento de Fechas Límite y Compromisos',
            'descripcion' => 'Mide la puntualidad en la entrega de tareas asignadas sin incurrir en atrasos.',
            'categoria' => 'cumplimiento',
            'peso_porcentaje' => 25,
            'estado' => 'activo',
        ]);

        $crit3 = CriterioEvaluacion::create([
            'nombre' => 'Proactividad y Resolución de Problemas',
            'descripcion' => 'Iniciativa para resolver bloqueos técnicos y proponer mejoras.',
            'categoria' => 'proactividad',
            'peso_porcentaje' => 20,
            'estado' => 'activo',
        ]);

        $crit4 = CriterioEvaluacion::create([
            'nombre' => 'Trabajo en Equipo y Soporte Mutuo',
            'descripcion' => 'Disposición para colaborar con otros miembros y compartir conocimiento.',
            'categoria' => 'trabajo_equipo',
            'peso_porcentaje' => 15,
            'estado' => 'activo',
        ]);

        $crit5 = CriterioEvaluacion::create([
            'nombre' => 'Comunicación y Reporte Oportuno de Avances',
            'descripcion' => 'Claridad en descripciones de avance y atención rápida a observaciones.',
            'categoria' => 'comunicacion',
            'peso_porcentaje' => 15,
            'estado' => 'activo',
        ]);

        // 8. Evaluaciones de Desempeño
        $eval1 = EvaluacionPersonal::create([
            'usuario_id' => $colaborador1->id,
            'supervisor_id' => $supervisor->id,
            'periodo' => 'Evaluación de Octubre 2026',
            'periodo_inicio' => now()->subDays(30)->toDateString(),
            'periodo_fin' => now()->toDateString(),
            'total_actividades' => 5,
            'actividades_completadas' => 4,
            'actividades_aprobadas' => 4,
            'actividades_observadas' => 1,
            'actividades_retrasadas' => 0,
            'promedio_avance' => 96.00,
            'tasa_cumplimiento' => 95.00,
            'observacion_supervisor' => 'Desempeño técnico sobresaliente, gran autonomía y excelente capacidad analítica.',
            'puntaje' => 94,
            'estado' => 'finalizada',
        ]);

        EvaluacionDetalle::create([
            'evaluacion_id' => $eval1->id,
            'criterio_id' => $crit1->id,
            'calificacion' => 5,
            'comentario' => 'Código estructurado, patrones claros y apego a estándares.',
        ]);
        EvaluacionDetalle::create([
            'evaluacion_id' => $eval1->id,
            'criterio_id' => $crit2->id,
            'calificacion' => 5,
            'comentario' => 'Todas las entregas realizadas dentro del plazo estipulado.',
        ]);
        EvaluacionDetalle::create([
            'evaluacion_id' => $eval1->id,
            'criterio_id' => $crit3->id,
            'calificacion' => 5,
            'comentario' => 'Propuso la optimización de consultas SQL anticipadamente.',
        ]);
        EvaluacionDetalle::create([
            'evaluacion_id' => $eval1->id,
            'criterio_id' => $crit4->id,
            'calificacion' => 4,
            'comentario' => 'Buena interacción con los practicantes asignados.',
        ]);
        EvaluacionDetalle::create([
            'evaluacion_id' => $eval1->id,
            'criterio_id' => $crit5->id,
            'calificacion' => 5,
            'comentario' => 'Reportes de avance detallados y claros en cada hito.',
        ]);

        // Evaluación para practicante Rodrigo
        $eval2 = EvaluacionPersonal::create([
            'usuario_id' => $practicante->id,
            'supervisor_id' => $supervisor->id,
            'periodo' => 'Evaluación de Octubre 2026',
            'periodo_inicio' => now()->subDays(30)->toDateString(),
            'periodo_fin' => now()->toDateString(),
            'total_actividades' => 3,
            'actividades_completadas' => 2,
            'actividades_aprobadas' => 1,
            'actividades_observadas' => 1,
            'actividades_retrasadas' => 0,
            'promedio_avance' => 78.50,
            'tasa_cumplimiento' => 82.00,
            'observacion_supervisor' => 'Excelente curva de aprendizaje, recepción positiva ante observaciones y compromiso.',
            'puntaje' => 84,
            'estado' => 'finalizada',
        ]);

        EvaluacionDetalle::create([
            'evaluacion_id' => $eval2->id,
            'criterio_id' => $crit1->id,
            'calificacion' => 4,
            'comentario' => 'Aprende rápidamente la sintaxis y buenas prácticas del framework.',
        ]);
        EvaluacionDetalle::create([
            'evaluacion_id' => $eval2->id,
            'criterio_id' => $crit2->id,
            'calificacion' => 4,
            'comentario' => 'Buen ritmo de trabajo, sin retrasos significativos.',
        ]);
        EvaluacionDetalle::create([
            'evaluacion_id' => $eval2->id,
            'criterio_id' => $crit3->id,
            'calificacion' => 4,
            'comentario' => 'Pregunta de forma oportuna cuando requiere aclaración.',
        ]);
        EvaluacionDetalle::create([
            'evaluacion_id' => $eval2->id,
            'criterio_id' => $crit4->id,
            'calificacion' => 5,
            'comentario' => 'Excelente actitud con todo el equipo de trabajo.',
        ]);
        EvaluacionDetalle::create([
            'evaluacion_id' => $eval2->id,
            'criterio_id' => $crit5->id,
            'calificacion' => 4,
            'comentario' => 'Mantiene informado al supervisor de su progreso.',
        ]);

        // 9. Metas y Objetivos de Rendimiento (OKRs / KPIs)
        ObjetivoDesempeno::create([
            'usuario_id' => $colaborador1->id,
            'supervisor_id' => $supervisor->id,
            'titulo' => 'Índice de Aprobación en Primera Revisión Técnica',
            'descripcion' => 'Alcanzar al menos un 90% de actividades aprobadas sin observaciones mayores.',
            'meta_cuantitativa' => 90.00,
            'progreso_actual' => 92.50,
            'unidad_medida' => '%',
            'fecha_limite' => now()->addDays(30)->toDateString(),
            'estado' => 'cumplido',
        ]);

        ObjetivoDesempeno::create([
            'usuario_id' => $colaborador2->id,
            'supervisor_id' => $supervisor->id,
            'titulo' => 'Construcción del Sistema de Componentes Frontend Reutilizables',
            'descripcion' => 'Diseñar y documentar al menos 15 componentes base en React + Tailwind.',
            'meta_cuantitativa' => 15.00,
            'progreso_actual' => 12.00,
            'unidad_medida' => 'componentes',
            'fecha_limite' => now()->addDays(20)->toDateString(),
            'estado' => 'en_progreso',
        ]);

        ObjetivoDesempeno::create([
            'usuario_id' => $practicante->id,
            'supervisor_id' => $supervisor->id,
            'titulo' => 'Resolución de Tareas Técnicas Guiadas y Casos de Prueba',
            'descripcion' => 'Completar 10 tareas guiadas de desarrollo y auditoría.',
            'meta_cuantitativa' => 10.00,
            'progreso_actual' => 7.00,
            'unidad_medida' => 'tareas',
            'fecha_limite' => now()->addDays(15)->toDateString(),
            'estado' => 'en_progreso',
        ]);

        // 10. Bitácora de Auditoría Inicial
        BitacoraAuditoria::create([
            'usuario_id' => $admin->id,
            'modulo' => 'estructura',
            'accion' => 'creacion',
            'descripcion' => 'Inicialización de departamentos y catálogo de cargos corporativos.',
            'ip_origen' => '127.0.0.1',
            'created_at' => now()->subDays(20),
        ]);

        BitacoraAuditoria::create([
            'usuario_id' => $supervisor->id,
            'modulo' => 'actividades',
            'accion' => 'aprobacion',
            'descripcion' => 'Aprobación oficial al 100% de la actividad ID #' . $act1->id . ' asignada a Daniel Navarro.',
            'ip_origen' => '127.0.0.1',
            'created_at' => now()->subDays(3),
        ]);

        BitacoraAuditoria::create([
            'usuario_id' => $supervisor->id,
            'modulo' => 'evaluaciones',
            'accion' => 'creacion',
            'descripcion' => 'Cierre y registro de evaluación formal para Daniel Navarro (Calificación: 94).',
            'ip_origen' => '127.0.0.1',
            'created_at' => now()->subDays(1),
        ]);

        // 11. Notificaciones
        Notificacion::create([
            'usuario_id' => $colaborador1->id,
            'titulo' => 'Actividad Aprobada',
            'mensaje' => 'El supervisor Mateo Silva ha aprobado tu actividad "' . $act1->titulo . '".',
            'tipo' => 'aprobacion',
            'actividad_id' => $act1->id,
            'leida' => true,
        ]);

        Notificacion::create([
            'usuario_id' => $supervisor->id,
            'titulo' => 'Solicitud de Revisión',
            'mensaje' => 'Andrés Salazar ha solicitado la revisión de "' . $act2->titulo . '".',
            'tipo' => 'revision_solicitada',
            'actividad_id' => $act2->id,
            'leida' => false,
        ]);

        Notificacion::create([
            'usuario_id' => $admin->id,
            'titulo' => 'Actividad pendiente de revisión',
            'mensaje' => 'Andrés Salazar espera la validación de "' . $act2->titulo . '".',
            'tipo' => 'revision_solicitada',
            'actividad_id' => $act2->id,
            'leida' => false,
        ]);

        Notificacion::create([
            'usuario_id' => $admin->id,
            'titulo' => 'Actividad con retraso',
            'mensaje' => 'La actividad "' . $act3->titulo . '" superó su fecha límite en el proyecto "' . $proyecto1->nombre . '".',
            'tipo' => 'actividad_retrasada',
            'actividad_id' => $act3->id,
            'leida' => false,
        ]);

        Notificacion::create([
            'usuario_id' => $practicante->id,
            'titulo' => 'Actividad Observada',
            'mensaje' => 'El supervisor ha emitido requerimientos de corrección para "' . $act3->titulo . '".',
            'tipo' => 'observacion',
            'actividad_id' => $act3->id,
            'leida' => false,
        ]);
    }
}
