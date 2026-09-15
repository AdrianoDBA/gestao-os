#!/bin/bash
# Navega para a pasta do script
cd "$(dirname "$0")"

echo "========================================================="
echo "⚡ INICIANDO O GESTÃO OS (MODO APLICATIVO NATIVO)..."
echo "========================================================="

# Inicia os containers do Docker Compose
docker compose up -d

echo "---------------------------------------------------------"
echo "🌐 Abrindo em janela de aplicativo independente..."
echo "========================================================="

# Tenta abrir em modo App independente no Linux
if command -v google-chrome > /dev/null; then
  google-chrome --app=http://localhost:3000 >/dev/null 2>&1 &
elif command -v chromium-browser > /dev/null; then
  chromium-browser --app=http://localhost:3000 >/dev/null 2>&1 &
elif command -v xdg-open > /dev/null; then
  xdg-open http://localhost:3000
elif command -v gnome-open > /dev/null; then
  gnome-open http://localhost:3000
else
  echo "Por favor, acesse: http://localhost:3000"
fi

sleep 2
exit
