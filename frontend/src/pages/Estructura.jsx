import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Building2, Plus, Users, Briefcase, Award, Shield, CheckCircle2 } from 'lucide-react';

export default function Estructura() {
  const { user } = useAuth();
  const [tab, setTab] = useState('departamentos'); // 'departamentos' | 'cargos'
  const [departamentos, setDepartamentos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [showDeptoModal, setShowDeptoModal] = useState(false);
  const [showCargoModal, setShowCargoModal] = useState(false);

  // Forms
  const [deptoForm, setDeptoForm] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    responsable_id: '',
    estado: 'activo',
  });

  const [cargoForm, setCargoForm] = useState({
    nombre: '',
    departamento_id: '',
    nivel_jerarquico: 'operativo',
    salario_base: '',
    descripcion: '',
    estado: 'activo',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resDeptos, resCargos, resUsers] = await Promise.all([
        api.get('/departamentos'),
        api.get('/cargos'),
        api.get('/users'),
      ]);
      setDepartamentos(resDeptos.data || []);
      setCargos(resCargos.data || []);
      setUsuarios(resUsers.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDepto = async (e) => {
    e.preventDefault();
    try {
      await api.post('/departamentos', deptoForm);
      setShowDeptoModal(false);
      setDeptoForm({ nombre: '', codigo: '', descripcion: '', responsable_id: '', estado: 'activo' });
      fetchData();
    } catch (err) {
      alert('Error al crear departamento: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateCargo = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cargos', cargoForm);
      setShowCargoModal(false);
      setCargoForm({
        nombre: '',
        departamento_id: '',
        nivel_jerarquico: 'operativo',
        salario_base: '',
        descripcion: '',
        estado: 'activo',
      });
      fetchData();
    } catch (err) {
      alert('Error al crear cargo: ' + (err.response?.data?.message || err.message));
    }
  };

  const getNivelBadge = (nivel) => {
    const map = {
      directivo: { bg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800', label: 'Directivo' },
      supervision: { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800', label: 'Supervisión' },
      operativo: { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', label: 'Operativo' },
      practicas: { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800', label: 'Prácticas' },
    };
    const n = map[nivel] || { bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700', label: nivel };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${n.bg}`}>{n.label}</span>;
  };

  const isAdmin = user?.rol === 'administrador' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              Organigrama Corporativo
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Estructura Organizacional
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Gestión de áreas funcionales, departamentos y catálogo corporativo de cargos
          </p>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeptoModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              Nuevo Departamento
            </button>
            <button
              onClick={() => setShowCargoModal(true)}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              Nuevo Cargo
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setTab('departamentos')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px ${
            tab === 'departamentos'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Departamentos ({departamentos.length})
        </button>
        <button
          onClick={() => setTab('cargos')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px ${
            tab === 'cargos'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Cargos y Puestos ({cargos.length})
        </button>
      </div>

      {/* Contenido según Tab */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tab === 'departamentos' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departamentos.map((d) => (
            <div
              key={d.id}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 font-black rounded-lg text-xs">
                  {d.codigo}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {d.estado}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{d.nombre}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{d.descripcion || 'Sin descripción'}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Responsable / Líder:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {d.responsable ? d.responsable.nombre : 'No asignado'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Cargos vinculados:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{d.cargos?.length || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Cargo / Puesto</th>
                <th className="px-5 py-3.5">Departamento</th>
                <th className="px-5 py-3.5">Nivel Jerárquico</th>
                <th className="px-5 py-3.5">Salario Base</th>
                <th className="px-5 py-3.5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cargos.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900 dark:text-white">{c.nombre}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{c.descripcion}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                    {c.departamento?.nombre || 'General'}
                  </td>
                  <td className="px-5 py-3.5">{getNivelBadge(c.nivel_jerarquico)}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                    {c.salario_base ? `S/ ${parseFloat(c.salario_base).toFixed(2)}` : 'No asignado'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">● {c.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear Departamento */}
      {showDeptoModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Registrar Nuevo Departamento</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Crea una unidad o departamento en el organigrama.</p>

            <form onSubmit={handleCreateDepto} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Nombre del Departamento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Calidad y Auditoría"
                  value={deptoForm.nombre}
                  onChange={(e) => setDeptoForm({ ...deptoForm, nombre: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Código Identificador *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: DEP-QA"
                  value={deptoForm.codigo}
                  onChange={(e) => setDeptoForm({ ...deptoForm, codigo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Responsable / Líder</label>
                <select
                  value={deptoForm.responsable_id}
                  onChange={(e) => setDeptoForm({ ...deptoForm, responsable_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Selecciona un usuario</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre || u.name} ({u.rol || u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Descripción</label>
                <textarea
                  rows="3"
                  value={deptoForm.descripcion}
                  onChange={(e) => setDeptoForm({ ...deptoForm, descripcion: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeptoModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Crear Departamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear Cargo */}
      {showCargoModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Registrar Nuevo Cargo</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Define un puesto de trabajo y su nivel de responsabilidad.</p>

            <form onSubmit={handleCreateCargo} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Nombre del Cargo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Analista de Pruebas QA"
                  value={cargoForm.nombre}
                  onChange={(e) => setCargoForm({ ...cargoForm, nombre: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Departamento *</label>
                <select
                  required
                  value={cargoForm.departamento_id}
                  onChange={(e) => setCargoForm({ ...cargoForm, departamento_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Selecciona departamento</option>
                  {departamentos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre} ({d.codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Nivel Jerárquico *</label>
                  <select
                    value={cargoForm.nivel_jerarquico}
                    onChange={(e) => setCargoForm({ ...cargoForm, nivel_jerarquico: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="directivo">Directivo</option>
                    <option value="supervision">Supervisión</option>
                    <option value="operativo">Operativo</option>
                    <option value="practicas">Prácticas</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Salario Base (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="3500.00"
                    value={cargoForm.salario_base}
                    onChange={(e) => setCargoForm({ ...cargoForm, salario_base: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Descripción del Puesto</label>
                <textarea
                  rows="3"
                  value={cargoForm.descripcion}
                  onChange={(e) => setCargoForm({ ...cargoForm, descripcion: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCargoModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Crear Cargo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
