import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ArrowLeft,
  Calendar,
  User,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Send,
  PlusCircle,
  History,
  Sparkles,
} from 'lucide-react';

export default function ActividadDetalle() {
  const { id } = useParams();
  const { user } = useAuth();
  const [actividad, setActividad] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modales
  const [showAvanceModal, setShowAvanceModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showAprobarModal, setShowAprobarModal] = useState(false);
  const [showObservarModal, setShowObservarModal] = useState(false);

  // Forms
  const [avanceDesc, setAvanceDesc] = useState('');
  const [avancePercentage, setAvancePercentage] = useState('');
  const [revisionComment, setRevisionComment] = useState('');
  const [aprobarComment, setAprobarComment] = useState('Actividad revisada y aprobada. Trabajo conforme.');
  const [observarComment, setObservarComment] = useState('');
  const [observarRequirements, setObservarRequirements] = useState('');
  const [observarPercentage, setObservarPercentage] = useState('');

  const fetchActividad = async () => {
    try {
      const res = await api.get(`/actividades/${id}`);
      setActividad(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActividad();
  }, [id]);

  if (loading || !actividad) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isSupervisorOrAdmin = (user?.rol === 'administrador' || user?.role === 'admin') || (user?.rol === 'supervisor' || user?.role === 'supervisor') || user?.id === actividad.supervisor_id;
  const isAssignee = user?.id === actividad.assigned_to;

  // Registrar Avance
  const handleGuardarAvance = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/actividades/${id}/avances`, {
        description: avanceDesc,
        reported_percentage: avancePercentage ? parseInt(avancePercentage) : null,
      });
      setAvanceDesc('');
      setAvancePercentage('');
      setShowAvanceModal(false);
      fetchActividad();
    } catch (err) {
      alert('Error al registrar avance: ' + (err.response?.data?.message || err.message));
    }
  };

  // Enviar a Revisión
  const handleSolicitarRevision = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/actividades/${id}/solicitar-revision`, {
        comment: revisionComment,
      });
      setRevisionComment('');
      setShowRevisionModal(false);
      fetchActividad();
    } catch (err) {
      alert('Error al solicitar revisión: ' + (err.response?.data?.message || err.message));
    }
  };

  // Aprobar Actividad
  const handleAprobar = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/actividades/${id}/aprobar`, {
        comment: aprobarComment,
        assigned_percentage: 100,
      });
      setShowAprobarModal(false);
      fetchActividad();
    } catch (err) {
      alert('Error al aprobar: ' + (err.response?.data?.message || err.message));
    }
  };

  // Observar Actividad
  const handleObservar = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/actividades/${id}/observar`, {
        comment: observarComment,
        correction_requirements: observarRequirements,
        assigned_percentage: observarPercentage ? parseInt(observarPercentage) : actividad.progress_percentage,
      });
      setObservarComment('');
      setObservarRequirements('');
      setShowObservarModal(false);
      fetchActividad();
    } catch (err) {
      alert('Error al observar actividad: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pendiente: { bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700', label: 'Pendiente' },
      en_proceso: { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800', label: 'En Proceso' },
      terminada: { bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', label: 'Terminada' },
      en_revision: { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800', label: 'En Revisión' },
      observada: { bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800', label: 'Observada' },
      aprobada: { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', label: 'Aprobada' },
    };
    const s = map[status] || { bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700', label: status };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${s.bg}`}>{s.label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      <Link to="/actividades" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition">
        <ArrowLeft className="w-4 h-4" />
        Volver a la lista de actividades
      </Link>

      {/* Encabezado Principal */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              {getStatusBadge(actividad.status)}
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                Prioridad: <b className="capitalize text-slate-700 dark:text-slate-300">{actividad.priority}</b>
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                Proyecto: <b className="text-indigo-600 dark:text-indigo-400">{actividad.proyecto?.nombre}</b>
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">{actividad.title}</h2>
          </div>

          {/* Barra de Progreso Oficial */}
          <div className="lg:text-right bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 min-w-[220px]">
            <div className="flex items-center justify-between gap-4 mb-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Avance Oficial</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{actividad.progress_percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  actividad.status === 'aprobada' ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-cyan-500'
                }`}
                style={{ width: `${actividad.progress_percentage}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Determinado por el supervisor</p>
          </div>
        </div>

        {/* Metadatos (Responsable, Supervisor, Fechas) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-200/60 dark:border-indigo-800/60">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500">Responsable asignado</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">{actividad.responsable?.nombre}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold border border-purple-200/60 dark:border-purple-800/60">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500">Supervisor a cargo</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">{actividad.supervisor?.nombre}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-200/60 dark:border-amber-800/60">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500">Fecha Límite</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">{actividad.due_date || 'Sin fecha'}</p>
            </div>
          </div>
        </div>

        {/* Barra de Acciones del Flujo */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
          {(isAssignee || isSupervisorOrAdmin) && actividad.status !== 'aprobada' && (
            <button
              onClick={() => setShowAvanceModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              Registrar Avance
            </button>
          )}

          {isAssignee && ['en_proceso', 'observada', 'pendiente'].includes(actividad.status) && (
            <button
              onClick={() => setShowRevisionModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition"
            >
              <Send className="w-4 h-4" />
              Enviar a Revisión
            </button>
          )}

          {isSupervisorOrAdmin && actividad.status === 'en_revision' && (
            <>
              <button
                onClick={() => setShowAprobarModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aprobar Actividad (100%)
              </button>
              <button
                onClick={() => setShowObservarModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition"
              >
                <AlertCircle className="w-4 h-4" />
                Observar / Solicitar Corrección
              </button>
            </>
          )}
        </div>
      </div>

      {/* Descripción y Especificación de la Tarea */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Descripción del Problema o Necesidad
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {actividad.problem_statement || actividad.description || 'Sin descripción detallada.'}
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Qué se debe realizar
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {actividad.work_to_do || 'Especificación de tareas pendientes de completar.'}
          </p>
        </div>
      </div>

      {/* SECCIÓN 1: HISTORIAL INMUTABLE DE AVANCES */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Historial Inmutable de Avances Registrados
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Cada avance conserva fecha, autor y detalle. Ningún registro se sobreescribe.
            </p>
          </div>
        </div>

        {actividad.avances?.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">Aún no se han registrado avances en esta actividad.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Fecha</th>
                  <th className="py-3 px-4">Autor</th>
                  <th className="py-3 px-4">Avance / Qué realizó</th>
                  <th className="py-3 px-4 text-center">Avance Reportado</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Evidencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {actividad.avances.map((av) => (
                  <tr key={av.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(av.created_at).toLocaleDateString()} {new Date(av.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{av.usuario?.nombre}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 leading-relaxed">{av.description}</td>
                    <td className="py-3 px-4 text-center">
                      {av.reported_percentage ? (
                        <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 font-bold rounded-lg">
                          {av.reported_percentage}%
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {av.evidence_file ? (
                        <span className="text-indigo-600 dark:text-indigo-400 underline text-[11px] font-semibold cursor-pointer">
                          Ver archivo
                        </span>
                      ) : (
                        <span className="text-slate-400">Sin archivo</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: HISTORIAL DE REVISIONES Y AUDITORÍA */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Historial de Revisiones y Auditoría
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
          Bitácora completa del flujo de revisión: Solicitudes, Observaciones del Supervisor, Correcciones y Aprobación final.
        </p>

        {actividad.revisiones?.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No hay revisiones u observaciones registradas hasta el momento.</p>
        ) : (
          <div className="space-y-4">
            {actividad.revisiones.map((rev) => {
              const isAprobacion = rev.action === 'aprobacion';
              const isObservacion = rev.action === 'observacion';
              const isSolicitud = rev.action === 'solicitud_revision';

              return (
                <div
                  key={rev.id}
                  className={`p-4 rounded-2xl border text-xs ${
                    isAprobacion ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' :
                    isObservacion ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60' :
                    isSolicitud ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60' :
                    'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isAprobacion ? 'bg-emerald-600 text-white' :
                        isObservacion ? 'bg-rose-600 text-white' :
                        isSolicitud ? 'bg-amber-600 text-white' :
                        'bg-slate-600 text-white'
                      }`}>
                        {rev.action.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{rev.usuario?.nombre}</span>
                      <span className="text-slate-400 dark:text-slate-500">({rev.usuario?.role || rev.usuario?.rol})</span>
                    </div>
                    <span className="text-slate-400 dark:text-slate-500">
                      {new Date(rev.created_at).toLocaleDateString()} {new Date(rev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {rev.comment && (
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium mt-1">
                      {rev.comment}
                    </p>
                  )}

                  {rev.correction_requirements && (
                    <div className="mt-2 p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
                      <p className="font-bold text-[11px] uppercase tracking-wider mb-1">Requerimientos a corregir:</p>
                      <p className="leading-relaxed">{rev.correction_requirements}</p>
                    </div>
                  )}

                  {rev.assigned_percentage && (
                    <div className="mt-2 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                      Porcentaje oficial asignado en esta revisión: <b className="text-slate-800 dark:text-slate-200">{rev.assigned_percentage}%</b>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: REGISTRAR AVANCE */}
      {showAvanceModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Registrar Avance de Trabajo</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Describe claramente lo realizado. Quedará archivado en el historial inmutable.
            </p>
            <form onSubmit={handleGuardarAvance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">Qué trabajo realizaste *</label>
                <textarea
                  required
                  rows={4}
                  value={avanceDesc}
                  onChange={(e) => setAvanceDesc(e.target.value)}
                  placeholder="Ej: Se creó la estructura inicial y modelos de base de datos..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">Porcentaje estimado (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={avancePercentage}
                  onChange={(e) => setAvancePercentage(e.target.value)}
                  placeholder="Ej: 50"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Nota: El porcentaje oficial será confirmado por el supervisor en la revisión.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAvanceModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Guardar Avance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ENVIAR A REVISIÓN */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Solicitar Revisión al Supervisor</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              La actividad cambiará al estado "En revisión" y tu supervisor recibirá una notificación.
            </p>
            <form onSubmit={handleSolicitarRevision} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">Comentario para el supervisor</label>
                <textarea
                  rows={3}
                  value={revisionComment}
                  onChange={(e) => setRevisionComment(e.target.value)}
                  placeholder="He completado los requerimientos solicitados y realizado las pruebas..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Enviar a Revisión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APROBAR ACTIVIDAD */}
      {showAprobarModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Aprobar Actividad</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              La actividad pasará a estado "Aprobada", se fijará al 100% de avance y quedará cerrada con tu visto bueno.
            </p>
            <form onSubmit={handleAprobar} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">Comentario / Visto Bueno *</label>
                <textarea
                  required
                  rows={3}
                  value={aprobarComment}
                  onChange={(e) => setAprobarComment(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAprobarModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Dar Visto Bueno y Aprobar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: OBSERVAR ACTIVIDAD */}
      {showObservarModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Observar Actividad</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Indica qué falló o qué falta completar para que el colaborador subsane y vuelva a enviar a revisión.
            </p>
            <form onSubmit={handleObservar} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">Motivo de la Observación *</label>
                <textarea
                  required
                  rows={2}
                  value={observarComment}
                  onChange={(e) => setObservarComment(e.target.value)}
                  placeholder="Ej: El módulo funciona correctamente, pero falta completar la edición de usuarios."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">Requerimientos que deben corregirse *</label>
                <textarea
                  required
                  rows={3}
                  value={observarRequirements}
                  onChange={(e) => setObservarRequirements(e.target.value)}
                  placeholder="Ej: Se requiere corregir el formulario de registro y adjuntar evidencia de las pruebas realizadas."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">Porcentaje de Avance Oficial (%)</label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={observarPercentage}
                  onChange={(e) => setObservarPercentage(e.target.value)}
                  placeholder={`Actual: ${actividad.progress_percentage}%`}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowObservarModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Registrar Observación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
