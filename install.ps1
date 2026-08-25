# Script do PowerShell para instalação automática do Gestão OS no Windows

Write-Host "=========================================================" -ForegroundColor Blue
Write-Host "⚡ INSTALADOR AUTOMÁTICO GESTÃO OS - WINDOWS RELEASE 1.0" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Blue

# Função para verificar se um comando existe no sistema
function Test-CommandExists {
    param ($CommandName)
    $null -eq (Get-Command $CommandName -ErrorAction SilentlyContinue) ? $false : $true
}

# 1. Verifica e instala o Git
if (Test-CommandExists "git") {
    Write-Host "✅ Git já está instalado." -ForegroundColor Green
} else {
    Write-Host "⚠️ Git não encontrado. Instalando via Winget..." -ForegroundColor Yellow
    winget install --id Git.Git -e --silent --accept-source-agreements --accept-package-agreements
    if (-not (Test-CommandExists "git")) {
        Write-Host "❌ Falha ao instalar o Git automaticamente. Por favor, instale manualmente a partir de https://git-scm.com/ e execute este script novamente." -ForegroundColor Red
        Exit
    }
}

# 2. Verifica e instala o Docker Desktop
if (Test-CommandExists "docker") {
    Write-Host "✅ Docker já está instalado." -ForegroundColor Green
} else {
    Write-Host "⚠️ Docker Desktop não encontrado. Instalando via Winget..." -ForegroundColor Yellow
    winget install --id Docker.DockerDesktop -e --accept-source-agreements --accept-package-agreements
    Write-Host "✅ Docker Desktop instalado." -ForegroundColor Green
    Write-Host "⚠️ IMPORTANTE: Abra o Docker Desktop no menu Iniciar para habilitar o motor do Docker (e o WSL2) antes de prosseguir!" -ForegroundColor Yellow
    Write-Host "Pressione qualquer tecla após abrir o Docker Desktop para continuar..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# 3. Clonagem do repositório
$RepoDir = "gestao-os"
if (Test-Path $RepoDir) {
    Write-Host "📂 A pasta '$RepoDir' já existe. Acessando a pasta e atualizando..." -ForegroundColor Blue
    Set-Location $RepoDir
    git pull origin main
} elseif (Test-Path "docker-compose.yml") {
    Write-Host "📂 Já estamos na pasta do projeto." -ForegroundColor Blue
} else {
    Write-Host "📂 Clonando o repositório do Gestão OS..." -ForegroundColor Blue
    git clone https://github.com/AdrianoDBA/gestao-os.git $RepoDir
    Set-Location $RepoDir
}

# 4. Copia o .env de exemplo se necessário
if (-not (Test-Path ".env")) {
    Write-Host "📝 Configurando arquivo de ambiente padrão (.env)..." -ForegroundColor Blue
    Copy-Item ".env.example" ".env"
}

# 5. Sobe a aplicação
Write-Host "🚀 Inicializando os containers do Gestão OS via Docker Compose..." -ForegroundColor Green
docker compose up -d

Write-Host "---------------------------------------------------------" -ForegroundColor Blue
Write-Host "🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
Write-Host "🌐 Acesse no seu navegador em: http://localhost:3000" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Blue

# Abre o navegador automaticamente
Start-Process "http://localhost:3000"
