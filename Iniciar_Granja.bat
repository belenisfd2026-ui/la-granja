@echo off
title La Granja del Saber - Servidor PWA
cd /d "%~dp0"
echo ========================================================
echo   Iniciando La Granja del Saber en tu maquina...
echo   Abriendo http://localhost:8080/ en tu navegador...
echo   No cierres esta ventanita mientras juegues.
echo ========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
