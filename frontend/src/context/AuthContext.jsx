import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

/**
 * Normaliza el objeto usuario para que siempre tenga ambas versiones de los campos
 * (español e inglés) para garantizar compatibilidad con el frontend existente.
 */
const normalizarUsuario = (userData) => {
  if (!userData) return null;
  return {
    ...userData,
    // Asegurar nombre / name
    nombre: userData.nombre ?? userData.name ?? '',
    name: userData.nombre ?? userData.name ?? '',
    // Asegurar rol / role (nuevo sistema usa valores en español)
    rol: userData.rol ?? userData.role ?? 'colaborador',
    role: userData.rol ?? userData.role ?? 'colaborador',
    // Cargo / position
    cargo: userData.cargo ?? userData.position ?? null,
    position: userData.cargo ?? userData.position ?? null,
    // Teléfono / phone
    telefono: userData.telefono ?? userData.phone ?? null,
    phone: userData.telefono ?? userData.phone ?? null,
    // Estado / status
    estado: userData.estado ?? userData.status ?? 'activo',
    status: userData.estado ?? userData.status ?? 'activo',
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? normalizarUsuario(JSON.parse(saved)) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/me')
        .then((res) => {
          const userData = normalizarUsuario(res.data.user);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    const { access_token, user: userData } = res.data;
    const userNormalizado = normalizarUsuario(userData);
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userNormalizado));
    setToken(access_token);
    setUser(userNormalizado);
    return userNormalizado;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/logout');
      }
    } catch (e) {
      // Ignorar si falla logout en backend
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
