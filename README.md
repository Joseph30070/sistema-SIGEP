# Sistema Web para la Gestión, Seguimiento y Evaluación del Personal

Sistema web integral para centralizar la información del personal, organizar equipos de trabajo, gestionar proyectos, dar seguimiento a actividades con historial inmutable de avances y revisiones, y evaluar el desempeño.

## Estructura del Proyecto

```text
D:\sistema-gestion-personal\
├── backend/          # API REST en Laravel 11 / 12 (PHP 8.5) + MySQL
├── frontend/         # SPA en React + Vite + Tailwind CSS + Lucide Icons
├── docs/             # Documentación de arquitectura, base de datos y flujos
└── README.md         # Guía de inicio rápido y configuración
```

## Arquitectura y Tecnologías
- **Frontend**: React (Vite), React Router, Axios, Tailwind CSS, Lucide React
- **Backend**: Laravel REST API, Autenticación JWT / Sanctum
- **Base de Datos**: MySQL 8.4 (`sistema_gestion_personal`)
- **Control de Versiones**: Git

## Roles del Sistema
1. **Administrador**: Control total del sistema, gestión de usuarios, roles, equipos, proyectos, personal, estadísticas y reportes globales.
2. **Supervisor**: Gestión de su equipo asignado, asignación de actividades, fechas límite, prioridades, revisión (Aprobación / Observación), seguimiento de indicadores y evaluaciones.
3. **Trabajador / Colaborador**: Visualización de proyectos y actividades asignadas, registro de avances con historial, adjuntar evidencias, corrección de observaciones y envío a revisión.
4. **Practicante**: Permisos similares al colaborador, orientado a sus actividades y supervisor asignado con registro de avances y notificaciones.

## Flujo Principal de una Actividad
```
Pendiente ──> En proceso ──> Terminada ──> En revisión ──> Aprobada
                               ▲                 │
                               └── Observada ◄───┘
```
- **Historial Inmutable**: Los avances y revisiones nunca se sobreescriben; se preserva cada registro (fecha, usuario, comentario, evidencia).
