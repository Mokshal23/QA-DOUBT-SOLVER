@echo off
setlocal
title QuantSolver - Install Windows Autostart

cd /d "%~dp0"
node scripts\setup_startup.js

echo.
timeout /t 5 >nul 2>&1 || pause
