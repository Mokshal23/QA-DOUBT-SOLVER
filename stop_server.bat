@echo off
setlocal
title QuantSolver - Stop Server

cd /d "%~dp0"
node scripts\stop_server.js

echo.
timeout /t 3 >nul 2>&1 || pause
