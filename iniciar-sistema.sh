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

# Abre o navegador padrão no Linux
if command -v xdg-open > /dev/null; then
  xdg-open http://localhost:3000
elif command -v gnome-open > /dev/null; then
  gnome-open http://localhost:3000
else
  echo "Por favor, acesse manualmente: http://localhost:3000"
fi

# Aguarda 2 segundos e fecha
sleep 2
exit
