@echo off
cd /d "%~dp0"
call "C:\Program Files\nodejs\npm.cmd" run dev > "%~dp0background_server.log" 2>&1
