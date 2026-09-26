# ADR 0004 — Shell administrativo e resumo operacional acessíveis

- **Status:** Aceito
- **Data:** 2026-09-26
- **Issue:** REN-54

## Contexto

O painel autenticado possuía uma navegação lateral visualmente isolada do Eyes Design System,
breadcrumb fixo e comportamento compacto baseado em uma barra horizontal. O dashboard também
tratava suas três consultas como uma única operação: uma falha parcial escondia todas as informações
que haviam sido carregadas corretamente.

## Decisão

Adotar um shell administrativo responsivo baseado no `MatSidenav`, mantendo:

- navegação lateral persistente quando há espaço e drawer modal em viewport compacto;
- skip link, landmarks, rota atual com `aria-current` e foco no conteúdo após a navegação;
- breadcrumb e título do documento derivados da rota ativa;
- menu de conta com identidade real da sessão, submenu dos quatro temas e saída segura;
- links apenas para módulos implementados e protegidos pelos guards atuais.

O dashboard passa a consultar solicitações, usuários e auditoria como projeções independentes. Cada
consulta captura sua própria indisponibilidade. Uma falha parcial mantém os dados válidos visíveis e
identifica a área afetada; somente a falha das três projeções substitui o resumo por um estado de erro
com tentativa de recuperação.

## Consequências

- o shell usa somente tokens e primitivas do Eyes Design System;
- o menu móvel contém foco e oferece fechamento explícito, por backdrop e por Escape;
- mudanças de rota posicionam o foco no `main`, permitindo que o leitor de tela encontre o novo título;
- métricas sempre apresentam rótulo, valor e contexto textual, sem depender apenas de cor ou ícone;
- skeletons são visuais e o carregamento possui uma única mensagem acessível;
- regras de sessão, RBAC, endpoints e entidades permanecem inalteradas;
- novos módulos administrativos devem registrar título e `navigationLabel` na configuração de rota.
