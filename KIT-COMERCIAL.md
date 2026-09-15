# 💼 Kit Comercial & Manual de Vendas - Gestão OS

Este guia completo foi preparado para que você (**Adriano**) possa começar a comercializar e faturar com o **Gestão OS** imediatamente, vendendo para assistências técnicas de celulares, notebooks, computadores, televisores e oficinas eletrônicas da sua cidade e de todo o Brasil.

---

## 🏆 1. Posicionamento Único de Mercado

Diferente de sistemas SaaS tradicionais em nuvem que cobram mensalidades caras, aumentam o preço todo ano e travam se a internet cair, o **Gestão OS** é vendido como:

> **"O Sistema Profissional para Assistência Técnica 100% Seguro, Rápido e que Nunca Trava Mesmo Sem Internet — com Backup Automático no seu Google Drive Pessoal."**

### Os 5 Argumentos que Fecham Qualquer Venda:
1. **Funciona Offline**: Se a internet da loja cair ou oscilar, a bancada não para de consertar e entregar aparelhos.
2. **Privacidade Absoluta**: Os dados de faturamento e clientes não ficam nos servidores de outras empresas.
3. **Backup de Hora em Hora no Google Drive**: Se o computador da loja queimar ou for roubado, tudo está a salvo na conta do Google do próprio dono.
4. **Sem Taxas Ocultas**: Não cobra por Ordem de Serviço emitida nem taxa por emissão de recibo.
5. **Avisos Automáticos no WhatsApp**: Notifica o cliente na hora em que o equipamento fica pronto para retirada.

---

## 💰 2. Tabela de Preços e Planos Recomendados

Você tem flexibilidade total para escolher como cobrar. Aqui estão as 3 ofertas com melhor taxa de conversão no mercado brasileiro:

| Plano | Valor Sugerido | Como Funciona a Licença | Perfil do Comprador |
| :--- | :--- | :--- | :--- |
| **Mensal** | **R$ 59,90 / mês** | Chave de 30 dias emitida a cada Pix recebido | Oficinas iniciantes ou que querem testar o primeiro mês |
| **Anual (Campeão 🏅)** | **R$ 497,00 à vista** *(ou 12x R$ 49)* | Chave de 365 dias emitida na hora | Assistências estabelecidas que querem economizar e ter tranquilidade |
| **Vitalício (Exclusivo)** | **R$ 997,00 à vista** | Chave de 99 anos (LIFETIME) | Donos de oficina experientes que odeiam mensalidades recorrentes |

---

## 🔑 3. Como Gerar a Chave de Licença para o Cliente

Quando o cliente pagar via Pix, você gera a chave em **3 segundos**:

### Método 1: Pelo Terminal (Mais Rápido)
Abra o seu terminal na pasta do projeto e execute:
```bash
node scripts/gerar-licenca.js "Nome da Oficina" PRO 365
```
*(Substitua `365` por `30` para mensal, ou `36500` para vitalício).*

O script exibirá no terminal:
```text
CHAVE: GOS-PRO-20270915-OFIC1234-9A8B7C6D
```

### Método 2: Pelo Próprio Sistema
Acesse **Configurações > Licenciamento Comercial > Ferramenta do Vendedor: Gerar Licença para Cliente**, digite o nome da oficina, selecione o plano e clique em **Gerar Chave**.

---

## 📲 4. Scripts Prontos para Vender no WhatsApp

### Mensagem 1: Prospecção Ativa (Para enviar a oficinas no WhatsApp/Instagram)
> *"Olá, tudo bem? Meu nome é Adriano. Trabalho com tecnologia especializada para assistências técnicas e desenvolvi um sistema para controle de Ordens de Serviço, estoque e WhatsApp automático feito sob medida para oficinas de bancada.*
> 
> *Diferente de sistemas que travam quando a internet cai ou cobram mensalidades caras, nosso sistema roda 100% local, abre como aplicativo desktop e faz backup de hora em hora direto no seu Google Drive.*
> 
> *Gostaria de liberar 15 dias de teste grátis para você experimentar na sua bancada hoje sem compromisso?"*

---

### Mensagem 2: Quando o Cliente Pedir Como Instalar
> *"Maravilha! A instalação é super simples e leva menos de 2 minutos. Basta abrir o terminal do seu computador (Windows ou Mac) e colar este comando único:*
> 
> **Windows (PowerShell):**
> `iwr -useb https://raw.githubusercontent.com/AdrianoDBA/gestao-os/main/install.ps1 | iex`
> 
> **Mac / Linux:**
> `curl -sSL https://raw.githubusercontent.com/AdrianoDBA/gestao-os/main/install.sh | bash`
> 
> *Ele vai instalar tudo automaticamente, criar o atalho 'Gestão OS' na sua Área de Trabalho e abrir o sistema em modo aplicativo nativo. Já deixei liberado 15 dias de teste gratuito para você!"*

---

### Mensagem 3: Entrega da Licença após o Pagamento (Pix)
> *"Pagamento confirmado com sucesso, parabéns pela decisão! 🚀*
> 
> *Aqui está a sua Chave Oficial de Licença do Gestão OS:*
> 🔑 **CHAVE:** `GOS-PRO-20270915-TECH1234-9A8B7C6D`
> 
> *Para ativar: dentro do Gestão OS, clique em **Configurações > Licenciamento Comercial** (ou clique no botão de licença no topo da tela), cole sua chave e clique em **Aplicar Chave**.*
> 
> *Qualquer dúvida, estou à disposição para suporte!"*

---

## ⏰ 5. Como Funciona a Renovação Automática

1. **Aviso aos 7 dias**: Quando faltarem 7 dias para o vencimento da licença do cliente, o sistema dele exibirá automaticamente uma barra de aviso no topo da tela: *"⚠️ Sua licença do Gestão OS expira em X dias! Fale com o suporte para renovar."*
2. **Bloqueio ao Expirar**: Se o cliente não renovar, o sistema entra em modo de bloqueio exibindo o botão para falar diretamente com o seu WhatsApp.
3. **Segurança de Dados**: O cliente **nunca perde nenhum dado**. Ao receber a nova chave gerada por você, a tela desbloqueia instantaneamente com todo o histórico intacto.

---

## 🎯 Meta Recomendada de Faturamento:
* **5 clientes Anuais por mês** = **R$ 2.485,00 / mês**
* **10 clientes Anuais por mês** = **R$ 4.970,00 / mês**
* **20 clientes Mensais** = **R$ 1.198,00 de renda passiva recorrente todo mês!**

Você tem agora em mãos um produto 100% pronto, estável, sem custos de servidor e com margem de lucro de quase 100%!
