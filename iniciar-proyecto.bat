@echo off
title Sistema de Gestion de Personal
echo =======================================================
echo Iniciando Sistema de Gestion y Evaluacion de Personal
echo =======================================================

echo Iniciando Servidor Backend (Laravel)...
start "Backend Laravel API" cmd /k "cd /d D:\sistema-gestion-personal\backend && php artisan serve --port=8000"

timeout /t 2 >nul

echo Iniciando Servidor Frontend (React)...
start "Frontend React Vite" cmd /k "cd /d D:\sistema-gestion-personal\frontend && npm run dev"

echo =======================================================
echo Aplicacion iniciada correctamente:
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:8000/api
echo =======================================================
pause
