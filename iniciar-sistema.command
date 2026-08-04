#!/bin/bash
# Navega para a pasta do script
cd "$(dirname "$0")"

echo "========================================================="
echo "⚡ INICIANDO O GESTÃO OS (LABORATÓRIO)..."
echo "========================================================="

# Inicia os containers do Docker Compose
docker compose up -d

echo "---------------------------------------------------------"
echo "🌐 Abrindo o sistema no seu navegador padrão..."
echo "========================================================="

# Abre o navegador padrão na porta do frontend
open http://localhost:3000

# Aguarda 2 segundos e fecha
sleep 2
exit
