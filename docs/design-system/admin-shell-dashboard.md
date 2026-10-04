# Shell administrativo e dashboard

**Issue:** REN-54

**ADR:** `docs/adr/0004-accessible-administrative-shell.md`

**Atualização de composição:** [REN-59 — direção aprovada em 04/10/2026](approved-composition-2026-10-04.md). Os contratos abaixo permanecem; o breadcrumb é anunciado ao leitor de tela e os nomes da navegação são curtos.

## Composição do shell

- sidebar persistente a partir de 64 rem;
- drawer modal abaixo de 64 rem, com botão de abrir e fechar identificados;
- header fixo com breadcrumb derivado da rota e menu da conta autenticada;
- conteúdo principal focável, anunciado depois de cada ativação de rota;
- navegação principal limitada a Resumo, Solicitações, Usuários e Auditoria;
- opções de tema em um submenu da conta para reduzir ruído no header.

O link ativo combina `aria-current="page"`, texto, borda e superfície. O drawer compacto não vira
uma barra horizontal e preserva os destinos. O logout continua delegado ao
`AuthFacade`, portanto limpeza de sessão e redirecionamento mantêm uma única responsabilidade.

## Composição do dashboard

1. título e ação de atualização;
2. três indicadores operacionais: solicitações pendentes, usuários ativos e ações recentes;
3. prioridade da fila de solicitações;
4. atividade administrativa recente;
5. orientação específica para estado inicial sem dados.

Os indicadores são links completos, com rótulo, valor, contexto e destino. Não há gráfico decorativo
nem informação transmitida somente por cor. Em telas estreitas, todas as regiões passam para uma
coluna sem remover ações.

## Estados

| Estado               | Tratamento                                                                |
| -------------------- | ------------------------------------------------------------------------- |
| Carregamento inicial | Skeletons ocultos da árvore acessível e uma mensagem de status            |
| Atualização          | Conteúdo anterior permanece visível, botão informa progresso              |
| Sucesso              | Indicadores, prioridades e atividade aparecem normalmente                 |
| Vazio                | Orientação para iniciar a operação sem tratar ausência de dados como erro |
| Falha parcial        | Dados válidos permanecem; projeções indisponíveis recebem texto próprio   |
| Falha total          | Estado recuperável com ação “Tentar novamente”                            |

## Checklist de revisão

- confirmar navegação completa por teclado e foco após mudança de rota;
- validar drawer, zoom de 200% e viewport de 320 px sem rolagem horizontal;
- revisar light, dark, high-contrast-light e high-contrast-dark;
- executar axe no dashboard e nas páginas alcançadas pelo drawer;
- confirmar que falha de uma projeção não remove as outras duas;
- confirmar que nomes, e-mail e papel vêm da sessão real, sem conteúdo fixo.
