#!/bin/bash

# Cores para o terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}=========================================================${NC}"
echo -e "${GREEN}⚡ INSTALADOR AUTOMÁTICO GESTÃO OS - RELEASE 1.0${NC}"
echo -e "${BLUE}=========================================================${NC}"

# 1. Detecta o OS
OS_TYPE="$(uname)"
echo -e "🖥️ Sistema operacional detectado: ${YELLOW}${OS_TYPE}${NC}"

# Função para verificar se um comando existe
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# 2. Verifica se o Git está instalado
if command_exists git; then
  echo -e "✅ Git já está instalado."
else
  echo -e "⚠️ Git não encontrado. Instalando..."
  if [ "$OS_TYPE" = "Darwin" ]; then
    # macOS
    if command_exists brew; then
      brew install git
    else
      echo -e "⚠️ Homebrew não encontrado. Iniciando instalador de ferramentas de linha de comando do macOS..."
      xcode-select --install
      echo -e "${YELLOW}Por favor, conclua a instalação da janela que se abriu e execute o script novamente.${NC}"
      exit 1
    fi
  elif [ "$OS_TYPE" = "Linux" ]; then
    # Linux
    if [ -f /etc/debian_version ]; then
      sudo apt-get update && sudo apt-get install -y git
    elif [ -f /etc/redhat-release ]; then
      sudo yum install -y git
    else
      echo -e "${RED}Não foi possível instalar o Git automaticamente. Instale-o e execute este script novamente.${NC}"
      exit 1
    fi
  fi
fi

# 3. Verifica se o Docker está instalado
if command_exists docker; then
  echo -e "✅ Docker já está instalado."
else
  echo -e "⚠️ Docker não encontrado. Iniciando instalação..."
  if [ "$OS_TYPE" = "Darwin" ]; then
    # macOS
    if command_exists brew; then
      echo -e "Instalando Docker Desktop via Homebrew..."
      brew install --cask docker
      echo -e "${YELLOW}Abra o Docker Desktop no seu Launchpad para concluir a configuração antes de continuar.${NC}"
    else
      echo -e "${RED}Por favor, instale o Docker Desktop manualmente através do link: https://www.docker.com/products/docker-desktop${NC}"
      exit 1
    fi
  elif [ "$OS_TYPE" = "Linux" ]; then
    # Linux
    echo -e "Instalando Docker Engine via script oficial..."
    curl -fsSL https://get.docker.com | sh
    sudo systemctl start docker
    sudo systemctl enable docker
    # Adiciona usuário ao grupo do docker
    sudo usermod -aG docker "$USER"
    echo -e "${YELLOW}Docker instalado. Adicionado usuário ao grupo docker. Talvez seja necessário deslogar e logar novamente para aplicar as permissões.${NC}"
  fi
fi

# 4. Verifica se o Docker Compose está instalado
if docker compose version >/dev/null 2>&1 || command_exists docker-compose; then
  echo -e "✅ Docker Compose já está instalado."
else
  echo -e "⚠️ Docker Compose não encontrado. Instalando..."
  if [ "$OS_TYPE" = "Linux" ]; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
    echo -e "✅ Docker Compose instalado com sucesso."
  else
    echo -e "${RED}Por favor, certifique-se de que o Docker Desktop está rodando e configurado.${NC}"
    exit 1
  fi
fi

# 5. Clonagem do repositório
REPO_DIR="gestao-os"
if [ -d "$REPO_DIR" ]; then
  echo -e "📂 A pasta '${REPO_DIR}' já existe. Entrando nela e garantindo que o código esteja atualizado..."
  cd "$REPO_DIR" || exit
  git pull origin main
else
  # Verifica se já estamos dentro da pasta do projeto por engano (se houver o arquivo docker-compose.yml)
  if [ -f "docker-compose.yml" ]; then
    echo -e "📂 Já estamos na pasta do projeto."
  else
    echo -e "📂 Clonando o repositório do Gestão OS..."
    git clone https://github.com/AdrianoDBA/gestao-os.git "$REPO_DIR"
    cd "$REPO_DIR" || exit
  fi
fi

# 6. Copia o .env de exemplo se necessário
if [ ! -f ".env" ]; then
  echo -e "📝 Configurando arquivo de ambiente padrão (.env)..."
  cp .env.example .env
fi

# 7. Sobe a aplicação
echo -e "${GREEN}🚀 Inicializando os containers do Gestão OS via Docker Compose...${NC}"
docker compose up -d

# 8. Cria Atalho na Área de Trabalho / Mesa
DESKTOP_DIR="$HOME/Desktop"
if [ ! -d "$DESKTOP_DIR" ]; then
  DESKTOP_DIR="$HOME/Área de Trabalho"
fi

if [ -d "$DESKTOP_DIR" ]; then
  if [ "$OS_TYPE" = "Darwin" ]; then
    cat << 'EOF' > "$DESKTOP_DIR/Gestão OS.command"
#!/bin/bash
open -na "Google Chrome" --args --app=http://localhost:3000 2>/dev/null || open -na "Microsoft Edge" --args --app=http://localhost:3000 2>/dev/null || open http://localhost:3000
EOF
    chmod +x "$DESKTOP_DIR/Gestão OS.command"
    echo -e "${GREEN}🖥️ Atalho 'Gestão OS' criado na sua Mesa (Área de Trabalho)!${NC}"
  elif [ "$OS_TYPE" = "Linux" ]; then
    cat << EOF > "$DESKTOP_DIR/gestao-os.desktop"
[Desktop Entry]
Version=1.0
Type=Application
Name=Gestão OS
Comment=Sistema de Assistência Técnica
Exec=google-chrome --app=http://localhost:3000
Icon=applications-system
Terminal=false
StartupNotify=true
EOF
    chmod +x "$DESKTOP_DIR/gestao-os.desktop"
    echo -e "${GREEN}🖥️ Atalho 'Gestão OS' criado na sua Área de Trabalho!${NC}"
  fi
fi

echo -e "${BLUE}---------------------------------------------------------${NC}"
echo -e "🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo -e "🌐 Abrindo o Gestão OS em Modo Aplicativo Desktop..."
echo -e "${BLUE}=========================================================${NC}"

# Abre em modo aplicativo standalone (sem barra de URL de navegador)
if [ "$OS_TYPE" = "Darwin" ]; then
  open -na "Google Chrome" --args --app=http://localhost:3000 2>/dev/null || open -na "Microsoft Edge" --args --app=http://localhost:3000 2>/dev/null || open http://localhost:3000
elif [ "$OS_TYPE" = "Linux" ]; then
  if command_exists google-chrome; then
    google-chrome --app=http://localhost:3000 >/dev/null 2>&1 &
  elif command_exists chromium-browser; then
    chromium-browser --app=http://localhost:3000 >/dev/null 2>&1 &
  elif command_exists xdg-open; then
    xdg-open http://localhost:3000
  fi
fi

exit 0
