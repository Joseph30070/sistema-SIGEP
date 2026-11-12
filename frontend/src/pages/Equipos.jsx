import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Users, Plus, Shield, User, Award, Building2 } from 'lucide-react';

export default function Equipos() {
  const { user } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [supervisores, setSupervisores] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    departamento_id: '',
    supervisor_id: '',
    selectedMembers: [],
  });

  const fetchData = async () => {
    try {
      const [resEq, resUsers, resDeptos] = await Promise.all([
        api.get('/equipos'),
        api.get('/users'),
        api.get('/departamentos'),
      ]);
      setEquipos(resEq.data);
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
      setSupervisores(
        resUsers.data.filter(
          (u) =>
            u.rol === 'supervisor' ||
            u.role === 'supervisor' ||
            u.rol === 'administrador' ||
            u.role === 'admin'
        )
      );
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

  const handleToggleMember = (userId, rolEnEquipo) => {
    const exists = form.selectedMembers.find((m) => m.usuario_id === userId || m.user_id === userId);
    if (exists) {
      setForm({
        ...form,
        selectedMembers: form.selectedMembers.filter((m) => (m.usuario_id || m.user_id) !== userId),
      });
    } else {
      setForm({
        ...form,
        selectedMembers: [
          ...form.selectedMembers,
          { usuario_id: userId, user_id: userId, rol_en_equipo: rolEnEquipo },
        ],
      });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/equipos', {
        nombre: form.nombre,
        descripcion: form.descripcion,
        departamento_id: form.departamento_id || null,
        supervisor_id: form.supervisor_id || user.id,
        miembros: form.selectedMembers,
      });
      setShowModal(false);
      setForm({
        nombre: '',
        descripcion: '',
        departamento_id: '',
        supervisor_id: '',
        selectedMembers: [],
      });
      fetchData();
    } catch (err) {
      alert('Error al crear equipo: ' + (err.response?.data?.message || err.message));
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
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Equipos de Trabajo</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Organización del personal para facilitar la supervisión, asignación y seguimiento
          </p>
        </div>

        {isSupervisorOrAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm shadow-indigo-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Nuevo Equipo
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {equipos.map((eq) => (
            <div
              key={eq.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  {eq.departamento && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {eq.departamento.nombre}
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                    {eq.miembros?.length || 0} Integrantes
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{eq.nombre || eq.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {eq.descripcion || eq.description || 'Sin descripción'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-3">
                  <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Supervisor: <b className="text-slate-900 dark:text-slate-100">{eq.supervisor?.nombre || eq.supervisor?.name}</b></span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Miembros Asignados:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {eq.miembros?.map((m) => {
                      const rol = m.rol || m.role;
                      const isPracticante = rol === 'practicante' || rol === 'intern';
                      const isSup = rol === 'supervisor';

                      return (
                        <span
                          key={m.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${
                            isPracticante
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800'
                              : isSup
                              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800'
                          }`}
                        >
                          {isPracticante ? <Award className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {m.nombre || m.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nuevo Equipo */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Crear Equipo de Trabajo</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Define el equipo, su supervisor y los integrantes.</p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Nombre del Equipo *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Equipo de Desarrollo Web Alfa"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Departamento</label>
                  <select
                    value={form.departamento_id}
                    onChange={(e) => setForm({ ...form, departamento_id: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                  >
                    <option value="">Sin departamento</option>
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Supervisor Responsable *</label>
                  <select
                    required
                    value={form.supervisor_id}
                    onChange={(e) => setForm({ ...form, supervisor_id: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none font-bold"
                  >
                    <option value="">Selecciona Supervisor</option>
                    {supervisores.map((s) => (
                      <option key={s.id} value={s.id}>{s.nombre || s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Descripción</label>
                <textarea
                  rows={2}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Área de enfoque del equipo..."
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase">
                  Integrantes (Colaboradores / Practicantes)
                </label>
                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  {personal.map((p) => {
                    const isSelected = form.selectedMembers.some(
                      (m) => (m.usuario_id || m.user_id) === p.id
                    );
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleMember(p.id, p.rol || p.role)}
                            className="rounded text-indigo-600"
                          />
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {p.nombre || p.name}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                          {p.cargo?.nombre || p.cargo || p.rol || p.role}
                        </span>
                      </label>
                    );
                  })}
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
                  Guardar Equipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
