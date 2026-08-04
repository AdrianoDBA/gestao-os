# Changelog - Gestão OS

Todas as alterações notáveis neste projeto serão documentadas neste arquivo. O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.0.0] - 2026-08-04

### Adicionado
- **Setup Wizard (Assistente de Configuração)**: Assistente interativo de 3 etapas no primeiro acesso (Empresa, Administrador e Configurações Gerais) que bloqueia completamente o restante do sistema até sua conclusão.
- **Docker Compose Unificado**: Dockerfiles configurados para Next.js (com output standalone) e NestJS (com migrate deploy automático) e compose integrando Postgres e MinIO.
- **Validação de Senhas**: O login do laboratório agora realiza a validação de senhas para todos os usuários cadastrados.
- **README.md e Guias profissionais**: Documentação completa cobrindo instalação, backup, Docker, variáveis de ambiente e solução de problemas.
- **Configurações Globais em .env**: Centralização de credenciais e parâmetros sensíveis em arquivos `.env` com fallbacks.

### Modificado
- **Remoção de Dados Fictícios**: Removidos todos os dados simulados de clientes, dispositivos, ordens de serviço, logs, usuários e logins de teste da compilação de primeiro run para garantir que o software inicie zerado e limpo.
- **Ajustes de Segurança**: Mapeamento do `docker-compose.yml` para evitar credenciais estáticas no código.

### Corrigido
- **Next.js standalone build**: Ajustado `next.config.js` com `output: 'standalone'` e criada a pasta `public/` vazia para evitar falhas no build da imagem do Docker.
- **NestJS prod run**: Adicionado script `start:prod` no backend e integrado com o comando de deploy de migrations automático do Prisma.
