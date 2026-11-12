import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  User,
  Calendar,
} from 'lucide-react';

export default function Actividades() {
  const { user } = useAuth();
  const [actividades, setActividades] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterProyecto, setFilterProyecto] = useState('');

  // Modal Nueva Actividad
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    titulo: '',
    proyecto_id: '',
    usuario_asignado_id: '',
    fecha_limite: '',
    prioridad: 'media',
    descripcion: '',
    planteamiento_problema: '',
    trabajo_a_realizar: '',
  });

  const fetchData = async () => {
    try {
      const params = {};
      if (filterStatus) params.estado = filterStatus;
      if (filterPriority) params.prioridad = filterPriority;
      if (filterProyecto) params.proyecto_id = filterProyecto;

      const [resActs, resProy, resUsers] = await Promise.all([
        api.get('/actividades', { params }),
        api.get('/proyectos'),
        api.get('/users'),
      ]);

      setActividades(resActs.data);
      setProyectos(resProy.data);
      setPersonal(
        resUsers.data.filter(
          (u) =>
            u.rol === 'colaborador' ||
            u.role === 'colaborador' ||
            u.role === 'worker' ||
            u.rol === 'practicante' ||
            u.role === 'practicante' ||
            u.role === 'intern'
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterPriority, filterProyecto]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/actividades', form);
      setShowModal(false);
      setForm({
        titulo: '',
        proyecto_id: '',
        usuario_asignado_id: '',
        fecha_limite: '',
        prioridad: 'media',
        descripcion: '',
        planteamiento_problema: '',
        trabajo_a_realizar: '',
      });
      fetchData();
    } catch (err) {
      alert('Error al crear actividad: ' + (err.response?.data?.message || err.message));
    }
  };

  const isSupervisorOrAdmin =
    user?.rol === 'administrador' ||
    user?.role === 'admin' ||
    user?.rol === 'supervisor' ||
    user?.role === 'supervisor';

  const getStatusBadge = (estadoRaw) => {
    const estado = estadoRaw || 'pendiente';
    const map = {
      pendiente: { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300', label: 'Pendiente' },
      en_proceso: { bg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300', label: 'En Proceso' },
      terminada: { bg: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300', label: 'Terminada' },
      en_revision: { bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300', label: 'En Revisión' },
      observada: { bg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300', label: 'Observada' },
      aprobada: { bg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300', label: 'Aprobada' },
    };
    const s = map[estado] || { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300', label: estado };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${s.bg}`}>{s.label}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Actividades</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Gestión, asignación y seguimiento del flujo de trabajo
          </p>
        </div>

        {isSupervisorOrAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm shadow-indigo-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Nueva Actividad
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
          <Filter className="w-4 h-4" />
          <span>Filtros:</span>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-slate-700 dark:text-slate-200"
        >
          <option value="">Todos los Estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En Proceso</option>
          <option value="en_revision">En Revisión</option>
          <option value="observada">Observada</option>
          <option value="aprobada">Aprobada</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-slate-700 dark:text-slate-200"
        >
          <option value="">Todas las Prioridades</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>

        <select
          value={filterProyecto}
          onChange={(e) => setFilterProyecto(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-slate-700 dark:text-slate-200"
        >
          <option value="">Todos los Proyectos</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre || p.name}</option>
          ))}
        </select>
      </div>

      {/* Lista de Actividades */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : actividades.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            No se encontraron actividades con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {actividades.map((act) => {
            const titulo = act.titulo || act.title;
            const porcentaje = act.porcentaje_avance ?? act.progress_percentage ?? 0;
            const estado = act.estado || act.status;
            const prioridad = act.prioridad || act.priority;
            const fechaLimite = act.fecha_limite || act.due_date;
            const responsableNombre = act.responsable?.nombre || act.responsable?.name;

            return (
              <Link
                key={act.id}
                to={`/actividades/${act.id}`}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(estado)}
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                      Proyecto: <b className="text-slate-600 dark:text-slate-300">{act.proyecto?.nombre || act.proyecto?.name}</b>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 capitalize">
                      • Prioridad: {prioridad}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{titulo}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {act.planteamiento_problema || act.problem_statement || act.descripcion || act.description}
                  </p>
                </div>

                <div className="flex items-center gap-6 self-end md:self-center">
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{responsableNombre}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{fechaLimite}</span>
                    </div>
                  </div>

                  <div className="text-right min-w-[100px]">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{porcentaje}% oficial</span>
                    <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full ${estado === 'aprobada' ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal Crear Actividad */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Crear Nueva Actividad</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Asigna una tarea al personal especificando la necesidad y qué se debe realizar.
            </p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Título de la Actividad *</label>
                <input
                  type="text"
                  required
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej: Implementar módulo de reportes"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Proyecto *</label>
                  <select
                    required
                    value={form.proyecto_id}
                    onChange={(e) => setForm({ ...form, proyecto_id: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                  >
                    <option value="">Selecciona Proyecto</option>
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre || p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Responsable *</label>
                  <select
                    required
                    value={form.usuario_asignado_id}
                    onChange={(e) => setForm({ ...form, usuario_asignado_id: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                  >
                    <option value="">Selecciona Personal</option>
                    {personal.map((u) => (
                      <option key={u.id} value={u.id}>{u.nombre || u.name} ({u.rol || u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Fecha Límite *</label>
                  <input
                    type="date"
                    required
                    value={form.fecha_limite}
                    onChange={(e) => setForm({ ...form, fecha_limite: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Prioridad *</label>
                  <select
                    value={form.prioridad}
                    onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Descripción del problema o necesidad</label>
                <textarea
                  rows={2}
                  value={form.planteamiento_problema}
                  onChange={(e) => setForm({ ...form, planteamiento_problema: e.target.value })}
                  placeholder="Detalla la necesidad de negocio o requerimiento..."
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Qué se debe realizar</label>
                <textarea
                  rows={2}
                  value={form.trabajo_a_realizar}
                  onChange={(e) => setForm({ ...form, trabajo_a_realizar: e.target.value })}
                  placeholder="Especificaciones técnicas y entregables esperados..."
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Asignar y Crear Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
