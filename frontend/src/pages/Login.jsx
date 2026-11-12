import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogIn, Shield, Users, UserCheck, Award, AlertCircle, Sun, Moon, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/50 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6 relative transition-colors duration-200">
      {/* Botón flotante para alternar Tema */}
      <button
        onClick={toggleTheme}
        aria-label="Cambiar tema"
        className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
      >
        {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
      </button>

      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-indigo-500/5 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-800 p-8 transition-colors duration-200">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/30 mb-3">
            SG
          </div>
          <p className="mb-1 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            SIGEP
          </p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Iniciar Sesión</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sistema de Gestión y Evaluación de Personal
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@empresa.com"
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Ingresar al Sistema</span>
              </>
            )}
          </button>
        </form>

        {/* Acceso Rápido para Demostración */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-3">
            Acceso Rápido por Rol (Demostración)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('admin@empresa.com', '123456')}
              className="p-2.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-950/70 text-purple-700 dark:text-purple-300 font-semibold rounded-xl border border-purple-200/80 dark:border-purple-800 text-left transition flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <div>
                <p className="font-bold">Administrador</p>
                <p className="text-[10px] text-purple-500 dark:text-purple-400">Alejandro</p>
              </div>
            </button>

            <button
              onClick={() => handleQuickLogin('supervisor@empresa.com', '123456')}
              className="p-2.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold rounded-xl border border-blue-200/80 dark:border-blue-800 text-left transition flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <p className="font-bold">Supervisor</p>
                <p className="text-[10px] text-blue-500 dark:text-blue-400">Mateo</p>
              </div>
            </button>

            <button
              onClick={() => handleQuickLogin('daniel@empresa.com', '123456')}
              className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-semibold rounded-xl border border-emerald-200/80 dark:border-emerald-800 text-left transition flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold">Colaborador</p>
                <p className="text-[10px] text-emerald-500 dark:text-emerald-400">Daniel</p>
              </div>
            </button>

            <button
              onClick={() => handleQuickLogin('rodrigo@empresa.com', '123456')}
              className="p-2.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-semibold rounded-xl border border-amber-200/80 dark:border-amber-800 text-left transition flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="font-bold">Practicante</p>
                <p className="text-[10px] text-amber-500 dark:text-amber-400">Rodrigo</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
