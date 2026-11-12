import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UserCheck, Plus, Search, Shield, Phone, Mail, Award, User, Building2 } from 'lucide-react';

export default function Personal() {
  const { user } = useAuth();
  const [personal, setPersonal] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'colaborador',
    telefono: '',
    dni: '',
    departamento_id: '',
    cargo_id: '',
    estado: 'activo',
  });

  const fetchData = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.rol = roleFilter;
      const [resUsers, resDeptos, resCargos] = await Promise.all([
        api.get('/users', { params }),
        api.get('/departamentos'),
        api.get('/cargos'),
      ]);
      setPersonal(resUsers.data);
      setDepartamentos(resDeptos.data);
      setCargos(resCargos.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, roleFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', form);
      setShowModal(false);
      setForm({
        nombre: '',
        email: '',
        password: '',
        rol: 'colaborador',
        telefono: '',
        dni: '',
        departamento_id: '',
        cargo_id: '',
        estado: 'activo',
      });
      fetchData();
    } catch (err) {
      alert('Error al registrar usuario: ' + (err.response?.data?.message || err.message));
    }
  };

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'administrador':
      case 'admin':
        return (
          <span className="bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
            Administrador
          </span>
        );
      case 'supervisor':
        return (
          <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
            Supervisor
          </span>
        );
      case 'colaborador':
      case 'worker':
        return (
          <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
            Colaborador
          </span>
        );
      case 'practicante':
      case 'intern':
        return (
          <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
            Practicante
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Directorio de Personal</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Administración de colaboradores, practicantes, supervisores y roles del sistema
          </p>
        </div>

        {(user?.rol === 'administrador' || user?.role === 'admin') && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm shadow-indigo-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Registrar Personal
          </button>
        )}
      </div>

      {/* Buscador y Filtro */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo, DNI o cargo..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-slate-700 dark:text-slate-200"
        >
          <option value="">Todos los Roles</option>
          <option value="administrador">Administrador</option>
          <option value="supervisor">Supervisor</option>
          <option value="colaborador">Colaborador</option>
          <option value="practicante">Practicante</option>
        </select>
      </div>

      {/* Lista / Grid de Personal */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personal.map((u) => (
            <div
              key={u.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                  {(u.nombre || u.name || '?').charAt(0)}
                </div>
                {getRoleBadge(u.rol || u.role)}
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{u.nombre || u.name}</h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  {u.cargo?.nombre ?? u.cargo ?? u.position ?? 'Sin cargo asignado'}
                </p>
                {u.departamento && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {u.departamento?.nombre ?? u.departamento}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{u.email}</span>
                </div>
                {(u.telefono || u.phone) && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{u.telefono || u.phone}</span>
                  </div>
                )}
                {u.dni && (
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">
                    DNI: <b className="text-slate-600 dark:text-slate-300">{u.dni}</b>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span
                  className={`font-bold ${
                    (u.estado || u.status) === 'activo' || (u.estado || u.status) === 'active'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  ● {(u.estado || u.status) === 'activo' || (u.estado || u.status) === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Registrar Usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Registrar Nuevo Personal</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Crea una cuenta para colaborador, practicante o supervisor.</p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Rol *</label>
                  <select
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none font-bold"
                  >
                    <option value="colaborador">Colaborador</option>
                    <option value="practicante">Practicante</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Departamento</label>
                  <select
                    value={form.departamento_id}
                    onChange={(e) => setForm({ ...form, departamento_id: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                  >
                    <option value="">Selecciona departamento</option>
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Cargo / Puesto</label>
                  <select
                    value={form.cargo_id}
                    onChange={(e) => setForm({ ...form, cargo_id: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                  >
                    <option value="">Selecciona cargo</option>
                    {cargos.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Teléfono</label>
                  <input
                    type="text"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">DNI</label>
                  <input
                    type="text"
                    value={form.dni}
                    onChange={(e) => setForm({ ...form, dni: e.target.value })}
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
                  Registrar Personal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
