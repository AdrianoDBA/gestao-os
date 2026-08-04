# Guia de Contribuição - Gestão OS

Agradecemos o seu interesse em contribuir para o **Gestão OS**! Este documento orienta sobre como você pode colaborar com o projeto de forma eficiente e profissional.

---

## 🛠️ Como Contribuir

1. **Faça um Fork do Repositório**: Crie uma cópia do projeto em sua conta do GitHub.
2. **Clone Localmente**: Clone o seu fork na sua máquina.
   ```bash
   git clone https://github.com/seu-usuario/gestao-os-app-v2.git
   ```
3. **Crie uma Branch para a sua Feature/Bugfix**:
   ```bash
   git checkout -b feature/minha-melhoria
   ```
4. **Implemente e Teste suas Alterações**: Certifique-se de que o código compile sem warnings ou erros de TypeScript e de que as regras do ESLint sejam respeitadas.
5. **Faça o Commit das Alterações**: Utilize mensagens de commit semânticas e claras.
6. **Envie os Commits para o seu Fork**:
   ```bash
   git push origin feature/minha-melhoria
   ```
7. **Abra um Pull Request (PR)**: Vá ao repositório original e submeta o Pull Request descrevendo suas mudanças detalhadamente.

---

## 📐 Diretrizes de Código

* **Padrões de Código**: Respeite a configuração do ESLint e TypeScript fornecida no projeto.
* **Internacionalização**: Mensagens voltadas ao usuário final devem ser escritas em Português do Brasil por padrão.
* **Segurança**: Nunca envie senhas, secrets, credenciais ou dados sensíveis em arquivos do código de produção ou no repositório do Git. Certifique-se de que o `.gitignore` exclua esses arquivos.
* **Docker**: Qualquer mudança na arquitetura do sistema deve ser atualizada de forma correspondente nos Dockerfiles e no `docker-compose.yml` para manter o primeiro acesso (`docker compose up -d`) totalmente automatizado.

---

## 🐛 Reportando Bugs

Ao abrir uma Issue para reportar erros ou falhas, inclua:
1. **Comportamento Esperado** vs **Comportamento Atual**.
2. **Passo a Passo para Reproduzir** o erro.
3. **Print screens ou logs do console** relevantes.
4. **Ambiente** (Sistema Operacional, navegador, versão do Docker, etc.).
