import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Briefcase,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Activity,
  CalendarDays,
  ClipboardCheck,
  ExternalLink,
  Timer,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const today = new Date();
today.setHours(0, 0, 0, 0);

const metricStyles = {
  violet: {
    icon: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300',
    accent: 'text-violet-600 dark:text-violet-300',
  },
  blue: {
    icon: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300',
    accent: 'text-blue-600 dark:text-blue-300',
  },
  indigo: {
    icon: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300',
    accent: 'text-indigo-600 dark:text-indigo-300',
  },
  rose: {
    icon: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300',
    accent: 'text-rose-600 dark:text-rose-300',
  },
};

function MetricCard({ label, value, description, icon: Icon, tone }) {
  const styles = metricStyles[tone];

  return (
    <article className="group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value ?? 0}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${styles.icon}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className={`mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-semibold dark:border-slate-800 ${styles.accent}`}>
        <Activity className="h-3.5 w-3.5" />
        {description}
      </p>
    </article>
  );
}

function formatDate(date) {
  if (!date) return 'Sin fecha límite';
  const [year, month, day] = String(date).slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const rol = user?.rol || user?.role;
  const isAdmin = rol === 'administrador' || rol === 'admin';
  const isSupervisor = rol === 'supervisor';
  const isWorkerOrIntern =
    rol === 'colaborador' || rol === 'worker' || rol === 'practicante' || rol === 'intern';

  const recentActivities = data?.recent_activities || [];
  const statusItems = [
    { label: 'Pendientes', key: 'pendiente', color: '#94a3b8', bar: 'bg-slate-400' },
    { label: 'En proceso', key: 'en_proceso', color: '#3b82f6', bar: 'bg-blue-500' },
    { label: 'En revisión', key: 'en_revision', color: '#f59e0b', bar: 'bg-amber-500' },
    { label: 'Observadas', key: 'observada', color: '#f43f5e', bar: 'bg-rose-500' },
    { label: 'Aprobadas', key: 'aprobada', color: '#10b981', bar: 'bg-emerald-500' },
  ].map((item) => ({
    ...item,
    value: Number(data?.status_distribution?.[item.key] || 0),
  }));
  const statusTotal = statusItems.reduce((total, item) => total + item.value, 0);
  let chartOffset = 0;
  const chartGradient = statusTotal
    ? statusItems.map((item) => {
        const start = chartOffset;
        chartOffset += (item.value / statusTotal) * 100;
        return `${item.color} ${start}% ${chartOffset}%`;
      }).join(', ')
    : '#e2e8f0 0% 100%';
  const priorityActivities = recentActivities.filter((activity) => {
    const state = activity.estado || activity.status;
    const deadline = activity.fecha_limite || activity.due_date;
    const dueDate = deadline ? new Date(`${String(deadline).slice(0, 10)}T00:00:00`) : null;
    const isOverdue = dueDate && dueDate < today && state !== 'aprobada';
    return state === 'en_revision' || isOverdue;
  });

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/60 to-cyan-50/60 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:border-indigo-900 dark:bg-slate-900/80 dark:text-indigo-300">
            <Activity className="h-3.5 w-3.5" />
            {isAdmin ? 'Resumen ejecutivo' : isSupervisor ? 'Panel de supervisión' : 'Mi espacio de trabajo'}
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Hola, {user?.nombre || user?.name} <span aria-hidden="true">👋</span>
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
            {isAdmin && 'Indicadores generales, riesgos y trabajo pendiente de atención.'}
            {isSupervisor && 'Monitorea el avance del equipo y atiende las revisiones pendientes.'}
            {isWorkerOrIntern && 'Revisa tus actividades asignadas y el avance de tus entregas.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
            <CalendarDays className="h-4 w-4 text-indigo-500" />
            {today?.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) || 'Hoy'}
          </span>
          {isAdmin && (
            <Link to="/reportes" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700">
              Ver reportes <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Tarjetas de Métricas Principales (Vista Administrador) */}
      {isAdmin && data?.summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Personal" value={data.summary.total_users} description={`${data.summary.total_departamentos || 0} áreas en la organización`} icon={Users} tone="violet" />
          <MetricCard label="Proyectos" value={data.summary.total_proyectos} description={`${data.summary.total_equipos || 0} ${data.summary.total_equipos === 1 ? 'equipo' : 'equipos'} de trabajo`} icon={Briefcase} tone="blue" />
          <MetricCard label="Actividades" value={data.summary.total_actividades} description={`${data.summary.promedio_avance || 0}% de avance promedio`} icon={CheckCircle2} tone="indigo" />
          <MetricCard label="Con retraso" value={data.summary.actividades_retrasadas} description="Requieren seguimiento prioritario" icon={ShieldAlert} tone="rose" />
        </div>
      )}

      {isAdmin && data?.summary && (
        <>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-3">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Estado de actividades</h3>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Distribución actual del trabajo registrado</p>
                </div>
                <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {statusTotal} en total
                </span>
              </div>
              <div className="space-y-4">
                {statusItems.map((item) => (
                  <div key={item.key}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{item.label}</span>
                      <span className="font-black text-slate-800 dark:text-slate-100">{item.value}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${item.bar}`}
                        style={{ width: `${statusTotal ? (item.value / statusTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Avance general</h3>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Progreso promedio de las actividades</p>
              </div>
              <div className="flex flex-col items-center justify-center py-5">
                <div
                  className="relative flex h-40 w-40 items-center justify-center rounded-full"
                  style={{ background: `conic-gradient(${chartGradient})` }}
                  role="img"
                  aria-label={`Distribución de ${statusTotal} actividades por estado`}
                >
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
                    <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{data.summary.promedio_avance || 0}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">promedio</span>
                  </div>
                </div>
                <div className="mt-5 grid w-full grid-cols-2 gap-x-4 gap-y-2">
                  {statusItems.map((item) => (
                    <div key={item.key} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="truncate text-slate-500 dark:text-slate-400">{item.label}</span>
                      <span className="ml-auto font-bold text-slate-700 dark:text-slate-200">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-3">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Atención prioritaria</h3>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Actividades vencidas o esperando validación</p>
                </div>
                <Link to="/actividades" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                  Ver actividades <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {priorityActivities.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center dark:border-slate-700">
                  <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500" />
                  <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">Todo al día</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">No hay vencimientos ni revisiones recientes.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {priorityActivities.slice(0, 4).map((activity) => {
                    const state = activity.estado || activity.status;
                    const deadline = activity.fecha_limite || activity.due_date;
                    const dueDate = deadline ? new Date(`${String(deadline).slice(0, 10)}T00:00:00`) : null;
                    const isOverdue = dueDate && dueDate < today && state !== 'aprobada';
                    const title = activity.titulo || activity.title;

                    return (
                      <Link
                        key={activity.id}
                        to={`/actividades/${activity.id}`}
                        className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/40 dark:border-slate-800 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/20"
                      >
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isOverdue ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300'}`}>
                          {isOverdue ? <Timer className="h-5 w-5" /> : <ClipboardCheck className="h-5 w-5" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-slate-800 dark:text-slate-100">{title}</span>
                          <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                            {activity.proyecto?.nombre || activity.proyecto?.name || 'Sin proyecto'} · {activity.responsable?.nombre || activity.responsable?.name || 'Sin responsable'}
                          </span>
                        </span>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${isOverdue ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'}`}>
                          {isOverdue ? `${state === 'en_revision' ? 'Revisión vencida' : 'Vencida'} · ${formatDate(deadline)}` : 'Por revisar'}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Actividad reciente</h3>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Últimos movimientos registrados</p>
                </div>
                <Clock className="h-5 w-5 text-slate-400" />
              </div>
              {recentActivities.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">Aún no hay actividad reciente.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivities.slice(0, 4).map((activity) => (
                    <Link key={activity.id} to={`/actividades/${activity.id}`} className="flex items-start gap-3 rounded-xl p-2 transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">{activity.titulo || activity.title}</span>
                        <span className="mt-1 block truncate text-[11px] text-slate-500 dark:text-slate-400">{activity.proyecto?.nombre || activity.proyecto?.name || 'Sin proyecto'}</span>
                      </span>
                      <span className="shrink-0 text-[10px] font-bold text-slate-400">{activity.porcentaje_avance ?? activity.progress_percentage ?? 0}%</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}

      {/* Vista de Supervisor */}
      {isSupervisor && data?.summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 p-5 rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pendientes Revisión</span>
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-3xl font-black text-amber-900 dark:text-amber-200 mt-2">{data.summary.pendientes_revision}</h3>
              <p className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-1 font-medium">Actividades enviadas por tu equipo</p>
            </div>

            <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 p-5 rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Aprobadas</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-3xl font-black text-emerald-900 dark:text-emerald-200 mt-2">{data.summary.aprobadas}</h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-1 font-medium">Culminadas satisfactoriamente</p>
            </div>

            <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-800/50 p-5 rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Observadas</span>
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-3xl font-black text-rose-900 dark:text-rose-200 mt-2">{data.summary.observadas}</h3>
              <p className="text-[11px] text-rose-600 dark:text-rose-400/80 mt-1 font-medium">En proceso de corrección</p>
            </div>

            <div className="bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/50 p-5 rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Total Asignadas</span>
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-3xl font-black text-indigo-900 dark:text-indigo-200 mt-2">{data.summary.total_actividades}</h3>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400/80 mt-1 font-medium">Bajo tu supervisión</p>
            </div>
          </div>

          {data.actividades_revision?.length > 0 && (
            <section className="rounded-3xl border border-amber-200/80 bg-amber-50/50 p-6 dark:border-amber-900/60 dark:bg-amber-950/10">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Revisiones pendientes</h3>
                  <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">Entregas que esperan tu validación</p>
                </div>
                <Link to="/actividades" className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 dark:text-amber-300">
                  Ir a actividades <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {data.actividades_revision.slice(0, 4).map((activity) => (
                  <Link key={activity.id} to={`/actividades/${activity.id}`} className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-3 transition hover:border-amber-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-amber-800">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">
                      <ClipboardCheck className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-slate-800 dark:text-slate-100">{activity.titulo || activity.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                        {activity.responsable?.nombre || activity.responsable?.name || 'Sin responsable'} · {activity.proyecto?.nombre || activity.proyecto?.name || 'Sin proyecto'}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Seguimiento del personal a cargo */}
          {data.indicadores_personal && data.indicadores_personal.length > 0 && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Seguimiento de Integrantes del Equipo</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Indicadores de rendimiento individual en tiempo real</p>
                </div>
                <Link to="/evaluaciones" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  Evaluar Personal ➔
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 rounded-l-xl">Personal</th>
                      <th className="py-3 px-4">Cargo / Rol</th>
                      <th className="py-3 px-4 text-center">Asignadas</th>
                      <th className="py-3 px-4 text-center">Aprobadas</th>
                      <th className="py-3 px-4 text-center">En Revisión</th>
                      <th className="py-3 px-4 text-center">Observadas</th>
                      <th className="py-3 px-4 text-center">Retrasadas</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Avance Promedio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {data.indicadores_personal.map((item) => {
                      const usuario = item.usuario || item.user;
                      return (
                        <tr key={usuario.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{usuario.nombre || usuario.name}</td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{usuario.cargo || usuario.position || usuario.rol}</td>
                          <td className="py-3 px-4 text-center text-slate-800 dark:text-slate-200">{item.metricas.total}</td>
                          <td className="py-3 px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">{item.metricas.completadas}</td>
                          <td className="py-3 px-4 text-center text-amber-600 dark:text-amber-400 font-bold">{item.metricas.en_revision}</td>
                          <td className="py-3 px-4 text-center text-rose-500 dark:text-rose-400 font-bold">{item.metricas.observadas}</td>
                          <td className="py-3 px-4 text-center text-red-600 dark:text-red-400 font-bold">{item.metricas.retrasadas}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-block px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 font-bold rounded-lg">
                              {item.metricas.avance_promedio}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vista de Colaborador / Practicante */}
      {isWorkerOrIntern && data?.summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pendientes</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{data.summary.pendientes}</p>
            </div>
            <div className="bg-blue-50/60 dark:bg-blue-950/20 p-4 rounded-3xl border border-blue-200/60 dark:border-blue-800/40">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">En Proceso</span>
              <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">{data.summary.en_proceso}</p>
            </div>
            <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-3xl border border-amber-200/60 dark:border-amber-800/40">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">En Revisión</span>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">{data.summary.en_revision}</p>
            </div>
            <div className="bg-rose-50/60 dark:bg-rose-950/20 p-4 rounded-3xl border border-rose-200/60 dark:border-rose-800/40">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Observadas</span>
              <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{data.summary.observadas}</p>
            </div>
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-3xl border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Aprobadas</span>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{data.summary.aprobadas}</p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Mis Actividades Asignadas</h3>
            <div className="space-y-3">
              {data.actividades && data.actividades.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No tienes actividades asignadas actualmente.</p>
              ) : (
                data.actividades.map((act) => {
                  const titulo = act.titulo || act.title;
                  const porcentaje = act.porcentaje_avance ?? act.progress_percentage ?? 0;
                  const estado = act.estado || act.status;

                  return (
                    <Link
                      key={act.id}
                      to={`/actividades/${act.id}`}
                      className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{titulo}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Proyecto: {act.proyecto?.nombre || act.proyecto?.name}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{porcentaje}% oficial</span>
                          <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                            <div className="bg-indigo-600 h-full" style={{ width: `${porcentaje}%` }}></div>
                          </div>
                        </div>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            estado === 'aprobada'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : estado === 'observada'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : estado === 'en_revision'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}
                        >
                          {estado?.toUpperCase()}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
