# Roadmap do Gestão OS

Este documento apresenta as futuras evoluções planejadas para as próximas versões do **Gestão OS**.

---

## 🏁 Versão 1.0 (Lançada)
* [x] **Setup Wizard (Primeiro Run)**: Assistente automatizado de configuração de empresa, administrador e regras do laboratório.
* [x] **Docker Compose Integrado**: Dockerfiles otimizados e compose unificado para rodar com um único comando.
* [x] **Dashboard Dinâmico**: Visualização executiva com KPIs clicáveis e modal de ações rápidas.
* [x] **Segurança RBAC**: Controle completo de permissões com base no cargo do funcionário.
* [x] **Auditoria e Blockchain**:Logs integrados no banco local com hashes de integridade SHA-256 e recibos da Polygon L2.
* [x] **Notificações via WhatsApp**: Envio de orçamentos e mensagens de OS prontas.

---

## 🚀 Versão 1.1 (Planejado)
* [ ] **Integração Real de APIs**: Substituição completa dos fallbacks do `localStorage` do frontend Next.js por requisições HTTP dinâmicas conectadas ao backend NestJS.
* [ ] **Autenticação JWT Robusta**: Integração completa do login com o backend com expiração de sessão e tokens de atualização.
* [ ] **Banco de Dados Relacional em Produção**: Migração dos fluxos de dados locais para tabelas Postgres gerenciadas pelo Prisma ORM do backend.
* [ ] **Gestão Completa de Multi-Tenancy**: Suporte avançado de isolamento e faturamento de assinaturas corporativas na API.

---

## 🌟 Versão 2.0 (Longo Prazo)
* [ ] **Assinatura Digital de Documentos**: Aceite e aprovação formal do cliente via assinatura digital na tela no momento da entrega do equipamento.
* [ ] **Controle de Estoque Avançado**: Entrada de peças com leitura automatizada de notas fiscais (XML/NF-e) e ajuste de custos automáticos.
* [ ] **IA de Bancada Avançada**: Integração direta com câmeras do laboratório para detecção automática de componentes danificados via visão computacional.
* [ ] **Aplicativo Mobile Técnico**: App dedicado para que os técnicos na bancada possam atualizar o status das ordens e fotografar as peças.
