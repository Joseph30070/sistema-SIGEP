# Sistema Web para la Gestión, Seguimiento y Evaluación del Personal

## Ubicación del Proyecto
El proyecto ha sido creado en tu disco **D:** dentro del directorio:
```text
D:\sistema-gestion-personal\
├── backend/               # API REST con Laravel 11/12 (PHP 8.5) y MySQL
├── frontend/              # Aplicación Web SPA con React + Vite + Tailwind CSS
├── iniciar-proyecto.bat   # Script para iniciar backend y frontend juntos
└── README.md              # Documentación del sistema
```

---

## Cómo Iniciar el Sistema

### Opción 1: Con un solo clic
Haz doble clic sobre el archivo:
```text
D:\sistema-gestion-personal\iniciar-proyecto.bat
```
Este script levantará automáticamente:
* **Backend:** `http://localhost:8000/api`
* **Frontend:** `http://localhost:5173`

### Opción 2: Desde terminales manuales
* **Terminal 1 (Backend):**
  ```bash
  cd D:\sistema-gestion-personal\backend
  php artisan serve --port=8000
  ```
* **Terminal 2 (Frontend):**
  ```bash
  cd D:\sistema-gestion-personal\frontend
  npm run dev
  ```

---

## Cuentas de Acceso (Credenciales)

La base de datos MySQL `sistema_gestion_personal` ya cuenta con los datos iniciales y usuarios precargados según la especificación:

| Rol | Nombre | Correo Electrónico | Contraseña |
| :--- | :--- | :--- | :--- |
| **Administrador** | Alejandro Ramos | `admin@empresa.com` | `123456` |
| **Supervisor** | Mateo Silva | `supervisor@empresa.com` | `123456` |
| **Colaborador** | Daniel Navarro | `daniel@empresa.com` | `123456` |
| **Colaborador** | Andrés Salazar | `andres@empresa.com` | `123456` |
| **Practicante** | Rodrigo Flores | `rodrigo@empresa.com` | `123456` |

> *Nota: En la pantalla de inicio de sesión (`/login`) cuentas con botones de **Acceso Rápido** para ingresar como cualquiera de los 4 roles con un solo clic.*

---

## Flujo Implementado según los 28 Puntos

1. **Jerarquía**: Personal ➔ Equipos ➔ Proyectos ➔ Actividades ➔ Avances ➔ Revisión ➔ Historial ➔ Evaluación ➔ Reportes.
2. **Historial Inmutable de Avances**: Cada avance registrado por un colaborador o practicante guarda fecha, hora, autor y descripción sin sobreescribir el historial previo.
3. **Flujo de Revisión**:
   * **Terminada ➔ En Revisión**: El colaborador envía a revisión y el supervisor es notificado.
   * **Aprobación**: El supervisor aprueba, asigna el 100% oficial y deja constancia en el historial.
   * **Observación**: El supervisor define los requerimientos a corregir y porcentaje temporal. El estado pasa a `Observada` para subsanación.
4. **Evaluación Objetiva**: Módulo de evaluación con botón de cálculo automático de indicadores a partir del historial real de actividades y cumplimiento de plazos.
5. **Reportes**: Consolidado por equipo y reportes individuales de personal.

---

## Cómo abrir el proyecto en este IDE
Para activar todas las vistas de código, carpetas y terminales dentro de Antigravity IDE:
1. Menú superior: **File** (Archivo) ➔ **Open Folder...** (Abrir carpeta).
2. Selecciona la carpeta:
   ```text
   D:\sistema-gestion-personal
   ```
