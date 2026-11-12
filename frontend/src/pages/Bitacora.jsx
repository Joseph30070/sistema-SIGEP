import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, Filter, Eye, Clock, Terminal, Activity } from 'lucide-react';

export default function Bitacora() {
  const [logs, setLogs] = useState([]);
  const [moduloFilter, setModuloFilter] = useState('');
  const [accionFilter, setAccionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (moduloFilter) params.modulo = moduloFilter;
      if (accionFilter) params.accion = accionFilter;

      const res = await api.get('/bitacora', { params });
      setLogs(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [moduloFilter, accionFilter]);

  const getActionBadge = (accion) => {
    switch (accion) {
      case 'creacion':
        return <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-xs">Creación</span>;
      case 'actualizacion':
        return <span className="bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold px-2.5 py-0.5 rounded-full text-xs">Actualización</span>;
      case 'eliminacion':
      case 'desactivacion':
        return <span className="bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold px-2.5 py-0.5 rounded-full text-xs">Eliminación</span>;
      case 'aprobacion':
        return <span className="bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold px-2.5 py-0.5 rounded-full text-xs">Aprobación</span>;
      case 'observacion':
        return <span className="bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold px-2.5 py-0.5 rounded-full text-xs">Observación</span>;
      case 'login':
        return <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold px-2.5 py-0.5 rounded-full text-xs">Inicio Sesión</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold px-2.5 py-0.5 rounded-full text-xs">{accion}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              Seguridad & Auditoría
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Bitácora de Auditoría del Sistema
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Registro histórico inmutable de eventos, modificaciones y operaciones ejecutadas
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap gap-3 text-xs">
        <select
          value={moduloFilter}
          onChange={(e) => setModuloFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">Todos los Módulos</option>
          <option value="auth">Autenticación / Login</option>
          <option value="usuarios">Usuarios y Personal</option>
          <option value="actividades">Actividades y Flujo</option>
          <option value="evaluaciones">Evaluaciones</option>
          <option value="proyectos">Proyectos</option>
          <option value="equipos">Equipos de Trabajo</option>
          <option value="estructura">Estructura Organizacional</option>
          <option value="objetivos">Metas y Objetivos</option>
        </select>

        <select
          value={accionFilter}
          onChange={(e) => setAccionFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">Todas las Acciones</option>
          <option value="creacion">Creación</option>
          <option value="actualizacion">Actualización</option>
          <option value="eliminacion">Eliminación / Desactivación</option>
          <option value="aprobacion">Aprobación</option>
          <option value="observacion">Observación</option>
          <option value="login">Inicio de Sesión</option>
        </select>
      </div>

      {/* Tabla de Registros */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-slate-800 dark:text-slate-200 text-base">No hay registros de auditoría que coincidan</p>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Fecha y Hora</th>
                <th className="px-5 py-3.5">Usuario Responsable</th>
                <th className="px-5 py-3.5">Módulo</th>
                <th className="px-5 py-3.5">Acción</th>
                <th className="px-5 py-3.5">Descripción de la Operación</th>
                <th className="px-5 py-3.5">IP Origen</th>
                <th className="px-5 py-3.5 text-center">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-medium">
                    {new Date(log.created_at).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                    {log.usuario ? log.usuario.nombre : 'Sistema'}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap uppercase font-bold text-slate-500 dark:text-slate-400 text-[11px]">
                    {log.modulo}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">{getActionBadge(log.accion)}</td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium max-w-md truncate">
                    {log.descripcion}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                    {log.ip_origen || '127.0.0.1'}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {(log.datos_previos || log.datos_posteriores) ? (
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition"
                        title="Ver payload técnico"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Visor Payload JSON */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">Detalle Técnico del Evento</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                <p><b>Módulo:</b> {selectedLog.modulo}</p>
                <p><b>Acción:</b> {selectedLog.accion}</p>
                <p><b>Usuario:</b> {selectedLog.usuario?.nombre || 'Sistema'}</p>
                <p><b>IP Origen:</b> {selectedLog.ip_origen}</p>
              </div>

              {selectedLog.datos_previos && (
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Estado Previo (Antes):</h4>
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto text-[11px] font-mono">
                    {JSON.stringify(selectedLog.datos_previos, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.datos_posteriores && (
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Estado Posterior (Después):</h4>
                  <pre className="p-3 bg-slate-900 text-cyan-400 rounded-xl overflow-x-auto text-[11px] font-mono">
                    {JSON.stringify(selectedLog.datos_posteriores, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
