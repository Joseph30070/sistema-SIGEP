import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Award,
  BarChart3,
  UserCheck,
  Building2,
  Target,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const rol = user?.rol || user?.role || 'colaborador';

  const links = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['administrador', 'admin', 'supervisor', 'colaborador', 'worker', 'practicante', 'intern'],
    },
    {
      to: '/actividades',
      label: 'Actividades',
      icon: CheckSquare,
      roles: ['administrador', 'admin', 'supervisor', 'colaborador', 'worker', 'practicante', 'intern'],
    },
    {
      to: '/proyectos',
      label: 'Proyectos',
      icon: Briefcase,
      roles: ['administrador', 'admin', 'supervisor', 'colaborador', 'worker', 'practicante', 'intern'],
    },
    {
      to: '/equipos',
      label: 'Equipos',
      icon: Users,
      roles: ['administrador', 'admin', 'supervisor'],
    },
    {
      to: '/personal',
      label: 'Personal & Roles',
      icon: UserCheck,
      roles: ['administrador', 'admin', 'supervisor'],
    },
    {
      to: '/estructura',
      label: 'Estructura & Cargos',
      icon: Building2,
      roles: ['administrador', 'admin', 'supervisor'],
    },
    {
      to: '/objetivos',
      label: 'Metas y Objetivos',
      icon: Target,
      roles: ['administrador', 'admin', 'supervisor', 'colaborador', 'worker', 'practicante', 'intern'],
    },
    {
      to: '/evaluaciones',
      label: 'Evaluaciones',
      icon: Award,
      roles: ['administrador', 'admin', 'supervisor', 'colaborador', 'worker', 'practicante', 'intern'],
    },
    {
      to: '/reportes',
      label: 'Reportes & Estadísticas',
      icon: BarChart3,
      roles: ['administrador', 'admin', 'supervisor'],
    },
    {
      to: '/bitacora',
      label: 'Bitácora de Auditoría',
      icon: ShieldCheck,
      roles: ['administrador', 'admin'],
    },
  ];

  const allowedLinks = links.filter((l) => l.roles.includes(rol));

  return (
    <aside className="w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between transition-colors duration-200">
      <div>
        <div className="mb-3 px-3 flex items-center justify-between">
          <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Menú Principal
          </p>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Sistema Activo" />
        </div>
        <nav className="space-y-1">
          {allowedLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Tarjeta de estado de ciclo de trabajo */}
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
          <Zap className="w-3.5 h-3.5" />
          <span>Flujo de Trabajo</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
          Equipos ➔ Proyectos ➔ Actividades ➔ Avances ➔ Revisión ➔ Rúbricas
        </p>
      </div>
    </aside>
  );
}
