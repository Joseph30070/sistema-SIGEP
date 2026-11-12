import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart3,
  Users,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  Layers,
} from 'lucide-react';

export default function Reportes() {
  const [equipos, setEquipos] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [selectedEquipoId, setSelectedEquipoId] = useState('');
  const [selectedPersonalId, setSelectedPersonalId] = useState('');
  const [reporteEquipo, setReporteEquipo] = useState(null);
  const [reportePersonal, setReportePersonal] = useState(null);
  const [loadingEquipo, setLoadingEquipo] = useState(false);
  const [loadingPersonal, setLoadingPersonal] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/equipos'), api.get('/users')])
      .then(([resEq, resUsers]) => {
        const eqData = resEq.data || [];
        setEquipos(eqData);
        if (eqData.length > 0) {
          setSelectedEquipoId(eqData[0].id);
        }
        const uData = resUsers.data || [];
        const workers = uData.filter((u) =>
          (u.rol === 'colaborador' || u.role === 'worker') ||
          (u.rol === 'practicante' || u.role === 'intern') ||
          (u.rol === 'supervisor' || u.role === 'supervisor')
        );
        setPersonal(workers);
        if (workers.length > 0) {
          setSelectedPersonalId(workers[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Cargar reporte de equipo
  useEffect(() => {
    if (selectedEquipoId) {
      setLoadingEquipo(true);
      api.get(`/reportes/equipo/${selectedEquipoId}`)
        .then((res) => setReporteEquipo(res.data))
        .catch((err) => {
          console.error(err);
          setReporteEquipo(null);
        })
        .finally(() => setLoadingEquipo(false));
    }
  }, [selectedEquipoId]);

  // Cargar reporte de personal individual
  useEffect(() => {
    if (selectedPersonalId) {
      setLoadingPersonal(true);
      api.get(`/reportes/personal/${selectedPersonalId}`)
        .then((res) => setReportePersonal(res.data))
        .catch((err) => {
          console.error(err);
          setReportePersonal(null);
        })
        .finally(() => setLoadingPersonal(false));
    }
  }, [selectedPersonalId]);

  return (
    <div className="space-y-8">
      {/* Encabezado Principal */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
            Analytics & BI
          </span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Reportes & Estadísticas
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
          Consolidado para la toma de decisiones, métricas de rendimiento y seguimiento del ciclo operativo
        </p>
      </div>

      {/* REPORTE 1: POR EQUIPO DE TRABAJO */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-200/60 dark:border-indigo-800 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Reporte Consolidado por Equipo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Indicadores globales y desglose de productividad por integrante
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300">Equipo:</label>
            <select
              value={selectedEquipoId}
              onChange={(e) => setSelectedEquipoId(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20"
            >
              {equipos.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {loadingEquipo ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reporteEquipo ? (
          <div className="space-y-6">
            {/* Tarjetas Resumen */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actividades</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{reporteEquipo.total_actividades ?? 0}</p>
              </div>
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Completadas</p>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{reporteEquipo.completadas ?? 0}</p>
              </div>
              <div className="bg-rose-50/60 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-200/60 dark:border-rose-800/40">
                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Observadas</p>
                <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{reporteEquipo.observadas ?? 0}</p>
              </div>
              <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-800/40">
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Retrasadas</p>
                <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">{reporteEquipo.retrasadas ?? 0}</p>
              </div>
              <div className="bg-indigo-50/60 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40">
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Cumplimiento</p>
                <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-1">{reporteEquipo.cumplimiento_general ?? 0}%</p>
              </div>
            </div>

            {/* Tabla Detalle Integrantes */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">Integrante</th>
                    <th className="py-3 px-4">Rol / Puesto</th>
                    <th className="py-3 px-4 text-center">Asignadas</th>
                    <th className="py-3 px-4 text-center">Aprobadas</th>
                    <th className="py-3 px-4 text-center">Observadas</th>
                    <th className="py-3 px-4 text-center">Retrasadas</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">Cumplimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {reporteEquipo.miembros?.map((m, idx) => {
                    const memberUser = m.usuario || m.user || {};
                    return (
                      <tr key={memberUser.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {memberUser.nombre || memberUser.name || 'Sin asignar'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                          {memberUser.cargo || memberUser.position || memberUser.role || memberUser.rol || 'Colaborador'}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-bold">{m.total ?? 0}</td>
                        <td className="py-3 px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">{m.completadas ?? 0}</td>
                        <td className="py-3 px-4 text-center text-rose-500 dark:text-rose-400 font-bold">{m.observadas ?? 0}</td>
                        <td className="py-3 px-4 text-center text-amber-600 dark:text-amber-400 font-bold">{m.retrasadas ?? 0}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                                style={{ width: `${Math.min(100, m.cumplimiento || 0)}%` }}
                              ></div>
                            </div>
                            <span className="font-black text-indigo-600 dark:text-indigo-400">{m.cumplimiento ?? 0}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center font-medium">
            No hay información disponible para este equipo.
          </p>
        )}
      </div>

      {/* REPORTE 2: INDIVIDUAL DE PERSONAL */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold border border-purple-200/60 dark:border-purple-800 shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Reporte Individual del Personal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Historial completo, promedio de avance y evaluaciones recibidas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300">Personal:</label>
            <select
              value={selectedPersonalId}
              onChange={(e) => setSelectedPersonalId(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20"
            >
              {personal.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.cargo?.nombre || p.position || p.role || p.rol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingPersonal ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reportePersonal ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Actividades</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{reportePersonal.resumen?.total_actividades ?? 0}</p>
              </div>
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Aprobadas</p>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{reportePersonal.resumen?.aprobadas ?? 0}</p>
              </div>
              <div className="bg-rose-50/60 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-200/60 dark:border-rose-800/40">
                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Observadas</p>
                <p className="text-xl font-black text-rose-700 dark:text-rose-300 mt-1">{reportePersonal.resumen?.observadas ?? 0}</p>
              </div>
              <div className="bg-indigo-50/60 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40">
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Avance Promedio</p>
                <p className="text-xl font-black text-indigo-700 dark:text-indigo-300 mt-1">{reportePersonal.resumen?.avance_promedio ?? 0}%</p>
              </div>
            </div>

            {/* Evaluaciones recibidas */}
            {reportePersonal.evaluaciones && reportePersonal.evaluaciones.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Evaluaciones Oficiales Registradas:
                </p>
                <div className="space-y-2">
                  {reportePersonal.evaluaciones.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-black text-slate-900 dark:text-white">{ev.periodo || ev.period}</span>
                        {(ev.observacion_supervisor || ev.supervisor_observation) && (
                          <p className="text-slate-500 dark:text-slate-400 italic mt-0.5">
                            "{ev.observacion_supervisor || ev.supervisor_observation}"
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 rounded-xl self-start sm:self-auto">
                        Cumplimiento: {ev.tasa_cumplimiento ?? ev.compliance_rate ?? ev.puntaje ?? 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center font-medium">
            Selecciona un colaborador para consultar sus métricas individuales.
          </p>
        )}
      </div>
    </div>
  );
}
