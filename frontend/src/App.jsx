import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Actividades from './pages/Actividades';
import ActividadDetalle from './pages/ActividadDetalle';
import Proyectos from './pages/Proyectos';
import Equipos from './pages/Equipos';
import Personal from './pages/Personal';
import Estructura from './pages/Estructura';
import Objetivos from './pages/Objetivos';
import Evaluaciones from './pages/Evaluaciones';
import Reportes from './pages/Reportes';
import Bitacora from './pages/Bitacora';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="actividades" element={<Actividades />} />
              <Route path="actividades/:id" element={<ActividadDetalle />} />
              <Route path="proyectos" element={<Proyectos />} />
              <Route path="equipos" element={<Equipos />} />
              <Route path="personal" element={<Personal />} />
              <Route path="estructura" element={<Estructura />} />
              <Route path="objetivos" element={<Objetivos />} />
              <Route path="evaluaciones" element={<Evaluaciones />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="bitacora" element={<Bitacora />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
