import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Award, Plus, CheckCircle2, AlertCircle, Clock, Star, Calculator, ShieldCheck } from 'lucide-react';

export default function Evaluaciones() {
  const { user } = useAuth();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [criterios, setCriterios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Formulario
  const [form, setForm] = useState({
    usuario_id: '',
    periodo: `Evaluación de ${new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}`,
    total_actividades: 0,
    actividades_completadas: 0,
    actividades_aprobadas: 0,
    actividades_observadas: 0,
    actividades_retrasadas: 0,
    promedio_avance: 0,
    tasa_cumplimiento: 0,
    observacion_supervisor: '',
    puntaje: 85,
    criterios: {},
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resEv, resUsers] = await Promise.all([
        api.get('/evaluaciones'),
        api.get('/users'),
      ]);
      setEvaluaciones(resEv.data || []);
      const workers = (resUsers.data || []).filter(
        (u) =>
          u.rol === 'colaborador' ||
          u.role === 'worker' ||
          u.rol === 'practicante' ||
          u.role === 'intern'
      );
      setPersonal(workers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calcular métricas automáticamente
  const handleAutoCalculate = async () => {
    if (!form.usuario_id) return alert('Por favor selecciona un colaborador primero');
    try {
      setCalculating(true);
      const res = await api.get('/evaluaciones/calculate-metrics', {
        params: { usuario_id: form.usuario_id },
      });
      const data = res.data;
      setForm((prev) => ({
        ...prev,
        total_actividades: data.total_actividades,
        actividades_completadas: data.actividades_completadas,
        actividades_aprobadas: data.actividades_aprobadas,
        actividades_observadas: data.actividades_observadas,
        actividades_retrasadas: data.actividades_retrasadas,
        promedio_avance: data.promedio_avance,
        tasa_cumplimiento: data.tasa_cumplimiento,
        puntaje: Math.round(data.tasa_cumplimiento * 0.95),
      }));
    } catch (err) {
      alert('Error al calcular métricas: ' + (err.response?.data?.message || err.message));
    } finally {
      setCalculating(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/evaluaciones', form);
      setShowModal(false);
      setForm({
        usuario_id: '',
        periodo: `Evaluación de ${new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}`,
        total_actividades: 0,
        actividades_completadas: 0,
        actividades_aprobadas: 0,
        actividades_observadas: 0,
        actividades_retrasadas: 0,
        promedio_avance: 0,
        tasa_cumplimiento: 0,
        observacion_supervisor: '',
        puntaje: 85,
        criterios: {},
      });
      fetchData();
    } catch (err) {
      alert('Error al guardar evaluación: ' + (err.response?.data?.message || err.message));
    }
  };

  const isSupervisorOrAdmin =
    user?.rol === 'administrador' ||
    user?.role === 'admin' ||
    user?.rol === 'supervisor' ||
    user?.role === 'supervisor';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              Evaluación & Desempeño
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Evaluación del Desempeño
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Evaluación objetiva basada en historial de actividades, cumplimiento e indicadores cuantitativos
          </p>
        </div>

        {isSupervisorOrAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Nueva Evaluación
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : evaluaciones.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
          <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No hay evaluaciones registradas todavía.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {evaluaciones.map((ev) => {
            const nombreUsuario = ev.usuario?.nombre || ev.usuario?.name || 'Personal';
            const cargo = ev.usuario?.cargo?.nombre || ev.usuario?.cargo || ev.usuario?.position || ev.usuario?.rol;
            const supervisorNombre = ev.supervisor?.nombre || ev.supervisor?.name || 'Supervisor';
            const cumplimiento = ev.tasa_cumplimiento ?? ev.compliance_rate ?? 0;
            const puntaje = ev.puntaje ?? ev.score;
            const periodo = ev.periodo || ev.period;
            const observacion = ev.observacion_supervisor || ev.supervisor_observation;

            return (
              <div
                key={ev.id}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 px-2.5 py-0.5 rounded-full">
                      {periodo}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1.5">{nombreUsuario}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      Cargo: <b className="text-slate-700 dark:text-slate-300">{cargo}</b> • Evaluador: <b className="text-slate-700 dark:text-slate-300">{supervisorNombre}</b>
                    </p>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Cumplimiento</span>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{cumplimiento}%</p>
                    </div>
                    {puntaje && (
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase">Puntos</span>
                        <span className="text-base font-black text-indigo-700 dark:text-indigo-300 leading-none">{puntaje}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Indicadores Cuantitativos */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">Asignadas</p>
                    <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{ev.total_actividades ?? ev.total_activities}</p>
                  </div>
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                    <p className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase">Aprobadas</p>
                    <p className="text-base font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{ev.actividades_aprobadas ?? ev.approved_activities}</p>
                  </div>
                  <div className="bg-rose-50/60 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-200/60 dark:border-rose-800/40">
                    <p className="text-rose-700 dark:text-rose-400 text-[10px] font-bold uppercase">Observadas</p>
                    <p className="text-base font-black text-rose-700 dark:text-rose-300 mt-0.5">{ev.actividades_observadas ?? ev.observed_activities}</p>
                  </div>
                  <div className="bg-amber-50/60 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                    <p className="text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase">Retrasadas</p>
                    <p className="text-base font-black text-amber-700 dark:text-amber-300 mt-0.5">{ev.actividades_retrasadas ?? ev.delayed_activities}</p>
                  </div>
                  <div className="bg-indigo-50/60 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 col-span-2">
                    <p className="text-indigo-700 dark:text-indigo-400 text-[10px] font-bold uppercase">Avance Promedio</p>
                    <p className="text-base font-black text-indigo-700 dark:text-indigo-300 mt-0.5">{ev.promedio_avance ?? ev.average_progress}%</p>
                  </div>
                </div>

                {/* Detalle por Criterios / Rúbricas si existen */}
                {ev.detalles && ev.detalles.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Rúbrica de Competencias Evaluadas:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {ev.detalles.map((det) => (
                        <div key={det.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{det.criterio?.nombre || 'Criterio'}</span>
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{det.calificacion}/5</span>
                            </div>
                          </div>
                          {det.comentario && <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">{det.comentario}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observación Cualitativa del Supervisor */}
                <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Observación del Supervisor:</p>
                  <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">
                    "{observacion || 'Sin observaciones adicionales.'}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nueva Evaluación */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Realizar Evaluación de Desempeño</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Calcula automáticamente los indicadores a partir del historial real de trabajo y añade tu retroalimentación.
            </p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Personal a Evaluar *</label>
                  <select
                    required
                    value={form.usuario_id}
                    onChange={(e) => setForm({ ...form, usuario_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none font-bold"
                  >
                    <option value="">Selecciona Personal</option>
                    {personal.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre || p.name} ({p.rol || p.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Periodo *</label>
                  <input
                    type="text"
                    required
                    value={form.periodo}
                    onChange={(e) => setForm({ ...form, periodo: e.target.value })}
                    placeholder="Ej: Evaluación de Octubre 2026"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Botón de Autocálculo */}
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-indigo-900 dark:text-indigo-200">Cálculo Automático por Historial</p>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400">Calcula actividades asignadas, aprobadas, observadas y avance promedio.</p>
                </div>
                <button
                  type="button"
                  disabled={calculating || !form.usuario_id}
                  onClick={handleAutoCalculate}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>{calculating ? 'Calculando...' : 'Calcular'}</span>
                </button>
              </div>

              {/* Indicadores calculados */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Asignadas</label>
                  <input
                    type="number"
                    value={form.total_actividades}
                    onChange={(e) => setForm({ ...form, total_actividades: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">Aprobadas</label>
                  <input
                    type="number"
                    value={form.actividades_aprobadas}
                    onChange={(e) => setForm({ ...form, actividades_aprobadas: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-center font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">Observadas</label>
                  <input
                    type="number"
                    value={form.actividades_observadas}
                    onChange={(e) => setForm({ ...form, actividades_observadas: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-center font-bold text-rose-600 dark:text-rose-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">Retrasadas</label>
                  <input
                    type="number"
                    value={form.actividades_retrasadas}
                    onChange={(e) => setForm({ ...form, actividades_retrasadas: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-center font-bold text-amber-600 dark:text-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">% Cumplimiento</label>
                  <input
                    type="number"
                    value={form.tasa_cumplimiento}
                    onChange={(e) => setForm({ ...form, tasa_cumplimiento: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">Calificación (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.puntaje}
                    onChange={(e) => setForm({ ...form, puntaje: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none text-center font-bold text-indigo-600 dark:text-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Observación del Supervisor (Cualitativa) *</label>
                <textarea
                  required
                  rows={3}
                  value={form.observacion_supervisor}
                  onChange={(e) => setForm({ ...form, observacion_supervisor: e.target.value })}
                  placeholder="Ej: Presentó un buen cumplimiento de las actividades asignadas y atendió oportunamente las observaciones realizadas..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Finalizar Evaluación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
