import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Target, Plus, TrendingUp, CheckCircle2, Clock, AlertTriangle, Edit3 } from 'lucide-react';

export default function Objetivos() {
  const { user } = useAuth();
  const [objetivos, setObjetivos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedObj, setSelectedObj] = useState(null);
  const [newProgress, setNewProgress] = useState('');

  // Form
  const [form, setForm] = useState({
    usuario_id: '',
    titulo: '',
    descripcion: '',
    meta_cuantitativa: '',
    progreso_actual: '0',
    unidad_medida: '%',
    fecha_limite: '',
    estado: 'en_progreso',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resObj, resUsers] = await Promise.all([
        api.get('/objetivos'),
        api.get('/users'),
      ]);
      setObjetivos(resObj.data || []);
      setUsuarios((resUsers.data || []).filter((u) => (u.rol || u.role) !== 'administrador' && (u.rol || u.role) !== 'admin'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/objetivos', form);
      setShowModal(false);
      setForm({
        usuario_id: '',
        titulo: '',
        descripcion: '',
        meta_cuantitativa: '',
        progreso_actual: '0',
        unidad_medida: '%',
        fecha_limite: '',
        estado: 'en_progreso',
      });
      fetchData();
    } catch (err) {
      alert('Error al crear objetivo: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!selectedObj) return;
    try {
      const val = parseFloat(newProgress);
      const meta = parseFloat(selectedObj.meta_cuantitativa);
      const nuevoEstado = val >= meta ? 'cumplido' : selectedObj.estado;

      await api.put(`/objetivos/${selectedObj.id}`, {
        progreso_actual: val,
        estado: nuevoEstado,
      });

      setShowProgressModal(false);
      setSelectedObj(null);
      fetchData();
    } catch (err) {
      alert('Error al actualizar avance: ' + (err.response?.data?.message || err.message));
    }
  };

  const openProgressModal = (obj) => {
    setSelectedObj(obj);
    setNewProgress(obj.progreso_actual.toString());
    setShowProgressModal(true);
  };

  const isSupervisorOrAdmin =
    user?.rol === 'administrador' || user?.role === 'admin' || user?.rol === 'supervisor';

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'cumplido':
        return <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Cumplido</span>;
      case 'en_progreso':
        return <span className="bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">En Progreso</span>;
      case 'no_cumplido':
        return <span className="bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold">No Cumplido</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs px-2.5 py-0.5 rounded-full font-bold">{estado}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              Desempeño & OKRs
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Metas y Objetivos (OKRs / KPIs)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Definición y monitoreo cuantitativo del rendimiento de colaboradores y practicantes
          </p>
        </div>

        {isSupervisorOrAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Nuevo Objetivo
          </button>
        )}
      </div>

      {/* Lista de Objetivos */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : objetivos.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-slate-800 dark:text-slate-200 text-base">No hay metas registradas aún</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Define metas cuantitativas para medir el impacto del personal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {objetivos.map((obj) => {
            const meta = parseFloat(obj.meta_cuantitativa) || 1;
            const actual = parseFloat(obj.progreso_actual) || 0;
            const porcentaje = Math.min(100, Math.round((actual / meta) * 100));

            return (
              <div
                key={obj.id}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                      {obj.usuario?.nombre || 'Colaborador'}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">{obj.titulo}</h3>
                  </div>
                  {getStatusBadge(obj.estado)}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{obj.descripcion || 'Sin descripción detallada'}</p>

                {/* Barra de progreso */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 dark:text-slate-500">Progreso:</span>
                    <span className="font-black text-slate-800 dark:text-slate-200">
                      {actual} / {meta} {obj.unidad_medida} ({porcentaje}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        porcentaje >= 100
                          ? 'bg-emerald-500'
                          : porcentaje >= 60
                          ? 'bg-gradient-to-r from-indigo-500 to-cyan-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>

                {/* Footer de tarjeta */}
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100/60 dark:border-slate-800/60">
                  <span>Plazo: {obj.fecha_limite ? new Date(obj.fecha_limite).toLocaleDateString() : 'Sin fecha'}</span>
                  <button
                    onClick={() => openProgressModal(obj)}
                    className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg font-bold flex items-center gap-1 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Actualizar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Registrar Objetivo */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Definir Nueva Meta u Objetivo</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Asigna una métrica cuantificable a un colaborador.</p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Colaborador / Practicante *</label>
                <select
                  required
                  value={form.usuario_id}
                  onChange={(e) => setForm({ ...form, usuario_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Selecciona al personal</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre || u.name} ({u.cargo?.nombre || u.cargo || u.rol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Título de la Meta *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Reducir tiempo de resolución de bugs críticos"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Meta Numérica *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="100"
                    value={form.meta_cuantitativa}
                    onChange={(e) => setForm({ ...form, meta_cuantitativa: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Progreso Inicial</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.progreso_actual}
                    onChange={(e) => setForm({ ...form, progreso_actual: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Unidad *</label>
                  <select
                    value={form.unidad_medida}
                    onChange={(e) => setForm({ ...form, unidad_medida: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none"
                  >
                    <option value="%">% Porcentaje</option>
                    <option value="tareas">Tareas</option>
                    <option value="horas">Horas</option>
                    <option value="puntos">Puntos</option>
                    <option value="componentes">Componentes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Fecha Límite</label>
                <input
                  type="date"
                  value={form.fecha_limite}
                  onChange={(e) => setForm({ ...form, fecha_limite: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Descripción y Criterio de Éxito</label>
                <textarea
                  rows="3"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
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
                  Guardar Objetivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Actualizar Progreso */}
      {showProgressModal && selectedObj && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">Actualizar Avance</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{selectedObj.titulo}</p>

            <form onSubmit={handleUpdateProgress} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Nuevo Valor Actual ({selectedObj.unidad_medida})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newProgress}
                  onChange={(e) => setNewProgress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none text-base font-bold"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Meta establecida: <b>{selectedObj.meta_cuantitativa} {selectedObj.unidad_medida}</b>
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Actualizar Avance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
