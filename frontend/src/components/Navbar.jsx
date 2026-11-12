import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Bell,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Info,
  ClipboardCheck,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notificaciones');
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.leida && !n.is_read).length);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notificaciones/read-all');
      setNotifications(notifications.map((n) => ({ ...n, leida: true, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'revision_solicitada':
        return { Icon: ClipboardCheck, color: 'text-amber-600 dark:text-amber-400' };
      case 'actividad_retrasada':
      case 'observacion':
        return { Icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400' };
      case 'aprobacion':
        return { Icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' };
      default:
        return { Icon: Info, color: 'text-indigo-600 dark:text-indigo-400' };
    }
  };

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'administrador':
      case 'admin':
        return (
          <span className="bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
            Administrador
          </span>
        );
      case 'supervisor':
        return (
          <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
            Supervisor
          </span>
        );
      case 'colaborador':
      case 'worker':
        return (
          <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
            Colaborador
          </span>
        );
      case 'practicante':
      case 'intern':
        return (
          <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
            Practicante
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo y Nombre del Sistema */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/25">
            SG
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                SIGEP
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                <Sparkles className="w-3 h-3" /> v2.0 Tech
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Sistema de Gestión y Evaluación de Personal
            </p>
          </div>
        </div>

        {/* Acciones del Navbar */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Botón Modo Oscuro / Modo Claro */}
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center justify-center"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Menú de Notificaciones */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50">
                <div className="flex items-center justify-between gap-3 px-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Notificaciones ({unreadCount})
                    </p>
                    <p className="mt-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      SIGEP · Sistema de Gestión y Evaluación de Personal
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Marcar leídas
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
                      No tienes notificaciones
                    </p>
                  ) : (
                    notifications.map((n) => {
                      const isRead = n.leida || n.is_read;
                      const { Icon, color } = getNotificationIcon(n.tipo || n.type);
                      return (
                        <div
                          key={n.id}
                          className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                            !isRead ? 'bg-indigo-50/50 dark:bg-indigo-950/40 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${color}`} />
                            <div className="flex-1">
                              <p className="font-bold text-slate-800 dark:text-slate-200">
                                {n.titulo || n.title}
                              </p>
                              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                                {n.mensaje || n.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Información del Usuario */}
          <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-xs shadow-xs">
              {(user?.nombre || user?.name || '?').charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                  {user?.nombre || user?.name}
                </span>
                {getRoleBadge(user?.rol || user?.role)}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[160px]">
                {user?.cargo || user?.position || 'Sin cargo asignado'}
              </p>
            </div>
            <button
              onClick={logout}
              title="Cerrar Sesión"
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
