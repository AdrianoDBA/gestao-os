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

### Passo 1: Clonar o projeto
```bash
git clone https://github.com/usuario/gestao-os.git
cd gestao-os
```

### Passo 2: Iniciar a aplicação
```bash
docker compose up -d
```

Este único comando irá:
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

## 💾 Backups & Restauração

* **Backup Geral**: Acesse a aba **Configurações > Backup & BD** no menu para exportar todas as ordens de serviço, clientes, transações financeiras e estoque do laboratório em um único arquivo compactado `.json`.
* **Restauração**: Na mesma página, importe o arquivo `.json` gerado para restaurar instantaneamente o estado íntegro do sistema.

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
