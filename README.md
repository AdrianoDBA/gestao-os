# Gestão OS - Sistema Profissional para Assistência Técnica

O **Gestão OS** é uma plataforma monorepo SaaS-Ready inteligente, robusta e estável para gerenciamento completo de ordens de serviço, clientes, estoque de peças, movimentações financeiras, controle de acesso corporativo (RBAC) e central de inteligência do laboratório.

---

## 🚀 Tecnologias Utilizadas

### Frontend (`apps/web`)
* **Next.js 14** (App Router)
* **Tailwind CSS** (Estilização responsiva de alta performance)
* **Lucide Icons** (Pacote de ícones modernos)
* Persistência reativa com sincronização local e suporte a Modo Offline.

### Backend (`apps/api`)
* **NestJS** (Arquitetura corporativa escalável)
* **Prisma ORM** (Modelagem de dados integrada)
* **PostgreSQL** (Banco de dados relacional robusto)
* **MinIO S3** (Armazenamento de fotos e laudos de checklists)

---

## 📋 Requisitos do Sistema

* **Docker** (v20.10 ou superior)
* **Docker Compose** (v2.0 ou superior)
* **Git** (para clonar o repositório)

---

## 🛠️ Instalação e Inicialização Automática

A instalação foi projetada para ser extremamente simples e funcionar perfeitamente em **Windows**, **Linux** e **macOS** através do Docker.

### ⚡ Instalação Rápida em 1 Linha (Recomendado)

Você não precisa baixar nada manualmente. Basta abrir o terminal do seu computador e colar o comando correspondente ao seu sistema operacional:

#### 🍎 macOS e 🐧 Linux (Bash)
```bash
curl -sSL https://raw.githubusercontent.com/AdrianoDBA/gestao-os/main/install.sh | bash
```

#### 🪟 Windows (PowerShell)
*Abra o PowerShell no Windows e execute:*
```powershell
iwr -useb https://raw.githubusercontent.com/AdrianoDBA/gestao-os/main/install.ps1 | iex
```

*Nota: Esse instalador automatizado verifica a presença do Git e do Docker no seu computador, realiza a instalação e ativação automática caso necessário, clona este repositório, configura o arquivo `.env` padrão, executa todos os containers e abre o sistema diretamente no seu navegador padrão.*

---

### 📦 Instalação Manual (Passo a Passo)

Caso prefira fazer a instalação manual tradicional:

#### Passo 1: Clonar o projeto
```bash
git clone https://github.com/AdrianoDBA/gestao-os.git
cd gestao-os
```

#### Passo 2: Iniciar a aplicação
```bash
docker compose up -d
```

Este comando irá:
1. Baixar as imagens e inicializar todos os containers (`Postgres`, `MinIO`, `NestJS API` e `Next.js Frontend`).
2. Criar automaticamente o banco de dados e aplicar as migrations do Prisma.
3. Disponibilizar a aplicação nas portas padrões.

Acesse o sistema em seu navegador:
* **Frontend**: [http://localhost:3000](http://localhost:3000)
* **Backend API**: [http://localhost:3001](http://localhost:3001)

---

## 🛡️ Primeiro Acesso & Assistente de Configuração (Setup Wizard)

Ao abrir o sistema pela primeira vez ([http://localhost:3000](http://localhost:3000)), a instalação limpa será detectada e você será guiado pelo **Assistente de Configuração Inicial** (Setup Wizard). Nenhuma outra tela do sistema estará acessível até que as 3 etapas sejam concluídas:

1. **Etapa 1: Dados da Empresa** — Definição do Nome da Empresa, Nome Fantasia, CNPJ, telefone, WhatsApp de disparo e e-mail.
2. **Etapa 2: Cadastro do Administrador** — Criação do primeiro usuário administrador. A senha é criptografada e não existem senhas padrão ou de teste.
3. **Etapa 3: Preferências Gerais** — Definição de Idioma, Moeda padrão, Fuso Horário, prazo padrão de garantia e o número sequencial inicial para as Ordens de Serviço (OS).

Ao clicar em **Concluir**, a empresa e o administrador serão criados, as preferências serão salvas e você será automaticamente logado e redirecionado ao Dashboard.

---

## ⚙️ Variáveis de Ambiente

As configurações de desenvolvimento e produção são controladas centralizadamente pelo arquivo `.env` na raiz do projeto. Nenhuma credencial sensível fica no código de produção.

| Variável | Descrição | Padrão no Docker |
|----------|-----------|------------------|
| `DB_PASSWORD` | Senha do banco de dados PostgreSQL | `password_db_os_secure_9832` |
| `DB_NAME` | Nome do banco de dados relacional | `gestao_os` |
| `MINIO_ACCESS_KEY` | Usuário de acesso do MinIO S3 | `minio_admin` |
| `MINIO_SECRET_KEY` | Senha de acesso do MinIO S3 | `password_minio_s3_secure_123` |
| `JWT_SECRET` | Secret de assinatura dos tokens JWT | `jwt_secret_key_saas_platform_9843920` |

---

## 💾 Backups Automáticos & Google Drive Pessoal

* **Rotina Automática**: O sistema realiza snapshots automáticos a cada 1 hora (ou intervalo configurável) em segundo plano enquanto você atende clientes.
* **Sincronização em Nuvem (Custo Zero)**: Ao salvar os backups na pasta sincronizada do seu **Google Drive para Computador** (ou OneDrive / Dropbox), todos os arquivos são enviados imediatamente para a sua nuvem pessoal. Se o computador queimar ou for roubado, sua assistência técnica não perde nada.
* **Restauração Rápida**: Na aba **Configurações > Backup & Google Drive**, você pode restaurar qualquer ponto anterior da sua base com 1 clique.

---

## 🔑 Licenciamento Comercial & Proteção Anti-Fraude

O Gestão OS possui um motor de licenciamento criptográfico offline integrado:
* **Trial Automático**: Ao instalar pela primeira vez, o cliente ganha 15 dias de teste grátis.
* **Avisos de Vencimento**: Quando faltarem 7 dias para vencer, o sistema exibe uma barra amarela de alerta com contagem regressiva para renovação no WhatsApp.
* **Bloqueio ao Expirar**: Após a expiração, a bancada é bloqueada exibindo campo para nova chave e botão direto para o WhatsApp do suporte.
* **Gerador de Licenças**: O vendedor (você) pode gerar chaves pelo terminal com `node scripts/gerar-licenca.js "Nome da Oficina" PRO 365` ou diretamente na aba **Configurações > Licenciamento Comercial**.
* Consulte o guia completo de vendas em [KIT-COMERCIAL.md](file:///Users/adrianocme/gestao-os-app-v2/KIT-COMERCIAL.md).

---

## 🔄 Atualização do Sistema

Para atualizar o sistema para a versão mais recente preservando os dados dos volumes do Docker:
```bash
docker compose down
git pull origin main
docker compose up -d --build
```

---

## ❓ Solução de Problemas (Troubleshooting)

### O banco de dados não conectou na inicialização
Na primeira execução, o banco de dados Postgres pode demorar alguns segundos a mais para inicializar. Como o container da API NestJS está configurado com `restart: always`, ele reiniciará sozinho em poucos segundos e completará a conexão e a aplicação de migrations automaticamente.

### Como visualizar logs em tempo real
Para acompanhar os logs de inicialização e requisições de qualquer serviço:
```bash
docker compose logs -f api  # Para o backend NestJS
docker compose logs -f web  # Para o frontend Next.js
docker compose logs -f postgres # Para o banco relacional
```
