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

# Tenta abrir no Chrome ou Brave em modo App dedicado (sem barra de URL)
if open -na "Google Chrome" --args --app=http://localhost:3000 2>/dev/null; then
  echo "✅ Aberto via Google Chrome App Mode"
elif open -na "Brave Browser" --args --app=http://localhost:3000 2>/dev/null; then
  echo "✅ Aberto via Brave App Mode"
elif open -na "Microsoft Edge" --args --app=http://localhost:3000 2>/dev/null; then
  echo "✅ Aberto via Edge App Mode"
else
  # Fallback navegador padrao
  open http://localhost:3000
fi

sleep 2
exit
