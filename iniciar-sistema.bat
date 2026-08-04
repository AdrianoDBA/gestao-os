@echo off
title Iniciar Gestao OS
echo =========================================================
echo  INICIANDO O GESTAO OS (LABORATORIO)...
echo =========================================================

docker compose up -d

echo ---------------------------------------------------------
echo  Abrindo o sistema no seu navegador padrao...
echo =========================================================

start http://localhost:3000

timeout /t 3
exit
