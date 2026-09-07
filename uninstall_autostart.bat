@echo off
setlocal
title QuantSolver - Uninstall Windows Autostart

cd /d "%~dp0"
node scripts\uninstall_startup.js

echo.
timeout /t 5 >nul 2>&1 || pause
