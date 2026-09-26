# ADR 0003 — Experiência pública de autenticação acessível

- **Status:** Aceito
- **Data:** 2026-09-26
- **Issue:** REN-53

## Contexto

Os seis fluxos públicos de autenticação possuíam comportamentos e níveis de acabamento diferentes.
Login, solicitação de acesso e ativação já tinham parte das associações acessíveis, enquanto
recuperação e redefinição de senha dependiam principalmente de notificações temporárias. O retorno
ao destino protegido também era recebido pelo login, mas não era consumido após a autenticação.

## Decisão

Adotar uma única composição pública baseada no Eyes Design System, com:

- marca, seletor dos quatro temas e orientação assistiva compartilhados;
- título principal focado após cada entrada de rota;
- campos nativos com rótulo, ajuda, erro e `aria-describedby` explícitos;
- feedback persistente em região viva, sem depender apenas de snackbar;
- confirmação neutra na recuperação de senha para não revelar a existência de uma conta;
- recuperação na própria tela para links ausentes, inválidos ou expirados;
- retorno após login limitado às rotas administrativas conhecidas.

O layout usa duas colunas em telas amplas e uma coluna em viewports estreitos. Conteúdo decorativo
é removido progressivamente no mobile sem remover ações ou informações essenciais.

## Consequências

- todos os fluxos públicos compartilham tokens, estados e comportamento de foco;
- mensagens técnicas do backend não são exibidas diretamente;
- links externos ou rotas desconhecidas não podem controlar o destino posterior ao login;
- novos fluxos públicos devem reutilizar `AuthLayout`, `FormCard`, `FeedbackBannerComponent` e o
  stylesheet comum `public-auth-form.scss`;
- mudanças de regras de senha ou de autenticação continuam sendo decisões separadas de produto e
  backend.
