import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Briefcase, Plus, Calendar, User, Users, Building2, CheckCircle2 } from 'lucide-react';

export default function Proyectos() {
  const { user } = useAuth();
  const [proyectos, setProyectos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [supervisores, setSupervisores] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    estado: 'en_progreso',
    prioridad: 'media',
    fecha_inicio: '',
    fecha_fin_estimada: '',
    supervisor_id: '',
    equipo_id: '',
    departamento_id: '',
  });

  const fetchData = async () => {
    try {
      const [resProy, resEq, resUsers, resDeptos] = await Promise.all([
        api.get('/proyectos'),
        api.get('/equipos'),
        api.get('/users?role=supervisor'),
        api.get('/departamentos'),
      ]);
      setProyectos(resProy.data);
      setEquipos(resEq.data);
      setSupervisores(resUsers.data);
      setDepartamentos(resDeptos.data);
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
      await api.post('/proyectos', {
        ...form,
        supervisor_id: form.supervisor_id || user.id,
      });
      setShowModal(false);
      setForm({
        nombre: '',
        descripcion: '',
        estado: 'en_progreso',
        prioridad: 'media',
        fecha_inicio: '',
        fecha_fin_estimada: '',
        supervisor_id: '',
        equipo_id: '',
        departamento_id: '',
      });
      fetchData();
    } catch (err) {
      alert('Error al crear proyecto: ' + (err.response?.data?.message || err.message));
    }
  };

  const isSupervisorOrAdmin =
    user?.rol === 'administrador' ||
    user?.role === 'admin' ||
    user?.rol === 'supervisor' ||
    user?.role === 'supervisor';

  const getPriorityBadge = (prioridad) => {
    switch (prioridad) {
      case 'urgente':
        return <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase">Urgente</span>;
      case 'alta':
        return <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase">Alta</span>;
      case 'baja':
        return <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase">Baja</span>;
      default:
        return <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase">Media</span>;
    }
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'completado':
        return <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full text-xs">Completado</span>;
      case 'pausado':
        return <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full text-xs">Pausado</span>;
      case 'cancelado':
        return <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold px-2.5 py-0.5 rounded-full text-xs">Cancelado</span>;
      default:
        return <span className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold px-2.5 py-0.5 rounded-full text-xs">En Progreso</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Proyectos</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Organización estratégica de actividades y equipos relacionados
          </p>
        </div>

        {isSupervisorOrAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm shadow-indigo-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proyectos.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition space-y-4"
            >
              <div className="flex items-center justify-between">
                {getStatusBadge(p.estado || p.status)}
                {getPriorityBadge(p.prioridad || p.priority)}
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{p.nombre || p.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {p.descripcion || p.description || 'Sin descripción'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="truncate">Supervisor: <b className="text-slate-700 dark:text-slate-200">{p.supervisor?.nombre || p.supervisor?.name}</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="truncate">Equipo: <b className="text-slate-700 dark:text-slate-200">{p.equipo?.nombre || p.equipo?.name || 'Sin equipo'}</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Inicio: {p.fecha_inicio || p.start_date || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Fin: {p.fecha_fin_estimada || p.estimated_end_date || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-2 text-right">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {p.actividades?.length || 0} Actividades asociadas
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nuevo Proyecto */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Crear Proyecto</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Ingresa la información general del proyecto.</p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Nombre del Proyecto *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Sistema Web de Facturación"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Descripción</label>
                <textarea
                  rows={2}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Objetivo y alcance del proyecto..."
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Equipo Asociado</label>
                  <select
                    value={form.equipo_id}
                    onChange={(e) => setForm({ ...form, equipo_id: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                  >
                    <option value="">Ninguno / Sin asignar</option>
                    {equipos.map((eq) => (
                      <option key={eq.id} value={eq.id}>{eq.nombre || eq.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Prioridad</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Fecha Inicio</label>
                  <input
                    type="date"
                    value={form.fecha_inicio}
                    onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Fecha Estimada Fin</label>
                  <input
                    type="date"
                    value={form.fecha_fin_estimada}
                    onChange={(e) => setForm({ ...form, fecha_fin_estimada: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                  />
                </div>
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
                  Guardar Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
