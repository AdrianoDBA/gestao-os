@echo off
title Gestao OS - Aplicativo Desktop
echo =========================================================
echo  INICIANDO O GESTAO OS (MODO APLICATIVO NATIVO)...
echo =========================================================

docker compose up -d

echo ---------------------------------------------------------
echo  Abrindo em modo de aplicativo (sem cara de navegador)...
echo =========================================================

:: Tenta abrir no Edge em modo App sem barra de URL
start msedge --app=http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
  :: Se falhar, tenta no Chrome em modo App
  start chrome --app=http://localhost:3000 >nul 2>&1
  if %errorlevel% neq 0 (
    :: Fallback para navegador padrao
    start http://localhost:3000
  )
)

timeout /t 2 >nul
exit
